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
      // Multiple API calls to get comprehensive data
      const queries = [
        { filter: "STATUS='E'", label: 'Endangered' },
        { filter: "STATUS='T'", label: 'Threatened' }, 
        { filter: "STATUS='C'", label: 'Candidate' },
        { filter: "STATUS='EXPN'", label: 'Experimental Non-Essential' },
        { filter: "STATUS='SAE'", label: 'Similarity of Appearance (Endangered)' },
        { filter: "STATUS='SAT'", label: 'Similarity of Appearance (Threatened)' }
      ];

      for (const query of queries) {
        console.log(`Fetching USFWS ${query.label} species...`);
        const response = await this.makeRequest<any>('', {
          columns: 'COMNAME,SCINAME,STATUS,DPS,LISTING_DATE',
          filter: query.filter,
        });

        if (response && Array.isArray(response)) {
          response.forEach((species: any) => {
            if (species.COMNAME) {
              // Include DPS (Distinct Population Segment) info if available
              const speciesName = species.DPS 
                ? `${species.COMNAME} (${species.DPS})`
                : species.COMNAME;
              threatenedSpecies.add(speciesName);
            }
            // Also add scientific names for species without common names
            if (!species.COMNAME && species.SCINAME) {
              threatenedSpecies.add(species.SCINAME);
            }
          });
        }

        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.log(`Failed to get USFWS data:`, error);
    }

    const allSpecies = Array.from(threatenedSpecies);
    console.log(`📊 USFWS API returned ${allSpecies.length} threatened/endangered species`);
    return allSpecies.slice(0, 200); // Increased limit for comprehensive coverage
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
        // Marine Species
        'Southern Resident Killer Whale', 'Steller Sea Lion', 'Leatherback Sea Turtle', 'Green Sturgeon', 
        'Eulachon', 'Pacific Lamprey', 'Bocaccio Rockfish', 'Yelloweye Rockfish', 'Canary Rockfish',
        'Marbled Murrelet', 'Short-tailed Albatross', 'Western Snowy Plover',
        
        // Anadromous Fish
        'Chinook Salmon (Puget Sound ESU)', 'Chinook Salmon (Hood Canal Summer-run ESU)', 
        'Coho Salmon (Lower Columbia River ESU)', 'Coho Salmon (Oregon Coast ESU)',
        'Steelhead Trout (Puget Sound DPS)', 'Steelhead Trout (Lower Columbia River DPS)',
        'Steelhead Trout (Upper Columbia River DPS)', 'Steelhead Trout (Snake River Basin DPS)',
        'Bull Trout', 'Chum Salmon (Hood Canal Summer-run ESU)', 'Sockeye Salmon (Snake River ESU)',
        
        // Terrestrial Mammals
        'Northern Spotted Owl', 'Grizzly Bear', 'Canada Lynx', 'Wolverine', 'Fisher', 
        'Columbian White-tailed Deer', 'Gray Wolf', 'Woodland Caribou',
        
        // Birds
        'Streaked Horned Lark', 'Yellow-billed Cuckoo', 'Least Bell\'s Vireo', 'Northern Goshawk',
        'Spotted Owl', 'Great Blue Heron', 'Sandhill Crane', 'Trumpeter Swan',
        
        // Butterflies & Insects
        'Taylor\'s Checkerspot Butterfly', 'Oregon Silverspot Butterfly', 'Fender\'s Blue Butterfly',
        'Island Marble Butterfly', 'Johnson\'s Hairstreak', 'Puget Blue Butterfly',
        
        // Freshwater Fish
        'Oregon Chub', 'Lost River Sucker', 'Shortnose Sucker', 'Modoc Sucker', 'Warner Sucker',
        'Hutton Tui Chub', 'Foskett Speckled Dace', 'Borax Lake Chub',
        
        // Reptiles & Amphibians  
        'Western Painted Turtle', 'Northern Red-legged Frog', 'Oregon Spotted Frog',
        'Cascade Torrent Salamander', 'Larch Mountain Salamander', 'Scott Bar Salamander',
        
        // Plants
        'Bradshaw\'s Lomatium', 'Willamette Daisy', 'Kincaid\'s Lupine', 'Nelson\'s Checker-mallow',
        'Cook\'s Lomatium', 'Rough Popcornflower', 'Large-flowered Woolly Meadowfoam',
        'Dwarf Woolly Meadowfoam', 'Golden Paintbrush', 'Showy Stickseed', 
        'Wenatchee Mountains Checker-mallow', 'Water Howellia', 'Spalding\'s Catchfly',
        'White-topped Aster', 'Marsh Sandwort', 'Western Lily', 'Applegate\'s Milk-vetch',
        'McDonald\'s Rock-cress', 'Umtanum Desert Buckwheat', 'Ute Ladies\'-tresses'
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