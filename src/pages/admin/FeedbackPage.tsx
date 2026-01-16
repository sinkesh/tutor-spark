import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  ThumbsDown,
  AlertTriangle,
  Brain,
  CheckCircle,
  XCircle,
  ChevronRight,
  FileText,
  Edit2,
  Upload,
  Bot,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  studentQuestion: string;
  aiResponse: string;
  confidenceScore: number;
  agentName: string;
  agentId: string;
  timestamp: string;
  type: 'negative' | 'low_confidence' | 'hallucination';
  status: 'pending' | 'resolved';
  sourcesUsed: string[];
}

const mockFeedback: FeedbackItem[] = [
  {
    id: '1',
    studentQuestion: 'What is the derivative of e^x?',
    aiResponse: 'The derivative of e^x is x*e^(x-1).',
    confidenceScore: 45,
    agentName: 'Advanced Mathematics Tutor',
    agentId: '1',
    timestamp: '2024-01-20 14:32:15',
    type: 'negative',
    status: 'pending',
    sourcesUsed: ['Calculus_Fundamentals.pdf'],
  },
  {
    id: '2',
    studentQuestion: 'Explain quantum entanglement',
    aiResponse: 'Quantum entanglement is when particles are connected and measuring one affects the other instantaneously...',
    confidenceScore: 32,
    agentName: 'Physics Teacher',
    agentId: '2',
    timestamp: '2024-01-20 13:15:00',
    type: 'low_confidence',
    status: 'pending',
    sourcesUsed: [],
  },
  {
    id: '3',
    studentQuestion: 'Who wrote Romeo and Juliet?',
    aiResponse: 'Romeo and Juliet was written by Christopher Marlowe in 1597.',
    confidenceScore: 78,
    agentName: 'English Literature Guide',
    agentId: '3',
    timestamp: '2024-01-20 11:45:22',
    type: 'hallucination',
    status: 'pending',
    sourcesUsed: ['Literature_Handbook.pdf'],
  },
  {
    id: '4',
    studentQuestion: 'What is mitosis?',
    aiResponse: 'Mitosis is a type of cell division that results in two daughter cells...',
    confidenceScore: 91,
    agentName: 'Biology Tutor',
    agentId: '4',
    timestamp: '2024-01-19 16:20:00',
    type: 'negative',
    status: 'resolved',
    sourcesUsed: ['Cell_Biology.pdf', 'Biology_Basics.docx'],
  },
];

const stats = {
  pendingItems: 3,
  resolvedToday: 12,
  avgImprovementScore: 18,
  criticalIssues: 1,
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState(mockFeedback);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  const getTypeIcon = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'negative':
        return <ThumbsDown className="w-4 h-4" />;
      case 'low_confidence':
        return <Brain className="w-4 h-4" />;
      case 'hallucination':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'negative':
        return <Badge variant="destructive">Negative Feedback</Badge>;
      case 'low_confidence':
        return <Badge className="bg-amber-500/10 text-amber-600">Low Confidence</Badge>;
      case 'hallucination':
        return <Badge className="bg-red-500/10 text-red-600">Possible Hallucination</Badge>;
    }
  };

  const markAsResolved = (id: string) => {
    setFeedback(feedback.map(f => 
      f.id === id ? { ...f, status: 'resolved' as const } : f
    ));
    setSelectedItem(null);
  };

  const pendingFeedback = feedback.filter(f => f.status === 'pending');
  const resolvedFeedback = feedback.filter(f => f.status === 'resolved');

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Feedback & Learning</h1>
              <p className="text-muted-foreground">Review and improve AI responses based on real interactions</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.pendingItems}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.resolvedToday}</p>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">+{stats.avgImprovementScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg Improvement</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-destructive">{stats.criticalIssues}</p>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="col-span-2">
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingFeedback.length})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({resolvedFeedback.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4 space-y-3">
                {pendingFeedback.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedItem?.id === item.id ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeBadge(item.type)}
                            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                          </div>
                          <p className="font-medium mb-1">"{item.studentQuestion}"</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.aiResponse}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Bot className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{item.agentName}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{item.confidenceScore}% confidence</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="resolved" className="mt-4 space-y-3">
                {resolvedFeedback.map((item) => (
                  <Card key={item.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Resolved</Badge>
                            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                          </div>
                          <p className="font-medium mb-1">"{item.studentQuestion}"</p>
                          <p className="text-sm text-muted-foreground">{item.agentName}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Detail Panel */}
          <div>
            {selectedItem ? (
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(selectedItem.type)}
                    Review Issue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Student Question</label>
                    <p className="mt-1 p-3 bg-secondary rounded-lg">{selectedItem.studentQuestion}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">AI Response</label>
                    <p className="mt-1 p-3 bg-secondary rounded-lg text-sm">{selectedItem.aiResponse}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                      <p className={`font-semibold ${selectedItem.confidenceScore < 50 ? 'text-destructive' : ''}`}>
                        {selectedItem.confidenceScore}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Agent</label>
                      <p className="font-semibold">{selectedItem.agentName}</p>
                    </div>
                  </div>

                  {selectedItem.sourcesUsed.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sources Used</label>
                      <div className="mt-1 space-y-1">
                        {selectedItem.sourcesUsed.map((source, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4" />
                            {source}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold">Actions</h4>
                    <Button className="w-full" variant="outline">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Agent Prompt
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Corrective Content
                    </Button>
                    <Button 
                      className="w-full" 
                      onClick={() => markAsResolved(selectedItem.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an item to review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
