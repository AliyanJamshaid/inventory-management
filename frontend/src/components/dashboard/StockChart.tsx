/**
 * Stock Chart Component
 * Displays stock distribution by warehouse
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PieChart from '@/components/charts/PieChart';

interface StockChartProps {
  data: Array<{
    warehouseName: string;
    totalValue: number;
  }>;
  title?: string;
  description?: string;
}

export default function StockChart({
  data,
  title = 'Stock Distribution',
  description = 'Stock value by warehouse',
}: StockChartProps) {
  // Transform data for chart
  const chartData = data.map((item) => ({
    name: item.warehouseName,
    value: item.totalValue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex justify-center">
        <PieChart
          data={chartData}
          height={300}
          outerRadius={100}
        />
      </CardContent>
    </Card>
  );
}
