'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getRecentTrips } from '@/lib/mock-data';
import type { Customer, Trip } from '@/types';
import { ArrowRight, History, MapPin, Pencil } from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { updateCustomer } from '@/lib/actions';

interface CustomerTripHistoryDialogProps {
  phoneQuery: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTripSelect: (trip: Trip) => void;
  onBackClick: () => void;
}

export function CustomerTripHistoryDialog({
  phoneQuery,
  isOpen,
  onOpenChange,
  onTripSelect,
  onBackClick,
}: CustomerTripHistoryDialogProps) {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCustomer, setEditableCustomer] = useState<Customer | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const trips = await getRecentTrips();
          setAllTrips(trips);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo cargar el historial de viajes.',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, toast]);

  const filteredTrips = useMemo(() => {
    const sanitizedQuery = phoneQuery.replace(/[^0-9]/g, '');
    if (!sanitizedQuery) return [];
    return allTrips.filter((trip) =>
      trip.customer.phone.replace(/[^0-9]/g, '').includes(sanitizedQuery)
    );
  }, [phoneQuery, allTrips]);

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTripId(trip.id);
    setActiveCustomer(trip.customer);
    setEditableCustomer({ ...trip.customer }); // Create a copy for editing
    setIsEditing(false); // Reset editing state on new selection
    onTripSelect(trip);
  };

  const handleBack = useCallback(() => {
    setSelectedTripId(null);
    setActiveCustomer(null);
    setEditableCustomer(null);
    setIsEditing(false);
    onBackClick();
  }, [onBackClick]);

  useEffect(() => {
    if (!isOpen) {
      handleBack();
    }
  }, [isOpen, handleBack]);

  const handleSaveCustomer = async () => {
    if (editableCustomer) {
      const result = await updateCustomer(editableCustomer);

      if (result.success) {
        // Update the local state for the UI to refresh instantly.
        setActiveCustomer(editableCustomer);
        toast({
          title: 'Cliente Actualizado',
          description: `La información de ${editableCustomer.name} ha sido guardada.`,
        });
        setIsEditing(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al actualizar',
          description: 'No se pudo guardar la información del cliente.',
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableCustomer(activeCustomer);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cliente e Historial de Viajes</DialogTitle>
          <DialogDescription>
            Busca un cliente por teléfono para ver sus viajes pasados.
            Selecciona uno para autocompletar el formulario.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Left Panel: Trip List */}
          <div className="h-full flex flex-col gap-2">
            <h3 className="text-lg font-semibold shrink-0">
              {isLoading ? 'Buscando...' : `Viajes Coincidentes (${filteredTrips.length})`}
            </h3>
            <ScrollArea className="h-full pr-4 -mr-4">
              <div className="space-y-2">
                {isLoading ? (
                    <p className="text-muted-foreground">Cargando viajes...</p>
                ) : filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <button
                      key={trip.id}
                      className={cn(
                        'w-full p-3 border rounded-lg text-left transition-colors',
                        'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
                        selectedTripId === trip.id
                          ? 'bg-muted border-primary shadow-sm'
                          : 'border-transparent'
                      )}
                      onClick={() => handleSelectTrip(trip)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold truncate">
                          {trip.customer.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(trip.requestTime), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                          <span className="truncate">{trip.origin}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                          <span className="truncate">{trip.destination}</span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">
                      No se encontraron viajes pasados para "{phoneQuery}".
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          {/* Right Panel: Customer Details */}
          <div className="h-full flex flex-col">
            {activeCustomer ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-row justify-between items-start">
                  <div>
                    <CardTitle>
                      {isEditing ? 'Editar Cliente' : activeCustomer.name}
                    </CardTitle>
                    <CardDescription>
                      {isEditing
                        ? 'Actualiza los detalles a continuación.'
                        : activeCustomer.phone}
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {isEditing ? (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="customer-name">Nombre</Label>
                        <Input
                          id="customer-name"
                          value={editableCustomer?.name || ''}
                          onChange={(e) =>
                            setEditableCustomer((c) =>
                              c ? { ...c, name: e.target.value } : null
                            )
                          }
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-phone">Teléfono</Label>
                        <Input
                          id="customer-phone"
                          value={editableCustomer?.phone || ''}
                          onChange={(e) =>
                            setEditableCustomer((c) =>
                              c ? { ...c, phone: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-notes">
                          Notas para el Conductor
                        </Label>
                        <Textarea
                          id="customer-notes"
                          value={editableCustomer?.notes || ''}
                          onChange={(e) =>
                            setEditableCustomer((c) =>
                              c ? { ...c, notes: e.target.value } : null
                            )
                          }
                          placeholder="p. ej., Prefiere viajes tranquilos, tiene una mascota..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">
                          Estado Financiero
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Deuda Pendiente
                          </span>
                          <Badge
                            variant={
                              activeCustomer.pendingDebt > 0
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            ${activeCustomer.pendingDebt.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Notas</h4>
                        <p className="text-sm text-muted-foreground italic">
                          {activeCustomer.notes ||
                            'No hay notas disponibles para este cliente.'}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/30 rounded-lg">
                <History className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">
                  Selecciona un Viaje Pasado
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Haz clic en un viaje de la lista para ver los detalles del
                  cliente y reutilizar la información del viaje.
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          {isEditing ? (
            <div className="flex justify-end w-full gap-2">
              <Button variant="ghost" onClick={handleCancelEdit}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCustomer}>Guardar Cambios</Button>
            </div>
          ) : (
            <>
              {activeCustomer && (
                <Button variant="ghost" onClick={handleBack}>
                  Atrás
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="ml-auto"
              >
                Cerrar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
