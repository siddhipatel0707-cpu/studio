"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FinancialInputForm } from "./components/financial-input-form";
import { SimulationResults } from "./components/simulation-results";
import type { SimulationInput, SimulationResult } from "@/lib/types";
import { calculateRetirement, calculateRetirementDelay, calculateStress } from "@/lib/finance-utils";
import { getAIFinancialInsight } from "@/ai/flows/ai-financial-insight";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Landmark, Wallet, HeartPulse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PastSimulations } from "./components/past-simulations";
import { collection, Timestamp } from "firebase/firestore";
import { SummaryCard } from "./components/summary-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  monthlyIncome: z.coerce.number().min(0, "Monthly income must be positive."),
  existingEmis: z.coerce.number().min(0, "Existing EMIs must be positive."),
  currentMonthlySavings: z.coerce.number().min(0, "Monthly savings must be positive."),
  currentSavingsCorpus: z.coerce.number().min(0, "Savings corpus must be positive."),
  currentAge: z.coerce.number().min(18, "Age must be at least 18.").max(100),
  targetRetirementAge: z.coerce.number().min(18, "Retirement age must be at least 18.").max(100),
  expectedAnnualReturn: z.coerce.number().min(0, "Return must be positive.").max(100),
  decisionType: z.enum(['Loan', 'Purchase']),
  decisionName: z.string().min(1, "Please enter a name for your decision."),
  plannedAmount: z.coerce.number().min(1, "Amount must be positive."),
  loanDurationYears: z.coerce.number().min(0, "Duration must be positive."),
}).refine(data => data.targetRetirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age.",
  path: ["targetRetirementAge"],
}).refine(data => data.decisionType !== 'Loan' || data.loanDurationYears > 0, {
    message: "Loan duration must be greater than 0 for a loan.",
    path: ["loanDurationYears"],
});

export default function DashboardPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCount, setSimulationCount] = useState(0);
  const isRunningRef = useRef(false);

  const form = useForm<SimulationInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: 50000,
      existingEmis: 5000,
      currentMonthlySavings: 15000,
      currentSavingsCorpus: 500000,
      currentAge: 30,
      targetRetirementAge: 60,
      expectedAnnualReturn: 12,
      decisionType: 'Loan',
      decisionName: "New Car",
      plannedAmount: 10000,
      loanDurationYears: 5,
    },
  });

  const runSimulation = useCallback(async (data: SimulationInput) => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    setIsSimulating(true);

    try {
        // --- START OF LOCAL CALCULATION ---
        const plannedEmiForStress = data.decisionType === 'Loan' ? data.plannedAmount : 0;
        const stressResult = calculateStress(data.monthlyIncome, data.existingEmis, plannedEmiForStress);

        const { corpus: corpusBefore } = calculateRetirement(
          data.currentSavingsCorpus,
          data.currentMonthlySavings,
          data.expectedAnnualReturn,
          data.currentAge,
          data.targetRetirementAge
        );

        let corpusAfter, monthlyGrowthData;

        if (data.decisionType === 'Loan') {
            const newMonthlySavings = data.currentMonthlySavings - data.plannedAmount;
            const { corpus, monthlyGrowthData: growthData } = calculateRetirement(
                data.currentSavingsCorpus,
                newMonthlySavings > 0 ? newMonthlySavings : 0,
                data.expectedAnnualReturn,
                data.currentAge,
                data.targetRetirementAge,
                true // generate chart data
            );
            corpusAfter = corpus;
            monthlyGrowthData = growthData;
        } else { // Purchase
            const newCorpus = data.currentSavingsCorpus - data.plannedAmount;
            const { corpus, monthlyGrowthData: growthData } = calculateRetirement(
                newCorpus,
                data.currentMonthlySavings,
                data.expectedAnnualReturn,
                data.currentAge,
                data.targetRetirementAge,
                true // generate chart data
            );
            corpusAfter = corpus;
            monthlyGrowthData = growthData;
        }


        const retirementDelay = calculateRetirementDelay({
          originalCorpus: corpusBefore,
          newMonthlySavings: data.decisionType === 'Loan' ? data.currentMonthlySavings - data.plannedAmount : data.currentMonthlySavings,
          annualRate: data.expectedAnnualReturn,
          currentCorpus: data.decisionType === 'Purchase' ? data.currentSavingsCorpus - data.plannedAmount : data.currentSavingsCorpus,
          currentAge: data.targetRetirementAge,
          originalRetirementAge: data.targetRetirementAge
        });

        const chartData = monthlyGrowthData?.map(item => {
            const age = data.currentAge + item.month / 12;
            const beforeDecisionCorpus = calculateRetirement(data.currentSavingsCorpus, data.currentMonthlySavings, data.expectedAnnualReturn, data.currentAge, age).corpus;
            return {
                age: Math.floor(age),
                "Before Decision": beforeDecisionCorpus,
                "After Decision": item.corpus,
            }
        }).filter((_, i) => i % 12 === 0);

        const simulationResult: SimulationResult = {
          stress: stressResult,
          corpusBefore,
          corpusAfter,
          retirementDelay,
          chartData: chartData || [],
          aiInsight: "",
        };
        setResult(simulationResult);
        // --- END OF LOCAL CALCULATION ---
        
        if (!user) throw new Error("User not found for AI Insight");

        // --- START OF AI CALL & FIRESTORE ---
        const aiInput = {
            income: data.monthlyIncome,
            totalEmiAfterDecision: data.existingEmis + plannedEmiForStress,
            stressRatio: stressResult.ratio,
            retirementCorpusBefore: corpusBefore,
            retirementCorpusAfter: corpusAfter,
            retirementDelay: retirementDelay,
        };
        const insight = await getAIFinancialInsight(aiInput);
        
        // Use a functional update to avoid stale state issues with the result object
        setResult(prev => {
            const newResult = prev ? { ...prev, aiInsight: insight } : null;
            if (newResult && user) {
                const simulationsCollectionRef = collection(firestore, 'users', user.uid, 'financialSimulations');
                addDocumentNonBlocking(simulationsCollectionRef, {
                    userId: user.uid,
                    inputs: data,
                    results: newResult, // Save the complete result
                    timestamp: Timestamp.now(),
                });
            }
            return newResult;
        });


        setSimulationCount(prev => prev + 1);
        toast({
            title: "Simulation Saved",
            description: "Your simulation has been saved to your history.",
        });

    } catch (e: any) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "AI Insight Failed",
            description: e.message || "Could not generate AI insight or save simulation.",
        });
    } finally {
        setIsSimulating(false);
        isRunningRef.current = false;
    }
  }, [user, toast, firestore]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const watchedIncome = useWatch({ control: form.control, name: 'monthlyIncome' });
  const watchedEmis = useWatch({ control: form.control, name: 'existingEmis' });


  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleRunSimulation = (data: SimulationInput) => {
    runSimulation(data);
  };
  
  const loadSimulation = (data: SimulationInput) => {
    form.reset(data);
    runSimulation(data);
  };

  return (
    <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
             <SummaryCard title="Monthly Income" value={`₹${(watchedIncome || 0).toLocaleString('en-IN')}`} description="Your total income per month." icon={Landmark} />
             <SummaryCard title="Total Monthly EMI" value={`₹${(watchedEmis || 0).toLocaleString('en-IN')}`} description="Sum of all monthly payments." icon={Wallet} />
             <SummaryCard title="Savings Health" value="0.0 months" description="Below recommended 3-6 months cover" icon={HeartPulse} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
                <FinancialInputForm form={form} onSubmit={handleRunSimulation} isSimulating={isSimulating} />
            </div>
            <div>
                <Tabs defaultValue="results" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="results">Simulation Results</TabsTrigger>
                        <TabsTrigger value="history">Simulation History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="results" className="mt-4">
                        <SimulationResults result={result} isLoading={isSimulating} isAiLoading={isSimulating} />
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        <PastSimulations userId={user.uid} onLoad={loadSimulation} simulationCount={simulationCount} isSimulating={isSimulating} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </div>
  );
}
