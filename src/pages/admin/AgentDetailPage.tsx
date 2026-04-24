import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Bot,
  Users,
  MessageSquare,
  TrendingUp,
  FileText,
  Brain,
  TestTube,
  Clock,
  Upload,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import type { AIAgent } from "@/types";
import { appRoutes } from "@/config/routes";

// Mock agent data
const mockAgent: AIAgent = {
  id: "1",
  name: "Advanced Mathematics Tutor",
  description:
    "An AI tutor specialized in advanced mathematics including calculus, linear algebra, and statistics.",
  type: "subject",
  status: "active",
  educationLevel: "High School - Advanced",
  learningObjectives: [
    "Master differential and integral calculus",
    "Understand linear algebra fundamentals",
    "Apply statistical methods to real problems",
  ],
  teachingTone: "Patient and encouraging",
  assignedStudents: 156,
  accuracyScore: 94.5,
  totalConversations: 2340,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-20"),
};

const mockKnowledgeFiles = [
  {
    id: "1",
    name: "Calculus_Fundamentals.pdf",
    size: "2.4 MB",
    uploadedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Linear_Algebra_Guide.docx",
    size: "1.8 MB",
    uploadedAt: "2024-01-16",
  },
  {
    id: "3",
    name: "Statistics_Handbook.pdf",
    size: "3.2 MB",
    uploadedAt: "2024-01-17",
  },
];

const mockPrompts = [
  {
    id: "1",
    title: "Greeting Prompt",
    content:
      "Welcome the student warmly and ask about their current topic of study.",
    enabled: true,
  },
  {
    id: "2",
    title: "Problem Solving",
    content:
      "Guide students through problems step-by-step, asking leading questions.",
    enabled: true,
  },
  {
    id: "3",
    title: "Encouragement",
    content: "Provide positive reinforcement when students make progress.",
    enabled: true,
  },
];

const mockLogs = [
  {
    id: "1",
    timestamp: "2024-01-20 14:32:15",
    type: "conversation",
    message: "New conversation started with student_123",
  },
  {
    id: "2",
    timestamp: "2024-01-20 14:28:10",
    type: "feedback",
    message: "Positive feedback received for response #4521",
  },
  {
    id: "3",
    timestamp: "2024-01-20 14:15:00",
    type: "update",
    message: "Knowledge base updated with new document",
  },
  {
    id: "4",
    timestamp: "2024-01-20 13:45:22",
    type: "conversation",
    message: "Conversation ended with student_089",
  },
];

export default function AgentDetailPage() {
  const { agentId } = useParams();
  const [testMessage, setTestMessage] = useState("");
  const [testMessages, setTestMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const handleTestSend = () => {
    if (!testMessage.trim()) return;
    setTestMessages([
      ...testMessages,
      { role: "user", content: testMessage },
      {
        role: "assistant",
        content: `This is a simulated response to: "${testMessage}". In production, this would use the actual AI agent.`,
      },
    ]);
    setTestMessage("");
  };

  return (
    <AdminLayout>
      <div className="md:p-8 p-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={appRoutes.admin.agents}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {mockAgent.name}
                  </h1>
                  <Badge
                    variant={
                      mockAgent.status === "active" ? "default" : "secondary"
                    }
                  >
                    {mockAgent.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  {mockAgent.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit Agent</Button>
              <Button variant="destructive">Disable</Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockAgent.assignedStudents}
                </p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockAgent.totalConversations.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockAgent.accuracyScore}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {mockAgent.updatedAt.toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">Last Updated</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Type
                    </label>
                    <p className="capitalize">{mockAgent.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Education Level
                    </label>
                    <p>{mockAgent.educationLevel}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Teaching Tone
                    </label>
                    <p>{mockAgent.teachingTone}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mockAgent.learningObjectives.map((objective, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Knowledge Documents
                </CardTitle>
                <Button size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockKnowledgeFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.size} • Uploaded {file.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon-sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Custom Prompts
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prompt
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPrompts.map((prompt) => (
                    <div key={prompt.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{prompt.title}</h4>
                        <Badge
                          variant={prompt.enabled ? "default" : "secondary"}
                        >
                          {prompt.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {prompt.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Chart placeholder - Accuracy & engagement trends</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Topic Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Chart placeholder - Most discussed topics</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Test Sandbox
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg h-80 flex flex-col">
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {testMessages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Start a test conversation with this agent
                      </p>
                    ) : (
                      testMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t p-4 flex gap-2">
                    <Input
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Type a test message..."
                      onKeyDown={(e) => e.key === "Enter" && handleTestSend()}
                    />
                    <Button onClick={handleTestSend}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-3 bg-secondary/30 rounded-lg"
                    >
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {log.timestamp}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {log.type}
                      </Badge>
                      <p className="text-sm">{log.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
