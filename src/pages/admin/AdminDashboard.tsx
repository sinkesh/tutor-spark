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
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAgents } from "@/config/services";
import { toast } from "sonner";

// Mock data
const kpiData: KPIData = {
  totalAgents: 24,
  activeStudents: 1847,
  totalConversations: 45230,
  avgAccuracyScore: 94.2,
};

const recentActivity = [
  {
    action: "Agent updated",
    target: "Advanced Mathematics",
    time: "5 mins ago",
  },
  { action: "New student joined", target: "Physics 101", time: "12 mins ago" },
  {
    action: "Feedback reviewed",
    target: "English Literature",
    time: "1 hour ago",
  },
  { action: "Agent created", target: "Chemistry Basics", time: "3 hours ago" },
];

export default function AdminDashboard() {
  const [agentsData, setAgentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getAllAgents = async () => {
    try {
      setIsLoading(true);
      const response = await getAgents();

      const agents = response?.agents ?? [];
      setAgentsData(agents.slice(0, 3));
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            value={`${kpiData.avgAccuracyScore}%`}
            change="+1.2% this month"
            changeType="positive"
            icon={Target}
            iconColor="bg-warning/10 text-warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Performing Agents */}
          <div className="lg:col-span-2">
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
                {agentsData.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
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
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.target}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                  ))}
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
