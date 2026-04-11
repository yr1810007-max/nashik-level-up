import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LessonPage from "./pages/LessonPage";
import StepDetailPage from "./pages/StepDetailPage";
import ConfidenceMeter from "./pages/ConfidenceMeter";
import ComponentsPage from "./pages/ComponentsPage";
import Leaderboard from "./pages/Leaderboard";
import Community from "./pages/Community";
import ComponentLibrary from "./pages/ComponentLibrary";
import Profile from "./pages/Profile";
import SimulationPage from "./pages/SimulationPage";
import LearningWorkspace from "./pages/LearningWorkspace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
              <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
              <Route path="/courses/:courseId/lessons/:lessonId/steps/:stepId" element={<ProtectedRoute><StepDetailPage /></ProtectedRoute>} />
              <Route path="/courses/:courseId/confidence/:phase" element={<ProtectedRoute><ConfidenceMeter /></ProtectedRoute>} />
              <Route path="/courses/:courseId/components" element={<ProtectedRoute><ComponentsPage /></ProtectedRoute>} />
              <Route path="/courses/:courseId/simulation" element={<ProtectedRoute><SimulationPage /></ProtectedRoute>} />
              <Route path="/learning/:courseId" element={<ProtectedRoute><LearningWorkspace /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/components" element={<ProtectedRoute><ComponentLibrary /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
