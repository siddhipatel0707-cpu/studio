"use client";

import { useEffect } from "react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, ShieldCheck } from "lucide-react";
import { SummaryCard } from "./components/summary-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSimulationContext } from "./layout";
import { RetirementChart } from "./components/retirement-chart";
import { AIInsightCard } from "./components/ai-insight-card";
import { calculateRetirement } from "@/lib/finance-utils";

export default function DashboardPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const { simulationInput, isLoading: isSimLoading } = useSimulationContext();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const {
    monthlyIncome = 0,
    currentSavingsCorpus = 0,
    currentMonthlySavings = 0,
    expectedAnnualReturn = 0,
    currentAge = 0,
    targetRetirementAge = 0,
    decisionType,
    plannedAmount = 0,
  } = simulationInput || {};

  const { corpus: corpusBefore, monthlyGrowthData: growthBefore } = calculateRetirement(
    currentSavingsCorpus,
    currentMonthlySavings,
    expectedAnnualReturn,
    currentAge,
    targetRetirementAge,
    true
  );

  let corpusAfter = 0;
  let growthAfter: { month: number; corpus: number }[] = [];

  if (simulationInput) {
    if (decisionType === 'Loan') {
      const newMonthlySavings = currentMonthlySavings - plannedAmount;
      const result = calculateRetirement(
          currentSavingsCorpus,
          newMonthlySavings > 0 ? newMonthlySavings : 0,
          expectedAnnualReturn,
          currentAge,
          targetRetirementAge,
          true
      );
      corpusAfter = result.corpus;
      growthAfter = result.monthlyGrowthData;
    } else { // Purchase
      const newCorpus = currentSavingsCorpus - plannedAmount;
      const result = calculateRetirement(
          newCorpus,
          currentMonthlySavings,
          expectedAnnualReturn,
          currentAge,
          targetRetirementAge,
          true
      );
      corpusAfter = result.corpus;
      growthAfter = result.monthlyGrowthData;
    }
  }

  const chartData = growthBefore.map((item, index) => {
    const age = currentAge + item.month / 12;
    return {
      age: Math.floor(age),
      "Before Decision": item.corpus,
      "After Decision": growthAfter[index]?.corpus || 0,
    };
  }).filter((_, i) => i % 12 === 0);

  if (authLoading || !user || isSimLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Welcome back, {user?.displayName || "User"}!</h1>
        <p className="text-lg text-muted-foreground">Here’s your financial command center.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard isLoading={isSimLoading} title="Projected Retirement Corpus" value={`₹${corpusBefore.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} description="Your potential wealth at retirement." icon={TrendingUp} />
        <SummaryCard isLoading={isSimLoading} title="Financial Health" value={`Good`} description="Based on your savings & debt." icon={ShieldCheck} />
        <SummaryCard isLoading={isSimLoading} title="Next Smart Step" value="Review Plan" description="Check AI insights for opportunities" icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Your Future Wealth Projection</CardTitle>
            <CardDescription>
              This chart shows your wealth growth over time, with and without your planned decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetirementChart data={chartData} isLoading={isSimLoading} />
          </CardContent>
        </Card>
        <div className="space-y-8">
            <AIInsightCard insight={"Run a simulation to get your personalized AI financial insight."} isLoading={isSimLoading}/>
             <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Take Control</CardTitle>
                  <CardDescription>
                    Ready to explore scenarios? Dive into the simulation tool.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full transition-transform duration-300 ease-in-out hover:scale-105">
                      <Link href="/dashboard/simulation">Go to Simulation Tools</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
