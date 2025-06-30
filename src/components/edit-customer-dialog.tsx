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
import { Textarea } from '@/components/ui/textarea';
import type { Customer } from '@/types';
import { useEffect, useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EditCustomerDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedCustomer: Customer) => void;
}

export function EditCustomerDialog({
  customer,
  isOpen,
  onOpenChange,
  onSave,
}: EditCustomerDialogProps) {
  const [editableCustomer, setEditableCustomer] = useState<Customer | null>(
    customer
  );
  const { toast } = useToast();

  useEffect(() => {
    setEditableCustomer(customer);
  }, [customer]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (editableCustomer) {
      onSave(editableCustomer);
      toast({
        title: 'Customer Updated',
        description: `Information for ${editableCustomer.name} has been saved.`,
      });
      onOpenChange(false);
    }
  };

  if (!isOpen || !editableCustomer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Edit Customer: {customer?.name}</DialogTitle>
            <DialogDescription>
              Update the customer's information below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Name</Label>
              <Input
                id="customer-name"
                value={editableCustomer.name}
                onChange={(e) =>
                  setEditableCustomer({ ...editableCustomer, name: e.target.value })
                }
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                value={editableCustomer.phone}
                onChange={(e) =>
                  setEditableCustomer({ ...editableCustomer, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-debt">Pending Debt ($)</Label>
              <Input
                id="customer-debt"
                type="number"
                step="0.01"
                value={editableCustomer.pendingDebt}
                onChange={(e) =>
                  setEditableCustomer({
                    ...editableCustomer,
                    pendingDebt: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-notes">Notes for Driver</Label>
              <Textarea
                id="customer-notes"
                value={editableCustomer.notes || ''}
                onChange={(e) =>
                  setEditableCustomer({ ...editableCustomer, notes: e.target.value })
                }
                placeholder="e.g., Prefers quiet rides, has a pet..."
              />
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
