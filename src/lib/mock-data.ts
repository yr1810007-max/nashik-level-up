export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  streak: number;
  badges: Badge[];
  enrolledCourses: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: "IoT" | "Agriculture" | "Technology" | "Science";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lessons: Lesson[];
  imageUrl?: string;
  totalPoints: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  completed?: boolean;
  imageUrl?: string;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  avatar?: string;
}

export interface Activity {
  id: string;
  type: "lesson_completed" | "quiz_passed" | "badge_earned" | "course_started";
  description: string;
  timestamp: string;
  points?: number;
}

export const mockUser: User = {
  id: "1",
  name: "Ravi Kumar",
  email: "ravi@example.com",
  points: 1250,
  streak: 7,
  badges: [
    { id: "b1", name: "Beginner", icon: "🌱", description: "Complete your first lesson" },
    { id: "b2", name: "IoT Explorer", icon: "📡", description: "Complete 5 IoT lessons", earnedAt: "2024-03-15" },
    { id: "b3", name: "Smart Farmer", icon: "🌾", description: "Complete the Agriculture course", earnedAt: "2024-03-20" },
  ],
  enrolledCourses: ["c1", "c2", "c3"],
};

export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "Introduction to IoT",
    description: "Learn the fundamentals of Internet of Things, sensors, and connected devices. Build smart solutions for everyday problems.",
    category: "IoT",
    difficulty: "Beginner",
    totalPoints: 500,
    lessons: [
      { id: "l1", courseId: "c1", title: "What is IoT?", content: "The Internet of Things (IoT) refers to the network of physical objects embedded with sensors, software, and connectivity that enables them to collect and exchange data.\n\nIoT devices range from simple sensors to complex industrial machinery. They communicate through various protocols like Wi-Fi, Bluetooth, and cellular networks.\n\n## Key Components\n- **Sensors**: Collect data from the environment\n- **Connectivity**: Send data to the cloud\n- **Processing**: Analyze and act on data\n- **User Interface**: Allow humans to interact with the system", order: 1, completed: true },
      { id: "l2", courseId: "c1", title: "Sensors & Actuators", content: "Sensors are the eyes and ears of IoT systems. They detect changes in the environment and convert them into electrical signals.\n\n## Common Sensors\n- **Temperature sensors**: DHT11, DHT22\n- **Motion sensors**: PIR sensors\n- **Light sensors**: LDR, photodiodes\n- **Humidity sensors**: Capacitive, resistive\n\n## Actuators\nActuators are the muscles of IoT. They convert electrical signals into physical action:\n- Motors\n- Relays\n- Solenoids\n- LEDs", order: 2, completed: true },
      { id: "l3", courseId: "c1", title: "IoT Communication Protocols", content: "IoT devices use various protocols to communicate:\n\n## Short Range\n- **Bluetooth**: Low energy, ideal for wearables\n- **Wi-Fi**: High bandwidth, common in homes\n- **Zigbee**: Low power mesh networking\n\n## Long Range\n- **LoRa**: Long range, low power\n- **Cellular (4G/5G)**: Wide coverage\n- **Satellite**: Remote areas\n\n## Application Layer\n- **MQTT**: Lightweight publish-subscribe\n- **HTTP/REST**: Web-based APIs\n- **CoAP**: Constrained Application Protocol", order: 3 },
      { id: "l4", courseId: "c1", title: "Building Your First IoT Project", content: "Let's build a simple temperature monitoring system!\n\n## Materials Needed\n- Arduino/ESP32 board\n- DHT11 temperature sensor\n- Breadboard & jumper wires\n- USB cable\n\n## Steps\n1. Connect the DHT11 sensor to the board\n2. Install the required libraries\n3. Write the code to read temperature\n4. Send data to a cloud dashboard\n5. Visualize the data\n\n## Best Practices\n- Always validate sensor readings\n- Use error handling\n- Implement data logging", order: 4 },
    ],
  },
  {
    id: "c2",
    title: "Smart Agriculture",
    description: "Discover how technology is revolutionizing farming. Learn about precision agriculture, soil monitoring, and automated irrigation.",
    category: "Agriculture",
    difficulty: "Intermediate",
    totalPoints: 750,
    lessons: [
      { id: "l5", courseId: "c2", title: "Introduction to Smart Farming", content: "Smart farming uses technology to increase crop yield and quality while reducing resource usage.\n\n## Benefits\n- Reduced water consumption by 30-50%\n- Increased crop yield by 20-30%\n- Lower pesticide usage\n- Better resource management\n\n## Technologies Used\n- IoT sensors for soil monitoring\n- Drones for crop surveillance\n- AI for pest detection\n- Automated irrigation systems", order: 1 },
      { id: "l6", courseId: "c2", title: "Soil Monitoring Systems", content: "Soil health is crucial for crop production. Smart sensors help monitor:\n\n## Key Parameters\n- **Moisture level**: Optimal watering schedules\n- **pH level**: Nutrient availability\n- **Temperature**: Germination conditions\n- **Nutrient content**: N, P, K levels\n\n## Sensor Types\n- Capacitive soil moisture sensors\n- pH electrodes\n- NPK sensors\n- Electrical conductivity probes", order: 2 },
      { id: "l7", courseId: "c2", title: "Automated Irrigation", content: "Automated irrigation saves water and ensures optimal plant growth.\n\n## Types\n- **Drip irrigation**: Precise water delivery\n- **Sprinkler systems**: Coverage for large areas\n- **Subsurface**: Water directly to roots\n\n## Smart Features\n- Weather-based scheduling\n- Soil moisture triggers\n- Remote control via app\n- Water usage analytics", order: 3 },
    ],
  },
  {
    id: "c3",
    title: "Data Science Basics",
    description: "Learn how to analyze and visualize data. Understand statistics, data cleaning, and create meaningful insights from raw data.",
    category: "Technology",
    difficulty: "Beginner",
    totalPoints: 600,
    lessons: [
      { id: "l8", courseId: "c3", title: "What is Data Science?", content: "Data science combines statistics, programming, and domain knowledge to extract insights from data.\n\n## The Data Science Process\n1. **Ask questions**: Define the problem\n2. **Collect data**: Gather relevant information\n3. **Clean data**: Handle missing values, outliers\n4. **Analyze**: Apply statistical methods\n5. **Visualize**: Create charts and graphs\n6. **Communicate**: Share findings", order: 1 },
      { id: "l9", courseId: "c3", title: "Statistics Fundamentals", content: "Understanding basic statistics is essential:\n\n## Descriptive Statistics\n- **Mean**: Average value\n- **Median**: Middle value\n- **Mode**: Most frequent value\n- **Standard Deviation**: Spread of data\n\n## Probability\n- Basic probability rules\n- Conditional probability\n- Bayes theorem\n- Normal distribution", order: 2 },
    ],
  },
  {
    id: "c4",
    title: "Renewable Energy Tech",
    description: "Explore solar, wind, and other renewable energy technologies. Learn how to implement sustainable energy solutions.",
    category: "Science",
    difficulty: "Advanced",
    totalPoints: 900,
    lessons: [
      { id: "l10", courseId: "c4", title: "Solar Energy Fundamentals", content: "Solar energy is the most abundant renewable energy source.\n\n## How Solar Panels Work\n- Photovoltaic cells convert sunlight to electricity\n- Silicon-based cells are most common\n- Efficiency ranges from 15-25%\n\n## Types of Solar Systems\n- Grid-tied\n- Off-grid\n- Hybrid", order: 1 },
    ],
  },
];

export const mockQuizzes: Record<string, QuizQuestion[]> = {
  l1: [
    { id: "q1", lessonId: "l1", question: "What does IoT stand for?", options: ["Internet of Things", "Integration of Technology", "Internal Operating Tools", "Internet of Tools"], correctAnswer: 0 },
    { id: "q2", lessonId: "l1", question: "Which is NOT a key component of IoT?", options: ["Sensors", "Connectivity", "Blockchain", "Processing"], correctAnswer: 2 },
    { id: "q3", lessonId: "l1", question: "What do sensors do in an IoT system?", options: ["Process data", "Collect data from the environment", "Display results", "Store data permanently"], correctAnswer: 1 },
  ],
  l2: [
    { id: "q4", lessonId: "l2", question: "What type of sensor is DHT11?", options: ["Motion sensor", "Temperature & humidity sensor", "Light sensor", "Pressure sensor"], correctAnswer: 1 },
    { id: "q5", lessonId: "l2", question: "What is an actuator?", options: ["A type of sensor", "Converts electrical signals to physical action", "A communication protocol", "A data storage device"], correctAnswer: 1 },
  ],
  l5: [
    { id: "q6", lessonId: "l5", question: "Smart farming can reduce water consumption by how much?", options: ["5-10%", "10-20%", "30-50%", "70-90%"], correctAnswer: 2 },
    { id: "q7", lessonId: "l5", question: "Which technology is used for crop surveillance?", options: ["Drones", "Refrigerators", "Televisions", "Printers"], correctAnswer: 0 },
  ],
};

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: "u5", name: "Priya Sharma", points: 2450 },
  { rank: 2, userId: "u3", name: "Amit Patel", points: 2100 },
  { rank: 3, userId: "u7", name: "Sneha Desai", points: 1890 },
  { rank: 4, userId: "1", name: "Ravi Kumar", points: 1250 },
  { rank: 5, userId: "u2", name: "Neha Singh", points: 1100 },
  { rank: 6, userId: "u4", name: "Vikram Joshi", points: 980 },
  { rank: 7, userId: "u6", name: "Anita Reddy", points: 850 },
  { rank: 8, userId: "u8", name: "Rahul Verma", points: 720 },
  { rank: 9, userId: "u9", name: "Meena Iyer", points: 650 },
  { rank: 10, userId: "u10", name: "Karan Mehta", points: 520 },
];

export const mockActivities: Activity[] = [
  { id: "a1", type: "lesson_completed", description: "Completed 'Sensors & Actuators'", timestamp: "2024-03-22T10:30:00Z", points: 50 },
  { id: "a2", type: "quiz_passed", description: "Scored 100% on IoT Quiz", timestamp: "2024-03-22T10:35:00Z", points: 100 },
  { id: "a3", type: "badge_earned", description: "Earned 'IoT Explorer' badge", timestamp: "2024-03-21T15:00:00Z" },
  { id: "a4", type: "course_started", description: "Started 'Smart Agriculture'", timestamp: "2024-03-20T09:00:00Z" },
  { id: "a5", type: "lesson_completed", description: "Completed 'What is IoT?'", timestamp: "2024-03-19T14:20:00Z", points: 50 },
];

export const allBadges: Badge[] = [
  { id: "b1", name: "Beginner", icon: "🌱", description: "Complete your first lesson" },
  { id: "b2", name: "IoT Explorer", icon: "📡", description: "Complete 5 IoT lessons" },
  { id: "b3", name: "Smart Farmer", icon: "🌾", description: "Complete the Agriculture course" },
  { id: "b4", name: "Data Wizard", icon: "📊", description: "Complete the Data Science course" },
  { id: "b5", name: "Quiz Master", icon: "🏆", description: "Score 100% on 5 quizzes" },
  { id: "b6", name: "Streak Champion", icon: "🔥", description: "Maintain a 30-day streak" },
  { id: "b7", name: "Knowledge Seeker", icon: "📚", description: "Enroll in 5 courses" },
  { id: "b8", name: "Energy Expert", icon: "⚡", description: "Complete the Renewable Energy course" },
];
