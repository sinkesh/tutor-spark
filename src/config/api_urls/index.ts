// export const BASE_URL = "https://api.tecorb.in";
export const BASE_URL = "http://localhost:8000";
export const VERSION = "/api/v1";

export const API_URL = {
  CREATE_VECTORS: "/vectors/create_vectors",
  ALL_COLLECTIONS: "/vectors/all_collections",
  AGENT_OF_CLASS: "/vectors/agent_of_class",
  AGENT_QUERY: "/student/agent-query",
  CREATE_STUDENT: "/auth/create-student-with-auth",
  LIST_STUDENT: "/student/student-list",
  STUDENT: "/student",
  VECTORS: "/vectors",
  STUDENT_FEEDBACK: "/student/feedback",
  LOGIN: "/auth/login",
  CHANGE_PASSWORD: "/auth/admin/admin-reset-student-password",
  STUDENT_HISTORY: "/student/std_VIWG3/history/English",
  STUDENT_AGENT: "/vectors/student",
  AGENT_PERFORMANCE: "/performance/all-agents-performance",
  SINGAL_AGENT_PERFORMANCE: "/performance/agent-performance",
  RECENT_ACTIVITY: "/activity/recent",
  DASHBOARD_COUNTS: "/admin/dashboard-counts",
  GLOBAL_PROMPT_ENABLE: "/admin/global-prompt/enable",
  SHARED_KNOWLEDGE_UPLOAD: "/admin/shared-knowledge/upload",
  GLOBAL_RAG_KNOWLEDGE: "/admin/global-rag-knowledge",
  SHARED_KNOWLEDGE_ENABLE: "/admin/shared-knowledge",
  GLOBAL_PROMPTS: "/admin/global-prompts",
  STUDENT_AGENT_DOCUMENTS: "/student/documents/agent-documents",
  STUDENT_DOCUMENT_METADATA: "/student/{student_id}/agents/{agent_id}/documents/{document_id}",
  STUDENT_DOCUMENT_PREVIEW: "/student/{student_id}/agents/{agent_id}/documents/{document_id}/preview",
  TOPICS_EXTRACT: "/topics/extract",
  TOPICS_PREVIEW: "/topics/extract/preview",
};
