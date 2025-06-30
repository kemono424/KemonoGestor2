
'use client';

import * as React from 'react';
import Map, { Marker } from 'react-map-gl';
import type { Vehicle } from '@/types';
import { MapPin } from 'lucide-react';

interface VehicleMapProps {
  vehicles: Vehicle[];
}

export default function VehicleMap({ vehicles }: VehicleMapProps) {
  const availableVehicles = vehicles.filter(
    (v) => (v.status === 'Available' || v.status === 'Busy') && v.latitude && v.longitude
  );

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
        <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={{
                longitude: -65.4117,
                latitude: -24.7859,
                zoom: 13,
            }}
            style={{ width: '100%', height: '100%'}}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            >
            {availableVehicles.map((vehicle) => (
                <Marker
                key={vehicle.id}
                longitude={vehicle.longitude!}
                latitude={vehicle.latitude!}
                anchor="bottom"
                >
                <MapPin className="h-6 w-6 text-primary animate-pulse" />
                </Marker>
            ))}
        </Map>
    </div>
  );
}
