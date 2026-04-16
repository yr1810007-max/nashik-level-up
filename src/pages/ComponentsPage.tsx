import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ExternalLink, IndianRupee, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import componentEsp32 from "@/assets/component-esp32.png";
import componentDht11 from "@/assets/component-dht11.png";
import componentLed from "@/assets/component-led.png";
import componentResistor from "@/assets/component-resistor.png";

const componentImages: Record<string, string> = {
  esp32: componentEsp32,
  esp: componentEsp32,
  dht11: componentDht11,
  dht: componentDht11,
  led: componentLed,
  resistor: componentResistor,
  "220": componentResistor,
};

function getComponentImage(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [key, img] of Object.entries(componentImages)) {
    if (lower.includes(key)) return img;
  }
  return null;
}

interface Component {
  id: string;
  name: string;
  quantity: number;
  price_inr: number;
  purpose: string | null;
  image_url: string | null;
  amazon_link: string | null;
  flipkart_link: string | null;
  other_link: string | null;
}

const ComponentsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [components, setComponents] = useState<Component[]>([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      const [compRes, courseRes] = await Promise.all([
        supabase.from("course_components").select("*").eq("course_id", courseId),
        supabase.from("courses").select("title").eq("id", courseId).single(),
      ]);
      setComponents(compRes.data ?? []);
      setCourseName(courseRes.data?.title ?? "");
      setLoading(false);
    };
    load();
  }, [courseId]);

  const totalCost = components.reduce((sum, c) => sum + c.price_inr * c.quantity, 0);

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0">
        <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-foreground">🔌 Components List</h1>
          <p className="text-muted-foreground mt-1">{courseName}</p>
        </div>

        {/* Total cost card */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
            <p className="text-3xl font-bold text-foreground flex items-center gap-1">
              <IndianRupee className="h-6 w-6" />{totalCost}
            </p>
          </div>
          <ShoppingCart className="h-10 w-10 text-primary/30" />
        </div>

        {/* Components */}
        <div className="space-y-3">
          {components.map((comp) => (
            <div key={comp.id} className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-3">
              <div className="flex items-start gap-4 justify-between">
                {getComponentImage(comp.name) && (
                  <img src={getComponentImage(comp.name)!} alt={comp.name} loading="lazy" width={64} height={64} className="w-16 h-16 object-contain rounded-lg bg-muted/30 p-1 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">{comp.name}</h3>
                  {comp.purpose && <p className="text-sm text-muted-foreground mt-1">{comp.purpose}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-foreground flex items-center gap-0.5">
                    <IndianRupee className="h-3.5 w-3.5" />{comp.price_inr}
                  </p>
                  <p className="text-xs text-muted-foreground">Qty: {comp.quantity}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {comp.amazon_link && (
                  <a href={comp.amazon_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      Amazon <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
                {comp.flipkart_link && (
                  <a href={comp.flipkart_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      Flipkart <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
                {comp.other_link && (
                  <a href={comp.other_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      Other <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {components.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-medium">No components listed for this course yet</p>
          </div>
        )}

        {/* Buy Components in Nashik */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-3">
          <h2 className="text-lg font-bold text-foreground">🏪 Buy Components in Nashik</h2>
          <p className="text-xs text-muted-foreground">Offline stores for quick purchase</p>
          <div className="space-y-2">
            {[
              { name: "Nashik Electronics Market", area: "College Road", desc: "Wide range of electronic components, Arduino boards & sensors" },
              { name: "Shree Electronics", area: "Sharanpur Road", desc: "Affordable resistors, LEDs, breadboards and basic kits" },
              { name: "Raj Electronic Components", area: "Near CBS", desc: "ESP32, sensors and IoT project kits available" },
              { name: "Reliable Electronics", area: "Panchavati", desc: "Quality electronic parts and soldering accessories" },
              { name: "S.K. Electronics", area: "Dwarka Circle", desc: "Bulk components and student-friendly pricing" },
            ].map((shop, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-muted/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm">📍</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{shop.name}</p>
                  <p className="text-xs text-primary font-medium">{shop.area}, Nashik</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{shop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ComponentsPage;
