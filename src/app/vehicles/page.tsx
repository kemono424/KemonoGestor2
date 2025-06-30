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
import { format } from 'date-fns';
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
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const handleSaveVehicle = (savedVehicle: Vehicle) => {
    const isNew = !savedVehicle.id;

    if (isNew) {
      const newVehicle = { ...savedVehicle, id: `V${Date.now()}` };
      vehicles.unshift(newVehicle); // Mutate mock data
      setVehiclesData([...vehicles]); // Update local state
      toast({
        title: 'Vehicle Added',
        description: `Vehicle "${newVehicle.name}" has been successfully added.`,
      });
    } else {
      const index = vehicles.findIndex((v) => v.id === savedVehicle.id);
      if (index !== -1) {
        vehicles[index] = savedVehicle; // Mutate mock data
        setVehiclesData([...vehicles]); // Update local state
        toast({
          title: 'Vehicle Updated',
          description: `Vehicle "${savedVehicle.name}" has been successfully updated.`,
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
      case 'Mantenimiento':
        return <Badge variant="destructive">{status}</Badge>;
      case 'Fuera de servicio':
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <PageHeader
        title="Vehicle Manager"
        description="Register, track, and manage all vehicles in your fleet."
      >
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter by unit, name, plate..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleAddVehicle}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Insurance Due</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
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
                    {isClient && vehicle.insuranceDueDate
                      ? format(new Date(vehicle.insuranceDueDate), 'MMM d, yyyy')
                      : 'N/A'}
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
                          onClick={() => handleEditVehicle(vehicle)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>View on Map</DropdownMenuItem>
                        <DropdownMenuItem>
                          Schedule Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
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