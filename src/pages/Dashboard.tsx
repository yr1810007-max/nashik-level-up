import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Flame, Zap, BookOpen, Trophy, Target, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseWithProgress {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  progress: number;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  unlocked_at: string;
}

const Dashboard = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [coursesRes, achievementsRes] = await Promise.all([
        supabase
          .from("user_courses")
          .select("progress, course_id, courses(id, title, category, difficulty)")
          .eq("user_id", user.id),
        supabase
          .from("user_achievements")
          .select("unlocked_at, achievements(id, name, icon, description)")
          .eq("user_id", user.id)
          .order("unlocked_at", { ascending: false })
          .limit(5),
      ]);

      if (coursesRes.data) {
        setCourses(
          coursesRes.data.map((uc: any) => ({
            id: uc.courses?.id ?? "",
            title: uc.courses?.title ?? "",
            category: uc.courses?.category ?? "",
            difficulty: uc.courses?.difficulty ?? "",
            progress: Number(uc.progress) ?? 0,
          }))
        );
      }

      if (achievementsRes.data) {
        setAchievements(
          achievementsRes.data.map((ua: any) => ({
            id: ua.achievements?.id ?? "",
            name: ua.achievements?.name ?? "",
            icon: ua.achievements?.icon ?? "🏆",
            description: ua.achievements?.description ?? null,
            unlocked_at: ua.unlocked_at,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading || !profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const levelProgress = ((profile.xp % 1000) / 1000) * 100;

  return (
    <AppLayout>
      <div className="space-y-8 pb-20 md:pb-0">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {profile.display_name || "Learner"}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">Ready to level up today?</p>
          </div>
          {profile.streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/15 text-accent-foreground font-bold text-sm">
              <Flame className="h-5 w-5 animate-streak-fire text-accent" />
              {profile.streak} day streak!
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-xp flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{profile.xp.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Level</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{profile.level}</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-info flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Courses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{courses.length}</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Trophy className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Achievements</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/courses">
            <Button variant="outline" className="w-full h-12 justify-between font-semibold">
              <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Browse Courses</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/community">
            <Button variant="outline" className="w-full h-12 justify-between font-semibold">
              <span className="flex items-center gap-2"><Target className="h-4 w-4" /> Community Projects</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="outline" className="w-full h-12 justify-between font-semibold">
              <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Leaderboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">My Courses</h2>
              <Link to="/courses" className="text-sm text-primary font-semibold hover:underline">View all →</Link>
            </div>
            {courses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No courses yet</p>
                <Link to="/courses" className="text-primary text-sm font-semibold hover:underline mt-1 block">
                  Start learning →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="block group">
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.category} · {course.difficulty}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-primary w-8 text-right">{Math.round(course.progress)}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
            <h2 className="text-lg font-bold text-foreground mb-5">Recent Achievements</h2>
            {achievements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No achievements yet</p>
                <p className="text-xs mt-1">Complete courses and challenges to earn badges!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <span className="text-2xl">{a.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">{a.name}</p>
                      {a.description && <p className="text-xs text-muted-foreground truncate">{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
