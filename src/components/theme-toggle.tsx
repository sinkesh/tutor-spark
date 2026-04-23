import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  collapsed?: boolean;
  className?: string;
}

export default function ThemeToggle({ collapsed = false, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size={collapsed ? "icon" : "default"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group gap-2 rounded-[20px] border border-slate-200/80 bg-white/90 text-foreground shadow-lg shadow-slate-200/50 backdrop-blur-xl hover:bg-white dark:border-white/15 dark:bg-slate-900/90 dark:shadow-black/30 dark:hover:bg-slate-900",
        collapsed ? "h-11 w-11" : "w-full justify-start",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 text-primary" />
      )}
      {!collapsed && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </Button>
  );
}
