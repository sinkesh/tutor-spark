import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import type { UserRole } from "@/types";
import {
  APP_BASENAME,
  appRoutes,
  getHomeRouteForRole,
  getLoginRouteForRole,
} from "@/config/routes";

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
import NewChatPage from "@/pages/student/NewChatPage";
import ChatSessionPage from "@/pages/student/ChatSessionPage";
import NewAgentChatPage from "@/pages/student/NewAgentChatPage";
import HistoryPage from "@/pages/student/HistoryPage";
import ConversationHistoryPage from "@/pages/student/ConversationHistoryPage";
import ProfilePage from "@/pages/student/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function readLastPortalRole(): UserRole | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedRole = window.localStorage.getItem("last_portal_role");
  return storedRole === "admin" || storedRole === "student" ? storedRole : null;
}

function RouteLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Preparing workspace...</span>
      </div>
    </div>
  );
}

function ProtectedRoleOutlet({ allowedRole }: { allowedRole: UserRole }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={getLoginRouteForRole(allowedRole)}
        replace
        state={{ from: location }}
      />
    );
  }

  if (user?.role !== allowedRole) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return <Outlet />;
}

function RoleLoginRoute({ portalRole }: { portalRole: UserRole }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return <LoginPage portalRole={portalRole} />;
}

function LegacyLoginRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return <Navigate to={getLoginRouteForRole(readLastPortalRole())} replace />;
}

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return <Navigate to={getLoginRouteForRole(readLastPortalRole())} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={appRoutes.root} element={<RootRedirect />} />
      <Route path={appRoutes.login} element={<LegacyLoginRedirect />} />
      <Route
        path={appRoutes.admin.login}
        element={<RoleLoginRoute portalRole="admin" />}
      />
      <Route
        path={appRoutes.student.login}
        element={<RoleLoginRoute portalRole="student" />}
      />

      <Route
        path={appRoutes.admin.root}
        element={<ProtectedRoleOutlet allowedRole="admin" />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="agents" element={<AgentsListPage />} />
        <Route path="agents/create" element={<CreateAgentPage />} />
        <Route path="agents/:agentId" element={<AgentDetailPage />} />
        <Route path="global-knowledge" element={<GlobalKnowledgePage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="sandbox" element={<SandboxPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path={appRoutes.student.root}
        element={<ProtectedRoleOutlet allowedRole="student" />}
      >
        <Route index element={<StudentDashboard />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="chat" element={<NewChatPage />} />
        <Route path="chat/session/:sessionId" element={<ChatSessionPage />} />
        <Route
          path="chat/new/subject/:subjectName"
          element={<NewAgentChatPage />}
        />
        <Route path="chat/:subjectName" element={<ChatPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route
          path="conversation-history"
          element={<ConversationHistoryPage />}
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem
    storageKey="ai-teachers-theme"
  >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={APP_BASENAME}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
