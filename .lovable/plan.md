

## Plan: Integrate Circuit Lab Simulation into SkillQuest IoT

### Summary
Replace the current basic `SimulationPage.tsx` with a full interactive circuit lab (based on the uploaded HTML) that lets users drag-and-drop components, wire them together, and run a real circuit simulation. The "Start Simulation" button in each course will open this new lab, pre-loaded with a demo circuit relevant to that course.

### What changes

**1. Rewrite `SimulationPage.tsx`**
- Convert the uploaded HTML/CSS/JS circuit lab into a React component
- Port all component definitions (Battery, Ground, Resistor, Capacitor, LED red/green/blue, Buzzer, Switch, Button, Arduino Uno, 555 Timer) as a TypeScript data structure
- Implement the SVG-based canvas with dot-grid background using React refs and direct DOM manipulation (the simulation logic relies on imperative SVG updates for performance)
- Port toolbar (Select, Wire, Delete, Clear, Demo Circuit, Run/Stop) as React buttons
- Port the left sidebar component palette (Power, Passive, Output, Input, IC categories)
- Port the right properties panel showing selected component details with editable inputs
- Port the simulation engine (union-find circuit solver, DFS path finding, current/voltage calculation)
- Port drag-and-drop, wire drawing, and component placement logic via SVG mouse event handlers
- Add course-specific demo circuits: each course loads a pre-built circuit (e.g., LED course → battery + resistor + LED + ground; DHT11 → Arduino + sensor layout)
- Keep the existing header with "Back to Course" link and course title
- Add a status bar at the bottom showing tool state, component/wire count, and simulation status
- Style using Tailwind classes for the outer shell; inline styles for SVG internals (matching the uploaded design)

**2. Course-specific demo presets**
- LED Blinking → Battery + Switch + Resistor + Red LED + Ground (pre-wired)
- DHT11 → Arduino Uno + wired sensor representation
- Irrigation → Arduino + Switch (relay) + LED (pump indicator)
- Crop Monitoring → Arduino + multiple LED indicators for sensors

**3. No changes to existing pages**
- `CourseDetail.tsx` already has a "Start Simulation" button linking to `/courses/:courseId/simulation` — no modification needed
- `App.tsx` routing already configured — no modification needed

### Technical details

The uploaded HTML is a self-contained ~550-line circuit simulator with:
- **Component definitions** (`CDEFS`): 12 component types with SVG draw functions, pin definitions, and default properties
- **Simulation engine**: Union-Find for net connectivity + DFS to trace current paths from battery through components to ground, calculating current (I = V/R) and component states (LED lit, buzzer active)
- **Interaction**: Three tools (Select/drag, Wire drawing with manhattan routing, Delete) + component placement from sidebar
- **Properties panel**: Live-editable values (voltage, resistance, capacitance) + switch/button toggle

The React port will use `useRef` for the SVG element, `useState` for component/wire arrays and tool state, and `useCallback` for event handlers. The simulation engine functions will be extracted as pure utility functions.

