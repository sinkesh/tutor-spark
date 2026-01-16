import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  Plus,
  FileText,
  Trash2,
  Upload,
  GripVertical,
  Edit2,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

const mockGlobalPrompts = [
  {
    id: '1',
    title: 'Respectful Communication',
    content: 'Always communicate respectfully with students. Use encouraging language and avoid criticism.',
    priority: 1,
    enabled: true,
    version: 3,
  },
  {
    id: '2',
    title: 'Learning-First Approach',
    content: 'Focus on helping students understand concepts rather than just providing answers. Ask guiding questions.',
    priority: 2,
    enabled: true,
    version: 2,
  },
  {
    id: '3',
    title: 'Safety Guidelines',
    content: 'Never provide content that is harmful, inappropriate, or off-topic. Redirect to learning materials.',
    priority: 3,
    enabled: true,
    version: 1,
  },
  {
    id: '4',
    title: 'Citation Requirements',
    content: 'When referencing specific facts or data, cite the source from the knowledge base.',
    priority: 4,
    enabled: false,
    version: 1,
  },
];

const mockGlobalRAGs = [
  {
    id: '1',
    name: 'General Education Guidelines.pdf',
    size: '4.2 MB',
    uploadedAt: '2024-01-10',
    usedByAgents: 12,
    indexed: true,
    chunks: 156,
  },
  {
    id: '2',
    name: 'Academic Standards 2024.docx',
    size: '2.8 MB',
    uploadedAt: '2024-01-12',
    usedByAgents: 8,
    indexed: true,
    chunks: 89,
  },
  {
    id: '3',
    name: 'Teaching Best Practices.pdf',
    size: '3.1 MB',
    uploadedAt: '2024-01-14',
    usedByAgents: 15,
    indexed: true,
    chunks: 112,
  },
  {
    id: '4',
    name: 'Student Support Handbook.pdf',
    size: '1.9 MB',
    uploadedAt: '2024-01-18',
    usedByAgents: 6,
    indexed: false,
    chunks: 0,
  },
];

export default function GlobalKnowledgePage() {
  const [prompts, setPrompts] = useState(mockGlobalPrompts);
  const [rags, setRags] = useState(mockGlobalRAGs);
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ title: '', content: '' });

  const togglePrompt = (id: string) => {
    setPrompts(prompts.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const handleAddPrompt = () => {
    if (!newPrompt.title || !newPrompt.content) return;
    setPrompts([
      ...prompts,
      {
        id: String(Date.now()),
        title: newPrompt.title,
        content: newPrompt.content,
        priority: prompts.length + 1,
        enabled: true,
        version: 1,
      },
    ]);
    setNewPrompt({ title: '', content: '' });
    setShowAddPrompt(false);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Global Knowledge Layer</h1>
              <p className="text-muted-foreground">Define universal rules and shared knowledge across all AI agents</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="prompts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="prompts">Global Prompts</TabsTrigger>
            <TabsTrigger value="rags">Global RAGs</TabsTrigger>
          </TabsList>

          {/* Global Prompts Tab */}
          <TabsContent value="prompts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Universal Teaching Rules</h2>
                <p className="text-sm text-muted-foreground">These prompts apply to all AI agents</p>
              </div>
              <Button onClick={() => setShowAddPrompt(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            </div>

            {showAddPrompt && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-lg">New Global Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newPrompt.title}
                      onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                      placeholder="Enter prompt title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      value={newPrompt.content}
                      onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                      placeholder="Enter prompt content..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddPrompt}>
                      <Check className="w-4 h-4 mr-2" />
                      Save Prompt
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddPrompt(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {prompts.map((prompt) => (
                <Card key={prompt.id} className={!prompt.enabled ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="cursor-grab text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{prompt.title}</h3>
                            <Badge variant="outline">Priority {prompt.priority}</Badge>
                            <Badge variant="secondary">v{prompt.version}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {prompt.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                              <Switch
                                checked={prompt.enabled}
                                onCheckedChange={() => togglePrompt(prompt.id)}
                              />
                            </div>
                            <Button variant="ghost" size="icon-sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{prompt.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Global RAGs Tab */}
          <TabsContent value="rags" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Shared Knowledge Documents</h2>
                <p className="text-sm text-muted-foreground">Documents accessible by all AI agents</p>
              </div>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="grid gap-4">
              {rags.map((rag) => (
                <Card key={rag.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{rag.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {rag.size} • Uploaded {rag.uploadedAt} • Used by {rag.usedByAgents} agents
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {rag.indexed ? (
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                            {rag.chunks} chunks indexed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending indexing</Badge>
                        )}
                        <Button variant="ghost" size="icon-sm">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
