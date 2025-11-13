import { Badge } from "@/components/ui/badge";
import { StockStatus } from "@/types/inventory";

interface StockStatusBadgeProps {
  status: StockStatus;
  className?: string;
}

export function StockStatusBadge({ status, className }: StockStatusBadgeProps) {
  const statusConfig = {
    HIGH_STOCK: {
      label: "High Stock",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    NORMAL: {
      label: "Normal",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    LOW_STOCK: {
      label: "Low Stock",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    OUT_OF_STOCK: {
      label: "Out of Stock",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`${config.className} ${className || ""}`}>
      {config.label}
    </Badge>
  );
}

// Helper function to determine stock status
export function getStockStatus(
  quantity: number,
  reorderPoint?: number
): StockStatus {
  if (quantity === 0) {
    return "OUT_OF_STOCK";
  }
  if (reorderPoint && quantity <= reorderPoint) {
    return "LOW_STOCK";
  }
  if (reorderPoint && quantity > reorderPoint * 3) {
    return "HIGH_STOCK";
  }
  return "NORMAL";
}
