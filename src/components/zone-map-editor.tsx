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
        onSelect(e.features.length > 0 ? (e.features[0].id as string) : null);
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
          {
            id: 'gl-draw-polygon-fill-active',
            type: 'fill',
            filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
            paint: { 'fill-color': '#3498DB', 'fill-opacity': 0.1 },
          },
          {
            id: 'gl-draw-polygon-stroke-active',
            type: 'line',
            filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: { 'line-color': '#3498DB', 'line-dasharray': [0.2, 2], 'line-width': 2 },
          },
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
        setIsReady(false);
      },
    }
  );

  React.useEffect(() => {
    if (!isReady) {
      return;
    }
    
    const draw = drawRef.current;
    if (!draw) {
        return;
    }

    const existingFeatures = draw.getAll().features;
    if (existingFeatures.length === zones.length) {
      let propertiesChanged = false;
      for (const zone of zones) {
        const feature = existingFeatures.find((f) => f.id === zone.id);
        if (feature && (feature.properties?.color !== zone.color || feature.properties?.name !== zone.name)) {
          propertiesChanged = true;
          break;
        }
      }
      if (!propertiesChanged) return;
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
  selectedZoneId,
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
