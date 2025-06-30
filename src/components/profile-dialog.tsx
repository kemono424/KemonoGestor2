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
import { getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

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
  const [isUploading, setIsUploading] = useState(false);
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
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
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

  const handleSave = async () => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!currentUser || !firebaseUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'No has iniciado sesión.' });
      return;
    }

    // Only upload if the image has changed
    if (previewImage && previewImage !== currentUser.avatarUrl) {
      setIsUploading(true);
      try {
        const storage = getStorage();
        const storageRef = ref(storage, `avatars/${firebaseUser.uid}`);
        
        // uploadString handles data URLs (which is what FileReader gives us)
        await uploadString(storageRef, previewImage, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);

        // Update Firebase Auth user profile
        await updateProfile(firebaseUser, { photoURL: downloadURL });

        // Update application state via context
        onProfileUpdate({ ...currentUser, avatarUrl: downloadURL });
        
        toast({
          title: 'Perfil Actualizado',
          description: 'Tu foto de perfil ha sido actualizada.',
        });

      } catch (error) {
        console.error("Error updating profile image: ", error);
        toast({ variant: 'destructive', title: 'Error al subir', description: 'No se pudo guardar la imagen.' });
      } finally {
        setIsUploading(false);
      }
    }
    
    onOpenChange(false);
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
            disabled={isUploading}
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
          <Button type="button" onClick={handleSave} disabled={isUploading}>
            {isUploading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
