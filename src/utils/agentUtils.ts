import { toast } from "sonner";

export interface AgentResolutionError extends Error {
  code: 'AGENT_NOT_FOUND' | 'STUDENT_NOT_FOUND' | 'NETWORK_ERROR' | 'INVALID_RESPONSE';
  subjectName?: string;
  studentId?: string;
}

export class AgentResolutionError extends Error implements AgentResolutionError {
  code: AgentResolutionError['code'];
  subjectName?: string;
  studentId?: string;

  constructor(
    message: string,
    code: AgentResolutionError['code'],
    options?: { subjectName?: string; studentId?: string }
  ) {
    super(message);
    this.name = 'AgentResolutionError';
    this.code = code;
    this.subjectName = options?.subjectName;
    this.studentId = options?.studentId;
  }
}

export const handleAgentResolutionError = (error: any, subjectName?: string) => {
  console.error('Agent resolution error:', error);
  
  if (error instanceof AgentResolutionError) {
    switch (error.code) {
      case 'AGENT_NOT_FOUND':
        toast.error(`No agent available for subject: ${subjectName || error.subjectName}`);
        break;
      case 'STUDENT_NOT_FOUND':
        toast.error('Student profile not found. Please log in again.');
        break;
      case 'NETWORK_ERROR':
        toast.error('Network error. Please check your connection and try again.');
        break;
      case 'INVALID_RESPONSE':
        toast.error('Invalid response from server. Please try again.');
        break;
      default:
        toast.error('Failed to load agent information. Please try again.');
    }
  } else {
    toast.error('An unexpected error occurred while loading agent information.');
  }
};

export const createFallbackAgent = (subjectName: string) => {
  console.warn(`Creating fallback agent for subject: ${subjectName}`);
  const normalizedSubject = subjectName.toLowerCase().replace(/\s+/g, '');
  
  return {
    agentType: "subject" as const,
    agentName: subjectName,
    agentId: `agent_${normalizedSubject}`,
    isFallback: true
  };
};

export const validateAgentInfo = (agentInfo: any) => {
  if (!agentInfo) {
    throw new AgentResolutionError(
      'Agent info is null or undefined',
      'INVALID_RESPONSE'
    );
  }

  if (!agentInfo.agentId) {
    throw new AgentResolutionError(
      'Agent ID is missing',
      'INVALID_RESPONSE'
    );
  }

  if (!agentInfo.agentName) {
    throw new AgentResolutionError(
      'Agent name is missing',
      'INVALID_RESPONSE'
    );
  }

  return true;
};

export const logAgentResolution = (step: string, data: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Agent Resolution - ${step}:`, data);
};

export const getAgentResolutionMetrics = () => {
  // This could be expanded to track resolution success rates, timing, etc.
  return {
    totalResolutions: 0,
    successfulResolutions: 0,
    fallbackUsed: 0,
    averageResolutionTime: 0
  };
};
