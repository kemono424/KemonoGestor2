'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NewTripForm } from './new-trip-form';

export function NewTripSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create a New Trip</SheetTitle>
          <SheetDescription>
            Facilitate trip creation. The system can auto-assign the nearest vehicle.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8">
          <NewTripForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
