'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, Car } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import RoleSwitcher from '../role-switcher';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';
import { ProfileDialog } from '../profile-dialog';
import type { Operator } from '@/types';

export default function Header() {
  const { currentUser, logout, updateCurrentUser } = useAppContext();
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);

  if (!currentUser) return null;

  const { role, name, avatarUrl } = currentUser;

  const handleProfileUpdate = (updatedUser: Operator) => {
    updateCurrentUser(updatedUser);
    setProfileDialogOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <Car className="h-6 w-6" />
          <h1 className="text-lg font-semibold">KemonoGestor</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:block">
            <RoleSwitcher />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setProfileDialogOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                  <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ajustes</span>
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
