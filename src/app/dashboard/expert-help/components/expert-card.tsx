'use client';

import type { Expert } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Mail } from 'lucide-react';

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const handleConsult = () => {
    window.location.href = `mailto:${expert.email}?subject=EasyWealth Inquiry: Requesting Financial Guidance`;
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
      <CardHeader className="items-center bg-muted/30 p-6">
        <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
          <AvatarImage src={expert.avatarUrl} alt={expert.name} data-ai-hint={expert.imageHint} />
          <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
            <h3 className="mt-4 text-xl font-bold font-headline">{expert.name}</h3>
            <p className="text-sm font-semibold text-primary">{expert.role}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <h4 className="mb-4 font-semibold font-headline">Core Competencies</h4>
        <ul className="space-y-3 text-muted-foreground">
          {expert.competencies.map((competency, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="mr-3 mt-1 h-4 w-4 flex-shrink-0 text-emerald-green" />
              <span>{competency}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button onClick={handleConsult} className="w-full transition-transform duration-300 ease-in-out hover:scale-105">
          <Mail className="mr-2 h-4 w-4" />
          Consult Now
        </Button>
      </CardFooter>
    </Card>
  );
}
