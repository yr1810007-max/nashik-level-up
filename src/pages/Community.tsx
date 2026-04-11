import { useEffect, useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Plus, Loader2, X, Send, ArrowLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: string[];
  difficulty: string | null;
  media_url: string | null;
  code_url: string | null;
  likes_count: number;
  created_at: string;
  author_name?: string | null;
  author_avatar?: string | null;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

type Tab = "projects" | "chat";

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("projects");

  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Chat state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    const projectsData = data ?? [];
    const userIds = [...new Set(projectsData.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds.length > 0 ? userIds : ["none"]);
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    setProjects(projectsData.map((p: any) => ({ ...p, author_name: profileMap.get(p.user_id)?.display_name, author_avatar: profileMap.get(p.user_id)?.avatar_url })));
    if (user) {
      const { data: likes } = await supabase.from("project_likes").select("project_id").eq("user_id", user.id);
      setLikedIds(new Set((likes ?? []).map((l: any) => l.project_id)));
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url").neq("user_id", user.id);
    setUsers(data ?? []);
  };

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, [user]);

  // Load messages when user selected
  useEffect(() => {
    if (!user || !selectedUser) return;
    setLoadingMessages(true);
    const loadMsgs = async () => {
      const { data } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.user_id}),and(sender_id.eq.${selectedUser.user_id},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) ?? []);
      setLoadingMessages(false);
    };
    loadMsgs();

    // Realtime subscription
    const channel = supabase
      .channel(`dm-${user.id}-${selectedUser.user_id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === user.id && msg.receiver_id === selectedUser.user_id) ||
          (msg.sender_id === selectedUser.user_id && msg.receiver_id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLike = async (projectId: string) => {
    if (!user) return;
    if (likedIds.has(projectId)) {
      await supabase.from("project_likes").delete().eq("user_id", user.id).eq("project_id", projectId);
      await supabase.from("projects").update({ likes_count: Math.max(0, (projects.find(p => p.id === projectId)?.likes_count || 1) - 1) }).eq("id", projectId);
      setLikedIds((prev) => { const n = new Set(prev); n.delete(projectId); return n; });
    } else {
      await supabase.from("project_likes").insert({ user_id: user.id, project_id: projectId });
      await supabase.from("projects").update({ likes_count: (projects.find(p => p.id === projectId)?.likes_count || 0) + 1 }).eq("id", projectId);
      setLikedIds((prev) => new Set(prev).add(projectId));
    }
    loadProjects();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from("projects").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setTitle(""); setDescription(""); setTags(""); setShowForm(false);
      toast({ title: "Project shared! 🎉" });
      loadProjects();
    } catch {
      toast({ title: "Error sharing project", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedUser || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      await supabase.from("direct_messages").insert({
        sender_id: user.id,
        receiver_id: selectedUser.user_id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">Share projects & connect with peers</p>
          </div>
          {activeTab === "projects" && (
            <Button onClick={() => setShowForm(!showForm)} className="font-semibold">
              {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showForm ? "Cancel" : "Share Project"}
            </Button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "projects" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("projects")}
          >
            <MessageCircle className="h-4 w-4 mr-1" /> Projects
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("chat")}
          >
            <Users className="h-4 w-4 mr-1" /> Chat
          </Button>
        </div>

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <>
            {showForm && (
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4 animate-slide-up">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My awesome project" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about your project..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tags (comma-separated)</label>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, iot, machine-learning" />
                </div>
                <Button type="submit" disabled={submitting} className="font-semibold">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Share Project
                </Button>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No projects yet</p>
                <p className="text-sm mt-1">Be the first to share!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {project.author_avatar ? (
                          <img src={project.author_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">
                            {(project.author_name || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{project.author_name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground">{project.title}</h3>
                    {project.description && <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => handleLike(project.id)}
                        className={cn(
                          "flex items-center gap-1 text-sm transition-colors",
                          likedIds.has(project.id) ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                        )}
                      >
                        <Heart className={cn("h-4 w-4", likedIds.has(project.id) && "fill-current")} />
                        {project.likes_count}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden" style={{ height: "calc(100vh - 320px)", minHeight: 400 }}>
            <div className="flex h-full">
              {/* User list sidebar */}
              <div className={cn(
                "border-r border-border flex flex-col",
                selectedUser ? "hidden md:flex w-72" : "w-full md:w-72"
              )}>
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-bold text-foreground">Users</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No other users yet</div>
                  ) : (
                    users.map((u) => (
                      <button
                        key={u.user_id}
                        onClick={() => setSelectedUser(u)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/50 transition-colors",
                          selectedUser?.user_id === u.user_id && "bg-primary/10"
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback className="text-xs font-bold">
                            {(u.display_name || "?")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground truncate">
                          {u.display_name || "Anonymous"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat area */}
              <div className={cn("flex-1 flex flex-col", !selectedUser && "hidden md:flex")}>
                {selectedUser ? (
                  <>
                    {/* Chat header */}
                    <div className="flex items-center gap-3 p-3 border-b border-border">
                      <button onClick={() => setSelectedUser(null)} className="md:hidden p-1 text-muted-foreground">
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedUser.avatar_url || undefined} />
                        <AvatarFallback className="text-xs font-bold">
                          {(selectedUser.display_name || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-sm text-foreground">{selectedUser.display_name || "Anonymous"}</span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {loadingMessages ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">No messages yet. Say hello! 👋</div>
                      ) : (
                        messages.map((msg) => {
                          const isMine = msg.sender_id === user?.id;
                          return (
                            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                              <div className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                                isMine
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              )}>
                                <p>{msg.content}</p>
                                <p className={cn("text-[10px] mt-1 opacity-70", isMine ? "text-primary-foreground" : "text-muted-foreground")}>
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-border flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button size="icon" onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">Select a user to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Community;
