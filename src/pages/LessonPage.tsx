import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { fetchCourseById, fetchQuiz } from "@/lib/api";
import { type Course, type QuizQuestion } from "@/lib/mock-data";
import { QuizComponent } from "@/components/QuizComponent";
import { LessonSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, FileQuestion } from "lucide-react";

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [markedComplete, setMarkedComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId && lessonId) {
      Promise.all([fetchCourseById(courseId), fetchQuiz(lessonId)]).then(([c, q]) => {
        setCourse(c ?? null);
        setQuiz(q);
        setLoading(false);
        setShowQuiz(false);
        setMarkedComplete(false);
      });
    }
  }, [courseId, lessonId]);

  if (loading) return <AppLayout><LessonSkeleton /></AppLayout>;
  if (!course) return <AppLayout><div className="text-center py-16 text-muted-foreground">Course not found</div></AppLayout>;

  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) return <AppLayout><div className="text-center py-16 text-muted-foreground">Lesson not found</div></AppLayout>;

  const currentIdx = course.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? course.lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < course.lessons.length - 1 ? course.lessons[currentIdx + 1] : null;
  const isCompleted = lesson.completed || markedComplete;

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-xl font-extrabold text-foreground mt-6 mb-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
        if (match) {
          return <li key={i} className="ml-4 mb-2 text-muted-foreground"><span className="font-bold text-foreground">{match[1]}</span>: {match[2]}</li>;
        }
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-4 mb-1 text-muted-foreground">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-4 mb-1 text-muted-foreground list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-muted-foreground mb-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm">
            <ArrowLeft className="h-4 w-4" /> {course.title}
          </Link>
        </div>

        {/* Lesson Progress */}
        <div className="flex items-center gap-2">
          {course.lessons.map((l, i) => (
            <Link
              key={l.id}
              to={`/courses/${courseId}/lessons/${l.id}`}
              className={`h-2 flex-1 rounded-full transition-colors ${
                l.id === lessonId ? "gradient-primary" : l.completed ? "bg-primary/40" : "bg-muted"
              }`}
              title={l.title}
            />
          ))}
        </div>

        {!showQuiz ? (
          <>
            <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                {isCompleted && <CheckCircle2 className="h-6 w-6 text-primary" />}
                <h1 className="text-2xl font-extrabold text-foreground">{lesson.title}</h1>
              </div>
              <div className="prose prose-sm max-w-none">
                {renderContent(lesson.content)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!isCompleted && (
                <Button
                  onClick={() => setMarkedComplete(true)}
                  className="h-12 rounded-xl font-bold gradient-primary shadow-button hover:translate-y-0.5 hover:shadow-none transition-all duration-150 text-primary-foreground"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" /> Mark as Complete
                </Button>
              )}
              {quiz.length > 0 && (
                <Button
                  onClick={() => setShowQuiz(true)}
                  variant="outline"
                  className="h-12 rounded-xl font-bold"
                >
                  <FileQuestion className="h-5 w-5 mr-2" /> Take Quiz
                </Button>
              )}
            </div>

            <div className="flex justify-between">
              {prevLesson ? (
                <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`}>
                  <Button variant="ghost" className="font-bold">
                    <ArrowLeft className="h-4 w-4 mr-2" /> {prevLesson.title}
                  </Button>
                </Link>
              ) : <div />}
              {nextLesson ? (
                <Link to={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                  <Button variant="ghost" className="font-bold">
                    {nextLesson.title} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link to={`/courses/${courseId}`}>
                  <Button variant="ghost" className="font-bold text-primary">
                    Back to Course
                  </Button>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border">
            <h2 className="text-xl font-extrabold text-foreground mb-6">Quiz: {lesson.title}</h2>
            <QuizComponent lessonId={lesson.id} questions={quiz} />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default LessonPage;
