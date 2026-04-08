import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LessonPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    const load = async () => {
      const [lessonRes, allLessonsRes] = await Promise.all([
        supabase.from("lessons").select("*").eq("id", lessonId).single(),
        supabase.from("lessons").select("id, title, order_index").eq("course_id", courseId).order("order_index"),
      ]);
      setLesson(lessonRes.data);
      setLessons(allLessonsRes.data ?? []);
      if (user) {
        const { data } = await supabase.from("user_lessons").select("id").eq("user_id", user.id).eq("lesson_id", lessonId).maybeSingle();
        setCompleted(!!data);
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

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0">
        <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Course</Link>
        <div className="flex items-center gap-1">
          {lessons.map((l, i) => (
            <div key={l.id} className={`h-1 flex-1 rounded-full ${l.id === lessonId ? "gradient-primary" : i <= currentIndex ? "bg-success" : "bg-muted"}`} />
          ))}
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold text-muted-foreground">Lesson {currentIndex + 1} of {lessons.length}</span>
            <span className="text-xs font-bold text-xp">⚡ {lesson.xp_reward} XP</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-6">{lesson.title}</h1>
          <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
            {lesson.content ? <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, "<br/>") }} /> : <p className="text-muted-foreground">No content available yet.</p>}
          </div>
        </div>
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
