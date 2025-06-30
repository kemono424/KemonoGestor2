'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import type { UserRole } from '@/types';

export default function RoleSwitcher() {
  const { currentUser, setCurrentUserRole } = useAppContext();
  
  if (!currentUser || currentUser.role !== 'Admin') {
    return null;
  }

  return (
    <Select value={currentUser.role} onValueChange={value => setCurrentUserRole(value as UserRole)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Impersonar Rol" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Admin">Admin</SelectItem>
        <SelectItem value="Supervisor">Impersonar Supervisor</SelectItem>
        <SelectItem value="Operador">Impersonar Operador</SelectItem>
      </SelectContent>
    </Select>
  );
}
