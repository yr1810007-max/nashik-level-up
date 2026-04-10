import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, RotateCcw, Monitor, Code, Cpu, Zap, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── static simulation data keyed by course title keywords ── */
const simulationData: Record<string, {
  circuitComponents: { name: string; x: number; y: number; icon: string; color: string }[];
  connections: string[];
  code: string;
  outputs: string[];
}> = {
  "led": {
    circuitComponents: [
      { name: "ESP32", x: 20, y: 40, icon: "cpu", color: "hsl(var(--primary))" },
      { name: "LED", x: 65, y: 25, icon: "circle", color: "hsl(var(--xp))" },
      { name: "220Ω Resistor", x: 65, y: 55, icon: "zap", color: "hsl(var(--secondary))" },
      { name: "Breadboard", x: 42, y: 75, icon: "monitor", color: "hsl(var(--muted-foreground))" },
    ],
    connections: [
      "ESP32 GPIO2 → 220Ω Resistor → LED Anode",
      "LED Cathode → GND",
    ],
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
      "LED: ON  💡",
      "LED: OFF 🔴",
    ],
  },
  "dht11": {
    circuitComponents: [
      { name: "ESP32", x: 20, y: 40, icon: "cpu", color: "hsl(var(--primary))" },
      { name: "DHT11 Sensor", x: 65, y: 30, icon: "circle", color: "hsl(var(--success))" },
      { name: "10kΩ Resistor", x: 65, y: 60, icon: "zap", color: "hsl(var(--secondary))" },
      { name: "Breadboard", x: 42, y: 75, icon: "monitor", color: "hsl(var(--muted-foreground))" },
    ],
    connections: [
      "DHT11 VCC → 3.3V",
      "DHT11 DATA → GPIO4 (with 10kΩ pull-up)",
      "DHT11 GND → GND",
    ],
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
      "Temp: 28.8°C | Humidity: 65%",
    ],
  },
  "irrigation": {
    circuitComponents: [
      { name: "ESP32", x: 15, y: 40, icon: "cpu", color: "hsl(var(--primary))" },
      { name: "Soil Moisture", x: 55, y: 20, icon: "circle", color: "hsl(var(--success))" },
      { name: "Relay Module", x: 55, y: 50, icon: "zap", color: "hsl(var(--warning))" },
      { name: "Water Pump", x: 80, y: 50, icon: "circle", color: "hsl(var(--secondary))" },
      { name: "Breadboard", x: 42, y: 78, icon: "monitor", color: "hsl(var(--muted-foreground))" },
    ],
    connections: [
      "Soil Sensor AO → GPIO34",
      "Relay IN → GPIO5",
      "Relay → Water Pump",
    ],
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
      "Soil Moisture: 350",
      "✅ Soil is moist enough",
    ],
  },
  "crop": {
    circuitComponents: [
      { name: "ESP32", x: 15, y: 40, icon: "cpu", color: "hsl(var(--primary))" },
      { name: "DHT11", x: 50, y: 15, icon: "circle", color: "hsl(var(--success))" },
      { name: "Soil Sensor", x: 50, y: 45, icon: "circle", color: "hsl(var(--xp))" },
      { name: "LDR", x: 50, y: 70, icon: "circle", color: "hsl(var(--warning))" },
      { name: "LCD Display", x: 82, y: 40, icon: "monitor", color: "hsl(var(--secondary))" },
    ],
    connections: [
      "DHT11 → GPIO4",
      "Soil Sensor → GPIO34",
      "LDR → GPIO35",
      "LCD SDA → GPIO21, SCL → GPIO22",
    ],
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
      "--- Crop Report ---",
      "Temp: 31.5°C",
      "Humidity: 57%",
      "Soil: 450 (Moderate)",
      "Light: 650 (Cloudy)",
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

const iconMap: Record<string, any> = { cpu: Cpu, circle: CircleDot, zap: Zap, monitor: Monitor };

const SimulationPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseTitle, setCourseTitle] = useState("");
  const [running, setRunning] = useState(false);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [ledState, setLedState] = useState(false);

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
    setLedState(false);

    sim.outputs.forEach((line, i) => {
      setTimeout(() => {
        setOutputLines((prev) => [...prev, line]);
        if (line.includes("ON")) setLedState(true);
        if (line.includes("OFF")) setLedState(false);
        if (i === sim.outputs.length - 1) setRunning(false);
      }, (i + 1) * 700);
    });
  };

  const handleReset = () => {
    setRunning(false);
    setOutputLines([]);
    setLedState(false);
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
              <Play className="h-4 w-4" /> {running ? "Running..." : "Run Simulation"}
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <h1 className="text-xl font-bold text-foreground">🧪 Simulation: {courseTitle}</h1>

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT — Circuit View */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Circuit Layout
            </h2>

            {/* Visual circuit area */}
            <div className="relative bg-muted/30 rounded-xl border border-border h-64 overflow-hidden">
              {sim.circuitComponents.map((comp, i) => {
                const Icon = iconMap[comp.icon] || CircleDot;
                const isLed = comp.name === "LED";
                return (
                  <div
                    key={i}
                    className="absolute flex flex-col items-center gap-1 transition-all duration-300"
                    style={{ left: `${comp.x}%`, top: `${comp.y}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                        isLed && ledState ? "shadow-[0_0_20px_hsl(var(--xp))] scale-110" : ""
                      )}
                      style={{ borderColor: comp.color, backgroundColor: isLed && ledState ? comp.color : "hsl(var(--card))" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: isLed && ledState ? "hsl(var(--card))" : comp.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">{comp.name}</span>
                  </div>
                );
              })}

              {/* connection lines hint */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {sim.circuitComponents.length >= 2 && sim.circuitComponents.slice(1).map((comp, i) => (
                  <line
                    key={i}
                    x1={`${sim.circuitComponents[0].x}%`} y1={`${sim.circuitComponents[0].y}%`}
                    x2={`${comp.x}%`} y2={`${comp.y}%`}
                    stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="6 3"
                    className={cn(running ? "animate-pulse" : "")}
                  />
                ))}
              </svg>
            </div>

            {/* Connections list */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground">Connections:</p>
              {sim.connections.map((c, i) => (
                <p key={i} className="text-xs text-foreground/80 font-mono">• {c}</p>
              ))}
            </div>
          </div>

          {/* RIGHT — Code + Output */}
          <div className="space-y-4">
            {/* Code Editor */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Code className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Code</span>
                <span className="text-[10px] text-muted-foreground ml-auto font-mono">main.ino</span>
              </div>
              <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto max-h-64 leading-relaxed">
                <code>{sim.code}</code>
              </pre>
            </div>

            {/* Output Console */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Monitor className="h-4 w-4 text-success" />
                <span className="text-xs font-bold text-foreground">Serial Monitor</span>
                {running && <span className="ml-auto text-[10px] text-success animate-pulse font-semibold">● LIVE</span>}
              </div>
              <div className="p-4 font-mono text-xs min-h-[120px] max-h-48 overflow-y-auto bg-background/50 space-y-0.5">
                {outputLines.length === 0 ? (
                  <p className="text-muted-foreground italic">Click "Run Simulation" to see output...</p>
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
        </div>
      </div>
    </AppLayout>
  );
};

export default SimulationPage;
