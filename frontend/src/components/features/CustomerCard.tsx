import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types/customer";
import { CustomerTypeBadge } from "./CustomerTypeBadge";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Award } from "lucide-react";

interface CustomerCardProps {
  customer: Customer;
  className?: string;
}

export function CustomerCard({ customer, className }: CustomerCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{customer.name}</CardTitle>
            <p className="text-sm text-gray-500">#{customer.customerNumber}</p>
          </div>
          <div className="flex gap-2">
            <CustomerTypeBadge type={customer.type} />
            <Badge
              className={
                customer.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {customer.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{customer.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{customer.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>
            {customer.address.city}, {customer.address.state}
          </span>
        </div>
        {customer.loyaltyPoints > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{customer.loyaltyPoints} points</span>
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-3">
          <div>
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-lg font-semibold">{customer.totalOrders}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-lg font-semibold">${customer.totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
