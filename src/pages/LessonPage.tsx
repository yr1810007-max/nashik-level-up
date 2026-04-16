import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { AppLayout } from "@/components/AppLayout";
import { formatContent } from "@/lib/format-content";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Loader2, Lightbulb, Code, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  order_index: number;
  xp_reward: number;
  step_type: string;
}

const stepTypeIcons: Record<string, any> = {
  concept: Lightbulb,
  setup: Wrench,
  "hands-on": Wrench,
  code: Code,
};

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    const load = async () => {
      const [lessonRes, allLessonsRes, stepsRes] = await Promise.all([
        supabase.from("lessons").select("*").eq("id", lessonId).single(),
        supabase.from("lessons").select("id, title, order_index").eq("course_id", courseId).order("order_index"),
        supabase.from("course_steps").select("id, title, order_index, xp_reward, step_type").eq("lesson_id", lessonId).order("order_index"),
      ]);
      setLesson(lessonRes.data);
      setLessons(allLessonsRes.data ?? []);
      setSteps(stepsRes.data ?? []);
      if (user) {
        const [completionRes, stepProgressRes] = await Promise.all([
          supabase.from("user_lessons").select("id").eq("user_id", user.id).eq("lesson_id", lessonId).maybeSingle(),
          supabase.from("user_step_progress").select("step_id").eq("user_id", user.id),
        ]);
        setCompleted(!!completionRes.data);
        const stepIds = new Set((stepsRes.data ?? []).map((s: Step) => s.id));
        const done = (stepProgressRes.data ?? []).filter((sp: any) => stepIds.has(sp.step_id)).map((sp: any) => sp.step_id);
        setCompletedSteps(new Set(done));
      }
      setLoading(false);
    };
    load();
  }, [courseId, lessonId, user]);

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!user || !lessonId || !courseId) return;
    setCompleting(true);
    try {
      await supabase.from("user_lessons").upsert({ user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() });
      const { data: allLessons } = await supabase.from("lessons").select("id").eq("course_id", courseId);
      const { data: completedLessons } = await supabase.from("user_lessons").select("lesson_id").eq("user_id", user.id);
      const courselesIds = new Set((allLessons ?? []).map((l: any) => l.id));
      const done = (completedLessons ?? []).filter((ul: any) => courselesIds.has(ul.lesson_id)).length;
      const progress = allLessons ? (done / allLessons.length) * 100 : 0;
      await supabase.from("user_courses").update({ progress, last_activity: new Date().toISOString() }).eq("user_id", user.id).eq("course_id", courseId);
      if (lesson?.xp_reward) {
        const { data: profileData } = await supabase.from("profiles").select("xp").eq("user_id", user.id).single();
        if (profileData) {
          await supabase.from("profiles").update({ xp: profileData.xp + lesson.xp_reward }).eq("user_id", user.id);
          await refreshProfile();
        }
      }
      setCompleted(true);
      toast({ title: `+${lesson?.xp_reward || 25} XP earned! 🎉` });
    } catch {
      toast({ title: "Error completing lesson", variant: "destructive" });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  if (!lesson) return <AppLayout><div className="text-center py-20 text-muted-foreground">Lesson not found</div></AppLayout>;

  const stepsProgress = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0">
        <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>

        {/* Lesson progress bar */}
        <div className="flex items-center gap-1">
          {lessons.map((l, i) => (
            <div key={l.id} className={cn("h-1 flex-1 rounded-full", l.id === lessonId ? "gradient-primary" : i <= currentIndex ? "bg-success" : "bg-muted")} />
          ))}
        </div>

        {/* Lesson header */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-muted-foreground">Lesson {currentIndex + 1} of {lessons.length}</span>
            <span className="text-xs font-bold text-xp">⚡ {lesson.xp_reward} XP</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">{lesson.title}</h1>

          {lesson.content && (
            <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed mb-6 prose-headings:text-foreground prose-strong:text-foreground prose-li:text-foreground/90">
              <ReactMarkdown>{formatContent(lesson.content)}</ReactMarkdown>
            </div>
          )}

          {/* Steps - Duolingo style learning path */}
          {steps.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">📚 Learning Steps</h2>
                <span className="text-sm text-muted-foreground">{completedSteps.size}/{steps.length} completed</span>
              </div>

              {steps.length > 0 && (
                <div className="mb-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${stepsProgress}%` }} />
                </div>
              )}

              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />

                <div className="space-y-2">
                  {steps.map((step, i) => {
                    const isCompleted = completedSteps.has(step.id);
                    const prevCompleted = i === 0 || completedSteps.has(steps[i - 1].id);
                    const isUnlocked = i === 0 || prevCompleted;
                    const StepIcon = stepTypeIcons[step.step_type] || Lightbulb;

                    return (
                      <div key={step.id} className="relative">
                        {isUnlocked ? (
                          <Link
                            to={`/courses/${courseId}/lessons/${lessonId}/steps/${step.id}`}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl transition-all",
                              isCompleted ? "bg-success/5 hover:bg-success/10" : "hover:bg-muted/50"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2",
                              isCompleted ? "bg-success border-success text-primary-foreground" : "bg-card border-primary text-primary"
                            )}>
                              {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground">{step.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{step.step_type} · ⚡ {step.xp_reward} XP</p>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-4 p-4 rounded-xl opacity-40">
                            <div className="w-10 h-10 rounded-full bg-muted border-2 border-muted flex items-center justify-center flex-shrink-0 z-10">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-muted-foreground">{step.title}</p>
                              <p className="text-xs text-muted-foreground">Complete previous step to unlock</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation & Complete */}
        <div className="flex items-center justify-between gap-4">
          {prevLesson ? <Button variant="outline" onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}><ArrowLeft className="h-4 w-4 mr-2" /> Previous</Button> : <div />}
          {!completed ? (
            <Button onClick={handleComplete} disabled={completing} className="font-semibold">
              {completing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} Complete Lesson
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-success font-semibold text-sm"><CheckCircle2 className="h-5 w-5" /> Completed!</div>
          )}
          {nextLesson ? <Button onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button> : <Link to={`/courses/${courseId}`}><Button>Back to Course</Button></Link>}
        </div>
      </div>
    </AppLayout>
  );
};

export default LessonPage;
