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
  
  const isNew = !operator;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    let isInvalid = !editableOperator.name || !editableOperator.username;
    if (isNew) {
      isInvalid = isInvalid || !editableOperator.password;
    }

    if (isInvalid) {
      toast({
        variant: 'destructive',
        title: 'Información Faltante',
        description: 'Por favor, completa nombre, usuario y contraseña (si es nuevo).',
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>
              {isNew ? 'Añadir Nuevo Operador' : 'Editar Operador'}
            </DialogTitle>
            <DialogDescription>
              {isNew
                ? 'Introduce los detalles del nuevo operador.'
                : 'Actualiza los detalles del operador a continuación.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={editableOperator.name || ''}
                onChange={(e) => handleValueChange('name', e.target.value)}
                autoFocus
              />
            </div>
             <div className="space-y-2">
                <Label htmlFor="username">Usuario (Correo Electrónico)</Label>
                <Input
                    id="username"
                    type="email"
                    value={editableOperator.username || ''}
                    onChange={(e) => handleValueChange('username', e.target.value)}
                    autoComplete="off"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder={isNew ? '' : 'Dejar en blanco para no cambiar'}
                    value={editableOperator.password || ''}
                    onChange={(e) => handleValueChange('password', e.target.value)}
                    autoComplete="new-password"
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
