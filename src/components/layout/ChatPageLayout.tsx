import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { toast } from 'sonner';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { ChatSession } from '@/types/chat';
import { appRoutes } from '@/config/routes';

interface ChatPageLayoutProps {
  children: ReactNode;
  currentSessionId?: string;
  onSessionSelect?: (session: ChatSession) => void;
  onNewChat?: () => void;
  onRenameSession?: (sessionId: string, currentTitle: string) => void;
  showBackButton?: boolean;
  title?: string;
}

const navItems = [
  { path: appRoutes.student.root, icon: Home, label: 'Home' },
  { path: appRoutes.student.explore, icon: FolderTree, label: 'Explore' },
  { path: appRoutes.student.history, icon: History, label: 'History' },
  { path: appRoutes.student.profile, icon: User, label: 'Profile' },
];

export default function ChatPageLayout({
  children,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onRenameSession,
  showBackButton = false,
  title = "AI Chat",
}: ChatPageLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'navigation' | 'chat'>('chat');

  const isChatPage = location.pathname.startsWith(appRoutes.student.chat);

  // Auto-switch to chat view when there's an active session
  useEffect(() => {
    if (currentSessionId && activeView === 'navigation') {
      setActiveView('chat');
    }
  }, [currentSessionId, activeView]);

  return (
    <div className="min-h-screen app-surface flex">
      {/* Mobile backdrop with fade animation */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />
      
      {/* Enhanced Unified Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen overflow-y-auto border-r border-white/70 bg-white/90 shadow-2xl shadow-slate-300/40 backdrop-blur-xl transition-all duration-300 ease-in-out z-50 lg:relative lg:shadow-none",
          "transform lg:transform-none",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-20" : "w-80"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header with gradient */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border/70 bg-white/50">
            <Link to={appRoutes.student.root} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/25 transition-transform duration-200 group-hover:scale-105">
                <GraduationCap className="w-5 h-5 text-accent-foreground" />
              </div>
              {!collapsed && (
                <span className="font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
                  AI Student
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex hover:bg-accent/50 transition-colors duration-200"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Enhanced View Toggle for Chat Pages */}
          {isChatPage && (
            <div className={cn(
              "border-b border-border/70 bg-white/40",
              collapsed ? "p-2" : "p-3"
            )}>
              <div className={cn(
                "flex gap-1 p-1 bg-white/70 border border-white/70 rounded-lg backdrop-blur-sm",
                collapsed ? "flex-col" : ""
              )}>
                <Button
                  variant={activeView === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('chat')}
                  className={cn(
                    "text-xs transition-all duration-200 active:scale-95 relative",
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
                  variant={activeView === 'navigation' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('navigation')}
                  className={cn(
                    "text-xs transition-all duration-200 active:scale-95",
                    collapsed ? "w-8 h-8 p-0" : "flex-1"
                  )}
                  title={collapsed ? "Menu" : ""}
                >
                  <Menu className={cn("w-3 h-3", collapsed ? "" : "mr-1")} />
                  {!collapsed && (
                    <>
                      <span>Menu</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Content Area with smooth transitions */}
          <div className="flex-1 overflow-hidden">
            {isChatPage ? (
              <div className={cn(
                "h-full transition-all duration-500 ease-in-out",
                activeView === 'chat' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute',
                activeView === 'navigation' ? '-translate-x-full opacity-0 absolute' : 'translate-x-0 opacity-100'
              )}>
                {activeView === 'chat' ? (
                  <div className="h-full animate-in fade-in-0 slide-in-from-left-5 duration-300">
                    <ChatSidebar
                      currentSessionId={currentSessionId}
                      onSessionSelect={onSessionSelect || (() => {})}
                      onNewChat={onNewChat || (() => {})}
                      onRenameSession={onRenameSession}
                    />
                  </div>
                ) : (
                  <div className="h-full animate-in fade-in-0 slide-in-from-right-5 duration-300">
                    {/* Navigation View */}
                    <nav className="p-4 space-y-1">
                      {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path || 
                          (item.path !== appRoutes.student.root && location.pathname.startsWith(item.path));
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              "premium-nav-item flex items-center gap-3 px-3 py-2.5 transition-all duration-200 active:scale-95",
                              isActive 
                                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                            style={{
                              animationDelay: `${index * 50}ms`
                            }}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                            {isActive && (
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Navigation for Non-Chat Pages */
              <nav className="p-4 space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== appRoutes.student.root && location.pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "premium-nav-item flex items-center gap-3 px-3 py-2.5 transition-all duration-200 active:scale-95",
                        isActive 
                          ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
                          : "text-muted-foreground hover:text-foreground"
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
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Enhanced User Section */}
          <div className="p-4 border-t border-border/70 bg-gradient-to-t from-white/50 to-transparent">
            <div className={cn(
              "flex items-center gap-3 mb-3 transition-all duration-200",
              collapsed && "justify-center"
            )}>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 ring-1 ring-accent/10 transition-all duration-200 hover:bg-accent/20 cursor-pointer">
                <span className="text-sm font-semibold text-accent">
                  {user?.name.charAt(0)}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate transition-colors duration-200 hover:text-primary cursor-pointer">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate hidden sm:block">{user?.email}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              onClick={logout}
              className={cn(
                "text-muted-foreground hover:text-destructive transition-all duration-200 active:scale-95",
                !collapsed && "w-full justify-start"
              )}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Sign out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out h-screen overflow-y-auto",
        collapsed ? "w-[calc(100%-80px)]" : "w-[calc(100%-320px)]"
      )}>
        {/* Enhanced Header with backdrop blur */}
        <div className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden hover:bg-accent/50 transition-all duration-200 hover:scale-105"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Back Button */}
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={() => navigate(-1)}
                  className="hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}

              {/* Enhanced Page Title */}
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  {title}
                  {isChatPage && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
                </h1>
                {isChatPage && !collapsed && (
                  <p className="text-xs text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    {currentSessionId 
                      ? 'Chat conversation in progress' 
                      : activeView === 'chat' 
                        ? 'Chat conversations' 
                        : 'Navigation menu'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Enhanced Status Indicators */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Page Content */}
        <div className="h-[calc(100vh-73px)] animate-in fade-in-0 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
