"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

interface AIInsightCardProps {
  insight: string;
  isLoading: boolean;
}

export function AIInsightCard({ insight, isLoading }: AIInsightCardProps) {
  return (
    <Card className="rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-gold" />
            AI Financial Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-white/30" />
            <Skeleton className="h-4 w-full bg-white/30" />
            <Skeleton className="h-4 w-3/4 bg-white/30" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-primary-foreground/90">{insight}</p>
        )}
      </CardContent>
    </Card>
  );
}
