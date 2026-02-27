import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  History,
  Search,
  MessageSquare,
  Bot,
  Calendar,
  ChevronRight,
  Clock,
  Filter,
} from 'lucide-react';
import { getRecentActivityStudent } from '@/config/services';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationHistory {
  id: string;
  agentId: string;
  agentName: string;
  agentType: 'class' | 'subject' | 'course' | 'teacher';
  preview: string;
  messageCount: number;
  lastMessage: string;
  createdAt: string;
}

const mockHistory: ConversationHistory[] = [
  {
    id: '1',
    agentId: '1',
    agentName: 'Advanced Mathematics Tutor',
    agentType: 'subject',
    preview: 'Can you explain the chain rule in calculus?',
    messageCount: 12,
    lastMessage: '2 hours ago',
    createdAt: '2024-01-20',
  },
  {
    id: '2',
    agentId: '2',
    agentName: 'Physics Teacher',
    agentType: 'subject',
    preview: 'What is the difference between velocity and acceleration?',
    messageCount: 8,
    lastMessage: '1 day ago',
    createdAt: '2024-01-19',
  },
  {
    id: '3',
    agentId: '3',
    agentName: 'English Literature Guide',
    agentType: 'course',
    preview: 'Help me analyze the themes in Hamlet',
    messageCount: 15,
    lastMessage: '2 days ago',
    createdAt: '2024-01-18',
  },
  {
    id: '4',
    agentId: '1',
    agentName: 'Advanced Mathematics Tutor',
    agentType: 'subject',
    preview: 'How do I solve quadratic equations?',
    messageCount: 6,
    lastMessage: '3 days ago',
    createdAt: '2024-01-17',
  },
  {
    id: '5',
    agentId: '4',
    agentName: 'Biology Tutor',
    agentType: 'subject',
    preview: 'Explain the process of photosynthesis',
    messageCount: 10,
    lastMessage: '1 week ago',
    createdAt: '2024-01-13',
  },
];

const groupByDate = (conversations: ConversationHistory[]) => {
  const groups: { [key: string]: ConversationHistory[] } = {};
  
  conversations.forEach((conv) => {
    const date = new Date(conv.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (date > lastWeek) {
      groupKey = 'This Week';
    } else {
      groupKey = 'Earlier';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(conv);
  });

  return groups;
};

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [recentActivity, setRecentActivity] = useState(null);
    const { user } = useAuth();

  const filteredHistory = mockHistory.filter((conv) => {
    const matchesSearch =
      conv.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || conv.agentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const groupedHistory = groupByDate(filteredHistory);

  useEffect(()=> {
    fetchRecentActivity();
  }, []);

    const fetchRecentActivity = async () => {
      try {
        setIsLoading(true);
  
        const res = await getRecentActivityStudent(user?.id);
        setRecentActivity(res);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <History className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Conversation History</h1>
              <p className="text-muted-foreground">Review and continue past learning sessions</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentActivity?.total_count}</p>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentActivity?.agents_used_count}</p>
                <p className="text-sm text-muted-foreground">AI Teachers Used</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4 opacity-70 pointer-events-none">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">51</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="class">Class</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conversation List */}
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([dateGroup, conversations]) => (
            <div key={dateGroup}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {dateGroup}
              </h3>
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <Link key={conv.id} to={`/student/chat/${conv.agentId}`}>
                    <Card className="hover:border-accent transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                              <Bot className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{conv.agentName}</h4>
                                <Badge variant="secondary" className="capitalize text-xs">
                                  {conv.agentType}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {conv.preview}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {conv.messageCount} messages
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {conv.lastMessage}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedHistory).length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No conversations found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'Start chatting with an AI teacher to see your history here'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
