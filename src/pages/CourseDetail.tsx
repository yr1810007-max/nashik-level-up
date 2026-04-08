import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson { id: string; title: string; order_index: number; xp_reward: number; }

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      const [courseRes, lessonsRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).single(),
        supabase.from("lessons").select("id, title, order_index, xp_reward").eq("course_id", courseId).order("order_index"),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data ?? []);
      if (user) {
        const [enrollRes, completedRes] = await Promise.all([
          supabase.from("user_courses").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle(),
          supabase.from("user_lessons").select("lesson_id").eq("user_id", user.id),
        ]);
        setEnrolled(!!enrollRes.data);
        const lessonIds = new Set((lessonsRes.data ?? []).map((l: Lesson) => l.id));
        const completed = (completedRes.data ?? []).filter((ul: any) => lessonIds.has(ul.lesson_id)).map((ul: any) => ul.lesson_id);
        setCompletedLessons(new Set(completed));
      }
      setLoading(false);
    };
    load();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user || !courseId) return;
    await supabase.from("user_courses").insert({ user_id: user.id, course_id: courseId });
    setEnrolled(true);
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  if (!course) return <AppLayout><div className="text-center py-20 text-muted-foreground">Course not found</div></AppLayout>;

  const progress = lessons.length > 0 ? (completedLessons.size / lessons.length) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl pb-20 md:pb-0">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Courses</Link>
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="h-48 gradient-hero flex items-center justify-center"><BookOpen className="h-16 w-16 text-primary-foreground/50" /></div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.difficulty}</Badge>
              <span className="text-sm font-bold text-xp">⚡ {course.xp_reward} XP</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
            {course.description && <p className="text-muted-foreground">{course.description}</p>}
            {enrolled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Progress</span><span className="font-bold text-primary">{Math.round(progress)}%</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
              </div>
            )}
            {!enrolled && <Button onClick={handleEnroll} className="font-semibold">Enroll in Course</Button>}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Lessons ({lessons.length})</h2>
          <div className="space-y-2">
            {lessons.map((lesson, i) => {
              const isCompleted = completedLessons.has(lesson.id);
              const prevCompleted = i === 0 || completedLessons.has(lessons[i - 1].id);
              const isUnlocked = enrolled && (i === 0 || prevCompleted);
              return (
                <div key={lesson.id}>
                  {isUnlocked ? (
                    <Link to={`/courses/${courseId}/lessons/${lesson.id}`} className={cn("flex items-center gap-4 p-4 rounded-xl transition-colors", isCompleted ? "bg-success/5 hover:bg-success/10" : "hover:bg-muted/50")}>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", isCompleted ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-foreground">{lesson.title}</p><p className="text-xs text-muted-foreground">⚡ {lesson.xp_reward} XP</p></div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-xl opacity-50">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"><Lock className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-muted-foreground">{lesson.title}</p><p className="text-xs text-muted-foreground">Complete previous lesson to unlock</p></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetail;
