/**
 * Dynamic Status Badge Component
 * Displays status badge based on workflow configuration
 */

'use client';

import React from 'react';
import { useActiveWorkflow } from '@/hooks/useWorkflows';
import { WorkflowEntityType } from '@/types/workflow';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicStatusBadgeProps {
  entityType: WorkflowEntityType;
  status: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline';
}

export function DynamicStatusBadge({
  entityType,
  status,
  className,
  showIcon = true,
  variant = 'default',
}: DynamicStatusBadgeProps) {
  const { data: workflow, isLoading } = useActiveWorkflow(entityType);

  if (isLoading) {
    return (
      <Badge variant="outline" className={cn('animate-pulse', className)}>
        Loading...
      </Badge>
    );
  }

  if (!workflow) {
    // Fallback to basic badge
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  const statusConfig = workflow.statuses.find((s) => s.key === status);

  if (!statusConfig) {
    // Status not found in workflow
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  // Get icon component
  const IconComponent = statusConfig.icon
    ? (Icons as any)[statusConfig.icon]
    : null;

  // Convert hex color to CSS variable or use directly
  const badgeStyle = {
    backgroundColor: variant === 'default' ? `${statusConfig.color}20` : 'transparent',
    borderColor: statusConfig.color,
    color: statusConfig.color,
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        className
      )}
      style={badgeStyle}
    >
      {showIcon && IconComponent && (
        <IconComponent className="h-3.5 w-3.5" />
      )}
      <span>{statusConfig.label}</span>
    </Badge>
  );
}

export default DynamicStatusBadge;
