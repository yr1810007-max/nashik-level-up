import { useState } from "react";
import { MessageCircleQuestion, Linkedin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Expert {
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  image?: string;
}

const experts: Expert[] = [
  {
    name: "Rahul Sharma",
    role: "IoT Specialist",
    bio: "10+ years in embedded systems and IoT architecture.",
    linkedin: "https://linkedin.com/in/example1",
  },
  {
    name: "Priya Patel",
    role: "Hardware Mentor",
    bio: "Circuit design expert and electronics educator.",
    linkedin: "https://linkedin.com/in/example2",
  },
  {
    name: "Amit Kumar",
    role: "Full-Stack Developer",
    bio: "Builds scalable platforms for interactive learning.",
    linkedin: "https://linkedin.com/in/example3",
  },
  {
    name: "Sneha Desai",
    role: "Curriculum Designer",
    bio: "Creates beginner-friendly STEM learning paths.",
    linkedin: "https://linkedin.com/in/example4",
  },
];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

const FloatingContactButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-6 md:bottom-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            aria-label="Contact Experts"
          >
            <MessageCircleQuestion className="h-6 w-6" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Contact / Get Help</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Contact Experts</DialogTitle>
            <p className="text-sm text-muted-foreground">Get help from our team of specialists</p>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {experts.map((expert, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/30 transition-colors"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  {expert.image && <AvatarImage src={expert.image} alt={expert.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(expert.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">{expert.name}</h4>
                  <p className="text-xs text-primary font-medium">{expert.role}</p>
                  <p className="text-sm text-muted-foreground mt-1">{expert.bio}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1.5"
                    onClick={() => window.open(expert.linkedin, "_blank")}
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingContactButton;
