import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, BookOpen, Zap } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required");
    if (!password.trim()) return setError("Password is required");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-primary-foreground/20 backdrop-blur-sm rounded-2xl px-6 py-3">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
            <span className="text-2xl font-extrabold text-primary-foreground">Nashik Skill Quest</span>
          </div>
          <h1 className="text-4xl font-extrabold text-primary-foreground leading-tight">
            Learn. Play.<br />Level Up! 🚀
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Master IoT, Agriculture, and more through gamified lessons and quizzes.
          </p>
          <div className="flex items-center justify-center gap-4 text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Earn XP</span>
            </div>
            <span>•</span>
            <span className="font-semibold">🏆 Win Badges</span>
            <span>•</span>
            <span className="font-semibold">🔥 Build Streaks</span>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="text-xl font-extrabold text-foreground">Nashik Skill Quest</span>
            </div>
            <h2 className="text-3xl font-extrabold text-foreground">Welcome back!</h2>
            <p className="mt-2 text-muted-foreground">Log in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm font-medium rounded-lg px-4 py-3 animate-slide-up">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-bold gradient-primary shadow-button hover:translate-y-0.5 hover:shadow-none transition-all duration-150 text-primary-foreground"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
