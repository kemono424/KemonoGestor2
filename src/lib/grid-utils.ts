
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { GridConfig, ZoneDefinition } from '@/types';

export function generateGridLayer(
  gridConfig: GridConfig,
  zones: ZoneDefinition[],
  cellAssignments: Record<string, string | null>,
  selectedCells: Set<string>
): FeatureCollection<Polygon> {
  const { rows, cols, center, cellWidth, cellHeight } = gridConfig;
  const features: Feature<Polygon>[] = [];

  const startLat = center.lat + (rows / 2) * cellHeight;
  const startLng = center.lng - (cols / 2) * cellWidth;

  const zoneColorMap = zones.reduce((acc, zone) => {
    acc[zone.id] = zone.color;
    return acc;
  }, {} as Record<string, string>);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = `${r}-${c}`;
      const lat = startLat - r * cellHeight;
      const lng = startLng + c * cellWidth;

      const coordinates: [number, number][] = [
        [lng, lat],
        [lng + cellWidth, lat],
        [lng + cellWidth, lat - cellHeight],
        [lng, lat - cellHeight],
        [lng, lat],
      ];

      const assignedZoneId = cellAssignments[cellId];
      let color = '#FFFF00'; // Default to yellow for unassigned cells

      if (assignedZoneId && zoneColorMap[assignedZoneId]) {
        color = zoneColorMap[assignedZoneId];
      }
      
      if (selectedCells.has(cellId)) {
        color = '#00FFFF'; // Cyan for selection
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

export function areCellsConnected(cellIds: string[]): boolean {
    if (cellIds.length <= 1) {
        return true;
    }

    const cellSet = new Set(cellIds);
    const visited = new Set<string>();
    const queue: string[] = [cellIds[0]];
    visited.add(cellIds[0]);

    while(queue.length > 0) {
        const cellId = queue.shift()!;
        const [r, c] = cellId.split('-').map(Number);

        const neighbors = [
            `${r-1}-${c}`, // top
            `${r+1}-${c}`, // bottom
            `${r}-${c-1}`, // left
            `${r}-${c+1}`, // right
        ];
        
        for (const neighborId of neighbors) {
            if (cellSet.has(neighborId) && !visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push(neighborId);
            }
        }
    }

    return visited.size === cellIds.length;
}
