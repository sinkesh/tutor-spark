import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AgentCard from '@/components/agents/AgentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIAgent, AgentType, AgentStatus } from '@/types';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Mock data
const mockAgents: AIAgent[] = [
  {
    id: '1',
    name: 'Advanced Mathematics',
    description: 'Covers calculus, algebra, and statistics for high school students. Includes step-by-step problem solving.',
    type: 'subject',
    status: 'active',
    educationLevel: 'High School',
    learningObjectives: ['Calculus', 'Algebra', 'Statistics'],
    assignedStudents: 342,
    accuracyScore: 97,
    totalConversations: 8420,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'English Literature',
    description: 'Comprehensive literature analysis and writing skills development for students.',
    type: 'course',
    status: 'active',
    educationLevel: 'High School',
    learningObjectives: ['Analysis', 'Writing'],
    assignedStudents: 289,
    accuracyScore: 95,
    totalConversations: 6230,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Physics 101',
    description: 'Introduction to physics concepts and problem-solving techniques.',
    type: 'class',
    status: 'active',
    educationLevel: 'College',
    learningObjectives: ['Mechanics', 'Thermodynamics'],
    assignedStudents: 198,
    accuracyScore: 93,
    totalConversations: 4120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Dr. Smith - Chemistry',
    description: 'Personal AI teaching assistant modeled after Dr. Smith\'s teaching style.',
    type: 'teacher',
    status: 'draft',
    educationLevel: 'College',
    learningObjectives: ['Organic Chemistry'],
    assignedStudents: 0,
    accuracyScore: 0,
    totalConversations: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'World History',
    description: 'Comprehensive world history from ancient civilizations to modern era.',
    type: 'subject',
    status: 'active',
    educationLevel: 'High School',
    learningObjectives: ['Ancient History', 'Modern History'],
    assignedStudents: 421,
    accuracyScore: 91,
    totalConversations: 5630,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Biology Basics',
    description: 'Foundational biology concepts including cell biology and genetics.',
    type: 'course',
    status: 'disabled',
    educationLevel: 'Middle School',
    learningObjectives: ['Cell Biology', 'Genetics'],
    assignedStudents: 0,
    accuracyScore: 88,
    totalConversations: 2340,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const typeFilters: { value: AgentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'class', label: 'Class' },
  { value: 'subject', label: 'Subject' },
  { value: 'course', label: 'Course' },
  { value: 'teacher', label: 'Teacher' },
];

const statusFilters: { value: AgentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'disabled', label: 'Disabled' },
];

export default function AgentsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
            <p className="text-muted-foreground mt-1">Manage your AI teaching agents</p>
          </div>
          <Link to="/admin/agents/create">
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card variant="default" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={typeFilter === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={statusFilter === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents Grid/List */}
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <Card variant="default" className="py-12">
            <CardContent className="text-center">
              <p className="text-muted-foreground">No agents found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
