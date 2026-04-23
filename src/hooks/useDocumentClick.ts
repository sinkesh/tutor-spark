import { useEffect, useCallback } from 'react';
import { AgentDocument } from '@/types/documents';

interface UseDocumentClickProps {
  onDocumentClick?: (document: AgentDocument) => void;
  enabled?: boolean;
}

export function useDocumentClick({ onDocumentClick, enabled = true }: UseDocumentClickProps) {
  const handleGlobalClick = useCallback((event: MouseEvent) => {
    if (!enabled || !onDocumentClick) return;

    const target = event.target as HTMLElement;
    
    // Look for document elements with data-document attribute
    const documentElement = target.closest('[data-document-id]');
    
    if (documentElement) {
      const documentId = documentElement.getAttribute('data-document-id');
      const documentName = documentElement.getAttribute('data-document-name') || '';
      const documentFileName = documentElement.getAttribute('data-document-file-name') || '';
      const agentId = documentElement.getAttribute('data-document-agent-id') || '';
      const agentName = documentElement.getAttribute('data-document-agent-name') || '';

      if (documentId) {
        const document: AgentDocument = {
          id: documentId,
          name: documentName,
          title: documentName,
          file_name: documentFileName,
          agent_id: agentId,
          agent_name: agentName
        };
        
        onDocumentClick(document);
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, [enabled, onDocumentClick]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('click', handleGlobalClick, true);
      
      return () => {
        document.removeEventListener('click', handleGlobalClick, true);
      };
    }
  }, [handleGlobalClick, enabled]);
}
