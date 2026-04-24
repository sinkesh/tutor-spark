/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { API_URL } from "../api_urls";
import { BASE_URL, VERSION } from "../api_urls";
import { CreateStudent, StudentQuery } from "@/types";
import type { UserRole } from "@/types";
import {
  buildAppHref,
  getLoginRouteForRole,
  getRoleFromPathname,
  isLoginRoute,
} from "@/config/routes";

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

const getStoredPortalRole = (): UserRole | null => {
  const storedRole = localStorage.getItem("last_portal_role");
  return storedRole === "admin" || storedRole === "student" ? storedRole : null;
};

// Response interceptor to handle 401 errors
const handleUnauthorized = (error: any) => {
  if (error.response?.status === 401) {
    // Only redirect if not already on login page to prevent redirect loops
    if (!isLoginRoute(window.location.pathname)) {
      const roleFromPath = getRoleFromPathname(window.location.pathname);
      const loginRoute = getLoginRouteForRole(roleFromPath ?? getStoredPortalRole());

      // Clear auth data and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = buildAppHref(loginRoute);
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

export const getDashboardCounts = async (): Promise<any> => {
  const response = await apiDataJson.get(`${API_URL.DASHBOARD_COUNTS}`);
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
    const response = await api.get(`${API_URL.VECTORS}/${agentId}/documents`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch documents for agent ${agentId}:`, error);
    throw error;
  }
};

export const getAgentTopics = async (agentId: string) => {
  try {
    const response = await apiDataJson.get(`${API_URL.VECTORS}/${agentId}/topics`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch topics for agent ${agentId}:`, error);
    throw error;
  }
};

export const getAgentKnowledgeBase = async (agentId: string) => {
  try {
    const response = await apiDataJson.get(`${API_URL.VECTORS}/${agentId}/knowledge-base`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch knowledge base for agent ${agentId}:`, error);
    throw error;
  }
};

export const getRecentActivityStudent = async (studentId: string) => {
  const response = await apiDataJson.get(
    `${API_URL.STUDENT}/${studentId}/recent-activity`,
  );
  return response.data;
};

// Chat Sessions API - Updated to match existing backend
export const getChatSessions = async (userId: string) => {
  console.log("Getting chat sessions for user:", userId);
  const response = await apiDataJson.get(`${API_URL.STUDENT}/${userId}/chat-sessions`);
  console.log("Get sessions response:", response);
  console.log("Response data:", response.data);
  return response.data;
};

export const createChatSession = async (data: {
  student_id: string;
  title: string;
  agent_type?: string;
  agent_name?: string;
  agent_id?: string;
}) => {
  console.log("API call: POST /student/chat-sessions", data);
  const response = await apiDataJson.post(`${API_URL.STUDENT}/chat-sessions`, {
    student_id: data.student_id,
    title: data.title,
    agent_type: data.agent_type,
    agent_name: data.agent_name,
    agent_id: data.agent_id,
  });
  console.log("API response:", response);
  console.log("Response data:", response.data);
  return response.data;
};

export const getChatSession = async (userId: string, sessionId: string) => {
  const response = await apiDataJson.get(`${API_URL.STUDENT}/${userId}/chat-sessions/${sessionId}`);
  return response.data;
};

export const updateChatSession = async (userId: string, sessionId: string, data: {
  title?: string;
}) => {
  const response = await apiDataJson.put(`${API_URL.STUDENT}/${userId}/chat-sessions/${sessionId}`, data);
  return response.data;
};

export const deleteChatSession = async (userId: string, sessionId: string) => {
  console.log("Deleting chat session:", sessionId, "for user:", userId);
  const url = `${API_URL.STUDENT}/${userId}/chat-sessions/${sessionId}`;
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
  const response = await apiDataJson.get(
    `${API_URL.STUDENT}/${userId}/chat-sessions/${sessionId}/history?limit=${limit}`
  );
  return response.data;
};

export const sendChatMessage = async (data: {
  student_id: string;
  subject: string;
  class_name: string;
  query: string;
  chat_session_id?: string;
}) => {
  console.log("API call: POST /student/agent-query", data);
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
  conversation_id: string;
  feedback: string;
  rating?: number;
}) => {
  const response = await apiDataJson.post(API_URL.STUDENT_FEEDBACK, data);
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
  const response = await apiDataJson.get(`${API_URL.STUDENT}/conversation-history/${studentId}`);
  console.log('Conversation history response:', response);
  return response.data;
};
