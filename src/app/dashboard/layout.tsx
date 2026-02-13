"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  LineChart,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { Logo } from '@/components/icons';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SimulationInput, StoredSimulation } from '@/lib/types';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// --- Start of Context Logic ---

interface SimulationContextType {
    simulationInput: SimulationInput | null;
    setSimulationInput: React.Dispatch<React.SetStateAction<SimulationInput | null>>;
    isLoading: boolean;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const defaultSimulationValues: SimulationInput = {
  monthlyIncome: 75000,
  existingEmis: 10000,
  currentMonthlySavings: 20000,
  currentSavingsCorpus: 1000000,
  currentAge: 32,
  targetRetirementAge: 62,
  expectedAnnualReturn: 12,
  decisionType: 'Loan',
  decisionName: "New Car",
  plannedAmount: 15000,
  loanDurationYears: 5,
};


function SimulationProvider({ children }: { children: ReactNode }) {
    const [simulationInput, setSimulationInput] = useState<SimulationInput | null>(null);
    const { user } = useUser();
    const firestore = useFirestore();

    const latestSimQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, "users", user.uid, "financialSimulations"),
            orderBy("timestamp", "desc"),
            limit(1)
        );
    }, [firestore, user]);

    const { data: latestSimulations, isLoading: isSimLoading } = useCollection<StoredSimulation>(latestSimQuery);

    useEffect(() => {
        if (simulationInput !== null) return;

        if (latestSimulations && latestSimulations.length > 0) {
            setSimulationInput(latestSimulations[0].inputs);
        } else if (!isSimLoading) {
            setSimulationInput(defaultSimulationValues);
        }
    }, [latestSimulations, isSimLoading, simulationInput]);

    const value = {
        simulationInput,
        setSimulationInput,
        isLoading: simulationInput === null || isSimLoading
    };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulationContext() {
    const context = useContext(SimulationContext);
    if (context === undefined) {
        throw new Error('useSimulationContext must be used within a SimulationProvider');
    }
    return context;
}

// --- End of Context Logic ---


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const pathname = usePathname();
    const auth = useAuth();
    const { user } = useUser();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const userInitial = user?.email?.[0].toUpperCase() || '?';

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { href: '/dashboard/simulation', label: 'Simulation', icon: LineChart },
        { href: '/dashboard/truth-mode', label: 'Truth Mode', icon: ShieldCheck },
        { href: '/dashboard/expert-help', label: 'Expert Help', icon: MessageSquare },
    ];
    
    const pageTitleRaw = pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard';
    const pageTitle = pageTitleRaw === 'dashboard' ? 'Dashboard' : pageTitleRaw;

    return (
        <SidebarProvider>
            <SimulationProvider>
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 p-2">
                            <Logo className="h-10 w-10 text-primary" />
                            <span className="font-headline text-2xl font-semibold">
                                FutureWise
                            </span>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                                    <Link href={item.href}>
                                        <item.icon />
                                        {item.label}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-semibold text-sidebar-foreground">{user?.displayName || 'User'}</span>
                            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                         <Button variant="ghost" size="icon" className="ml-auto text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={handleLogout} tooltip="Log Out">
                            <LogOut className="h-5 w-5" />
                        </Button>
                      </div>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:h-20 md:px-8">
                        <SidebarTrigger className="md:hidden">
                            <Menu />
                        </SidebarTrigger>
                        <h1 className="font-headline text-2xl font-bold capitalize tracking-tight">{pageTitle}</h1>
                        <div className="ml-auto flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="dark-mode-toggle" disabled />
                                <Label htmlFor="dark-mode-toggle" className="text-sm text-muted-foreground">Dark Mode</Label>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-6 sm:p-8 md:p-10">{children}</main>
                </SidebarInset>
            </SimulationProvider>
        </SidebarProvider>
    )
}
