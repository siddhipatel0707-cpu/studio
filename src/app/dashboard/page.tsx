"use client";

import { useEffect } from "react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Landmark, Wallet, HeartPulse, LineChart } from "lucide-react";
import { SummaryCard } from "./components/summary-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSimulationContext } from "./layout";

export default function DashboardPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const { simulationInput, isLoading: isSimLoading } = useSimulationContext();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);
  
  const monthlyIncome = simulationInput?.monthlyIncome || 0;
  const existingEmis = simulationInput?.existingEmis || 0;
  const currentSavingsCorpus = simulationInput?.currentSavingsCorpus || 0;

  const savingsHealth = monthlyIncome > 0 ? (currentSavingsCorpus / monthlyIncome) : 0;
  const savingsHealthDescription = simulationInput ? 
    (savingsHealth < 3 ? "Below recommended 3-6 months cover" : savingsHealth > 6 ? "Above recommended 3-6 months cover" : "Within recommended 3-6 months cover")
    : "Run a simulation to see your savings health.";

  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard isLoading={isSimLoading} title="Monthly Income" value={`₹${monthlyIncome.toLocaleString('en-IN')}`} description="Live from your simulation profile." icon={Landmark} />
        <SummaryCard isLoading={isSimLoading} title="Total Monthly EMI" value={`₹${existingEmis.toLocaleString('en-IN')}`} description="Live from your simulation profile." icon={Wallet} />
        <SummaryCard isLoading={isSimLoading} title="Savings Health" value={`${savingsHealth.toFixed(1)} months`} description={savingsHealthDescription} icon={HeartPulse} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Financial Dashboard</CardTitle>
          <CardDescription>
            Here's a snapshot of your financial health based on your latest simulation. To explore new scenarios or see detailed projections, head over to the simulation tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Ready to run the numbers?</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Use our powerful simulation tools to see how different financial decisions could impact your future.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/simulation">Go to Simulation Tools</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
