
'use client';

import * as React from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import type { MapLayerMouseEvent, ViewState } from 'react-map-gl';
import type { GridConfig, ZoneDefinition } from '@/types';
import { generateGridLayer } from '@/lib/grid-utils';

interface ZoneGridEditorProps {
  gridConfig: GridConfig;
  zones: ZoneDefinition[];
  cellAssignments: Record<string, string | null>;
  selectedCells: Set<string>;
  onCellClick: (cellId: string) => void;
  viewState: ViewState;
  onMapMove: (evt: { viewState: ViewState }) => void;
}

export default function ZoneGridEditor({
  gridConfig,
  zones,
  cellAssignments,
  selectedCells,
  onCellClick,
  viewState,
  onMapMove,
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
        {...viewState}
        ref={mapRef}
        onMove={onMapMove}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={handleMapClick}
        interactiveLayerIds={['grid-fill']}
      >
        <Source id="grid-source" type="geojson" data={gridLayer}>
          <Layer
            id="grid-fill"
            type="fill"
            source="grid-source"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': ['get', 'opacity'],
            }}
          />
          <Layer
            id="grid-stroke"
            type="line"
            source="grid-source"
            paint={{
              'line-color': '#ffffff',
              'line-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  2,
                  0.5
              ],
              'line-opacity': 0.2
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
