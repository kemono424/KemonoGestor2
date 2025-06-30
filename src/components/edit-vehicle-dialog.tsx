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

interface EditVehicleDialogProps {
  vehicle: Partial<Vehicle> | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (vehicle: Partial<Vehicle>) => void;
}

const adminSelectableStatuses: { label: string; value: VehicleStatus }[] = [
  { label: 'Habilitado', value: 'En descanso' },
  { label: 'Bloqueado (Fuera de servicio)', value: 'Fuera de servicio' },
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
        !editableVehicle.color ||
        !editableVehicle.username ||
        !editableVehicle.password
      ) {
        toast({
          variant: 'destructive',
          title: 'Información Faltante',
          description: 'Por favor, completa todos los campos requeridos.',
        });
        return;
      }
      onSave(editableVehicle);
    }
  };

  const handleValueChange = <K extends keyof Vehicle>(
    key: K,
    value: Vehicle[K]
  ) => {
    setEditableVehicle((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  if (!isOpen || !editableVehicle) return null;

  // Determine what value the Select should show. If the status is anything
  // other than 'Fuera de servicio', it's considered 'Habilitado' (Enabled).
  const currentStatus = editableVehicle.status;
  let selectValue: VehicleStatus = 'En descanso'; // Default to 'Habilitado'
  if (currentStatus === 'Fuera de servicio') {
      selectValue = currentStatus;
  }
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>
              {vehicle ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}
            </DialogTitle>
            <DialogDescription>
              {vehicle
                ? 'Actualiza los detalles del vehículo a continuación.'
                : 'Introduce los detalles del nuevo vehículo.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="unitNumber">Número de Unidad</Label>
              <Input
                id="unitNumber"
                value={editableVehicle.unitNumber || ''}
                onChange={(e) => handleValueChange('unitNumber', e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Vehículo</Label>
              <Input
                id="name"
                value={editableVehicle.name || ''}
                onChange={(e) => handleValueChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Matrícula</Label>
              <Input
                id="licensePlate"
                value={editableVehicle.licensePlate || ''}
                onChange={(e) =>
                  handleValueChange('licensePlate', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator">Operador</Label>
              <Input
                id="operator"
                value={editableVehicle.operator || ''}
                onChange={(e) => handleValueChange('operator', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
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
            <div className="space-y-2 col-span-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={selectValue}
                onValueChange={(value: VehicleStatus) =>
                  handleValueChange('status', value)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {adminSelectableStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                    id="username"
                    value={editableVehicle.username || ''}
                    onChange={(e) => handleValueChange('username', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                    id="password"
                    type="password"
                    value={editableVehicle.password || ''}
                    onChange={(e) => handleValueChange('password', e.target.value)}
                />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Vehículo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
