import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Code, Lightbulb, Wrench, Youtube, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Step {
  id: string;
  title: string;
  description: string;
  why_important: string | null;
  expected_output: string | null;
  order_index: number;
  xp_reward: number;
  step_type: string;
  code_snippet: string | null;
  video_url: string | null;
}

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
}

const stepTypeIcons: Record<string, any> = {
  concept: Lightbulb,
  setup: Wrench,
  "hands-on": Wrench,
  code: Code,
};

const StepDetailPage = () => {
  const { courseId, lessonId, stepId } = useParams();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);

  useEffect(() => {
    if (!lessonId || !stepId) return;
    const load = async () => {
      const [stepRes, allStepsRes, quizRes] = await Promise.all([
        supabase.from("course_steps").select("*").eq("id", stepId).single(),
        supabase.from("course_steps").select("id, title, order_index, xp_reward, step_type, description, why_important, expected_output, code_snippet, video_url").eq("lesson_id", lessonId).order("order_index"),
        supabase.from("step_quizzes").select("*").eq("step_id", stepId),
      ]);
      setStep(stepRes.data);
      setSteps(allStepsRes.data ?? []);
      const qs = (quizRes.data ?? []).map((q: any) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      }));
      setQuizzes(qs);

      if (user) {
        const { data } = await supabase.from("user_step_progress").select("id").eq("user_id", user.id).eq("step_id", stepId).maybeSingle();
        setCompleted(!!data);
      }
      setLoading(false);
    };
    load();
  }, [lessonId, stepId, user]);

  const currentIndex = steps.findIndex((s) => s.id === stepId);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!user || !stepId) return;
    setCompleting(true);
    try {
      await supabase.from("user_step_progress").upsert({
        user_id: user.id,
        step_id: stepId,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      // Award XP
      if (step?.xp_reward) {
        const { data: profileData } = await supabase.from("profiles").select("xp").eq("user_id", user.id).single();
        if (profileData) {
          await supabase.from("profiles").update({ xp: profileData.xp + step.xp_reward }).eq("user_id", user.id);
          await refreshProfile();
        }
      }

      setCompleted(true);
      toast({ title: `+${step?.xp_reward || 10} XP earned! 🎉` });

      // Show quiz if available
      if (quizzes.length > 0) {
        setShowQuiz(true);
      }
    } catch {
      toast({ title: "Error completing step", variant: "destructive" });
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizAnswer = async (idx: number) => {
    if (quizAnswered) return;
    setQuizSelected(idx);
    setQuizAnswered(true);
    const isCorrect = idx === quizzes[currentQuiz].correct_answer;
    setQuizCorrect(isCorrect);

    if (user) {
      const xpEarned = isCorrect ? 5 : 0;
      await supabase.from("user_quiz_results").upsert({
        user_id: user.id,
        quiz_id: quizzes[currentQuiz].id,
        selected_answer: idx,
        is_correct: isCorrect,
        xp_earned: xpEarned,
      });

      if (isCorrect) {
        const { data: profileData } = await supabase.from("profiles").select("xp").eq("user_id", user.id).single();
        if (profileData) {
          await supabase.from("profiles").update({ xp: profileData.xp + xpEarned }).eq("user_id", user.id);
          await refreshProfile();
        }
      }
    }
  };

  const handleNextQuiz = () => {
    if (currentQuiz < quizzes.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setQuizSelected(null);
      setQuizAnswered(false);
      setQuizCorrect(false);
    } else {
      setShowQuiz(false);
    }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  if (!step) return <AppLayout><div className="text-center py-20 text-muted-foreground">Step not found</div></AppLayout>;

  const StepIcon = stepTypeIcons[step.step_type] || Lightbulb;

  // Quiz overlay
  if (showQuiz && quizzes.length > 0) {
    const q = quizzes[currentQuiz];
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full gradient-xp flex items-center justify-center mx-auto">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Knowledge Check!</h1>
            <p className="text-sm text-muted-foreground">Question {currentQuiz + 1} of {quizzes.length}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
            <h2 className="text-lg font-bold text-foreground">{q.question}</h2>
            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                let borderClass = "border-border hover:border-primary/40";
                if (quizAnswered) {
                  if (idx === q.correct_answer) borderClass = "border-success bg-success/10";
                  else if (idx === quizSelected && !quizCorrect) borderClass = "border-destructive bg-destructive/10";
                } else if (quizSelected === idx) {
                  borderClass = "border-primary bg-primary/10";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={quizAnswered}
                    className={cn("w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm", borderClass)}
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold mr-3">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizAnswered && (
              <div className={cn("p-4 rounded-xl text-sm", quizCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                <p className="font-bold mb-1">{quizCorrect ? "✅ Correct! +5 XP" : "❌ Not quite!"}</p>
                {q.explanation && <p className="text-foreground/80">{q.explanation}</p>}
              </div>
            )}
          </div>

          {quizAnswered && (
            <Button onClick={handleNextQuiz} className="w-full font-semibold h-12">
              {currentQuiz === quizzes.length - 1 ? "Continue Learning" : "Next Question"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0">
        <Link to={`/courses/${courseId}/lessons/${lessonId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Lesson
        </Link>

        {/* Step progress dots */}
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.id} className={cn("h-1.5 flex-1 rounded-full transition-all", s.id === stepId ? "gradient-primary" : i <= currentIndex ? "bg-success" : "bg-muted")} />
          ))}
        </div>

        {/* Step Card */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <StepIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">{step.step_type} · Step {currentIndex + 1}/{steps.length}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-xp">⚡ {step.xp_reward} XP</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground">{step.title}</h1>

          <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {step.description}
          </div>

          {step.why_important && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm font-bold text-primary mb-1">💡 Why This Matters</p>
              <p className="text-sm text-foreground/80">{step.why_important}</p>
            </div>
          )}

          {step.expected_output && (
            <div className="bg-success/5 border border-success/20 rounded-xl p-4">
              <p className="text-sm font-bold text-success mb-1">✅ Expected Output</p>
              <p className="text-sm text-foreground/80">{step.expected_output}</p>
            </div>
          )}

          {step.code_snippet && (
            <div className="bg-foreground/5 rounded-xl p-4 overflow-x-auto">
              <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1"><Code className="h-3 w-3" /> Code</p>
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{step.code_snippet}</pre>
            </div>
          )}

          {step.video_url && (
            <a href={step.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl hover:bg-destructive/10 transition-colors">
              <Youtube className="h-8 w-8 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">Watch Video Tutorial</p>
                <p className="text-xs text-muted-foreground">Opens in YouTube</p>
              </div>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          {prevStep ? (
            <Button variant="outline" onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}/steps/${prevStep.id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
          ) : <div />}

          {!completed ? (
            <Button onClick={handleComplete} disabled={completing} className="font-semibold">
              {completing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Complete Step
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-success font-semibold text-sm">
              <CheckCircle2 className="h-5 w-5" /> Completed!
            </div>
          )}

          {nextStep ? (
            <Button onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}/steps/${nextStep.id}`)}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Link to={`/courses/${courseId}/lessons/${lessonId}`}>
              <Button>Back to Lesson</Button>
            </Link>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StepDetailPage;
