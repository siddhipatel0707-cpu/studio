'use client';

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export default function TruthModePage() {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[60vh]">
        <CheckSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <CardTitle className="font-headline text-2xl">Ready to see your future?</CardTitle>
        <CardDescription className="mt-2 max-w-md">
            The &quot;Truth Mode&quot; will give you an unfiltered look at your financial decisions. This feature is coming soon!
        </CardDescription>
    </Card>
  );
}
