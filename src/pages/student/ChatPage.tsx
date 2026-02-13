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
import { studentQueryChat, studentFeedback } from "@/config/services";
import { toast } from "sonner";
import MarkdownMessage from "@/components/MarkdownMessage";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  feedback?: 'like' | 'dislike' | null;
  conversation_id?: string;
}

export default function ChatPage() {
  const { subjectName } = useParams<{ subjectName: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* -------------------- Handle Feedback -------------------- */
  const handleFeedback = async (feedbackType: 'like' | 'dislike', conversationId?: string) => {
    if (!conversationId) {
      console.error('No conversation ID available for feedback');
      return;
    }

    try {
      // Optimistically update the UI
      setMessages(prev => prev.map(msg => 
        msg.conversation_id === conversationId 
          ? { ...msg, feedback: feedbackType }
          : msg
      ));

      // Send the feedback to the server
      await studentFeedback({
        conversation_id: conversationId,
        feedback: feedbackType
      });
      
      toast.success(`Feedback submitted`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Revert the UI on error
      setMessages(prev => prev.map(msg => 
        msg.conversation_id === conversationId 
          ? { ...msg, feedback: undefined }
          : msg
      ));
      toast.error('Failed to submit feedback');
    }
  };

  // Helper function to render feedback buttons
  const renderFeedbackButtons = (message: ChatMessage) => {
    if (message.role !== 'assistant') return null;
    
    return (
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFeedback('like', message.conversation_id);
          }}
          className={cn(
            "p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors",
            message.feedback === 'like' && 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          )}
          aria-label="Like response"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFeedback('dislike', message.conversation_id);
          }}
          className={cn(
            "p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
            message.feedback === 'dislike' && 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
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

  const { user } = useAuth();
  
  /* -------------------- Send Message -------------------- */
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const payload = {
        student_id: user.id,
        subject,
        class_name: user.class,
        query: userMessage.content,
      };

      const res = await studentQueryChat(payload);

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res?.response || "Sorry, I couldn't understand that.",
        timestamp: new Date(),
        conversation_id: res?.conversation_id,
        feedback: null
      };

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
                  <MarkdownMessage content={message.content} />
                </div>

                {message.role === "assistant" && (
                  <div className="flex gap-1 mt-1 group/feedback">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback('like', message.conversation_id);
                      }}
                      className={cn(
                        "p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors",
                        message.feedback === 'like' && 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                        "opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none"
                      )}
                      aria-label="Like response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback('dislike', message.conversation_id);
                      }}
                      className={cn(
                        "p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                        message.feedback === 'dislike' && 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
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
                onClick={handleSend}
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
