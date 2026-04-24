import type { UserRole } from "@/types";

export const APP_BASENAME: string = "/Teacher_AI_Agent";

const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

export const appRoutes = {
  root: "/",
  login: "/login",
  admin: {
    root: "/admin",
    login: "/admin/login",
    agents: "/admin/agents",
    createAgent: "/admin/agents/create",
    agentDetail: (agentId: string) => `/admin/agents/${agentId}`,
    globalKnowledge: "/admin/global-knowledge",
    feedback: "/admin/feedback",
    analytics: "/admin/analytics",
    sandbox: "/admin/sandbox",
    students: "/admin/students",
    settings: "/admin/settings",
  },
  student: {
    root: "/student",
    login: "/student/login",
    explore: "/student/explore",
    chat: "/student/chat",
    chatSession: (sessionId: string) => `/student/chat/session/${sessionId}`,
    newSubjectChat: (subjectName: string) =>
      `/student/chat/new/subject/${subjectName}`,
    legacyChat: (subjectName: string) => `/student/chat/${subjectName}`,
    history: "/student/history",
    conversationHistory: "/student/conversation-history",
    profile: "/student/profile",
  },
} as const;

export const roleHomeRoutes: Record<UserRole, string> = {
  admin: appRoutes.admin.root,
  student: appRoutes.student.root,
};

export const roleLoginRoutes: Record<UserRole, string> = {
  admin: appRoutes.admin.login,
  student: appRoutes.student.login,
};

export function getHomeRouteForRole(role?: UserRole | null) {
  return role === "admin" ? appRoutes.admin.root : appRoutes.student.root;
}

export function getLoginRouteForRole(role?: UserRole | null) {
  if (role === "admin") return appRoutes.admin.login;
  if (role === "student") return appRoutes.student.login;

  return appRoutes.student.login;
}

export function stripAppBasename(pathname: string) {
  if (!APP_BASENAME || APP_BASENAME === "/") {
    return pathname;
  }

  if (!pathname.startsWith(APP_BASENAME)) {
    return pathname;
  }

  const strippedPath = pathname.slice(APP_BASENAME.length);
  return strippedPath || "/";
}

export function buildAppHref(path: string) {
  const normalizedPath = normalizePath(path);

  if (!APP_BASENAME || APP_BASENAME === "/") {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return APP_BASENAME;
  }

  return `${APP_BASENAME}${normalizedPath}`.replace(/\/{2,}/g, "/");
}

export function getRoleFromPathname(pathname: string): UserRole | null {
  const normalizedPath = stripAppBasename(pathname);

  if (
    normalizedPath === appRoutes.admin.root ||
    normalizedPath.startsWith(`${appRoutes.admin.root}/`)
  ) {
    return "admin";
  }

  if (
    normalizedPath === appRoutes.student.root ||
    normalizedPath.startsWith(`${appRoutes.student.root}/`)
  ) {
    return "student";
  }

  return null;
}

export function isLoginRoute(pathname: string) {
  const normalizedPath = stripAppBasename(pathname);

  return (
    normalizedPath === appRoutes.login ||
    normalizedPath === appRoutes.admin.login ||
    normalizedPath === appRoutes.student.login
  );
}

export function isRoleWorkspaceRoute(pathname: string, role: UserRole) {
  const normalizedPath = stripAppBasename(pathname);
  const roleRoot = getHomeRouteForRole(role);
  const roleLogin = getLoginRouteForRole(role);

  return (
    normalizedPath === roleRoot ||
    (normalizedPath.startsWith(`${roleRoot}/`) && normalizedPath !== roleLogin)
  );
}