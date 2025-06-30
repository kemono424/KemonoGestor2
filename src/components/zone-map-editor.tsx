'use client';

import * as React from 'react';
import Map, { useControl, ControlPosition } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Zone } from '@/types';
import type { Feature, Polygon, FeatureCollection } from 'geojson';

// This is the control component that manages MapboxDraw
const DrawControl = (props: {
  onEvent: (event: { type: string; features: Feature[] }) => void;
  setDrawInstance: (instance: MapboxDraw) => void;
}) => {

  const drawInstanceRef = React.useRef<MapboxDraw | null>(null);

  useControl<MapboxDraw>(
    () => {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
        userProperties: true,
        styles: [
          { id: 'gl-draw-polygon-fill-inactive', type: 'fill', filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']], paint: { 'fill-color': ['get', 'color'], 'fill-outline-color': ['get', 'color'], 'fill-opacity': 0.2 }},
          { id: 'gl-draw-polygon-stroke-inactive', type: 'line', filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 2 }},
          { id: 'gl-draw-polygon-fill-active', type: 'fill', filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']], paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.1 }},
          { id: 'gl-draw-polygon-stroke-active', type: 'line', filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#3b82f6', 'line-width': 2 }},
        ],
      });
      drawInstanceRef.current = draw;
      props.setDrawInstance(draw);
      return draw;
    },
    {
      position: 'top-left' as ControlPosition,
      onAdd: (map) => {
        map.on('draw.create', props.onEvent);
        map.on('draw.update', props.onEvent);
        map.on('draw.delete', props.onEvent);
        map.on('draw.selectionchange', props.onEvent);
      },
      onRemove: (map) => {
        map.off('draw.create', props.onEvent);
        map.off('draw.update', props.onEvent);
        map.off('draw.delete', props.onEvent);
        map.off('draw.selectionchange', props.onEvent);
        drawInstanceRef.current = null;
      },
    }
  );

  return null;
};


interface ZoneMapEditorProps {
  zones: Zone[];
  onUpdate: (event: { type: string; features: Feature<Polygon>[] }) => void;
  setDrawInstance: (instance: any) => void;
}

export default function ZoneMapEditor({
  zones,
  onUpdate,
  setDrawInstance,
}: ZoneMapEditorProps) {
  const mapRef = React.useRef<any>();
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);

  const features = React.useMemo(() => zones.map(z => ({
    id: z.id,
    type: 'Feature' as const,
    properties: { name: z.name, color: z.color },
    geometry: z.geometry,
  })), [zones]);

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  }

  React.useEffect(() => {
    const draw = (mapRef.current?.getMap()._controls as any[])?.find(c => c instanceof MapboxDraw);
    if (draw && isMapLoaded) {
      const existingIds = new Set(draw.getAll().features.map(f => f.id));
      const newIds = new Set(features.map(f => f.id));
      
      const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
      if (idsToDelete.length > 0) {
        draw.delete(idsToDelete);
      }

      for (const feature of features) {
        draw.add(feature); 
      }
    }
  }, [features, isMapLoaded]);

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
        onLoad={() => setIsMapLoaded(true)}
      >
        <DrawControl
          onEvent={onUpdate}
          setDrawInstance={setDrawInstance}
        />
      </Map>
    </div>
  );
}
