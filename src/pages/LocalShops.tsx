import { AppLayout } from "@/components/AppLayout";
import { MapPin, Phone, Clock } from "lucide-react";

const shops = [
  { name: "Nashik Electronics Market", area: "College Road", desc: "Wide range of electronic components, Arduino boards, sensors & IoT kits", timing: "10 AM – 8 PM" },
  { name: "Shree Electronics", area: "Sharanpur Road", desc: "Affordable resistors, LEDs, breadboards and basic starter kits", timing: "10 AM – 7 PM" },
  { name: "Raj Electronic Components", area: "Near CBS", desc: "ESP32, sensors, motor drivers and IoT project kits available", timing: "10:30 AM – 8:30 PM" },
  { name: "Reliable Electronics", area: "Panchavati", desc: "Quality electronic parts, soldering accessories & testing equipment", timing: "9:30 AM – 7:30 PM" },
  { name: "S.K. Electronics", area: "Dwarka Circle", desc: "Bulk components, connectors and student-friendly pricing", timing: "10 AM – 8 PM" },
  { name: "CBS Area Electronics Stores", area: "CBS, Nashik", desc: "Multiple small shops selling general electronic parts and wires", timing: "10 AM – 7 PM" },
];

const LocalShops = () => (
  <AppLayout>
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">🏪 Buy Components Near You</h1>
        <p className="text-muted-foreground mt-1">Electronics shops in Nashik for quick offline purchase</p>
      </div>

      <div className="space-y-3">
        {shops.map((shop, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{shop.name}</h3>
                <p className="text-sm text-primary font-medium">{shop.area}, Nashik</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{shop.desc}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {shop.timing}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground">💡 Tip: Call ahead to check availability of specific components before visiting.</p>
      </div>
    </div>
  </AppLayout>
);

export default LocalShops;
