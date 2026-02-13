"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    isLoading?: boolean;
}

export function SummaryCard({ title, value, description, icon: Icon, isLoading = false }: SummaryCardProps) {
    if (isLoading) {
        return (
            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card className="rounded-2xl transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 bg-card/60 backdrop-blur-xl border-white/30 dark:border-slate-700/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold font-headline">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
