import axios from 'axios';

const IUCN_BASE_URL = 'https://apiv3.iucnredlist.org/api/v3';

interface IUCNSpecies {
  taxonid: number;
  scientific_name: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  main_common_name?: string;
  authority: string;
  published_year: number;
  assessment_date: string;
  category: string; // EX, EW, CR, EN, VU, NT, LC, DD, NE
  criteria?: string;
  population_trend?: string;
  marine_system: boolean;
  freshwater_system: boolean;
  terrestrial_system: boolean;
}

interface IUCNAssessment {
  species_id: number;
  assessment_date: string;
  category: string;
  criteria?: string;
  population_trend?: string;
  scope?: string;
  threats?: Array<{
    code: string;
    title: string;
    timing: string;
    scope: string;
    severity: string;
  }>;
  conservation_measures?: Array<{
    code: string;
    title: string;
  }>;
}

interface IUCNRegionResponse {
  name: string;
  identifier: string;
}

class IUCNService {
  private apiKey: string | null = null;

  constructor() {
    // IUCN Red List API key - free for non-commercial use
    this.apiKey = process.env.IUCN_API_KEY || null;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T | null> {
    if (!this.apiKey) {
      console.log('IUCN API key not configured, using fallback data');
      return null;
    }

    try {
      const response = await axios.get(`${IUCN_BASE_URL}${endpoint}`, {
        params: {
          token: this.apiKey,
          ...params
        },
        timeout: 15000,
        headers: {
          'User-Agent': 'R8-Conservation-Platform/1.0 (educational-research)',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`IUCN API error for ${endpoint}:`, error.message);
      return null;
    }
  }

  async getSpeciesByRegion(countryCode: string): Promise<string[]> {
    const response = await this.makeRequest<any>(`/country/getspecies/${countryCode}`);

    if (!response?.result) return [];

    return response.result
      .filter((species: IUCNSpecies) => 
        ['CR', 'EN', 'VU', 'NT'].includes(species.category) // Only threatened categories
      )
      .map((species: IUCNSpecies) => species.main_common_name || species.scientific_name)
      .slice(0, 200); // Reasonable limit for API performance
  }

  async getSpeciesAssessment(speciesName: string): Promise<IUCNAssessment | null> {
    const response = await this.makeRequest<any>(`/species/${encodeURIComponent(speciesName)}`);

    if (!response?.result?.[0]) return null;

    const species = response.result[0];
    return {
      species_id: species.taxonid,
      assessment_date: species.assessment_date,
      category: species.category,
      criteria: species.criteria,
      population_trend: species.population_trend,
      scope: species.scope,
    };
  }

  async getSpeciesThreats(speciesName: string): Promise<Array<{code: string; title: string; timing: string; scope: string; severity: string}>> {
    const response = await this.makeRequest<any>(`/threats/species/name/${encodeURIComponent(speciesName)}`);

    if (!response?.result) return [];

    return response.result.map((threat: any) => ({
      code: threat.code,
      title: threat.title,
      timing: threat.timing,
      scope: threat.scope,
      severity: threat.severity,
    }));
  }

  async getSpeciesConservationMeasures(speciesName: string): Promise<Array<{code: string; title: string}>> {
    const response = await this.makeRequest<any>(`/measures/species/name/${encodeURIComponent(speciesName)}`);

    if (!response?.result) return [];

    return response.result.map((measure: any) => ({
      code: measure.code,
      title: measure.title,
    }));
  }

  // Get enhanced species data with IUCN information
  async getEnhancedSpeciesData(speciesNames: string[]): Promise<Record<string, {
    category: string;
    assessment_date: string;
    population_trend?: string;
    threats: Array<{code: string; title: string; severity: string}>;
    conservation_measures: Array<{code: string; title: string}>;
  }>> {
    const enhancedData: Record<string, any> = {};

    // Process species in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < speciesNames.length; i += batchSize) {
      const batch = speciesNames.slice(i, i + batchSize);

      await Promise.all(batch.map(async (speciesName) => {
        try {
          const [assessment, threats, measures] = await Promise.all([
            this.getSpeciesAssessment(speciesName),
            this.getSpeciesThreats(speciesName),
            this.getSpeciesConservationMeasures(speciesName),
          ]);

          if (assessment) {
            enhancedData[speciesName] = {
              category: assessment.category,
              assessment_date: assessment.assessment_date,
              population_trend: assessment.population_trend,
              threats: threats || [],
              conservation_measures: measures || [],
            };
          }
        } catch (error) {
          console.log(`Failed to get IUCN data for ${speciesName}:`, error);
        }
      }));

      // Add delay between batches to respect rate limits
      if (i + batchSize < speciesNames.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return enhancedData;
  }

  // Fallback data for common threatened species when API is not available
  getFallbackThreatenedSpecies(bioregionId: string): string[] {
    const fallbackData: Record<string, string[]> = {
      'hawaiian_tropical_dry_forests': [
        'Hawaiian Monk Seal', 'Green Sea Turtle', 'Hawaiian Goose', 'Hawaiian Hoary Bat',
        'Hawaiian Stilt', 'Hawaiian Coot', 'Hawaiian Duck', 'Hawaiian Petrel',
        'Newell\'s Shearwater', 'Hawaiian Tree Snails', 'Happy-face Spider',
        'ʻŌhiʻa Lehua', 'Hawaiian Sandalwood', 'Loulu Palm', 'Hawaiian Gardenia',
        'Hawaiian Hibiscus', 'Silversword', 'Hawaiian Mint', 'Hawaiian Catchfly',
        'Hawaiian Goosefoot', 'Hawaiian Ladies\' Tresses', 'Hawaiian Schiedea'
      ],
      'hawaiian_tropical_high_shrublands': [
        'Hawaiian Monk Seal', 'Green Sea Turtle', 'Hawaiian Goose', 'Hawaiian Hoary Bat',
        'Hawaiian Stilt', 'Hawaiian Coot', 'Hawaiian Duck', 'Hawaiian Petrel',
        'Silversword', 'Hawaiian Mint', 'Hawaiian Catchfly', 'Hawaiian Goosefoot'
      ],
      'southeastern_mixed_forests': [
        'Red Wolf', 'Florida Panther', 'Manatee', 'Red-cockaded Woodpecker',
        'Gopher Tortoise', 'Eastern Indigo Snake', 'Pine Barrens Treefrog',
        'Bog Turtle', 'Dwarf Wedgemussel', 'Carolina Heelsplitter',
        'Venus Flytrap', 'American Chestnut', 'Pondberry', 'Georgia Aster',
        'Rough-leaved Loosestrife', 'Swamp Pink', 'Small Whorled Pogonia',
        'Harperella', 'Schweinitz\'s Sunflower', 'Smooth Coneflower'
      ],
      'appalachian_mixed_mesophytic_forests': [
        'Indiana Bat', 'Northern Long-eared Bat', 'Virginia Big-eared Bat',
        'Allegheny Woodrat', 'New England Cottontail', 'Golden-winged Warbler',
        'Cerulean Warbler', 'Wood Thrush', 'Eastern Hellbender',
        'Cheat Mountain Salamander', 'Shenandoah Salamander', 'Green Salamander',
        'Bog Turtle', 'Timber Rattlesnake', 'Eastern Box Turtle',
        'Dwarf Wedgemussel', 'Clubshell', 'Northern Riffleshell',
        'American Chestnut', 'Running Buffalo Clover', 'Virginia Spiraea',
        'Shale Barren Rock-cress', 'Small Whorled Pogonia', 'Northeastern Bulrush'
      ],
      'cascadia_bioregion': [
        'Northern Spotted Owl', 'Marbled Murrelet', 'Chinook Salmon', 'Coho Salmon',
        'Steelhead Trout', 'Bull Trout', 'Orca', 'Steller Sea Lion', 'Grizzly Bear',
        'Wolverine', 'Canada Lynx', 'Fisher', 'Western Snowy Plover', 'Streaked Horned Lark',
        'Taylor\'s Checkerspot Butterfly', 'Oregon Silverspot Butterfly', 'Western Painted Turtle',
        'Oregon Chub', 'Lost River Sucker', 'Shortnose Sucker', 'Bradshaw\'s Lomatium',
        'Willamette Daisy', 'Kincaid\'s Lupine', 'Nelson\'s Checker-mallow', 'Cook\'s Lomatium',
        'Rough Popcornflower', 'Large-flowered Woolly Meadowfoam', 'Dwarf Woolly Meadowfoam',
        'Golden Paintbrush', 'Showy Stickseed', 'Wenatchee Mountains Checker-mallow'
      ],
      'na_cascadia': [
        'Northern Spotted Owl', 'Marbled Murrelet', 'Chinook Salmon', 'Coho Salmon',
        'Steelhead Trout', 'Bull Trout', 'Orca', 'Steller Sea Lion', 'Grizzly Bear',
        'Wolverine', 'Canada Lynx', 'Fisher', 'Western Snowy Plover', 'Streaked Horned Lark',
        'Taylor\'s Checkerspot Butterfly', 'Oregon Silverspot Butterfly', 'Western Painted Turtle',
        'Oregon Chub', 'Lost River Sucker', 'Shortnose Sucker', 'Bradshaw\'s Lomatium',
        'Willamette Daisy', 'Kincaid\'s Lupine', 'Nelson\'s Checker-mallow', 'Cook\'s Lomatium'
      ],
      'na_california_chaparral': [
        'California Condor', 'San Joaquin Kit Fox', 'Sierra Nevada Red Fox', 'Morro Bay Kangaroo Rat',
        'Salt Marsh Harvest Mouse', 'Giant Kangaroo Rat', 'Blunt-nosed Leopard Lizard',
        'Alameda Whipsnake', 'Smith\'s Blue Butterfly', 'Monarch Butterfly',
        'California Tiger Salamander', 'Foothill Yellow-legged Frog', 'Arroyo Toad',
        'Southwestern Willow Flycatcher', 'Least Bell\'s Vireo', 'California Gnatcatcher',
        'Island Fox', 'Black Swift', 'Yellow Rail', 'American White Pelican',
        'California Red-legged Frog', 'Ramona Lilac', 'California Poppy', 'Coastal Sage Scrub',
        'Indian Tiger Lily', 'San Diego Thornmint', 'Palmer\'s Ericameria', 'Munz\'s Sage'
      ]
    };

    return fallbackData[bioregionId] || [];
  }
}

export const iucnService = new IUCNService();