
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
import { ArrowRight, History, MapPin } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from './ui/separator';


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
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const filteredTrips = useMemo(() => {
    const sanitizedQuery = phoneQuery.replace(/[^0-9]/g, '');
    if (!sanitizedQuery) return [];
    return recentTrips.filter(trip =>
      trip.customer.phone.replace(/[^0-9]/g, '').includes(sanitizedQuery)
    );
  }, [phoneQuery]);

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTripId(trip.id);
    onTripSelect(trip);
    setActiveCustomer(trip.customer);
  };

  const handleBack = () => {
    setSelectedTripId(null);
    onBackClick();
    setActiveCustomer(null);
  };
  
  useEffect(() => {
    if (!isOpen) {
      setActiveCustomer(null);
      setSelectedTripId(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Customer & Trip History</DialogTitle>
          <DialogDescription>
            Search for a customer by phone to view their past trips. Select one to auto-fill the form.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Left Panel: Trip List */}
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-lg font-semibold shrink-0">Matching Trips ({filteredTrips.length})</h3>
            <ScrollArea className="h-full pr-4 -mr-4">
              <div className="space-y-2">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map(trip => (
                    <button
                      key={trip.id}
                      className={cn(
                        "w-full p-3 border rounded-lg text-left transition-colors",
                        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                        selectedTripId === trip.id ? "bg-muted border-primary shadow-sm" : "border-transparent"
                      )}
                      onClick={() => handleSelectTrip(trip)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold truncate">{trip.customer.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(trip.requestTime), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                            <span className="truncate">{trip.origin}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">
                      No past trips found for "{phoneQuery}".
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          {/* Right Panel: Customer Details */}
          <div className="h-full flex flex-col">
            {activeCustomer ? (
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>{activeCustomer.name}</CardTitle>
                        <CardDescription>{activeCustomer.phone}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Financial Status</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Pending Debt</span>
                                <Badge variant={activeCustomer.pendingDebt > 0 ? 'destructive' : 'secondary'}>
                                    ${activeCustomer.pendingDebt.toFixed(2)}
                                </Badge>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Notes</h4>
                            <p className="text-sm text-muted-foreground">
                                Customer-specific notes, preferences, or alerts would appear here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/30 rounded-lg">
                    <History className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">Select a Past Trip</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Click on a trip from the list to view customer details and reuse the trip information for a new service.
                    </p>
                </div>
            )}
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
            {activeCustomer && (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            )}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="ml-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

