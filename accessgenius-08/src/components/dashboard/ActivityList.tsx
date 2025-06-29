import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  time: string;
/* user?: {
    name: string;
    avatar?: string;
    initials: string;
  };*/  
  status?: 'completed' | 'pending';// | 'failed' | 'warning';
 // type: 'assessment' | 'user' | 'system' | 'alert';
  description?: string;
}

interface ActivityListProps {
  className?: string;
  activities: Activity[];
  title?: string;
  description?: string;
}

const ActivityList: React.FC<ActivityListProps> = ({
  className,
  activities,
  title = "Recent Activity",
  description = "Latest activities across the platform"
}) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={cn(
                "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors",
                index < activities.length - 1 && "border-b"
              )}
            >
             {/* {activity.user && (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
              )}*/}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.status && getStatusIcon(activity.status)}
                    <time className="text-xs text-muted-foreground">{activity.time}</time>
                  </div>
                </div>
                {activity.description && (
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityList;
