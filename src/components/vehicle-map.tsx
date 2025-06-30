
'use client';

import * as React from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { Vehicle, Zone } from '@/types';
import { MapPin } from 'lucide-react';
import type { FeatureCollection } from 'geojson';

interface VehicleMapProps {
  vehicles: Vehicle[];
}

export default function VehicleMap({ vehicles }: VehicleMapProps) {
  const [zones, setZones] = React.useState<Zone[]>([]);

  // On component mount, load zones from localStorage.
  // This makes the map self-sufficient and ensures it displays the user's saved zones.
  React.useEffect(() => {
    try {
      const savedZones = localStorage.getItem('fleet-manager-zones');
      if (savedZones) {
        setZones(JSON.parse(savedZones));
      }
    } catch (error) {
      console.error("Failed to load zones from localStorage for map display.", error);
    }
  }, []);

  const availableVehicles = vehicles.filter(
    (v) => (v.status === 'Available' || v.status === 'Busy') && v.latitude && v.longitude
  );

  const zonesFc: FeatureCollection | null = zones.length > 0 ? {
    type: 'FeatureCollection',
    features: zones.map(zone => ({
      type: 'Feature',
      properties: {
        color: zone.color,
        name: zone.name,
      },
      geometry: zone.geometry,
    })),
  } : null;

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
            {zonesFc && (
                <Source id="zones" type="geojson" data={zonesFc}>
                    <Layer
                        id="zone-fills"
                        type="fill"
                        source="zones"
                        paint={{
                            'fill-color': ['get', 'color'],
                            'fill-opacity': 0.2,
                        }}
                    />
                    <Layer
                        id="zone-borders"
                        type="line"
                        source="zones"
                        paint={{
                            'line-color': ['get', 'color'],
                            'line-width': 2,
                        }}
                    />
                </Source>
            )}
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
