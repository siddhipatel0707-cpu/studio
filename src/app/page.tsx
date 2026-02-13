"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "@/components/icons";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="flex items-center gap-3">
            <Logo className="h-12 w-12 text-primary" />
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                FutureWise Analyzer
            </h1>
        </div>
        <p className="max-w-md text-lg text-muted-foreground">
          See how today’s decisions affect your retirement.
        </p>
        <div className="flex space-x-4 pt-4">
          <Button asChild size="lg">
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
