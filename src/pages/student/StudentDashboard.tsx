import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bot,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  MessageCircle,
  Layers3,
  Compass,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getRecentActivityStudent, getStudentAgent } from "@/config/services";
import { useAgentCache } from "@/hooks/useAgentCache";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import SubjectSkeletonItem from "@/components/loader/SubjectSkeletonItem";
import { appRoutes } from "@/config/routes";

// const assignedClasses = [
//   {
//     id: "1",
//     name: "Advanced Mathematics",
//     subject: "Mathematics",
//     agentCount: 3,
//   },
//   { id: "2", name: "English Literature", subject: "English", agentCount: 2 },
//   { id: "3", name: "Physics 101", subject: "Science", agentCount: 4 },
// ];

// const recentAgents = [
//   {
//     id: "1",
//     name: "Calculus Helper",
//     lastUsed: "2 hours ago",
//     type: "subject",
//   },
//   {
//     id: "2",
//     name: "Essay Writing Guide",
//     lastUsed: "Yesterday",
//     type: "course",
//   },
//   {
//     id: "3",
//     name: "Physics Problem Solver",
//     lastUsed: "3 days ago",
//     type: "class",
//   },
// ];

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
  const [recentActivity, setRecentActivity] = useState(null);
  const { user } = useAuth();
  const { resolveAndCacheAgent } = useAgentCache();

  // Get current subject from URL to filter subjects
  const getCurrentSubject = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/math')) return 'Math';
    if (currentPath.includes('/science')) return 'Science';
    if (currentPath.includes('/physics')) return 'Physics';
    if (currentPath.includes('/chemistry')) return 'Chemistry';
    if (currentPath.includes('/biology')) return 'Biology';
    if (currentPath.includes('/english')) return 'English';
    if (currentPath.includes('/history')) return 'History';
    if (currentPath.includes('/geography')) return 'Geography';
    return null;
  };

  const currentSubject = getCurrentSubject();

  const getSubject = async () => {
    try {
      setIsLoading(true);

      console.log('Fetching student subjects for user:', user?.id);
      const res = await getStudentAgent(user?.id);
      console.log('Student subjects response:', res);

      const assignedSubjects = res?.student_subjects || [];

      console.log('Assigned student subjects:', assignedSubjects);

      // Enhance subjects with additional metadata and pre-cache agent info
      const enhancedSubjects = await Promise.all(
        assignedSubjects.map(async (subject) => {
          const displayName = subject.name || subject.subject || 'Unknown Subject';

          // Pre-cache agent info for better performance
          if (subject.subject_agent_id) {
            try {
              const cachedAgent = await resolveAndCacheAgent(displayName, user?.id);
              if (!cachedAgent) {
                console.warn(`Failed to cache agent for ${displayName}, but continuing...`);
              }
            } catch (error) {
              console.warn(`Failed to pre-cache agent for ${displayName}:`, error);
            }
          }

          return {
            ...subject,
            displayName,
            agentCount: subject.agent_count || 1,
            isAssigned: !!subject.student_id, // Indicates if specifically assigned to this student
            subject_agent_id: subject.subject_agent_id
          };
        })
      );

      setIsSubject(enhancedSubjects);
      console.log('Enhanced subjects with metadata:', enhancedSubjects);

      toast.success("Subjects loaded successfully");
    } catch (err) {
      console.error('Error fetching subjects:', err);
      toast.error("Failed to load subjects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSubject();
    fetchRecentActivity();
  }, [resolveAndCacheAgent]);

  const fetchRecentActivity = async () => {
    try {
      setIsLoading(true);

      const res = await getRecentActivityStudent(user?.id);
      setRecentActivity(res);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="dashboard-page-padding">
        {/* Header */}
        <div className="dashboard-hero mb-8">
          <div className="relative px-5 py-6 sm:px-7 sm:py-8">
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant="secondary" className="dashboard-chip mb-4 border-0 bg-transparent px-0 py-0 text-[11px]">
                  <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
                  Student workspace
                </Badge>
                <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-fuchsia-500 via-rose-500 to-sky-500 bg-clip-text text-transparent">{user?.name.split(" ")[0]}</span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Continue your learning journey with focused subjects, active AI tutors, and recent conversations in one bright, high-energy workspace.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="dashboard-chip normal-case tracking-normal text-xs sm:text-sm">
                    <Compass className="h-4 w-4 text-sky-500" />
                    Guided subject discovery
                  </div>
                  <div className="dashboard-chip normal-case tracking-normal text-xs sm:text-sm">
                    <Rocket className="h-4 w-4 text-amber-500" />
                    Fast restart into active chats
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:min-w-[420px] sm:grid-cols-3">
                <div className="metric-tile">
                  <BookOpen className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-xl font-bold">{isSubject?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                </div>
                <div className="metric-tile">
                  <MessageCircle className="mb-2 h-4 w-4 text-accent" />
                  <p className="text-xl font-bold">{recentActivity?.recent_activity?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Recent</p>
                </div>
                <div className="metric-tile">
                  <Layers3 className="mb-2 h-4 w-4 text-success" />
                  <p className="text-xl font-bold">{suggestedAgents.length}</p>
                  <p className="text-xs text-muted-foreground">Suggested</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <Card variant="glow" className="insight-card mb-8 overflow-hidden border-0">
          <CardContent className="relative p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="dashboard-orb flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-200/70">
                <Sparkles className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="mb-1 text-xl font-semibold text-foreground">
                  Ready to learn?
                </h2>
                <p className="text-muted-foreground mb-4 sm:mb-0">
                  Start a new chat session or continue your conversations
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Link to={appRoutes.student.chat} className="flex-1 sm:flex-initial">
                  <Button
                    variant="gradient-accent"
                    size="lg"
                    className="w-full"
                  >
                    New Chat
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to={appRoutes.student.explore} className="flex-1 sm:flex-initial">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Explore
                    <BookOpen className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Classes */}
          <div className="lg:col-span-2">
            <Card className="insight-card border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Classes</CardTitle>
                {isSubject?.length > 0 && (
                  <Link to={appRoutes.student.explore}>
                    <Button variant="ghost" size="sm">
                      View all
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-5">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SubjectSkeletonItem key={index} />
                    ))}
                  </div>
                ) : isSubject && isSubject.length > 0 ? (
                  isSubject?.filter(subject =>
                    currentSubject ? subject.name === currentSubject : true
                  ).map((cls) => (
                    <Link
                      key={cls?.subject_agent_id || cls?.id}
                      to={appRoutes.student.newSubjectChat(cls.displayName)}
                    className="group hover-lift flex items-center gap-4 rounded-[24px] border border-white/70 bg-white/70 p-4 hover:border-fuchsia-200 hover:bg-white dark:border-white/10 dark:bg-white/5"
                  >
                      <div className="dashboard-orb flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-fuchsia-500/15 to-sky-500/20 ring-1 ring-white/50">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors capitalize">
                          {cls.displayName}
                        </h3>
                        <p
                          className="text-sm text-muted-foreground line-clamp-2"
                          title={cls?.description}
                        >
                          {cls?.description || `Learn ${cls.displayName} with personalized AI assistance`}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="rounded-full border border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/10">{cls.agentCount} agents</Badge>
                          {cls.isAssigned && (
                            <Badge variant="outline" className="text-xs">
                              Assigned
                            </Badge>
                          )}
                          {cls.subject_agent_id && (
                            <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Link>
                  ))
                ) : (
                  <Card className="insight-card border-0 p-8 text-center">
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Subjects Available
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't been assigned any subjects yet. Please contact your administrator to get your subjects added.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link to={appRoutes.student.explore}>
                        <Button variant="default">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Explore Subjects
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        Refresh
                      </Button>
                    </div>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent & Suggested */}
          <div className="space-y-6">
            <Card className="insight-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Recent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity?.recent_activity?.slice(0, 3).map((cls) => (
                  <Link
                    key={cls?.agent_id}
                    to={`${appRoutes.student.explore}?class=${cls?.agent_id}`}
                    className="group hover-lift flex items-center gap-3 rounded-[22px] border border-transparent p-3 hover:border-white/70 hover:bg-white/70 dark:hover:border-white/10 dark:hover:bg-white/5"
                  >
                    <div className="dashboard-orb flex h-10 w-10 items-center justify-center rounded-[16px] bg-gradient-to-br from-cyan-500/15 to-emerald-500/20">
                      <Bot className="w-5 h-5 text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {cls?.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cls?.time_ago}
                      </p>
                    </div>
                  </Link>
                ))}
                {/* {recentAgents.map((cls) => (
                  <Link
                    key={cls.id}
                    to={`${appRoutes.student.explore}?class=${cls.id}`}
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
            <Card className="insight-card border-0">
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
                    to={appRoutes.student.legacyChat(agent.id)}
                    className="group hover-lift flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/70 p-3 hover:border-sky-200 hover:bg-white dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="dashboard-orb flex h-10 w-10 items-center justify-center rounded-[16px] bg-gradient-to-br from-fuchsia-500 to-sky-500">
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
