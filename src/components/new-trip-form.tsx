
'use client';

import { useState, type ChangeEvent, type KeyboardEvent, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { customers } from '@/lib/mock-data';
import type { Customer, Trip } from '@/types';
import { MapPin, User } from 'lucide-react';
import { CustomerTripHistoryDialog } from './customer-trip-history-dialog';
import { DateTimePicker } from './date-time-picker';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { addDays } from 'date-fns';

const formSchema = z.object({
  customerPhone: z.string().min(1, { message: 'Customer phone is required.' }),
  origin: z.string().min(1, { message: 'Origin is required.' }),
  destination: z.string().optional(),
  inTray: z.boolean().default(false).optional(),
  isScheduled: z.boolean().default(false),
  scheduledTime: z.date().optional(),
  isRecurring: z.boolean().default(false),
  recurringDays: z.coerce.number().min(1).optional(),
});

export function NewTripForm() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // State for geocoding
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>(
    []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      origin: '',
      destination: '',
      inTray: false,
      isScheduled: false,
      scheduledTime: new Date(),
      isRecurring: false,
      recurringDays: 5,
    },
  });

  const searchAddresses = async (
    query: string,
    setSuggestions: (suggestions: any[]) => void
  ) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }&autocomplete=true&country=AR&proximity=-65.4117,-24.7859`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Error fetching geocoding data:', error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      searchAddresses(originQuery, setOriginSuggestions);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [originQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      searchAddresses(destinationQuery, setDestinationSuggestions);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [destinationQuery]);

  const handleSelectOrigin = (suggestion: any) => {
    const placeName = suggestion.place_name;
    form.setValue('origin', placeName, { shouldValidate: true });
    setOriginQuery(placeName);
    setOriginSuggestions([]);
  };

  const handleSelectDestination = (suggestion: any) => {
    const placeName = suggestion.place_name;
    form.setValue('destination', placeName, { shouldValidate: true });
    setDestinationQuery(placeName);
    setDestinationSuggestions([]);
  };

  const handlePhoneSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    form.setValue('customerPhone', query);
    const sanitizedQuery = query.replace(/[^0-9]/g, '');
    if (sanitizedQuery.length >= 3) {
      const results = customers.filter(c =>
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

  const handlePhoneKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length === 1) {
      e.preventDefault();
      handleCustomerSelect(searchResults[0]);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValue('customerPhone', customer.phone);
    form.clearErrors('customerPhone');
    setSearchResults([]);
    setIsHistoryOpen(true);
  };

  const handleTripSelect = (trip: Trip) => {
    form.setValue('origin', trip.origin);
    setOriginQuery(trip.origin); // Sync query state
    form.setValue('destination', trip.destination);
    setDestinationQuery(trip.destination || ''); // Sync query state
    setIsHistoryOpen(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedCustomer) {
      form.setError('customerPhone', {
        type: 'manual',
        message: 'Please select a customer from the search results.',
      });
      return;
    }

    if (values.isRecurring && values.recurringDays) {
      const tripsToCreate = [];
      for (let i = 0; i < values.recurringDays; i++) {
        const scheduledTime = addDays(values.scheduledTime || new Date(), i);
        tripsToCreate.push({
          ...values,
          scheduledTime,
          status: 'Scheduled',
          isRecurring: false, // Avoid infinite loops in a real scenario
        });
      }
      alert(
        `${values.recurringDays} recurring trips created for ${selectedCustomer.name}!`
      );
      console.log('Recurring trips to create:', tripsToCreate);
    } else {
      alert(`Trip for ${selectedCustomer.name} created!`);
      console.log('New trip details:', {
        ...values,
        status: values.isScheduled
          ? 'Scheduled'
          : values.inTray
          ? 'In Tray'
          : 'Assigned', // Simplified logic
        customer: selectedCustomer,
      });
    }

    form.reset();
    setOriginQuery('');
    setDestinationQuery('');
    setSelectedCustomer(null);
  }

  const isScheduled = form.watch('isScheduled');
  const isRecurring = form.watch('isRecurring');

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Search and Selection */}
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
                      placeholder="Search by phone and press Enter"
                      {...field}
                      onChange={handlePhoneSearch}
                      onKeyDown={handlePhoneKeyDown}
                      autoComplete="off"
                      className="pl-10"
                    />
                    {searchResults.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 border shadow-lg">
                        <ul className="py-1">
                          {searchResults.map(customer => (
                            <li
                              key={customer.id}
                              className="px-3 py-2 cursor-pointer hover:bg-muted"
                              onClick={() => handleCustomerSelect(customer)}
                              role="button"
                            >
                              <p className="font-semibold">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {customer.phone}
                              </p>
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
              <p className="font-semibold">{selectedCustomer.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedCustomer.phone}
              </p>
            </Card>
          )}

          {/* Trip Details */}
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter pickup location"
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        setOriginQuery(e.target.value);
                      }}
                      autoComplete="off"
                      className="pl-10"
                    />
                    {originSuggestions.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 border shadow-lg">
                        <ul className="py-1 max-h-48 overflow-y-auto">
                          {originSuggestions.map(s => (
                            <li
                              key={s.id}
                              className="px-3 py-2 cursor-pointer hover:bg-muted"
                              onClick={() => handleSelectOrigin(s)}
                            >
                              <p className="font-semibold text-sm">
                                {s.place_name}
                              </p>
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
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter drop-off location"
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        setDestinationQuery(e.target.value);
                      }}
                      autoComplete="off"
                      className="pl-10"
                    />
                    {destinationSuggestions.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 border shadow-lg">
                        <ul className="py-1 max-h-48 overflow-y-auto">
                          {destinationSuggestions.map(s => (
                            <li
                              key={s.id}
                              className="px-3 py-2 cursor-pointer hover:bg-muted"
                              onClick={() => handleSelectDestination(s)}
                            >
                              <p className="font-semibold text-sm">
                                {s.place_name}
                              </p>
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

          {/* Scheduling Options */}
          <Card className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="isScheduled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <FormLabel>Schedule for later?</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isScheduled && (
              <>
                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Scheduled Date & Time</FormLabel>
                      <DateTimePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>Repeat this trip?</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isRecurring && (
                  <FormField
                    control={form.control}
                    name="recurringDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repeat for how many days?</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Create this trip for the next {field.value || 0} days.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </Card>

          <FormField
            control={form.control}
            name="inTray"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/20">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="in-tray"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="in-tray">
                    Send to Manual Assignment Tray
                  </FormLabel>
                  <FormDescription>
                    If unchecked, the system will try to auto-assign a vehicle.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" className="w-full">
              Create Trip
            </Button>
          </div>
        </form>
      </Form>
      {selectedCustomer && (
        <CustomerTripHistoryDialog
          customer={selectedCustomer}
          isOpen={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          onTripSelect={handleTripSelect}
        />
      )}
    </>
  );
}
