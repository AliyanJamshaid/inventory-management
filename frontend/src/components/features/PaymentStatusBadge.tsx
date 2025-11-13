import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/salesOrder";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const variants: Record<PaymentStatus, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    partial: {
      label: "Partial",
      className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    },
    paid: {
      label: "Paid",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
  };

  const config = variants[status];

  return (
    <Badge className={`${config.className} ${className || ""}`}>
      {config.label}
    </Badge>
  );
}
