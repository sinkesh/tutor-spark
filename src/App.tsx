import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AgentsListPage from "@/pages/admin/AgentsListPage";
import CreateAgentPage from "@/pages/admin/CreateAgentPage";
import AgentDetailPage from "@/pages/admin/AgentDetailPage";
import GlobalKnowledgePage from "@/pages/admin/GlobalKnowledgePage";
import FeedbackPage from "@/pages/admin/FeedbackPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import SandboxPage from "@/pages/admin/SandboxPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import ExplorePage from "@/pages/student/ExplorePage";
import ChatPage from "@/pages/student/ChatPage";
import HistoryPage from "@/pages/student/HistoryPage";
import ProfilePage from "@/pages/student/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'admin' | 'student' }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />;
  }
  
  return <>{children}</>;
}

function AuthRedirect() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <AuthRedirect /> : <LoginPage />} />
      
      {/* Root redirect */}
      <Route path="/" element={<AuthRedirect />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/agents" element={<ProtectedRoute allowedRole="admin"><AgentsListPage /></ProtectedRoute>} />
      <Route path="/admin/agents/create" element={<ProtectedRoute allowedRole="admin"><CreateAgentPage /></ProtectedRoute>} />
      <Route path="/admin/agents/:agentId" element={<ProtectedRoute allowedRole="admin"><AgentDetailPage /></ProtectedRoute>} />
      <Route path="/admin/global-knowledge" element={<ProtectedRoute allowedRole="admin"><GlobalKnowledgePage /></ProtectedRoute>} />
      <Route path="/admin/feedback" element={<ProtectedRoute allowedRole="admin"><FeedbackPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="admin"><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/sandbox" element={<ProtectedRoute allowedRole="admin"><SandboxPage /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRole="admin"><StudentsPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><SettingsPage /></ProtectedRoute>} />
      
      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/explore" element={<ProtectedRoute allowedRole="student"><ExplorePage /></ProtectedRoute>} />
      <Route path="/student/chat/:agentId" element={<ProtectedRoute allowedRole="student"><ChatPage /></ProtectedRoute>} />
      <Route path="/student/history" element={<ProtectedRoute allowedRole="student"><HistoryPage /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><ProfilePage /></ProtectedRoute>} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/Teacher_AI_Agent">
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
