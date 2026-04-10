import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Lock, ArrowLeft, Loader2, Brain, ShoppingCart, BarChart3, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

import iotBanner from "@/assets/course-iot-banner.jpg";
import dht11Banner from "@/assets/course-dht11-banner.jpg";
import irrigationBanner from "@/assets/course-irrigation-banner.jpg";
import cropBanner from "@/assets/course-crop-banner.jpg";

function getCourseBanner(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("led")) return iotBanner;
  if (t.includes("dht")) return dht11Banner;
  if (t.includes("irrigation")) return irrigationBanner;
  return cropBanner;
}

interface Lesson { id: string; title: string; order_index: number; xp_reward: number; }

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confidenceScore, setConfidenceScore] = useState<{ score_before: number | null; score_after: number | null } | null>(null);
  const [hasComponents, setHasComponents] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      const [courseRes, lessonsRes, compRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).single(),
        supabase.from("lessons").select("id, title, order_index, xp_reward").eq("course_id", courseId).order("order_index"),
        supabase.from("course_components").select("id").eq("course_id", courseId).limit(1),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data ?? []);
      setHasComponents((compRes.data ?? []).length > 0);
      if (user) {
        const [enrollRes, completedRes, confRes] = await Promise.all([
          supabase.from("user_courses").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle(),
          supabase.from("user_lessons").select("lesson_id").eq("user_id", user.id),
          supabase.from("confidence_scores").select("score_before, score_after").eq("user_id", user.id).eq("course_id", courseId).maybeSingle(),
        ]);
        setEnrolled(!!enrollRes.data);
        const lessonIds = new Set((lessonsRes.data ?? []).map((l: Lesson) => l.id));
        const completed = (completedRes.data ?? []).filter((ul: any) => lessonIds.has(ul.lesson_id)).map((ul: any) => ul.lesson_id);
        setCompletedLessons(new Set(completed));
        setConfidenceScore(confRes.data);
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
  const allCompleted = lessons.length > 0 && completedLessons.size === lessons.length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl pb-20 md:pb-0">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Courses</Link>

        {/* Course Header */}
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="h-48 relative overflow-hidden">
            <img src={getCourseBanner(course.title)} alt={course.title} className="w-full h-full object-cover" loading="lazy" width={1280} height={512} />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
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

        {/* Quick Actions */}
        {enrolled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Confidence Meter */}
            {!confidenceScore?.score_before ? (
              <Link to={`/courses/${courseId}/confidence/before`}>
                <Button variant="outline" className="w-full h-14 justify-start gap-3 font-semibold">
                  <Brain className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm">Take Confidence Check</p>
                    <p className="text-xs text-muted-foreground font-normal">Assess your knowledge first</p>
                  </div>
                </Button>
              </Link>
            ) : allCompleted && !confidenceScore?.score_after ? (
              <Link to={`/courses/${courseId}/confidence/after`}>
                <Button variant="outline" className="w-full h-14 justify-start gap-3 font-semibold border-primary">
                  <Brain className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm">Take Post-Course Check</p>
                    <p className="text-xs text-muted-foreground font-normal">See your improvement!</p>
                  </div>
                </Button>
              </Link>
            ) : confidenceScore?.score_before ? (
              <Link to={`/courses/${courseId}/confidence/results`}>
                <Button variant="outline" className="w-full h-14 justify-start gap-3 font-semibold">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm">Confidence: {confidenceScore.score_before}%{confidenceScore.score_after ? ` → ${confidenceScore.score_after}%` : ""}</p>
                    <p className="text-xs text-muted-foreground font-normal">View your scores</p>
                  </div>
                </Button>
              </Link>
            ) : null}

            {/* Components */}
            {hasComponents && (
              <Link to={`/courses/${courseId}/components`}>
                <Button variant="outline" className="w-full h-14 justify-start gap-3 font-semibold">
                  <ShoppingCart className="h-5 w-5 text-secondary" />
                  <div className="text-left">
                    <p className="text-sm">Components & Parts</p>
                    <p className="text-xs text-muted-foreground font-normal">View shopping list</p>
                  </div>
                </Button>
              </Link>
            )}

            {/* Simulation */}
            <Link to={`/courses/${courseId}/simulation`}>
              <Button variant="outline" className="w-full h-14 justify-start gap-3 font-semibold border-success/50 hover:bg-success/5">
                <FlaskConical className="h-5 w-5 text-success" />
                <div className="text-left">
                  <p className="text-sm">Start Simulation</p>
                  <p className="text-xs text-muted-foreground font-normal">Practice with virtual circuit</p>
                </div>
              </Button>
            </Link>
          </div>
        )}

        {/* Lessons - Duolingo path style */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Lessons ({lessons.length})</h2>

          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />

            <div className="space-y-2">
              {lessons.map((lesson, i) => {
                const isCompleted = completedLessons.has(lesson.id);
                const prevCompleted = i === 0 || completedLessons.has(lessons[i - 1].id);
                const isUnlocked = enrolled && (i === 0 || prevCompleted);
                return (
                  <div key={lesson.id} className="relative">
                    {isUnlocked ? (
                      <Link to={`/courses/${courseId}/lessons/${lesson.id}`} className={cn("flex items-center gap-4 p-4 rounded-xl transition-colors", isCompleted ? "bg-success/5 hover:bg-success/10" : "hover:bg-muted/50")}>
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 border-2", isCompleted ? "bg-success border-success text-primary-foreground" : "bg-card border-primary text-primary")}>
                          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-foreground">{lesson.title}</p><p className="text-xs text-muted-foreground">⚡ {lesson.xp_reward} XP</p></div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4 p-4 rounded-xl opacity-40">
                        <div className="w-10 h-10 rounded-full bg-muted border-2 border-muted flex items-center justify-center flex-shrink-0 z-10"><Lock className="h-4 w-4 text-muted-foreground" /></div>
                        <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-muted-foreground">{lesson.title}</p><p className="text-xs text-muted-foreground">Complete previous lesson to unlock</p></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetail;
