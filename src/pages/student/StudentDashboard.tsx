import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bot,
  MessageCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { agentOfClass, getStudentAgent } from "@/config/services";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import SubjectSkeletonItem from "@/components/loader/SubjectSkeletonItem";

const assignedClasses = [
  {
    id: "1",
    name: "Advanced Mathematics",
    subject: "Mathematics",
    agentCount: 3,
  },
  { id: "2", name: "English Literature", subject: "English", agentCount: 2 },
  { id: "3", name: "Physics 101", subject: "Science", agentCount: 4 },
];

const recentAgents = [
  {
    id: "1",
    name: "Calculus Helper",
    lastUsed: "2 hours ago",
    type: "subject",
  },
  {
    id: "2",
    name: "Essay Writing Guide",
    lastUsed: "Yesterday",
    type: "course",
  },
  {
    id: "3",
    name: "Physics Problem Solver",
    lastUsed: "3 days ago",
    type: "class",
  },
];

const suggestedAgents = [
  {
    id: "4",
    name: "Statistics Tutor",
    description: "Master probability and data analysis",
    type: "subject",
  },
  {
    id: "5",
    name: "Creative Writing",
    description: "Improve your storytelling skills",
    type: "course",
  },
];

export default function StudentDashboard() {
  const [isSubject, setIsSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const getSubject = async () => {
    try {
      setIsLoading(true);

      // const res = await agentOfClass({ class_name: "8" });
      const res = await getStudentAgent(user?.id);
      console.log("res====", res);
      setIsSubject(res.subjects.slice(0, 3));
      toast.success("Data get successfully");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSubject();
  }, []);

  return (
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back,{" "}
            <span className="text-gradient">{user?.name.split(" ")[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Continue your learning journey
          </p>
        </div>

        {/* Quick Start */}
        <Card variant="glow" className="mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Ready to learn?
                </h2>
                <p className="text-muted-foreground">
                  Pick up where you left off or explore new topics
                </p>
              </div>
              <Link to="/student/chat/1">
                <Button variant="gradient-accent" size="lg">
                  Start Learning
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Classes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Classes</CardTitle>
                <Link to="/student/explore">
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
                      <SubjectSkeletonItem key={index} />
                    ))}
                  </div>
                ) : (
                  isSubject?.map((cls) => (
                    <Link
                      key={cls?.subject_agent_id}
                      to={`/student/explore?class=${cls.id}`}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors capitalize">
                          {cls.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {cls?.description}
                        </p>
                      </div>
                      {/* <Badge variant="secondary">{cls.agentCount} agents</Badge>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" /> */}
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent & Suggested */}
          <div className="space-y-6">
            {/* Recently Used */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Recent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isSubject?.slice(0, 3).map((cls) => (
                  <Link
                    key={cls}
                    to={`/student/explore?class=${cls.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {cls.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                  </Link>
                ))}
                {/* {recentAgents.map((cls) => (
                  <Link
                    key={cls.id}
                    to={`/student/explore?class=${cls.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {cls.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cls.lastUsed}
                      </p>
                    </div>
                  </Link>
                ))} */}
              </CardContent>
            </Card>

            {/* Suggested */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Suggested
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    to={`/student/chat/${agent.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                      <Bot className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {agent.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {agent.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
