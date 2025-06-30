'use client';

import * as React from 'react';
import Map, { useControl, ControlPosition } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Zone } from '@/types';
import type { Feature, Polygon } from 'geojson';

const DrawControl = (props: {
  onUpdate: (features: Feature[]) => void;
  onSelect: (id: string | null) => void;
  zones: Zone[];
}) => {
  const { onUpdate, onSelect, zones } = props;
  const drawRef = React.useRef<MapboxDraw | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  const handleDrawEvent = React.useCallback(
    (e: { type: string; features: Feature[] }) => {
      const draw = drawRef.current;
      if (!draw) return;
      if (e.type === 'draw.selectionchange') {
        const selection = draw.getSelectedIds();
        onSelect(selection.length > 0 ? selection[0] : null);
      } else {
        onUpdate(draw.getAll().features);
      }
    },
    [onUpdate, onSelect]
  );

  useControl<MapboxDraw>(
    () => {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true, combine_features: false, uncombine_features: false },
        userProperties: true,
        styles: [
          // Active state styles
          {
            id: 'gl-draw-polygon-fill-active',
            type: 'fill',
            filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.1 },
          },
          {
            id: 'gl-draw-polygon-stroke-active',
            type: 'line',
            filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#3b82f6', 'line-width': 2 },
          },
           {
            'id': 'gl-draw-point-point-stroke-inactive',
            'type': 'circle',
            'filter': ['all',
              ['==', 'active', 'false'],
              ['==', '$type', 'Point'],
              ['!=', 'mode', 'static']
            ],
            'paint': {
              'circle-radius': 5,
              'circle-opacity': 0,
            }
          },
          // Inactive state styles
          {
            id: 'gl-draw-polygon-fill-inactive',
            type: 'fill',
            filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
            paint: { 'fill-color': ['get', 'color'], 'fill-outline-color': ['get', 'color'], 'fill-opacity': 0.2 },
          },
          {
            id: 'gl-draw-polygon-stroke-inactive',
            type: 'line',
            filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': ['get', 'color'], 'line-width': 2 },
          },
        ],
      });
      drawRef.current = draw;
      return draw;
    },
    {
      position: 'top-left' as ControlPosition,
      onAdd: (map) => {
        map.on('draw.create', handleDrawEvent);
        map.on('draw.update', handleDrawEvent);
        map.on('draw.delete', handleDrawEvent);
        map.on('draw.selectionchange', handleDrawEvent);
        setIsReady(true);
      },
      onRemove: (map) => {
        map.off('draw.create', handleDrawEvent);
        map.off('draw.update', handleDrawEvent);
        map.off('draw.delete', handleDrawEvent);
        map.off('draw.selectionchange', handleDrawEvent);
        drawRef.current = null;
        setIsReady(false);
      },
    }
  );

  React.useEffect(() => {
    if (!isReady || !drawRef.current) {
      return;
    }
    
    const draw = drawRef.current;
    const existingFeatures = draw.getAll().features;
    
    // Simple check to avoid unnecessary re-rendering
    if (existingFeatures.length === zones.length) {
      const allMatch = zones.every(zone => {
        const feature = existingFeatures.find(f => f.id === zone.id);
        return feature && feature.properties?.name === zone.name && feature.properties?.color === zone.color;
      });
      if (allMatch) return;
    }

    const features = zones.map((z) => ({
      id: z.id,
      type: 'Feature' as const,
      properties: { name: z.name, color: z.color },
      geometry: z.geometry,
    }));
    draw.set({ type: 'FeatureCollection', features });
  }, [zones, isReady]);

  return null;
};

interface ZoneMapEditorProps {
  zones: Zone[];
  onUpdate: (features: Feature<Polygon>[]) => void;
  onSelect: (zoneId: string | null) => void;
  selectedZoneId: string | null;
}

export default function ZoneMapEditor({
  zones,
  onUpdate,
  onSelect,
}: ZoneMapEditorProps) {
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
        <DrawControl
          onUpdate={onUpdate}
          onSelect={onSelect}
          zones={zones}
        />
      </Map>
    </div>
  );
}
