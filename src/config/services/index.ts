/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { API_URL } from "../api_urls";
import { BASE_URL, VERSION } from "../api_urls";
import { CreateStudent, StudentQuery } from "@/types";

// Create a function to get the auth token
const getAuthToken = () => {
  return localStorage.getItem("access_token");
};

// Request interceptor to add auth token
const addAuthToken = (config: any) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor to handle 401 errors
const handleUnauthorized = (error: any) => {
  if (error.response?.status === 401) {
    // Only redirect if not already on login page to prevent redirect loops
    if (!window.location.pathname.includes("/login")) {
      // Clear auth data and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }
  return Promise.reject(error);
};

const api = axios.create({
  baseURL: BASE_URL + VERSION,
  headers: {
    "Content-Type": "multipart/form-data",
    "ngrok-skip-browser-warning": true,
  },
});

const apiDataJson = axios.create({
  baseURL: BASE_URL + VERSION,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": true,
  },
});

// Add interceptors to both instances
[api, apiDataJson].forEach((instance) => {
  instance.interceptors.request.use(addAuthToken);
  instance.interceptors.response.use(
    (response) => response,
    handleUnauthorized,
  );
});

export const createAgents = (data: any) => {
  return api.post(API_URL.CREATE_VECTORS, data);
};

export const getAgents = async (): Promise<{ agents: any[] }> => {
  const response = await api.get(API_URL.ALL_COLLECTIONS);
  return response.data;
};

export const agentOfClass = async (data: { class_name: string }) => {
  const response = await apiDataJson.post(API_URL.AGENT_OF_CLASS, data);
  return response.data;
};

export const studentQueryChat = async (data: StudentQuery) => {
  const response = await apiDataJson.post(API_URL.AGENT_QUERY, data);
  return response.data;
};

export const createStudent = async (data: CreateStudent) => {
  const response = await apiDataJson.post(API_URL.CREATE_STUDENT, data);
  return response.data;
};

export const listStudent = async (): Promise<{
  students: any[];
  total: number;
}> => {
  const response = await api.get(API_URL.LIST_STUDENT);
  return response.data;
};

export const getStudentDetails = async (
  id: string,
): Promise<{
  student_id: string;
  subject_agent: any[];
  name: string;
  email: string;
  password: string;
  class_name: string;
}> => {
  const response = await api.get(`${API_URL.STUDENT}/${id}`);
  return response.data;
};

export const editStudentDetails = async (
  id: string,
  studentData: {
    name: string;
    email: string;
    class_name: string;
    subject_agent: Array<{ name: string }>;
  },
): Promise<{
  id: string;
  name: string;
  email: string;
  class_name: string;
  subject_agent: Array<{ name: string }>;
}> => {
  const response = await apiDataJson.put(
    `${API_URL.STUDENT}/${id}`,
    studentData,
  );
  return response.data;
};

export const deleteStudentDetails = async (id: string) => {
  const response = await apiDataJson.delete(`${API_URL.STUDENT}/${id}`);
  return response.data;
};

export const getAiAgentsDetails = async (
  agent_id: string,
): Promise<{
  subject_agent: any[];
  name: string;
  email: string;
  class_name: string;
}> => {
  const response = await api.get(`${API_URL.VECTORS}/${agent_id}`);
  return response.data;
};

export const deleteAiAgentsDetails = async (agent_id: string) => {
  const response = await api.delete(`${API_URL.VECTORS}/${agent_id}`);
  return response.data;
};

export const updateAiAgentsDetails = async (agent_id: string, data: any) => {
  const response = await api.put(`${API_URL.VECTORS}/${agent_id}`, data);
  return response.data;
};

export const studentFeedback = (data: any) => {
  return apiDataJson.post(API_URL.STUDENT_FEEDBACK, data);
};

export const login = (data: any) => {
  return apiDataJson.post(API_URL.LOGIN, data);
};

export const studentSignup = (data: { email: string; password: string; name: string }) => {
  return apiDataJson.post(API_URL.STUDENT_SIGNUP, data);
};

export const adminSignup = (data: { email: string; password: string; name: string }) => {
  return apiDataJson.post(API_URL.ADMIN_SIGNUP, data);
};

export const changePassword = (data: any, id: string) => {
  return apiDataJson.post(API_URL.CHANGE_PASSWORD + "/" + id, data);
};

export const getChatHistory = async (id: string): Promise<any> => {
  const response = await apiDataJson.get(`${API_URL.STUDENT_HISTORY}/${id}`);
  return response.data;
};

export const getStudentAgent = async (id: string): Promise<any> => {
  const response = await apiDataJson.get(
    `${API_URL.STUDENT_AGENT}/${id}/subjects`,
  );
  return response.data;
};

export const getStudentChatHis = async (
  id: string,
  subject: string,
): Promise<any> => {
  const response = await apiDataJson.get(
    `${API_URL.STUDENT}/${id}/history/${subject}`,
  );
  return response.data;
};

export const getAllAgentPerformance = async (): Promise<any> => {
  const response = await apiDataJson.get(`${API_URL.AGENT_PERFORMANCE}`);
  return response.data;
};

export const getSingleAgentPerformance = async (id: string): Promise<any> => {
  const response = await apiDataJson.get(
    `${API_URL.SINGAL_AGENT_PERFORMANCE}/${id}`,
  );
  return response.data;
};

export const getRecentActivity = async (): Promise<any> => {
  const response = await apiDataJson.get(`${API_URL.RECENT_ACTIVITY}`);
  return response.data;
};

export const getAdminDashboardStats = async (): Promise<{
  students: {
    total: number;
    total_sessions: number;
    total_messages: number;
  };
  agents: {
    total: number;
  };
  timestamp: string;
}> => {
  const response = await apiDataJson.get(`${API_URL.ADMIN_DASHBOARD_STATS}`);
  return response.data;
};

export const getAdminVectorsCollections = async (): Promise<{
  classes: Array<{
    class_name: string;
    subjects: Array<{
      subject: string;
      agent_id: string;
      chunk_count: number;
      document_count: number;
    }>;
  }>;
  total_classes: number;
  total_subjects: number;
  agents: Array<{
    agent_id: string;
    subject: string;
    class_name: string;
    chunk_count: number;
    document_count: number;
    status: string;
    created_at: string;
  }>;
  total_agents: number;
}> => {
  const response = await apiDataJson.get(`${API_URL.ADMIN_VECTORS_COLLECTIONS}`);
  return response.data;
};

export const globalPromptEnable = async (data: any) => {
  const response = await apiDataJson.post(API_URL.GLOBAL_PROMPT_ENABLE, data);
  return response.data;
};

export const sharedKnowledgeUpload = async (data: any) => {
  const response = await api.post(API_URL.SHARED_KNOWLEDGE_UPLOAD, data);
  return response.data;
};

export const globalRagKnowledge = async () => {
  const response = await apiDataJson.get(API_URL.GLOBAL_RAG_KNOWLEDGE);
  return response.data;
};

export const sharedKnowledgeEnable = async (data: any) => {
  const response = await apiDataJson.post(
    `${API_URL.SHARED_KNOWLEDGE_ENABLE}/${data.document_id}/enable`,
    data,
  );
  return response.data;
};

export const deleteRagKnowledge = async (document_id: any) => {
  const response = await apiDataJson.delete(
    `${API_URL.SHARED_KNOWLEDGE_ENABLE}/${document_id}`,
  );
  return response.data;
};

export const createGlobalPrompts = async (data: any) => {
  const response = await apiDataJson.post(API_URL.GLOBAL_PROMPTS, data);
  return response.data;
};

export const globalPrompts = async () => {
  const response = await apiDataJson.get(API_URL.GLOBAL_PROMPTS);
  return response.data;
};

export const deleteGlobalPrompts = async (id: any) => {
  const response = await apiDataJson.delete(API_URL.GLOBAL_PROMPTS + "/" + id);
  return response.data;
};

export const resolveAgentId = async (subjectName: string, studentId?: string): Promise<string | null> => {
  try {
    // First try to get from student-specific agents if student ID is provided
    if (studentId) {
      try {
        const studentSubjectsResponse = await getStudentAgent(studentId);
        const studentSubjects = studentSubjectsResponse.student_subjects || [];
        const generalSubjects = studentSubjectsResponse.general_subjects || [];
        
        // Try to find in student-specific subjects first, then general subjects
        const allSubjects = [...studentSubjects, ...generalSubjects];
        
        const matchingSubject = allSubjects.find((subject: any) => 
          subject.name?.toLowerCase() === subjectName?.toLowerCase() ||
          subject.subject?.toLowerCase() === subjectName?.toLowerCase()
        );
        
        if (matchingSubject?.subject_agent_id) {
          return matchingSubject.subject_agent_id;
        }
      } catch (studentError) {
        console.warn('Failed to fetch student subjects, trying general agents:', studentError);
        // Don't throw here, continue to try general agents
      }
    }
    
    // If not found in student subjects, try to get from all agents
    try {
      const agentsResponse = await getAgents();
      const agents = agentsResponse.agents || [];
      
      const matchingAgent = agents.find((agent: any) => 
        agent.subject?.toLowerCase() === subjectName?.toLowerCase() ||
        agent.agent_name?.toLowerCase() === subjectName?.toLowerCase()
      );
      
      if (matchingAgent?.subject_agent_id) {
        return matchingAgent.subject_agent_id;
      }
    } catch (agentsError) {
      console.warn('Failed to fetch all agents:', agentsError);
      // Don't throw here, return null at the end
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to resolve agent ID for subject ${subjectName}:`, error);
    return null;
  }
};

export const getAgentDocuments = async (agentId: string) => {
  try {
    // Use student endpoint instead of admin endpoint
    const response = await apiDataJson.post(API_URL.STUDENT_AGENT_DOCUMENTS, {
      agent_id: agentId
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch documents for agent ${agentId}:`, error);
    // Return empty data instead of throwing to prevent UI breakage
    return { documents: [], document_ids: [], doc_unique_ids: [] };
  }
};

export const getDocumentsByAgent = async (agentId: string) => {
  try {
    const response = await apiDataJson.get(
      `${API_URL.STUDENT_DOCUMENTS_BY_AGENT}/${agentId}?exclude_chunks=true`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch documents by agent ${agentId}:`, error);
    return { status: "error", documents: [], total_documents: 0 };
  }
};

export const getAgentTopics = async (agentId: string) => {
  try {
    // Try the extract topics endpoint which is available for students
    const response = await apiDataJson.get(`${API_URL.TOPICS_EXTRACT}/${agentId}`);
    return response.data;
  } catch (error: any) {
    // Silently handle 404 - topics endpoint may not exist for this agent
    if (error.response?.status === 404 || error.response?.status === 403) {
      console.warn(`Topics not available for agent ${agentId}:`, error.response?.status);
    } else {
      console.warn(`Failed to fetch topics for agent ${agentId}:`, error);
    }
    // Return empty data instead of throwing to prevent UI breakage
    return { topics: [], extracted_topics: [] };
  }
};

export const getAgentKnowledgeBase = async (agentId: string) => {
  try {
    // GET /admin/vectors/{subject_agent_id} - Returns agent details including chunks/knowledge
    const response = await apiDataJson.get(`${API_URL.VECTORS}/${agentId}`);
    return response.data;
  } catch (error: any) {
    // Silently handle 403/404 - admin endpoint may not be accessible to students
    if (error.response?.status === 403 || error.response?.status === 404) {
      console.warn(`Knowledge base not accessible for agent ${agentId}:`, error.response?.status);
    } else {
      console.warn(`Failed to fetch knowledge base for agent ${agentId}:`, error);
    }
    // Return empty data instead of throwing to prevent UI breakage
    return { knowledge: [], documents: [], subject_agent: [] };
  }
};

export const getRecentActivityStudent = async (studentId: string) => {
  const response = await apiDataJson.get(
    `${API_URL.STUDENT}/${studentId}/recent-activity`,
  );
  return response.data;
};

// Chat Sessions API - Uses student-specific endpoints
export const getChatSessions = async (userId: string) => {
  console.log("Getting chat sessions for user:", userId);
  // GET /student/chat/{student_id}/sessions
  const response = await apiDataJson.get(`${API_URL.STUDENT_CHAT_SESSIONS_GET}/${userId}/sessions`);
  console.log("Get sessions response:", response);
  console.log("Response data:", response.data);
  return response.data;
};

export const createChatSession = async (data: {
  student_id: string;
  subject: string;
  class_name: string;
  title: string;
  session_name: string;
  agent_type: string;
  agent_name: string;
  agent_id: string;
}) => {
  console.log("API call: POST /student/sessions/chat-sessions", data);
  const response = await apiDataJson.post(API_URL.STUDENT_CHAT_SESSIONS, {
    student_id: data.student_id,
    subject: data.subject,
    class_name: data.class_name,
    title: data.title,
    session_name: data.session_name,
    agent_type: data.agent_type,
    agent_name: data.agent_name,
    agent_id: data.agent_id,
  });
  console.log("API response:", response);
  console.log("Response data:", response.data);
  return response.data;
};

export const getChatSession = async (userId: string, sessionId: string) => {
  // GET /student/chat/{student_id}/sessions/{session_id}
  const response = await apiDataJson.get(`${API_URL.STUDENT_CHAT_SESSIONS_GET}/${userId}/sessions/${sessionId}`);
  return response.data;
};

export const updateChatSession = async (userId: string, sessionId: string, data: {
  title?: string;
}) => {
  // PUT /student/sessions/{student_id}/chat-sessions/{session_id}
  const url = `${API_URL.STUDENT_SESSIONS_BASE}/${userId}/chat-sessions/${sessionId}`;
  console.log("UPDATE URL:", url);
  const response = await apiDataJson.put(url, data);
  return response.data;
};

export const deleteChatSession = async (userId: string, sessionId: string) => {
  console.log("Deleting chat session:", sessionId, "for user:", userId);
  // DELETE /student/sessions/{student_id}/chat-sessions/{session_id}
  const url = `${API_URL.STUDENT_SESSIONS_BASE}/${userId}/chat-sessions/${sessionId}`;
  console.log("DELETE URL:", url);

  try {
    const response = await apiDataJson.delete(url);
    console.log("Delete session response:", response);
    console.log("Delete session data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Delete session API error:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    throw error;
  }
};

export const getChatMessages = async (userId: string, sessionId: string, limit = 50) => {
  // GET /student/chat/{student_id}/history/{session_id}?limit=50
  const response = await apiDataJson.get(
    `${API_URL.STUDENT_CHAT_SESSIONS_GET}/${userId}/history/${sessionId}?limit=${limit}`
  );
  return response.data;
};

export const sendChatMessage = async (data: {
  student_id: string;
  subject: string;
  class_name: string;
  query: string;
  session_id?: string;
  language?: string;
}) => {
  console.log("API call: POST /student/chat/agent-query", data);
  console.log("Full URL:", `${BASE_URL}${VERSION}${API_URL.AGENT_QUERY}`);

  try {
    const response = await apiDataJson.post(API_URL.AGENT_QUERY, data);
    console.log("Agent query response:", response);
    console.log("Response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Agent query failed:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    
    // Re-throw the error so the frontend can handle it
    throw error;
  }
};

export const updateMessageFeedback = async (data: {
  student_id: string;
  conversation_id: string;
  feedback: string;
}) => {
  const url = API_URL.STUDENT_FEEDBACK.replace('{student_id}', data.student_id);
  const response = await apiDataJson.post(url, {
    conversation_id: data.conversation_id,
    liked: data.feedback === 'like',
    comment: data.feedback,
  });
  return response.data;
};

// Document Preview API Services
export const getStudentAgentDocuments = async (studentId: string, agentId: string) => {
  const response = await apiDataJson.post(API_URL.STUDENT_AGENT_DOCUMENTS, {
    agent_id: agentId
  });
  return response.data;
};

export const getDocumentMetadata = async (studentId: string, agentId: string, documentId: string) => {
  const url = API_URL.STUDENT_DOCUMENT_METADATA
    .replace('{student_id}', studentId)
    .replace('{agent_id}', agentId)
    .replace('{document_id}', documentId);
  const response = await apiDataJson.get(url);
  return response.data;
};

export const previewDocument = async (studentId: string, agentId: string, documentId: string) => {
  const url = API_URL.STUDENT_DOCUMENT_PREVIEW
    .replace('{student_id}', studentId)
    .replace('{agent_id}', agentId)
    .replace('{document_id}', documentId);
  const response = await apiDataJson.get(url);
  return response.data;
};

// Additional helper function to get document details if needed
export const getDocumentDetails = async (studentId: string, agentId: string, documentId: string) => {
  try {
    // Try to get metadata first
    const metadata = await getDocumentMetadata(studentId, agentId, documentId);
    return metadata;
  } catch (error) {
    // If metadata fails, return basic info
    return {
      id: documentId,
      name: `Document ${documentId}`,
      title: `Document ${documentId}`,
      file_name: `document_${documentId}`,
      agent_id: agentId
    };
  }
};

// Topics Extraction API Services
export const extractTopicsFromAgent = async (agentId: string) => {
  console.log('Extracting topics from agent:', agentId);
  console.log('Full URL:', `${BASE_URL}${VERSION}${API_URL.TOPICS_EXTRACT}/${agentId}`);
  
  try {
    const response = await apiDataJson.get(`${API_URL.TOPICS_EXTRACT}/${agentId}`);
    console.log('Topics extraction response:', response);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Topics extraction failed:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const previewTopicsExtraction = async (agentId: string) => {
  console.log('Previewing topics extraction from agent:', agentId);
  
  try {
    const response = await apiDataJson.get(`${API_URL.TOPICS_EXTRACT}/${agentId}/preview`);
    console.log('Topics preview response:', response);
    return response.data;
  } catch (error) {
    console.error('Topics preview failed:', error);
    throw error;
  }
};

export const generateTTS = async (text: string) => {
  console.log('Generating TTS for text:', text.substring(0, 100) + '...');
  
  try {
    // Add timeout for faster response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${BASE_URL}/tts-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      'Accept': 'audio/mpeg,audio/wav,audio/ogg', // Accept multiple audio formats for better compatibility
      },
      body: JSON.stringify({
        text: text,
        voice: 'en-IN-NeerjaNeural',
        rate: '+30%'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
    }

    // Get audio blob and optimize for faster playback
    const audioBlob = await response.blob();
    
    // Create audio with optimized settings for smoother playback
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);
    
    // Optimize audio settings for smoother playback
    audio.preload = 'auto';
    audio.playbackRate = 1.05; // Slightly faster playback
    audio.volume = 0.9; // Consistent volume
    
    return audioBlob;
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw error;
  }
};

// Conversation History API Services
export const getConversationHistory = async (studentId: string) => {
  console.log('Getting conversation history for student:', studentId);
  const response = await apiDataJson.get(`${API_URL.CONVERSATION_HISTORY}/${studentId}`);
  console.log('Conversation history response:', response);
  return response.data;
};

// Bookmark API Services
export const createBookmark = async (studentId: string, data: {
  conversation_id: string;
  session_id?: string;
  subject: string;
  query?: string;
  response?: string;
  personal_notes?: string;
}) => {
  const response = await apiDataJson.post(`${API_URL.STUDENT_BOOKMARKS}/${studentId}`, data);
  return response.data;
};

export const getBookmarks = async (studentId: string) => {
  const response = await apiDataJson.get(`${API_URL.STUDENT_BOOKMARKS}/${studentId}`);
  return response.data;
};

export const updateBookmark = async (studentId: string, bookmarkId: string, personalNotes: string) => {
  const response = await apiDataJson.put(`${API_URL.STUDENT_BOOKMARKS}/${studentId}/${bookmarkId}`, {
    personal_notes: personalNotes,
  });
  return response.data;
};

export const deleteBookmark = async (studentId: string, bookmarkId: string) => {
  const response = await apiDataJson.delete(`${API_URL.STUDENT_BOOKMARKS}/${studentId}/${bookmarkId}`);
  return response.data;
};

// Profile API Services
export const getStudentProfile = async (studentId: string) => {
  const response = await apiDataJson.get(`${API_URL.STUDENT_PROFILE}/${studentId}`);
  return response.data;
};

export const updateStudentProfile = async (studentId: string, data: {
  name?: string;
  age?: number;
  class_name?: string;
  subjects?: string[];
  learning_style?: {
    pace?: string;
    explanation_depth?: string;
    example?: boolean;
    difficulty_level?: string;
    interaction_mode?: string;
    memory?: string;
  };
}) => {
  const response = await apiDataJson.put(`${API_URL.STUDENT_PROFILE}/${studentId}`, data);
  return response.data;
};
