import { Badge } from "@/components/ui/badge";
import { SOStatus } from "@/types/salesOrder";

interface SOStatusBadgeProps {
  status: SOStatus;
  className?: string;
}

export function SOStatusBadge({ status, className }: SOStatusBadgeProps) {
  const variants: Record<SOStatus, { label: string; variant: string; className: string }> = {
    draft: {
      label: "Draft",
      variant: "secondary",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    },
    confirmed: {
      label: "Confirmed",
      variant: "default",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    processing: {
      label: "Processing",
      variant: "default",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    shipped: {
      label: "Shipped",
      variant: "default",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    },
    delivered: {
      label: "Delivered",
      variant: "default",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    cancelled: {
      label: "Cancelled",
      variant: "destructive",
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
  };

  const config = variants[status];

  return (
    <Badge className={`${config.className} ${className || ""}`}>
      {config.label}
    </Badge>
  );
}
