
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Trip, TripStatus } from '@/types';
import { useEffect, useState, type FormEvent } from 'react';
import { Input } from './ui/input';
import { DateTimePicker } from './date-time-picker';
import { useToast } from '@/hooks/use-toast';

interface EditTripDialogProps {
  trip: Trip | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedTrip: Trip) => void;
}

export function EditTripDialog({
  trip,
  isOpen,
  onOpenChange,
  onSave,
}: EditTripDialogProps) {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(trip);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentTrip(trip);
  }, [trip]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (currentTrip) {
      onSave(currentTrip);
      toast({
        title: 'Trip Updated',
        description: `Trip #${currentTrip.id} has been successfully updated.`,
      });
    }
  };

  if (!isOpen || !currentTrip) return null;

  const handleStatusChange = (newStatus: 'automatic' | 'manual') => {
    setCurrentTrip(prev => {
      if (!prev) return null;
      let status: TripStatus = prev.status;
      if (newStatus === 'manual') {
        status = 'In Tray';
      } else {
        // Revert to a sensible automatic status
        status = prev.scheduledTime ? 'Scheduled' : 'Assigned';
      }
      return { ...prev, status };
    });
  };

  const isManual = currentTrip.status === 'In Tray';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Edit Trip #{trip?.id}</DialogTitle>
            <DialogDescription>
              Update trip details and assignment status.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Assignment Mode</Label>
              <RadioGroup
                value={isManual ? 'manual' : 'automatic'}
                onValueChange={handleStatusChange as (value: string) => void}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="automatic" id="r1" />
                  <Label htmlFor="r1">Automatic Assignment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="r2" />
                  <Label htmlFor="r2">Manual (Send to Tray)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" value={currentTrip.origin} onChange={(e) => setCurrentTrip({...currentTrip, origin: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={currentTrip.destination} onChange={(e) => setCurrentTrip({...currentTrip, destination: e.target.value})} />
            </div>

             {currentTrip.status === 'Scheduled' && (
                <div className="space-y-2">
                    <Label>Scheduled Time</Label>
                    <DateTimePicker 
                        date={currentTrip.scheduledTime ? new Date(currentTrip.scheduledTime) : new Date()}
                        setDate={(newDate) => setCurrentTrip({...currentTrip, scheduledTime: newDate?.toISOString() || null})}
                    />
                </div>
             )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
