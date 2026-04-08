import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Plus, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  profiles?: { display_name: string | null; avatar_url: string | null };
}

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*, profiles(display_name, avatar_url)")
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
    if (user) {
      const { data: likes } = await supabase.from("project_likes").select("project_id").eq("user_id", user.id);
      setLikedIds(new Set((likes ?? []).map((l: any) => l.project_id)));
    }
    setLoading(false);
  };

  useEffect(() => { loadProjects(); }, [user]);

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

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">Share and discover projects</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="font-semibold">
            {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showForm ? "Cancel" : "Share Project"}
          </Button>
        </div>

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
                    {project.profiles?.avatar_url ? (
                      <img src={project.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        {(project.profiles?.display_name || "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{project.profiles?.display_name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <h3 className="font-bold text-foreground">{project.title}</h3>
                {project.description && <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>}
                {project.tags.length > 0 && (
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
      </div>
    </AppLayout>
  );
};

export default Community;
