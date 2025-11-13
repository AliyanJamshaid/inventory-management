import { Badge } from "@/components/ui/badge";
import { CustomerType } from "@/types/customer";

interface CustomerTypeBadgeProps {
  type: CustomerType;
  className?: string;
}

export function CustomerTypeBadge({ type, className }: CustomerTypeBadgeProps) {
  const variants: Record<CustomerType, { label: string; className: string }> = {
    B2B: {
      label: "B2B",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    B2C: {
      label: "B2C",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
  };

  const config = variants[type];

  return (
    <Badge className={`${config.className} ${className || ""}`}>
      {config.label}
    </Badge>
  );
}
