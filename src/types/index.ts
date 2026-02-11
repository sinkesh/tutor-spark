export type UserRole = "admin" | "student";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type AgentType = "class" | "subject" | "course" | "teacher";
export type AgentStatus = "active" | "draft" | "disabled";

export interface AIAgent {
  id: string;
  agent_type: string;
  agent_name: string;
  status: AgentStatus;
  description: string;
  educationLevel: string;
  learningObjectives: string[];
  assignedStudents: number;
  accuracyScore: number;
  totalConversations: number;
}

// export interface AIAgent {
//   id: string;
//   name: string;
//   description: string;
//   type: AgentType;
//   status: AgentStatus;
//   educationLevel: string;
//   learningObjectives: string[];
//   teachingTone?: string;
//   assignedStudents: number;
//   accuracyScore: number;
//   totalConversations: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

export interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KPIData {
  totalAgents: number;
  activeStudents: number;
  totalConversations: number;
  avgAccuracyScore: number;
}

export interface FolderItem {
  id: string;
  name: string;
  type: "class" | "subject" | "course" | "agent";
  children?: FolderItem[];
  agentId?: string;
}

export interface StudentQuery {
  student_id: string;
  subject: string;
  class_name: string;
  query: string;
}

export interface CreateStudent {
  name: string;
  email: string;
  class_name: string;
  subject_agent: [
    {
      name: string;
    }
  ];
}
