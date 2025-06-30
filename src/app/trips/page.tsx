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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { recentTrips, type Trip, type TripStatus } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditTripDialog } from '@/components/edit-trip-dialog';

const getStatusVariant = (status: TripStatus) => {
  switch (status) {
    case 'Completado':
      return 'default';
    case 'En Progreso':
    case 'Asignado':
      return 'secondary';
    case 'Cancelado':
      return 'destructive';
    case 'Programado':
      return 'outline';
    default: // En Bandeja
      return 'outline';
  }
};

const TripsTable = ({
  trips,
  onEdit,
}: {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Cliente</TableHead>
        <TableHead>Origen / Destino</TableHead>
        <TableHead>Vehículo</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Hora</TableHead>
        <TableHead className="text-right">Monto</TableHead>
        <TableHead>
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {trips.map(trip => (
        <TableRow key={trip.id}>
          <TableCell>
            <div className="font-medium">{trip.customer.name}</div>
          </TableCell>
          <TableCell>
            <div className="font-medium">{trip.origin}</div>
            <div className="text-sm text-muted-foreground">
              {trip.destination}
            </div>
             {trip.notes && (
              <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span className="italic">{trip.notes}</span>
              </div>
            )}
          </TableCell>
          <TableCell>
            {trip.vehicle
              ? `${trip.vehicle.name} (${trip.vehicle.licensePlate})`
              : 'Sin asignar'}
          </TableCell>
          <TableCell>
            <Badge
              variant={getStatusVariant(trip.status)}
              className="capitalize"
            >
              {trip.status.toLowerCase()}
            </Badge>
          </TableCell>
          <TableCell>
            {isClient ? (
                <>
                  {trip.scheduledTime
                    ? format(new Date(trip.scheduledTime), 'MMM d, h:mm a')
                    : format(new Date(trip.requestTime), 'MMM d, h:mm a')}
                  {trip.scheduledTime && <div className="text-xs text-muted-foreground">(Programado)</div>}
                </>
              ) : null}
          </TableCell>
          <TableCell className="text-right font-mono">
            {trip.price != null ? `$${trip.price.toFixed(2)}` : 'N/A'}
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
                <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(trip)}>
                  Editar Viaje
                </DropdownMenuItem>
                {trip.status === 'En Bandeja' && (
                  <DropdownMenuItem>Asignar Manualmente</DropdownMenuItem>
                )}
                 {trip.status !== 'Completado' && trip.status !== 'Cancelado' && (
                   <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Cancelar Viaje
                    </DropdownMenuItem>
                   </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  )
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>(recentTrips);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips(currentTrips =>
      currentTrips.map(t => (t.id === updatedTrip.id ? updatedTrip : t))
    );
    setEditingTrip(null);
  };

  const tripsInTray = trips.filter(trip => trip.status === 'En Bandeja');
  const activeServices = trips.filter(trip => ['Asignado', 'En Progreso', 'Programado'].includes(trip.status));

  return (
    <>
      <PageHeader
        title="Gestor de Viajes"
        description="Facilita la creación de viajes y sigue los trayectos existentes."
      >
        <Button asChild>
          <Link href="/">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Viaje
          </Link>
        </Button>
      </PageHeader>
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Servicios Activos</TabsTrigger>
          <TabsTrigger value="tray">
            En Bandeja
            {tripsInTray.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {tripsInTray.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              <TripsTable trips={activeServices} onEdit={setEditingTrip} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tray">
          <Card>
            <CardContent className="pt-6">
              {tripsInTray.length > 0 ? (
                <TripsTable trips={tripsInTray} onEdit={setEditingTrip} />
              ) : (
                <div className="flex items-center justify-center h-48 rounded-lg border-2 border-dashed border-muted">
                  <p className="text-center text-muted-foreground">
                    La bandeja de asignación está vacía.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {editingTrip && (
        <EditTripDialog
          trip={editingTrip}
          isOpen={!!editingTrip}
          onOpenChange={() => setEditingTrip(null)}
          onSave={handleUpdateTrip}
        />
      )}
    </>
  );
}
