"use client";

import { Badge } from "@/components/ui/badge";
import { POStatus } from "@/types/purchaseOrder";
import { cn } from "@/lib/utils";

interface POStatusBadgeProps {
  status: POStatus;
  className?: string;
}

const statusConfig: Record<
  POStatus,
  {
    label: string;
    className: string;
  }
> = {
  [POStatus.DRAFT]: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  [POStatus.PENDING]: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  [POStatus.APPROVED]: {
    label: "Approved",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  [POStatus.RECEIVED]: {
    label: "Received",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  [POStatus.CANCELLED]: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

export function POStatusBadge({ status, className }: POStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={cn(config.className, className)} variant="secondary">
      {config.label}
    </Badge>
  );
}
