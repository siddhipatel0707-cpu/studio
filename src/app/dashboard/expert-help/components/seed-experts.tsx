'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Expert } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const expertsData: Omit<Expert, 'id'>[] = [
    {
        name: 'Dr. Aristha Singh',
        role: 'Debt Strategy Specialist',
        avatarUrl: 'https://picsum.photos/seed/expert1/200/200',
        imageHint: "woman financial advisor",
        competencies: ['EMI burden reduction', 'Loan exit strategies', 'Credit score recovery'],
        email: 'aristha.singh@example.com',
    },
    {
        name: 'Marcus Chen',
        role: 'Retirement Architect',
        avatarUrl: 'https://picsum.photos/seed/expert2/200/200',
        imageHint: "man financial advisor",
        competencies: ['Wealth gap analysis', 'Inflation-proof savings', 'Jargon-free planning'],
        email: 'marcus.chen@example.com',
    },
    {
        name: 'Sarah Jenkins',
        role: 'Behavioral Coach',
        avatarUrl: 'https://picsum.photos/seed/expert3/200/200',
        imageHint: "woman behavioral coach",
        competencies: ['Mindful spending habits', 'Financial stress relief', 'Goal-setting psychology'],
        email: 'sarah.jenkins@example.com',
    },
    {
        name: 'David Osei',
        role: 'Tax Optimizer',
        avatarUrl: 'https://picsum.photos/seed/expert4/200/200',
        imageHint: "man tax advisor",
        competencies: ['Tax-saving blueprints', 'Portfolio risk management', 'Income stream diversification'],
        email: 'david.osei@example.com',
    },
];

export function SeedExperts() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSeeded, setIsSeeded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const checkExperts = async () => {
            const expertsCollectionRef = collection(firestore, 'experts');
            const snapshot = await getDocs(expertsCollectionRef);
            if (!snapshot.empty) {
                setIsSeeded(true);
                setIsVisible(false);
            }
        };
        checkExperts();
    }, [firestore]);

    const handleSeed = async () => {
        const expertsCollectionRef = collection(firestore, 'experts');
        
        const snapshot = await getDocs(expertsCollectionRef);
        if (!snapshot.empty) {
            toast({
                title: 'Database Already Seeded',
                description: 'The experts collection already contains data.',
                variant: 'default',
            });
            setIsSeeded(true);
            setIsVisible(false);
            return;
        }

        try {
            for (const expert of expertsData) {
                await addDoc(expertsCollectionRef, expert);
            }
            toast({
                title: 'Seeding Successful',
                description: 'Expert data has been added to Firestore.',
            });
            setIsSeeded(true);
            setIsVisible(false);
        } catch (error) {
            console.error('Error seeding data:', error);
            toast({
                title: 'Seeding Failed',
                description: 'Could not seed the database. Check console for errors.',
                variant: 'destructive',
            });
        }
    };
    
    if (!isVisible) {
        return null;
    }

    return (
        <Alert className="mb-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Developer Tool: Database Seeder</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
                <p>Click the button to populate the 'experts' collection in Firestore with initial data. This component can be removed from `src/app/dashboard/expert-help/page.tsx` after the first successful run.</p>
                <Button onClick={handleSeed} disabled={isSeeded}>
                    {isSeeded ? 'Seeded' : 'Seed Expert Data'}
                </Button>
            </AlertDescription>
        </Alert>
    );
}
