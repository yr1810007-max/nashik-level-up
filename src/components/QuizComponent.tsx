import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type QuizQuestion } from "@/lib/mock-data";
import { submitQuiz } from "@/lib/api";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RotateCcw, PartyPopper } from "lucide-react";

interface QuizComponentProps {
  lessonId: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export function QuizComponent({ lessonId, questions, onComplete }: QuizComponentProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; correct: boolean[]; pointsEarned: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-semibold">No quiz available for this lesson yet.</p>
      </div>
    );
  }

  const question = questions[currentQ];
  const isLast = currentQ === questions.length - 1;
  const hasSelected = selected[question.id] !== undefined;

  const handleSelect = (optionIdx: number) => {
    if (showResult) return;
    setSelected((prev) => ({ ...prev, [question.id]: optionIdx }));
  };

  const handleNext = () => {
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentQ((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitQuiz(lessonId, selected);
      setResult(res);
      setShowResult(true);
      onComplete?.(res.score, res.total);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected({});
    setResult(null);
    setShowResult(false);
  };

  if (showResult && result) {
    const percentage = Math.round((result.score / result.total) * 100);
    const passed = percentage >= 70;

    return (
      <div className="space-y-6 animate-bounce-in">
        <div className={`text-center p-8 rounded-2xl ${passed ? "bg-primary/10" : "bg-destructive/10"}`}>
          <div className="text-6xl mb-4">{passed ? "🎉" : "😅"}</div>
          <h3 className="text-2xl font-extrabold text-foreground mb-2">
            {passed ? "Awesome!" : "Keep practicing!"}
          </h3>
          <p className="text-lg text-muted-foreground">
            You scored <span className="font-extrabold text-foreground">{result.score}/{result.total}</span> ({percentage}%)
          </p>
          {result.pointsEarned > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-accent/20 text-accent-foreground font-bold px-4 py-2 rounded-full animate-bounce-in">
              <PartyPopper className="h-5 w-5" /> +{result.pointsEarned} XP earned!
            </div>
          )}
        </div>

        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className={`p-4 rounded-xl border ${result.correct[i] ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
              <div className="flex items-start gap-3">
                {result.correct[i] ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-sm text-foreground">{q.question}</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Your answer: <span className={result.correct[i] ? "text-primary font-bold" : "text-destructive font-bold"}>{q.options[selected[q.id]]}</span>
                    {!result.correct[i] && <span className="text-primary font-bold ml-2">✓ {q.options[q.correctAnswer]}</span>}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleRetry} variant="outline" className="w-full h-12 rounded-xl font-bold">
          <RotateCcw className="h-4 w-4 mr-2" /> Retry Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-muted-foreground">Question {currentQ + 1}/{questions.length}</span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="animate-slide-up" key={question.id}>
        <h3 className="text-xl font-extrabold text-foreground mb-6">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selected[question.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-semibold text-sm ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-card"
                    : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mr-3 text-xs font-bold ${
                  isSelected ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!hasSelected || isSubmitting}
        className="w-full h-12 rounded-xl text-base font-bold gradient-primary shadow-button hover:translate-y-0.5 hover:shadow-none transition-all duration-150 text-primary-foreground"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isLast ? (
          "Submit Quiz"
        ) : (
          <>Next <ArrowRight className="h-4 w-4 ml-2" /></>
        )}
      </Button>
    </div>
  );
}
