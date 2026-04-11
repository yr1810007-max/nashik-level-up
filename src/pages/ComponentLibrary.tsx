import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Cpu, Zap, CircuitBoard, Radio, Lightbulb, Cog, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ComponentItem {
  name: string;
  category: string;
  subcategory: string;
  explanation: string;
  specs: string[];
  realWorldUse: string;
  image: string;
}

const categories = [
  { name: "Active Components", icon: Zap, color: "text-yellow-500" },
  { name: "Passive Components", icon: CircuitBoard, color: "text-blue-500" },
  { name: "Computing & Control Units", icon: Cpu, color: "text-green-500" },
  { name: "Electrochemical & Output Devices", icon: Lightbulb, color: "text-orange-500" },
  { name: "Communication & Connectivity", icon: Radio, color: "text-purple-500" },
  { name: "Specialized Processing Logic", icon: Cog, color: "text-red-500" },
];

const components: ComponentItem[] = [
  // Active Components
  {
    name: "LED (Light Emitting Diode)",
    category: "Active Components",
    subcategory: "Optoelectronics",
    explanation: "A tiny light that glows when electricity flows through it. Like a mini bulb but way more efficient!",
    specs: ["Forward Voltage: 1.8-3.3V", "Current: 20mA typical", "Colors: Red, Green, Blue, White"],
    realWorldUse: "Traffic lights, phone screens, TV backlights, indicator lights on every gadget you own.",
    image: "https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=300&h=200&fit=crop",
  },
  {
    name: "Transistor (NPN/PNP)",
    category: "Active Components",
    subcategory: "Semiconductors",
    explanation: "A tiny electronic switch that can also amplify signals. Think of it as a gate that controls current flow.",
    specs: ["Types: NPN (BC547), PNP (BC557)", "Max Current: ~100mA", "Gain: 100-800 hFE"],
    realWorldUse: "Every computer chip has billions of these. Used in amplifiers, switches, and digital logic.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop",
  },
  {
    name: "Diode (1N4007)",
    category: "Active Components",
    subcategory: "Rectifiers",
    explanation: "A one-way valve for electricity. Current flows in only one direction — great for protection!",
    specs: ["Max Voltage: 1000V", "Max Current: 1A", "Forward Drop: 0.7V"],
    realWorldUse: "Power supplies, battery chargers, voltage protection in circuits.",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=300&h=200&fit=crop",
  },
  // Passive Components
  {
    name: "Resistor",
    category: "Passive Components",
    subcategory: "Fixed Resistors",
    explanation: "Controls how much current flows through a circuit — like a speed bump for electricity.",
    specs: ["Range: 1Ω - 10MΩ", "Power: 0.25W typical", "Tolerance: ±5%"],
    realWorldUse: "LED current limiting, voltage dividers, pull-up/pull-down in microcontroller circuits.",
    image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=300&h=200&fit=crop",
  },
  {
    name: "Capacitor",
    category: "Passive Components",
    subcategory: "Energy Storage",
    explanation: "Stores small amounts of energy and releases it quickly. Like a tiny rechargeable battery for smoothing power.",
    specs: ["Types: Ceramic, Electrolytic", "Range: 1pF - 10000µF", "Voltage: 5V - 50V"],
    realWorldUse: "Power supply filtering, timing circuits, touch sensors, camera flashes.",
    image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=300&h=200&fit=crop",
  },
  {
    name: "Potentiometer",
    category: "Passive Components",
    subcategory: "Variable Resistors",
    explanation: "A resistor with a knob! Turn it to change resistance — perfect for volume controls.",
    specs: ["Range: 1KΩ - 1MΩ", "Rotation: 270°", "Type: Linear/Logarithmic"],
    realWorldUse: "Volume knobs, brightness controls, joystick inputs, tuning circuits.",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=300&h=200&fit=crop",
  },
  // Computing & Control Units
  {
    name: "Arduino Uno",
    category: "Computing & Control Units",
    subcategory: "Microcontrollers",
    explanation: "A beginner-friendly brain for your projects. Write code, upload it, and it controls LEDs, motors, sensors!",
    specs: ["Chip: ATmega328P", "Digital Pins: 14", "Analog Pins: 6", "Clock: 16MHz"],
    realWorldUse: "Robotics, home automation, weather stations, art installations, prototyping.",
    image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=300&h=200&fit=crop",
  },
  {
    name: "ESP32",
    category: "Computing & Control Units",
    subcategory: "WiFi Microcontrollers",
    explanation: "Arduino's cooler cousin with built-in WiFi and Bluetooth. Perfect for IoT projects!",
    specs: ["Dual-core 240MHz", "WiFi + Bluetooth", "34 GPIO pins", "512KB RAM"],
    realWorldUse: "Smart home devices, IoT sensors, web servers, Bluetooth gadgets, remote monitoring.",
    image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=300&h=200&fit=crop",
  },
  {
    name: "Raspberry Pi",
    category: "Computing & Control Units",
    subcategory: "Single Board Computers",
    explanation: "A full mini-computer the size of a credit card! Runs Linux, Python, and more.",
    specs: ["ARM CPU up to 1.8GHz", "Up to 8GB RAM", "HDMI, USB, GPIO", "MicroSD storage"],
    realWorldUse: "Media centers, retro gaming, AI projects, network servers, robotics.",
    image: "https://images.unsplash.com/photo-1629292400373-4e6e1c926dea?w=300&h=200&fit=crop",
  },
  // Electrochemical & Output Devices
  {
    name: "DHT11 Temperature Sensor",
    category: "Electrochemical & Output Devices",
    subcategory: "Environmental Sensors",
    explanation: "Measures temperature and humidity in one small package. Your personal weather station sensor!",
    specs: ["Temp Range: 0-50°C", "Humidity: 20-90%", "Accuracy: ±2°C", "Digital output"],
    realWorldUse: "Weather stations, greenhouse monitoring, HVAC systems, smart home climate control.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop",
  },
  {
    name: "Soil Moisture Sensor",
    category: "Electrochemical & Output Devices",
    subcategory: "Agricultural Sensors",
    explanation: "Detects how wet or dry the soil is. Perfect for auto-watering your plants!",
    specs: ["Output: Analog/Digital", "Voltage: 3.3-5V", "Probe: Corrosion-resistant"],
    realWorldUse: "Smart irrigation, garden automation, agricultural monitoring, plant care systems.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop",
  },
  {
    name: "Servo Motor",
    category: "Electrochemical & Output Devices",
    subcategory: "Actuators",
    explanation: "A motor that rotates to a precise angle. Perfect for robot arms and door locks!",
    specs: ["Rotation: 0-180°", "Torque: 1.5-2 kg/cm", "Voltage: 5V", "PWM control"],
    realWorldUse: "Robotic arms, RC vehicles, door locks, camera pan/tilt, animatronics.",
    image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=300&h=200&fit=crop",
  },
  {
    name: "Buzzer",
    category: "Electrochemical & Output Devices",
    subcategory: "Audio Output",
    explanation: "Makes beeping sounds when powered. Use it for alarms, notifications, or playing simple melodies!",
    specs: ["Types: Active/Passive", "Voltage: 3-5V", "Frequency: 2-4 kHz", "Output: 85dB"],
    realWorldUse: "Alarm systems, timer buzzers, doorbells, game sound effects, notification alerts.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop",
  },
  // Communication & Connectivity
  {
    name: "HC-05 Bluetooth Module",
    category: "Communication & Connectivity",
    subcategory: "Bluetooth",
    explanation: "Adds Bluetooth to your project! Control things from your phone wirelessly.",
    specs: ["Bluetooth 2.0", "Range: ~10m", "Baud: 9600-115200", "Master/Slave mode"],
    realWorldUse: "Phone-controlled robots, wireless data logging, Bluetooth speakers, smart locks.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop",
  },
  {
    name: "nRF24L01 Radio Module",
    category: "Communication & Connectivity",
    subcategory: "RF Communication",
    explanation: "Lets two Arduinos talk to each other wirelessly over radio waves. Like walkie-talkies for circuits!",
    specs: ["Frequency: 2.4GHz", "Range: 100m+", "Data Rate: 250kbps-2Mbps", "Low power"],
    realWorldUse: "Wireless sensor networks, drone control, remote controls, mesh networks.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop",
  },
  // Specialized Processing Logic
  {
    name: "Shift Register (74HC595)",
    category: "Specialized Processing Logic",
    subcategory: "Logic ICs",
    explanation: "Gives you extra output pins! Control 8 LEDs using just 3 Arduino pins.",
    specs: ["Outputs: 8", "Voltage: 2-6V", "Speed: 100MHz", "Cascadable"],
    realWorldUse: "LED matrix displays, 7-segment displays, extending GPIO, light shows.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop",
  },
  {
    name: "555 Timer IC",
    category: "Specialized Processing Logic",
    subcategory: "Timer/Oscillator",
    explanation: "A classic chip that generates precise timing signals. The Swiss Army knife of electronics!",
    specs: ["Modes: Astable, Monostable, Bistable", "Voltage: 4.5-15V", "Frequency: up to 500kHz"],
    realWorldUse: "LED flashers, tone generators, PWM controllers, debounce circuits, pulse generators.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop",
  },
  {
    name: "Logic Gates (AND, OR, NOT)",
    category: "Specialized Processing Logic",
    subcategory: "Digital Logic",
    explanation: "Basic building blocks of all digital circuits. They make decisions with 1s and 0s!",
    specs: ["Types: AND, OR, NOT, NAND, XOR", "Voltage: 3.3-5V", "ICs: 7408, 7432, 7404"],
    realWorldUse: "Combinational logic, alarm systems, digital locks, arithmetic circuits, state machines.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop",
  },
];

const ComponentLibrary = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<ComponentItem | null>(null);

  const filtered = components.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subcategory.toLowerCase().includes(search.toLowerCase()) ||
      c.explanation.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = categories
    .map((cat) => ({
      ...cat,
      items: filtered.filter((c) => c.category === cat.name),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">🧩 Component Library</h1>
          <p className="text-muted-foreground mt-1">Explore hardware components used in IoT projects</p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedCategory === null ? "default" : "secondary"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.name}
                variant={selectedCategory === cat.name ? "default" : "secondary"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              >
                <cat.icon className="h-3 w-3 mr-1" />
                {cat.name.split(" ").slice(0, 2).join(" ")}
              </Badge>
            ))}
          </div>
        </div>

        {/* Component groups */}
        {grouped.map((group) => (
          <div key={group.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <group.icon className={cn("h-5 w-5", group.color)} />
              <h2 className="text-lg font-bold text-foreground">{group.name}</h2>
              <Badge variant="outline" className="text-xs">{group.items.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((comp) => (
                <div
                  key={comp.name}
                  onClick={() => setExpandedComponent(comp)}
                  className="bg-card rounded-2xl border border-border shadow-card p-4 space-y-3 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <img
                      src={comp.image}
                      alt={comp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{comp.name}</h3>
                    <Badge variant="secondary" className="text-[10px] mt-1">{comp.subcategory}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{comp.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No components found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}

        {/* Expanded view dialog */}
        <Dialog open={!!expandedComponent} onOpenChange={() => setExpandedComponent(null)}>
          <DialogContent className="max-w-lg">
            {expandedComponent && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg">{expandedComponent.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <img src={expandedComponent.image} alt={expandedComponent.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Badge>{expandedComponent.category.split(" ").slice(0, 2).join(" ")}</Badge>
                    <Badge variant="secondary">{expandedComponent.subcategory}</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">💡 What is it?</h4>
                    <p className="text-sm text-muted-foreground">{expandedComponent.explanation}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">⚙️ Key Specs</h4>
                    <ul className="space-y-1">
                      {expandedComponent.specs.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">🌍 Real-World Use</h4>
                    <p className="text-sm text-muted-foreground">{expandedComponent.realWorldUse}</p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ComponentLibrary;
