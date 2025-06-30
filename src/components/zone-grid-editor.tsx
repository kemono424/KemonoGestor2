'use client';

import * as React from 'react';
import Map, { Source, Layer, MapLayerMouseEvent } from 'react-map-gl';
import type { FeatureCollection } from 'geojson';

interface ZoneGridEditorProps {
  gridData: FeatureCollection;
  onCellClick: (cellId: string) => void;
}

export default function ZoneGridEditor({
  gridData,
  onCellClick,
}: ZoneGridEditorProps) {
  const handleMapClick = (e: MapLayerMouseEvent) => {
    const features = e.target.queryRenderedFeatures(e.point, {
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
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -65.4117,
          latitude: -24.7859,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={handleMapClick}
        interactiveLayerIds={['grid-fill']}
      >
        <Source id="grid-source" type="geojson" data={gridData}>
          <Layer
            id="grid-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.15,
            }}
          />
          <Layer
            id="grid-stroke"
            type="line"
            paint={{
              'line-color': '#FF0000',
              'line-width': 1,
              'line-opacity': 0.8,
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
