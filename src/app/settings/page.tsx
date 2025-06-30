'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import type { UserRole } from '@/types';

const PRICING_CONFIG_KEY = 'fleet-pricing-config';

const pricingFormSchema = z.object({
  baseFare: z.coerce.number().min(0, 'La tarifa base debe ser no negativa.'),
  perKilometer: z.coerce.number().min(0, 'El precio por km debe ser no negativo.'),
  perStop: z.coerce.number().min(0, 'El precio por parada debe ser no negativo.'),
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

const defaultValues: Partial<PricingFormValues> = {
  baseFare: 3.5,
  perKilometer: 1.75,
  perStop: 2.0,
};

export default function SettingsPage() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = React.useState(false);

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    try {
        const savedConfig = localStorage.getItem(PRICING_CONFIG_KEY);
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            form.reset(parsedConfig);
        }
    } catch (error) {
        console.error('Failed to load pricing config from localStorage', error);
    }
    setIsMounted(true);
  }, [form]);


  function onSubmit(data: PricingFormValues) {
    try {
        localStorage.setItem(PRICING_CONFIG_KEY, JSON.stringify(data));
        toast({
            title: 'Ajustes Guardados',
            description: 'Tu nueva configuración de precios ha sido guardada exitosamente.',
        });
    } catch (error) {
        console.error('Failed to save pricing config to localStorage', error);
        toast({
            variant: 'destructive',
            title: 'Error al Guardar',
            description: 'No se pudo guardar la configuración de precios.',
        });
    }
  }

  if (!isMounted) {
    return null; 
  }

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Acceso Denegado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">Debes ser un administrador to access this page.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Ajustes"
        description="Gestionar ajustes y configuraciones de toda la aplicación."
      />
      <Card>
        <CardHeader>
          <CardTitle>Precios de Viajes</CardTitle>
          <CardDescription>
            Define el modelo de precios para todos los viajes gestionados por el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
              <FormField
                control={form.control}
                name="baseFare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa Base (Bajada de Bandera)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 3.50" {...field} />
                    </FormControl>
                    <FormDescription>
                      El cargo inicial cuando comienza un viaje.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="perKilometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por Kilómetro</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 1.75" {...field} />
                    </FormControl>
                    <FormDescription>
                      El cargo por cada kilómetro recorrido.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="perStop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio por Parada</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 2.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Cargo adicional por cada parada solicitada durante el viaje.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Guardar Ajustes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
