import { type LeaderboardEntry } from "@/lib/mock-data";
import { Trophy, Medal } from "lucide-react";

const rankStyles: Record<number, string> = {
  1: "gradient-accent text-accent-foreground",
  2: "bg-muted text-muted-foreground",
  3: "bg-accent/20 text-accent-foreground",
};

export function LeaderboardTable({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId?: string }) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isMe = entry.userId === currentUserId;
        return (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
              isMe ? "bg-primary/10 border-2 border-primary shadow-card" : "bg-card border border-border hover:shadow-card"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${rankStyles[entry.rank] ?? "bg-muted text-muted-foreground"}`}>
              {entry.rank <= 3 ? (
                entry.rank === 1 ? <Trophy className="h-5 w-5" /> : <Medal className="h-5 w-5" />
              ) : (
                entry.rank
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                {entry.name} {isMe && <span className="text-xs text-primary">(You)</span>}
              </p>
            </div>
            <span className="font-extrabold text-primary text-sm">⚡ {entry.points.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}
