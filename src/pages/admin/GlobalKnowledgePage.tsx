/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Upload,
  FileText,
  Globe,
  GripVertical,
  Edit2,
  Check,
  X,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  globalPromptEnable,
  globalRagKnowledge,
  sharedKnowledgeUpload,
  deleteRagKnowledge,
  globalPrompts,
  deleteGlobalPrompts,
  createGlobalPrompts,
} from "@/config/services";

export default function GlobalKnowledgePage() {
  const [prompts, setPrompts] = useState([]);
  const [rags, setRags] = useState([]);
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ title: "", content: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptsLoading, setIsPromptsLoading] = useState(false);

  // Upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchGlobalRag();
    fetchGlobalPrompts();
  }, []);

  const fetchGlobalPrompts = async () => {
    try {
      setIsPromptsLoading(true);
      const response = await globalPrompts();
      if (response?.status === "success" && response?.prompts) {
        const promptsData = response.prompts.map((prompt: any) => ({
          id: prompt.id,
          title: prompt.name,
          content: prompt.content,
          priority: prompt.priority || 1,
          enabled: prompt.enabled || false,
          version: prompt.version || "v1",
          created_at: prompt.created_at,
          updated_at: prompt.updated_at,
        }));
        setPrompts(promptsData);
      }
    } catch (error) {
      console.error("Error fetching global prompts:", error);
      toast.error("Failed to fetch prompts");
    } finally {
      setIsPromptsLoading(false);
    }
  };

  const fetchGlobalRag = async () => {
    try {
      setIsLoading(true);
      const response = await globalRagKnowledge();
      if (
        response?.status === "success" &&
        response?.shared_documents?.documents
      ) {
        const documents = response.shared_documents.documents.map(
          (doc: any) => ({
            id: doc.document_id,
            name: doc.document_name,
            description: doc.description,
            size: doc.estimated_size,
            uploadedAt: new Date(doc.upload_date).toLocaleDateString(),
            usedByAgents: doc.used_by_count || 0,
            indexed: doc.status === "indexed",
            chunks: doc.indexed_chunks || 0,
            totalChunks: doc.total_chunks || 0,
            fileNames: doc.file_names || [],
            status: doc.status,
          }),
        );
        setRags(documents);
      }
    } catch (error) {
      console.error("Error fetching global RAGs:", error);
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrompt = async (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      try {
        const contentToSend = prompt.enabled ? "" : prompt.content;
        await globalPromptEnable({
          content: contentToSend,
        });

        setPrompts(
          prompts.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
        );

        if (prompt.enabled) {
          toast.success("Global prompt disabled successfully");
        } else {
          toast.success("Global prompt enabled successfully");
        }
      } catch (error) {
        console.error("Error toggling global prompt:", error);
        toast.error("Failed to toggle global prompt");
      }
    }
  };

  const handleAddPrompt = async () => {
    if (!newPrompt.title.trim() || !newPrompt.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const promptData = {
        name: newPrompt.title,
        content: newPrompt.content,
        priority: 1,
        version: "v1",
      };

      const response = await createGlobalPrompts(promptData);
      if (response?.status === "success") {
        toast.success("Prompt created successfully");
        setNewPrompt({ title: "", content: "" });
        setShowAddPrompt(false);
        await fetchGlobalPrompts();
      } else {
        throw new Error(response?.message || "Create failed");
      }
    } catch (error: any) {
      console.error("Error creating prompt:", error);
      toast.error(error?.message || "Failed to create prompt");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile || !uploadDescription.trim()) {
      toast.error("Please provide a description and select a file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("description", uploadDescription);
      formData.append("document_name", uploadedFile.name);
      formData.append("files", uploadedFile);

      const response = await sharedKnowledgeUpload(formData);

      if (response?.status === "indexed") {
        setUploadDescription("");
        setUploadedFile(null);
        setShowUploadDialog(false);

        toast.success("Document uploaded successfully");

        await fetchGlobalRag();
      } else {
        throw new Error(response?.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadDialog = () => {
    setUploadDescription("");
    setUploadedFile(null);
    setShowUploadDialog(false);
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      const response = await deleteGlobalPrompts(promptId);
      if (response?.status === "success") {
        toast.success("Prompt deleted successfully");
        await fetchGlobalPrompts();
      } else {
        throw new Error(response?.message || "Delete failed");
      }
    } catch (error: any) {
      console.error("Error deleting prompt:", error);
      toast.error(error?.message || "Failed to delete prompt");
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const response = await deleteRagKnowledge(documentId);
      if (response?.status === "success") {
        toast.success("Document deleted successfully");
        await fetchGlobalRag();
      } else {
        throw new Error(response?.message || "Delete failed");
      }
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(error?.message || "Failed to delete document");
    }
  };

  // const handleEnable = async (documentId: string, currentState: boolean) => {
  //   try {
  //     const response = await sharedKnowledgeEnable({ document_id: documentId });
  //     if (response?.success) {
  //       const action = currentState ? "disabled" : "enabled";
  //       toast.success(`Document ${action} successfully`);
  //       await fetchGlobalRag(); // Refresh list
  //     } else {
  //       throw new Error(response?.message || "Action failed");
  //     }
  //   } catch (error: any) {
  //     console.error("Error toggling document:", error);
  //     toast.error(error?.message || "Failed to toggle document");
  //   }
  // };

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
              <h1 className="text-2xl font-bold text-foreground">
                Global Knowledge Layer
              </h1>
              <p className="text-muted-foreground">
                Define universal rules and shared knowledge across all AI agents
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="prompts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="rags">RAGs</TabsTrigger>
          </TabsList>

          {/* Global Prompts Tab */}
          <TabsContent value="prompts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  Universal Teaching Rules
                </h2>
                <p className="text-sm text-muted-foreground">
                  These prompts apply to all AI agents
                </p>
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
                      onChange={(e) =>
                        setNewPrompt({ ...newPrompt, title: e.target.value })
                      }
                      placeholder="Enter prompt title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      value={newPrompt.content}
                      onChange={(e) =>
                        setNewPrompt({ ...newPrompt, content: e.target.value })
                      }
                      placeholder="Enter prompt content..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddPrompt}>
                      <Check className="w-4 h-4 mr-2" />
                      Save Prompt
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddPrompt(false)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {prompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className={!prompt.enabled ? "opacity-60" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="cursor-grab text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{prompt.title}</h3>
                            <Badge variant="outline">
                              Priority {prompt.priority}
                            </Badge>
                            <Badge variant="secondary">v{prompt.version}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {prompt.enabled ? "Enabled" : "Disabled"}
                              </span>
                              <Switch
                                checked={prompt.enabled}
                                onCheckedChange={() => togglePrompt(prompt.id)}
                              />
                            </div>
                            <Button variant="ghost" size="icon-sm" disabled>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePrompt(prompt.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {prompt.content}
                        </p>
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
                <h2 className="text-lg font-semibold">
                  Shared Knowledge Documents
                </h2>
                <p className="text-sm text-muted-foreground">
                  Documents accessible by all AI agents
                </p>
              </div>
              <Dialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload a document to add to the global knowledge base.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description
                      </label>
                      <Textarea
                        id="description"
                        placeholder="Enter document description..."
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="file" className="text-sm font-medium">
                        Document
                      </label>
                      <div className="relative">
                        <Input
                          id="file"
                          type="file"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.txt"
                          className="cursor-pointer sr-only"
                        />
                        <div
                          className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() =>
                            document.getElementById("file")?.click()
                          }
                        >
                          <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">
                            {uploadedFile ? "File Selected" : "Click to upload"}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            PDF, DOC, DOCX, TXT (Max 10MB)
                          </p>
                          {uploadedFile ? (
                            <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-md">
                              <FileText className="w-4 h-4 text-primary" />
                              <div className="text-left">
                                <p className="text-sm font-medium truncate max-w-[200px]">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFile(null);
                                }}
                                className="ml-auto"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById("file")?.click();
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={resetUploadDialog}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUploadSubmit}
                      disabled={
                        !uploadedFile ||
                        !uploadDescription.trim() ||
                        isUploading
                      }
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Done"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {isLoading ? (
                // Loading State
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : rags.length === 0 ? (
                // Empty State
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No RAG Documents Available
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Upload your first knowledge document to get started with RAG (Retrieval Augmented Generation) for your agents.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={() => setShowUploadDialog(true)}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload First Document
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // RAG List
                rags.map((rag) => (
                  <Card key={rag.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium break-all line-clamp-2">
                              {rag.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 break-all">
                              {rag.size} • Uploaded {rag.uploadedAt} • Used by{" "}
                              {rag.usedByAgents} agents
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            {rag.indexed ? (
                              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                {rag.chunks} chunks indexed
                                {rag.totalChunks > rag.chunks &&
                                  ` / ${rag.totalChunks}`}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending indexing</Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(rag.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
