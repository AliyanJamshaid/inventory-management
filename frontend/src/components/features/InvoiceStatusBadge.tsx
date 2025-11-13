import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/types/invoice";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const variants: Record<InvoiceStatus, { label: string; className: string }> = {
    draft: {
      label: "Draft",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    },
    sent: {
      label: "Sent",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    paid: {
      label: "Paid",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    partial: {
      label: "Partial",
      className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    },
    overdue: {
      label: "Overdue",
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-600 hover:bg-gray-200",
    },
  };

  const config = variants[status];

  return (
    <Badge className={`${config.className} ${className || ""}`}>
      {config.label}
    </Badge>
  );
}
