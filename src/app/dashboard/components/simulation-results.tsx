"use client";

import type { SimulationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StressIndicator } from "./stress-indicator";
import { RetirementChart } from "./retirement-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp, LineChart, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsightCard } from "./ai-insight-card";

interface SimulationResultsProps {
  result: SimulationResult | null;
  isLoading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export function SimulationResults({ result, isLoading }: SimulationResultsProps) {
  if (isLoading && !result) {
    return (
        <div className="space-y-8">
            <Card className="rounded-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="pt-6">
                    <Skeleton className="aspect-video w-full" />
                </CardContent>
            </Card>
            <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
    );
  }
  
  if (!result) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[50vh] rounded-2xl">
            <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="font-headline text-2xl">Simulation Results</CardTitle>
            <CardDescription className="mt-2">
                Your simulation results will appear here once you run a simulation.
            </CardDescription>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
        <StressIndicator stress={result.stress} isLoading={isLoading} />
        
        {result.retirementDelay > 0 && (
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 rounded-2xl">
                <CardHeader className="flex flex-row items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400"/>
                    <div>
                        <CardTitle className="text-amber-900 dark:text-amber-300 font-headline">
                            Retirement Delayed by {result.retirementDelay.toFixed(1)} years
                        </CardTitle>
                        <CardDescription className="text-amber-700 dark:text-amber-400">
                            You might need to work longer to reach your original retirement goal.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )}

        <Card className="rounded-2xl">
            <CardHeader>
            <CardTitle className="font-headline text-2xl">Retirement Projections</CardTitle>
            <CardDescription>How this decision impacts your retirement savings.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-6">
                <Card className="bg-muted/50 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Corpus (Before)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-green" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">{formatCurrency(result.corpusBefore)}</div>
                        <p className="text-xs text-muted-foreground">Projected corpus without the new expense.</p>
                    </CardContent>
                </Card>
                <Card className="bg-muted/50 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Corpus (After)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">{formatCurrency(result.corpusAfter)}</div>
                        <p className="text-xs text-muted-foreground">Projected corpus with the new expense.</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>

        <AIInsightCard insight={result.aiInsight} isLoading={isLoading} />
    </div>
  );
}
