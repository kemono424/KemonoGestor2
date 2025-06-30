
'use client';

import * as React from 'react';
import Map, { Source, Layer, MapRef, MapLayerMouseEvent } from 'react-map-gl';
import type { FeatureCollection } from 'geojson';

interface ZoneGridEditorProps {
  gridConfig: GridConfig;
  zones: ZoneDefinition[];
  cellAssignments: Record<string, string | null>;
  selectedCells: Set<string>;
  onCellClick: (cellId: string) => void;
}

// NOTE: This utility is being moved into the component to avoid import issues.
function generateGridLayer(
  gridConfig: GridConfig,
  zones: ZoneDefinition[],
  cellAssignments: Record<string, string | null>,
  selectedCells: Set<string>
): FeatureCollection {
  const { rows, cols, center, cellSize } = gridConfig;
  const features: any[] = [];

  const startLat = center.lat + (rows / 2) * cellSize;
  const startLng = center.lng - (cols / 2) * cellSize;

  const zoneColorMap = zones.reduce((acc, zone) => {
    acc[zone.id] = zone.color;
    return acc;
  }, {} as Record<string, string>);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = `${r}-${c}`;
      const lat = startLat - r * cellSize;
      const lng = startLng + c * cellSize;

      const coordinates: [number, number][] = [
        [lng, lat],
        [lng + cellSize, lat],
        [lng + cellSize, lat - cellSize],
        [lng, lat - cellSize],
        [lng, lat],
      ];

      const assignedZoneId = cellAssignments[cellId];
      let color = '#555555'; // Default mid-grey for unassigned cells

      if (assignedZoneId && zoneColorMap[assignedZoneId]) {
        color = zoneColorMap[assignedZoneId];
      }
      
      if (selectedCells.has(cellId)) {
        color = '#3b82f6'; // A distinct blue for selection
      }

      features.push({
        type: 'Feature',
        properties: {
          id: cellId,
          color: color,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      });
    }
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}


export default function ZoneGridEditor({
  gridConfig,
  zones,
  cellAssignments,
  selectedCells,
  onCellClick,
}: ZoneGridEditorProps) {
  const mapRef = React.useRef<MapRef>(null);

  const gridLayer = React.useMemo(() => {
    return generateGridLayer(gridConfig, zones, cellAssignments, selectedCells);
  }, [gridConfig, zones, cellAssignments, selectedCells]);


  const handleMapClick = (e: MapLayerMouseEvent) => {
    const features = mapRef.current?.queryRenderedFeatures(e.point, {
      layers: ['grid-fill'],
    });

    if (features && features.length > 0) {
      const clickedCellId = features[0].properties?.id;
      if (clickedCellId) {
        onCellClick(clickedCellId);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-14rem)] min-h-[500px] w-full rounded-lg overflow-hidden border">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: gridConfig.center.lng,
          latitude: gridConfig.center.lat,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={handleMapClick}
        interactiveLayerIds={['grid-fill']}
      >
        <Source id="grid-source" type="geojson" data={gridLayer}>
          <Layer
            id="grid-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.5,
            }}
          />
          <Layer
            id="grid-stroke"
            type="line"
            paint={{
              'line-color': '#FFFFFF',
              'line-width': 1,
              'line-opacity': 0.5,
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
