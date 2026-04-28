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
  ShieldCheck,
  Sparkles,
  Activity,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getAgents,
  getRecentActivity,
  getAdminDashboardStats,
} from "@/config/services";
import { toast } from "sonner";
import AgentCardSkeleton from "@/components/loader/AgentCardSkeleton";

export default function AdminDashboard() {
  const [agentsData, setAgentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [avgAccuracyScore, setAvgAccuracyScore] = useState("");
  const [recentActData, setRecentActData] = useState<any>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<{
    students: { total: number; total_sessions: number; total_messages: number };
    agents: { total: number };
    timestamp: string;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    getAllAgents();
    fetchRecentActivity();
    fetchDashboardStats();
  }, []);

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

  const fetchRecentActivity = async () => {
    try {
      setIsActivityLoading(true);
      const response = await getRecentActivity();

      const sortedActivities = Array.isArray(response)
        ? response
            .sort((a, b) => {
              if (a.timestamp && b.timestamp) {
                return (
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
                );
              }
              return 0;
            })
            .slice(0, 5)
        : [];

      setRecentActData(sortedActivities);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      toast.error("Failed to fetch recent activity");
      setRecentActData([]);
    } finally {
      setIsActivityLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getAdminDashboardStats();
      setDashboardStats(response);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      toast.error("Failed to fetch dashboard stats");
    }
  };

  return (
    <AdminLayout>
      <div className="dashboard-page-padding">
        {/* Header */}
        <div className="dashboard-hero mb-8">
          <div className="relative flex flex-col gap-5 px-5 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative">
              <Badge variant="secondary" className="dashboard-chip mb-4 border-0 bg-transparent px-0 py-0 text-[11px]">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
                Admin control center
              </Badge>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-foreground sm:text-5xl">
                Command the platform
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Track platform health, student momentum, agent performance, and moderation from one brighter, more operational control deck.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="dashboard-chip normal-case tracking-normal text-xs sm:text-sm">
                  <Activity className="h-4 w-4 text-sky-500" />
                  Live platform pulse
                </div>
                <div className="dashboard-chip normal-case tracking-normal text-xs sm:text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Safer oversight flow
                </div>
              </div>
            </div>
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="metric-tile rounded-[24px] px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  System online
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Live services connected</p>
              </div>
              <Link to="/admin/agents/create">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  <Plus className="w-5 h-5" />
                  Create Agent
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden items-center justify-between mb-8">
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
            value={dashboardStats?.agents?.total}
            change="+3 this week"
            changeType="positive"
            icon={Bot}
            iconColor="bg-primary/10 text-primary"
            isLoading={isLoading}
          />
          <KPICard
            title="Active Students"
            value={dashboardStats?.students?.total}
            change="+2 this week"
            changeType="positive"
            icon={Users}
            iconColor="bg-accent/10 text-accent"
            isLoading={isLoading}
          />
          <KPICard
            title="Total Conversations"
            value={dashboardStats?.students?.total_messages}
            change="+23 today"
            changeType="positive"
            icon={MessageCircle}
            iconColor="bg-success/10 text-success"
            isLoading={isLoading}
          />
          <KPICard
            title="Avg Accuracy Score"
            value={`${avgAccuracyScore}%`}
            change="+7.2% this month"
            changeType="positive"
            icon={Target}
            iconColor="bg-warning/10 text-warning"
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Performing Agents */}
          <div className="xl:col-span-2">
            <Card variant="elevated" className="insight-card border-0">
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
                  agentsData.map((agent, index) => (
                    <AgentCard key={index} agent={agent} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-border/80 bg-muted/30 py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
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
            <Card variant="elevated" className="insight-card border-0">
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
                        className="hover-lift flex items-start gap-3 rounded-[22px] border border-transparent p-3 animate-fade-in hover:border-white/70 hover:bg-white/70 dark:hover:border-white/10 dark:hover:bg-white/5"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="dashboard-orb flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-fuchsia-500/15 to-sky-500/20">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {activity?.activity_type === "agent_updated"
                              ? "Agent Updated"
                              : activity?.activity_type === "student_created"
                                ? "Student Created"
                                : activity?.activity_type ===
                                    "feedback_reviewed"
                                  ? "Feedback Reviewed"
                                  : activity?.activity_type === "agent_created"
                                    ? "Agent Created"
                                    : activity?.activity_type ===
                                        "student_updated"
                                      ? "Student Updated"
                                      : activity?.activity_type ===
                                          "student_deleted"
                                        ? "Student Deleted"
                                        : activity?.activity_type ===
                                            "agent_deleted"
                                          ? "Agent Deleted"
                                          : ""}
                          </p>
                          <p
                            className="text-sm text-muted-foreground truncate"
                            title={activity?.description}
                          >
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
            <Card variant="elevated" className="insight-card mt-6 border-0">
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
