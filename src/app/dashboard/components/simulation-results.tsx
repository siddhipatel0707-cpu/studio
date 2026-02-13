"use client";

import type { SimulationResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StressIndicator } from "./stress-indicator";
import { RetirementChart } from "./retirement-chart";
import { AIInsightCard } from "./ai-insight-card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp, LineChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimulationResultsProps {
  result: SimulationResult | null;
  isLoading: boolean;
  isAiLoading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export function SimulationResults({ result, isLoading, isAiLoading }: SimulationResultsProps) {
  if (isLoading && !result) {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video w-full" />
                </CardContent>
            </Card>
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }
  
  if (!result) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-8 h-full">
            <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="font-headline text-2xl">Simulation Results</CardTitle>
            <CardDescription className="mt-2">
                Your simulation results will appear here once you run a simulation.
            </CardDescription>
        </Card>
    );
  }

  return (
    <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis" className="mt-4 space-y-8">
            <StressIndicator stress={result.stress} isLoading={isLoading} />
      
            {result.retirementDelay > 0 && (
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                        <CardTitle className="text-yellow-900 dark:text-yellow-300">
                            Retirement Delayed by {result.retirementDelay.toFixed(1)} years
                        </CardTitle>
                        <CardDescription className="text-yellow-700 dark:text-yellow-400">
                            You might need to work longer to reach your original retirement goal.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            <AIInsightCard insight={result.aiInsight} isLoading={isAiLoading} />
        </TabsContent>
        <TabsContent value="projections" className="mt-4 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Retirement Projections</CardTitle>
                <CardDescription>How this decision impacts your retirement savings.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="bg-muted/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Corpus (Before)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(result.corpusBefore)}</div>
                            <p className="text-xs text-muted-foreground">Projected corpus without the new expense.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Corpus (After)</CardTitle>
                            <TrendingDown className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(result.corpusAfter)}</div>
                            <p className="text-xs text-muted-foreground">Projected corpus with the new expense.</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Growth Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                <RetirementChart data={result.chartData} isLoading={isLoading} />
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
