import axios from 'axios';

// Very conservative rate limiting to respect iNaturalist API
const API_DELAY = 2000; // 2 seconds between requests
const MAX_RETRIES = 3;
const BASE_URL = 'https://api.inaturalist.org/v1';

interface INaturalistObservation {
  id: number;
  species_guess: string;
  taxon?: {
    id: number;
    name: string;
    preferred_common_name?: string;
    iconic_taxon_name: string;
    photos?: Array<{
      medium_url: string;
      attribution: string;
    }>;
  };
  photos?: Array<{
    medium_url: string;
    attribution: string;
  }>;
  location?: string;
  observed_on: string;
}

interface SpeciesCount {
  taxon: {
    id: number;
    name: string;
    preferred_common_name?: string;
    iconic_taxon_name: string;
    photos?: Array<{
      medium_url: string;
      attribution: string;
    }>;
  };
  count: number;
}

interface CachedSpeciesData {
  species: SpeciesCount[];
  cached_at: string;
  bioregion_id: string;
}

// In-memory cache for species data (30-day cache)
const speciesCache = new Map<string, CachedSpeciesData>();
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Rate limiting
let lastRequestTime = 0;
let requestCount = 0;
const MAX_REQUESTS_PER_HOUR = 50; // Very conservative limit

async function rateLimitedRequest(url: string): Promise<any> {
  // Check hourly limit
  const now = Date.now();
  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    const hoursSinceReset = (now - lastRequestTime) / (60 * 60 * 1000);
    if (hoursSinceReset < 1) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else {
      requestCount = 0; // Reset counter after an hour
    }
  }

  // Ensure minimum delay between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < API_DELAY) {
    await new Promise(resolve => setTimeout(resolve, API_DELAY - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
  requestCount++;

  console.log(`🔬 iNaturalist API request #${requestCount}: ${url}`);
  
  return await axios.get(url, {
    timeout: 10000,
    headers: {
      'User-Agent': 'R8-DisasterRelief-Platform/1.0 (Educational/Research Use)'
    }
  });
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.response?.status >= 500 || error.code === 'ECONNRESET')) {
      const delay = Math.pow(2, MAX_RETRIES - retries) * 1000; // Exponential backoff
      console.log(`⏳ Retrying iNaturalist request in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
}

function isCacheValid(cachedData: CachedSpeciesData): boolean {
  const cacheAge = Date.now() - new Date(cachedData.cached_at).getTime();
  return cacheAge < CACHE_DURATION;
}

export async function getBioregionSpecies(bioregionId: string, bbox?: [number, number, number, number]): Promise<SpeciesCount[]> {
  // Check cache first
  const cacheKey = `bioregion_${bioregionId}`;
  const cached = speciesCache.get(cacheKey);
  
  if (cached && isCacheValid(cached)) {
    console.log(`✅ Using cached species data for bioregion ${bioregionId}`);
    return cached.species;
  }

  // Only proceed if we have geographic bounds to limit the search
  if (!bbox) {
    console.log(`⚠️ No bounding box provided for bioregion ${bioregionId}, skipping API call`);
    return [];
  }

  try {
    // Very conservative request - only top 20 species to minimize API load
    const params = new URLSearchParams({
      nelat: bbox[3].toString(),
      nelng: bbox[2].toString(), 
      swlat: bbox[1].toString(),
      swlng: bbox[0].toString(),
      per_page: '20', // Very small batch
      order: 'desc',
      order_by: 'count',
      locale: 'en'
    });

    const response = await retryWithBackoff(() => 
      rateLimitedRequest(`${BASE_URL}/observations/species_counts?${params}`)
    );

    const species: SpeciesCount[] = response.data.results || [];
    
    // Cache the results for 30 days
    const cacheData: CachedSpeciesData = {
      species,
      cached_at: new Date().toISOString(),
      bioregion_id: bioregionId
    };
    
    speciesCache.set(cacheKey, cacheData);
    
    console.log(`✅ Cached ${species.length} species for bioregion ${bioregionId}`);
    return species;
    
  } catch (error: any) {
    console.error(`❌ iNaturalist API error for bioregion ${bioregionId}:`, error.message);
    
    // Return cached data even if expired, rather than failing
    if (cached) {
      console.log(`📦 Using expired cache for bioregion ${bioregionId} due to API error`);
      return cached.species;
    }
    
    return []; // Graceful fallback
  }
}

// Monitor API usage
export function getApiUsageStats() {
  return {
    requests_this_session: requestCount,
    cached_bioregions: speciesCache.size,
    last_request: lastRequestTime ? new Date(lastRequestTime).toISOString() : null,
    cache_entries: Array.from(speciesCache.keys())
  };
}

// Clear old cache entries periodically
setInterval(() => {
  let cleared = 0;
  speciesCache.forEach((data, key) => {
    if (!isCacheValid(data)) {
      speciesCache.delete(key);
      cleared++;
    }
  });
  if (cleared > 0) {
    console.log(`🧹 Cleared ${cleared} expired iNaturalist cache entries`);
  }
}, 60 * 60 * 1000); // Check every hour