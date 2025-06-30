'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import type { UserRole } from '@/types';

const PRICING_CONFIG_KEY = 'fleet-pricing-config';

const pricingFormSchema = z.object({
  baseFare: z.coerce.number().min(0, 'Base fare must be non-negative.'),
  perKilometer: z.coerce.number().min(0, 'Price per km must be non-negative.'),
  perStop: z.coerce.number().min(0, 'Price per stop must be non-negative.'),
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

const defaultValues: Partial<PricingFormValues> = {
  baseFare: 3.5,
  perKilometer: 1.75,
  perStop: 2.0,
};

export default function SettingsPage() {
  const { role } = useAppContext();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = React.useState(false);

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    try {
        const savedConfig = localStorage.getItem(PRICING_CONFIG_KEY);
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            form.reset(parsedConfig);
        }
    } catch (error) {
        console.error('Failed to load pricing config from localStorage', error);
    }
    setIsMounted(true);
  }, [form]);


  function onSubmit(data: PricingFormValues) {
    try {
        localStorage.setItem(PRICING_CONFIG_KEY, JSON.stringify(data));
        toast({
            title: 'Settings Saved',
            description: 'Your new pricing configuration has been saved successfully.',
        });
    } catch (error) {
        console.error('Failed to save pricing config to localStorage', error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'Could not save the pricing configuration.',
        });
    }
  }

  if (!isMounted) {
    return null; 
  }

  if (role !== 'Admin') {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">You must be an administrator to access this page.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage application-wide settings and configurations."
      />
      <Card>
        <CardHeader>
          <CardTitle>Trip Pricing</CardTitle>
          <CardDescription>
            Define the pricing model for all trips managed by the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
              <FormField
                control={form.control}
                name="baseFare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Fare (Flag-Drop)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 3.50" {...field} />
                    </FormControl>
                    <FormDescription>
                      The initial charge when a trip starts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="perKilometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Kilometer</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 1.75" {...field} />
                    </FormControl>
                    <FormDescription>
                      The charge for each kilometer traveled.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="perStop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Stop</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 2.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Additional charge for each requested stop during the trip.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
