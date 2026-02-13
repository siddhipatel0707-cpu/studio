'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { StoredSimulation } from '@/lib/types';
import { AIInsightCard } from '../components/ai-insight-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TruthModePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const latestSimQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'financialSimulations'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
  }, [firestore, user]);

  const { data: latestSimulations, isLoading: isSimLoading } = useCollection<StoredSimulation>(latestSimQuery);

  const latestInsight = latestSimulations?.[0]?.results?.aiInsight;
  const isLoading = isUserLoading || isSimLoading;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!latestInsight) {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[60vh] rounded-2xl">
        <ShieldCheck className="h-20 w-20 text-muted-foreground mb-6" />
        <CardHeader>
            <CardTitle className="font-headline text-3xl">The Unfiltered Truth Awaits</CardTitle>
            <CardDescription className="mt-2 max-w-md mx-auto">
            Run a financial simulation to get your personalized, AI-driven insight here. This is the unfiltered look at your financial decisions.
            </CardDescription>
        </CardHeader>
        <Button asChild className="mt-6 transition-transform duration-300 ease-in-out hover:scale-105">
            <Link href="/dashboard/simulation">Run a Simulation</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <AIInsightCard insight={latestInsight} isLoading={false} />
    </div>
  );
}
