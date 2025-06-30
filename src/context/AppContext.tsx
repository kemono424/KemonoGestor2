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

interface AppContextType {
  currentUser: Operator | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  setCurrentUserRole: (role: UserRole) => void;
  updateCurrentUser: (updatedData: Partial<Operator>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = 'fleet-manager-currentUser';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Operator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Verify user still exists in the "database"
          const allOperators = await getOperators();
          const userExists = allOperators.some((op) => op.id === parsedUser.id);
          
          if (userExists) {
            setCurrentUser(parsedUser);
          } else {
            // User was deleted, clear session
            sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to load user from session storage', error);
        sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
      setIsLoading(false);
    }
    checkUser();
  }, []);

  const updateCurrentUser = async (updatedData: Partial<Operator>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedData };
      
      // Call server action to persist changes
      await updateOperator(updatedUser);

      // Update local state and session storage
      setCurrentUser(updatedUser);
      sessionStorage.setItem(
        CURRENT_USER_STORAGE_KEY,
        JSON.stringify(updatedUser)
      );
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    const allOperators = await getOperators();
    const user = allOperators.find(
      (op) => op.username === username && op.password === password
    );
    
    setIsLoading(false);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const setCurrentUserRole = (role: UserRole) => {
    updateCurrentUser({ role });
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
