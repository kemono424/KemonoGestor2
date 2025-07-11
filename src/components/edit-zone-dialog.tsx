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
import type { ZoneDefinition } from '@/types';
import { useEffect, useState, type FormEvent } from 'react';

interface EditZoneDialogProps {
  zone: Partial<ZoneDefinition> | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (name: string, color: string) => void;
}

export function EditZoneDialog({
  zone,
  isOpen,
  onOpenChange,
  onSave,
}: EditZoneDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setName(zone?.name || '');
      setColor(zone?.color || `#${Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0')}`);
    }
  }, [isOpen, zone]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), color);
      onOpenChange(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{zone?.id ? 'Editar Zona' : 'Crear Nueva Zona'}</DialogTitle>
            <DialogDescription>
              Establece el nombre y el color para esta zona operativa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zone-name">Nombre de la Zona</Label>
              <Input
                id="zone-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="p. ej., Centro de Alto Tráfico"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-color">Color de la Zona</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="zone-color"
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="p-1 h-10 w-14"
                />
                <Input
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Zona</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
