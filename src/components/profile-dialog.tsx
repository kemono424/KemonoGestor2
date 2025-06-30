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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Operator } from '@/types';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { Upload } from 'lucide-react';

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onProfileUpdate: (updatedUser: Operator) => void;
}

export function ProfileDialog({
  isOpen,
  onOpenChange,
  onProfileUpdate,
}: ProfileDialogProps) {
  const { currentUser } = useAppContext();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.avatarUrl) {
      setPreviewImage(currentUser.avatarUrl);
    } else {
      setPreviewImage(null);
    }
  }, [currentUser, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast({
          variant: 'destructive',
          title: 'Archivo demasiado grande',
          description: 'Por favor, selecciona una imagen de menos de 2MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (currentUser) {
      const updatedUser: Operator = {
        ...currentUser,
        avatarUrl: previewImage || undefined,
      };
      onProfileUpdate(updatedUser);
      toast({
        title: 'Perfil Actualizado',
        description: 'Tu foto de perfil ha sido actualizada.',
      });
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu foto de perfil aquí.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={previewImage || undefined} alt="Avatar Preview" />
            <AvatarFallback className="text-3xl">
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Imagen
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileChange}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
