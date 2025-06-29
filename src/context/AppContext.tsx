'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { UserRole } from '@/types';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>('Dispatcher');

  return (
    <AppContext.Provider value={{ role, setRole }}>
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
