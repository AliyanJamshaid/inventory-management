/**
 * Recent Activity Component
 * Displays recent activity feed
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

interface RecentActivityProps {
  data: Array<{
    _id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    } | null;
    action: string;
    resource: string;
    resourceId?: string;
    details: any;
    timestamp: string;
  }>;
  title?: string;
  description?: string;
}

const getActivityIcon = (action: string) => {
  const icons: Record<string, string> = {
    create: '✨',
    update: '✏️',
    delete: '🗑️',
    login: '🔐',
    logout: '👋',
    purchase: '🛒',
    sale: '💰',
    transfer: '🔄',
  };
  return icons[action] || '📝';
};

const getActivityColor = (action: string) => {
  const colors: Record<string, string> = {
    create: 'text-green-600',
    update: 'text-blue-600',
    delete: 'text-red-600',
    login: 'text-purple-600',
    sale: 'text-green-600',
  };
  return colors[action] || 'text-gray-600';
};

export default function RecentActivity({
  data,
  title = 'Recent Activity',
  description = 'Latest actions in the system',
}: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-3 border-b pb-3 last:border-0"
              >
                <div className="text-2xl mt-1">{getActivityIcon(activity.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    <span className={getActivityColor(activity.action)}>
                      {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                    </span>{' '}
                    {activity.resource}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user
                      ? `${activity.user.firstName} ${activity.user.lastName}`
                      : 'System'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No recent activity
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
