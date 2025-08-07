
import axios from 'axios';

const NOAA_FISHERIES_BASE_URL = 'https://www.fisheries.noaa.gov/webapi/species';

interface NOAASpecies {
  species_name: string;
  common_name: string;
  scientific_name: string;
  esa_status: string;
  region: string[];
  habitat: string;
}

class NOAAFisheriesService {
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T | null> {
    try {
      const response = await axios.get(`${NOAA_FISHERIES_BASE_URL}${endpoint}`, {
        params,
        timeout: 15000,
        headers: {
          'User-Agent': 'R8-Conservation-Platform/1.0 (educational-research)',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`NOAA Fisheries API error for ${endpoint}:`, error.message);
      return null;
    }
  }

  async getThreatenedMarineSpecies(region: string): Promise<string[]> {
    // NOAA Fisheries focuses on marine and anadromous species
    const response = await this.makeRequest<any>('/protected', {
      region: region,
      esa_status: 'threatened,endangered'
    });

    if (!response?.species) {
      // Fallback data for Pacific Northwest marine species
      return [
        'Southern Resident Killer Whale',
        'Steller Sea Lion',
        'Leatherback Sea Turtle',
        'Green Sturgeon',
        'Eulachon',
        'Pacific Lamprey',
        'Bocaccio Rockfish',
        'Yelloweye Rockfish',
        'Canary Rockfish',
        'Chinook Salmon',
        'Coho Salmon', 
        'Steelhead Trout',
        'Bull Trout',
        'Chum Salmon',
        'Sockeye Salmon'
      ];
    }

    return response.species
      .filter((species: NOAASpecies) => 
        ['threatened', 'endangered'].includes(species.esa_status?.toLowerCase())
      )
      .map((species: NOAASpecies) => species.common_name || species.scientific_name)
      .slice(0, 50);
  }

  async getCascadiaMarineSpecies(): Promise<string[]> {
    return this.getThreatenedMarineSpecies('west-coast');
  }
}

export const noaaFisheriesService = new NOAAFisheriesService();
