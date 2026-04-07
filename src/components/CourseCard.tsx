import { Link } from "react-router-dom";
import { type Course } from "@/lib/mock-data";
import { BookOpen, Signal, BarChart3 } from "lucide-react";

const categoryColors: Record<string, string> = {
  IoT: "bg-secondary/15 text-secondary",
  Agriculture: "bg-success/15 text-success",
  Technology: "bg-xp/15 text-xp",
  Science: "bg-accent/15 text-accent-foreground",
};

const difficultyIcons: Record<string, React.ReactNode> = {
  Beginner: <Signal className="h-3.5 w-3.5" />,
  Intermediate: <BarChart3 className="h-3.5 w-3.5" />,
  Advanced: <BarChart3 className="h-3.5 w-3.5" />,
};

export function CourseCard({ course }: { course: Course }) {
  const completedLessons = course.lessons.filter((l) => l.completed).length;
  const progress = course.lessons.length > 0 ? (completedLessons / course.lessons.length) * 100 : 0;

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-border"
    >
      <div className="h-2 gradient-primary" />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[course.category] ?? "bg-muted text-muted-foreground"}`}>
            {course.category}
          </span>
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            {difficultyIcons[course.difficulty]} {course.difficulty}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">{completedLessons}/{course.lessons.length} lessons</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-accent font-bold">⚡ {course.totalPoints} XP</span>
        </div>
      </div>
    </Link>
  );
}
