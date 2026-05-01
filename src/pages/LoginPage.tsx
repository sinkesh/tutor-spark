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
  ShieldCheck,
  ChartNoAxesCombined,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import { login as apiLogin } from "@/config/services";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types";
import ThemeToggle from "@/components/theme-toggle";

// Helper function to decode JWT payload
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

const platformSignals = [
  {
    title: "Adaptive tutoring",
    description: "Responses shaped around each learner's pace and subject context.",
    icon: BrainCircuit,
  },
  {
    title: "Clear insight flow",
    description: "Track sessions, revisit documents, and maintain learning momentum.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Secure access",
    description: "Protected workspace for admins, teachers, and students across flows.",
    icon: ShieldCheck,
  },
];

const loginHighlights = [
  "Focused tutor workspace",
  "Premium learning interface",
  "Fast, secure sign in",
];

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
      const { access_token, refresh_token, user_id, role, email: userEmail } = response.data;

      // Validate response data structure
      if (!access_token || !user_id || !role) {
        throw new Error("Invalid response data from server");
      }

      // Store tokens immediately so subsequent API calls are authenticated
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Decode JWT to get user name (stored in token payload)
      const jwtPayload = decodeJWT(access_token);
      const userName = jwtPayload?.name || jwtPayload?.email?.split('@')[0] || 'User';

      // Get class from JWT if available; student details API is admin-only so we skip it
      const userClass = jwtPayload?.class || "";

      const user: User = {
        id: user_id,
        email: userEmail || email,
        name: userName,
        role: role,
        class: userClass,
        is_active: true,
        permissions: jwtPayload?.permissions || [],
      };

      // Store user data
      localStorage.setItem("user", JSON.stringify(user));

      // Update auth context
      await authLogin(user);

      // Navigate based on role
      const navigateTo =
        user.role === "admin"
          ? "/admin"
          : user.role === "student"
            ? "/student"
            : "/";

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
            errorMessage =
              err.response.data?.message || "Invalid request format";
            break;
          case 401:
            errorMessage =
              err.response.data?.message || "Invalid email or password";
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
            errorMessage =
              err.response.data?.message || `Error (${err.response.status})`;
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
    <div className="relative min-h-screen overflow-hidden app-surface dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_24rem),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.10),transparent_26rem),linear-gradient(135deg,#06131f_0%,#0b1220_45%,#111827_100%)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative grid min-h-screen xl:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
        <div className="relative hidden overflow-hidden gradient-dark dark:bg-[radial-gradient(circle_at_14%_12%,rgba(45,212,191,0.18),transparent_18rem),radial-gradient(circle_at_82%_14%,rgba(250,204,21,0.12),transparent_16rem),linear-gradient(145deg,#08111f_0%,#102235_46%,#15382f_100%)] xl:flex">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:44px_44px] dark:opacity-15" />
          <div className="absolute left-16 top-16 h-32 w-32 rounded-full border border-white/20 bg-white/10 blur-2xl dark:border-teal-300/10 dark:bg-teal-300/10" />
          <div className="absolute bottom-8 right-8 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl dark:bg-amber-300/10" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/20 via-accent/10 to-transparent dark:from-black/30 dark:via-emerald-400/10" />

          <div className="relative z-10 flex w-full flex-col justify-between px-12 py-12 xl:px-20">
            <div>
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] gradient-primary shadow-glow">
                  <GraduationCap className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">
                    Learn AI suite
                  </p>
                  <span className="mt-1 block text-3xl font-black tracking-[-0.03em] text-primary-foreground">
                    AI Teachers
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200 backdrop-blur dark:border-teal-300/15 dark:bg-teal-300/10 dark:text-teal-100">
                <Sparkles className="h-4 w-4" />
                Premium learning platform
              </div>

              <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.05] tracking-[-0.05em] text-primary-foreground">
                Enter a sharper,
                <br />
                more cinematic
                <span className="text-cyan-300 dark:text-amber-200"> AI teaching space.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
                Create, manage, and experience AI-powered teaching workflows in a workspace designed to feel refined, fast, and seriously professional from the first screen.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {loginHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur dark:border-teal-300/10 dark:bg-white/5 dark:text-teal-50"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {platformSignals.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur-xl dark:border-teal-200/10 dark:bg-slate-950/20"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 dark:bg-teal-300/10">
                    <Icon className="h-5 w-5 text-cyan-300 dark:text-amber-200" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center p-4 sm:p-8 lg:p-10 xl:px-12">
          <ThemeToggle collapsed className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6" />
          <div className="w-full max-w-xl animate-fade-in xl:max-w-none">
            <div className="mb-8 xl:hidden">
              <div className="mx-auto flex max-w-sm items-center gap-4 rounded-[28px] border border-white/75 bg-white/75 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl dark:border-teal-200/10 dark:bg-[#0d1d2a]/88 dark:shadow-black/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] gradient-primary shadow-lg shadow-primary/25">
                  <GraduationCap className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">AI learning suite</p>
                  <p className="text-2xl font-black tracking-[-0.03em] text-slate-950 dark:text-slate-50">AI Teachers</p>
                </div>
              </div>
            </div>

            <Card variant="elevated" className="mx-auto w-full max-w-[44rem] overflow-hidden rounded-[32px] border-white/80 bg-white/85 shadow-2xl shadow-slate-200/70 dark:border-teal-200/10 dark:bg-[#0d1b2a]/88 dark:shadow-black/35">
              <CardHeader className="relative space-y-3 border-b border-white/70 pb-6 dark:border-teal-200/10">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 dark:from-teal-300/12 dark:via-transparent dark:to-amber-200/10" />
                <div className="relative mx-auto inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary dark:border-teal-300/15 dark:bg-teal-300/10 dark:text-teal-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Secure access portal
                </div>
                <CardTitle className="relative text-center text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                  Welcome back
                </CardTitle>
                <CardDescription className="relative mx-auto max-w-md text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Sign in to continue into your high-focus AI teaching workspace with sessions, analytics, and tutor tools ready to go.
                </CardDescription>
                <div className="relative mt-2 grid gap-3 sm:grid-cols-3">
                  {loginHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-center text-xs font-semibold text-slate-700 shadow-sm dark:border-teal-200/10 dark:bg-[#13263a]/82 dark:text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                <div className="mb-6 rounded-[24px] border border-slate-200/80 bg-white p-5 text-slate-900 dark:border-teal-200/10 dark:bg-[#13263a]/85 dark:text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-slate-500 dark:text-white/45">Access mode</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Professional tutor console</p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:border-teal-200/10 dark:bg-teal-300/10 dark:text-teal-50">
                      Protected
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/70">
                    Sign in to manage learning flows, open ongoing sessions, and continue from exactly where you left off.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-2xl border-slate-200/80 bg-white/80 px-4 text-slate-900 shadow-sm shadow-slate-200/40 placeholder:text-slate-400 dark:border-teal-200/10 dark:bg-[#13263a]/82 dark:text-slate-100 dark:placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Password
                      </Label>
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        Encrypted
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 rounded-2xl border-slate-200/80 bg-white/80 px-4 pr-12 text-slate-900 shadow-sm shadow-slate-200/40 placeholder:text-slate-400 dark:border-teal-200/10 dark:bg-[#13263a]/82 dark:text-slate-100 dark:placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-primary transition hover:bg-primary/10"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="h-12 w-full rounded-2xl text-base font-semibold shadow-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in to Dashboard"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {platformSignals.slice(0, 2).map(({ title, description, icon: Icon }) => (
                    <div
                      key={title}
                      className="rounded-[22px] border border-white/80 bg-white/75 p-4 shadow-sm dark:border-teal-200/10 dark:bg-[#13263a]/82"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Protected login for admin and student workspaces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
