'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LineChart } from "lucide-react";

export default function SimulationPage() {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[60vh]">
        <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
        <CardTitle className="font-headline text-2xl">Simulation Tools</CardTitle>
        <CardDescription className="mt-2 max-w-md">
            All simulation tools have been moved to the main dashboard.
        </CardDescription>
        <Button asChild className="mt-6">
            <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
    </Card>
  );
}
