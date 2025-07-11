'use client';

import { useState, type ChangeEvent, type KeyboardEvent, useEffect, useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import type { Customer, Trip } from '@/types';
import { MapPin, User, History, MessageSquare } from 'lucide-react';
import { DateTimePicker } from './date-time-picker';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { addDays } from 'date-fns';
import { Badge } from './ui/badge';
import { CustomerTripHistoryDialog } from './customer-trip-history-dialog';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  customerPhone: z.string().min(1, { message: 'El teléfono del cliente es requerido.' }),
  origin: z.string().min(1, { message: 'El origen es requerido.' }),
  destination: z.string().optional(),
  notes: z.string().optional(),
  inTray: z.boolean().default(false).optional(),
  isScheduled: z.boolean().default(false),
  scheduledTime: z.date().optional(),
  isRecurring: z.boolean().default(false),
  recurringDays: z.coerce.number().min(1).optional(),
});

interface NewTripFormProps {
  originQuery: string;
  setOriginQuery: (query: string) => void;
  destinationQuery: string;
  setDestinationQuery: (query: string) => void;
  onOriginSelect: (coords: [number, number] | null) => void;
  onDestinationSelect: (coords: [number, number] | null) => void;
}

export function NewTripForm({
  originQuery,
  setOriginQuery,
  destinationQuery,
  setDestinationQuery,
  onOriginSelect,
  onDestinationSelect,
}: NewTripFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isHistoryDialogOpen, setHistoryDialogOpen] = useState(false);
  const { toast } = useToast();

  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);

  const originSelectionRef = useRef(false);
  const destinationSelectionRef = useRef(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerPhone: '',
      origin: '',
      destination: '',
      notes: '',
      inTray: false,
      isScheduled: false,
      scheduledTime: new Date(),
      isRecurring: false,
      recurringDays: 5,
    },
  });

  // Sync parent state with react-hook-form state
  useEffect(() => {
    if (originQuery !== form.getValues('origin')) {
      form.setValue('origin', originQuery, { shouldValidate: true });
    }
  }, [originQuery, form]);

  useEffect(() => {
    if (destinationQuery !== form.getValues('destination')) {
      form.setValue('destination', destinationQuery, { shouldValidate: true });
    }
  }, [destinationQuery, form]);


  const searchAddresses = async (
    query: string,
    setSuggestions: (suggestions: any[]) => void
  ) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }&autocomplete=true&country=AR&proximity=-65.4117,-24.7859`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Error fetching geocoding data:', error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (originSelectionRef.current) {
        originSelectionRef.current = false;
        return;
    }
    const handler = setTimeout(() => {
      searchAddresses(originQuery, setOriginSuggestions);
    }, 300);

    return () => clearTimeout(handler);
  }, [originQuery]);

  useEffect(() => {
    if (destinationSelectionRef.current) {
        destinationSelectionRef.current = false;
        return;
    }
    const handler = setTimeout(() => {
      searchAddresses(destinationQuery, setDestinationSuggestions);
    }, 300);

    return () => clearTimeout(handler);
  }, [destinationQuery]);

  const handleSelectOrigin = (suggestion: any) => {
    originSelectionRef.current = true;
    const placeName = suggestion.place_name;
    setOriginQuery(placeName);
    onOriginSelect(suggestion.center);
    setOriginSuggestions([]);
  };

  const handleSelectDestination = (suggestion: any) => {
    destinationSelectionRef.current = true;
    const placeName = suggestion.place_name;
    setDestinationQuery(placeName);
    onDestinationSelect(suggestion.center);
    setDestinationSuggestions([]);
  };

  const handlePhoneKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (form.getValues('customerPhone').trim()) {
        setHistoryDialogOpen(true);
      }
    }
  };

  const handleTripSelectFromHistory = (trip: Trip) => {
    setSelectedCustomer(trip.customer);
    setOriginQuery(trip.origin);
    setDestinationQuery(trip.destination || '');
    onOriginSelect(trip.originCoords || null);
    onDestinationSelect(trip.destinationCoords || null);
    form.setValue('notes', trip.notes || '');
    // Note: We don't set customerPhone here, it's already in the form
    form.clearErrors('customerPhone');
  };

  const handleBackFromHistory = () => {
    setSelectedCustomer(null);
    setOriginQuery('');
    setDestinationQuery('');
    onOriginSelect(null);
    onDestinationSelect(null);
    form.setValue('notes', '');
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if a customer was selected via the history search
    if (!selectedCustomer && values.customerPhone) {
        toast({
            variant: "destructive",
            title: "Cliente no Seleccionado",
            description: "Por favor, busca y selecciona un cliente o un viaje pasado del historial antes de crear un viaje.",
        });
        form.setError('customerPhone', {
            type: 'manual',
            message: 'Por favor, selecciona un cliente buscando en el historial de viajes.',
        });
        return;
    }

    toast({
        title: "Viaje Creado",
        description: `El viaje para ${selectedCustomer?.name || 'un nuevo cliente'} ha sido creado exitosamente.`
    });

    form.reset();
    setOriginQuery('');
    setDestinationQuery('');
    setSelectedCustomer(null);
    onOriginSelect(null);
    onDestinationSelect(null);
  }

  const isScheduled = form.watch('isScheduled');
  const isRecurring = form.watch('isRecurring');

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono del Cliente</FormLabel>
                <FormControl>
                  <div className="relative">
                    <History className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Busca teléfono y presiona Enter para ver historial..."
                      {...field}
                      onKeyDown={handlePhoneKeyDown}
                      autoComplete="off"
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedCustomer && (
            <Card className="p-3 bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.phone}
                  </p>
                </div>
                {selectedCustomer.pendingDebt > 0 && (
                  <Badge variant="destructive">
                    Deuda: ${selectedCustomer.pendingDebt.toFixed(2)}
                  </Badge>
                )}
              </div>
            </Card>
          )}

          {/* Trip Details */}
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origen</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Introduce la ubicación de recogida"
                      {...field}
                      value={originQuery}
                      onChange={e => {
                        field.onChange(e);
                        setOriginQuery(e.target.value);
                      }}
                      autoComplete="off"
                      className="pl-10"
                    />
                    {originSuggestions.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 border shadow-lg">
                        <ul className="py-1 max-h-48 overflow-y-auto">
                          {originSuggestions.map(s => (
                            <li
                              key={s.id}
                              className="px-3 py-2 cursor-pointer hover:bg-muted"
                              onClick={() => handleSelectOrigin(s)}
                            >
                              <p className="font-semibold text-sm">
                                {s.place_name}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino (Opcional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Introduce la ubicación de destino"
                      {...field}
                      value={destinationQuery}
                      onChange={e => {
                        field.onChange(e);
                        setDestinationQuery(e.target.value);
                      }}
                      autoComplete="off"
                      className="pl-10"
                    />
                    {destinationSuggestions.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 border shadow-lg">
                        <ul className="py-1 max-h-48 overflow-y-auto">
                          {destinationSuggestions.map(s => (
                            <li
                              key={s.id}
                              className="px-3 py-2 cursor-pointer hover:bg-muted"
                              onClick={() => handleSelectDestination(s)}
                            >
                              <p className="font-semibold text-sm">
                                {s.place_name}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Información Adicional (para el conductor)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="p. ej., portón verde, llamar al llegar..."
                      {...field}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                    Esta información será visible para el conductor asignado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="isScheduled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <FormLabel>¿Programar para más tarde?</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {isScheduled && (
              <>
                <FormField
                  control={form.control}
                  name="scheduledTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha y Hora Programada</FormLabel>
                      <DateTimePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>¿Repetir este viaje?</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {isRecurring && (
                  <FormField
                    control={form.control}
                    name="recurringDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Repetir por cuántos días?</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </Card>

          <FormField
            control={form.control}
            name="inTray"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/20">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="in-tray"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="in-tray">
                    Enviar a Bandeja de Asignación Manual
                  </FormLabel>
                  <FormDescription>
                    Si no está marcado, el sistema intentará auto-asignar un vehículo.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" className="w-full">
              Crear Viaje
            </Button>
          </div>
        </form>
      </Form>

      {isHistoryDialogOpen && (
        <CustomerTripHistoryDialog
          isOpen={isHistoryDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          phoneQuery={form.getValues('customerPhone')}
          onTripSelect={handleTripSelectFromHistory}
          onBackClick={handleBackFromHistory}
        />
      )}
    </>
  );
}
