import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain this platform",
  "What is Arduino?",
  "How to use DHT11 sensor?",
  "Help me get started",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-ai`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  let resp: Response;
  try {
    resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });
  } catch {
    onError("Network error. Please check your connection.");
    return;
  }

  if (!resp.ok) {
    try {
      const err = await resp.json();
      onError(err.error || "Something went wrong.");
    } catch {
      onError("Something went wrong.");
    }
    return;
  }

  if (!resp.body) { onError("No response received."); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { /* partial */ }
    }
  }
  onDone();
}

const FloatingAIChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);

    let assistant = "";
    const update = (chunk: string) => {
      assistant += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistant } : m));
        }
        return [...prev, { role: "assistant", content: assistant }];
      });
    };

    await streamChat({
      messages: allMsgs,
      onDelta: update,
      onDone: () => setLoading(false),
      onError: (msg) => {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
        setLoading(false);
      },
    });
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setOpen(true)}
              className="fixed bottom-20 right-6 md:bottom-20 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:scale-110 hover:shadow-xl transition-all duration-300 flex items-center justify-center animate-pulse hover:animate-none"
              aria-label="Ask AI"
            >
              <Sparkles className="h-6 w-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Ask AI Assistant</TooltipContent>
        </Tooltip>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[520px] rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-indigo-500/10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Ask AI Assistant</h3>
                <p className="text-[10px] text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">Hi! I'm your Skill Quest AI assistant. Ask me anything about courses, components, or the platform.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-accent/30 hover:bg-accent/60 text-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2 items-center">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex gap-1 px-3 py-2">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                disabled={loading}
                className="flex-1 text-sm"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()} className="shrink-0 bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIChat;
