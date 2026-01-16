import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Beaker,
  Send,
  Bot,
  FileText,
  Settings2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

const mockAgents = [
  { id: '1', name: 'Advanced Mathematics Tutor' },
  { id: '2', name: 'Physics Teacher' },
  { id: '3', name: 'English Literature Guide' },
  { id: '4', name: 'Biology Tutor' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  chunks?: string[];
}

export default function SandboxPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [globalPromptsEnabled, setGlobalPromptsEnabled] = useState(true);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [showChunks, setShowChunks] = useState<number | null>(null);

  const handleSend = () => {
    if (!message.trim() || !selectedAgent) return;

    const userMessage: Message = { role: 'user', content: message };
    const assistantMessage: Message = {
      role: 'assistant',
      content: `This is a simulated response to: "${message}"\n\nIn production, this response would come from the ${mockAgents.find(a => a.id === selectedAgent)?.name} agent.${ragEnabled ? '\n\nRelevant knowledge base chunks were retrieved and used.' : ''}\n${globalPromptsEnabled ? '\nGlobal prompts were applied to this response.' : ''}`,
      confidence: Math.floor(Math.random() * 20) + 80,
      chunks: ragEnabled ? [
        'Chunk 1: Retrieved from Calculus_Fundamentals.pdf, page 42...',
        'Chunk 2: Retrieved from Mathematics_Guide.docx, section 3.2...',
        'Chunk 3: Retrieved from Problem_Solving.pdf, page 15...',
      ] : undefined,
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setMessage('');
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <AdminLayout>
      <div className="p-8 h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <Beaker className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Testing Sandbox</h1>
              <p className="text-muted-foreground">Test AI agents before deploying to students</p>
            </div>
          </div>
          <Button variant="outline" onClick={clearChat}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 h-[calc(100%-5rem)]">
          {/* Settings Panel */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5" />
                Test Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Agent</label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Global Prompts</span>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Switch
                    checked={globalPromptsEnabled}
                    onCheckedChange={setGlobalPromptsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">RAG Retrieval</span>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Switch
                    checked={ragEnabled}
                    onCheckedChange={setRagEnabled}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Current Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Agent</span>
                    <span className="font-medium">
                      {selectedAgent ? mockAgents.find(a => a.id === selectedAgent)?.name.split(' ')[0] : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Global Prompts</span>
                    <Badge variant={globalPromptsEnabled ? 'default' : 'secondary'}>
                      {globalPromptsEnabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">RAG</span>
                    <Badge variant={ragEnabled ? 'default' : 'secondary'}>
                      {ragEnabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="col-span-3 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {selectedAgent 
                      ? mockAgents.find(a => a.id === selectedAgent)?.name 
                      : 'Select an Agent'
                    }
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Testing Mode</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Beaker className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Start a test conversation</p>
                      <p className="text-sm">Select an agent and send a message to begin testing</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx}>
                      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          {msg.confidence && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-primary-foreground/20">
                              <span className="text-xs opacity-80">
                                Confidence: {msg.confidence}%
                              </span>
                              {msg.chunks && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => setShowChunks(showChunks === idx ? null : idx)}
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Chunks
                                  {showChunks === idx ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {showChunks === idx && msg.chunks && (
                        <div className="mt-2 ml-4 p-3 bg-muted rounded-lg text-sm space-y-2">
                          <p className="font-medium text-muted-foreground">Retrieved Chunks:</p>
                          {msg.chunks.map((chunk, cidx) => (
                            <p key={cidx} className="text-xs text-muted-foreground">{chunk}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={selectedAgent ? "Type a test message..." : "Select an agent first..."}
                    disabled={!selectedAgent}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!selectedAgent || !message.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
