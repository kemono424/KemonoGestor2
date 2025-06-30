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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { customers, vehicles, zones as mockZones } from '@/lib/mock-data';
import type { Customer, Trip, Zone, Vehicle } from '@/types';
import { MapPin, User } from 'lucide-react';
import { CustomerTripHistoryDialog } from './customer-trip-history-dialog';
import { isPointInPolygon, calculateDistanceSquared } from '@/lib/geo-utils';

const formSchema = z.object({
  customerPhone: z.string().min(1, { message: 'Customer phone is required.' }),
  origin: z.string().min(1, { message: 'Origin is required.' }),
  destination: z.string().min(1, { message: 'Destination is required.' }),
  inTray: z.boolean().default(false).optional(),
});

export function NewTripForm() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      origin: '',
      destination: '',
      inTray: false,
    },
  });

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

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValue('customerPhone', customer.phone);
    form.clearErrors('customerPhone');
    setSearchResults([]);
    setIsHistoryOpen(true);
  };

  const handleTripSelect = (trip: Trip) => {
    form.setValue('origin', trip.origin);
    form.setValue('destination', trip.destination);
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

    if (values.inTray) {
      console.log('Trip sent to tray:', { ...values, customer: selectedCustomer });
      alert(`Trip for ${selectedCustomer.name} sent to assignment tray.`);
      form.reset();
      setSelectedCustomer(null);
      return;
    }

    // --- Automatic Assignment Logic ---

    // 1. Mock Geocoding for trip origin. In a real app, this would use a geocoding API.
    // We'll use a point that falls inside the "Centro" mock zone for demonstration.
    const originCoords: [number, number] = [-65.41, -24.79];

    // 2. Load zones (from localStorage or fall back to mock data)
    let allZones: Zone[] = mockZones;
    if (typeof window !== 'undefined') {
      try {
        const savedZones = localStorage.getItem('fleet-manager-zones');
        if (savedZones) {
          allZones = JSON.parse(savedZones);
        }
      } catch (error) {
        console.error(
          'Could not load zones from localStorage, using mock data.',
          error
        );
      }
    }

    // 3. Find which zone the origin is in.
    const targetZone = allZones.find(zone =>
      isPointInPolygon(originCoords, zone.geometry)
    );

    if (!targetZone) {
      alert(
        'Could not find a zone for the trip origin. Please create a zone that covers the area or send the trip to the manual assignment tray.'
      );
      return;
    }

    // 4. Find available vehicles within that zone.
    const availableVehicles = vehicles.filter(
      v => v.status === 'Available' && v.latitude && v.longitude
    );
    const vehiclesInZone = availableVehicles.filter(v =>
      isPointInPolygon([v.longitude!, v.latitude!], targetZone.geometry)
    );

    if (vehiclesInZone.length === 0) {
      alert(
        `No available vehicles found in the "${targetZone.name}" zone. Sending trip to the manual assignment tray.`
      );
      console.log('Trip sent to tray (no vehicles in zone):', {
        ...values,
        customer: selectedCustomer,
      });
      form.reset();
      setSelectedCustomer(null);
      return;
    }

    // 5. Find the closest vehicle in the zone.
    let closestVehicle: Vehicle | null = null;
    let minDistance = Infinity;

    for (const vehicle of vehiclesInZone) {
      const distance = calculateDistanceSquared(originCoords, [
        vehicle.longitude!,
        vehicle.latitude!,
      ]);
      if (distance < minDistance) {
        minDistance = distance;
        closestVehicle = vehicle;
      }
    }

    // 6. Assign the trip and notify.
    const message = `New trip created for ${
      selectedCustomer.name
    }! Auto-assigned to ${closestVehicle!.name} (${
      closestVehicle!.unitNumber
    }) in the "${targetZone.name}" zone.`;
    alert(message);

    console.log('Trip auto-assigned:', {
      ...values,
      customer: selectedCustomer,
      assignedVehicle: closestVehicle,
      zone: targetZone,
    });

    form.reset();
    setSelectedCustomer(null);
  }

  return (
    <>
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
                      placeholder="Search by phone (e.g. 555-0101)"
                      {...field}
                      onChange={handlePhoneSearch}
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
              <div className="flex items-center justify-between">
                <p className="font-semibold">{selectedCustomer.name}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedCustomer.phone}
              </p>
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
                    <Input
                      placeholder="Enter pickup location"
                      {...field}
                      className="pl-10"
                    />
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
                    <Input
                      placeholder="Enter drop-off location"
                      {...field}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    If unchecked, the system will try to auto-assign a vehicle by
                    zone.
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
