
'use client';

import * as React from 'react';
import { useEffect, useRef } from 'react';
import Map, { useControl, ControlPosition } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Feature, Polygon } from 'geojson';

// This is the control component that integrates MapboxDraw with react-map-gl
const DrawControl = (props: {
  onUpdate: (event: { type: string; features: Feature<Polygon>[] }) => void;
  setDrawInstance: (instance: MapboxDraw) => void;
}) => {
  const { onUpdate, setDrawInstance } = props;

  // Use a ref to hold the latest onUpdate callback. This is a common React pattern
  // to avoid issues with stale closures in event listeners.
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const draw = useControl<MapboxDraw>(
    () => new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
        userProperties: true, // This is crucial for storing custom properties like name and color
        styles: [
          // Inactive state (default coloring using properties)
          { id: 'gl-draw-polygon-fill-inactive', type: 'fill', filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']], paint: { 'fill-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-outline-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-opacity': 0.2 }},
          { id: 'gl-draw-polygon-stroke-inactive', type: 'line', filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'line-width': 2 }},
          // Active state (when being edited)
          { id: 'gl-draw-polygon-fill-active', type: 'fill', filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']], paint: { 'fill-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'fill-opacity': 0.1 }},
          { id: 'gl-draw-polygon-stroke-active', type: 'line', filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['coalesce', ['get', 'color'], '#3b82f6'], 'line-width': 2 }},
        ],
      }),
    {
      position: 'top-left' as ControlPosition,
      // `onAdd` is the official lifecycle hook to set up event listeners.
      onAdd: (map) => {
        const eventHandler = (e: any) => onUpdateRef.current(e);
        map.on('draw.create', eventHandler);
        map.on('draw.update', eventHandler);
        map.on('draw.delete', eventHandler);
        map.on('draw.selectionchange', eventHandler);
      },
      // `onRemove` is for cleanup.
      onRemove: (map) => {
        // Unsubscribe from events to prevent memory leaks
        map.off('draw.create', onUpdateRef.current);
        map.off('draw.update', onUpdateRef.current);
        map.off('draw.delete', onUpdateRef.current);
        map.off('draw.selectionchange', onUpdateRef.current);
      },
    }
  );
  
  // Expose the draw instance to the parent component via the setDrawInstance prop
  useEffect(() => {
    if (draw) {
        setDrawInstance(draw);
    }
  }, [draw, setDrawInstance]);

  // The control itself does not render anything visual; it's all handled by the map.
  return null;
};

interface ZoneMapEditorProps {
  onUpdate: (event: { type: string; features: Feature<Polygon>[] }) => void;
  setDrawInstance: (instance: any) => void;
}

// This is now a much "dumber" component. It only sets up the Map and the DrawControl.
// The parent component (`ZonesPage`) is responsible for all the logic and state management.
export default function ZoneMapEditor({ onUpdate, setDrawInstance }: ZoneMapEditorProps) {
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
          setDrawInstance={setDrawInstance}
        />
      </Map>
    </div>
  );
}
