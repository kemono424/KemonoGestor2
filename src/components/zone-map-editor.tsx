'use client';

import * as React from 'react';
import { useEffect } from 'react';
import Map, { useControl, ControlPosition } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Feature, Polygon } from 'geojson';

// This is the control component that manages MapboxDraw
const DrawControl = (props: {
  onEvent: (event: { type: string; features: Feature<Polygon>[] }) => void;
  setDrawInstance: (instance: MapboxDraw) => void;
}) => {
  const { onEvent, setDrawInstance } = props;

  const draw = useControl<MapboxDraw>(
    () => new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
        userProperties: true,
        styles: [
          { id: 'gl-draw-polygon-fill-inactive', type: 'fill', filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']], paint: { 'fill-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-outline-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-opacity': 0.2 }},
          { id: 'gl-draw-polygon-stroke-inactive', type: 'line', filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'line-width': 2 }},
          { id: 'gl-draw-polygon-fill-active', type: 'fill', filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']], paint: { 'fill-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-opacity': 0.1 }},
          { id: 'gl-draw-polygon-stroke-active', type: 'line', filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'line-width': 2 }},
        ],
      }),
    {
      position: 'top-left' as ControlPosition,
      onAdd: (map) => {
        map.on('draw.create', onEvent);
        map.on('draw.update', onEvent);
        map.on('draw.delete', onEvent);
        map.on('draw.selectionchange', onEvent);
      },
      onRemove: (map) => {
        map.off('draw.create', onEvent);
        map.off('draw.update', onEvent);
        map.off('draw.delete', onEvent);
        map.off('draw.selectionchange', onEvent);
      },
    }
  );
  
  // Set the draw instance in a useEffect to avoid setting state during render
  useEffect(() => {
    if (draw) {
        setDrawInstance(draw);
    }
  }, [draw, setDrawInstance]);

  return null;
};


interface ZoneMapEditorProps {
  onUpdate: (event: { type: string; features: Feature<Polygon>[] }) => void;
  setDrawInstance: (instance: any) => void;
}

export default function ZoneMapEditor({
  onUpdate,
  setDrawInstance,
}: ZoneMapEditorProps) {
  // This component now only sets up the Map and the DrawControl.
  // The parent component (`ZonesPage`) is responsible for populating
  // the map with zones via the `drawInstance`.
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
          onEvent={onUpdate}
          setDrawInstance={setDrawInstance}
        />
      </Map>
    </div>
  );
}
