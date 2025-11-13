/**
 * Status History Timeline Component
 * Visual timeline showing status changes
 */

'use client';

import React from 'react';
import { useStatusHistory, formatDuration, getRelativeTime } from '@/hooks/useStatusHistory';
import { WorkflowEntityType } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, User, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusHistoryTimelineProps {
  entityType: WorkflowEntityType;
  entityId: string;
  className?: string;
  maxItems?: number;
}

export function StatusHistoryTimeline({
  entityType,
  entityId,
  className,
  maxItems,
}: StatusHistoryTimelineProps) {
  const { data: history, isLoading } = useStatusHistory(entityType, entityId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No status changes yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayHistory = maxItems ? history.slice(0, maxItems) : history;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Status History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

          {displayHistory.map((entry, index) => (
            <div key={entry._id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary">
                <div className="h-3 w-3 rounded-full bg-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    {/* Status change */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.fromStatus && (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {entry.fromStatus}
                          </Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </>
                      )}
                      <Badge variant="default" className="text-xs">
                        {entry.toStatus}
                      </Badge>
                      {entry.duration && (
                        <span className="text-xs text-muted-foreground">
                          ({formatDuration(entry.duration)})
                        </span>
                      )}
                    </div>

                    {/* User and time */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={entry.changedBy.avatar} />
                          <AvatarFallback className="text-xs">
                            {entry.changedBy.firstName[0]}
                            {entry.changedBy.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {entry.changedBy.firstName} {entry.changedBy.lastName}
                        </span>
                      </div>
                      <span>•</span>
                      <span>{getRelativeTime(entry.changedAt)}</span>
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="flex-1 text-muted-foreground">{entry.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {maxItems && history.length > maxItems && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {maxItems} of {history.length} status changes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatusHistoryTimeline;
