'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { customers, vehicles } from '@/lib/mock-data';
import type { Customer } from '@/types';
import { MapPin, User, Car, Star } from 'lucide-react';

const formSchema = z.object({
  customerPhone: z.string().min(1, { message: 'Customer phone is required.' }),
  origin: z.string().min(1, { message: 'Origin is required.' }),
  destination: z.string().min(1, { message: 'Destination is required.' }),
  vehicleId: z.string().optional(),
});

export function NewTripForm() {
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      origin: '',
      destination: '',
      vehicleId: 'auto',
    },
  });

  const handlePhoneSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const phone = form.getValues('customerPhone');
      const customer = customers.find((c) => c.phone === phone);
      
      setFoundCustomer(customer || null);

      if (customer) {
        form.clearErrors('customerPhone');
        alert(`Customer Found: ${customer.name}. From here we could open their trip history.`);
      } else {
        form.setError('customerPhone', { type: 'manual', message: 'Customer not found.' });
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!foundCustomer) {
      form.setError('customerPhone', {
        type: 'manual',
        message: 'Please find a valid customer before creating a trip.',
      });
      return;
    }

    const submissionData = {
      ...values,
      customer: foundCustomer,
    };
    console.log(submissionData);
    alert(`New trip created for ${foundCustomer.name}! Check the console for details.`);
    form.reset();
    setFoundCustomer(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Phone</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter phone and press Enter"
                    {...field}
                    className="pl-10"
                    onKeyDown={handlePhoneSearch}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {foundCustomer && (
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{foundCustomer.name}</p>
              {foundCustomer.isVip && (
                <Badge variant="secondary">
                  <Star className="mr-1.5 h-3 w-3" />
                  VIP
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{foundCustomer.phone}</p>
          </Card>
        )}

        <FormField
          control={form.control}
          name="origin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin</FormLabel>
              <FormControl>
                <div className="relative">
                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Enter pickup location" {...field} className="pl-10" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                 <div className="relative">
                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Enter drop-off location" {...field} className="pl-10" />
                 </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Vehicle (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Auto-assign nearest vehicle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="auto">Auto-assign nearest vehicle</SelectItem>
                  {vehicles
                    .filter((v) => v.status === 'Available')
                    .map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" className="w-full">Create Trip</Button>
        </div>
      </form>
    </Form>
  );
}
