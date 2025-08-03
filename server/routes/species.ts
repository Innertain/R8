import { Router } from 'express';
import { inaturalistService } from '../services/inaturalistService';
import { db } from '../db';
import { bioregionSpeciesCache } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Bioregion bounds data (in a real app, this would come from a database)
const BIOREGION_BOUNDS: Record<string, {north: number, south: number, east: number, west: number, name: string}> = {
  'na_pacific_northwest': {
    north: 61.0,
    south: 39.0,
    east: -116.0,
    west: -180.0,
    name: 'Pacific Northwest Coastal Forests'
  },
  'na_great_plains': {
    north: 54.0,
    south: 30.0,
    east: -93.0,
    west: -108.0,
    name: 'Great Plains Mixed Grasslands'
  },
  'na_appalachian': {
    north: 47.0,
    south: 30.0,
    east: -67.0,
    west: -90.0,
    name: 'Appalachian Mixed Mesophytic Forests'
  },
  'na_sonoran_desert': {
    north: 35.0,
    south: 23.0,
    east: -109.0,
    west: -117.0,
    name: 'Sonoran Desert'
  },
  'na_california_chaparral': {
    north: 40.0,
    south: 30.0,
    east: -114.0,
    west: -125.0,
    name: 'California Chaparral & Woodlands'
  },
  'na_hawaiian_dry_forests': {
    north: 22.5,
    south: 18.5,
    east: -154.0,
    west: -161.0,
    name: 'Hawaiian Tropical Dry Forests'
  },
  'hawaiian_tropical_dry_forests': {
    north: 22.5,
    south: 18.5,
    east: -154.0,
    west: -161.0,
    name: 'Hawaiian Tropical Dry Forests'
  },
  'hawaiian_tropical_rainforests': {
    north: 20.3,
    south: 19.2,
    east: -154.8,
    west: -156.2,
    name: 'Hawaiian Tropical Rainforests'
  },
  'southeastern_mixed_forests': {
    north: 39.0,
    south: 30.0,
    east: -75.0,
    west: -94.0,
    name: 'Southeastern Mixed Forests'
  },
  'na_alaskan_boreal': {
    north: 71.0,
    south: 60.0,
    east: -130.0,
    west: -180.0,
    name: 'Alaska Boreal Interior'
  },
};

// GET /api/species/bioregion/:bioregionId
router.get('/bioregion/:bioregionId', async (req, res) => {
  try {
    const { bioregionId } = req.params;
    
    const bounds = BIOREGION_BOUNDS[bioregionId];
    if (!bounds) {
      return res.status(404).json({ error: 'Bioregion not found' });
    }

    console.log(`Fetching species data for bioregion: ${bioregionId}`);
    
    const speciesData = await inaturalistService.getSpeciesForBioregion(bioregionId, bounds);
    
    // Also fetch conservation projects
    const conservationProjects = await inaturalistService.getConservationProjects(bounds.name);
    
    res.json({
      bioregionId,
      bioregionName: bounds.name,
      species: speciesData,
      conservationProjects,
      dataSource: 'iNaturalist',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching species data:', error);
    res.status(500).json({ error: 'Failed to fetch species data' });
  }
});

// GET /api/species/cache-status
router.get('/cache-status', async (req, res) => {
  try {
    const cacheEntries = await db.select().from(bioregionSpeciesCache);
    
    const status = cacheEntries.map(entry => ({
      bioregionId: entry.bioregionId,
      totalSpecies: entry.totalSpeciesCount,
      lastSynced: entry.lastSyncedAt,
      status: entry.syncStatus,
      hoursOld: Math.round((Date.now() - entry.lastSyncedAt.getTime()) / (1000 * 60 * 60)),
    }));
    
    res.json({
      totalBioregions: cacheEntries.length,
      cacheEntries: status,
    });
  } catch (error) {
    console.error('Error fetching cache status:', error);
    res.status(500).json({ error: 'Failed to fetch cache status' });
  }
});

// POST /api/species/refresh-cache/:bioregionId
router.post('/refresh-cache/:bioregionId', async (req, res) => {
  try {
    const { bioregionId } = req.params;
    
    const bounds = BIOREGION_BOUNDS[bioregionId];
    if (!bounds) {
      return res.status(404).json({ error: 'Bioregion not found' });
    }

    console.log(`Force refreshing cache for bioregion: ${bioregionId}`);
    
    // Clear existing cache
    await db.delete(bioregionSpeciesCache).where(eq(bioregionSpeciesCache.bioregionId, bioregionId));
    
    // Fetch fresh data
    const speciesData = await inaturalistService.getSpeciesForBioregion(bioregionId, bounds);
    
    res.json({
      bioregionId,
      message: 'Cache refreshed successfully',
      species: speciesData,
    });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({ error: 'Failed to refresh cache' });
  }
});

export default router;