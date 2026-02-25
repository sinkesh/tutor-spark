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
    if (!window.location.pathname.includes('/login')) {
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
    "User-Agent": "MyCustomAgent/1.0",
    "ngrok-skip-browser-warning": true,
  },
});

const apiDataJson = axios.create({
  baseURL: BASE_URL + VERSION,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "MyCustomAgent/1.0",
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
