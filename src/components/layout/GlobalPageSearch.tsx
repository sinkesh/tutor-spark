import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Beaker,
  Bookmark,
  Bot,
  FolderTree,
  Globe,
  History,
  Home,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  TrendingUp,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type SearchPage = {
  label: string;
  path: string;
  role: UserRole;
  description: string;
  group: string;
  icon: LucideIcon;
  keywords: string[];
  matches?: (pathname: string) => boolean;
};

const searchablePages: SearchPage[] = [
  {
    label: "Dashboard",
    path: "/admin",
    role: "admin",
    description: "Overview of platform activity and key metrics",
    group: "Admin Pages",
    icon: LayoutDashboard,
    keywords: ["admin", "home", "overview", "counts"],
  },
  {
    label: "AI Agents",
    path: "/admin/agents",
    role: "admin",
    description: "View and manage all teaching agents",
    group: "Admin Pages",
    icon: Bot,
    keywords: ["agents", "bot", "teachers", "manage"],
  },
  {
    label: "Create Agent",
    path: "/admin/agents/create",
    role: "admin",
    description: "Create and configure a new AI agent",
    group: "Admin Pages",
    icon: Bot,
    keywords: ["new", "agent", "create", "setup"],
  },
  {
    label: "Global Knowledge",
    path: "/admin/global-knowledge",
    role: "admin",
    description: "Upload and manage shared knowledge",
    group: "Admin Pages",
    icon: Globe,
    keywords: ["knowledge", "rag", "documents", "shared"],
  },
  {
    label: "Feedback & Learning",
    path: "/admin/feedback",
    role: "admin",
    description: "Review feedback queues and learning signals",
    group: "Admin Pages",
    icon: MessageSquare,
    keywords: ["feedback", "review", "learning", "queue"],
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    role: "admin",
    description: "Inspect usage trends and performance analytics",
    group: "Admin Pages",
    icon: TrendingUp,
    keywords: ["analytics", "metrics", "reports", "insights"],
  },
  {
    label: "Testing Sandbox",
    path: "/admin/sandbox",
    role: "admin",
    description: "Test flows and experiment safely",
    group: "Admin Pages",
    icon: Beaker,
    keywords: ["sandbox", "testing", "experiment", "qa"],
  },
  {
    label: "Students",
    path: "/admin/students",
    role: "admin",
    description: "Manage student accounts and assignments",
    group: "Admin Pages",
    icon: Users,
    keywords: ["students", "learners", "accounts", "manage"],
  },
  {
    label: "Settings",
    path: "/admin/settings",
    role: "admin",
    description: "Control security, workspace, and preferences",
    group: "Admin Pages",
    icon: Settings,
    keywords: ["settings", "preferences", "config", "security"],
  },
  {
    label: "Dashboard",
    path: "/student",
    role: "student",
    description: "Student home and learning overview",
    group: "Student Pages",
    icon: Home,
    keywords: ["student", "home", "dashboard", "overview"],
  },
  {
    label: "Explore",
    path: "/student/explore",
    role: "student",
    description: "Browse available subjects and learning paths",
    group: "Student Pages",
    icon: FolderTree,
    keywords: ["explore", "subjects", "discover", "browse"],
  },
  {
    label: "New Chat",
    path: "/student/chat",
    role: "student",
    description: "Start a new study chat or continue one",
    group: "Student Pages",
    icon: MessageSquare,
    keywords: ["chat", "conversation", "ask", "study"],
    matches: (pathname) => pathname.startsWith("/student/chat"),
  },
  {
    label: "History",
    path: "/student/history",
    role: "student",
    description: "See your recent activity and session history",
    group: "Student Pages",
    icon: History,
    keywords: ["history", "activity", "timeline", "recent"],
  },
  {
    label: "Saved Chats",
    path: "/student/conversation-history",
    role: "student",
    description: "Open previously saved chat conversations",
    group: "Student Pages",
    icon: Bookmark,
    keywords: ["saved", "chats", "bookmarks", "conversations"],
  },
  {
    label: "Profile",
    path: "/student/profile",
    role: "student",
    description: "Manage your student profile and preferences",
    group: "Student Pages",
    icon: User,
    keywords: ["profile", "account", "settings", "student"],
  },
];

function isCurrentPage(page: SearchPage, pathname: string) {
  return page.matches ? page.matches(pathname) : pathname === page.path;
}

export default function GlobalPageSearch({ className }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const pages = searchablePages.filter((page) => page.role === user?.role);
  const pageGroups = pages.reduce((groups, page) => {
    const existingGroup = groups.find((group) => group.label === page.group);

    if (existingGroup) {
      existingGroup.items.push(page);
      return groups;
    }

    groups.push({ label: page.group, items: [page] });
    return groups;
  }, [] as Array<{ label: string; items: SearchPage[] }>);

  if (!user || pages.length === 0) {
    return null;
  }

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSelect = (path: string) => {
    setOpen(false);
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <div
      data-global-page-search={open ? "open" : "closed"}
      className={cn(
        "relative min-w-0 w-full transition-all duration-200 ease-out",
        className,
        open && "absolute inset-y-0 left-0 right-0 z-20 flex items-center",
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "global-page-search-trigger header-action h-10 w-full justify-start rounded-[20px] px-3 text-left transition-all duration-200 md:h-11 md:px-4",
              open && "rounded-[24px] shadow-xl shadow-slate-200/40 dark:shadow-black/25",
            )}
            aria-label="Search pages"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate text-sm font-medium text-foreground/80">Search pages</span>
            <span className="ml-auto hidden lg:inline text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {pages.length} pages
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          style={{
            width: "var(--radix-popover-trigger-width)",
            maxWidth: "calc(100vw - 1rem)",
          }}
          className="overflow-hidden rounded-[24px] border-white/60 bg-white/92 p-0 shadow-2xl shadow-slate-200/60 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92 dark:shadow-black/35"
        >
          <Command className="bg-transparent">
            <div className="relative">
              <CommandInput
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search for a page..."
                className="pr-10"
              />
              <button
                type="button"
                aria-label={query ? "Clear search" : "Close search"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (query) {
                    setQuery("");
                    return;
                  }

                  setOpen(false);
                }}
                className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CommandList className="max-h-[22rem]">
              <CommandEmpty>No matching page found.</CommandEmpty>
              {pageGroups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.items.map((page) => {
                    const Icon = page.icon;
                    const isActive = isCurrentPage(page, location.pathname);

                    return (
                      <CommandItem
                        key={page.path}
                        value={[page.label, page.description, ...page.keywords].join(" ")}
                        onSelect={() => handleSelect(page.path)}
                        className="gap-3 rounded-xl px-3 py-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-200">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-semibold text-foreground">{page.label}</span>
                          <span className="truncate text-xs text-muted-foreground">{page.description}</span>
                        </span>
                        {isActive ? (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                            Current
                          </span>
                        ) : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
