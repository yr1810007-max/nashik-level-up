import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Camera, Zap, Trophy, Flame, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("profiles").update({ display_name: displayName.trim(), bio: bio.trim() }).eq("user_id", user.id);
      await refreshProfile();
      setEditing(false);
      toast({ title: "Profile updated!" });
    } catch {
      toast({ title: "Error updating profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  // XP → Level: every 100 XP = 1 level
  const computedLevel = Math.floor(profile.xp / 100) + 1;
  const levelProgress = ((profile.xp % 100) / 100) * 100;

  // Achievements based on completed courses
  const getProjectAchievements = () => {
    const badges = [
      { min: 1, name: "Pioneer", icon: "🌟", desc: "Completed your first project" },
      { min: 2, name: "Trailblazer", icon: "🔥", desc: "Completed 2 projects" },
      { min: 3, name: "Achiever", icon: "🏅", desc: "Completed 3 projects" },
      { min: 4, name: "Conqueror", icon: "👑", desc: "Completed all 4 projects" },
    ];
    return badges.filter(b => b.min <= computedLevel); // Show badges unlocked by level as proxy
  };

  const earnedBadges = getProjectAchievements();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="h-32 gradient-hero" />
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card flex items-center justify-center overflow-hidden shadow-card">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-muted-foreground">
                    {(profile.display_name || "?")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 mb-1">
                <h1 className="text-xl font-bold text-foreground">{profile.display_name || "Learner"}</h1>
                {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
              </div>
              <Button variant="outline" size="sm" onClick={() => { setEditing(!editing); setDisplayName(profile.display_name || ""); setBio(profile.bio || ""); }}>
                {editing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>
        </div>

        {editing && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tell us about yourself..."
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Zap className="h-5 w-5 text-xp mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{profile.xp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{computedLevel}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Flame className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{profile.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <BookOpen className="h-5 w-5 text-info mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{Math.round(levelProgress)}%</p>
            <p className="text-xs text-muted-foreground">To Next Level</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground">Level {computedLevel} Progress</h2>
            <span className="text-sm text-muted-foreground">{profile.xp % 100} / 100 XP</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-xp rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        {/* Achievements / Badges */}
        {earnedBadges.length > 0 && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-bold text-foreground mb-4">🏆 Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {earnedBadges.map((badge) => (
                <div key={badge.name} className="text-center p-3 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="font-semibold text-sm text-foreground mt-1">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
