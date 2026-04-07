import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { fetchLeaderboard } from "@/lib/api";
import { type LeaderboardEntry } from "@/lib/mock-data";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { Trophy } from "lucide-react";

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard().then((e) => { setEntries(e); setLoading(false); });
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center">
            <Trophy className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Leaderboard</h1>
            <p className="text-muted-foreground text-sm">Top learners this month</p>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <LeaderboardTable entries={entries} currentUserId={user?.id} />
        )}
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
