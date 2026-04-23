import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  isLoading?: boolean;
}

export default function KPICard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = 'bg-primary/10 text-primary',
  isLoading = false
}: KPICardProps) {
  return (
    <Card variant="elevated" className="dashboard-kpi animate-fade-in border-0">
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
           {isLoading ? <div className="h-8 w-20 rounded bg-muted animate-pulse"></div> : <p className="text-3xl font-bold tracking-[-0.03em] text-foreground">{value}</p> }
            {change && (
              <p className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                changeType === 'positive' && "text-success",
                changeType === 'negative' && "text-destructive",
                changeType === 'neutral' && "text-muted-foreground",
                changeType === 'positive' && "bg-success/10",
                changeType === 'negative' && "bg-destructive/10",
                changeType === 'neutral' && "bg-muted"
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("dashboard-orb h-14 w-14 rounded-[20px] flex items-center justify-center ring-1 ring-white/50", iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
