/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import AgentCard from "@/components/agents/AgentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PaginationComponent from "@/components/common/PaginationComponent";
import { AIAgent, AgentType, AgentStatus } from "@/types";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Loader2,
  User,
  BookOpen,
  GraduationCap,
  Book,
  Info,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  getAgents,
  getAiAgentsDetails,
  deleteAiAgentsDetails,
} from "@/config/services";
import { toast } from "sonner";
import AgentCardSkeleton from "@/components/loader/AgentCardSkeleton";

const typeFilters: { value: AgentType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "class", label: "Class" },
  { value: "subject", label: "Subject" },
  { value: "course", label: "Course" },
  { value: "teacher", label: "Teacher" },
];

const statusFilters: { value: AgentStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "disabled", label: "Disabled" },
];

export default function AgentsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<AgentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AgentStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [agentsData, setAgentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const navigate = useNavigate();

  // const filteredAgents = agentsData.filter((agent) => {
  //   const matchesSearch =
  //     agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     agent.description.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesType = typeFilter === "all" || agent.type === typeFilter;
  //   const matchesStatus =
  //     statusFilter === "all" || agent.status === statusFilter;
  //   return matchesSearch && matchesType && matchesStatus;
  // });

  const filteredAgents = useMemo(() => {
    if (!agentsData) return [];

    return agentsData.filter((agent) => {
      const matchesSearch =
        agent.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === "all" || agent.agent_type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || agent.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [agentsData, searchQuery, typeFilter, statusFilter]);

  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAgents.slice(startIndex, endIndex);
  }, [filteredAgents, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAgents.length / itemsPerPage);
  }, [filteredAgents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter]);

  const getAllAgents = async () => {
    try {
      setIsLoading(true);
      const response = await getAgents();
      setAgentsData(response?.agents || []);
    } catch (err) {
      console.error("Error fetching agents:", err);
      toast.error("Failed to fetch agents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (agent: any) => {
    setSelectedAgent(agent);
    setIsDetailsOpen(true);

    try {
      setIsLoadingDetails(true);
      const details = await getAiAgentsDetails(agent?.subject_agent_id);
      setAgentDetails(details);
    } catch (err) {
      console.error("Error fetching agent details:", err);
      toast.error("Failed to load agent details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEditAgent = (agent: AIAgent) => {
    navigate(`/admin/agents/create`, {
      state: {
        isEditMode: true,
        agentData: {
          ...agent,
          type: agent.agent_type as AgentType,
          name: agent.agent_name,
        },
      },
    });
  };

  const handleDeleteAgent = async (id: string) => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await deleteAiAgentsDetails(id);
      toast.success("Agent deleted successfully");
      setIsDetailsOpen(false);
      await getAllAgents();
    } catch (err) {
      console.error("Error deleting agent:", err);
      toast.error("Failed to delete agent");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    getAllAgents();
  }, []);

  return (
    <AdminLayout>
      <div className="md:p-8 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI teaching agents
            </p>
          </div>
          <Link to="/admin/agents/create">
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card variant="default" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      typeFilter === filter.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setTypeFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div> */}

              {/* <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      statusFilter === filter.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div> */}

              <div className="flex gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents Grid/List */}
        {isLoading ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4",
            )}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <AgentCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4",
            )}
          >
            {paginatedAgents.map((agent, index) => (
              <AgentCard
                key={index}
                agent={agent}
                onView={() => handleViewDetails(agent)}
                onDelete={handleDeleteAgent}
                onEdit={handleEditAgent}
              />
            ))}
          </div>
        )}

        {filteredAgents.length === 0 && !isLoading && (
          <Card variant="default" className="py-12">
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                No agents found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAgents.length}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
      </div>

      {/* Agent Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {isLoadingDetails ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-2xl capitalize">
                    {selectedAgent?.agent_name || "Agent Details"}
                  </DialogTitle>
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDetailsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button> */}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge
                    variant="outline"
                    className="capitalize bg-primary text-white"
                  >
                    {selectedAgent?.class === "none"
                      ? selectedAgent?.subject
                      : selectedAgent?.class}
                  </Badge>
                  <Badge
                    variant={
                      selectedAgent?.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedAgent?.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4 max-h-[calc(100vh-250px)] overflow-auto">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAgent?.description || "No description available"}
                  </p>
                </div>

                {agentDetails && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Teacher Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Name</p>
                          <p>
                            {agentDetails?.agent_metadata?.agent_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Subject</p>
                          <p>{agentDetails.subject || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Class</p>
                          <p>
                            {agentDetails.class === "none"
                              ? "For all classes"
                              : agentDetails.class || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Teaching Tone</p>
                          <p className="capitalize">
                            {agentDetails?.agent_metadata.teaching_tone ||
                              "N/A"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground pb-2">
                            Documents
                          </p>

                          <p className="flex flex-wrap gap-2">
                            {agentDetails?.file_names?.length > 0
                              ? agentDetails.file_names.map(
                                  (file: string, index: number) => (
                                    <span
                                      key={index}
                                      className="border border-gray-300 px-2 py-1 rounded-full text-xs font-normal"
                                    >
                                      {file}
                                    </span>
                                  ),
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* <div>
                    <p className="text-muted-foreground">Education Level</p>
                    <p>{agentDetails?.agent_metadata.agent_type || "N/A"}</p>
                  </div> */}
                  <div>
                    <p className="text-muted-foreground">Assigned Students</p>
                    <p>{selectedAgent?.assignedStudents || "NA"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accuracy Score</p>
                    <p>
                      {selectedAgent?.accuracyScore
                        ? `${selectedAgent?.accuracyScore}%`
                        : "NA"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Conversations</p>
                    <p>{selectedAgent?.totalConversations || "NA"}</p>
                  </div>
                </div>

                {selectedAgent?.learningObjectives?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Learning Objectives
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.learningObjectives.map(
                        (obj: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {obj}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
