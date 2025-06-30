'use client';

import * as React from 'react';
import Map, { MapRef, useControl } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Zone } from '@/types';
import type { Feature, Polygon } from 'geojson';

interface ZoneMapEditorProps {
  zones: Zone[];
  onUpdate: (features: Feature<Polygon>[]) => void;
}

export default function ZoneMapEditor({
  zones,
  onUpdate,
}: ZoneMapEditorProps) {
  const mapRef = React.useRef<MapRef>(null);

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
    // Set styles for the drawn features
    styles: [
      // ACTIVE (being drawn)
      {
        id: 'gl-draw-polygon-fill-active',
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
        paint: {
          'fill-color': '#4A90E2',
          'fill-opacity': 0.1,
        },
      },
      {
        id: 'gl-draw-polygon-stroke-active',
        type: 'line',
        filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#4A90E2',
          'line-dasharray': [0.2, 2],
          'line-width': 2,
        },
      },
      // INACTIVE
       {
        id: 'gl-draw-polygon-fill-inactive',
        type: 'fill',
        filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
        paint: {
          'fill-color': ['get', 'color'],
          'fill-outline-color': ['get', 'color'],
          'fill-opacity': 0.2
        }
      },
      {
        id: 'gl-draw-polygon-stroke-inactive',
        type: 'line',
        filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': ['get', 'color'],
            'line-width': 2
        }
      },
    ],
  });
  
  useControl(() => draw, { position: 'top-left' });

  const onMapLoad = React.useCallback(
    (e: mapboxgl.MapboxEvent) => {
      const features = zones.map(z => ({
        id: z.id,
        type: 'Feature' as const,
        properties: { name: z.name, color: z.color },
        geometry: z.geometry,
      }));
      draw.add({ type: 'FeatureCollection', features });

      // Attach event listeners for updates
      const map = e.target;
      map.on('draw.create', (evt) => onUpdate(draw.getAll().features as Feature<Polygon>[]));
      map.on('draw.update', (evt) => onUpdate(draw.getAll().features as Feature<Polygon>[]));
      map.on('draw.delete', (evt) => onUpdate(draw.getAll().features as Feature<Polygon>[]));
    },
    [draw, zones, onUpdate]
  );
  

  return (
    <div className="h-[calc(100vh-14rem)] min-h-[500px] w-full rounded-lg overflow-hidden border">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -65.4117,
          latitude: -24.7859,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={onMapLoad}
      ></Map>
    </div>
  );
}
