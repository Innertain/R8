// Simple in-memory cache implementation
class SimpleCache<K, V> {
  private cache = new Map<K, { value: V; expires: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(options: { max: number; ttl: number }) {
    this.maxSize = options.max;
    this.ttl = options.ttl;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl
    });
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Cache geocoding results to avoid repeated API calls
const geocodingCache = new SimpleCache<string, [number, number]>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24 * 7 // 7 days
});

// Fallback state centers for when geocoding fails
const US_STATE_CENTERS: Record<string, [number, number]> = {
  'AL': [-86.79113, 32.377716], 'AK': [-152.404419, 64.0685], 'AZ': [-111.093731, 34.048927],
  'AR': [-92.373123, 34.736009], 'CA': [-119.681564, 36.116203], 'CO': [-105.311104, 39.059811],
  'CT': [-72.755371, 41.767], 'DE': [-75.526755, 39.161921], 'FL': [-81.686783, 27.766279],
  'GA': [-83.441162, 32.157435], 'HI': [-157.826182, 21.30895], 'ID': [-114.478828, 44.240459],
  'IL': [-88.986137, 40.192138], 'IN': [-86.147685, 40.790798], 'IA': [-93.620866, 42.032974],
  'KS': [-98.484246, 39.04], 'KY': [-84.86311, 37.522], 'LA': [-91.953125, 31.244823],
  'ME': [-69.765261, 44.323535], 'MD': [-76.501157, 39.045755], 'MA': [-71.530106, 42.407211],
  'MI': [-84.5467, 44.182205], 'MN': [-94.636230, 46.729553], 'MS': [-89.678696, 32.741646],
  'MO': [-91.831833, 38.572954], 'MT': [-110.454353, 47.052166], 'NE': [-99.901813, 41.492537],
  'NV': [-116.419389, 38.313515], 'NH': [-71.549709, 43.452492], 'NJ': [-74.756138, 40.221741],
  'NM': [-106.248482, 34.307144], 'NY': [-74.948051, 42.165726], 'NC': [-79.806419, 35.759573],
  'ND': [-101.002012, 47.551493], 'OH': [-82.764915, 40.269789], 'OK': [-97.534994, 35.482309],
  'OR': [-120.767635, 43.804133], 'PA': [-77.209755, 40.269789], 'RI': [-71.422132, 41.82355],
  'SC': [-81.035, 33.836081], 'SD': [-99.901813, 44.299782], 'TN': [-86.784, 35.860119],
  'TX': [-97.563461, 31.054487], 'UT': [-111.892622, 39.419220], 'VT': [-72.580536, 44.26639],
  'VA': [-78.169968, 37.54], 'WA': [-121.490494, 47.042418], 'WV': [-80.954570, 38.349497],
  'WI': [-89.616508, 44.268543], 'WY': [-107.30249, 43.075968]
};

// Known coastal and marine areas with exact coordinates
const MARINE_AREAS: Record<string, [number, number]> = {
  'outer banks': [-75.5296, 35.2193],
  'hatteras island': [-75.7004, 35.2193],
  'ocracoke island': [-75.9876, 35.1154],
  'cape hatteras': [-75.6504, 35.2315],
  'cape fear': [-78.0661, 33.8376],
  'pamlico sound': [-76.0327, 35.4193],
  'albemarle sound': [-75.9327, 36.1193],
  'east carteret': [-76.5833, 34.7333],
  'west carteret': [-77.0833, 34.7333],
  'dare county': [-75.6333, 35.5333],
  'cape cod bay': [-70.2962, 41.6688],
  'buzzards bay': [-70.7461, 41.5579],
  'nantucket sound': [-70.2962, 41.3579],
  'martha\'s vineyard': [-70.6015, 41.3888],
  'block island sound': [-71.5561, 41.1579],
  'long island sound': [-72.6851, 41.2579],
  'chesapeake bay': [-76.1327, 38.5767],
  'delaware bay': [-75.0941, 39.0458],
  'galveston bay': [-94.9027, 29.3013],
  'mobile bay': [-87.9073, 30.4518],
  'tampa bay': [-82.4572, 27.9506],
  'san francisco bay': [-122.4194, 37.7749],
  'puget sound': [-122.4194, 47.6062],
  'lake michigan': [-87.0073, 43.5291],
  'lake erie': [-81.2428, 42.2619],
  'lake superior': [-87.5467, 47.7211]
};

export async function geocodeLocation(location: string): Promise<[number, number]> {
  if (!location) {
    return [-95.7129, 37.0902]; // Center US fallback
  }

  const cleanLocation = location.toLowerCase().trim();
  
  // Check cache first
  if (geocodingCache.has(cleanLocation)) {
    return geocodingCache.get(cleanLocation)!;
  }

  // Check known marine areas first (most specific)
  for (const [area, coords] of Object.entries(MARINE_AREAS)) {
    if (cleanLocation.includes(area)) {
      geocodingCache.set(cleanLocation, coords);
      return coords;
    }
  }

  try {
    // Use OpenStreetMap Nominatim API (free, no key required)
    const query = encodeURIComponent(`${location}, United States`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=us`,
      {
        headers: {
          'User-Agent': 'WeatherAlert-Platform/1.0'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        geocodingCache.set(cleanLocation, coords);
        console.log(`✓ Geocoded "${location}" -> [${coords[0]}, ${coords[1]}]`);
        return coords;
      }
    }
  } catch (error) {
    console.warn(`Geocoding failed for "${location}":`, error);
  }

  // Fallback to state detection
  const stateMatch = location.match(/\b([A-Z]{2})\b/);
  if (stateMatch) {
    const stateCode = stateMatch[1];
    if (US_STATE_CENTERS[stateCode]) {
      const coords = US_STATE_CENTERS[stateCode];
      // Add small random offset to prevent overlapping markers
      const offsetCoords: [number, number] = [
        coords[0] + (Math.random() - 0.5) * 0.5,
        coords[1] + (Math.random() - 0.5) * 0.3
      ];
      geocodingCache.set(cleanLocation, offsetCoords);
      console.log(`✓ State fallback for "${location}" -> [${offsetCoords[0]}, ${offsetCoords[1]}]`);
      return offsetCoords;
    }
  }

  // Final fallback
  const fallback: [number, number] = [-95.7129, 37.0902];
  console.warn(`Using fallback coordinates for: ${location}`);
  geocodingCache.set(cleanLocation, fallback);
  return fallback;
}

export function clearGeocodingCache(): void {
  geocodingCache.clear();
}