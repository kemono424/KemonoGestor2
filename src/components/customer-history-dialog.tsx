'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Customer, Trip, TripStatus } from '@/types';
import { format } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import { Badge } from './ui/badge';

interface CustomerHistoryDialogProps {
  customer: Customer | null;
  trips: Trip[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

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

export function CustomerHistoryDialog({
  customer,
  trips,
  isOpen,
  onOpenChange,
}: CustomerHistoryDialogProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const customerTrips = useMemo(() => {
    if (!customer) return [];
    return trips
      .filter((trip) => trip.customer.id === customer.id)
      .sort(
        (a, b) =>
          new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime()
      );
  }, [customer, trips]);

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Historial de Viajes de {customer.name}</DialogTitle>
          <DialogDescription>
            Mostrando todos los viajes pasados y actuales de este cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-6">
            {customerTrips.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origen / Destino</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Vehículo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div className="font-medium">{trip.origin}</div>
                        <div className="text-sm text-muted-foreground">
                          {trip.destination}
                        </div>
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
                        {isClient
                          ? format(
                              new Date(trip.requestTime),
                              'MMM d, yyyy h:mm a'
                            )
                          : null}
                      </TableCell>
                      <TableCell>{trip.vehicle?.name || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-6 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  No se encontró historial de viajes para este cliente.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
