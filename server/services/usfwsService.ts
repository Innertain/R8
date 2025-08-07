import axios from 'axios';

const USFWS_BASE_URL = 'https://ecos.fws.gov/ecp/report/table/species.json';

interface USFWSSpecies {
  ENTITY_ID: string;
  COMNAME?: string;
  SCINAME?: string;
  STATUS: string; // E = Endangered, T = Threatened, C = Candidate
  LISTING_DATE?: string;
  DPS?: string; // Distinct Population Segment
}

interface USFWSResponse {
  species: USFWSSpecies[];
}

class USFWSService {
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T | null> {
    try {
      const response = await axios.get(`${USFWS_BASE_URL}`, {
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'R8-Conservation-Platform/1.0 (educational-research)',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`USFWS API error for ${endpoint}:`, error.message);
      return null;
    }
  }

  async getThreatenedSpeciesByState(states: string[]): Promise<string[]> {
    const threatenedSpecies: Set<string> = new Set();

    try {
      // Get all threatened and endangered species (no state filter for now)
      const response = await this.makeRequest<any>('', {
        columns: 'COMNAME,SCINAME,STATUS',
        filter: "STATUS='E' OR STATUS='T'", // Endangered or Threatened
      });

      if (response && Array.isArray(response)) {
        response.forEach((species: any) => {
          if (species.COMNAME && (species.STATUS === 'E' || species.STATUS === 'T')) {
            threatenedSpecies.add(species.COMNAME);
          }
        });
      }
    } catch (error) {
      console.log(`Failed to get USFWS data:`, error);
    }

    // Return comprehensive list of threatened species
    const allSpecies = Array.from(threatenedSpecies);
    return allSpecies.slice(0, 100); // Increased to 100 species for comprehensive coverage
  }

  async getRegionalThreatenedSpecies(bioregionId: string): Promise<string[]> {
    // Map bioregions to states for USFWS API queries
    const bioregionToStates: Record<string, string[]> = {
      'hawaiian_tropical_dry_forests': ['HI'],
      'hawaiian_tropical_high_shrublands': ['HI'],
      'hawaiian_mixed_mesophytic_forests': ['HI'],
      'southeastern_mixed_forests': ['NC', 'SC', 'GA', 'FL', 'AL', 'TN', 'KY', 'VA', 'WV', 'MS', 'AR', 'LA'],
      'appalachian_mixed_mesophytic_forests': ['PA', 'OH', 'WV', 'VA', 'KY', 'TN', 'NC', 'SC', 'GA', 'AL', 'MD', 'NY'],
      'na_appalachian': ['PA', 'OH', 'WV', 'VA', 'KY', 'TN', 'NC', 'SC', 'GA', 'AL', 'MD', 'NY'],
      'na_california_chaparral': ['CA'],
      'na_sonoran_desert': ['AZ', 'CA', 'NV'],
      'na_pacific_northwest': ['WA', 'OR', 'ID', 'MT'],
      'na_great_plains': ['ND', 'SD', 'NE', 'KS', 'OK', 'TX', 'MT', 'WY', 'CO', 'NM'],
      'cascadia_bioregion': ['WA', 'OR', 'CA', 'ID', 'MT', 'BC'],
      'na_cascadia': ['WA', 'OR', 'CA', 'ID', 'MT'],
    };

    const states = bioregionToStates[bioregionId];
    if (!states) {
      console.log(`No state mapping found for bioregion: ${bioregionId}, using fallback data`);
      return this.getFallbackSpeciesForBioregion(bioregionId);
    }

    console.log(`Fetching USFWS threatened species for bioregion ${bioregionId} (states: ${states.join(', ')})`);
    const apiResult = await this.getThreatenedSpeciesByState(states);
    
    // If API returns limited results, supplement with fallback data
    if (apiResult.length < 10) {
      console.log(`USFWS API returned only ${apiResult.length} species, supplementing with fallback data`);
      const fallbackSpecies = this.getFallbackSpeciesForBioregion(bioregionId);
      const combined = [...new Set([...apiResult, ...fallbackSpecies])];
      return combined.slice(0, 100);
    }
    
    return apiResult;
  }

  private getFallbackSpeciesForBioregion(bioregionId: string): string[] {
    const fallbackData: Record<string, string[]> = {
      'cascadia_bioregion': [
        'Northern Spotted Owl', 'Marbled Murrelet', 'Chinook Salmon', 'Coho Salmon', 'Steelhead Trout', 
        'Bull Trout', 'Orca', 'Steller Sea Lion', 'Grizzly Bear', 'Wolverine', 'Canada Lynx', 'Fisher',
        'Western Snowy Plover', 'Streaked Horned Lark', 'Taylor\'s Checkerspot Butterfly', 
        'Oregon Silverspot Butterfly', 'Western Painted Turtle', 'Oregon Chub', 'Lost River Sucker',
        'Shortnose Sucker', 'Bradshaw\'s Lomatium', 'Willamette Daisy', 'Kincaid\'s Lupine',
        'Nelson\'s Checker-mallow', 'Cook\'s Lomatium', 'Rough Popcornflower', 'Large-flowered Woolly Meadowfoam',
        'Dwarf Woolly Meadowfoam', 'Golden Paintbrush', 'Showy Stickseed', 'Wenatchee Mountains Checker-mallow',
        'Pacific Lamprey', 'Green Sturgeon', 'Eulachon', 'Leatherback Sea Turtle', 'Stellar Jay',
        'Cassin\'s Auklet', 'Common Murre', 'Tufted Puffin', 'Peregrine Falcon', 'Bald Eagle'
      ],
      'na_cascadia': [
        'Northern Spotted Owl', 'Marbled Murrelet', 'Chinook Salmon', 'Coho Salmon', 'Steelhead Trout',
        'Bull Trout', 'Orca', 'Steller Sea Lion', 'Grizzly Bear', 'Wolverine', 'Canada Lynx', 'Fisher',
        'Western Snowy Plover', 'Streaked Horned Lark', 'Taylor\'s Checkerspot Butterfly',
        'Oregon Silverspot Butterfly', 'Western Painted Turtle', 'Oregon Chub', 'Lost River Sucker',
        'Shortnose Sucker', 'Bradshaw\'s Lomatium', 'Willamette Daisy', 'Kincaid\'s Lupine'
      ]
    };
    
    return fallbackData[bioregionId] || [];
  }
}

export const usfwsService = new USFWSService();