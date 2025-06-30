'use client';

import { useEffect, useState } from 'react';
import type { Customer } from '@/types';
import { summarizeCustomer } from '@/ai/flows/summarize-customer-flow';
import { recentTrips } from '@/lib/mock-data';
import { Skeleton } from './ui/skeleton';
import { Bot } from 'lucide-react';

interface CustomerSummaryCellProps {
  customer: Customer;
}

export function CustomerSummaryCell({ customer }: CustomerSummaryCellProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSummary = async () => {
      try {
        setIsLoading(true);
        const customerTrips = recentTrips
          .filter(trip => trip.customer.id === customer.id)
          .map(trip => ({
            id: trip.id,
            status: trip.status,
            origin: trip.origin,
            destination: trip.destination,
            startTime: trip.startTime,
            endTime: trip.endTime,
            // We only pass the necessary fields to the AI flow
          }));

        const result = await summarizeCustomer({
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            pendingDebt: customer.pendingDebt,
          },
          trips: customerTrips,
        });
        setSummary(result);
      } catch (e) {
        console.error(e);
        setError('Failed to generate summary.');
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [customer]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }
  
  if (error) {
      return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="flex items-start gap-2">
        <Bot className="h-4 w-4 mt-1 text-primary flex-shrink-0"/>
        <p className="text-sm text-muted-foreground">{summary}</p>
    </div>
  )
}
