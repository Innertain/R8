// Turf.js polyfill for point-in-polygon functionality
// This provides the core functionality until @turf/turf can be properly installed

export interface Point {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Polygon {
  type: 'Polygon';
  coordinates: number[][][]; // Array of linear rings
}

export interface Feature<T = any> {
  type: 'Feature';
  geometry: T;
  properties: any;
}

/**
 * Determine if a point is inside a polygon using the ray casting algorithm
 * @param point - GeoJSON Point feature or [lng, lat] coordinates
 * @param polygon - GeoJSON Polygon feature
 * @returns boolean indicating if point is inside polygon
 */
export function booleanPointInPolygon(
  point: Point | [number, number] | Feature<Point>,
  polygon: Polygon | Feature<Polygon>
): boolean {
  // Extract coordinates from different input formats
  let pointCoords: [number, number];
  if (Array.isArray(point)) {
    pointCoords = point;
  } else if ('coordinates' in point) {
    pointCoords = point.coordinates;
  } else if ('geometry' in point && point.geometry.coordinates) {
    pointCoords = point.geometry.coordinates;
  } else {
    throw new Error('Invalid point format');
  }

  // Extract polygon coordinates
  let polygonCoords: number[][][];
  if ('coordinates' in polygon) {
    polygonCoords = polygon.coordinates;
  } else if ('geometry' in polygon && polygon.geometry.coordinates) {
    polygonCoords = polygon.geometry.coordinates;
  } else {
    throw new Error('Invalid polygon format');
  }

  const [x, y] = pointCoords;
  
  // Check each ring in the polygon (first ring is exterior, others are holes)
  let inside = false;
  
  for (let ringIndex = 0; ringIndex < polygonCoords.length; ringIndex++) {
    const ring = polygonCoords[ringIndex];
    let intersections = 0;
    
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        intersections++;
      }
    }
    
    const ringInside = intersections % 2 === 1;
    
    if (ringIndex === 0) {
      // Exterior ring
      inside = ringInside;
    } else {
      // Hole ring - if point is inside hole, it's not inside polygon
      if (ringInside) {
        inside = false;
        break;
      }
    }
  }
  
  return inside;
}

/**
 * Create a GeoJSON Point feature
 * @param coordinates - [longitude, latitude]
 * @param properties - Additional properties
 */
export function point(coordinates: [number, number], properties: any = {}): Feature<Point> {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates
    },
    properties
  };
}

/**
 * Calculate the bounding box of a polygon
 * @param polygon - GeoJSON Polygon feature
 * @returns [minLng, minLat, maxLng, maxLat]
 */
export function bbox(polygon: Polygon | Feature<Polygon>): [number, number, number, number] {
  let coords: number[][][];
  if ('coordinates' in polygon) {
    coords = polygon.coordinates;
  } else {
    coords = polygon.geometry.coordinates;
  }

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const ring of coords) {
    for (const [lng, lat] of ring) {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  }

  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Calculate the centroid of a polygon
 * @param polygon - GeoJSON Polygon feature
 * @returns [longitude, latitude]
 */
export function centroid(polygon: Polygon | Feature<Polygon>): [number, number] {
  const [minLng, minLat, maxLng, maxLat] = bbox(polygon);
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}