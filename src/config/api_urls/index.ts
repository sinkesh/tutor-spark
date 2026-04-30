// export const BASE_URL = "https://api.tecorb.in";
export const BASE_URL = "http://localhost:8000";
export const VERSION = "/api/v1";

export const API_URL = {
  CREATE_VECTORS: "/admin/vectors/create",
  ALL_COLLECTIONS: "/admin/vectors/collections",
  AGENT_OF_CLASS: "/admin/vectors/agents/by-class",
  AGENT_QUERY: "/student/agent-query",
  CREATE_STUDENT: "/admin/users/students",
  LIST_STUDENT: "/admin/users/students",
  STUDENT: "/admin/users/students",
  VECTORS: "admin/vectors",
  STUDENT_FEEDBACK: "/student/feedback",
  // Auth endpoints
  LOGIN: "/login",
  STUDENT_SIGNUP: "/signup",
  ADMIN_SIGNUP: "/admin/signup",
  CHANGE_PASSWORD: "/auth/admin/admin-reset-student-password",
  STUDENT_HISTORY: "/student/std_VIWG3/history/English",
  STUDENT_AGENT: "/admin/vectors/student",
  AGENT_PERFORMANCE: "/performance/all-agents-performance",
  SINGAL_AGENT_PERFORMANCE: "/performance/agent-performance",
  RECENT_ACTIVITY: "admin/activity/recent",
  ADMIN_DASHBOARD_STATS: "/admin/dashboard/stats",
  ADMIN_VECTORS_COLLECTIONS: "/admin/vectors/collections",
  GLOBAL_PROMPT_ENABLE: "/admin/global-prompt/enable",
  SHARED_KNOWLEDGE_UPLOAD: "/admin/shared-knowledge/upload",
  GLOBAL_RAG_KNOWLEDGE: "/admin/global-rag-knowledge",
  SHARED_KNOWLEDGE_ENABLE: "/admin/shared-knowledge",
  GLOBAL_PROMPTS: "/admin/global-prompts",
  STUDENT_AGENT_DOCUMENTS: "/student/documents/agent-documents",
  STUDENT_DOCUMENT_METADATA: "/student/{student_id}/agents/{agent_id}/documents/{document_id}",
  STUDENT_DOCUMENT_PREVIEW: "/student/{student_id}/agents/{agent_id}/documents/{document_id}/preview",
  TOPICS_EXTRACT: "agent/topics/extract",
  TOPICS_PREVIEW: "agent/topics/extract/preview",
  STUDENT_CHAT_SESSIONS: "/student/sessions/chat-sessions",
  STUDENT_CHAT_SESSIONS_BASE: "/student/chat-sessions",
  STUDENT_CHAT_SESSIONS_GET: "/student/chat",  // GET /student/chat/{student_id}/sessions
  STUDENT_SESSIONS_BASE: "/student/sessions",  // Base for PUT/DELETE /student/sessions/{id}/chat-sessions/{id}
  // Student agent endpoints
  STUDENT_AGENT_TOPICS: "/student/agents",
  STUDENT_AGENT_KNOWLEDGE: "/student/agents",
};
