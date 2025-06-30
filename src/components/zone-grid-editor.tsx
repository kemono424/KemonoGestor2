
'use client';

import * as React from 'react';
import Map, { Source, Layer, MapRef, MapLayerMouseEvent } from 'react-map-gl';
import type { FeatureCollection } from 'geojson';
import type { GridConfig, ZoneDefinition } from '@/types';
import { generateGridLayer } from '@/lib/grid-utils';

interface ZoneGridEditorProps {
  gridConfig: GridConfig;
  zones: ZoneDefinition[];
  cellAssignments: Record<string, string | null>;
  selectedCells: Set<string>;
  onCellClick: (cellId: string) => void;
}

export default function ZoneGridEditor({
  gridConfig,
  zones,
  cellAssignments,
  selectedCells,
  onCellClick,
}: ZoneGridEditorProps) {
  const mapRef = React.useRef<MapRef>(null);

  // This effect handles updating the grid data imperatively without re-rendering the Source component.
  // This is a more stable and performant pattern for dynamic map data.
  React.useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const source = map.getSource('grid-source') as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      const gridLayerData = generateGridLayer(gridConfig, zones, cellAssignments, selectedCells);
      source.setData(gridLayerData);
    }
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

  // The source is initialized with empty data. Updates will be pushed imperatively.
  const initialGridData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
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
        <Source id="grid-source" type="geojson" data={initialGridData}>
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
              'line-opacity': 0.8,
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
