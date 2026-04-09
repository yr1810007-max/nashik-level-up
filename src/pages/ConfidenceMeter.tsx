import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, Loader2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

const ConfidenceMeter = () => {
  const { courseId, phase } = useParams<{ courseId: string; phase: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingScore, setExistingScore] = useState<{ score_before: number | null; score_after: number | null } | null>(null);
  const [courseName, setCourseName] = useState("");

  const isBefore = phase === "before";
  const isAfter = phase === "after";

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      const [qRes, courseRes] = await Promise.all([
        supabase.from("confidence_questions").select("*").eq("course_id", courseId).order("order_index"),
        supabase.from("courses").select("title").eq("id", courseId).single(),
      ]);
      const qs = (qRes.data ?? []).map((q: any) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      }));
      setQuestions(qs);
      setCourseName(courseRes.data?.title ?? "");

      if (user) {
        const { data } = await supabase.from("confidence_scores").select("score_before, score_after").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
        setExistingScore(data);
      }
      setLoading(false);
    };
    load();
  }, [courseId, user]);

  const handleSelect = (idx: number) => {
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers: number[]) => {
    if (!user || !courseId) return;
    setSubmitting(true);
    const correct = finalAnswers.filter((a, i) => a === questions[i].correct_answer).length;
    const score = Math.round((correct / questions.length) * 100);

    try {
      if (isBefore) {
        await supabase.from("confidence_scores").upsert({
          user_id: user.id,
          course_id: courseId,
          score_before: score,
          answers_before: finalAnswers,
        });
        toast({ title: `Confidence Score: ${score}%`, description: "Let's see how much you improve after the course!" });
        navigate(`/courses/${courseId}`);
      } else {
        await supabase.from("confidence_scores").update({
          score_after: score,
          answers_after: finalAnswers,
        }).eq("user_id", user.id).eq("course_id", courseId);
        toast({ title: `After Score: ${score}%! 🎉` });
        navigate(`/courses/${courseId}/confidence/results`);
      }
    } catch {
      toast({ title: "Error saving score", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  // Show results page
  if (phase === "results" && existingScore) {
    const before = existingScore.score_before ?? 0;
    const after = existingScore.score_after ?? 0;
    const improvement = after - before;

    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-8 pb-20 md:pb-0">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Confidence Meter Results</h1>
            <p className="text-muted-foreground">{courseName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Before Course</p>
              <p className="text-4xl font-bold text-destructive">{before}%</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">After Course</p>
              <p className="text-4xl font-bold text-primary">{after}%</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Improvement</p>
            <p className={cn("text-5xl font-bold", improvement > 0 ? "text-success" : improvement < 0 ? "text-destructive" : "text-muted-foreground")}>
              {improvement > 0 ? "+" : ""}{improvement}%
            </p>
            {improvement > 0 && <p className="text-success mt-2 font-semibold">Great progress! 🎉</p>}
            {improvement === 0 && <p className="text-muted-foreground mt-2">You were already confident!</p>}
          </div>

          {/* Visual comparison bar */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-foreground">Visual Comparison</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Before</span>
                  <span className="font-bold">{before}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-destructive/60 rounded-full transition-all" style={{ width: `${before}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">After</span>
                  <span className="font-bold">{after}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${after}%` }} />
                </div>
              </div>
            </div>
          </div>

          <Button onClick={() => navigate(`/courses/${courseId}`)} className="w-full font-semibold">
            Back to Course
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-muted-foreground">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No confidence questions available for this course</p>
          <Button className="mt-4" onClick={() => navigate(`/courses/${courseId}`)}>Go to Course</Button>
        </div>
      </AppLayout>
    );
  }

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0">
        <button onClick={() => navigate(`/courses/${courseId}`)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </button>

        <div className="text-center space-y-2">
          <Brain className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            {isBefore ? "Pre-Course Confidence Check" : "Post-Course Confidence Check"}
          </h1>
          <p className="text-sm text-muted-foreground">{courseName}</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
          <h2 className="text-lg font-bold text-foreground">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm",
                  selected === idx
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/40 text-foreground/80"
                )}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold mr-3">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={selected === null || submitting}
          className="w-full font-semibold h-12"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : currentQ === questions.length - 1 ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <ArrowRight className="h-4 w-4 mr-2" />
          )}
          {currentQ === questions.length - 1 ? "Submit & See Score" : "Next Question"}
        </Button>
      </div>
    </AppLayout>
  );
};

export default ConfidenceMeter;
