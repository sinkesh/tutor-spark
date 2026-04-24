import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Send,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Check,
  Copy,
  Speaker,
  X,
} from "lucide-react";
import { toast } from "sonner";
import MarkdownMessage from "@/components/MarkdownMessage";
import TopicsCard from "./TopicsCard";
import { useTTS } from "@/hooks/useTTS";
import { SpeakerIcon, StopIcon } from "@/components/icons/SpeakerIcon";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  placeholder?: string;
  disabled?: boolean;
  agentId?: string;
  agentName?: string;
  externalInputValue?: string; // New prop for external input control
  onExternalInputClear?: () => void; // Callback to clear external input
}

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  onFeedback,
  placeholder = "Type your message...",
  disabled = false,
  agentId,
  agentName,
  externalInputValue,
  onExternalInputClear,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playTTS, stopAudio, getMessagePlaybackState, currentPlaybackState, cleanup } = useTTS();

  // Update input value when external input is provided
  useEffect(() => {
    console.log('ChatWindow useEffect triggered:', { externalInputValue });
    if (externalInputValue !== undefined) {
      console.log('Setting input value to:', externalInputValue);
      setInputValue(externalInputValue);
      // Clear external input after applying it
      if (onExternalInputClear) {
        console.log('Calling onExternalInputClear');
        onExternalInputClear();
      }
    }
  }, [externalInputValue, onExternalInputClear]);

  // Extract and clean text content from different message types for TTS
  const extractTextForTTS = (message: ChatMessage): string => {
    let text = '';
    
    switch (message.message_type) {
      case 'notes':
        text = message.metadata?.notes?.notes || '';
        break;
      case 'study_plan':
        text = message.metadata?.study_plan?.study_plan || '';
        break;
      case 'quiz':
        const quiz = message.metadata?.quiz;
        if (!quiz) return '';
        
        text = quiz.message || '';
        if (quiz.feedback) text += '. ' + quiz.feedback;
        if (quiz.question) {
          text += `. Question ${quiz.question.question_number} of ${quiz.question.total_questions}: ${quiz.question.question}. `;
          text += quiz.question.options.map((option, idx) => `Option ${String.fromCharCode(65 + idx)}: ${option}`).join('. ');
        }
        if (quiz.final_score) text += `. Your final score is ${quiz.final_score}`;
        break;
      default:
        text = message.content || '';
        break;
    }
    
    // Clean up text for better TTS
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold text
      .replace(/\*(.*?)\*/g, '$1') // Italic text
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
      // Clean up extra whitespace and punctuation
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n+/g, '. ') // Multiple newlines to period
      .replace(/\s*\.\s*/g, '. ') // Clean up spacing around periods
      .replace(/\s*,\s*/g, ', ') // Clean up spacing around commas
      .replace(/\s*;\s*/g, '; ') // Clean up spacing around semicolons
      .replace(/\s*:\s*/g, ': ') // Clean up spacing around colons
      .replace(/\.+/g, '.') // Multiple periods to single period
      .trim();
  };

  // Debug: Log agent details
  useEffect(() => {
    console.log("ChatWindow - agentId:", agentId, "agentName:", agentName);
  }, [agentId, agentName]);

  // Debug: Log messages when they change
  useEffect(() => {
    console.log("ChatWindow received messages:", messages);
    console.log("Messages count:", messages.length);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const handleTTS = (message: ChatMessage) => {
    const text = extractTextForTTS(message);
    playTTS(text, message.id);
  };

  const handleStopTTS = () => {
    stopAudio();
  };

  const handleSend = () => {
    if (!inputValue.trim() || isLoading || disabled) return;
    
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedbackClick = (messageId: string, feedback: 'like' | 'dislike') => {
    onFeedback(messageId, feedback);
  };

  const renderMessageContent = (message: ChatMessage) => {
    // Handle different message types
    if (message.message_type === 'notes' && message.metadata?.notes) {
      return (
        <div className="mt-3">
          <div className="p-4 rounded-xl border bg-gradient-to-br from-yellow-50/60 to-orange-50/40 dark:from-yellow-900/20 dark:to-orange-900/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                📝
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">
                  Notes
                  {message.metadata.notes.topic && (
                    <span className="text-primary"> – {message.metadata.notes.topic}</span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">Quick revision points</p>
              </div>
            </div>
            <div className={cn(
              "prose prose-sm max-w-none",
              "prose-ul:list-disc prose-ul:pl-5",
              "prose-li:my-1.5",
              "prose-strong:text-primary prose-strong:font-semibold",
              "dark:prose-invert",
            )}>
              <MarkdownMessage content={message.metadata.notes.notes} />
            </div>
          </div>
        </div>
      );
    }

    if (message.message_type === 'study_plan' && message.metadata?.study_plan) {
      return (
        <div className="mt-3 space-y-3">
          <div className="p-4 rounded-xl border bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                ✨
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">
                  Study Plan
                  {message.metadata.study_plan.topic && (
                    <span className="text-primary"> – {message.metadata.study_plan.topic}</span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">Structured learning guide</p>
              </div>
            </div>
            {message.metadata.study_plan.subject && (
              <span className="inline-block mb-3 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                {message.metadata.study_plan.subject}
              </span>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownMessage content={message.metadata.study_plan.study_plan} />
            </div>
          </div>
        </div>
      );
    }

    if (message.message_type === 'quiz' && message.metadata?.quiz) {
      return (
        <div className="space-y-3 mt-2">
          {message.metadata.quiz.feedback && (
            <div className={cn(
              "p-2 rounded-lg text-sm font-medium",
              message.metadata.quiz.feedback.startsWith("✅")
                ? "bg-green-50 text-green-700 dark:bg-green-900/20"
                : "bg-red-50 text-red-700 dark:bg-red-900/20",
            )}>
              {message.metadata.quiz.feedback}
            </div>
          )}
          
          {message.metadata.quiz.message && (
            <p className="font-semibold text-primary">{message.metadata.quiz.message}</p>
          )}
          
          {message.metadata.quiz.question && (
            <div className="p-3 rounded-xl border bg-background">
              <p className="text-xs text-muted-foreground mb-1">
                Question {message.metadata.quiz.question.question_number} of {message.metadata.quiz.question.total_questions}
              </p>
              <p className="font-semibold mb-3">{message.metadata.quiz.question.question}</p>
              <div className="space-y-2">
                {message.metadata.quiz.question.options.map((option, idx) => {
                  const label = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={idx}
                      className="w-full text-left p-2 rounded-lg border hover:bg-muted transition flex gap-2"
                      onClick={() => onSendMessage(label)}
                    >
                      <span className="font-semibold">{label}.</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {message.metadata.quiz.final_score && (
            <div className="p-4 rounded-xl border bg-primary/5 text-center">
              <p className="text-lg font-bold">🎉 Quiz Completed!</p>
              <p className="text-sm text-muted-foreground mt-1">Your Score</p>
              <p className="text-2xl font-extrabold text-primary mt-2">
                {message.metadata.quiz.final_score}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Default text message
    if (message.content) {
      return <MarkdownMessage content={message.content} />;
    }

    return null;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Messages */}
      <div className="dashboard-content-padding min-h-0 flex-1 space-y-6 overflow-y-auto">
        {/* Show TopicsCard when there's an active session */}
        {agentId && agentName && (
          <div className="mb-6">
            <TopicsCard agentId={agentId} agentName={agentName} />
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" && "flex-row-reverse",
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg shadow-sm ring-1",
                message.role === "user"
                  ? "bg-primary text-primary-foreground ring-primary/20"
                  : "bg-white text-accent ring-accent/15",
              )}
            >
              {message.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div className="max-w-[86%] space-y-1 sm:max-w-[74%]">
              <div
                className={cn(
                  "relative rounded-lg p-4 text-sm shadow-lg",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground shadow-primary/20"
                    : "border border-white/70 bg-white/90 shadow-slate-200/70 backdrop-blur-xl",
                )}
              >
                <div className="rounded-2xl text-sm">
                  {renderMessageContent(message)}
                </div>

                {message.role === "assistant" && (
                  <div className="flex gap-1 mt-1 group/feedback pt-2 justify-between">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const textToCopy =
                            message.content ||
                            message.metadata?.notes?.notes ||
                            message.metadata?.study_plan?.study_plan ||
                            "";
                          handleCopy(textToCopy, message.id);
                        }}
                        className={cn(
                          "p-1.5 rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-muted",
                          copiedId === message.id && "text-green-600",
                        )}
                        title="Copy to clipboard"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedbackClick(message.id, "like");
                        }}
                        className={cn(
                          "p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors",
                          message.feedback === "like" &&
                            "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
                          "opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none",
                        )}
                        aria-label="Like response"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedbackClick(message.id, "dislike");
                        }}
                        className={cn(
                          "p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                          message.feedback === "dislike" &&
                            "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
                          "opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none",
                        )}
                        aria-label="Dislike response"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* TTS Speaker and Stop Buttons in Bottom-Right Corner */}
                    {(() => {
                      const ttsState = getMessagePlaybackState(message.id);
                      const hasTextContent = extractTextForTTS(message).trim().length > 0;
                      
                      if (!hasTextContent) return null;
                      
                      return (
                        <div className="flex gap-1">
                          {/* Speaker Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (ttsState === 'playing') {
                                handleStopTTS();
                              } else {
                                handleTTS(message);
                              }
                            }}
                            className={cn(
                              "p-1.5 rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-muted",
                              ttsState === 'playing' && "text-blue-600 animate-pulse",
                              ttsState === 'loading' && "text-gray-500",
                            )}
                            title={
                              ttsState === 'playing' 
                                ? `Playing chunk ${currentPlaybackState.currentChunk}/${currentPlaybackState.totalChunks} - Stop speaking` 
                                : ttsState === 'loading'
                                ? 'Generating speech...'
                                : 'Speak response'
                            }
                          >
                            {ttsState === 'loading' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <SpeakerIcon size={14} />
                            )}
                          </button>
                          
                          {/* Dedicated Stop Button - Only show when playing */}
                          {ttsState === 'playing' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStopTTS();
                              }}
                              className="p-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 opacity-70 hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              title={`Stop speaking (Chunk ${currentPlaybackState.currentChunk}/${currentPlaybackState.totalChunks})`}
                            >
                              <StopIcon size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-accent shadow-sm ring-1 ring-accent/15">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/70 bg-white/90 p-4 shadow-lg shadow-slate-200/70 backdrop-blur-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/70 bg-white/75 p-3 shadow-[0_-12px_35px_-28px_rgba(15,23,42,.8)] backdrop-blur-xl sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 rounded-lg border border-white/70 bg-white/85 p-2 shadow-lg shadow-slate-200/70">
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading || disabled}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              variant="gradient"
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading || disabled}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            ✨ AI responses may not always be accurate.
          </p>
        </div>
      </div>
    </div>
  );
}
