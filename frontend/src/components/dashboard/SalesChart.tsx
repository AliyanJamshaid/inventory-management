/**
 * Sales Chart Component
 * Displays sales by category or product
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import BarChart from '@/components/charts/BarChart';

interface SalesChartProps {
  data: Array<{
    name: string;
    totalSales: number;
    totalQuantity?: number;
  }>;
  title?: string;
  description?: string;
}

export default function SalesChart({
  data,
  title = 'Sales by Category',
  description = 'Total sales across different categories',
}: SalesChartProps) {
  // Transform data for chart
  const chartData = data.map((item) => ({
    name: item.name || 'Uncategorized',
    Sales: item.totalSales,
    ...(item.totalQuantity !== undefined && { Quantity: item.totalQuantity }),
  }));

  const dataKeys = [
    { key: 'Sales', color: '#3b82f6', name: 'Sales ($)' },
    ...(data.some((d) => d.totalQuantity !== undefined)
      ? [{ key: 'Quantity', color: '#10b981', name: 'Quantity' }]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <BarChart
          data={chartData}
          dataKeys={dataKeys}
          xAxisKey="name"
          height={300}
        />
      </CardContent>
    </Card>
  );
}
