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
    label: 'Dashboard',
    roles: ['Admin', 'Supervisor', 'Dispatcher'],
  },
  {
    href: '/trips',
    icon: Map,
    label: 'Trips',
    roles: ['Admin', 'Supervisor', 'Dispatcher'],
  },
  {
    href: '/vehicles',
    icon: Car,
    label: 'Vehicles',
    roles: ['Admin', 'Supervisor'],
  },
  {
    href: '/operators',
    icon: Users,
    label: 'Operators',
    roles: ['Admin', 'Supervisor'],
  },
  {
    href: '/customers',
    icon: UserCheck,
    label: 'Customers',
    roles: ['Admin', 'Supervisor', 'Dispatcher'],
  },
  {
    href: '/messages',
    icon: MessageSquare,
    label: 'Messages',
    roles: ['Admin', 'Supervisor', 'Dispatcher'],
  },
  {
    href: '/zones',
    icon: Shapes,
    label: 'Zones',
    roles: ['Admin', 'Supervisor'],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { role } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredLinks = links.filter(link => link.roles.includes(role));

  return (
    <>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <Car className="h-6 w-6 text-sidebar-foreground" />
        <span className="text-lg font-semibold text-sidebar-foreground">
          Fleet Manager
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
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
