'use client';

import { useState, useEffect } from 'react';
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
import { getCustomers, getRecentTrips } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EditCustomerDialog } from '@/components/edit-customer-dialog';
import { CustomerHistoryDialog } from '@/components/customer-history-dialog';
import type { Customer, Trip } from '@/types';
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
import { deleteCustomer, updateCustomer } from '@/lib/actions';

export default function CustomersPage() {
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [customers, trips] = await Promise.all([
          getCustomers(),
          getRecentTrips(),
        ]);
        setCustomersData(customers);
        setRecentTrips(trips);
      } catch (error) {
        console.error('Failed to fetch customer data:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar datos',
          description: 'No se pudieron cargar los datos de los clientes.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

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

  const handleSaveCustomer = async (updatedCustomer: Customer) => {
    const result = await updateCustomer(updatedCustomer);
    if (result.success) {
      setCustomersData((prev) =>
        prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
      );
      toast({
        title: 'Cliente Actualizado',
        description: `Los datos de "${updatedCustomer.name}" se han actualizado.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el cliente.',
      });
    }
    setIsEditOpen(false);
    setSelectedCustomer(null);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    const result = await deleteCustomer(customerToDelete.id);

    if (result.success) {
      setCustomersData((prev) =>
        prev.filter((c) => c.id !== customerToDelete.id)
      );
      toast({
        title: 'Cliente Eliminado',
        description: `El cliente "${customerToDelete.name}" ha sido eliminado.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el cliente.',
      });
    }

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
          {isLoading ? (
            <div className="text-center p-8">Cargando clientes...</div>
          ) : (
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
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
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
          )}
        </CardContent>
      </Card>

      <CustomerHistoryDialog
        customer={selectedCustomer}
        trips={recentTrips}
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
