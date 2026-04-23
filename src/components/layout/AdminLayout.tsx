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
  LayoutDashboard,
  Bot,
  Globe,
  TrendingUp,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Users,
  Beaker,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/agents', icon: Bot, label: 'AI Agents' },
  { path: '/admin/global-knowledge', icon: Globe, label: 'Global Knowledge' },
  { path: '/admin/feedback', icon: MessageSquare, label: 'Feedback & Learning' },
  { path: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
  { path: '/admin/sandbox', icon: Beaker, label: 'Testing Sandbox' },
  { path: '/admin/students', icon: Users, label: 'Students' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const currentNavItem = navItems.find((item) =>
    location.pathname === item.path ||
    (item.path !== '/admin' && location.pathname.startsWith(item.path))
  );

  return (
    <div className="dashboard-shell min-h-screen flex">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md transition-opacity lg:hidden",
          mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={cn(
          "dashboard-sidebar fixed left-0 top-0 z-50 h-full border-r border-white/10 transition-all duration-300",
          "transform lg:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/14 shadow-lg shadow-cyan-950/20 ring-1 ring-white/10">
                <GraduationCap className="h-5 w-5 text-cyan-100" />
              </div>
              {!collapsed && (
                <div>
                  <span className="block font-bold text-white">AI Teachers</span>
                  <span className="block text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100/55">control deck</span>
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
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileSidebarOpen(false)}
              className="text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="sidebar-section-label pt-4">Control</div>
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
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
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-fuchsia-500" : "text-white/45")} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4 text-xs text-white/45">
            {!collapsed ? "Operations and oversight" : ""}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "dashboard-main dashboard-panel flex-1 transition-all duration-300 lg:my-3 lg:mr-3 lg:min-h-[calc(100vh-1.5rem)] lg:rounded-[32px]",
        collapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <header className="dashboard-header sticky top-0 z-30 flex h-20 items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)} className="header-action lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Admin Space</p>
            <h1 className="truncate text-lg font-semibold text-foreground">
              {currentNavItem?.label || "AI Teachers Admin"}
            </h1>
          </div>
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
                <Link to="/admin/settings">
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
        </header>
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
