import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCourses, fetchActivities } from "@/lib/api";
import { type Course, type Activity } from "@/lib/mock-data";
import { ProgressBar } from "@/components/ProgressBar";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { Link } from "react-router-dom";
import { Flame, Zap, BookOpen, Trophy, Clock, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCourses(), fetchActivities()]).then(([c, a]) => {
      setCourses(c);
      setActivities(a);
      setLoading(false);
    });
  }, []);

  if (loading || !user) {
    return <AppLayout><DashboardSkeleton /></AppLayout>;
  }

  const enrolledCourses = courses.filter((c) => user.enrolledCourses.includes(c.id));
  const totalLessons = enrolledCourses.reduce((a, c) => a + c.lessons.length, 0);
  const completedLessons = enrolledCourses.reduce((a, c) => a + c.lessons.filter((l) => l.completed).length, 0);

  const activityIcons: Record<string, React.ReactNode> = {
    lesson_completed: <BookOpen className="h-4 w-4 text-primary" />,
    quiz_passed: <Trophy className="h-4 w-4 text-accent" />,
    badge_earned: <span className="text-sm">🏅</span>,
    course_started: <BookOpen className="h-4 w-4 text-secondary" />,
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Hey, {user.name}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">Keep up the great work on your learning journey!</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/15 text-accent-foreground font-bold">
            <Flame className="h-5 w-5 animate-streak-fire text-accent" />
            <span>{user.streak} day streak!</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl shadow-card p-5 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-xp flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Total XP</span>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{user.points.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-5 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Courses</span>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{enrolledCourses.length}</p>
          </div>
          <div className="bg-card rounded-2xl shadow-card p-5 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Trophy className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Badges</span>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{user.badges.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Progress */}
          <div className="lg:col-span-2 bg-card rounded-2xl shadow-card p-6 border border-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-foreground">My Courses</h2>
              <Link to="/courses" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No courses yet</p>
                <Link to="/courses" className="text-primary font-bold text-sm hover:underline mt-1 block">
                  Browse courses →
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <ProgressBar value={completedLessons} max={totalLessons} label={`${completedLessons}/${totalLessons} lessons completed`} />
                {enrolledCourses.map((course) => {
                  const done = course.lessons.filter((l) => l.completed).length;
                  const pct = course.lessons.length > 0 ? (done / course.lessons.length) * 100 : 0;
                  return (
                    <Link key={course.id} to={`/courses/${course.id}`} className="block group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{course.title}</p>
                          <ProgressBar value={pct} size="sm" showPercentage={false} />
                        </div>
                        <span className="text-xs font-bold text-primary">{Math.round(pct)}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
            <h2 className="text-lg font-extrabold text-foreground mb-5">Recent Activity</h2>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      {activityIcons[act.type]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{act.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(act.timestamp).toLocaleDateString()}
                        {act.points && <span className="ml-2 text-primary font-bold">+{act.points} XP</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
          <h2 className="text-lg font-extrabold text-foreground mb-5">My Badges</h2>
          <div className="flex flex-wrap gap-4">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 border border-border"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="font-bold text-sm text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
