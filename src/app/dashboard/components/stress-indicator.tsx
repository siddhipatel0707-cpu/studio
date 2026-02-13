"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StressResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StressIndicatorProps {
  stress: StressResult;
  isLoading: boolean;
}

export function StressIndicator({ stress, isLoading }: StressIndicatorProps) {
  const { ratio, level, message } = stress;

  const getLevelProperties = () => {
    switch (level) {
      case "Safe":
        return { color: "bg-emerald-green", textColor: "text-emerald-green" };
      case "Risky":
        return { color: "bg-yellow-500", textColor: "text-yellow-500" };
      case "Stressed":
        return { color: "bg-destructive", textColor: "text-destructive" };
      default:
        return { color: "bg-primary", textColor: "text-primary" };
    }
  };
  const { color, textColor } = getLevelProperties();

  if (isLoading) {
      return (
          <Card className="rounded-2xl">
              <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-10 w-full" />
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Financial Stress Meter</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-full bg-muted rounded-full h-3">
              <div
                  className={cn("h-3 rounded-full transition-all duration-1000 ease-out", color)}
                  style={{ width: `${Math.min(ratio * 100, 100)}%` }}
              />
          </div>
          <span className={cn("text-2xl font-bold font-headline", textColor)}>{(ratio * 100).toFixed(0)}%</span>
        </div>
        <div className="mt-4 text-sm font-medium text-center">
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold", color, "bg-opacity-10")}>{level}</span>
        </div>
      </CardContent>
    </Card>
  );
}
