/**
 * Revenue Chart Component
 * Displays revenue trends over time
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LineChart from '@/components/charts/LineChart';
import { format } from 'date-fns';

interface RevenueChartProps {
  data: Array<{
    date: { year: number; month: number; day?: number };
    revenue: number;
    cost?: number;
    profit?: number;
  }>;
  title?: string;
  description?: string;
}

export default function RevenueChart({
  data,
  title = 'Revenue Trends',
  description = 'Revenue, cost, and profit over time',
}: RevenueChartProps) {
  // Transform data for chart
  const chartData = data.map((item) => {
    const date = new Date(item.date.year, item.date.month - 1, item.date.day || 1);
    return {
      date: format(date, item.date.day ? 'MMM dd' : 'MMM yyyy'),
      Revenue: item.revenue,
      ...(item.cost !== undefined && { Cost: item.cost }),
      ...(item.profit !== undefined && { Profit: item.profit }),
    };
  });

  const dataKeys = [
    { key: 'Revenue', color: '#10b981', name: 'Revenue' },
    ...(data.some((d) => d.cost !== undefined)
      ? [{ key: 'Cost', color: '#ef4444', name: 'Cost' }]
      : []),
    ...(data.some((d) => d.profit !== undefined)
      ? [{ key: 'Profit', color: '#3b82f6', name: 'Profit' }]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          dataKeys={dataKeys}
          xAxisKey="date"
          height={300}
        />
      </CardContent>
    </Card>
  );
}
