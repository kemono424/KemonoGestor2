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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

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
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { role } = useAppContext();

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
            <Link href={link.href} legacyBehavior passHref>
              <SidebarMenuButton
                isActive={pathname === link.href}
                tooltip={link.label}
              >
                <link.icon />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </Link>
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
