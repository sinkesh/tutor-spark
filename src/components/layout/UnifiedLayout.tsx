import React, { ReactNode, useState, useEffect } from 'react';
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
import GlobalPageSearch from '@/components/layout/GlobalPageSearch';
import HeaderFullscreenToggle from '@/components/layout/HeaderFullscreenToggle';
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

// Re-import existing components
import UnifiedSidebar from '@/components/chat/UnifiedSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import DocumentPreviewButton from '@/components/documents/DocumentPreviewButton';
import DocumentListModal from '@/components/documents/DocumentListModal';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';

interface UnifiedLayoutProps {
  children: ReactNode;
  currentSessionId?: string;
  onSessionSelect?: (session: ChatSession) => void;
  onNewChat?: () => void;
  onRenameSession?: (sessionId: string, currentTitle: string) => void;
  onSessionCreated?: () => void; // Called when new session is created
  showBackButton?: boolean;
  title?: string;
  viewType?: 'dashboard' | 'chat' | 'explore';
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
  onSessionCreated,
  showBackButton = false,
  title = "AI Teachers",
  viewType = 'dashboard',
}: UnifiedLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'subjects' | 'sessions'>('sessions');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isSidebarExpanded = !collapsed || isSidebarHovered;
  const isSidebarCompressed = !isSidebarExpanded;

  // Handle session creation - refresh sidebar and call parent callback
  const handleSessionCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    onSessionCreated?.();
  };

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

  // Don't auto-load subjects - let the sidebar handle it when needed
  // This prevents duplicate API calls

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
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={cn(
          "dashboard-sidebar fixed left-0 top-0 z-50 h-full border-r border-white/10 text-white transition-all duration-300 ease-in-out lg:overflow-hidden",
          "transform lg:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isSidebarExpanded ? "w-72" : "w-20" // Reduced from w-80 to w-72
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
            <Link to="/student" className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/14 shadow-lg shadow-cyan-950/20 ring-1 ring-white/10">
                <GraduationCap className="h-5 w-5 text-cyan-100" />
              </div>
              {isSidebarExpanded && (
                <div>
                  <span className="sidebar-brand-title block text-white">
                    AI Student
                  </span>
                  <span className="sidebar-brand-kicker block text-[11px] uppercase text-cyan-100/55">
                    smart chat deck
                  </span>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileSidebarOpen(false)}
              className="text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* View Toggle for Chat/Explore Pages */}
          {(isChatPage || isExplorePage) && (
            <div className={cn(
              "border-b border-white/10",
              isSidebarCompressed ? "p-2" : "p-3"
            )}>
              <div className={cn(
                "flex gap-1 rounded-[22px] border border-white/10 bg-slate-900/35 p-1 shadow-none backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/35",
                isSidebarCompressed ? "flex-col" : ""
              )}>
                <Button
                  variant={activeView === 'sessions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('sessions')}
                  className={cn(
                    "relative rounded-[18px] text-xs transition-all duration-200 active:scale-95",
                    activeView !== 'sessions' && "text-white/70 hover:bg-white/10 hover:text-white dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white",
                    isSidebarCompressed ? "w-8 h-8 p-0" : "flex-1"
                  )}
                  title={isSidebarCompressed ? "Chats" : ""}
                >
                  <MessageSquare className={cn("w-3 h-3", isSidebarCompressed ? "" : "mr-1")} />
                  {!isSidebarCompressed && (
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
                    isSidebarCompressed ? "w-8 h-8 p-0" : "flex-1"
                  )}
                  title={isSidebarCompressed ? "Subjects" : ""}
                >
                  <BookOpen className={cn("w-3 h-3", isSidebarCompressed ? "" : "mr-1")} />
                  {!isSidebarCompressed && (
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
                      collapsed={isSidebarCompressed}
                      refreshKey={refreshTrigger}
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
                      collapsed={isSidebarCompressed}
                      refreshKey={refreshTrigger}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Regular Navigation for Other Pages */
              <>
                {isSidebarExpanded ? <div className="sidebar-section-label pt-4 text-white/45">Navigation</div> : null}
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
                          ? "bg-white/14 text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/14"
                          : "text-white/68 hover:bg-white/10 hover:text-white"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-white/45")} />
                      {isSidebarExpanded && (
                        <>
                          <span className="sidebar-nav-label text-sm text-white">{item.label}</span>
                        </>
                      )}
                      {isActive && isSidebarExpanded && (
                        <div className="w-2 h-2 rounded-full bg-white/85 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
                </nav>
              </>
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className={cn("flex items-center", isSidebarExpanded ? "justify-between gap-3" : "justify-center")}>
              {isSidebarExpanded ? (
                <div className="sidebar-meta-copy text-xs text-white/45">
                  Chats and subjects
                </div>
              ) : null}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden text-white/60 hover:bg-white/10 hover:text-white lg:flex"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <div className={cn(
        "flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out h-screen lg:mb-3 lg:mr-3 lg:h-[calc(100vh-0.75rem)]",
        collapsed ? "lg:ml-[5.75rem]" : "lg:ml-[18.75rem]" // Adjusted for new sidebar width plus gutter
      )}>
        {!isChatPage && (
          <>
            {/* Header */}
            <div className="sticky top-0 z-30 shrink-0">
              <div className="p-3">
                <div className="dashboard-header-row relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Mobile Menu Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    className="dashboard-header-leading header-action lg:hidden"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>

                  {/* Back Button */}
                  {showBackButton && (
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      onClick={() => navigate(-1)}
                      className="dashboard-header-leading header-action"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Page Title */}
                  <div className="dashboard-header-title min-w-0 lg:max-w-xs">
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
                  <GlobalPageSearch className="flex-1 max-w-none min-w-[2.75rem] sm:min-w-[12rem]" />
                </div>

                {/* Status Indicators */}
                <div className="dashboard-header-actions flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="header-action relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-500" />
                  </Button>
                  <HeaderFullscreenToggle />
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
          </>
        )}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="h-full animate-in fade-in-0 duration-500"> {/* Reduced from 73px */}
            {/* Pass session creation callback to children */}
            {React.cloneElement(children as React.ReactElement, { onSessionCreated: handleSessionCreated })}
          </div>
        </main>
      </div>

    </div>
  );
}
