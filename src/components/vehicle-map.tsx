
'use client';

import * as React from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { Vehicle } from '@/types';
import { MapPin } from 'lucide-react';
import type { FeatureCollection, Point, Polygon } from 'geojson';
import { generateZoneLayer } from '@/lib/grid-utils';

const LOCAL_STORAGE_KEY = 'fleet-grid-zones-v2';

interface VehicleMapProps {
  vehicles: Vehicle[];
}

export default function VehicleMap({ vehicles }: VehicleMapProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [zoneLayer, setZoneLayer] = React.useState<FeatureCollection<Polygon> | null>(null);
  const [labelLayer, setLabelLayer] = React.useState<FeatureCollection<Point> | null>(null);

  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { zones, gridConfig } = JSON.parse(savedData);
        if (gridConfig && zones && zones.length > 0) {
          const { zonesFc, labelsFc } = generateZoneLayer(gridConfig, zones);
          setZoneLayer(zonesFc);
          setLabelLayer(labelsFc);
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
            {isMounted && zoneLayer && (
              <Source type="geojson" data={zoneLayer}>
                <Layer
                  id="zone-fill"
                  type="fill"
                  paint={{
                    'fill-color': ['get', 'color'],
                    'fill-opacity': 0.3,
                  }}
                />
              </Source>
            )}

            {isMounted && labelLayer && (
              <Source type="geojson" data={labelLayer}>
                <Layer
                  id="zone-labels"
                  type="symbol"
                  layout={{
                    'text-field': ['get', 'name'],
                    'text-size': 14,
                    'text-allow-overlap': true,
                    'text-ignore-placement': true
                  }}
                  paint={{
                    'text-color': '#ffffff',
                    'text-halo-color': '#000000',
                    'text-halo-width': 1,
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
