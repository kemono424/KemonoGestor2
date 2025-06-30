
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
import type { Zone } from '@/types';
import { useEffect, useState, type FormEvent } from 'react';

interface EditZoneDialogProps {
  zone: Zone | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedZone: Zone) => void;
}

export function EditZoneDialog({
  zone,
  isOpen,
  onOpenChange,
  onSave,
}: EditZoneDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (zone) {
      setName(zone.name === 'New Zone' ? '' : zone.name);
      setColor(zone.color);
    }
  }, [zone]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (zone && name.trim()) {
      onSave({ ...zone, name, color });
    }
  };

  if (!zone) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>
              {zone.name === 'New Zone' ? 'Create New Zone' : 'Edit Zone'}
            </DialogTitle>
            <DialogDescription>
              {zone.name === 'New Zone'
                ? 'Set the name and color for the new zone.'
                : 'Change the name and color for this zone.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zone-name">Zone Name</Label>
              <Input
                id="zone-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Downtown"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-color">Zone Color</Label>
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
                  placeholder="#F44336"
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
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
