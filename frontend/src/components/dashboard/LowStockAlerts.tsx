/**
 * Low Stock Alerts Component
 * Displays alerts for products with low stock
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LowStockAlertsProps {
  data: Array<{
    productName: string;
    sku: string;
    warehouse: string;
    currentQuantity: number;
    reorderPoint: number;
    status: 'OUT_OF_STOCK' | 'LOW_STOCK';
  }>;
  title?: string;
  description?: string;
}

export default function LowStockAlerts({
  data,
  title = 'Low Stock Alerts',
  description = 'Products that need attention',
}: LowStockAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-yellow-100 p-2">
                    <Package className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.sku} • {item.warehouse}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reorder point: {item.reorderPoint}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={item.status === 'OUT_OF_STOCK' ? 'destructive' : 'secondary'}
                    className={
                      item.status === 'LOW_STOCK'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : ''
                    }
                  >
                    {item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
                  </Badge>
                  <p className="text-sm font-medium mt-1">
                    {item.currentQuantity} units
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No low stock items
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
