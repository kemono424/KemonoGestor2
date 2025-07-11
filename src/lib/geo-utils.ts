
import type { Polygon, Feature, FeatureCollection, Point } from 'geojson';
import type { GridConfig, ZoneDefinition } from '@/types';

type GeoPoint = [number, number]; // [longitude, latitude]

/**
 * Checks if a point is inside a polygon using the ray-casting algorithm.
 * @param point The point to check, as [longitude, latitude].
 * @param polygon The polygon geometry.
 * @returns True if the point is inside the polygon, false otherwise.
 */
export function isPointInPolygon(point: GeoPoint, polygon: Polygon): boolean {
  if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) {
    return false;
  }
  const vs = polygon.coordinates[0]; // Use the outer ring
  const x = point[0];
  const y = point[1];

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculates the squared Euclidean distance between two points.
 * This is faster than the actual distance and is sufficient for comparison.
 * @param p1 The first point, as [longitude, latitude].
 * @param p2 The second point, as [longitude, latitude].
 * @returns The squared distance.
 */
export function calculateDistanceSquared(p1: GeoPoint, p2: GeoPoint): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}


/**
 * Finds which zone a given point (lat, lng) belongs to.
 * NOTE: This is a simplified, client-side implementation. In a real app,
 * this would likely be a more efficient spatial query on a database.
 * @param point The point to check.
 * @param zones A list of all zone definitions.
 * @param gridConfig The configuration of the grid system.
 * @returns The ZoneDefinition if found, otherwise null.
 */
export function findZoneForPoint(
  point: GeoPoint,
  zones: ZoneDefinition[],
  gridConfig: GridConfig
): ZoneDefinition | null {
  if (!zones || !gridConfig) return null;

  const { rows, cols, center, cellWidth, cellHeight } = gridConfig;
  const startLat = center.lat + (rows / 2) * cellHeight;
  const startLng = center.lng - (cols / 2) * cellWidth;

  const pointLng = point[0];
  const pointLat = point[1];
  
  // Quick check if point is outside the entire grid bounds
  if (
    pointLat > startLat ||
    pointLat < startLat - rows * cellHeight ||
    pointLng < startLng ||
    pointLng > startLng + cols * cellWidth
  ) {
    return null;
  }

  // Determine which cell the point falls into
  const c = Math.floor((pointLng - startLng) / cellWidth);
  const r = Math.floor((startLat - pointLat) / cellHeight);
  const cellId = `${r}-${c}`;

  // Find which zone this cell belongs to
  const foundZone = zones.find(zone => zone.cellIds.includes(cellId));

  return foundZone || null;
}
