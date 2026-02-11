/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { API_URL } from "../api_urls";
import { BASE_URL, VERSION } from "../api_urls";
import { CreateStudent, StudentQuery } from "@/types";

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
