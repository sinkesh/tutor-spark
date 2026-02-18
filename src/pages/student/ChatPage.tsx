/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import StudentLayout from "@/components/layout/StudentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  studentQueryChat,
  studentFeedback,
  getStudentChatHis,
} from "@/config/services";
import { toast } from "sonner";
import MarkdownMessage from "@/components/MarkdownMessage";

interface NotesData {
  topic?: string;
  notes: string;
}

interface StudyPlanData {
  study_plan: string;
  subject?: string;
  topic?: string;
}

interface QuizQuestion {
  question_number: number;
  total_questions: number;
  question: string;
  options: string[];
}

interface QuizData {
  message?: string;
  feedback?: string;
  question?: QuizQuestion;
  final_score?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: string;
  notes?: NotesData;
  studyPlan?: StudyPlanData;
  quiz?: QuizData;
  timestamp: Date;
  feedback?: "like" | "dislike" | null;
  conversation_id?: string;
}

export default function ChatPage() {
  const { subjectName } = useParams<{ subjectName: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  const extractStudyPlanTopic = (text: string): string | undefined => {
    const clean = text.replace(/[*_#]/g, "");

    const match =
      clean.match(/Main Topic:\s*(.*)/i) || clean.match(/Plan for\s*(.*)/i);

    return match ? match[1].trim() : undefined;
  };

  const extractNotesTopic = (text: string): string | undefined => {
    const match =
      text.match(/Notes\s*[:–-]\s*(.*)/i) ||
      text.match(/Topic\s*[:–-]\s*(.*)/i);

    return match ? match[1].trim() : undefined;
  };

  const normalizeHistoryToMessages = (history: any[]): ChatMessage[] => {
    const msgs: ChatMessage[] = [];

    history.forEach((item) => {
      // USER MESSAGE
      msgs.push({
        id: crypto.randomUUID(),
        role: "user",
        content: item.query,
        timestamp: new Date(),
      });

      // ASSISTANT MESSAGE
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        timestamp: new Date(),
        feedback: null,
        conversation_id: item.conversation_id,
      };

      const response = item.response;
      const queryLower = item.query.toLowerCase();

      if (typeof response === "string") {
        const lower = response.toLowerCase();

        /* ---------- QUIZ ANSWER FEEDBACK ---------- */
        if (
          response.includes("Your answer:") &&
          (response.includes("✅") || response.includes("❌"))
        ) {
          assistantMsg.quiz = {
            feedback: response,
          };
        } else if (lower.includes("started quiz")) {
          /* ---------- QUIZ START ---------- */
          assistantMsg.quiz = {
            message: response,
          };
        } else if (
          queryLower.includes("notes") ||
          queryLower.includes("make notes") ||
          queryLower.includes("create notes") ||
          queryLower.includes("prepare notes")
        ) {
          assistantMsg.notes = {
            topic: extractNotesTopic(response),
            notes: response,
          };
        } else if (
          lower.includes("main topic:") ||
          lower.includes("plan for") ||
          lower.includes("study plan")
        ) {
          assistantMsg.studyPlan = {
            study_plan: response,
            subject: subjectName
              ? decodeURIComponent(subjectName)
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase())
              : undefined,
            topic: extractStudyPlanTopic(response),
          };
        } else {
          /* ---------- NORMAL TEXT ---------- */
          assistantMsg.content = response;
        }
      }

      msgs.push(assistantMsg);
    });

    return msgs;
  };

  useEffect(() => {
    fetchChatHis();
  }, []);

  const fetchChatHis = async () => {
    try {
      const res = await getStudentChatHis(user.id, subjectName);

      if (!Array.isArray(res)) return;

      const formattedMessages = normalizeHistoryToMessages([...res].reverse());

      setMessages(formattedMessages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chat history");
    }
  };

  /* -------------------- Handle Feedback -------------------- */
  const handleFeedback = async (
    feedbackType: "like" | "dislike",
    conversationId?: string
  ) => {
    if (!conversationId) {
      console.error("No conversation ID available for feedback");
      return;
    }

    try {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversation_id === conversationId
            ? { ...msg, feedback: feedbackType }
            : msg
        )
      );

      await studentFeedback({
        conversation_id: conversationId,
        feedback: feedbackType,
      });

      toast.success(`Feedback submitted`);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversation_id === conversationId
            ? { ...msg, feedback: undefined }
            : msg
        )
      );
      toast.error("Failed to submit feedback");
    }
  };

  // Helper function to render feedback buttons
  const renderFeedbackButtons = (message: ChatMessage) => {
    if (message.role !== "assistant") return null;

    return (
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFeedback("like", message.conversation_id);
          }}
          className={cn(
            "p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors",
            message.feedback === "like" &&
              "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          )}
          aria-label="Like response"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFeedback("dislike", message.conversation_id);
          }}
          className={cn(
            "p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
            message.feedback === "dislike" &&
              "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          )}
          aria-label="Dislike response"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const subject = subjectName
    ? decodeURIComponent(subjectName)
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  /* -------------------- Scroll Handling -------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* -------------------- Send Message -------------------- */
  const handleSend = async (overrideValue?: string) => {
    // Use the overrideValue (the A,B,C,D label) if provided, otherwise use inputValue
    const valueToSend = overrideValue || inputValue;

    if (!valueToSend.trim() || isLoading) return;
    if (!user?.id) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: valueToSend.trim(), // This will now be "A", "B", etc.
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue(""); // Clear input
    setIsLoading(true);

    try {
      const payload = {
        student_id: user.id,
        subject,
        class_name: user.class,
        query: userMessage.content, // Sends "A", "B", "C", or "D"
      };

      const res = await studentQueryChat(payload);

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        timestamp: new Date(),
        conversation_id: res?.conversation_id,
        feedback: null,
      };

      const response = res?.response;

      if (response && typeof response === "object" && response.notes) {
        aiMessage.notes = {
          topic: response.topic,
          notes: response.notes,
        };
      }

      if (response && typeof response === "object" && response.study_plan) {
        aiMessage.studyPlan = {
          study_plan: response.study_plan,
          subject: response.subject,
          topic: response.topic,
        };
      }

      if (response && typeof response === "object") {
        if (
          response.message &&
          typeof response.message === "string" &&
          response.message.includes("Quiz Complete")
        ) {
          const scoreMatch = response.message.match(/Final Score:\s*(.*)/);

          aiMessage.quiz = {
            feedback: response.message.includes("✅")
              ? "✅ Question 5: Correct"
              : `"❌ Question 5:" ${response.message}`,
            final_score: scoreMatch ? scoreMatch[1] : undefined,
          };
        } else if (
          response.question ||
          response.feedback ||
          response.final_score ||
          response.message
        ) {
          aiMessage.quiz = response;
        }
      } else if (typeof response === "string") {
        aiMessage.content = response;
      } else {
        aiMessage.content = "Something went wrong. Please try again.";
      }

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response from AI");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- Enter Key -------------------- */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <StudentLayout>
      <div className="flex flex-col h-screen">
        {/* ---------------- Header ---------------- */}
        <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-4 p-4">
            <Link to="/student">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold capitalize">{subject} Agent</h1>
                <p className="text-xs text-muted-foreground">
                  Your AI tutor for mastering {subject} concepts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Messages ---------------- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/10 text-accent"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div className="max-w-[70%] space-y-1">
                <div
                  className={cn(
                    "p-4 rounded-2xl text-sm",
                    message.role === "user"
                      ? "chat-bubble-user text-primary-foreground"
                      : "chat-bubble-ai"
                  )}
                >
                  <div className="rounded-2xl text-sm">
                    {/* ---------- TEXT ---------- */}
                    {message.content && (
                      <MarkdownMessage content={message.content} />
                    )}

                    {/* ---------- QUIZ ---------- */}
                    {message.quiz && (
                      <div className="space-y-3 mt-2">
                        {message.quiz.feedback && (
                          <div
                            className={cn(
                              "p-2 rounded-lg text-sm font-medium",
                              message.quiz.feedback.startsWith("✅")
                                ? "bg-green-50 text-green-700 dark:bg-green-900/20"
                                : "bg-red-50 text-red-700 dark:bg-red-900/20"
                            )}
                          >
                            {message.quiz.question?.question_number
                              ? `Question ${
                                  message.quiz.question.question_number - 1
                                }: `
                              : ""}
                            {message.quiz.feedback}
                          </div>
                        )}

                        {/* Quiz message (start / complete) */}
                        {message.quiz.message && (
                          <p className="font-semibold text-primary">
                            {message.quiz.message}
                          </p>
                        )}

                        {message.quiz.question && (
                          <div className="p-3 rounded-xl border bg-background">
                            <p className="text-xs text-muted-foreground mb-1">
                              Question {message.quiz.question.question_number}{" "}
                              of {message.quiz.question.total_questions}
                            </p>

                            <p className="font-semibold mb-3">
                              {message.quiz.question.question}
                            </p>

                            <div className="space-y-2">
                              {message.quiz.question.options.map(
                                (option, idx) => {
                                  const label = String.fromCharCode(65 + idx);

                                  return (
                                    <button
                                      key={idx}
                                      className="w-full text-left p-2 rounded-lg border hover:bg-muted transition flex gap-2"
                                      onClick={() => {
                                        // Change from setInputValue(option) to setInputValue(label)
                                        setInputValue(label);

                                        // We use a small trick here: since setInputValue is async,
                                        // we should pass the label directly to handleSend if possible,
                                        // or trigger the effect.
                                        // Best approach: modify handleSend to accept an optional override string.
                                        handleSend(label);
                                      }}
                                      // onClick={() => {
                                      //   setInputValue(option);
                                      //   handleSend();
                                      // }}
                                    >
                                      <span className="font-semibold">
                                        {label}.
                                      </span>
                                      <span>{option}</span>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}

                        {message.quiz.final_score && (
                          <div className="p-4 rounded-xl border bg-primary/5 text-center">
                            <p className="text-lg font-bold">
                              🎉 Quiz Completed!
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your Score
                            </p>
                            <p className="text-2xl font-extrabold text-primary mt-2">
                              {message.quiz.final_score}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ---------- STUDY PLAN ---------- */}
                    {message.studyPlan && (
                      <div className="mt-3 space-y-3">
                        <div className="p-4 rounded-xl border bg-gradient-to-br from-primary/5 to-accent/5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg leading-tight">
                                Study Plan
                                {message.studyPlan.topic && (
                                  <span className="text-primary">
                                    {" "}
                                    – {message.studyPlan.topic}
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Structured learning guide
                              </p>
                            </div>
                          </div>

                          {message.studyPlan.subject && (
                            <span className="inline-block mb-3 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                              {message.studyPlan.subject}
                            </span>
                          )}

                          {/* Content */}
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <MarkdownMessage
                              content={message.studyPlan.study_plan}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ---------- NOTES ---------- */}
                  {message.notes && (
                    <div className="mt-3">
                      <div className="p-4 rounded-xl border bg-gradient-to-br from-yellow-50/60 to-orange-50/40 dark:from-yellow-900/20 dark:to-orange-900/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                            📝
                          </div>

                          <div>
                            <h3 className="font-semibold text-lg leading-tight">
                              Notes
                              {message.notes.topic && (
                                <span className="text-primary">
                                  {" "}
                                  – {message.notes.topic}
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Quick revision points
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "prose prose-sm max-w-none",
                            "prose-ul:list-disc prose-ul:pl-5",
                            "prose-li:my-1.5",
                            "prose-strong:text-primary prose-strong:font-semibold",
                            "dark:prose-invert"
                          )}
                        >
                          <MarkdownMessage content={message.notes.notes} />
                        </div>
                      </div>
                    </div>
                  )}

                  {message.role === "assistant" && (
                    <div className="flex gap-1 mt-1 group/feedback pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback("like", message.conversation_id);
                        }}
                        className={cn(
                          "p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors",
                          message.feedback === "like" &&
                            "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
                          "opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none"
                        )}
                        aria-label="Like response"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback("dislike", message.conversation_id);
                        }}
                        className={cn(
                          "p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                          message.feedback === "dislike" &&
                            "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
                          "opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none"
                        )}
                        aria-label="Dislike response"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* ---------------- Loading Bubble ---------------- */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="p-4 rounded-2xl chat-bubble-ai flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ---------------- Input ---------------- */}
        <div className="border-t border-border bg-card/50 backdrop-blur p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                placeholder={`Ask anything about ${subject}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />

              <Button
                variant="gradient"
                size="icon"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              <Sparkles className="inline w-3 h-3 mr-1" />
              AI responses may not always be accurate.
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
