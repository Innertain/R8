import axios from 'axios';
import { db } from '../db';
import { apiUsageLog, bioregionSpeciesCache, speciesRecords } from '@shared/schema';
import { eq, desc, gte } from 'drizzle-orm';
import { usfwsService } from './usfwsService';
import { iucnService } from './iucnService';

const INATURALIST_BASE_URL = 'https://api.inaturalist.org/v1';
const RATE_LIMIT_BUFFER = 100; // Keep 100 requests in reserve
const CACHE_DURATION_HOURS = 24; // Cache species data for 24 hours
const PHOTO_CACHE_DURATION_HOURS = 72; // Cache photos for 3 days since they change less frequently

interface INaturalistTaxon {
  id: number;
  name: string;
  preferred_common_name?: string;
  rank: string;
  iconic_taxon_name?: string;
  conservation_status?: {
    status_name: string;
    iucn: number;
  };
  ancestors?: Array<{
    name: string;
    rank: string;
  }>;
  default_photo?: {
    url: string;
    medium_url: string;
  };
}

interface INaturalistSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  results: INaturalistTaxon[];
}

class INaturalistService {
  private async logApiUsage(endpoint: string, status: number, remaining?: number) {
    try {
      await db.insert(apiUsageLog).values({
        service: 'inaturalist',
        endpoint,
        responseStatus: status,
        rateLimitRemaining: remaining,
        rateLimitReset: remaining ? new Date(Date.now() + 3600000) : undefined, // 1 hour from now
      });
    } catch (error) {
      console.error('Failed to log API usage:', error);
    }
  }

  private async checkRateLimit(): Promise<boolean> {
    try {
      // Get recent API usage in the last hour
      const oneHourAgo = new Date(Date.now() - 3600000);
      const recentUsage = await db
        .select()
        .from(apiUsageLog)
        .where(
          eq(apiUsageLog.service, 'inaturalist')
        )
        .orderBy(desc(apiUsageLog.createdAt))
        .limit(1);

      if (recentUsage.length > 0) {
        const lastRequest = recentUsage[0];
        if (lastRequest.rateLimitRemaining && lastRequest.rateLimitRemaining < RATE_LIMIT_BUFFER) {
          console.log(`Rate limit approaching. Remaining: ${lastRequest.rateLimitRemaining}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow request on error
    }
  }

  private async makeApiRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T | null> {
    if (!(await this.checkRateLimit())) {
      console.log('Rate limit reached, skipping API request');
      return null;
    }

    try {
      const response = await axios.get(`${INATURALIST_BASE_URL}${endpoint}`, {
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'R8-Disaster-Relief-Platform/1.0 (educational-research)',
        },
      });

      // Log successful request
      const remaining = response.headers['x-ratelimit-remaining'];
      await this.logApiUsage(endpoint, response.status, remaining ? parseInt(remaining) : undefined);

      return response.data;
    } catch (error: any) {
      console.error(`iNaturalist API error for ${endpoint}:`, error.message);
      await this.logApiUsage(endpoint, error.response?.status || 500);
      return null;
    }
  }

  async getSpeciesForBioregion(bioregionId: string, bounds: {north: number, south: number, east: number, west: number}): Promise<{
    totalSpecies: number;
    flagshipSpecies: string[];
    endemicSpecies: string[];
    threatenedSpecies: string[];
    topTaxa: Record<string, number>;
    recentSightings: Array<{species: string, location: string, date: string, photo?: string, url: string}>;
    seasonalTrends: Record<string, number>;
    identificationNeeds: Array<{species: string, observations: number, url: string}>;
    speciesPhotos: Record<string, string>;
  }> {
    // Check if we have fresh cached data
    const cached = await db
      .select()
      .from(bioregionSpeciesCache)
      .where(eq(bioregionSpeciesCache.bioregionId, bioregionId))
      .limit(1);

    const cacheExpiry = new Date(Date.now() - CACHE_DURATION_HOURS * 3600000);
    
    if (cached.length > 0 && cached[0].lastSyncedAt > cacheExpiry) {
      console.log(`Using cached species data for ${bioregionId}`);
      
      // Always fetch fresh recent sightings and identification needs since they change daily
      const recentSightings = await this.getRecentSightings(bounds);
      const identificationNeeds = await this.getIdentificationNeeds(bounds);
      
      // Use cached photos if they're fresh (within 72 hours), otherwise fetch new ones
      const photoCacheExpiry = new Date(Date.now() - PHOTO_CACHE_DURATION_HOURS * 3600000);
      const threatenedSpecies = cached[0].threatenedSpecies || [];
      let speciesPhotos = (cached[0].speciesPhotos as Record<string, string>) || {};
      
      // Only fetch fresh photos if cache is older than 72 hours OR we have very few cached photos
      if (cached[0].lastSyncedAt <= photoCacheExpiry || Object.keys(speciesPhotos).length < Math.min(10, threatenedSpecies.length / 2)) {
        console.log(`🔄 Fetching fresh photos for ${threatenedSpecies.length} threatened species (cache expired or insufficient photos)`);
        const freshPhotos = await this.getSpeciesPhotos(threatenedSpecies, bounds);
        
        // Merge with existing cached photos to avoid losing good photos
        speciesPhotos = { ...speciesPhotos, ...freshPhotos };
        
        // Update cache with fresh photos
        try {
          await db
            .update(bioregionSpeciesCache)
            .set({ 
              speciesPhotos: speciesPhotos,
              updatedAt: new Date()
            })
            .where(eq(bioregionSpeciesCache.bioregionId, bioregionId));
          console.log(`📷 Updated photo cache for ${bioregionId} (${Object.keys(speciesPhotos).length} photos total)`);
        } catch (error) {
          console.error(`Failed to update photo cache:`, error);
        }
      } else {
        console.log(`📸 Using cached photos for ${bioregionId} (${Object.keys(speciesPhotos).length} photos cached, fresh for ${Math.round((Date.now() - cached[0].lastSyncedAt.getTime()) / (1000 * 60 * 60))}h)`);
      }
      
      return {
        totalSpecies: cached[0].totalSpeciesCount || 0,
        flagshipSpecies: cached[0].flagshipSpecies || [],
        endemicSpecies: cached[0].endemicSpecies || [],
        threatenedSpecies: threatenedSpecies,
        topTaxa: (cached[0].topTaxa as Record<string, number>) || {},
        recentSightings: recentSightings || [],
        seasonalTrends: (cached[0].seasonalTrends as Record<string, number>) || {},
        identificationNeeds: identificationNeeds || [],
        speciesPhotos: speciesPhotos,
      };
    }

    console.log(`Fetching fresh species data for ${bioregionId}`);

    // Fetch species data from iNaturalist
    const speciesData = await this.fetchSpeciesData(bounds, bioregionId);
    
    if (!speciesData) {
      console.log(`Failed to fetch species data for ${bioregionId}, using cached data if available`);
      if (cached.length > 0) {
        // Try to fetch fresh sightings even if main species data failed
        const recentSightings = await this.getRecentSightings(bounds);
        const identificationNeeds = await this.getIdentificationNeeds(bounds);
        
        return {
          totalSpecies: cached[0].totalSpeciesCount || 0,
          flagshipSpecies: cached[0].flagshipSpecies || [],
          endemicSpecies: cached[0].endemicSpecies || [],
          threatenedSpecies: cached[0].threatenedSpecies || [],
          topTaxa: (cached[0].topTaxa as Record<string, number>) || {},
          recentSightings: recentSightings || [],
          seasonalTrends: {},
          identificationNeeds: identificationNeeds || [],
          speciesPhotos: {},
        };
      }
      return {
        totalSpecies: 0,
        flagshipSpecies: [],
        endemicSpecies: [],
        threatenedSpecies: [],
        topTaxa: {},
        recentSightings: [],
        seasonalTrends: {},
        identificationNeeds: [],
        speciesPhotos: {},
      };
    }

    // Cache the new data
    await this.cacheSpeciesData(bioregionId, speciesData);

    return speciesData;
  }

  private async fetchSpeciesData(bounds: {north: number, south: number, east: number, west: number}, bioregionId?: string) {
    // Get species observations in the bioregion bounds
    const observationsResponse = await this.makeApiRequest<any>('/observations/species_counts', {
      nelat: bounds.north,
      nelng: bounds.east,
      swlat: bounds.south,
      swlng: bounds.west,
      per_page: 500, // Increased limit for comprehensive species data
      order: 'desc',
      order_by: 'count',
    });

    if (!observationsResponse) return null;

    const flagshipSpecies: string[] = [];
    const endemicSpecies: string[] = [];
    const threatenedSpecies: string[] = [];
    const topTaxa: Record<string, number> = {};

    // Process top species (increased to 200 for comprehensive coverage)
    const topSpecies = observationsResponse.results.slice(0, 200);
    
    for (const species of topSpecies) {
      if (species.taxon) {
        const taxon = species.taxon;
        
        // Add to flagship species if it has many observations
        if (species.count > 100) {
          const name = taxon.preferred_common_name || taxon.name;
          flagshipSpecies.push(name);
        }

        // Check conservation status
        if (taxon.conservation_status && taxon.conservation_status.iucn >= 4) { // Vulnerable or higher
          const name = taxon.preferred_common_name || taxon.name;
          threatenedSpecies.push(name);
        }

        // Count taxa
        const iconicTaxon = taxon.iconic_taxon_name || 'Other';
        topTaxa[iconicTaxon] = (topTaxa[iconicTaxon] || 0) + species.count;
      }
    }

    // Get recent sightings (last 30 days)
    const recentSightings = await this.getRecentSightings(bounds);
    
    // Get observations needing identification
    const identificationNeeds = await this.getIdentificationNeeds(bounds);
    
    // Get additional threatened species from multiple authoritative sources
    let uniqueThreatenedSpecies = threatenedSpecies.slice(0, 50); // From iNaturalist observations
    if (bioregionId) {
      const [usfwsSpecies, iucnFallbackSpecies] = await Promise.all([
        usfwsService.getRegionalThreatenedSpecies(bioregionId),
        Promise.resolve(iucnService.getFallbackThreatenedSpecies(bioregionId))
      ]);
      
      const combinedThreatenedSpecies = [
        ...threatenedSpecies,
        ...usfwsSpecies.slice(0, 50),
        ...iucnFallbackSpecies.slice(0, 50)
      ];
      
      // Remove duplicates and allow up to 150 total threatened species
      const uniqueSet = new Set(combinedThreatenedSpecies);
      uniqueThreatenedSpecies = Array.from(uniqueSet).slice(0, 150);
      
      console.log(`🦎 Found ${uniqueThreatenedSpecies.length} threatened species for ${bioregionId}`);
    }
    
    // Get photos for flagship and threatened species (prioritize threatened species)
    const allSpeciesForPhotos = [...uniqueThreatenedSpecies.slice(0, 30), ...flagshipSpecies.slice(0, 10)];
    console.log(`🔍 Fetching photos for ${allSpeciesForPhotos.length} species (${uniqueThreatenedSpecies.length} threatened, ${flagshipSpecies.length} flagship)`);
    const speciesPhotos = await this.getSpeciesPhotos(allSpeciesForPhotos, bounds);
    
    return {
      totalSpecies: observationsResponse.total_results || 0,
      flagshipSpecies: flagshipSpecies.slice(0, 10),
      endemicSpecies,
      threatenedSpecies: uniqueThreatenedSpecies,
      topTaxa,
      recentSightings: recentSightings || [],
      seasonalTrends: {},
      identificationNeeds: identificationNeeds || [],
      speciesPhotos: speciesPhotos || {},
    };
  }

  private async cacheSpeciesData(bioregionId: string, data: any) {
    try {
      const now = new Date();
      
      // Upsert cached data
      await db
        .insert(bioregionSpeciesCache)
        .values({
          bioregionId,
          totalSpeciesCount: data.totalSpecies,
          flagshipSpecies: data.flagshipSpecies,
          endemicSpecies: data.endemicSpecies,
          threatenedSpecies: data.threatenedSpecies,
          topTaxa: data.topTaxa,
          recentSightings: data.recentSightings,
          seasonalTrends: data.seasonalTrends,
          identificationNeeds: data.identificationNeeds,
          speciesPhotos: data.speciesPhotos,
          lastSyncedAt: now,
          syncStatus: 'success',
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: bioregionSpeciesCache.bioregionId,
          set: {
            totalSpeciesCount: data.totalSpecies,
            flagshipSpecies: data.flagshipSpecies,
            endemicSpecies: data.endemicSpecies,
            threatenedSpecies: data.threatenedSpecies,
            topTaxa: data.topTaxa,
            recentSightings: data.recentSightings,
            seasonalTrends: data.seasonalTrends,
            identificationNeeds: data.identificationNeeds,
            speciesPhotos: data.speciesPhotos,
            lastSyncedAt: now,
            syncStatus: 'success',
            updatedAt: now,
          },
        });

      console.log(`Cached species data for ${bioregionId}: ${data.totalSpecies} species`);
    } catch (error) {
      console.error(`Failed to cache species data for ${bioregionId}:`, error);
    }
  }

  async getRecentSightings(bounds: {north: number, south: number, east: number, west: number}) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const response = await this.makeApiRequest<any>('/observations', {
      nelat: bounds.north,
      nelng: bounds.east,
      swlat: bounds.south,
      swlng: bounds.west,
      per_page: 20,
      order: 'desc',
      order_by: 'created_at',
      created_d1: thirtyDaysAgo.toISOString().split('T')[0],
      photos: true,
      quality_grade: 'research',
    });

    if (!response?.results) return [];

    return response.results.map((obs: any) => ({
      species: obs.taxon?.preferred_common_name || obs.taxon?.name || 'Unknown',
      location: obs.place_guess || 'Unknown location',
      date: new Date(obs.created_at).toLocaleDateString(),
      photo: obs.photos?.[0]?.url?.replace('square', 'medium'),
      url: `https://www.inaturalist.org/observations/${obs.id}`,
    }));
  }

  // New method to get photos for specific species names
  async getSpeciesPhotos(speciesNames: string[], bounds: {north: number, south: number, east: number, west: number}): Promise<Record<string, string>> {
    const photos: Record<string, string> = {};
    
    for (const speciesName of speciesNames.slice(0, 30)) { // Increased to 30 for comprehensive photo coverage
      try {
        const response = await this.makeApiRequest<any>('/observations', {
          nelat: bounds.north,
          nelng: bounds.east, 
          swlat: bounds.south,
          swlng: bounds.west,
          taxon_name: speciesName,
          per_page: 1,
          order: 'desc',
          order_by: 'created_at',
          photos: true,
          quality_grade: 'research',
        });
        
        if (response?.results?.[0]?.photos?.[0]) {
          photos[speciesName] = response.results[0].photos[0].url.replace('square', 'medium');
        }
      } catch (error) {
        console.log(`Failed to get photo for ${speciesName}:`, error);
      }
    }
    
    return photos;
  }

  async getIdentificationNeeds(bounds: {north: number, south: number, east: number, west: number}) {
    const response = await this.makeApiRequest<any>('/observations', {
      nelat: bounds.north,
      nelng: bounds.east,
      swlat: bounds.south,
      swlng: bounds.west,
      per_page: 10,
      iconic_taxa: 'Plantae,Aves,Mammalia,Insecta',
      identified: false,
      photos: true,
      order: 'desc',
      order_by: 'created_at',
    });

    if (!response?.results) return [];

    const needsHelp = new Map<string, {count: number, url: string}>();
    
    response.results.forEach((obs: any) => {
      const taxon = obs.taxon?.preferred_common_name || obs.taxon?.name || 'Unknown species';
      if (!needsHelp.has(taxon)) {
        needsHelp.set(taxon, {
          count: 0,
          url: `https://www.inaturalist.org/observations/identify?taxon_id=${obs.taxon?.id || ''}`
        });
      }
      needsHelp.get(taxon)!.count++;
    });

    return Array.from(needsHelp.entries()).map(([species, data]) => ({
      species,
      observations: data.count,
      url: data.url,
    }));
  }

  async getConservationProjects(bioregionName: string): Promise<Array<{name: string, url: string, description: string}>> {
    const projectsResponse = await this.makeApiRequest<any>('/projects', {
      q: bioregionName,
      type: 'collection,bioblitz',
      per_page: 5,
    });

    if (!projectsResponse) return [];

    return projectsResponse.results.map((project: any) => ({
      name: project.title,
      url: `https://www.inaturalist.org/projects/${project.slug}`,
      description: project.description || 'Active citizen science project in your area',
    }));
  }
}

export const inaturalistService = new INaturalistService();