/* eslint-disable @typescript-eslint/no-explicit-any */
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Bot,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  getAgents,
  getAllAgentPerformance,
  getAdminDashboardStats,
} from "@/config/services";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const usageData = [
  { date: "Mon", conversations: 320, students: 145 },
  { date: "Tue", conversations: 410, students: 168 },
  { date: "Wed", conversations: 385, students: 152 },
  { date: "Thu", conversations: 520, students: 198 },
  { date: "Fri", conversations: 480, students: 185 },
  { date: "Sat", conversations: 190, students: 78 },
  { date: "Sun", conversations: 160, students: 65 },
];

const accuracyData = [
  { week: "Week 1", accuracy: 85 },
  { week: "Week 2", accuracy: 87 },
  { week: "Week 3", accuracy: 89 },
  { week: "Week 4", accuracy: 91 },
  { week: "Week 5", accuracy: 90 },
  { week: "Week 6", accuracy: 93 },
];

const topicsData = [
  { name: "Mathematics", value: 35, color: "hsl(var(--primary))" },
  { name: "Science", value: 25, color: "hsl(var(--accent))" },
  { name: "English", value: 20, color: "hsl(var(--chart-3))" },
  { name: "History", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Other", value: 8, color: "hsl(var(--muted))" },
];

// const agentPerformance = [
//   { name: 'Math Tutor', accuracy: 94, conversations: 2340, trend: 'up' },
//   { name: 'Physics Teacher', accuracy: 91, conversations: 1890, trend: 'up' },
//   { name: 'English Guide', accuracy: 88, conversations: 1560, trend: 'down' },
//   { name: 'History Tutor', accuracy: 92, conversations: 980, trend: 'up' },
//   { name: 'Chemistry AI', accuracy: 85, conversations: 720, trend: 'stable' },
// ];

const peakHoursData = [
  { hour: "6am", users: 12 },
  { hour: "8am", users: 45 },
  { hour: "10am", users: 89 },
  { hour: "12pm", users: 120 },
  { hour: "2pm", users: 145 },
  { hour: "4pm", users: 180 },
  { hour: "6pm", users: 156 },
  { hour: "8pm", users: 98 },
  { hour: "10pm", users: 45 },
];

export default function AnalyticsPage() {
  const [dashboardStats, setDashboardStats] = useState<{
    students: { total: number; total_sessions: number; total_messages: number };
    agents: { total: number };
    timestamp: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avgAccuracyScore, setAvgAccuracyScore] = useState("");
  const [agentPerformance, setAgentPerformance] = useState<any>([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAgentPerformance();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await getAdminDashboardStats();
      setDashboardStats(response);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgentPerformance = async () => {
    try {
      setIsLoading(true);

      const res = await getAllAgentPerformance();

      if (res?.success) {
        const validAgents = res?.agents.filter(
          (agent: any) => Number(agent.metrics?.overall_score) > 0,
        );

        const averageScore =
          validAgents.length > 0
            ? (
                validAgents.reduce(
                  (sum: any, agent: any) =>
                    sum + Number(agent.metrics?.overall_score),
                  0,
                ) / validAgents.length
              ).toFixed(1)
            : "0.0";

        setAvgAccuracyScore(averageScore);

        const sortedAgents = (
          validAgents && validAgents.length > 0
            ? validAgents
            : res?.agents || []
        ).sort((a: any, b: any) => {
          const scoreA = a?.metrics?.overall_score ?? 0;
          const scoreB = b?.metrics?.overall_score ?? 0;
          return scoreB - scoreA;
        });

        setAgentPerformance(sortedAgents.slice(0, 10));
        toast.success("Agent performance data loaded successfully");
      } else {
        throw new Error(res?.message || "Failed to fetch data");
      }
    } catch (err: any) {
      console.error("Performance Fetch Error:", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="md:p-8 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Analytics & Monitoring
              </h1>
              <p className="text-muted-foreground">
                Track platform performance and student engagement
              </p>
            </div>
          </div>
          <Select defaultValue="7d">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Conversations
                  </p>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold">
                      {dashboardStats?.students?.total_messages}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-green-500">
                    <ArrowUp className="w-3 h-3" />
                    <span>12% vs last week</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Students
                  </p>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold">
                      {dashboardStats?.students?.total}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-green-500">
                    <ArrowUp className="w-3 h-3" />
                    <span>8% vs last week</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                  {isLoading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold">{avgAccuracyScore}%</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-green-500">
                    <ArrowUp className="w-3 h-3" />
                    <span>2.1% improvement</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Session Time</p>
                  <p className="text-2xl font-bold">18m</p>
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <ArrowDown className="w-3 h-3" />
                    <span>3% vs last week</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>

        <Tabs defaultValue="platform" className="space-y-6">
          <TabsList>
            <TabsTrigger value="platform">Platform Analytics</TabsTrigger>
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          </TabsList>

          {/* Platform Analytics */}
          <TabsContent value="platform" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={usageData}>
                        <defs>
                          <linearGradient
                            id="colorConv"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="conversations"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorConv)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Topics Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Topic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center">
                    <ResponsiveContainer width="50%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={topicsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {topicsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {topicsData.map((topic) => (
                        <div
                          key={topic.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: topic.color }}
                            />
                            <span className="text-sm">{topic.name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {topic.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Peak Usage Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="hour"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="users"
                          fill="hsl(var(--accent))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Accuracy Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={accuracyData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="week"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          domain={[80, 100]}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agent Performance */}
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Agent Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentPerformance.map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">
                            {agent?.agent_metadata?.agent_name}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {agent?.total_conversations} conversations
                            </span>
                            <Badge
                              className={
                                agent?.metrics?.overall_score > 80
                                  ? "bg-green-500/10 text-green-600 hover:text-white"
                                  : agent?.metrics?.overall_score < 80
                                    ? "bg-red-500/10 text-red-600 hover:text-white"
                                    : ""
                              }
                              variant={
                                agent?.metrics?.overall_score > 80
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {agent?.metrics?.overall_score > 80 && (
                                <ArrowUp className="w-3 h-3 mr-1" />
                              )}
                              {agent?.metrics?.overall_score < 80 && (
                                <ArrowDown className="w-3 h-3 mr-1" />
                              )}
                              {agent?.metrics?.overall_score}% accuracy
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full gradient-primary"
                            style={{
                              width: `${agent?.metrics?.overall_score}%`,
                            }}
                          />
                        </div>
                      </div>
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
