import { Card } from '@/components/ui/card';
import { ActivityItem } from '@/types/mining';
import { formatRelativeTime } from '@/lib/utils/formatters';

interface ActivityLogProps {
  activities: ActivityItem[] | null;
  isLoading: boolean;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading activity data...</p>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-4 flex items-center justify-center">
        <p className="text-muted-foreground">No activity found.</p>
      </Card>
    );
  }

  // Render icon based on activity type
  const renderIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return (
          <div className="h-6 w-6 rounded-full bg-[#A371F7]/10 flex items-center justify-center text-[#A371F7] mt-0.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
      case 'worker_online':
        return (
          <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-accent mt-0.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
        );
      case 'worker_offline':
        return (
          <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mt-0.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
        );
      case 'ai_update':
        return (
          <div className="h-6 w-6 rounded-full bg-[#A371F7]/10 flex items-center justify-center text-[#A371F7] mt-0.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground mt-0.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.slice(0, 4).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-[#30363D]/50">
            {renderIcon(activity.type)}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {activity.type === 'payment' ? 'Payment Received' :
                   activity.type === 'worker_online' ? 'Worker Back Online' :
                   activity.type === 'worker_offline' ? 'Worker Offline' :
                   activity.type === 'ai_update' ? 'AI Advisor Update' : 'System Event'}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground border border-[#30363D] hover:border-[#6E7681] py-1.5 rounded-sm">
        View All Activity
      </button>
    </Card>
  );
};

export default ActivityLog;
