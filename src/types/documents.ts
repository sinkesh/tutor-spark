export interface AgentDocument {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  upload_date?: string;
  pages?: number;
  subject?: string;
  class_name?: string;
  agent_id?: string;
  agent_name?: string;
}

export interface DocumentMetadata extends AgentDocument {
  content_type?: string;
  created_at?: string;
  updated_at?: string;
  download_url?: string;
  preview_available?: boolean;
}

export interface DocumentPreview {
  id: string;
  content: string;
  content_type: 'text' | 'pdf' | 'markdown' | 'html' | 'binary';
  pages?: number;
  current_page?: number;
  total_pages?: number;
  metadata?: DocumentMetadata;
}

export interface DocumentPreviewState {
  documents: AgentDocument[];
  selectedDocument: DocumentPreview | null;
  isLoading: boolean;
  error: string | null;
  isListModalOpen: boolean;
  isPreviewModalOpen: boolean;
}

// For the new API response format
export interface AgentDocumentsResponse {
  documents?: string[]; // Array of document IDs
  document_ids?: string[]; // Alternative field name
  data?: string[]; // Another alternative field name
}
