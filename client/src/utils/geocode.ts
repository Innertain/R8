// Geocoding utilities for ZIP codes and states

// State centroids for approximate geographic centers
const STATE_CENTROIDS = {
  'AL': { lat: 32.806671, lng: -86.791130, name: 'Alabama' },
  'AK': { lat: 61.370716, lng: -152.404419, name: 'Alaska' },
  'AZ': { lat: 33.729759, lng: -111.431221, name: 'Arizona' },
  'AR': { lat: 34.969704, lng: -92.373123, name: 'Arkansas' },
  'CA': { lat: 36.116203, lng: -119.681564, name: 'California' },
  'CO': { lat: 39.059811, lng: -105.311104, name: 'Colorado' },
  'CT': { lat: 41.597782, lng: -72.755371, name: 'Connecticut' },
  'DE': { lat: 39.318523, lng: -75.507141, name: 'Delaware' },
  'FL': { lat: 27.766279, lng: -81.686783, name: 'Florida' },
  'GA': { lat: 33.040619, lng: -83.643074, name: 'Georgia' },
  'HI': { lat: 21.094318, lng: -157.498337, name: 'Hawaii' },
  'ID': { lat: 44.240459, lng: -114.478828, name: 'Idaho' },
  'IL': { lat: 40.349457, lng: -88.986137, name: 'Illinois' },
  'IN': { lat: 39.849426, lng: -86.258278, name: 'Indiana' },
  'IA': { lat: 42.011539, lng: -93.210526, name: 'Iowa' },
  'KS': { lat: 38.5266, lng: -96.726486, name: 'Kansas' },
  'KY': { lat: 37.668140, lng: -84.670067, name: 'Kentucky' },
  'LA': { lat: 31.169546, lng: -91.867805, name: 'Louisiana' },
  'ME': { lat: 44.693947, lng: -69.381927, name: 'Maine' },
  'MD': { lat: 39.063946, lng: -76.802101, name: 'Maryland' },
  'MA': { lat: 42.230171, lng: -71.530106, name: 'Massachusetts' },
  'MI': { lat: 43.326618, lng: -84.536095, name: 'Michigan' },
  'MN': { lat: 45.694454, lng: -93.900192, name: 'Minnesota' },
  'MS': { lat: 32.741646, lng: -89.678696, name: 'Mississippi' },
  'MO': { lat: 38.456085, lng: -92.288368, name: 'Missouri' },
  'MT': { lat: 47.052952, lng: -110.454353, name: 'Montana' },
  'NE': { lat: 41.125370, lng: -98.268082, name: 'Nebraska' },
  'NV': { lat: 38.313515, lng: -117.055374, name: 'Nevada' },
  'NH': { lat: 43.452492, lng: -71.563896, name: 'New Hampshire' },
  'NJ': { lat: 40.298904, lng: -74.521011, name: 'New Jersey' },
  'NM': { lat: 34.840515, lng: -106.248482, name: 'New Mexico' },
  'NY': { lat: 42.165726, lng: -74.948051, name: 'New York' },
  'NC': { lat: 35.630066, lng: -79.806419, name: 'North Carolina' },
  'ND': { lat: 47.528912, lng: -99.784012, name: 'North Dakota' },
  'OH': { lat: 40.388783, lng: -82.764915, name: 'Ohio' },
  'OK': { lat: 35.565342, lng: -96.928917, name: 'Oklahoma' },
  'OR': { lat: 44.572021, lng: -122.070938, name: 'Oregon' },
  'PA': { lat: 40.590752, lng: -77.209755, name: 'Pennsylvania' },
  'RI': { lat: 41.680893, lng: -71.51178, name: 'Rhode Island' },
  'SC': { lat: 33.856892, lng: -80.945007, name: 'South Carolina' },
  'SD': { lat: 44.299782, lng: -99.438828, name: 'South Dakota' },
  'TN': { lat: 35.747845, lng: -86.692345, name: 'Tennessee' },
  'TX': { lat: 31.054487, lng: -97.563461, name: 'Texas' },
  'UT': { lat: 40.150032, lng: -111.862434, name: 'Utah' },
  'VT': { lat: 44.045876, lng: -72.710686, name: 'Vermont' },
  'VA': { lat: 37.769337, lng: -78.169968, name: 'Virginia' },
  'WA': { lat: 47.400902, lng: -121.490494, name: 'Washington' },
  'WV': { lat: 38.491226, lng: -80.954453, name: 'West Virginia' },
  'WI': { lat: 44.268543, lng: -89.616508, name: 'Wisconsin' },
  'WY': { lat: 42.755966, lng: -107.302490, name: 'Wyoming' },
  'DC': { lat: 38.897438, lng: -77.026817, name: 'District of Columbia' }
};

interface LocationResult {
  lat: number;
  lng: number;
  name: string;
}

/**
 * Geocode a ZIP code using Zippopotam.us API
 */
export async function geocodeZipCode(zipCode: string): Promise<LocationResult | null> {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    
    if (!response.ok) {
      throw new Error(`ZIP code not found: ${zipCode}`);
    }
    
    const data = await response.json();
    
    if (data.places && data.places.length > 0) {
      const place = data.places[0];
      return {
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude),
        name: `${place['place name']}, ${place['state abbreviation']} ${zipCode}`
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding ZIP code:', error);
    return null;
  }
}

/**
 * Get coordinates for a state name or abbreviation
 */
export function geocodeState(stateInput: string): LocationResult | null {
  const input = stateInput.toUpperCase().trim();
  
  // Check if it's a state abbreviation
  if (STATE_CENTROIDS[input]) {
    return STATE_CENTROIDS[input];
  }
  
  // Check if it's a full state name
  const stateEntry = Object.entries(STATE_CENTROIDS).find(
    ([abbrev, data]) => data.name.toUpperCase() === input
  );
  
  if (stateEntry) {
    return stateEntry[1];
  }
  
  return null;
}

/**
 * Generic geocoding function that handles both ZIP codes and states
 */
export async function geocodeLocation(location: string): Promise<LocationResult | null> {
  const trimmedLocation = location.trim();
  
  // Check if it looks like a ZIP code (5 digits)
  if (/^\d{5}$/.test(trimmedLocation)) {
    return await geocodeZipCode(trimmedLocation);
  }
  
  // Try as state
  return geocodeState(trimmedLocation);
}

interface StateOption {
  value: string;
  label: string;
  coordinates: { lat: number; lng: number };
}

/**
 * Get all available state options for dropdowns/autocomplete
 */
export function getAllStates(): StateOption[] {
  return Object.entries(STATE_CENTROIDS).map(([abbrev, data]) => ({
    value: abbrev,
    label: `${data.name} (${abbrev})`,
    coordinates: { lat: data.lat, lng: data.lng }
  }));
}