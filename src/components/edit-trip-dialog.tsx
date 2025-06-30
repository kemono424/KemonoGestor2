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
import { Textarea } from './ui/textarea';

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
        title: 'Viaje Actualizado',
        description: `El viaje #${currentTrip.id} ha sido actualizado exitosamente.`,
      });
    }
  };

  if (!isOpen || !currentTrip) return null;

  const handleStatusChange = (newStatus: 'automatic' | 'manual') => {
    setCurrentTrip(prev => {
      if (!prev) return null;
      let status: TripStatus = prev.status;
      if (newStatus === 'manual') {
        status = 'En Bandeja';
      } else {
        // Revert to a sensible automatic status
        status = prev.scheduledTime ? 'Programado' : 'Asignado';
      }
      return { ...prev, status };
    });
  };

  const isManual = currentTrip.status === 'En Bandeja';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Editar Viaje #{trip?.id}</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del viaje y el estado de asignación.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Modo de Asignación</Label>
              <RadioGroup
                value={isManual ? 'manual' : 'automatic'}
                onValueChange={handleStatusChange as (value: string) => void}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="automatic" id="r1" />
                  <Label htmlFor="r1">Asignación Automática</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="r2" />
                  <Label htmlFor="r2">Manual (Enviar a Bandeja)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="origin">Origen</Label>
                <Input id="origin" value={currentTrip.origin} onChange={(e) => setCurrentTrip({...currentTrip, origin: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Input id="destination" value={currentTrip.destination} onChange={(e) => setCurrentTrip({...currentTrip, destination: e.target.value})} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Información Adicional</Label>
                <Textarea 
                    id="notes" 
                    value={currentTrip.notes || ''} 
                    onChange={(e) => setCurrentTrip({...currentTrip, notes: e.target.value})}
                    placeholder="p. ej., portón verde, llamar al llegar..."
                />
            </div>

             {currentTrip.status === 'Programado' && (
                <div className="space-y-2">
                    <Label>Hora Programada</Label>
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
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
