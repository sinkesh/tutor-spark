export interface Conversation {
  conversation_id: string;
  query: string;
  response: string;
  timestamp: string;
  feedback: string;
  confusion_type: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  conversations: Conversation[];
}

export interface Agent {
  agent_id: string;
  subject: string;
  sessions: Session[];
  total_conversations: number;
}

export interface ConversationHistoryData {
  student_id: string;
  agents: Agent[];
  total_conversations: number;
  total_sessions: number;
}
