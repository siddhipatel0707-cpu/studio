"use client";

import { useMemo } from "react";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { SimulationInput, StoredSimulation } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface PastSimulationsProps {
  userId: string;
  onLoad: (data: SimulationInput) => void;
  simulationCount: number;
  isSimulating: boolean;
}

export function PastSimulations({ userId, onLoad, simulationCount, isSimulating }: PastSimulationsProps) {
  const firestore = useFirestore();

  const simulationsQuery = useMemoFirebase(() => {
    if (!userId) return null;
    return query(
      collection(firestore, "users", userId, "financialSimulations"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
  }, [firestore, userId, simulationCount]);

  const { data: simulations, isLoading } = useCollection<StoredSimulation>(simulationsQuery);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Simulation History</CardTitle>
        <CardDescription>Load a past scenario to review or re-run.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !simulations || simulations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <History className="h-12 w-12 mb-4" />
                <p>No past simulations found.</p>
                <p className="text-sm">Your saved simulations will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {simulations.map((sim) => (
                <div key={sim.id} className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50">
                  <div>
                    <p className="font-semibold">
                        {sim.inputs.decisionName || `${sim.inputs.decisionType === 'Loan' ? 'Loan' : 'Purchase'} of ₹${(sim.inputs.plannedAmount || 0).toLocaleString('en-IN')}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sim.timestamp ? formatDistanceToNow(sim.timestamp.toDate(), { addSuffix: true }) : 'Recently'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onLoad(sim.inputs)} disabled={isSimulating}>
                    Load
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
