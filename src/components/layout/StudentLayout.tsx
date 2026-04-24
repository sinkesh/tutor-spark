import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/theme-toggle';
import GlobalPageSearch from '@/components/layout/GlobalPageSearch';
import HeaderFullscreenToggle from '@/components/layout/HeaderFullscreenToggle';
import { appRoutes } from '@/config/routes';
import {
  GraduationCap,
  Home,
  FolderTree,
  History,
  Bookmark,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface StudentLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: appRoutes.student.root, icon: Home, label: 'Studio' },
  { path: appRoutes.student.explore, icon: FolderTree, label: 'Discover' },
  { path: appRoutes.student.history, icon: History, label: 'Timeline' },
  { path: appRoutes.student.conversationHistory, icon: Bookmark, label: 'Saved Chats' },
  { path: appRoutes.student.profile, icon: User, label: 'Account' },
];

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isSidebarExpanded = !collapsed || isSidebarHovered;
  const currentNavItem = navItems.find((item) =>
    location.pathname === item.path ||
    (item.path !== appRoutes.student.root && location.pathname.startsWith(item.path))
  );

  return (
    <div className="dashboard-shell min-h-screen flex">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/72 backdrop-blur-md lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={cn(
          "dashboard-sidebar fixed left-0 top-0 z-50 h-full border-r border-white/10 text-white transition-all duration-300 lg:overflow-hidden",
          "transform lg:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isSidebarExpanded ? "w-64" : "w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
            <Link to={appRoutes.student.root} className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/14 shadow-lg shadow-cyan-950/20 ring-1 ring-white/10">
                <GraduationCap className="h-5 w-5 text-cyan-100" />
              </div>
              {isSidebarExpanded && (
                <div>
                  <span className="sidebar-brand-title block text-white">AI Student</span>
                  <span className="sidebar-brand-kicker block text-[11px] uppercase text-cyan-100/55">learning studio</span>
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

          {isSidebarExpanded ? <div className="sidebar-section-label pt-4 text-white/45">Workspace</div> : null}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== appRoutes.student.root && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "group sidebar-nav-item",
                    isActive
                      ? "bg-white/14 text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/14"
                      : "text-white/68 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-white/45")} />
                  {isSidebarExpanded && <span className="sidebar-nav-label text-sm text-white">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className={cn("flex items-center", isSidebarExpanded ? "justify-between gap-3" : "justify-center")}>
              {isSidebarExpanded ? (
                <div className="sidebar-meta-copy text-xs text-white/45">
                  Your learning cockpit
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

      {/* Main content */}
      <div className={cn(
        "flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden transition-all duration-300 h-screen lg:mb-3 lg:mr-3 lg:h-[calc(100vh-0.75rem)]",
        collapsed ? "lg:ml-[5.75rem]" : "lg:ml-[16.75rem]"
      )}>
        <header className="dashboard-header dashboard-header-row sticky top-0 z-30 shrink-0 flex h-20 items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:mb-3 lg:rounded-[24px] lg:border lg:border-white/45 lg:bg-white/72 dark:lg:border-white/10 dark:lg:bg-slate-950/55">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="dashboard-header-leading header-action lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="dashboard-header-title min-w-0 lg:max-w-xs">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Student Space</p>
            <h1 className="truncate text-lg font-semibold text-foreground">
              {currentNavItem?.label || "AI Teachers"}
            </h1>
          </div>

          <GlobalPageSearch className="flex-1 max-w-none min-w-[2.75rem] sm:min-w-[12rem]" />
          <div className="dashboard-header-actions flex min-w-0 items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="header-action relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-500" />
            </Button>
            <HeaderFullscreenToggle />
            <ThemeToggle collapsed />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="profile-pill">
                  <span className="profile-avatar h-9 w-9">
                    {user?.name?.charAt(0)}
                  </span>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-32 truncate text-sm leading-4">{user?.name}</span>
                    <span className="block max-w-32 truncate text-[11px] leading-3 text-muted-foreground">{user?.email}</span>
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
                  <Link to={appRoutes.student.profile}>
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
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
