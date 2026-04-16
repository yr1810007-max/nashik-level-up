import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Play, RotateCcw, ChevronRight, Cpu, Zap, CircleDot,
  Monitor, Code, Lightbulb, BookOpen, MousePointer, Move, Plus,
  Clock, Star, Video, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Static workspace data per course keyword ── */
interface WorkspaceData {
  steps: { title: string; description: string; hint: string }[];
  learnContent: { title: string; body: string }[];
  components: { name: string; icon: string; color: string }[];
  circuitComponents: { name: string; x: number; y: number; icon: string; color: string }[];
  connections: string[];
  code: string;
  outputs: string[];
  timeEstimate: string;
}

const workspaceDataMap: Record<string, WorkspaceData> = {
  led: {
    steps: [
      { title: "Add ESP32 to Breadboard", description: "Place the ESP32 development board firmly onto the breadboard, making sure pins sit in different rows.", hint: "The ESP32 should straddle the center gap of the breadboard." },
      { title: "Connect the Resistor", description: "Connect a 220Ω resistor from GPIO2 row to an empty row. This limits current to protect the LED.", hint: "Resistors don't have polarity — either direction works." },
      { title: "Place the LED", description: "Insert the LED with the longer leg (anode) connected to the resistor row and the shorter leg (cathode) to the GND rail.", hint: "Remember: Long leg = positive, Short leg = negative." },
      { title: "Wire GND", description: "Use a jumper wire to connect the ESP32 GND pin to the breadboard's ground rail.", hint: "Any GND pin on the ESP32 will work." },
      { title: "Upload the Code", description: "Connect the ESP32 via USB, open Arduino IDE, paste the code and click Upload.", hint: "Make sure you've selected the correct board and port in Tools menu." },
      { title: "Test & Observe", description: "After uploading, the LED should blink ON and OFF every second. Watch the Serial Monitor for output.", hint: "Open Serial Monitor at 115200 baud rate." },
    ],
    learnContent: [
      { title: "What is an LED?", body: "An LED (Light Emitting Diode) is a semiconductor that emits light when current flows through it. LEDs have polarity — current must flow from anode (+) to cathode (-)." },
      { title: "Why use a Resistor?", body: "Without a resistor, too much current would flow through the LED, burning it out. A 220Ω resistor limits current to a safe ~15mA." },
      { title: "ESP32 GPIO Pins", body: "GPIO (General Purpose Input/Output) pins can be configured as either input or output. In this project, GPIO2 is set as OUTPUT to control the LED." },
      { title: "The delay() Function", body: "delay(1000) pauses execution for 1000 milliseconds (1 second). This creates the blinking effect by alternating between HIGH and LOW states." },
    ],
    components: [
      { name: "ESP32", icon: "cpu", color: "hsl(var(--primary))" },
      { name: "LED", icon: "circle", color: "hsl(var(--xp))" },
      { name: "220Ω Resistor", icon: "zap", color: "hsl(var(--secondary))" },
      { name: "Breadboard", icon: "monitor", color: "hsl(var(--muted-foreground))" },
      { name: "USB Cable", icon: "zap", color: "hsl(var(--accent-foreground))" },
      { name: "Jumper Wires", icon: "zap", color: "hsl(var(--primary))" },
    ],
    circuitComponents: [
      { name: "ESP32", x: 20, y: 40, icon: "cpu", color: "hsl(var(--primary))" },
      { name: "LED", x: 65, y: 25, icon: "circle", color: "hsl(var(--xp))" },
      { name: "220Ω Resistor", x: 65, y: 55, icon: "zap", color: "hsl(var(--secondary))" },
      { name: "Breadboard", x: 42, y: 78, icon: "monitor", color: "hsl(var(--muted-foreground))" },
    ],
    connections: ["ESP32 GPIO2 → 220Ω Resistor → LED Anode", "LED Cathode → GND"],
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
    ],
    timeEstimate: "~5 min",
  },
  dht11: {
    steps: [
      { title: "Place ESP32 on Breadboard", description: "Securely position the ESP32 on the breadboard.", hint: "Ensure all pins are inserted properly." },
      { title: "Connect DHT11 Sensor", description: "Connect VCC to 3.3V, DATA to GPIO4, and GND to ground.", hint: "The DHT11 has 3 or 4 pins. If 4 pins, leave the 3rd pin unconnected." },
      { title: "Add Pull-up Resistor", description: "Add a 10kΩ resistor between the DATA pin and VCC (3.3V).", hint: "The pull-up ensures stable data signal." },
      { title: "Install DHT Library", description: "In Arduino IDE, go to Library Manager and install the 'DHT sensor library'.", hint: "Also install 'Adafruit Unified Sensor' if prompted." },
      { title: "Upload & Monitor", description: "Upload the code and open Serial Monitor to see temperature and humidity readings.", hint: "Readings update every 2 seconds." },
    ],
    learnContent: [
      { title: "What is DHT11?", body: "DHT11 is a basic, low-cost digital sensor that measures temperature (0-50°C) and humidity (20-90%). It uses a single wire protocol for data communication." },
      { title: "Pull-up Resistors", body: "A pull-up resistor keeps the data line HIGH when no signal is being sent. This prevents random noise from being read as data." },
      { title: "Reading Sensor Data", body: "The ESP32 sends a start signal, then the DHT11 responds with 40 bits of data containing humidity and temperature values." },
    ],
    components: [
      { name: "ESP32", icon: "cpu", color: "hsl(var(--primary))" },
      { name: "DHT11 Sensor", icon: "circle", color: "hsl(var(--success))" },
      { name: "10kΩ Resistor", icon: "zap", color: "hsl(var(--secondary))" },
      { name: "Breadboard", icon: "monitor", color: "hsl(var(--muted-foreground))" },
      { name: "Jumper Wires", icon: "zap", color: "hsl(var(--primary))" },
    ],
    circuitComponents: [
      { name: "ESP32", x: 20, y: 40, icon: "cpu", color: "hsl(var(--primary))" },
      { name: "DHT11", x: 65, y: 30, icon: "circle", color: "hsl(var(--success))" },
      { name: "10kΩ Resistor", x: 65, y: 60, icon: "zap", color: "hsl(var(--secondary))" },
      { name: "Breadboard", x: 42, y: 78, icon: "monitor", color: "hsl(var(--muted-foreground))" },
    ],
    connections: ["DHT11 VCC → 3.3V", "DHT11 DATA → GPIO4 (with 10kΩ pull-up)", "DHT11 GND → GND"],
    code: `// DHT11 Sensor - ESP32
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
    timeEstimate: "~8 min",
  },
  irrigation: {
    steps: [
      { title: "Set Up ESP32", description: "Place the ESP32 on the breadboard and connect power.", hint: "Use a USB cable for power." },
      { title: "Connect Soil Moisture Sensor", description: "Connect the analog output (AO) of the soil sensor to GPIO34.", hint: "GPIO34 is an input-only ADC pin." },
      { title: "Wire Relay Module", description: "Connect the relay module's IN pin to GPIO5 and power it with 5V.", hint: "The relay controls the water pump ON/OFF." },
      { title: "Connect Water Pump", description: "Wire the water pump through the relay's NO (normally open) terminal.", hint: "Use an external power source for the pump if needed." },
      { title: "Upload & Test", description: "Upload the code. Dry soil triggers the pump; wet soil keeps it off.", hint: "Test with a glass of water to verify sensor readings." },
    ],
    learnContent: [
      { title: "Soil Moisture Sensor", body: "This sensor measures the volumetric water content in soil. It outputs an analog value — higher values mean drier soil." },
      { title: "Relay Module", body: "A relay is an electrically operated switch. It allows a low-power ESP32 pin to control a high-power device like a water pump." },
      { title: "Threshold Logic", body: "We set a threshold value (e.g., 500). If moisture reading exceeds it (dry), we turn the pump ON. Below it (moist), pump stays OFF." },
    ],
    components: [
      { name: "ESP32", icon: "cpu", color: "hsl(var(--primary))" },
      { name: "Soil Moisture Sensor", icon: "circle", color: "hsl(var(--success))" },
      { name: "Relay Module", icon: "zap", color: "hsl(var(--warning))" },
      { name: "Water Pump", icon: "circle", color: "hsl(var(--secondary))" },
      { name: "Breadboard", icon: "monitor", color: "hsl(var(--muted-foreground))" },
    ],
    circuitComponents: [
      { name: "ESP32", x: 15, y: 40, icon: "cpu", color: "hsl(var(--primary))" },
      { name: "Soil Sensor", x: 55, y: 20, icon: "circle", color: "hsl(var(--success))" },
      { name: "Relay", x: 55, y: 50, icon: "zap", color: "hsl(var(--warning))" },
      { name: "Pump", x: 82, y: 50, icon: "circle", color: "hsl(var(--secondary))" },
      { name: "Breadboard", x: 42, y: 78, icon: "monitor", color: "hsl(var(--muted-foreground))" },
    ],
    connections: ["Soil AO → GPIO34", "Relay IN → GPIO5", "Relay → Pump"],
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
    timeEstimate: "~10 min",
  },
  crop: {
    steps: [
      { title: "Set Up ESP32", description: "Place the ESP32 on the breadboard.", hint: "Ensure stable power connection." },
      { title: "Connect DHT11", description: "Wire DHT11 to GPIO4 for temperature/humidity monitoring.", hint: "Add a 10kΩ pull-up on the DATA line." },
      { title: "Connect Soil Sensor", description: "Wire the soil moisture sensor to GPIO34.", hint: "Use the analog output (AO) pin." },
      { title: "Connect LDR", description: "Wire the LDR module to GPIO35 for light level detection.", hint: "Higher readings = brighter light." },
      { title: "Connect LCD Display", description: "Wire the I2C LCD: SDA to GPIO21, SCL to GPIO22.", hint: "Make sure the I2C address matches (usually 0x27)." },
      { title: "Upload & Monitor", description: "Upload the code and watch all sensor values update on Serial Monitor.", hint: "All values update every 5 seconds." },
    ],
    learnContent: [
      { title: "Multi-Sensor Systems", body: "Crop monitoring combines multiple sensors to build a complete picture of growing conditions — temperature, humidity, soil moisture, and light." },
      { title: "I2C Communication", body: "I2C (Inter-Integrated Circuit) uses just 2 wires (SDA, SCL) to communicate with multiple devices. The LCD display uses this protocol." },
      { title: "Data-Driven Farming", body: "By continuously monitoring conditions, farmers can make informed decisions about watering, shade, and harvesting — this is the foundation of precision agriculture." },
    ],
    components: [
      { name: "ESP32", icon: "cpu", color: "hsl(var(--primary))" },
      { name: "DHT11", icon: "circle", color: "hsl(var(--success))" },
      { name: "Soil Sensor", icon: "circle", color: "hsl(var(--xp))" },
      { name: "LDR Module", icon: "circle", color: "hsl(var(--warning))" },
      { name: "LCD Display", icon: "monitor", color: "hsl(var(--secondary))" },
    ],
    circuitComponents: [
      { name: "ESP32", x: 15, y: 40, icon: "cpu", color: "hsl(var(--primary))" },
      { name: "DHT11", x: 50, y: 15, icon: "circle", color: "hsl(var(--success))" },
      { name: "Soil Sensor", x: 50, y: 45, icon: "circle", color: "hsl(var(--xp))" },
      { name: "LDR", x: 50, y: 72, icon: "circle", color: "hsl(var(--warning))" },
      { name: "LCD", x: 82, y: 40, icon: "monitor", color: "hsl(var(--secondary))" },
    ],
    connections: ["DHT11 → GPIO4", "Soil Sensor → GPIO34", "LDR → GPIO35", "LCD SDA → GPIO21, SCL → GPIO22"],
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
    timeEstimate: "~12 min",
  },
};

function getWorkspaceData(title: string): WorkspaceData {
  const t = title.toLowerCase();
  if (t.includes("led")) return workspaceDataMap["led"];
  if (t.includes("dht")) return workspaceDataMap["dht11"];
  if (t.includes("irrigation")) return workspaceDataMap["irrigation"];
  return workspaceDataMap["crop"];
}

/* ── Video URLs per course keyword ── */
const courseVideoMap: Record<string, { url: string; title: string; description: string }> = {
  led: {
    url: "https://www.youtube.com/embed/wIViXNYvjNk",
    title: "LED Blinking Tutorial",
    description: "Watch this step-by-step tutorial to understand how to blink an LED using ESP32. Follow along with the simulation on the right panel.",
  },
};

function getCourseVideo(title: string) {
  const t = title.toLowerCase();
  if (t.includes("led")) return courseVideoMap["led"];
  return null;
}

const iconMap: Record<string, any> = { cpu: Cpu, circle: CircleDot, zap: Zap, monitor: Monitor };

const LearningWorkspace = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseTitle, setCourseTitle] = useState("");
  const [courseXP, setCourseXP] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [ledState, setLedState] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [activeTool, setActiveTool] = useState<string>("select");

  useEffect(() => {
    if (!courseId) return;
    supabase.from("courses").select("title, xp_reward").eq("id", courseId).single().then(({ data }) => {
      if (data) {
        setCourseTitle(data.title);
        setCourseXP(data.xp_reward);
      }
    });
  }, [courseId]);

  const ws = courseTitle ? getWorkspaceData(courseTitle) : null;

  const handleRun = () => {
    if (!ws) return;
    setRunning(true);
    setOutputLines([]);
    setLedState(false);
    ws.outputs.forEach((line, i) => {
      setTimeout(() => {
        setOutputLines((prev) => [...prev, line]);
        if (line.includes("ON")) setLedState(true);
        if (line.includes("OFF")) setLedState(false);
        if (i === ws.outputs.length - 1) setRunning(false);
      }, (i + 1) * 700);
    });
  };

  const handleReset = () => {
    setRunning(false);
    setOutputLines([]);
    setLedState(false);
  };

  if (!ws) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  const stepProgress = ((currentStep + 1) / ws.steps.length) * 100;

  return (
    <AppLayout>
      <div className="space-y-3 pb-20 md:pb-0">
        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Course
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-xp font-bold"><Star className="h-4 w-4" /> {courseXP} XP</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /> {ws.timeEstimate}</span>
          </div>
        </div>

        {/* Course Title + Progress */}
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-foreground">🧪 {courseTitle}</h1>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${stepProgress}%` }} />
            </div>
            <span className="text-xs font-semibold text-primary">{currentStep + 1}/{ws.steps.length}</span>
          </div>
        </div>

        {/* Required Components */}
        <div className="flex flex-wrap gap-2">
          {ws.components.map((comp, i) => {
            const Icon = iconMap[comp.icon] || CircleDot;
            return (
              <Badge key={i} variant="outline" className="gap-1.5 py-1 px-2.5">
                <Icon className="h-3 w-3" style={{ color: comp.color }} />
                {comp.name}
              </Badge>
            );
          })}
        </div>

        {/* Main Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT — Learning Panel */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <Tabs defaultValue="steps" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 px-2">
                <TabsTrigger value="steps" className="gap-1.5 text-xs"><ChevronRight className="h-3 w-3" /> Steps</TabsTrigger>
                <TabsTrigger value="hints" className="gap-1.5 text-xs"><Lightbulb className="h-3 w-3" /> Hints</TabsTrigger>
                <TabsTrigger value="learn" className="gap-1.5 text-xs"><BookOpen className="h-3 w-3" /> Learn</TabsTrigger>
                <TabsTrigger value="video" className="gap-1.5 text-xs"><Video className="h-3 w-3" /> Video</TabsTrigger>
              </TabsList>

              {/* Steps Tab */}
              <TabsContent value="steps" className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[500px]">
                {ws.steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      i === currentStep
                        ? "border-primary bg-primary/5 shadow-sm"
                        : i < currentStep
                        ? "border-success/30 bg-success/5 opacity-70"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2",
                        i === currentStep ? "bg-primary text-primary-foreground border-primary" :
                        i < currentStep ? "bg-success text-primary-foreground border-success" :
                        "bg-muted border-border text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                      <div>
                        <p className={cn("font-semibold text-sm", i === currentStep ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
                        {i === currentStep && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep((s) => s - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    disabled={currentStep === ws.steps.length - 1}
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="gap-1"
                  >
                    Next Step <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </TabsContent>

              {/* Hints Tab */}
              <TabsContent value="hints" className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[500px]">
                <div className="space-y-3">
                  {ws.steps.map((step, i) => (
                    <div key={i} className={cn("p-3 rounded-xl border", i === currentStep ? "border-warning/50 bg-warning/5" : "border-border")}>
                      <p className="text-xs font-bold text-muted-foreground mb-1">Step {i + 1}: {step.title}</p>
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground/80">{step.hint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Learn Tab */}
              <TabsContent value="learn" className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[500px]">
                {ws.learnContent.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </TabsContent>

              {/* Video Tab */}
              <TabsContent value="video" className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px]">
                {(() => {
                  const video = courseTitle ? getCourseVideo(courseTitle) : null;
                  if (video) {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-bold text-foreground">Watch Tutorial</h3>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-border">
                          <iframe
                            width="100%"
                            height="300"
                            src={video.url}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full aspect-video"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{video.description}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => window.open(video.url.replace("/embed/", "/watch?v="), "_blank", "noopener,noreferrer")}
                        >
                          Open in YouTube <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                      <Video className="h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm font-semibold text-muted-foreground">Video coming soon</p>
                      <p className="text-xs text-muted-foreground/70">We're preparing a tutorial video for this course. Check back later!</p>
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT — Simulation + Code */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1.5">
              {[
                { id: "select", icon: MousePointer, label: "Select" },
                { id: "move", icon: Move, label: "Move" },
                { id: "add", icon: Plus, label: "Add" },
              ].map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => setActiveTool(tool.id)}
                >
                  <tool.icon className="h-3 w-3" /> {tool.label}
                </Button>
              ))}
              <div className="flex-1" />
              <Button size="sm" onClick={handleRun} disabled={running} className="gap-1.5 text-xs h-8">
                <Play className="h-3 w-3" /> {running ? "Running..." : "Run"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8">
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                variant={showCode ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => setShowCode(!showCode)}
              >
                <Code className="h-3 w-3" /> Code
              </Button>
            </div>

            {/* Circuit View */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-4">
              <h2 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-primary" /> Circuit Layout
              </h2>
              <div className="relative bg-muted/30 rounded-xl border border-border h-56 overflow-hidden">
                {ws.circuitComponents.map((comp, i) => {
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
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {ws.circuitComponents.slice(1).map((comp, i) => (
                    <line
                      key={i}
                      x1={`${ws.circuitComponents[0].x}%`} y1={`${ws.circuitComponents[0].y}%`}
                      x2={`${comp.x}%`} y2={`${comp.y}%`}
                      stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="6 3"
                      className={cn(running ? "animate-pulse" : "")}
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-3 space-y-0.5">
                {ws.connections.map((c, i) => (
                  <p key={i} className="text-[11px] text-foreground/70 font-mono">• {c}</p>
                ))}
              </div>
            </div>

            {/* Code Panel (toggle) */}
            {showCode && (
              <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Arduino Code</span>
                  <span className="text-[10px] text-muted-foreground ml-auto font-mono">main.ino</span>
                </div>
                <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto max-h-52 leading-relaxed">
                  <code>{ws.code}</code>
                </pre>
              </div>
            )}

            {/* Serial Monitor */}
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
                <Monitor className="h-4 w-4 text-success" />
                <span className="text-xs font-bold text-foreground">Serial Monitor</span>
                {running && <span className="ml-auto text-[10px] text-success animate-pulse font-semibold">● LIVE</span>}
              </div>
              <div className="p-4 font-mono text-xs min-h-[80px] max-h-40 overflow-y-auto bg-background/50 space-y-0.5">
                {outputLines.length === 0 ? (
                  <p className="text-muted-foreground italic">Click "Run" to see output...</p>
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

export default LearningWorkspace;
