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
import { getOperators } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditOperatorDialog } from '@/components/edit-operator-dialog';
import type { Operator } from '@/types';
import { useToast } from '@/hooks/use-toast';
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
import { addOperator, updateOperator, deleteOperator } from '@/lib/actions';

export default function OperatorsPage() {
  const { currentUser, logout } = useAppContext();
  const { toast } = useToast();
  const [operatorsData, setOperatorsData] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOperator, setEditingOperator] =
    useState<Partial<Operator> | null>(null);
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getOperators();
        setOperatorsData(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los operadores.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleAddOperator = () => {
    setEditingOperator(null);
    setIsDialogOpen(true);
  };

  const handleEditOperator = (operator: Operator) => {
    setEditingOperator(operator);
    setIsDialogOpen(true);
  };

  const handleDeleteOperator = (operator: Operator) => {
    setOperatorToDelete(operator);
  };

  const confirmDelete = async () => {
    if (!operatorToDelete || !currentUser) return;

    const result = await deleteOperator(operatorToDelete.id);

    if (result.success) {
      setOperatorsData((prev) =>
        prev.filter((op) => op.id !== operatorToDelete.id)
      );
      toast({
        title: 'Operador Eliminado',
        description: `El operador "${operatorToDelete.name}" ha sido eliminado.`,
      });

      if (currentUser.id === operatorToDelete.id) {
        toast({
          variant: 'destructive',
          title: '¡Autodestrucción!',
          description: 'Has eliminado tu propia cuenta y serás desconectado.',
        });
        setTimeout(() => {
          logout();
        }, 1500);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar al operador.',
      });
    }

    setOperatorToDelete(null);
  };

  const handleSaveOperator = async (savedOperator: Partial<Operator>) => {
    const isNew = !editingOperator;

    if (isNew) {
      const result = await addOperator(savedOperator as Omit<Operator, 'id'>);
      if (result.success) {
        const newOperator: Operator = {
          role: 'Operador',
          shift: 'Día',
          status: 'Inactivo',
          servicesToday: 0,
          avgAssignmentTime: 0,
          maxIdleTime: 0,
          activeServices: 0,
          id: result.newId,
          ...savedOperator,
        } as Operator;
        setOperatorsData((prev) => [newOperator, ...prev]);
        toast({
          title: 'Operador Añadido',
          description: `El operador "${newOperator.name}" ha sido añadido.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    } else {
      const result = await updateOperator(savedOperator);
      if (result.success) {
        setOperatorsData((prev) =>
          prev.map((op) =>
            op.id === savedOperator.id ? { ...op, ...savedOperator } : op
          )
        );
        toast({
          title: 'Operador Actualizado',
          description: `Los detalles de ${savedOperator.name} han sido actualizados.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    }

    setIsDialogOpen(false);
    setEditingOperator(null);
  };

  if (!currentUser || !['Admin', 'Supervisor'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              No tienes permiso para ver esta página. Por favor, contacta a un
              administrador si crees que esto es un error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Gestión de Operadores"
        description="Registrar, editar y gestionar operadores."
      >
        <Button onClick={handleAddOperator}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Operador
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center p-8">Cargando operadores...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Servicios (Hoy)</TableHead>
                  <TableHead>Servicios Activos</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operatorsData.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">
                      {operator.name}
                    </TableCell>
                    <TableCell>{operator.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          operator.status === 'Activo' ? 'secondary' : 'outline'
                        }
                      >
                        {operator.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{operator.servicesToday}</TableCell>
                    <TableCell>{operator.activeServices}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Estadísticas</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditOperator(operator)}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Ver Historial de Acciones
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleDeleteOperator(operator)}
                          >
                            Eliminar
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
      <EditOperatorDialog
        operator={editingOperator}
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingOperator(null);
          setIsDialogOpen(open);
        }}
        onSave={handleSaveOperator}
      />
      <AlertDialog
        open={!!operatorToDelete}
        onOpenChange={(open) => !open && setOperatorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. Esto eliminará al operador "
              {operatorToDelete?.name}" y ya no podrá iniciar sesión.
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
