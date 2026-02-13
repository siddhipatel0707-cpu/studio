'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, ServerCrash } from 'lucide-react';
import { ExpertCard } from './components/expert-card';
import type { Expert } from '@/lib/types';
import { SeedExperts } from './components/seed-experts';

export default function ExpertHelpPage() {
  const firestore = useFirestore();
  const expertsCollection = useMemoFirebase(
    () => collection(firestore, 'experts'),
    [firestore]
  );
  const {
    data: experts,
    isLoading,
    error,
  } = useCollection<Expert>(expertsCollection);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] w-full items-center justify-center text-destructive">
        <ServerCrash className="h-10 w-10 mb-4" />
        <h2 className="text-2xl font-semibold">Error Loading Experts</h2>
        <p>Could not fetch expert data from the database.</p>
      </div>
    );
  }

  return (
    <div>
       <SeedExperts />
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Expert Help</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Connect with our team of financial experts for personalized guidance.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {experts && experts.map((expert) => (
          <ExpertCard key={expert.id} expert={expert} />
        ))}
      </div>
       {experts?.length === 0 && !isLoading && (
         <div className="text-center col-span-full py-16">
           <p className="text-muted-foreground">No experts found. Please click the button in the developer tool above to seed the database.</p>
         </div>
       )}
    </div>
  );
}
