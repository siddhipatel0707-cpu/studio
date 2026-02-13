"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface RetirementChartProps {
  data: { age: number; "Before Decision": number; "After Decision": number }[];
  isLoading: boolean;
}

const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)} K`;
    return `₹${value.toFixed(0)}`;
};

export function RetirementChart({ data, isLoading }: RetirementChartProps) {
    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-2xl" />;
    }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
          <defs>
            <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="age" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} label={{ value: 'Age', position: 'insideBottom', offset: -15, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} />
          <Tooltip 
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
            formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
            labelFormatter={(label) => `Age: ${label}`}
          />
          <Legend wrapperStyle={{paddingTop: '20px'}}/>
          <Area type="monotone" dataKey="Before Decision" stroke="hsl(var(--primary))" fill="url(#colorBefore)" strokeWidth={2.5} />
          <Area type="monotone" dataKey="After Decision" stroke="hsl(var(--accent))" fill="url(#colorAfter)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
