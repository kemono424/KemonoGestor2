'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      origin: '',
      destination: '',
      vehicleId: 'auto',
    },
  });

  const handlePhoneSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    form.setValue('customerPhone', query);

    const sanitizedQuery = query.replace(/[^0-9]/g, '');

    if (sanitizedQuery.length >= 3) {
      const results = customers.filter((c) =>
        c.phone.replace(/[^0-9]/g, '').includes(sanitizedQuery)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
    
    if (selectedCustomer) {
        setSelectedCustomer(null);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValue('customerPhone', customer.phone);
    form.clearErrors('customerPhone');
    setSearchResults([]);
    alert(`Customer Selected: ${customer.name}. From here we could open their trip history.`);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedCustomer) {
      form.setError('customerPhone', {
        type: 'manual',
        message: 'Please select a customer from the search results.',
      });
      return;
    }

    const submissionData = {
      ...values,
      customer: selectedCustomer,
    };
    console.log(submissionData);
    alert(`New trip created for ${selectedCustomer.name}! Check the console for details.`);
    form.reset();
    setSelectedCustomer(null);
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
                    placeholder="Search by phone (3+ digits)..."
                    {...field}
                    onChange={handlePhoneSearch}
                    autoComplete="off"
                    className="pl-10"
                  />
                   {searchResults.length > 0 && (
                    <Card className="absolute z-10 w-full mt-1 border shadow-lg">
                      <ul className="py-1">
                        {searchResults.map((customer) => (
                          <li
                            key={customer.id}
                            className="px-3 py-2 cursor-pointer hover:bg-muted"
                            onClick={() => handleCustomerSelect(customer)}
                            role="button"
                          >
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedCustomer && (
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{selectedCustomer.name}</p>
              {selectedCustomer.isVip && (
                <Badge variant="secondary">
                  <Star className="mr-1.5 h-3 w-3" />
                  VIP
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
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
