/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Plus,
  Upload,
  MoreHorizontal,
  Mail,
  Calendar,
  BookOpen,
  Activity,
  Edit2,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  agentOfClass,
  createStudent,
  listStudent,
  getStudentDetails,
  editStudentDetails,
  deleteStudentDetails,
  changePassword,
  getStudentAgent,
} from "@/config/services";
import { useAuth } from "@/contexts/AuthContext";

interface SubjectAgent {
  subject: string;
  id: string;
}

interface NewStudent {
  id: string;
  name: string;
  email: string;
  password: string;
  class_name: string;
  subject_agent: {
    subject: string;
  }[];
}

interface Student {
  student_id: string;
  name: string | null;
  email: string | null;
  password: string | null;
  class: string;
  subject_agent: Array<{ name: string }> | null;
  status?: "active" | "inactive";
  lastActive?: string;
  totalConversations?: number;
  joinedAt?: string;
}

// const mockStudents: Student[] = [
//   {
//     student_id: "student_001",
//     name: "Alice Johnson",
//     email: "alice@school.edu",
//     class: "10th",
//     subject_agent: [{ name: "Math" }, { name: "Physics" }],
//     status: "active",
//     lastActive: "2 hours ago",
//     totalConversations: 156,
//     joinedAt: "2024-01-05",
//   },
//   {
//     student_id: "student_1002",
//     name: "Bob Smith",
//     email: "bob@school.edu",
//     class: "11th",
//     subject_agent: [{ name: "English" }, { name: "History" }],
//     status: "active",
//     lastActive: "1 day ago",
//     totalConversations: 89,
//     joinedAt: "2024-01-08",
//   },
//   {
//     student_id: "test_user_01",
//     name: "Carol Williams",
//     email: "carol@school.edu",
//     class: "12th",
//     subject_agent: [{ name: "Biology" }, { name: "Chemistry" }],
//     status: "inactive",
//     lastActive: "1 week ago",
//     totalConversations: 45,
//     joinedAt: "2024-01-10",
//   },
//   {
//     student_id: "student_002",
//     name: "David Brown",
//     email: "david@school.edu",
//     class: "10th",
//     subject_agent: [{ name: "Math" }, { name: "Computer Science" }],
//     status: "active",
//     lastActive: "5 hours ago",
//     totalConversations: 234,
//     joinedAt: "2024-01-03",
//   },
//   {
//     student_id: "test_student_1",
//     name: "Eva Martinez",
//     email: "eva@school.edu",
//     class: "11th",
//     subject_agent: [{ name: "Physics" }, { name: "Chemistry" }],
//     status: "active",
//     lastActive: "30 minutes ago",
//     totalConversations: 178,
//     joinedAt: "2024-01-12",
//   },
// ];

// const mockClasses = [
//   "Advanced Math",
//   "Physics",
//   "Chemistry",
//   "Biology",
//   "English Literature",
//   "History",
//   "Computer Science",
// ];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState<any>({
    name: "",
    email: "",
    password: "",
    class_name: "",
    subject_agent: [],
  });
  const [isSubject, setIsSubject] = useState<SubjectAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [standardTimeout, setStandardTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user } = useAuth();

  useEffect(() => {
    fetchStudentsList();
  }, []);

  const handleChangePassword = (studentId: string) => {
    setCurrentStudentId(studentId);
    setPasswordData({ current_password: "", new_password: "" });
    setIsChangePasswordDialogOpen(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudentId) return;

    try {
      setIsChangingPassword(true);
      await changePassword(passwordData, currentStudentId);

      toast.success("Password changed successfully");
      setIsChangePasswordDialogOpen(false);
      setPasswordData({ current_password: "", new_password: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const validateForm = useCallback((data: NewStudent) => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!data.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!data.class_name) {
      newErrors.class_name = "Standard is required";
    }

    // if (data.subject_agent.length === 0) {
    //   newErrors.subject_agent = 'At least one subject is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleStandardChange = (value: string) => {
    setNewStudent((prev) => ({
      ...prev,
      class_name: value,
      subject_agent: [],
    }));
    setIsSubject([]);

    // Clear previous timeout
    if (standardTimeout) {
      clearTimeout(standardTimeout);
    }

    // Set new timeout
    if (value) {
      const timeout = setTimeout(() => {
        getSubject(value);
      }, 1500);

      setStandardTimeout(timeout);
    }
  };

  const getSubject = async (className: string) => {
    try {
      setIsLoading(true);
      const res = await agentOfClass({ class_name: className });
      // const res = await getStudentAgent(user?.id);
      setIsSubject(res.agents.slice(0, 3));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subjects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectToggle = (subject: SubjectAgent) => {
    setNewStudent((prev) => {
      // Initialize subject_agent as an array if it's not already
      const currentSubjects = Array.isArray(prev.subject_agent)
        ? [...prev.subject_agent]
        : [];

      // Check if subject is already selected - handle both formats (with/without id)
      const subjectIndex = currentSubjects.findIndex(
        (s) => s.subject === subject.subject
      );

      if (subjectIndex >= 0) {
        // Remove if already selected
        const updatedSubjects = [...currentSubjects];
        updatedSubjects.splice(subjectIndex, 1);
        return { ...prev, subject_agent: updatedSubjects };
      } else {
        // Always use { subject: string } format for new subjects
        const newSubject = { subject: subject.subject };

        return {
          ...prev,
          subject_agent: [...currentSubjects, newSubject],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(newStudent)) return;

    try {
      setIsSubmitting(true);

      if (isEditMode && currentStudentId) {
        // Update existing student
        const res = await createStudent({
          ...newStudent,
          student_id: currentStudentId,
        });
        if (res) {
          toast.success("Student updated successfully");
          setIsAddDialogOpen(false);
          resetForm();
          fetchStudentsList();
        }
      } else {
        // Create new student
        const res = await createStudent(newStudent);
        if (res) {
          toast.success("Student created successfully");
          setIsAddDialogOpen(false);
          resetForm();
          fetchStudentsList();
        }
      }
    } catch (err) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} student:`,
        err
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} student`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchStudentsList = async () => {
    setIsLoading(true);
    try {
      const res = await listStudent();
      if (res && res.students) {
        setStudents(res.students);
        setTotalStudents(res.total || 0);
        toast.success(`Fetched ${res.students.length} students`);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = async (studentId: string) => {
    try {
      setIsLoading(true);
      const res = await getStudentDetails(studentId);
      if (res) {
        setCurrentStudentId(studentId);
        setIsEditMode(true);

        // Safely format subject_agent, handling null/undefined cases
        let formattedSubjects: Array<{ subject: string; id: string }> = [];

        if (res.subject_agent && Array.isArray(res.subject_agent)) {
          formattedSubjects = res.subject_agent
            .filter((subject) => subject && subject.name) // Filter out any null/undefined entries
            .map((subject) => ({
              subject: subject.name,
              id: subject.name.toLowerCase().replace(/\s+/g, "-"),
            }));
        }

        setNewStudent({
          student_id: res.student_id || studentId,
          name: res.name || "",
          email: res.email || "",
          password: res.password || "",
          class_name: res.class_name || "",
          subject_agent: formattedSubjects,
        });

        // Fetch subjects for the class if class exists
        if (res.class_name) {
          try {
            const subjects = await agentOfClass({ class_name: res.class_name });
            setIsSubject(subjects?.agents || []);
          } catch (error) {
            console.error("Error fetching subjects:", error);
            setIsSubject([]);
          }
        } else {
          setIsSubject([]);
        }

        // Open the dialog after state is updated
        setIsAddDialogOpen(true);
      }
    } catch (err) {
      console.error("Error fetching student details:", err);
      toast.error("Failed to load student details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(newStudent)) return;

    try {
      setIsSubmitting(true);

      if (isEditMode && currentStudentId) {
        // Format data for API
        const studentData = {
          name: newStudent.name,
          email: newStudent.email,
          password: newStudent.password,
          class_name: newStudent.class_name,
          subject_agent: newStudent.subject_agent.map((subject: any) => ({
            subject: subject.subject || subject.name,
          })),
        };

        // Update existing student
        const res = await editStudentDetails(currentStudentId, studentData);
        if (res) {
          toast.success("Student updated successfully");
          setIsAddDialogOpen(false);
          resetForm();
          fetchStudentsList(); // Refresh the list
        }
      } else {
        // Create new student
        const res = await createStudent(newStudent);
        if (res) {
          toast.success("Student created successfully");
          setIsAddDialogOpen(false);
          resetForm();
          fetchStudentsList();
        }
      }
    } catch (err) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} student:`,
        err
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} student`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setIsLoading(true);
      const res = await deleteStudentDetails(studentId);
      if (res) {
        toast.success("Student deleted successfully");
        fetchStudentsList();
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      toast.error("Failed to delete student");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewStudent({
      name: "",
      email: "",
      password: "",
      class_name: "",
      subject_agent: [],
    });
    setCurrentStudentId(null);
    setIsEditMode(false);
    setErrors({});
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch =
      student.name?.toLowerCase().includes(searchLower) || false;
    const emailMatch =
      student.email?.toLowerCase().includes(searchLower) || false;
    const classMatch =
      student.class?.toLowerCase().includes(searchLower) || false;
    const studentIdMatch = student.student_id
      .toLowerCase()
      .includes(searchLower);

    const matchesSearch =
      nameMatch || emailMatch || classMatch || studentIdMatch;
    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: totalStudents,
    active: students.filter((s) => s.status === "active").length,
    totalConversations: students.reduce(
      (acc, s) => acc + (s.totalConversations || 0),
      0
    ),
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Student Management
              </h1>
              <p className="text-muted-foreground">
                Manage student accounts and class assignments
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setIsEditMode(false);
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  resetForm();
                }
                setIsAddDialogOpen(open);
              }}
            >
              <DialogContent className="sm:max-w-[525px]">
                <form
                  onSubmit={isEditMode ? handleUpdateStudent : handleSubmit}
                >
                  <DialogHeader>
                    <DialogTitle>
                      {isEditMode ? "Edit Student" : "Add New Student"}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditMode
                        ? "Update the student details below."
                        : "Fill in the details to add a new student to the system."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pb-4">
                    {/* Name Field */}
                    <div className="">
                      <Label htmlFor="name" className="text-right mt-2">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="">
                        <Input
                          id="name"
                          value={newStudent.name}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              name: e.target.value,
                            })
                          }
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="">
                      <Label htmlFor="email" className="text-right mt-2">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="">
                        <Input
                          id="email"
                          type="email"
                          value={newStudent.email}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              email: e.target.value,
                            })
                          }
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="">
                      <Label htmlFor="password" className="text-right mt-2">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={newStudent.password}
                          onChange={(e) =>
                            setNewStudent({
                              ...newStudent,
                              password: e.target.value,
                            })
                          }
                          className={errors.password ? "border-red-500" : ""}
                          disabled={isEditMode}
                        />
                        {errors.password && (
                          <p className="text-sm text-red-500">
                            {errors.password}
                          </p>
                        )}
                        <div
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        >
                          {showPassword ? (
                            <Eye className="w-6 h-6 text-primary" />
                          ) : (
                            <EyeOff className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Standard Field */}
                    <div className="">
                      <Label htmlFor="standard" className="text-right mt-2">
                        Standard <span className="text-red-500">*</span>
                      </Label>
                      <div className="">
                        <Input
                          id="standard"
                          value={newStudent.class_name}
                          onChange={(e) => handleStandardChange(e.target.value)}
                          placeholder="e.g., 10th, 11th, 12th"
                          className={errors.class_name ? "border-red-500" : ""}
                        />
                        {errors.class_name && (
                          <p className="text-sm text-red-500">
                            {errors.class_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subjects Section */}
                    {isLoading ? (
                      <div className="col-span-4 flex justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="ml-2">Loading subjects...</span>
                      </div>
                    ) : isSubject.length > 0 ? (
                      <div className="space-y-2">
                        <Label className="block mb-2">
                          Subjects <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {isSubject.map((subject) => {
                            const isSelected =
                              Array.isArray(newStudent.subject_agent) &&
                              newStudent.subject_agent.some(
                                (s) =>
                                  s.name === subject.subject ||
                                  s.subject === subject.subject
                              );

                            return (
                              <button
                                key={subject.id}
                                type="button"
                                onClick={() => handleSubjectToggle(subject)}
                                className={`capitalize text-xs px-3 py-1.5 rounded-full transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border border-primary"
                                    : "bg-muted hover:bg-muted/80 border border-border"
                                }`}
                              >
                                {subject.subject}
                              </button>
                            );
                          })}
                        </div>
                        {errors.subject_agent && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.subject_agent}
                          </p>
                        )}
                      </div>
                    ) : newStudent.class_name ? (
                      <div className="col-span-4 text-center text-muted-foreground py-2">
                        No subjects found for this standard
                      </div>
                    ) : null}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setErrors({});
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditMode ? "Updating..." : "Adding..."}
                        </>
                      ) : isEditMode ? (
                        "Update Student"
                      ) : (
                        "Add Student"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">
                    Active Students
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.totalConversations.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Conversations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell className="font-mono text-sm">
                      {student.student_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {student.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name || "N/A"}</p>
                          {student.email ? (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {student.email}
                              </span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.class || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {student.subject_agent?.length ? (
                          student.subject_agent.map(
                            (subject: any, idx: number) => (
                              <Badge
                                key={`${student.student_id}-subj-${idx}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {subject.subject}
                              </Badge>
                            )
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No subjects
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === "active" ? "default" : "secondary"
                        }
                        className={
                          student.status === "active"
                            ? "bg-green-500/10 text-green-600"
                            : ""
                        }
                      >
                        {student.status || "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        {student.lastActive || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleEditStudent(student.student_id)
                            }
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangePassword(student.student_id)
                            }
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Change Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleDeleteStudent(student.student_id)
                            }
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update the password for this student account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                    required
                  />
                  <div
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    required
                    minLength={8}
                  />
                  <div
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordDialogOpen(false)}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
