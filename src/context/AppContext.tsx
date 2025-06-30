'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import type { Operator, UserRole } from '@/types';
import { operators } from '@/lib/mock-data';

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
    try {
      const storedUser = sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const userExists = operators.some((op) => op.id === parsedUser.id);
        if (userExists) {
          setCurrentUser(parsedUser);
        } else {
          sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load user from session storage', error);
      sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const updateCurrentUser = (updatedData: Partial<Operator>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedUser);
      sessionStorage.setItem(
        CURRENT_USER_STORAGE_KEY,
        JSON.stringify(updatedUser)
      );
      // Also update the master operators array for this prototype
      const userIndex = operators.findIndex((op) => op.id === updatedUser.id);
      if (userIndex !== -1) {
        operators[userIndex] = updatedUser;
      }
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = operators.find(
      (op) => op.username === username && op.password === password
    );

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
