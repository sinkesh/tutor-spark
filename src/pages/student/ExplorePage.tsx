import { useEffect, useState } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search,
  Bot,
  BookOpen,
  Layers,
  GraduationCap,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { agentOfClass, getStudentAgent } from "@/config/services";
import { toast } from "sonner";
import SubjectSkeletonItem from "@/components/loader/SubjectSkeletonItem";
import { useAuth } from "@/contexts/AuthContext";

const typeIcons = {
  subject: BookOpen,
  // teacher: User,
};

const typeColors = {
  subject: "text-primary bg-primary/10",
  // teacher: "text-warning bg-warning/10",
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubject, setIsSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();

  const getSubject = async () => {
    try {
      setIsLoading(true);

      const res = await getStudentAgent(user?.id);

      const allSubjects = [
        ...(res?.student_subjects || []),
        ...(res?.general_subjects || []),
      ];

      setIsSubject(allSubjects);
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
      <div className="md:p-8 p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Explore</h1>
          <p className="text-muted-foreground mt-1">Browse all your subjects</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          {Object.entries(typeColors).map(([type, color]) => {
            const Icon = typeIcons[type as keyof typeof typeIcons];
            return (
              <div key={type} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center",
                    color,
                  )}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <span className="text-sm text-muted-foreground capitalize">
                  {type}
                </span>
              </div>
            );
          })}
        </div>

        {/* Folder Tree */}
        <Card>
          <CardHeader>
            <CardTitle>Course Structure</CardTitle>
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
                  to={`/student/chat/${cls.name}`}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors capitalize">
                      {cls.name}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground line-clamp-2"
                      title={cls?.description}
                    >
                      {cls?.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
