import { useEffect, useState } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Bot,
  BookOpen,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { agentOfClass } from "@/config/services";
import { toast } from "sonner";
import SubjectSkeletonItem from "@/components/loader/SubjectSkeletonItem";

interface FolderNode {
  id: string;
  name: string;
  type: "class" | "subject" | "course" | "agent";
  children?: FolderNode[];
}

// const mockHierarchy: FolderNode[] = [
//   {
//     id: "class-1",
//     name: "Grade 11 - Advanced Track",
//     type: "class",
//     children: [
//       {
//         id: "subject-1",
//         name: "Mathematics",
//         type: "subject",
//         children: [
//           {
//             id: "course-1",
//             name: "Calculus",
//             type: "course",
//             children: [
//               { id: "agent-1", name: "Calculus Helper", type: "agent" },
//               { id: "agent-2", name: "Derivatives Expert", type: "agent" },
//             ],
//           },
//           {
//             id: "course-2",
//             name: "Algebra",
//             type: "course",
//             children: [{ id: "agent-3", name: "Algebra Tutor", type: "agent" }],
//           },
//         ],
//       },
//       {
//         id: "subject-2",
//         name: "Physics",
//         type: "subject",
//         children: [
//           {
//             id: "course-3",
//             name: "Mechanics",
//             type: "course",
//             children: [
//               { id: "agent-4", name: "Physics Problem Solver", type: "agent" },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "class-2",
//     name: "Grade 11 - Language Arts",
//     type: "class",
//     children: [
//       {
//         id: "subject-3",
//         name: "English",
//         type: "subject",
//         children: [
//           {
//             id: "course-4",
//             name: "Literature",
//             type: "course",
//             children: [
//               { id: "agent-5", name: "Essay Writing Guide", type: "agent" },
//               {
//                 id: "agent-6",
//                 name: "Literary Analysis Helper",
//                 type: "agent",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// ];

const typeIcons = {
  class: GraduationCap,
  subject: BookOpen,
  course: Layers,
  agent: Bot,
};

const typeColors = {
  class: "text-primary bg-primary/10",
  subject: "text-accent bg-accent/10",
  course: "text-success bg-success/10",
  agent: "text-warning bg-warning/10",
};

function FolderItem({ node, depth = 0 }: { node: FolderNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = typeIcons[node.type];

  if (node.type === "agent") {
    return (
      <Link
        to={`/student/chat/${node.id}`}
        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            typeColors[node.type]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
          {node.name}
        </span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {hasChildren &&
          (isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ))}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            typeColors[node.type]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-foreground">{node.name}</span>
      </button>
      {isOpen && hasChildren && (
        <div className="animate-fade-in">
          {node.children!.map((child) => (
            <FolderItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubject, setIsSubject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSubject = async () => {
    try {
      setIsLoading(true);

      const res = await agentOfClass({ class_name: "10th" });

      setIsSubject(res.agents);
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
          <h1 className="text-3xl font-bold text-foreground">Explore</h1>
          <p className="text-muted-foreground mt-1">
            Browse all your classes, subjects, and AI teachers
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search agents, subjects, or courses..."
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
                    color
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
                  key={cls.id}
                  to={`/student/chat/${cls.subject}`}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors capitalize">
                      {cls.agent_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {cls.subject}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
          {/* <CardContent>
            <div className="space-y-1">
              {mockHierarchy.map((node) => (
                <FolderItem key={node.id} node={node} />
              ))}
            </div>
          </CardContent> */}
        </Card>
      </div>
    </StudentLayout>
  );
}
