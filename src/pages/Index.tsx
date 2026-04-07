import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, Trophy, Flame, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-extrabold text-lg text-foreground">Nashik Skill Quest</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="font-bold">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button className="font-bold gradient-primary text-primary-foreground rounded-xl shadow-button hover:translate-y-0.5 hover:shadow-none transition-all duration-150">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full text-sm mb-6 animate-bounce-in">
            <Flame className="h-4 w-4" /> Learn. Play. Level Up!
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
            Master New Skills<br />
            <span className="text-primary">The Fun Way</span> 🚀
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore IoT, Agriculture, Data Science and more through gamified lessons, 
            quizzes, and challenges. Earn XP, badges, and climb the leaderboard!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl gradient-primary shadow-button hover:translate-y-0.5 hover:shadow-none transition-all duration-150 text-primary-foreground">
                Start Learning Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-2xl">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap className="h-7 w-7 text-primary-foreground" />, gradient: "gradient-primary", title: "Earn XP", desc: "Complete lessons and quizzes to earn experience points and level up your skills." },
            { icon: <Trophy className="h-7 w-7 text-accent-foreground" />, gradient: "gradient-accent", title: "Win Badges", desc: "Unlock achievement badges as you master new topics and complete challenges." },
            { icon: <Flame className="h-7 w-7 text-secondary-foreground" />, gradient: "gradient-info", title: "Build Streaks", desc: "Maintain daily learning streaks and stay motivated on your learning journey." },
          ].map((f) => (
            <div key={f.title} className="bg-card rounded-2xl shadow-card p-8 border border-border text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl ${f.gradient} flex items-center justify-center mx-auto mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-extrabold text-xl text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Nashik Skill Quest. Learn smarter, not harder. 🌱</p>
      </footer>
    </div>
  );
};

export default Index;
