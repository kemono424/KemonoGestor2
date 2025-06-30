
'use client';

import * as React from 'react';
import Map, { Marker, Source, Layer, LngLatLike } from 'react-map-gl';
import type { Vehicle, VehicleStatus } from '@/types';
import { MapPin, Flag, Car } from 'lucide-react';
import type { FeatureCollection, Point, Polygon, LineString } from 'geojson';
import { generateZoneLayer } from '@/lib/grid-utils';

const LOCAL_STORAGE_KEY = 'fleet-grid-zones-v2';

interface VehicleMapProps {
  vehicles: Vehicle[];
  originPin?: [number, number] | null;
  destinationPin?: [number, number] | null;
  route?: any;
  onOriginDrag?: (event: { lngLat: LngLatLike }) => void;
  onDestinationDrag?: (event: { lngLat: LngLatLike }) => void;
}

const getVehicleColorClass = (status: VehicleStatus) => {
  switch (status) {
    case 'Libre':
      return 'text-green-500'; // Green
    case 'En descanso':
      return 'text-yellow-400'; // Yellow
    case 'Ocupado':
      return 'text-red-500'; // Red
    case 'En camino':
      return 'text-blue-500'; // Blue
    case 'En espera':
      return 'text-orange-400'; // Orange
    default:
      return 'text-gray-400';
  }
};

export default function VehicleMap({
  vehicles,
  originPin,
  destinationPin,
  route,
  onOriginDrag,
  onDestinationDrag,
}: VehicleMapProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [zoneLayer, setZoneLayer] =
    React.useState<FeatureCollection<Polygon> | null>(null);
  const [labelLayer, setLabelLayer] =
    React.useState<FeatureCollection<Point> | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
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
      console.error('Failed to parse zones from localStorage', error);
    }
  }, []);

  const vehiclesOnMap = vehicles.filter(
    v =>
      [
        'Libre',
        'En descanso',
        'Ocupado',
        'En camino',
        'En espera',
      ].includes(v.status) &&
      v.latitude &&
      v.longitude
  );

  const routeGeoJson: FeatureCollection<LineString> | null = route
    ? {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: route,
          },
        ],
      }
    : null;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -65.4117,
          latitude: -24.7859,
          zoom: 13,
        }}
        style={{ width: '100%', height: '100%' }}
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
                'fill-outline-color': ['get', 'color'],
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
                'text-ignore-placement': true,
              }}
              paint={{
                'text-color': '#ffffff',
                'text-halo-color': '#000000',
                'text-halo-width': 1,
              }}
            />
          </Source>
        )}

        {vehiclesOnMap.map(vehicle => (
          <Marker
            key={vehicle.id}
            longitude={vehicle.longitude!}
            latitude={vehicle.latitude!}
            anchor="bottom"
          >
            <div className="relative">
                <Car className={`h-8 w-8 ${getVehicleColorClass(vehicle.status)} drop-shadow-md`} />
                <div className="absolute inset-0 flex items-center justify-center -mt-1">
                    <span className="text-[10px] font-bold text-black">
                        {vehicle.unitNumber}
                    </span>
                </div>
            </div>
          </Marker>
        ))}

        {originPin && (
          <Marker 
            longitude={originPin[0]} 
            latitude={originPin[1]} 
            anchor="bottom"
            draggable
            onDragEnd={onOriginDrag}
          >
            <MapPin className="h-8 w-8 text-primary cursor-move" />
          </Marker>
        )}
        
        {destinationPin && (
          <Marker 
            longitude={destinationPin[0]} 
            latitude={destinationPin[1]} 
            anchor="bottom"
            draggable
            onDragEnd={onDestinationDrag}
          >
            <Flag className="h-8 w-8 text-destructive cursor-move" />
          </Marker>
        )}
        
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer
              id="route"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 5,
                'line-opacity': 0.8,
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}
