'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { recentTrips } from '@/lib/mock-data';
import type { Customer, Trip } from '@/types';
import { MapPin, ArrowRight } from 'lucide-react';

interface CustomerTripHistoryDialogProps {
  customer: Customer;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTripSelect: (trip: Trip) => void;
}

export function CustomerTripHistoryDialog({
  customer,
  isOpen,
  onOpenChange,
  onTripSelect,
}: CustomerTripHistoryDialogProps) {
  const customerTrips = recentTrips.filter(
    (trip) => trip.customer.id === customer.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trip History: {customer.name}</DialogTitle>
          <DialogDescription>
            Select a past trip to auto-fill the origin and destination.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {customerTrips.length > 0 ? (
            <ScrollArea className="h-72 pr-6">
              <div className="space-y-2">
                {customerTrips.map((trip) => (
                  <button
                    key={trip.id}
                    className="w-full p-3 border rounded-lg cursor-pointer text-left hover:bg-muted transition-colors"
                    onClick={() => onTripSelect(trip)}
                  >
                    <div className="flex items-center text-sm font-medium">
                      <MapPin className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate" title={trip.origin}>{trip.origin}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium pl-6">
                      <ArrowRight className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                       <span className="truncate" title={trip.destination}>{trip.destination}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-48">
                <p className="text-center text-muted-foreground">
                No trip history found.
                </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
