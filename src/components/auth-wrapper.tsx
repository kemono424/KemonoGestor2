'use client';

import { useAppContext } from '@/context/AppContext';
import { LoginPage } from '@/components/login-page';
import MainLayout from '@/components/layout/main-layout';
import { Skeleton } from './ui/skeleton';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-sm space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return <MainLayout>{children}</MainLayout>;
}
