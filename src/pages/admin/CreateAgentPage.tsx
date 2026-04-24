/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { getAiAgentsDetails, updateAiAgentsDetails } from "@/config/services";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentType } from "@/types";
import { createAgents } from "@/config/services";
import { cn } from "@/lib/utils";
import { appRoutes } from "@/config/routes";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  BookOpen,
  Layers,
  User,
  Upload,
  FileText,
  Globe,
  Sparkles,
} from "lucide-react";

const agentTypes: {
  value: AgentType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  // {
  //   value: "class",
  //   label: "Class",
  //   description: "Grade or classroom level agent",
  //   icon: GraduationCap,
  // },
  {
    value: "subject",
    label: "Subject",
    description: "Subject-specific teaching agent",
    icon: BookOpen,
  },
  // {
  //   value: "course",
  //   label: "Course",
  //   description: "Individual course agent",
  //   icon: Layers,
  // },
  {
    value: "teacher",
    label: "Teacher",
    description: "Personal teaching style agent",
    icon: User,
  },
];

const teachingToneOptions = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "encouraging", label: "Encouraging" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "patient", label: "Patient" },
  { value: "strict", label: "Strict" },
];

const classOptions = [
  { value: "3", label: "Class 3" },
  { value: "4", label: "Class 4" },
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },
];

const steps = [
  { id: 1, title: "Type", description: "Select agent type" },
  { id: 2, title: "Details", description: "Basic information" },
  { id: 3, title: "Knowledge", description: "Upload materials" },
  { id: 4, title: "Settings", description: "Configure options" },
  { id: 5, title: "Review", description: "Create agent" },
];

export default function CreateAgentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    type: "" as AgentType | "",
    name: "",
    description: "",
    class: "none",
    subject: "",
    educationLevel: "",
    learningObjectives: "",
    teachingTone: "",
    documents: [],
    enableGlobalPrompts: false,
    enableGlobalRags: false,
  });

  const fetchDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const details = (await getAiAgentsDetails(id)) as any;
      console.log("Agent details:", details);

      const fileObjects = [];

      if (details.file_names && Array.isArray(details.file_names)) {
        details.file_names.forEach((fileName: string) => {
          const file = new File([], fileName, {
            type: "application/octet-stream",
          });
          fileObjects.push(file);
        });
      }

      setFormData((prev) => ({
        ...prev,
        type: details.agent_metadata?.agent_type || "",
        class: details.class || "",
        id: details.subject_agent_id || "",
        name: details.agent_metadata?.agent_name || "",
        description: details.agent_metadata?.description || "",
        subject: details.subject || "",
        educationLevel: details.agent_metadata?.agent_type || "",
        teachingTone: details.agent_metadata?.teaching_tone || "",
        enableGlobalPrompts: details.enable_global_prompts ?? false,
        enableGlobalRags: details.enable_global_rags ?? false,
        documents: [...fileObjects],
      }));
    } catch (err) {
      console.error("Error fetching agent details:", err);
      toast({
        title: "Error",
        description: "Failed to load agent details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.isEditMode && location.state?.agentData) {
      const { agentData } = location.state;
      setIsEditMode(true);
      setCurrentStep(2);

      fetchDetails(agentData?.subject_agent_id);
    }
  }, [location.state]);

  // Auto-set type based on class field
  useEffect(() => {
    if (formData.class && formData.class !== "none") {
      setFormData((prev) => ({ ...prev, type: "teacher" }));
    } else {
      setFormData((prev) => ({ ...prev, type: "subject" }));
    }
  }, [formData.class]);

  const handleFiles = useCallback((files: File[]) => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  }, []);

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.type !== "";
      case 2:
        return (
          formData.name.trim() !== "" &&
          formData.description.trim() !== "" &&
          formData.subject.trim() !== ""
        );
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
      return;
    }
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("class_", formData.class);
      payload.append("subject", formData.subject);
      payload.append("agent_type", formData.type);
      payload.append("agent_name", formData.name);
      payload.append("description", formData.description);
      payload.append(
        "education_level",
        formData.educationLevel || formData.type,
      );
      payload.append("teaching_tone", formData.teachingTone || "");
      payload.append("global_prompt_enabled", formData.enableGlobalPrompts.toString());
      payload.append("global_rag_enabled", formData.enableGlobalRags.toString());

      // const learningObjectives = formData.learningObjectives.split('\n').filter(Boolean);
      // payload.append("learning_objectives", JSON.stringify(learningObjectives));

      // const metadata = {
      //   teaching_tone: formData.teachingTone,
      // };
      // payload.append("agent_metadata", JSON.stringify(metadata));

      formData.documents.forEach((file) => {
        payload.append("files", file);
      });

      if (isEditMode && formData.id) {
        const updateData = Object.fromEntries(payload.entries());
        const response = await updateAiAgentsDetails(formData.id, updateData);
        console.log('Agent update response:', response);
        toast({
          title: "Success",
          description: "Agent updated successfully",
          variant: "default",
        });
      } else {
        const response = await createAgents(payload);
        console.log('Agent creation response:', response);
        
        // Capture the returned agent ID if available
        if (response?.data?.subject_agent_id) {
          console.log('New agent ID created:', response.data.subject_agent_id);
          // Store the new agent ID for potential immediate use
          localStorage.setItem('last_created_agent_id', response.data.subject_agent_id);
        }
        
        toast({
          title: "Success",
          description: "Agent created successfully",
          variant: "default",
        });
      }

      // Navigate back to agents list
      navigate(appRoutes.admin.agents);
    } catch (error: any) {
      console.error("Error saving agent:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(appRoutes.admin.agents)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? "Edit" : "Create"} AI Agent
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? "Edit" : "Set up a new"} AI teaching agent
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 w-full">
          <div className="w-full flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="w-full last:w-fit last:ml-6 flex items-center"
              >
                <div className="w-full flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      currentStep > step.id
                        ? "bg-success text-success-foreground"
                        : currentStep === step.id
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "bg-blue-100 text-muted-foreground",
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 font-medium",
                      currentStep >= step.id
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-full h-0.5 mb-6 max-w-32",
                      currentStep > step.id ? "bg-success" : "bg-blue-200",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Agent Type */}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-4">
                {agentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setFormData({ ...formData, type: type.value })
                    }
                    className={cn(
                      "p-6 rounded-xl border-2 text-left transition-all duration-200",
                      formData.type === type.value
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                        formData.type === type.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <type.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {type.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Advanced Mathematics"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this agent teaches..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formData.type === "subject" ? null : (
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select
                        value={formData.class}
                        onValueChange={(value) =>
                          setFormData({ ...formData, class: value })
                        }
                        disabled={formData.type === "subject"}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              formData.type === "subject"
                                ? "Not applicable for subject agents"
                                : "Select class"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            No class (Subject agent)
                          </SelectItem>
                          {classOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="teachingTone">Teaching Tone</Label>
                    <Select
                      value={formData.teachingTone}
                      onValueChange={(value) =>
                        setFormData({ ...formData, teachingTone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teaching tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachingToneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Knowledge Sources */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div
                  className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add("border-primary/50");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("border-primary/50");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("border-primary/50");
                    const files = Array.from(e.dataTransfer.files).filter(
                      (file) =>
                        file.type === "application/pdf" ||
                        file.type === "application/msword" ||
                        file.type ===
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                        file.type === "text/plain",
                    );
                    if (files.length > 0) {
                      handleFiles(files);
                    } else {
                      toast({
                        title: "Invalid file type",
                        description:
                          "Please upload PDF, DOC, DOCX, or TXT files only.",
                        variant: "destructive",
                      });
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    Upload Documents
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop PDF, DOC, DOCX, or TXT files or click to
                    browse
                  </p>
                  <Button variant="outline" type="button">
                    Browse Files
                  </Button>
                </div>

                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    <div className="space-y-2">
                      {formData.documents &&
                        formData.documents.map((file, index) => {
                          // Check if it's an existing file (has no size) or a newly uploaded file
                          const isExistingFile = file.size === 0;

                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                <div className="text-left">
                                  <p className="text-sm font-medium text-ellipsis overflow-hidden max-w-xs">
                                    {file.name}
                                    {isExistingFile && (
                                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        Existing
                                      </span>
                                    )}
                                  </p>
                                  {!isExistingFile && file.size > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(index);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
                    Documents will be automatically chunked and embedded for
                    semantic search.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Settings */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        Global Prompts
                      </h3>
                      <Button
                        variant={
                          formData.enableGlobalPrompts ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            enableGlobalPrompts: !formData.enableGlobalPrompts,
                          })
                        }
                      >
                        {formData.enableGlobalPrompts ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Apply universal teaching rules to this agent
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        Global RAGs
                      </h3>
                      <Button
                        variant={
                          formData.enableGlobalRags ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            enableGlobalRags: !formData.enableGlobalRags,
                          })
                        }
                      >
                        {formData.enableGlobalRags ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Include shared knowledge base in agent responses
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground">Agent Type</Label>
                    <p className="font-medium text-foreground capitalize">
                      {formData.type}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Agent Name</Label>
                    <p className="font-medium text-foreground">
                      {formData.name}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium text-foreground">
                      {formData.description}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Subject</Label>
                    <p className="font-medium text-foreground">
                      {formData.subject}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Class</Label>
                    <p className="font-medium text-foreground">
                      {formData.class && formData.class !== "none"
                        ? formData.class
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Teaching Tone
                    </Label>
                    <p className="font-medium text-foreground capitalize">
                      {formData.teachingTone || "Default"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Global Prompts
                    </Label>
                    <p className="font-medium text-foreground">
                      {formData.enableGlobalPrompts ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Global RAGs</Label>
                    <p className="font-medium text-foreground">
                      {formData.enableGlobalRags ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            variant="gradient"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {currentStep === 4 ? "Creating..." : "Loading..."}
              </div>
            ) : currentStep === 4 ? (
              "Create Agent"
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
