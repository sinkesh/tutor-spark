export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  agent_type: 'subject' | 'class' | 'course' | 'teacher';
  agent_name: string;
  agent_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
  is_archived: boolean;
  preview_message?: string;
}

export interface StudentSubject {
  subject_agent_id: string;
  name: 'Math' | 'Science' | 'Physics' | 'Chemistry' | 'Biology' | 'English' | 'History' | 'Geography';
  description?: string;
}

export interface Subtopic {
  subtopic: string;
  description: string;
  confidence?: number;
}

export interface Topic {
  topic: string;
  description: string;
  confidence?: number;
  subtopics?: Subtopic[];
}

export interface QuizQuestion {
  question_number: number;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  conversation_id?: string;
  role: 'user' | 'assistant';
  content?: string;
  message_type: 'text' | 'notes' | 'study_plan' | 'quiz';
  metadata?: {
    notes?: {
      topic?: string;
      notes?: string;
      // Structured notes from backend (intent: notes)
      title?: string;
      description?: string;
      format?: string;
      detail_level?: string;
      sections?: { heading: string; content: string }[];
      key_points?: string[];
      definitions?: { term: string; definition: string }[];
      summary?: string;
    };
    study_plan?: {
      // Legacy
      study_plan?: string;
      subject?: string;
      topic?: string;
      // Structured from backend (intent: study_plan)
      title?: string;
      description?: string;
      level?: string;
      duration_days?: number;
      schedule?: {
        day: number;
        focus: string;
        tasks: string[];
        duration_minutes?: number;
        resources?: string[];
      }[];
      milestones?: { milestone: string; by_day: number }[];
      key_concepts?: string[];
      subtopics?: string[];
      summary?: string;
      full_plan?: string;
    };
    quiz?: {
      title?: string;
      description?: string;
      message?: string;
      feedback?: string;
      // Multi-question flow
      questions?: QuizQuestion[];
      current_question_index?: number;
      user_answers?: Record<number, string>;
      // Legacy single-question flow
      question?: {
        question_number: number;
        total_questions: number;
        question: string;
        options: string[];
      };
      final_score?: string;
    };
  };
  created_at: string;
  feedback?: 'like' | 'dislike';
}

export interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  
  // Actions
  createSession: (agentType: string, agentName: string, agentId?: string) => Promise<ChatSession | null>;
  switchSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, title: string) => Promise<void>;
  archiveSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
}
