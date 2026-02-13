import { type ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/icons';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
                <Logo className="h-10 w-10 text-primary" />
                <span className="font-headline text-3xl font-semibold">FutureWise</span>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
