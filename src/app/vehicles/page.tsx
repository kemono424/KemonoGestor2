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
import { vehicles } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Vehicle, VehicleStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { EditVehicleDialog } from '@/components/edit-vehicle-dialog';
import { useToast } from '@/hooks/use-toast';

export default function VehiclesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>(vehicles);
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredVehicles = vehiclesData.filter((vehicle) => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return (
      vehicle.unitNumber.toLowerCase().includes(lowercasedFilter) ||
      vehicle.name.toLowerCase().includes(lowercasedFilter) ||
      vehicle.licensePlate.toLowerCase().includes(lowercasedFilter) ||
      vehicle.operator.toLowerCase().includes(lowercasedFilter)
    );
  });

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setIsDialogOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleSaveVehicle = (savedVehicle: Partial<Vehicle>) => {
    const isNew = !savedVehicle.id;

    if (isNew) {
      const newVehicle: Vehicle = {
        id: `V${Date.now()}`,
        joinDate: new Date().toISOString(),
        name: savedVehicle.name!,
        unitNumber: savedVehicle.unitNumber!,
        licensePlate: savedVehicle.licensePlate!,
        operator: savedVehicle.operator!,
        model: savedVehicle.model!,
        color: savedVehicle.color!,
        username: savedVehicle.username!,
        password: savedVehicle.password!,
        status: savedVehicle.status || 'Fuera de servicio',
      };
      vehicles.unshift(newVehicle); // Mutate mock data
      setVehiclesData([...vehicles]); // Update local state
      toast({
        title: 'Vehículo Añadido',
        description: `El vehículo "${newVehicle.name}" ha sido añadido exitosamente.`,
      });
    } else {
      const index = vehicles.findIndex((v) => v.id === savedVehicle.id);
      if (index !== -1) {
        vehicles[index] = { ...vehicles[index], ...savedVehicle } as Vehicle;
        setVehiclesData([...vehicles]); // Update local state
        toast({
          title: 'Vehículo Actualizado',
          description: `El vehículo "${savedVehicle.name}" ha sido actualizado exitosamente.`,
        });
      }
    }
    setIsDialogOpen(false);
    setEditingVehicle(null);
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Libre':
        return (
          <Badge className="border-transparent bg-green-500 text-primary-foreground hover:bg-green-500/80">
            {status}
          </Badge>
        );
      case 'En descanso':
        return (
          <Badge className="border-transparent bg-yellow-400 text-black hover:bg-yellow-400/80">
            {status}
          </Badge>
        );
      case 'Ocupado':
        return (
          <Badge className="border-transparent bg-red-500 text-primary-foreground hover:bg-red-500/80">
            {status}
          </Badge>
        );
      case 'En camino':
        return (
          <Badge className="border-transparent bg-blue-500 text-primary-foreground hover:bg-blue-500/80">
            {status}
          </Badge>
        );
      case 'En espera':
        return (
          <Badge className="border-transparent bg-orange-500 text-primary-foreground hover:bg-orange-500/80">
            {status}
          </Badge>
        );
      case 'Fuera de servicio':
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <PageHeader
        title="Gestor de Vehículos"
        description="Registra, sigue y gestiona todos los vehículos de tu flota."
      >
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filtrar por unidad, nombre, matrícula..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleAddVehicle}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Vehículo
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidad</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-mono">
                    {vehicle.unitNumber}
                  </TableCell>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell>{vehicle.operator}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
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
                          onClick={() => handleEditVehicle(vehicle)}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver en Mapa</DropdownMenuItem>
                        <DropdownMenuItem>
                          Programar Mantenimiento
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Eliminar
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
      <EditVehicleDialog
        vehicle={editingVehicle}
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingVehicle(null);
          setIsDialogOpen(open);
        }}
        onSave={handleSaveVehicle}
      />
    </>
  );
}
