import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  image_url: string | null;
  xp_reward: number;
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-success/10 text-success",
  Intermediate: "bg-warning/10 text-warning",
  Advanced: "bg-destructive/10 text-destructive",
};

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      setCourses(data ?? []);
      if (user) {
        const { data: uc } = await supabase.from("user_courses").select("course_id").eq("user_id", user.id);
        setEnrolledIds(new Set((uc ?? []).map((r: any) => r.course_id)));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const categories = [...new Set(courses.map((c) => c.category))];

  const filtered = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDifficulty && c.difficulty !== filterDifficulty) return false;
    if (filterCategory && c.category !== filterCategory) return false;
    return true;
  });

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    await supabase.from("user_courses").insert({ user_id: user.id, course_id: courseId });
    setEnrolledIds((prev) => new Set(prev).add(courseId));
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground mt-1">Explore skills and start learning</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Beginner", "Intermediate", "Advanced"].map((d) => (
              <Button key={d} variant={filterDifficulty === d ? "default" : "outline"} size="sm" onClick={() => setFilterDifficulty(filterDifficulty === d ? null : d)}>
                {d}
              </Button>
            ))}
          </div>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <Button variant={!filterCategory ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(null)}>All</Button>
            {categories.map((c) => (
              <Button key={c} variant={filterCategory === c ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(filterCategory === c ? null : c)}>{c}</Button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course) => (
              <div key={course.id} className="bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all group overflow-hidden">
                <div className="h-36 overflow-hidden">
                  <img src={getCourseBanner(course.title)} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", difficultyColors[course.difficulty] || "bg-muted text-muted-foreground")}>
                      {course.difficulty}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{course.title}</h3>
                  {course.description && <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-xp flex items-center gap-1">⚡ {course.xp_reward} XP</span>
                    {enrolledIds.has(course.id) ? (
                      <Link to={`/courses/${course.id}`}><Button size="sm" className="font-semibold">Continue</Button></Link>
                    ) : (
                      <Button size="sm" variant="outline" className="font-semibold" onClick={() => handleEnroll(course.id)}>Enroll</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Courses;
