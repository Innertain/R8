// Native Land Digital API integration for indigenous territories
// API Documentation: https://api-docs.native-land.ca

const NATIVE_LAND_API_BASE = 'https://native-land.ca/api/index.php';

export interface IndigenousTerritory {
  slug: string;
  name: string;
  description?: string;
  website?: string;
  geometry: any;
  properties: {
    Name: string;
    Slug: string;
    description?: string;
    color?: string;
  };
}

export interface IndigenousLanguage {
  slug: string;
  name: string;
  description?: string;
  geometry: any;
  properties: {
    Name: string;
    Slug: string;
    description?: string;
    color?: string;
  };
}

export interface NativeLandResponse {
  territories: IndigenousTerritory[];
  languages: IndigenousLanguage[];
  treaties: any[];
}

/**
 * Fetch indigenous territories for a specific coordinate
 */
export const getIndigenousTerritoriesAtLocation = async (
  latitude: number,
  longitude: number
): Promise<IndigenousTerritory[]> => {
  try {
    const response = await fetch(
      `${NATIVE_LAND_API_BASE}?maps=territories&position=${latitude},${longitude}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const territories = await response.json();
    return Array.isArray(territories) ? territories : [];
  } catch (error) {
    console.error('Error fetching indigenous territories:', error);
    return [];
  }
};

/**
 * Fetch indigenous languages for a specific coordinate
 */
export const getIndigenousLanguagesAtLocation = async (
  latitude: number,
  longitude: number
): Promise<IndigenousLanguage[]> => {
  try {
    const response = await fetch(
      `${NATIVE_LAND_API_BASE}?maps=languages&position=${latitude},${longitude}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const languages = await response.json();
    return Array.isArray(languages) ? languages : [];
  } catch (error) {
    console.error('Error fetching indigenous languages:', error);
    return [];
  }
};

/**
 * Fetch both territories and languages for a location
 */
export const getIndigenousDataAtLocation = async (
  latitude: number,
  longitude: number
): Promise<NativeLandResponse> => {
  try {
    const response = await fetch(
      `${NATIVE_LAND_API_BASE}?maps=territories,languages&position=${latitude},${longitude}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse the response - Native Land API returns an array where territories and languages are mixed
    const territories: IndigenousTerritory[] = [];
    const languages: IndigenousLanguage[] = [];
    
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        // Distinguish between territories and languages based on properties
        if (item.properties && item.properties.Name) {
          // This is a basic heuristic - in practice you might need to make separate calls
          // or check for specific identifiers
          if (item.properties.Slug) {
            territories.push(item);
          }
        }
      });
    }
    
    return {
      territories,
      languages,
      treaties: [] // Treaties would need a separate call
    };
  } catch (error) {
    console.error('Error fetching indigenous data:', error);
    return {
      territories: [],
      languages: [],
      treaties: []
    };
  }
};

/**
 * Get GeoJSON for embedding territories on a map
 */
export const getIndigenousGeoJSON = async (
  latitude: number,
  longitude: number
): Promise<any> => {
  try {
    const territories = await getIndigenousTerritoriesAtLocation(latitude, longitude);
    
    return {
      type: 'FeatureCollection',
      features: territories
    };
  } catch (error) {
    console.error('Error creating GeoJSON:', error);
    return {
      type: 'FeatureCollection',
      features: []
    };
  }
};

/**
 * Create proper attribution for Native Land Digital
 */
export const getNativeLandAttribution = (): string => {
  return 'Indigenous territory data from Native Land Digital (native-land.ca). This map does not represent official or legal boundaries.';
};

/**
 * Enhanced indigenous knowledge integration
 * Combines local static data with real-time Native Land Digital API
 */
export const getEnhancedIndigenousInfo = async (
  ecoregion: any
): Promise<{
  staticKnowledge: any[];
  liveData: IndigenousTerritory[];
  languages: IndigenousLanguage[];
  attribution: string;
}> => {
  const staticKnowledge = ecoregion.indigenousTerritories || [];
  
  // Use the ecoregion coordinates to fetch live data
  const [lng, lat] = ecoregion.coordinates || [0, 0];
  
  let liveData: IndigenousTerritory[] = [];
  let languages: IndigenousLanguage[] = [];
  
  if (lat !== 0 && lng !== 0) {
    try {
      const territories = await getIndigenousTerritoriesAtLocation(lat, lng);
      const langs = await getIndigenousLanguagesAtLocation(lat, lng);
      
      liveData = territories;
      languages = langs;
    } catch (error) {
      console.error('Failed to fetch live indigenous data:', error);
    }
  }
  
  return {
    staticKnowledge,
    liveData,
    languages,
    attribution: getNativeLandAttribution()
  };
};