import type { Express } from "express";
import { 
  fallbackHospitals, 
  fallbackShelters, 
  fallbackAirports, 
  fallbackPorts, 
  fallbackRoads 
} from "./jamaica-fallback-data";

// Jamaica bounding box coordinates
const JAMAICA_BBOX = {
  south: 17.7,
  west: -78.4,
  north: 18.6,
  east: -76.2
};

// Overpass API endpoint
const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Cache for infrastructure data (reduce API calls)
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 3600000; // 1 hour

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function queryOverpass(query: string): Promise<any> {
  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  return await response.json();
}

function convertToGeoJSON(overpassData: any, type: string): any {
  const features = overpassData.elements
    .filter((el: any) => el.lat && el.lon) // Only include elements with coordinates
    .map((el: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [el.lon, el.lat]
      },
      properties: {
        id: el.id,
        type: type,
        name: el.tags?.name || 'Unknown',
        ...el.tags
      }
    }));

  return {
    type: 'FeatureCollection',
    features
  };
}

export default function registerJamaicaRoutes(app: Express) {
  // Get hospitals and health facilities
  app.get("/api/jamaica/hospitals", async (req, res) => {
    try {
      const cacheKey = 'jamaica-hospitals';
      const cached = getCached(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const query = `
        [out:json][timeout:60];
        (
          node["amenity"="hospital"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["amenity"="clinic"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["amenity"="doctors"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["healthcare"="hospital"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
        );
        out center;
      `;

      const data = await queryOverpass(query);
      const geojson = convertToGeoJSON(data, 'hospital');
      
      setCache(cacheKey, geojson);
      res.json(geojson);
    } catch (error: any) {
      console.error('Error fetching Jamaica hospitals:', error);
      console.log('Using fallback hospital data');
      res.json(fallbackHospitals);
    }
  });

  // Get emergency shelters
  app.get("/api/jamaica/shelters", async (req, res) => {
    try {
      const cacheKey = 'jamaica-shelters';
      const cached = getCached(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const query = `
        [out:json][timeout:60];
        (
          node["amenity"="shelter"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["emergency"="assembly_point"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["amenity"="community_centre"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["building"="church"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["amenity"="school"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
        );
        out center;
      `;

      const data = await queryOverpass(query);
      const geojson = convertToGeoJSON(data, 'shelter');
      
      setCache(cacheKey, geojson);
      res.json(geojson);
    } catch (error: any) {
      console.error('Error fetching Jamaica shelters:', error);
      console.log('Using fallback shelter data');
      res.json(fallbackShelters);
    }
  });

  // Get airports and helipads
  app.get("/api/jamaica/airports", async (req, res) => {
    try {
      const cacheKey = 'jamaica-airports';
      const cached = getCached(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const query = `
        [out:json][timeout:60];
        (
          node["aeroway"="aerodrome"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["aeroway"="helipad"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["aeroway"="heliport"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
        );
        out center;
      `;

      const data = await queryOverpass(query);
      const geojson = convertToGeoJSON(data, 'airport');
      
      setCache(cacheKey, geojson);
      res.json(geojson);
    } catch (error: any) {
      console.error('Error fetching Jamaica airports:', error);
      console.log('Using fallback airport data');
      res.json(fallbackAirports);
    }
  });

  // Get ports and harbors
  app.get("/api/jamaica/ports", async (req, res) => {
    try {
      const cacheKey = 'jamaica-ports';
      const cached = getCached(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const query = `
        [out:json][timeout:60];
        (
          node["harbour"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["amenity"="ferry_terminal"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["man_made"="pier"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          node["landuse"="port"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
        );
        out center;
      `;

      const data = await queryOverpass(query);
      const geojson = convertToGeoJSON(data, 'port');
      
      setCache(cacheKey, geojson);
      res.json(geojson);
    } catch (error: any) {
      console.error('Error fetching Jamaica ports:', error);
      console.log('Using fallback port data');
      res.json(fallbackPorts);
    }
  });

  // Get major roads
  app.get("/api/jamaica/roads", async (req, res) => {
    try {
      const cacheKey = 'jamaica-roads';
      const cached = getCached(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const query = `
        [out:json][timeout:60];
        (
          way["highway"="motorway"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          way["highway"="trunk"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
          way["highway"="primary"](${JAMAICA_BBOX.south},${JAMAICA_BBOX.west},${JAMAICA_BBOX.north},${JAMAICA_BBOX.east});
        );
        out geom;
      `;

      const data = await queryOverpass(query);
      
      // Convert ways (lines) to GeoJSON LineStrings
      const features = data.elements.map((el: any) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: el.geometry.map((point: any) => [point.lon, point.lat])
        },
        properties: {
          id: el.id,
          type: 'road',
          name: el.tags?.name || 'Unknown',
          highway: el.tags?.highway,
          ref: el.tags?.ref,
          ...el.tags
        }
      }));

      const geojson = {
        type: 'FeatureCollection',
        features
      };
      
      setCache(cacheKey, geojson);
      res.json(geojson);
    } catch (error: any) {
      console.error('Error fetching Jamaica roads:', error);
      console.log('Using fallback road data');
      res.json(fallbackRoads);
    }
  });

  // Get all infrastructure at once (for initial load)
  app.get("/api/jamaica/infrastructure", async (req, res) => {
    try {
      const [hospitals, shelters, airports, ports] = await Promise.all([
        fetch(`${req.protocol}://${req.get('host')}/api/jamaica/hospitals`).then(r => r.json()),
        fetch(`${req.protocol}://${req.get('host')}/api/jamaica/shelters`).then(r => r.json()),
        fetch(`${req.protocol}://${req.get('host')}/api/jamaica/airports`).then(r => r.json()),
        fetch(`${req.protocol}://${req.get('host')}/api/jamaica/ports`).then(r => r.json())
      ]);

      res.json({
        hospitals,
        shelters,
        airports,
        ports,
        bbox: JAMAICA_BBOX
      });
    } catch (error: any) {
      console.error('Error fetching Jamaica infrastructure:', error);
      res.status(500).json({ error: 'Failed to fetch infrastructure data', message: error.message });
    }
  });
}
