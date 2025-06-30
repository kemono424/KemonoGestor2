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
import type { Operator } from '@/types';
import { useEffect, useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EditOperatorDialogProps {
  operator: Partial<Operator> | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (operator: Partial<Operator>) => void;
}

export function EditOperatorDialog({
  operator,
  isOpen,
  onOpenChange,
  onSave,
}: EditOperatorDialogProps) {
  const [editableOperator, setEditableOperator] =
    useState<Partial<Operator>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setEditableOperator(operator || {});
    }
  }, [isOpen, operator]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (
      !editableOperator.id ||
      !editableOperator.name ||
      !editableOperator.username ||
      !editableOperator.password
    ) {
      toast({
        variant: 'destructive',
        title: 'Información Faltante',
        description: 'Por favor, completa todos los campos.',
      });
      return;
    }
    onSave(editableOperator);
  };

  const handleValueChange = <K extends keyof Operator>(
    key: K,
    value: Operator[K]
  ) => {
    setEditableOperator((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const isNew = !operator;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>
              {operator ? 'Editar Operador' : 'Añadir Nuevo Operador'}
            </DialogTitle>
            <DialogDescription>
              {operator
                ? 'Actualiza los detalles del operador a continuación.'
                : 'Introduce los detalles del nuevo operador.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operator-id">Nº de Operador</Label>
              <Input
                id="operator-id"
                value={editableOperator.id || ''}
                onChange={(e) => handleValueChange('id', e.target.value)}
                autoFocus
                disabled={!isNew}
                placeholder="e.g., O006"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={editableOperator.name || ''}
                onChange={(e) => handleValueChange('name', e.target.value)}
              />
            </div>
             <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                    id="username"
                    value={editableOperator.username || ''}
                    onChange={(e) => handleValueChange('username', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                    id="password"
                    type="password"
                    value={editableOperator.password || ''}
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
            <Button type="submit">Guardar Operador</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
