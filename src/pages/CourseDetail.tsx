import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { fetchCourseById } from "@/lib/api";
import { type Course } from "@/lib/mock-data";
import { ProgressBar } from "@/components/ProgressBar";
import { LessonSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, BookOpen, Zap } from "lucide-react";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId).then((c) => { setCourse(c ?? null); setLoading(false); });
    }
  }, [courseId]);

  if (loading) return <AppLayout><LessonSkeleton /></AppLayout>;
  if (!course) return <AppLayout><div className="text-center py-16 text-muted-foreground"><p className="text-lg font-semibold">Course not found</p></div></AppLayout>;

  const completedLessons = course.lessons.filter((l) => l.completed).length;
  const progress = course.lessons.length > 0 ? (completedLessons / course.lessons.length) * 100 : 0;
  const nextLesson = course.lessons.find((l) => !l.completed) ?? course.lessons[0];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="h-3 gradient-primary" />
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">{course.category}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{course.difficulty}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{course.title}</h1>
                <p className="text-muted-foreground">{course.description}</p>
              </div>
              <div className="flex items-center gap-2 text-accent font-bold flex-shrink-0">
                <Zap className="h-5 w-5" /> {course.totalPoints} XP
              </div>
            </div>

            <ProgressBar value={progress} label={`${completedLessons}/${course.lessons.length} lessons completed`} />

            {nextLesson && (
              <Link to={`/courses/${course.id}/lessons/${nextLesson.id}`}>
                <Button className="h-12 rounded-xl font-bold gradient-primary shadow-button hover:translate-y-0.5 hover:shadow-none transition-all duration-150 text-primary-foreground">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {completedLessons > 0 ? "Continue Learning" : "Start Course"}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Lessons list */}
        <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
          <h2 className="text-lg font-extrabold text-foreground mb-4">Lessons</h2>
          <div className="space-y-2">
            {course.lessons.map((lesson, idx) => (
              <Link
                key={lesson.id}
                to={`/courses/${course.id}/lessons/${lesson.id}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${lesson.completed ? "bg-primary/15" : "bg-muted"}`}>
                  {lesson.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {idx + 1}. {lesson.title}
                  </p>
                </div>
                {lesson.completed && <span className="text-xs font-bold text-primary">✓ Done</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetail;
