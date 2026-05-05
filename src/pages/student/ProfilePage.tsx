import { useEffect, useState } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  Mail,
  BookOpen,
  Bell,
  Shield,
  Save,
  Camera,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  Loader2,
  AlertCircle,
  GraduationCap,
  Brain,
  Clock,
  Zap,
  Target,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getStudentProfile, updateStudentProfile } from "@/config/services";

const mockAssignedCourses = [
  { id: "1", name: "Advanced Mathematics", progress: 75 },
  { id: "2", name: "Physics Fundamentals", progress: 60 },
  { id: "3", name: "English Literature", progress: 45 },
  { id: "4", name: "Biology 101", progress: 30 },
];

const mockFeedbackHistory = [
  {
    id: "1",
    agentName: "Math Tutor",
    type: "positive",
    message: "Clear explanation of derivatives",
    date: "2024-01-20",
  },
  {
    id: "2",
    agentName: "Physics Teacher",
    type: "negative",
    message: "Answer was unclear",
    date: "2024-01-19",
  },
  {
    id: "3",
    agentName: "English Guide",
    type: "positive",
    message: "Great analysis of themes",
    date: "2024-01-18",
  },
];

interface ProfileData {
  name: string;
  email: string;
  age: string;
  class_name: string;
  subjects: string;
}

interface LearningStyle {
  pace: string;
  explanation_depth: string;
  example: boolean;
  difficulty_level: string;
  interaction_mode: string;
  memory: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    age: "",
    class_name: "",
    subjects: "",
  });
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(
    null
  );
  const [memberSince, setMemberSince] = useState<string>("");
  const [totalConversations, setTotalConversations] = useState(0);

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    newAgents: true,
    weeklyProgress: false,
  });

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getStudentProfile(user.id);
      console.log("Profile loaded:", response);

      const details = response.student_details || {};
      setProfileData({
        name: details.name || "",
        email: details.email || "",
        age: details.age ? String(details.age) : "",
        class_name: details.class_name || "",
        subjects: Array.isArray(details.subjects)
          ? details.subjects.join(", ")
          : "",
      });

      setLearningStyle(response.learning_style || null);
      setTotalConversations(response.sessions?.length || 0);

      if (response.metadata?.created_at) {
        const date = new Date(response.metadata.created_at);
        setMemberSince(
          date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        );
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load profile");
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);

      const updateData: any = {};
      if (profileData.name.trim()) updateData.name = profileData.name.trim();
      if (profileData.age)
        updateData.age = parseInt(profileData.age, 10);
      if (profileData.class_name.trim())
        updateData.class_name = profileData.class_name.trim();
      if (profileData.subjects.trim()) {
        updateData.subjects = profileData.subjects
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
      }

      const response = await updateStudentProfile(user.id, updateData);
      console.log("Profile updated:", response);

      // Sync auth context with updated values
      const updates: any = {};
      if (updateData.name) updates.name = updateData.name;
      if (updateData.class_name) updates.class = updateData.class_name;
      updateUser(updates);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    profileData.name !== (user?.name || "") ||
    profileData.age !== "" ||
    profileData.class_name !== (user?.class || "");

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="font-medium mb-2">Error loading profile</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadProfile}>Try Again</Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="md:p-8 p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <User className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Profile & Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="feedback">Feedback History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="md:w-24 md:h-24 w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-3xl font-bold text-accent">
                        {profileData.name?.charAt(0) || user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 opacity-70 pointer-events-none"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {profileData.name || user?.name}
                    </h3>
                    <p className="text-muted-foreground break-all">
                      {profileData.email || user?.email}
                    </p>
                    <Badge className="mt-2 capitalize">{user?.role}</Badge>
                  </div>
                </div>

                {/* Editable Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) =>
                        setProfileData({ ...profileData, age: e.target.value })
                      }
                      placeholder="Enter your age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class_name">Class / Standard</Label>
                    <Input
                      id="class_name"
                      value={profileData.class_name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          class_name: e.target.value,
                        })
                      }
                      placeholder="e.g. 10th Grade"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="subjects">Subjects (comma separated)</Label>
                    <Input
                      id="subjects"
                      value={profileData.subjects}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          subjects: e.target.value,
                        })
                      }
                      placeholder="e.g. Math, Science, English"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={!hasChanges ? "opacity-70" : ""}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            {/* Learning Style */}
            {learningStyle && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Learning Style
                  </CardTitle>
                  <CardDescription>
                    How the AI adapts teaching to your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium">Pace</p>
                      </div>
                      <p className="text-lg font-semibold capitalize">
                        {learningStyle.pace}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-accent" />
                        <p className="text-sm font-medium">Explanation</p>
                      </div>
                      <p className="text-lg font-semibold capitalize">
                        {learningStyle.explanation_depth?.replace("-", " ")}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-100 dark:bg-green-900/10 dark:border-green-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium">Difficulty</p>
                      </div>
                      <p className="text-lg font-semibold capitalize">
                        {learningStyle.difficulty_level}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium">Interaction</p>
                      </div>
                      <p className="text-lg font-semibold capitalize">
                        {learningStyle.interaction_mode}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-800/30 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm font-medium">Examples</p>
                      </div>
                      <p className="text-lg font-semibold">
                        {learningStyle.example ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>

                  {learningStyle.memory && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-1">AI Memory Summary</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {learningStyle.memory}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold">{totalConversations}</p>
                    <p className="text-sm text-muted-foreground">
                      Total Conversations
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold">
                      {
                        profileData.subjects
                          ? profileData.subjects.split(",").filter((s) => s.trim())
                              .length
                          : 0
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enrolled Subjects
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Member since</p>
                    <p className="text-sm text-muted-foreground">
                      {memberSince || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Assigned Courses
                </CardTitle>
                <CardDescription>
                  Your enrolled courses and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAssignedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-accent"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  Feedback History
                </CardTitle>
                <CardDescription>
                  Your feedback on AI responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockFeedbackHistory.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        feedback.type === "positive"
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {feedback.type === "positive" ? (
                        <ThumbsUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <ThumbsDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{feedback.agentName}</span>
                        <span className="text-xs text-muted-foreground">
                          {feedback.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feedback.message}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 opacity-70 pointer-events-none">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">Email Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailUpdates: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">New AI Teachers</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new agents are available
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newAgents}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        newAgents: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">Weekly Progress Report</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly learning summary
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyProgress}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        weeklyProgress: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 opacity-70 pointer-events-none">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Update Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
