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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Vehicle, VehicleStatus } from '@/types';
import { useEffect, useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EditVehicleDialogProps {
  vehicle: Partial<Vehicle> | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (vehicle: Vehicle) => void;
}

const vehicleStatuses: VehicleStatus[] = [
  'Libre',
  'En descanso',
  'Ocupado',
  'En camino',
  'En espera',
  'Mantenimiento',
  'Fuera de servicio',
];

export function EditVehicleDialog({
  vehicle,
  isOpen,
  onOpenChange,
  onSave,
}: EditVehicleDialogProps) {
  const [editableVehicle, setEditableVehicle] =
    useState<Partial<Vehicle> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (vehicle) {
        setEditableVehicle(vehicle);
      } else {
        setEditableVehicle({ status: 'Fuera de servicio' });
      }
    }
  }, [isOpen, vehicle]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (editableVehicle) {
      if (
        !editableVehicle.name ||
        !editableVehicle.unitNumber ||
        !editableVehicle.licensePlate ||
        !editableVehicle.operator ||
        !editableVehicle.model ||
        !editableVehicle.color
      ) {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description: 'Please fill out all required fields.',
        });
        return;
      }

      const vehicleToSave: Vehicle = {
        id: editableVehicle.id || '',
        name: editableVehicle.name,
        unitNumber: editableVehicle.unitNumber,
        licensePlate: editableVehicle.licensePlate,
        operator: editableVehicle.operator,
        status: editableVehicle.status || 'Fuera de servicio',
        insuranceDueDate: editableVehicle.insuranceDueDate,
        model: editableVehicle.model,
        color: editableVehicle.color,
        lastMaintenance:
          editableVehicle.lastMaintenance || new Date().toISOString(),
      };

      onSave(vehicleToSave);
    }
  };

  const handleValueChange = <K extends keyof Vehicle>(
    key: K,
    value: Vehicle[K]
  ) => {
    setEditableVehicle((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  if (!isOpen || !editableVehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>
              {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
            <DialogDescription>
              {vehicle
                ? 'Update the vehicle details below.'
                : 'Enter the details for the new vehicle.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input
                id="unitNumber"
                value={editableVehicle.unitNumber || ''}
                onChange={(e) => handleValueChange('unitNumber', e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Vehicle Name</Label>
              <Input
                id="name"
                value={editableVehicle.name || ''}
                onChange={(e) => handleValueChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                value={editableVehicle.licensePlate || ''}
                onChange={(e) =>
                  handleValueChange('licensePlate', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator">Operator</Label>
              <Input
                id="operator"
                value={editableVehicle.operator || ''}
                onChange={(e) => handleValueChange('operator', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={editableVehicle.model || ''}
                onChange={(e) => handleValueChange('model', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={editableVehicle.color || ''}
                onChange={(e) => handleValueChange('color', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editableVehicle.status}
                onValueChange={(value: VehicleStatus) =>
                  handleValueChange('status', value)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceDueDate">Insurance Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="insuranceDueDate"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !editableVehicle.insuranceDueDate &&
                        'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editableVehicle.insuranceDueDate ? (
                      format(new Date(editableVehicle.insuranceDueDate), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      editableVehicle.insuranceDueDate
                        ? new Date(editableVehicle.insuranceDueDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      handleValueChange('insuranceDueDate', date?.toISOString())
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Vehicle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}