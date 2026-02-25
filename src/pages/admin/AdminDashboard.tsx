/* eslint-disable @typescript-eslint/no-explicit-any */
import AdminLayout from "@/components/layout/AdminLayout";
import KPICard from "@/components/dashboard/KPICard";
import AgentCard from "@/components/agents/AgentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIAgent, KPIData } from "@/types";
import {
  Bot,
  Users,
  MessageCircle,
  Target,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAgents, getRecentActivity } from "@/config/services";
import { toast } from "sonner";
import AgentCardSkeleton from "@/components/loader/AgentCardSkeleton";

// Mock data
const kpiData: KPIData = {
  totalAgents: 24,
  activeStudents: 1847,
  totalConversations: 45230,
  avgAccuracyScore: 94.2,
};

// const recentActivity = [
//   {
//     action: "Agent updated",
//     target: "Advanced Mathematics",
//     time: "5 mins ago",
//   },
//   { action: "New student joined", target: "Physics 101", time: "12 mins ago" },
//   {
//     action: "Feedback reviewed",
//     target: "English Literature",
//     time: "1 hour ago",
//   },
//   { action: "Agent created", target: "Chemistry Basics", time: "3 hours ago" },
// ];

export default function AdminDashboard() {
  const [agentsData, setAgentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [avgAccuracyScore, setAvgAccuracyScore] = useState("");
  const [recentActData, setRecentActData] = useState<any>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  const navigate = useNavigate();

  const getAllAgents = async () => {
    try {
      setIsLoading(true);
      const response = await getAgents();

      const agents = response?.agents ?? [];

      const validAgents = agents.filter(
        (agent) => Number(agent.overall_score) > 0,
      );

      const averageScore =
        validAgents.length > 0
          ? (
              validAgents.reduce(
                (sum, agent) => sum + Number(agent.overall_score),
                0,
              ) / validAgents.length
            ).toFixed(1)
          : "0.0";

      setAvgAccuracyScore(averageScore);
      const agentsToDisplay = validAgents.length > 0 ? validAgents : agents;

      setAgentsData(agentsToDisplay.slice(0, 3));
    } catch (err) {
      console.error("Error fetching agents:", err);
      toast.error("Failed to fetch agents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllAgents();
  }, []);

  const fetchRecentActivity = async() => {
    try {
      setIsActivityLoading(true);
      const response = await getRecentActivity();
      
      // Sort by time (most recent first) and take only 5
      const sortedActivities = Array.isArray(response) 
        ? response
            .sort((a, b) => {
              // Try to sort by timestamp if available, otherwise by time_ago
              if (a.timestamp && b.timestamp) {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              }
              // Fallback: if no timestamp, maintain original order (assume API returns sorted)
              return 0;
            })
            .slice(0, 5)
        : [];
      
      setRecentActData(sortedActivities);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      toast.error("Failed to fetch recent activity");
      setRecentActData([]); // Set empty array on error
    } finally {
      setIsActivityLoading(false);
    }
  }

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your AI teaching platform
            </p>
          </div>
          <Link to="/admin/agents/create">
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total AI Agents"
            value={kpiData.totalAgents}
            change="+3 this week"
            changeType="positive"
            icon={Bot}
            iconColor="bg-primary/10 text-primary"
          />
          <KPICard
            title="Active Students"
            value={kpiData.activeStudents.toLocaleString()}
            change="+127 this week"
            changeType="positive"
            icon={Users}
            iconColor="bg-accent/10 text-accent"
          />
          <KPICard
            title="Total Conversations"
            value={kpiData.totalConversations.toLocaleString()}
            change="+2,340 today"
            changeType="positive"
            icon={MessageCircle}
            iconColor="bg-success/10 text-success"
          />
          <KPICard
            title="Avg Accuracy Score"
            value={`${avgAccuracyScore}%`}
            change="+7.2% this month"
            changeType="positive"
            icon={Target}
            iconColor="bg-warning/10 text-warning"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Performing Agents */}
          <div className="xl:col-span-2">
            <Card variant="default">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Performing Agents</CardTitle>
                <Link to="/admin/agents">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-5">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <AgentCardSkeleton key={index} />
                    ))}
                  </div>
                ) : agentsData && agentsData.length > 0 ? (
                  agentsData.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-xl bg-muted/30">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Bot className="w-7 h-7 text-primary" />
                    </div>

                    <h3 className="text-lg font-semibold mb-1">
                      No Agents Found
                    </h3>

                    <p className="text-sm text-muted-foreground max-w-sm mb-4">
                      You haven't created any AI agents yet. Start by creating
                      one to manage your classroom interactions.
                    </p>

                    <Button onClick={() => navigate("/admin/agents/create")}>
                      Create Agent
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card variant="default">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isActivityLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActData && recentActData.length > 0 ? (
                    recentActData.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {activity?.activity_type === "agent_updated" ? "Agent Updated" : activity?.activity_type === "student_created" ? "Student Created" : activity?.activity_type === "feedback_reviewed" ? "Feedback Reviewed" : activity?.activity_type === "agent_created" ? "Agent Created" : activity?.activity_type === "student_updated" ? "Student Updated" : activity?.activity_type === "student_deleted" ? "Student Deleted" : activity?.activity_type === "agent_deleted" ? "Agent Deleted" : ""}
                          </p>
                          <p className="text-sm text-muted-foreground truncate" title={activity?.description}>
                            {activity?.description}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activity?.time_ago}
                        </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No recent activity found
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="default" className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/admin/agents/create" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Agent
                  </Button>
                </Link>
                <Link to="/admin/students" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Add Students
                  </Button>
                </Link>
                <Link to="/admin/feedback" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Review Feedback
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
