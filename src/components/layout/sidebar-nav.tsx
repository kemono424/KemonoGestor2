'use client';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Map,
  Car,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  UserCheck,
  Shapes,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import React, { useState, useEffect } from 'react';

const links = [
  {
    href: '/',
    icon: LayoutDashboard,
    label: 'Panel',
    roles: ['Admin', 'Supervisor', 'Operador'],
  },
  {
    href: '/trips',
    icon: Map,
    label: 'Viajes',
    roles: ['Admin', 'Supervisor', 'Operador'],
  },
  {
    href: '/vehicles',
    icon: Car,
    label: 'Vehículos',
    roles: ['Admin', 'Supervisor'],
  },
  {
    href: '/operators',
    icon: Users,
    label: 'Operadores',
    roles: ['Admin', 'Supervisor'],
  },
  {
    href: '/customers',
    icon: UserCheck,
    label: 'Clientes',
    roles: ['Admin', 'Supervisor', 'Operador'],
  },
  {
    href: '/zones',
    icon: Shapes,
    label: 'Zonas',
    roles: ['Admin', 'Supervisor'],
  },
  {
    href: '/messages',
    icon: MessageSquare,
    label: 'Mensajes',
    roles: ['Admin', 'Supervisor', 'Operador'],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { currentUser, logout } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!currentUser) return null;

  const { role } = currentUser;
  const filteredLinks = links.filter(link => link.roles.includes(role));

  const settingsLink = {
    href: '/settings',
    icon: Settings,
    label: 'Ajustes',
    roles: ['Admin'],
  }

  return (
    <>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <Car className="h-6 w-6 text-sidebar-foreground" />
        <span className="text-lg font-semibold text-sidebar-foreground">
          KemonoGestor
        </span>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {filteredLinks.map(link => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={mounted ? pathname === link.href : false}
              tooltip={link.label}
            >
              <Link href={link.href}>
                <link.icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {settingsLink.roles.includes(role) && (
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Ajustes" isActive={mounted ? pathname === settingsLink.href : false}>
                    <Link href={settingsLink.href}>
                        <Settings />
                        <span>Ajustes</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cerrar Sesión" onClick={logout}>
              <LogOut />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
