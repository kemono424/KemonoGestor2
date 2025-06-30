'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { customers, recentTrips } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EditCustomerDialog } from '@/components/edit-customer-dialog';
import { CustomerHistoryDialog } from '@/components/customer-history-dialog';
import type { Customer } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function CustomersPage() {
  const [customersData, setCustomersData] = useState<Customer[]>(customers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const { toast } = useToast();

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsHistoryOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const handleSaveCustomer = (updatedCustomer: Customer) => {
    const customerIndex = customers.findIndex(
      (c) => c.id === updatedCustomer.id
    );
    if (customerIndex !== -1) {
      customers[customerIndex] = updatedCustomer;
    }
    recentTrips.forEach((trip) => {
      if (trip.customer && trip.customer.id === updatedCustomer.id) {
        trip.customer = updatedCustomer;
      }
    });
    setCustomersData((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
    setIsEditOpen(false);
    setSelectedCustomer(null);
  };

  const confirmDelete = () => {
    if (!customerToDelete) return;

    // Update the state for the UI
    setCustomersData((prev) => prev.filter((c) => c.id !== customerToDelete.id));

    // Update the "master" mock data arrays
    const customerIndex = customers.findIndex(
      (c) => c.id === customerToDelete.id
    );
    if (customerIndex > -1) {
      customers.splice(customerIndex, 1);
    }

    const tripsToKeep = recentTrips.filter(
      (t) => t.customer.id !== customerToDelete.id
    );
    recentTrips.length = 0;
    recentTrips.push(...tripsToKeep);

    toast({
      title: 'Cliente Eliminado',
      description: `El cliente "${customerToDelete.name}" ha sido eliminado permanentemente.`,
    });

    setCustomerToDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Gestión de Clientes"
        description="Ver y gestionar la información de los clientes."
      >
        <div className="flex items-center space-x-2">
          <Input placeholder="Filtrar por nombre o ID..." className="w-64" />
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Cliente
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Deuda</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersData.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.pendingDebt > 0 ? 'destructive' : 'secondary'
                      }
                    >
                      ${customer.pendingDebt.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewHistory(customer)}
                        >
                          Ver Historial de Viajes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditCustomer(customer)}
                        >
                          Editar Cliente
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDeleteCustomer(customer)}
                        >
                          Eliminar Cliente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomerHistoryDialog
        customer={selectedCustomer}
        isOpen={isHistoryOpen}
        onOpenChange={(open) => {
          setIsHistoryOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
      />
      <EditCustomerDialog
        customer={selectedCustomer}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />
      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={(open) => {
          if (!open) setCustomerToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al
              cliente "{customerToDelete?.name}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
