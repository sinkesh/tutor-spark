import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Home,
  FolderTree,
  MessageCircle,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface StudentLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/student', icon: Home, label: 'Home' },
  { path: '/student/explore', icon: FolderTree, label: 'Explore' },
  { path: '/student/history', icon: History, label: 'History' },
  { path: '/student/profile', icon: User, label: 'Profile' },
];

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <Link to="/student" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-accent-foreground" />
              </div>
              {!collapsed && (
                <span className="font-bold text-foreground">AI Teachers</span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/student' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-accent text-accent-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className={cn(
              "flex items-center gap-3 mb-3",
              collapsed && "justify-center"
            )}>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-accent">
                  {user?.name.charAt(0)}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              onClick={logout}
              className={cn("text-muted-foreground hover:text-destructive", !collapsed && "w-full justify-start")}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Sign out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "ml-20" : "ml-64"
      )}>
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
