
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { GridConfig, ZoneDefinition } from '@/types';

export function generateGridLayer(
  gridConfig: GridConfig,
  zones: ZoneDefinition[],
  cellAssignments: Record<string, string | null>,
  selectedCells: Set<string>
): FeatureCollection<Polygon> {
  const { rows, cols, center, cellSize } = gridConfig;
  const features: Feature<Polygon>[] = [];

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
      let color = '#888888'; // Default color for unassigned cells
      let opacity = 0.2;

      if (selectedCells.has(cellId)) {
        color = '#3b82f6'; // Highlight color for selected cells
        opacity = 0.6;
      } else if (assignedZoneId && zoneColorMap[assignedZoneId]) {
        color = zoneColorMap[assignedZoneId];
        opacity = 0.5;
      }

      features.push({
        type: 'Feature',
        properties: {
          id: cellId,
          color: color,
          opacity: opacity,
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
