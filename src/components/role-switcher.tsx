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
  const { role, setRole } = useAppContext();

  return (
    <Select value={role} onValueChange={value => setRole(value as UserRole)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Admin">Admin</SelectItem>
        <SelectItem value="Dispatcher">Dispatcher</SelectItem>
      </SelectContent>
    </Select>
  );
}
