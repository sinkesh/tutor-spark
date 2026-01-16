import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockAgent = {
  id: '1',
  name: 'Calculus Helper',
  description: 'Your AI tutor for mastering calculus concepts',
  type: 'subject',
};

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm your Calculus Helper. I'm here to help you understand derivatives, integrals, limits, and more. What would you like to learn about today?",
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const { agentId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Great question! Let me explain this concept step by step. The derivative of a function represents the rate of change at any given point. Think of it as the slope of the tangent line to the curve at that specific point.",
        "That's an excellent observation! In calculus, we use the limit definition to understand derivatives. The formal definition is: f'(x) = lim(h→0) [f(x+h) - f(x)] / h",
        "I see what you're asking about. Integration is essentially the reverse of differentiation. When we integrate a function, we're finding the area under the curve between two points.",
        "Let me help you with that problem! First, identify what type of function you're working with, then apply the appropriate differentiation or integration rules.",
      ];

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <StudentLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 p-4">
            <Link to="/student">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{mockAgent.name}</h1>
                <p className="text-xs text-muted-foreground">{mockAgent.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-slide-up",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/10 text-accent"
              )}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className={cn(
                "max-w-[70%] space-y-2",
                message.role === 'user' && "flex flex-col items-end"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl",
                  message.role === 'user' 
                    ? "chat-bubble-user"
                    : "chat-bubble-ai"
                )}>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    message.role === 'user' ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {message.content}
                  </p>
                </div>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 ml-2">
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="p-4 rounded-2xl chat-bubble-ai">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  placeholder="Ask me anything about calculus..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 py-6 text-base"
                  disabled={isLoading}
                />
                <Button
                  variant="gradient"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              <Sparkles className="w-3 h-3 inline mr-1" />
              AI responses are generated and may not always be accurate. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
