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
    name: "Dr. Anil Khedkar",
    role: "Embedded Systems Engineer",
    bio: "15+ years designing microcontroller-based systems. Specializes in ESP32 and ARM platforms.",
    linkedin: "https://www.linkedin.com/in/anilkhedkar",
  },
  {
    name: "Prof. Meera Joshi",
    role: "IoT Curriculum Expert",
    bio: "Associate Professor at KBTCOE Nashik. Develops hands-on IoT lab curricula for engineering students.",
    linkedin: "https://www.linkedin.com/in/meerajoshi-iot",
  },
  {
    name: "Vikram Patil",
    role: "IoT Solutions Architect",
    bio: "Built 50+ smart agriculture and industrial IoT deployments across Maharashtra.",
    linkedin: "https://www.linkedin.com/in/vikrampatil-iot",
  },
  {
    name: "Sonal Deshmukh",
    role: "Hardware Prototyping Mentor",
    bio: "Maker community leader. Guides students from breadboard prototypes to PCB manufacturing.",
    linkedin: "https://www.linkedin.com/in/sonaldeshmukh-maker",
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
            className="fixed bottom-36 right-6 md:bottom-20 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center justify-center"
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
                    onClick={() => window.open(expert.linkedin, "_blank", "noopener,noreferrer")}
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    View Profile
                    <ExternalLink className="h-3 w-3" />
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
