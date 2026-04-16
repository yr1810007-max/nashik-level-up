import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Users, Trophy, User, Sun, Moon, LogOut, Menu, X, CircuitBoard, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/components", label: "Components", icon: CircuitBoard },
  { to: "/community", label: "Community", icon: Users },
  { to: "/leaderboard", label: "Board", icon: Trophy },
  { to: "/local-shops", label: "Shops", icon: Store },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SQ</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">Skill Quest</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {profile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-xp/10 text-xp font-bold text-sm">
                ⚡ {profile.xp.toLocaleString()} XP
              </div>
            )}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors hidden md:flex"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "animate-bounce-in")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
