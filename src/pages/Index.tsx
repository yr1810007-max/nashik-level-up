import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Zap, Users, ArrowRight } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"><span className="text-primary-foreground font-bold text-sm">SQ</span></div>
            <span className="font-bold text-lg text-foreground">Skill Quest</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard"><Button className="font-semibold">Dashboard</Button></Link>
            ) : (
              <><Link to="/login"><Button variant="ghost" className="font-semibold">Sign In</Button></Link><Link to="/signup"><Button className="font-semibold">Get Started</Button></Link></>
            )}
          </div>
        </div>
      </header>

      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold"><Zap className="h-4 w-4" /> Gamified Learning Platform</div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">Learn. Build. <span className="bg-gradient-to-r from-primary to-xp bg-clip-text text-transparent">Level Up.</span></h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Master new skills through interactive courses, challenges, and community projects. Earn XP, unlock achievements, and compete on the leaderboard.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup"><Button size="lg" className="font-bold h-14 px-8 text-lg">Start Learning <ArrowRight className="h-5 w-5 ml-2" /></Button></Link>
            <Link to="/courses"><Button size="lg" variant="outline" className="font-bold h-14 px-8 text-lg">Browse Courses</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">Why Skill Quest?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Interactive Courses", desc: "Learn with structured lessons and hands-on projects", gradient: "gradient-primary" },
              { icon: Zap, title: "Earn XP & Level Up", desc: "Gain experience points and track your progress", gradient: "gradient-xp" },
              { icon: Trophy, title: "Achievements & Badges", desc: "Unlock badges as you master new skills", gradient: "gradient-accent" },
              { icon: Users, title: "Community Projects", desc: "Share your work and learn from others", gradient: "gradient-info" },
            ].map((f) => (
              <div key={f.title} className="bg-card rounded-2xl border border-border shadow-card p-6 text-center space-y-4 hover:shadow-card-hover transition-shadow">
                <div className={`w-14 h-14 rounded-2xl ${f.gradient} flex items-center justify-center mx-auto`}><f.icon className="h-7 w-7 text-primary-foreground" /></div>
                <h3 className="font-bold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 Skill Quest</span>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded gradient-primary flex items-center justify-center"><span className="text-primary-foreground font-bold text-[8px]">SQ</span></div><span className="font-semibold text-foreground">Skill Quest</span></div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
