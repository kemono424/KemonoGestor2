import type { Polygon } from 'geojson';

type Point = [number, number]; // [longitude, latitude]

/**
 * Checks if a point is inside a polygon using the ray-casting algorithm.
 * @param point The point to check, as [longitude, latitude].
 * @param polygon The polygon geometry.
 * @returns True if the point is inside the polygon, false otherwise.
 */
export function isPointInPolygon(point: Point, polygon: Polygon): boolean {
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
export function calculateDistanceSquared(p1: Point, p2: Point): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
}
