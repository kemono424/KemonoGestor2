'use client';

import * as React from 'react';
import Map, { useControl } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Zone } from '@/types';
import type { Feature, Polygon } from 'geojson';

// This component encapsulates the MapboxDraw control and its logic.
// It must be a child of the <Map> component to have access to the map context.
function DrawControlComponent(props: {
  draw: MapboxDraw;
  onUpdate: (features: Feature<Polygon>[]) => void;
  zones: Zone[];
}) {
  const { draw, onUpdate, zones } = props;

  useControl(
    () => draw,
    ({ map }) => {
      // onAdd: This function is called when the control is added to the map.
      // Load initial zones from props
      const features = zones.map(z => ({
        id: z.id,
        type: 'Feature' as const,
        properties: { name: z.name, color: z.color },
        geometry: z.geometry,
      }));
      draw.add({ type: 'FeatureCollection', features });

      // Event handler for draw events
      const handleDrawEvents = () => {
        onUpdate(draw.getAll().features as Feature<Polygon>[]);
      };

      // Register event listeners
      map.on('draw.create', handleDrawEvents);
      map.on('draw.update', handleDrawEvents);
      map.on('draw.delete', handleDrawEvents);

      // onRemove: Cleanup function
      return () => {
        map.off('draw.create', handleDrawEvents);
        map.off('draw.update', handleDrawEvents);
        map.off('draw.delete', handleDrawEvents);
      };
    },
    {
      position: 'top-left',
    }
  );

  return null;
}

interface ZoneMapEditorProps {
  zones: Zone[];
  onUpdate: (features: Feature<Polygon>[]) => void;
}

export default function ZoneMapEditor({
  zones,
  onUpdate,
}: ZoneMapEditorProps) {
  // Memoize the draw instance so it's not recreated on every render
  const draw = React.useMemo(
    () =>
      new MapboxDraw({
        displayControlsDefault: true,
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
              'fill-opacity': 0.2,
            },
          },
          {
            id: 'gl-draw-polygon-stroke-inactive',
            type: 'line',
            filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 2,
            },
          },
        ],
      }),
    []
  );

  return (
    <div className="h-[calc(100vh-14rem)] min-h-[500px] w-full rounded-lg overflow-hidden border">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -65.4117,
          latitude: -24.7859,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        <DrawControlComponent draw={draw} onUpdate={onUpdate} zones={zones} />
      </Map>
    </div>
  );
}
