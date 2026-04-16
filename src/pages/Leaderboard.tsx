import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry { user_id: string; display_name: string | null; avatar_url: string | null; xp: number; level: number; }

const levelBadges = [
  { min: 1, name: "Pioneer", icon: "🌟" },
  { min: 2, name: "Trailblazer", icon: "🔥" },
  { min: 3, name: "Achiever", icon: "🏅" },
  { min: 4, name: "Conqueror", icon: "👑" },
];

function getBadges(level: number) {
  return levelBadges.filter(b => b.min <= level);
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    supabase.from("profiles").select("user_id, display_name, avatar_url, xp, level").order("xp", { ascending: false }).limit(50).then(({ data }) => {
      setEntries(data ?? []);
      setLoading(false);
    });
  }, []);

  const rankEmoji = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto pb-20 md:pb-0">
        <div className="text-center"><h1 className="text-2xl md:text-3xl font-bold text-foreground">Leaderboard</h1><p className="text-muted-foreground mt-1">Top learners ranked by XP</p></div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground"><Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" /><p className="font-medium">No learners yet</p></div>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-card divide-y divide-border">
            {entries.map((entry, i) => {
              const isCurrentUser = entry.user_id === user?.id;
              const computedLevel = Math.floor(entry.xp / 100) + 1;
              const badges = getBadges(computedLevel);
              return (
                <div key={entry.user_id} className={cn("flex items-center gap-4 px-5 py-4", isCurrentUser && "bg-primary/5", i < 3 && "bg-accent/5")}>
                  <span className={cn("w-8 text-center font-bold", i < 3 ? "text-lg" : "text-sm text-muted-foreground")}>{rankEmoji(i)}</span>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {entry.avatar_url ? <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-muted-foreground">{(entry.display_name || "?")[0].toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-semibold text-sm truncate", isCurrentUser ? "text-primary" : "text-foreground")}>
                      {entry.display_name || "Anonymous"}{isCurrentUser && <span className="text-xs ml-2 text-primary">(You)</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Level {computedLevel}</span>
                      {badges.length > 0 && (
                        <span className="text-xs">{badges.map(b => b.icon).join("")}</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-sm text-xp">⚡ {entry.xp.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
