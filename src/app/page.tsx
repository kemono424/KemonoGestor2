'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Car, Users, Activity } from 'lucide-react';
import { getVehicles, getOperators, getRecentTrips } from '@/lib/mock-data';
import VehicleMap from '@/components/vehicle-map';
import { NewTripForm } from '@/components/new-trip-form';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle, Operator, Trip } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [operators, setOperators] = React.useState<Operator[]>([]);
  const [recentTrips, setRecentTrips] = React.useState<Trip[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [originPin, setOriginPin] = React.useState<[number, number] | null>(
    null
  );
  const [destinationPin, setDestinationPin] = React.useState<
    [number, number] | null
  >(null);
  const [route, setRoute] = React.useState<any>(null);
  const [originQuery, setOriginQuery] = React.useState('');
  const [destinationQuery, setDestinationQuery] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [vehiclesData, operatorsData, tripsData] = await Promise.all([
          getVehicles(),
          getOperators(),
          getRecentTrips(),
        ]);
        setVehicles(vehiclesData);
        setOperators(operatorsData);
        setRecentTrips(tripsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          variant: 'destructive',
          title: 'Error al Cargar Datos',
          description:
            'No se pudieron cargar los datos del panel. Inténtalo de nuevo.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const onlineVehicles = vehicles.filter(v => v.status === 'Libre').length;
  const activeTrips = vehicles.filter(v =>
    ['En camino', 'Ocupado', 'En espera'].includes(v.status)
  ).length;
  const availableOperators = operators.filter(o => o.status === 'Activo').length;
  const totalTripsToday = recentTrips.length;

  const reverseGeocode = React.useCallback(
    async (coords: [number, number]) => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address,poi&limit=1`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          return data.features[0].place_name;
        }
        return `${coords[1]}, ${coords[0]}`; // Fallback to coordinates
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        toast({
          variant: 'destructive',
          title: 'Falló la Geocodificación Inversa',
          description:
            'No se pudo obtener la dirección para la ubicación seleccionada.',
        });
        return `${coords[1]}, ${coords[0]}`;
      }
    },
    [toast]
  );

  const handleOriginDrag = React.useCallback(
    async (event: any) => {
      const newCoords: [number, number] = [event.lngLat.lng, event.lngLat.lat];
      setOriginPin(newCoords);
      const newAddress = await reverseGeocode(newCoords);
      setOriginQuery(newAddress);
    },
    [reverseGeocode]
  );

  const handleDestinationDrag = React.useCallback(
    async (event: any) => {
      const newCoords: [number, number] = [event.lngLat.lng, event.lngLat.lat];
      setDestinationPin(newCoords);
      const newAddress = await reverseGeocode(newCoords);
      setDestinationQuery(newAddress);
    },
    [reverseGeocode]
  );

  React.useEffect(() => {
    const getRoute = async () => {
      if (originPin && destinationPin) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${originPin[0]},${originPin[1]};${destinationPin[0]},${destinationPin[1]}?steps=true&geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
          );
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            setRoute(data.routes[0].geometry);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
          setRoute(null);
        }
      } else {
        setRoute(null);
      }
    };
    getRoute();
  }, [originPin, destinationPin]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
            </CardHeader>
            <CardContent className="h-[480px] w-full p-0">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vehículos Disponibles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {onlineVehicles}
            </div>
            <p className="text-xs text-muted-foreground">
              de {vehicles.length} vehículos totales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              +{activeTrips}
            </div>
            <p className="text-xs text-muted-foreground">
              actualmente en progreso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Operadores Disponibles
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              +{availableOperators}
            </div>
            <p className="text-xs text-muted-foreground">
              listos para asignación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Viajes del Día
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {totalTripsToday}
            </div>
            <p className="text-xs text-muted-foreground">
              viajes totales registrados hoy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Crear un Nuevo Viaje</CardTitle>
            <CardDescription>
              El sistema puede auto-asignar el vehículo más cercano.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewTripForm
              originQuery={originQuery}
              setOriginQuery={setOriginQuery}
              destinationQuery={destinationQuery}
              setDestinationQuery={setDestinationQuery}
              onOriginSelect={setOriginPin}
              onDestinationSelect={setDestinationPin}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ubicaciones de Vehículos en Vivo</CardTitle>
            <CardDescription>
              Seguimiento en tiempo real de todos los vehículos disponibles.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[480px] w-full p-0">
            <VehicleMap
              vehicles={vehicles}
              originPin={originPin}
              destinationPin={destinationPin}
              route={route}
              onOriginDrag={handleOriginDrag}
              onDestinationDrag={handleDestinationDrag}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
