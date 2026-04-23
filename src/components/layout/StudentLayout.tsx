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
} from 'lucide-react';
import { useState } from 'react';

interface StudentLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/student', icon: Home, label: 'Studio' },
  { path: '/student/explore', icon: FolderTree, label: 'Discover' },
  { path: '/student/history', icon: History, label: 'Timeline' },
  { path: '/student/conversation-history', icon: Bookmark, label: 'Saved Chats' },
  { path: '/student/profile', icon: User, label: 'Account' },
];

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const currentNavItem = navItems.find((item) =>
    location.pathname === item.path ||
    (item.path !== '/student' && location.pathname.startsWith(item.path))
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
        className={cn(
          "dashboard-sidebar fixed left-0 top-0 z-50 h-screen overflow-y-auto border-r border-white/10 text-white transition-all duration-300 lg:relative lg:shadow-none",
          "transform lg:transform-none",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
            <Link to="/student" className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/14 shadow-lg shadow-cyan-950/20 ring-1 ring-white/10">
                <GraduationCap className="h-5 w-5 text-cyan-100" />
              </div>
              {!collapsed && (
                <div>
                  <span className="block font-bold text-white">AI Teachers</span>
                  <span className="block text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100/55">learning studio</span>
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

          <div className="sidebar-section-label pt-4">Workspace</div>
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/student' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "group sidebar-nav-item",
                    isActive
                      ? "sidebar-nav-active"
                      : "text-white/68 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-fuchsia-500" : "text-white/45 group-hover:text-cyan-100")} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4 text-xs text-white/45">
            {!collapsed ? "Your learning cockpit" : ""}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "dashboard-main dashboard-panel flex-1 overflow-y-auto transition-all duration-300 lg:my-3 lg:mr-3 lg:h-[calc(100vh-1.5rem)] lg:rounded-[32px]",
        collapsed ? "w-[calc(100%-80px)]" : "w-[calc(100%-256px)]"
      )}>
        <div className="">
          <header className="dashboard-header sticky top-0 z-30 flex h-20 items-center gap-2 px-3 sm:gap-3 sm:px-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="header-action lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Student Space</p>
              <h1 className="truncate text-lg font-semibold text-foreground">
                {currentNavItem?.label || "AI Teachers"}
              </h1>
            </div>

            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="header-action relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-500" />
              </Button>
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
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
