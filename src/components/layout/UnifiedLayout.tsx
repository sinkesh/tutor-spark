import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/theme-toggle';
import {
  GraduationCap,
  Home,
  FolderTree,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  Bot,
  Clock,
  ArrowLeft,
  Sparkles,
  BookOpen,
  X,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { ChatSession } from '@/types/chat';
import { getStudentAgent } from '@/config/services';

// Re-import existing components
import UnifiedSidebar from '@/components/chat/UnifiedSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import DocumentPreviewButton from '@/components/documents/DocumentPreviewButton';
import DocumentListModal from '@/components/documents/DocumentListModal';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import TopicsPreview from '@/components/chat/TopicsPreview';

interface UnifiedLayoutProps {
  children: ReactNode;
  currentSessionId?: string;
  onSessionSelect?: (session: ChatSession) => void;
  onNewChat?: () => void;
  onRenameSession?: (sessionId: string, currentTitle: string) => void;
  showBackButton?: boolean;
  title?: string;
  viewType?: 'dashboard' | 'chat' | 'explore';
}

interface StudentSubject {
  subject_agent_id: string;
  name: string;
  description?: string;
}

const navItems = [
  { path: '/student', icon: Home, label: 'Home' },
  { path: '/student/history', icon: History, label: 'History' },
  { path: '/student/profile', icon: User, label: 'Profile' },
];

export default function UnifiedLayout({
  children,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onRenameSession,
  showBackButton = false,
  title = "AI Teachers",
  viewType = 'dashboard',
}: UnifiedLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'subjects' | 'sessions'>('sessions');
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Get current subject from URL to filter subjects
  const getCurrentSubject = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/math')) return 'Math';
    if (currentPath.includes('/science')) return 'Science';
    if (currentPath.includes('/physics')) return 'Physics';
    if (currentPath.includes('/chemistry')) return 'Chemistry';
    if (currentPath.includes('/biology')) return 'Biology';
    if (currentPath.includes('/english')) return 'English';
    if (currentPath.includes('/history')) return 'History';
    if (currentPath.includes('/geography')) return 'Geography';
    return null;
  };

  const currentSubject = getCurrentSubject();

  // Load subjects for sidebar
  useEffect(() => {
    if (user?.id && currentSubject) {
      // Only load subjects when we have a current subject context
      loadSubjects();
    }
  }, [user?.id, currentSubject]);

  const loadSubjects = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingSubjects(true);
      const response = await getStudentAgent(user.id);
      const allSubjects = [
        ...(response?.student_subjects || []),
        ...(response?.general_subjects || []),
      ];
      setSubjects(allSubjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const isChatPage = location.pathname.startsWith('/student/chat');
  const isExplorePage = location.pathname.startsWith('/student/explore');

  return (
    <div className="dashboard-shell min-h-screen flex">
      {/* Mobile backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/72 backdrop-blur-md transition-opacity duration-300 lg:hidden",
          mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />
      
      {/* Enhanced Unified Sidebar */}
      <aside 
        className={cn(
          "dashboard-sidebar fixed left-0 top-0 z-50 h-screen overflow-y-auto border-r border-white/10 transition-all duration-300 ease-in-out lg:relative lg:shadow-none",
          "transform lg:transform-none",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-20" : "w-72" // Reduced from w-80 to w-72
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
            <Link to="/student" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/14 shadow-lg shadow-cyan-950/20 ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-105">
                <GraduationCap className="h-5 w-5 text-cyan-100" />
              </div>
              {!collapsed && (
                <div>
                  <span className="block font-bold text-white transition-colors duration-200">
                    AI Teachers
                  </span>
                  <span className="block text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100/55">
                    smart chat deck
                  </span>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden text-white/60 hover:bg-white/10 hover:text-white lg:flex"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* View Toggle for Chat/Explore Pages */}
          {(isChatPage || isExplorePage) && (
            <div className={cn(
              "border-b border-white/10",
              collapsed ? "p-2" : "p-3"
            )}>
              <div className={cn(
                "flex gap-1 rounded-[22px] border border-white/10 bg-slate-900/35 p-1 shadow-none backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/35",
                collapsed ? "flex-col" : ""
              )}>
                <Button
                  variant={activeView === 'sessions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('sessions')}
                  className={cn(
                    "relative rounded-[18px] text-xs transition-all duration-200 active:scale-95",
                    activeView !== 'sessions' && "text-white/70 hover:bg-white/10 hover:text-white dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white",
                    collapsed ? "w-8 h-8 p-0" : "flex-1"
                  )}
                  title={collapsed ? "Chats" : ""}
                >
                  <MessageSquare className={cn("w-3 h-3", collapsed ? "" : "mr-1")} />
                  {!collapsed && (
                    <>
                      <span>Chats</span>
                    </>
                  )}
                  {currentSessionId && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </Button>
                <Button
                  variant={activeView === 'subjects' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('subjects')}
                  className={cn(
                    "rounded-[18px] text-xs transition-all duration-200 active:scale-95",
                    activeView !== 'subjects' && "text-white/70 hover:bg-white/10 hover:text-white dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white",
                    collapsed ? "w-8 h-8 p-0" : "flex-1"
                  )}
                  title={collapsed ? "Subjects" : ""}
                >
                  <BookOpen className={cn("w-3 h-3", collapsed ? "" : "mr-1")} />
                  {!collapsed && (
                    <>
                      <span>Subjects</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {(isChatPage || isExplorePage) ? (
              <div className="h-full">
                {activeView === 'sessions' ? (
                  <div className="h-full animate-in fade-in-0 slide-in-from-left-5 duration-300">
                    <UnifiedSidebar
                      currentSessionId={currentSessionId}
                      onSessionSelect={onSessionSelect || (() => {})}
                      onNewChat={onNewChat || (() => {})}
                      onRenameSession={onRenameSession}
                      activeView="sessions"
                      collapsed={collapsed}
                    />
                  </div>
                ) : (
                  <div className="h-full animate-in fade-in-0 slide-in-from-right-5 duration-300">
                    <UnifiedSidebar
                      currentSessionId={currentSessionId}
                      onSessionSelect={onSessionSelect || (() => {})}
                      onNewChat={onNewChat || (() => {})}
                      onRenameSession={onRenameSession}
                      activeView="subjects"
                      collapsed={collapsed}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Regular Navigation for Other Pages */
              <>
                <div className="sidebar-section-label pt-4">Navigation</div>
                <nav className="p-4 space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/student' && location.pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "group sidebar-nav-item active:scale-95",
                        isActive 
                          ? "sidebar-nav-active"
                          : "text-white/68 hover:bg-white/10 hover:text-white"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium">{item.label}</span>
                        </>
                      )}
                      {isActive && !collapsed && (
                        <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
                </nav>
              </>
            )}
          </div>

          <div className="border-t border-white/10 p-4 text-xs text-white/45">
            {!collapsed ? "Chats and subjects" : ""}
          </div>
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <main className={cn(
        "dashboard-main dashboard-panel flex-1 h-screen overflow-y-auto transition-all duration-300 ease-in-out lg:my-3 lg:mr-3 lg:rounded-[32px]",
        collapsed ? "w-[calc(100%-80px)]" : "w-[calc(100%-288px)]" // Adjusted for new sidebar width
      )}>
        {/* Header */}
        <div className="pro-header sticky top-0 z-30">
          <div className="p-3">
            <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="header-action lg:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>

              {/* Back Button */}
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => navigate(-1)}
                  className="header-action"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}

              {/* Page Title */}
              <div>
                <h1 className="text-base font-semibold flex items-center gap-2"> {/* Reduced from text-lg */}
                  {title}
                  {isChatPage && <Sparkles className="w-3 h-3 text-primary animate-pulse" />} {/* Reduced icon size */}
                </h1>
                {isChatPage && !collapsed && (
                  <p className="text-xs text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    {currentSessionId 
                      ? 'Chat conversation in progress' 
                      : activeView === 'sessions' 
                        ? 'Chat conversations' 
                        : 'Browse subjects'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="header-action relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-500" />
              </Button>
              <ThemeToggle collapsed />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="profile-pill h-11 min-w-9">
                    <span className="profile-avatar h-9 w-9 text-xs">
                      {user?.name?.charAt(0)}
                    </span>
                    <span className="hidden min-w-0 text-left sm:block">
                      <span className="block max-w-28 truncate text-sm leading-4">{user?.name}</span>
                      <span className="block max-w-28 truncate text-[11px] leading-3 text-muted-foreground">{user?.email}</span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                  <DropdownMenuLabel>
                    <span className="block truncate">{user?.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/student/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"> {/* Reduced gap */}
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {/* Reduced size */}
                <span>Online</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="h-[calc(100vh-65px)] animate-in fade-in-0 duration-500"> {/* Reduced from 73px */}
          {children}
        </div>
      </main>
    </div>
  );
}
