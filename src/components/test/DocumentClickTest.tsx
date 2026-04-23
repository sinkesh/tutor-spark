import React from 'react';
import { AgentDocument } from '@/types/documents';

// Test component to demonstrate global document click handling
export default function DocumentClickTest() {
  // Sample document for testing
  const testDocument: AgentDocument = {
    id: 'test-doc-123',
    name: 'Test Mathematics Document',
    title: 'Test Mathematics Document',
    file_name: 'math_test.pdf',
    agent_id: 'agent_mathematics',
    agent_name: 'Mathematics'
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Global Document Click Test</h2>
      <p className="text-sm text-muted-foreground">
        Click on any document element with data attributes to test global click handling.
      </p>
      
      {/* Test document with data attributes */}
      <div
        className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
        data-document-id={testDocument.id}
        data-document-name={testDocument.name}
        data-document-file-name={testDocument.file_name}
        data-document-agent-id={testDocument.agent_id}
        data-document-agent-name={testDocument.agent_name}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
            📄
          </div>
          <div>
            <h3 className="font-medium">{testDocument.title}</h3>
            <p className="text-sm text-muted-foreground">{testDocument.agent_name}</p>
          </div>
        </div>
      </div>

      {/* Another test document */}
      <div
        className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
        data-document-id="test-doc-456"
        data-document-name="Science Test Document"
        data-document-file-name="science_test.pdf"
        data-document-agent-id="agent_science"
        data-document-agent-name="Science"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
            🔬
          </div>
          <div>
            <h3 className="font-medium">Science Test Document</h3>
            <p className="text-sm text-muted-foreground">Science</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">How it works:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Click on any document element above</li>
          <li>The global click handler will detect the click</li>
          <li>Documents will open in split view</li>
          <li>Document preview will be loaded automatically</li>
        </ol>
      </div>
    </div>
  );
}
