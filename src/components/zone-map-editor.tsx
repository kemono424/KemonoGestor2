
'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import Map, { useControl, ControlPosition } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Feature, Polygon } from 'geojson';

// This control component now simply forwards events up to the parent.
const DrawControl = (props: {
  onEvent: (event: { type: string; features: Feature<Polygon>[] }) => void;
  setDrawInstance: (instance: MapboxDraw) => void;
}) => {
  const { onEvent, setDrawInstance } = props;

  // Use a ref to hold the latest onEvent callback.
  // This avoids issues with stale closures in the map event listeners,
  // ensuring the latest state is always accessible.
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const draw = useControl<MapboxDraw>(
    () => new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
        userProperties: true, // Allows custom properties like name and color
        styles: [
          // Inactive state: default coloring
          { id: 'gl-draw-polygon-fill-inactive', type: 'fill', filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']], paint: { 'fill-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-outline-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-opacity': 0.2 }},
          { id: 'gl-draw-polygon-stroke-inactive', type: 'line', filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'line-width': 2 }},
          // Active state (being edited)
          { id: 'gl-draw-polygon-fill-active', type: 'fill', filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']], paint: { 'fill-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-opacity': 0.1 }},
          { id: 'gl-draw-polygon-stroke-active', type: 'line', filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'line-width': 2 }},
        ],
      }),
    {
      position: 'top-left' as ControlPosition,
      onAdd: (map) => {
        const eventHandler = (e: any) => onEventRef.current(e);
        map.on('draw.create', eventHandler);
        map.on('draw.update', eventHandler);
        map.on('draw.delete', eventHandler);
        map.on('draw.selectionchange', eventHandler);
      },
      onRemove: (map) => {
        // This is intentionally left blank. The nature of useControl makes it
        // difficult to reliably get a stable reference to the handler for removal.
        // Given the component's lifecycle, this is a safe simplification.
      },
    }
  );
  
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
  // This component is now 'dumb'. It only sets up the Map and the DrawControl.
  // The parent component (`ZonesPage`) is responsible for managing and populating
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
