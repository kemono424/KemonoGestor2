'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import type { Operator, UserRole } from '@/types';
import { getOperators } from '@/lib/mock-data';
import { updateOperator } from '@/lib/actions';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  currentUser: Operator | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  setCurrentUserRole: (role: UserRole) => void;
  updateCurrentUser: (updatedData: Partial<Operator>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Operator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        setIsLoading(true);
        if (firebaseUser) {
          try {
            const allOperators = await getOperators();
            const userEmail = firebaseUser.email || '';
            const [localPart] = userEmail.split('@');

            const userProfile = allOperators.find(
              (op) => op.username === userEmail || op.username === localPart
            );

            if (userProfile) {
              setCurrentUser({ ...userProfile, avatarUrl: firebaseUser.photoURL || userProfile.avatarUrl });
            } else {
              toast({
                variant: 'destructive',
                title: 'Perfil no encontrado',
                description: `No se encontró un perfil de operador para ${userEmail}. Contacta al administrador.`,
              });
              await signOut(auth);
              setCurrentUser(null);
            }
          } catch (error) {
            console.error('Failed to fetch operator profile', error);
            toast({
              variant: 'destructive',
              title: 'Error al Cargar Perfil',
              description: 'No se pudo cargar la información del operador.',
            });
            await signOut(auth);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const updateCurrentUser = async (updatedData: Partial<Operator>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedData };
      const result = await updateOperator(updatedUser);
      if (result.success) {
        setCurrentUser(updatedUser);
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user and loading state
      return true;
    } catch (error: any) {
      let message = 'Ocurrió un error inesperado.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        message = 'Correo electrónico o contraseña incorrectos.';
      }
      toast({
        variant: 'destructive',
        title: 'Error de Inicio de Sesión',
        description: message,
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al Cerrar Sesión',
        description: 'No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.',
      });
    }
  };

  const setCurrentUserRole = (role: UserRole) => {
    if (currentUser?.role === 'Admin') {
      updateCurrentUser({ role });
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isLoading,
        setCurrentUserRole,
        updateCurrentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
