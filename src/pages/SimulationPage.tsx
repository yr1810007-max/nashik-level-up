import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, RotateCcw, Code, Monitor, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── static simulation data keyed by course title keywords ── */
const simulationData: Record<string, {
  code: string;
  outputs: string[];
}> = {
  led: {
    code: `// LED Blinking - ESP32
#include <Arduino.h>

#define LED_PIN 2

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("LED Blink Started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED: ON  💡");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED: OFF 🔴");
  delay(1000);
}`,
    outputs: [
      "Initializing ESP32...",
      "LED Blink Started!",
      "LED: ON  💡",
      "LED: OFF 🔴",
      "LED: ON  💡",
      "LED: OFF 🔴",
    ],
  },
  dht11: {
    code: `// DHT11 Sensor Reading - ESP32
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("DHT11 Sensor Ready!");
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  Serial.print("Temp: ");
  Serial.print(t);
  Serial.print("°C | Humidity: ");
  Serial.print(h);
  Serial.println("%");
  delay(2000);
}`,
    outputs: [
      "Initializing ESP32...",
      "DHT11 Sensor Ready!",
      "Temp: 28.5°C | Humidity: 65%",
      "Temp: 28.7°C | Humidity: 64%",
      "Temp: 29.0°C | Humidity: 63%",
    ],
  },
  irrigation: {
    code: `// Smart Irrigation - ESP32
#define SOIL_PIN 34
#define RELAY_PIN 5
#define THRESHOLD 500

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  Serial.println("Smart Irrigation Ready!");
}

void loop() {
  int moisture = analogRead(SOIL_PIN);
  Serial.print("Soil Moisture: ");
  Serial.println(moisture);
  if (moisture > THRESHOLD) {
    digitalWrite(RELAY_PIN, HIGH);
    Serial.println("💧 Pump ON - Watering...");
  } else {
    digitalWrite(RELAY_PIN, LOW);
    Serial.println("✅ Soil is moist enough");
  }
  delay(3000);
}`,
    outputs: [
      "Initializing ESP32...",
      "Smart Irrigation Ready!",
      "Soil Moisture: 680",
      "💧 Pump ON - Watering...",
      "Soil Moisture: 420",
      "✅ Soil is moist enough",
    ],
  },
  crop: {
    code: `// Crop Monitoring - ESP32
#include <DHT.h>

#define DHTPIN 4
#define SOIL_PIN 34
#define LDR_PIN 35

DHT dht(DHTPIN, DHT11);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("Crop Monitor Active!");
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int soil = analogRead(SOIL_PIN);
  int light = analogRead(LDR_PIN);
  Serial.println("--- Crop Report ---");
  Serial.print("Temp: "); Serial.println(t);
  Serial.print("Humidity: "); Serial.println(h);
  Serial.print("Soil: "); Serial.println(soil);
  Serial.print("Light: "); Serial.println(light);
  delay(5000);
}`,
    outputs: [
      "Initializing ESP32...",
      "Crop Monitor Active!",
      "--- Crop Report ---",
      "Temp: 31.2°C",
      "Humidity: 58%",
      "Soil: 420 (Moist)",
      "Light: 780 (Bright)",
    ],
  },
};

function getSimData(title: string) {
  const t = title.toLowerCase();
  if (t.includes("led")) return simulationData["led"];
  if (t.includes("dht")) return simulationData["dht11"];
  if (t.includes("irrigation")) return simulationData["irrigation"];
  return simulationData["crop"];
}

const SimulationPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseTitle, setCourseTitle] = useState("");
  const [running, setRunning] = useState(false);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [labExpanded, setLabExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"lab" | "code">("lab");

  useEffect(() => {
    const load = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.from("courses").select("title").eq("id", courseId!).single();
      if (data) setCourseTitle(data.title);
    };
    load();
  }, [courseId]);

  const sim = courseTitle ? getSimData(courseTitle) : null;

  const handleRun = () => {
    if (!sim) return;
    setRunning(true);
    setOutputLines([]);
    sim.outputs.forEach((line, i) => {
      setTimeout(() => {
        setOutputLines((prev) => [...prev, line]);
        if (i === sim.outputs.length - 1) setRunning(false);
      }, (i + 1) * 700);
    });
  };

  const handleReset = () => {
    setRunning(false);
    setOutputLines([]);
  };

  if (!sim) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  /* Full-screen lab mode */
  if (labExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <h2 className="text-sm font-bold text-foreground">🔬 Circuit Lab — {courseTitle}</h2>
          <Button variant="ghost" size="sm" onClick={() => setLabExpanded(false)} className="gap-2">
            <Minimize2 className="h-4 w-4" /> Exit Fullscreen
          </Button>
        </div>
        <iframe
          src="/circuit-lab.html"
          className="flex-1 w-full border-0"
          title="Circuit Simulation Lab"
        />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Course
          </Link>
          <div className="flex gap-2">
            <Button onClick={handleRun} disabled={running} className="gap-2 font-semibold">
              <Play className="h-4 w-4" /> {running ? "Running..." : "Run Code"}
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <h1 className="text-xl font-bold text-foreground">🧪 Simulation: {courseTitle}</h1>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("lab")}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
              activeTab === "lab" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            🔬 Circuit Lab
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
              activeTab === "code" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            💻 Code & Output
          </button>
        </div>

        {/* Circuit Lab Tab */}
        {activeTab === "lab" && (
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-xs font-bold text-foreground">Interactive Circuit Lab</span>
              <Button variant="ghost" size="sm" onClick={() => setLabExpanded(true)} className="gap-1 text-xs">
                <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
              </Button>
            </div>
            <iframe
              src="/circuit-lab.html"
              className="w-full border-0"
              style={{ height: "520px" }}
              title="Circuit Simulation Lab"
            />
          </div>
        )}

        {/* Code & Output Tab */}
        {activeTab === "code" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Editor */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Code className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Arduino Code</span>
                <span className="text-[10px] text-muted-foreground ml-auto font-mono">main.ino</span>
              </div>
              <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto max-h-80 leading-relaxed">
                <code>{sim.code}</code>
              </pre>
            </div>

            {/* Serial Monitor */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Monitor className="h-4 w-4 text-success" />
                <span className="text-xs font-bold text-foreground">Serial Monitor</span>
                {running && <span className="ml-auto text-[10px] text-success animate-pulse font-semibold">● LIVE</span>}
              </div>
              <div className="p-4 font-mono text-xs min-h-[120px] max-h-80 overflow-y-auto bg-background/50 space-y-0.5">
                {outputLines.length === 0 ? (
                  <p className="text-muted-foreground italic">Click "Run Code" to see output...</p>
                ) : (
                  outputLines.map((line, i) => (
                    <p key={i} className={cn(
                      "transition-all",
                      line.includes("ON") || line.includes("Pump ON") ? "text-success font-semibold" :
                      line.includes("OFF") ? "text-destructive" : "text-foreground/80"
                    )}>
                      <span className="text-muted-foreground mr-2">&gt;</span>{line}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SimulationPage;
