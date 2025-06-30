'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { recentTrips } from '@/lib/mock-data';
import type { Customer, Trip } from '@/types';
import { ArrowRight, MapPin } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface CustomerTripHistoryDialogProps {
  phoneQuery: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTripSelect: (trip: Trip) => void;
  onBackClick: () => void;
}

export function CustomerTripHistoryDialog({
  phoneQuery,
  isOpen,
  onOpenChange,
  onTripSelect,
  onBackClick,
}: CustomerTripHistoryDialogProps) {
  // This state is internal to the dialog and controls the right-side panel
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Filter trips based on the phone number query from the parent form
  const filteredTrips = useMemo(() => {
    const sanitizedQuery = phoneQuery.replace(/[^0-9]/g, '');
    if (!sanitizedQuery) return [];
    return recentTrips.filter(trip =>
      trip.customer.phone.replace(/[^0-9]/g, '').includes(sanitizedQuery)
    );
  }, [phoneQuery]);

  // When a trip is selected from the list
  const handleSelectTrip = (trip: Trip) => {
    onTripSelect(trip); // Tell the parent form to clone the trip data
    setActiveCustomer(trip.customer); // Show this customer's details in the right panel
  };

  // When the "Back" button is clicked
  const handleBack = () => {
    onBackClick(); // Tell the parent form to clear the cloned data
    setActiveCustomer(null); // Clear the customer details panel
  };
  
  // When the dialog is opened or closed, we should reset its internal state
  // to ensure it doesn't show stale data from a previous interaction.
  useEffect(() => {
    if (!isOpen) {
      setActiveCustomer(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[70vh]">
        <DialogHeader>
          <DialogTitle>Customer & Trip History</DialogTitle>
          <DialogDescription>
            Select a past trip to auto-fill the form. Customer details will appear on the right.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(70vh-120px)]">
          {/* Left Panel: Trip List */}
          <div className="md:col-span-1 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-2 shrink-0">Matching Trips</h3>
            <ScrollArea className="h-full pr-4 border rounded-lg grow">
              <div className="p-2 space-y-2">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map(trip => (
                    <button
                      key={trip.id}
                      className="w-full p-3 border rounded-lg cursor-pointer text-left hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                      onClick={() => handleSelectTrip(trip)}
                    >
                      <div className="font-semibold">{trip.customer.name}</div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1.5 shrink-0" />
                        <span className="truncate">{trip.origin}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <ArrowRight className="h-3 w-3 mr-1.5 shrink-0" />
                        <span className="truncate">{trip.destination}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-muted-foreground p-4">
                      No trips found for "{phoneQuery}".
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          {/* Right Panel: Customer Details */}
          <div className="md:col-span-2 h-full flex flex-col">
             <h3 className="text-lg font-semibold mb-2 shrink-0">Customer Details</h3>
            <Card className="h-full grow flex flex-col">
              {activeCustomer ? (
                <>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{activeCustomer.name}</span>
                       {activeCustomer.pendingDebt > 0 && (
                          <Badge variant="destructive">
                            Debt: ${activeCustomer.pendingDebt.toFixed(2)}
                          </Badge>
                        )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground pt-1">{activeCustomer.phone}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Further customer details like address, notes, or stats could be displayed here.
                    </p>
                  </CardContent>
                </>
              ) : (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-center text-muted-foreground p-4">
                        Select a trip from the list to view customer details and clone the trip information.
                    </p>
                </div>
              )}
            </Card>
          </div>
        </div>
        <DialogFooter className="sm:justify-between pt-4">
          <div>
            {activeCustomer && (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
