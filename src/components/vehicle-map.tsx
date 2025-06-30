'use client';

import * as React from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { Vehicle } from '@/types';
import { MapPin } from 'lucide-react';
import type { FeatureCollection } from 'geojson';
import { generateGridLayer } from '@/lib/grid-utils';

const LOCAL_STORAGE_KEY = 'fleet-grid-zones';

interface VehicleMapProps {
  vehicles: Vehicle[];
}

export default function VehicleMap({ vehicles }: VehicleMapProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [gridLayer, setGridLayer] = React.useState<FeatureCollection | null>(null);

  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { gridConfig, zones, cellAssignments } = JSON.parse(savedData);
        if (gridConfig && zones && cellAssignments) {
          const layer = generateGridLayer(gridConfig, zones, cellAssignments, new Set());
          setGridLayer(layer);
        }
      }
    } catch (error) {
      console.error("Failed to parse zones from localStorage", error);
    }
    setIsMounted(true);
  }, []);

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
            {isMounted && gridLayer && (
              <Source type="geojson" data={gridLayer}>
                <Layer
                  id="grid-fill"
                  type="fill"
                  paint={{
                    'fill-color': ['get', 'color'],
                    'fill-opacity': 0.3,
                  }}
                />
                <Layer
                  id="grid-stroke"
                  type="line"
                  paint={{
                    'line-color': ['get', 'color'],
                    'line-width': 1,
                    'line-opacity': 0.5,
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
