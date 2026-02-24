/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { login as apiLogin } from "@/config/services";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiLogin({ email, password });
      const { access_token, refresh_token, user: userData } = response.data;

      // Validate response data structure
      if (!userData || !userData.user_id || !userData.email || !userData.name || !userData.role) {
        throw new Error("Invalid response data from server");
      }

      const user: User = {
        id: userData.user_id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        class: userData.class || "",
        is_active: userData.is_active ?? true,
        permissions: userData.permissions || [],
      };

      // Store tokens and user data
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Update auth context
      await authLogin(user);

      // Navigate based on role
      const navigateTo = user.role === "admin" ? "/admin" : 
                        user.role === "student" ? "/student" : "/";
      
      navigate(navigateTo);

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (err: any) {
      console.error("Login error:", err);
      
      let errorMessage = "Invalid email or password";
      
      // Handle different error scenarios
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        errorMessage = "Connection timeout. Please try again.";
      } else if (err.code === "NETWORK_ERROR" || !err.response) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || "Invalid request format";
            break;
          case 401:
            errorMessage = err.response.data?.message || "Invalid email or password";
            break;
          case 403:
            errorMessage = "Access forbidden. Please contact administrator.";
            break;
          case 404:
            errorMessage = "Service not found. Please try again later.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = err.response.data?.message || `Error (${err.response.status})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary-foreground">
              AI Teachers
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Intelligent Learning,
            <br />
            <span className="text-accent">Personalized</span> for Every Student
          </h1>

          <p className="text-lg text-primary-foreground/70 max-w-md mb-8">
            Create, manage, and deploy AI-powered teaching agents that adapt to
            each student's learning journey.
          </p>

          <div className="flex items-center gap-2 text-primary-foreground/60">
            <Sparkles className="w-5 h-5" />
            <span>Powered by advanced AI technology</span>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              AI Teachers
            </span>
          </div>

          <Card variant="elevated" className="border-0 shadow-xl">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl text-center">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
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

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Demo credentials:
                </p>
                <div className="grid gap-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-secondary">
                    <span className="text-muted-foreground">Admin:</span>
                    <code className="font-mono text-foreground">
                      admin@aiteachers.com
                    </code>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-secondary">
                    <span className="text-muted-foreground">Student:</span>
                    <code className="font-mono text-foreground">
                      student@aiteachers.com
                    </code>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-secondary">
                    <span className="text-muted-foreground">Password:</span>
                    <code className="font-mono text-foreground">password</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
