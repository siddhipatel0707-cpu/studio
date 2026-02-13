"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FinancialInputForm } from "../components/financial-input-form";
import { SimulationResults } from "../components/simulation-results";
import { PastSimulations } from "../components/past-simulations";
import type { SimulationInput, SimulationResult } from "@/lib/types";
import { collection, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { calculateRetirement, calculateRetirementDelay, calculateStress } from "@/lib/finance-utils";
import { getAIFinancialInsight } from "@/ai/flows/ai-financial-insight";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulationContext } from "../layout";


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


export default function SimulationPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { simulationInput, setSimulationInput, isLoading: isContextLoading } = useSimulationContext();

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCount, setSimulationCount] = useState(0);

  const form = useForm<SimulationInput>({
    resolver: zodResolver(formSchema),
    defaultValues: simulationInput || undefined,
  });
  
  useEffect(() => {
    // Sync form changes to the global context, but only on user input.
    const subscription = form.watch((value, { type }) => {
        // This check prevents an infinite loop. `form.reset` does not have a 'change' type.
        if (type === 'change') {
            setSimulationInput(value as SimulationInput);
        }
    });
    return () => subscription.unsubscribe();
  }, [form, setSimulationInput]);


  // If the context is updated from elsewhere (e.g. loading a past sim), reset the form
  useEffect(() => {
    if (simulationInput) {
        form.reset(simulationInput);
    }
  }, [simulationInput, form]);


  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const runSimulation = useCallback(async (data: SimulationInput) => {
    setIsSimulating(true);
    setResult(null); 

    try {
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
                true
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
                true
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
        
        if (!user) throw new Error("User not found for AI Insight");

        const aiInput = {
            income: data.monthlyIncome,
            totalEmiAfterDecision: data.existingEmis + plannedEmiForStress,
            stressRatio: stressResult.ratio,
            retirementCorpusBefore: corpusBefore,
            retirementCorpusAfter: corpusAfter,
            retirementDelay: retirementDelay,
        };
        const insight = await getAIFinancialInsight(aiInput);
        
        const finalResult = { ...simulationResult, aiInsight: insight };
        setResult(finalResult);

        if (user) {
            const simulationsCollectionRef = collection(firestore, 'users', user.uid, 'financialSimulations');
            addDocumentNonBlocking(simulationsCollectionRef, {
                userId: user.uid,
                inputs: data,
                results: finalResult,
                timestamp: Timestamp.now(),
            }).then(() => {
                setSimulationCount(prev => prev + 1);
                toast({
                    title: "Simulation Saved",
                    description: "Your simulation has been saved to your history.",
                });
            });
        }

    } catch (e: any) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Simulation Failed",
            description: e.message || "Could not run simulation or generate AI insight.",
        });
    } finally {
        setIsSimulating(false);
    }
  }, [user, toast, firestore]);

  const handleRunSimulation = (data: SimulationInput) => {
    runSimulation(data);
  };
  
  const handleLoadSimulation = (data: SimulationInput) => {
    form.reset(data);
    setResult(null); // Clear previous results when loading a new simulation
    toast({ title: "Simulation Loaded", description: "The financial profile has been updated. Click 'Run Simulation' to see the results." });
  };

  if (authLoading || !user || isContextLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-8">
                <FinancialInputForm form={form} onSubmit={handleRunSimulation} isSimulating={isSimulating} />
            </div>
            <div className="lg:col-span-3 space-y-8">
                <Tabs defaultValue="results" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="results">Simulation Results</TabsTrigger>
                        <TabsTrigger value="history">Simulation History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="results" className="mt-4">
                        <SimulationResults result={result} isLoading={isSimulating && !result} />
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        <PastSimulations userId={user.uid} onLoad={handleLoadSimulation} simulationCount={simulationCount} isSimulating={isSimulating} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </div>
  );
}
