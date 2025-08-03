import axios from 'axios';

const GBIF_BASE_URL = 'https://api.gbif.org/v1';

interface GBIFSpecies {
  key: string;
  scientificName: string;
  canonicalName: string;
  rank: string;
  status: string;
  confidence: number;
  kingdom: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
}

interface GBIFOccurrence {
  key: string;
  scientificName: string;
  decimalLatitude: number;
  decimalLongitude: number;
  year: number;
  month?: number;
  eventDate: string;
  countryCode: string;
  stateProvince?: string;
  issues: string[];
}

interface ClimateRefugeeData {
  species: string;
  lastSeenYear: number;
  disappearanceReason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
}

interface ConservationStatusData {
  species: string;
  iucnStatus: string;
  populationTrend: string;
  threatCategories: string[];
  conservationActions: Array<{
    action: string;
    organization: string;
    status: string;
    url?: string;
    startDate?: string;
  }>;
  assessmentDate: string;
  generationLength?: number;
}

class GBIFService {
  private async makeApiRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T | null> {
    try {
      const response = await axios.get(`${GBIF_BASE_URL}${endpoint}`, {
        params,
        timeout: 15000,
        headers: {
          'User-Agent': 'R8-Conservation-Platform/1.0 (educational-research)',
          'Accept': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`GBIF API error for ${endpoint}:`, error.message);
      return null;
    }
  }

  async searchSpecies(scientificName: string): Promise<GBIFSpecies | null> {
    const response = await this.makeApiRequest<any>('/species/match', {
      name: scientificName,
      rank: 'SPECIES',
      strict: true,
    });

    return response;
  }

  async getSpeciesOccurrences(
    scientificName: string, 
    bounds: {north: number, south: number, east: number, west: number},
    yearRange?: {from: number, to: number}
  ): Promise<GBIFOccurrence[]> {
    const species = await this.searchSpecies(scientificName);
    if (!species || !species.key) {
      return [];
    }

    const params: any = {
      taxonKey: species.key,
      decimalLatitude: `${bounds.south},${bounds.north}`,
      decimalLongitude: `${bounds.west},${bounds.east}`,
      hasCoordinate: true,
      hasGeospatialIssue: false,
      limit: 300,
    };

    if (yearRange) {
      params.year = `${yearRange.from},${yearRange.to}`;
    }

    const response = await this.makeApiRequest<any>('/occurrence/search', params);
    
    return response?.results || [];
  }

  async detectClimateRefugees(
    bioregionId: string,
    bounds: {north: number, south: number, east: number, west: number},
    speciesNames: string[]
  ): Promise<ClimateRefugeeData[]> {
    const climateRefugees: ClimateRefugeeData[] = [];
    const currentYear = new Date().getFullYear();

    for (const species of speciesNames.slice(0, 5)) { // Limit to avoid rate limits
      try {
        // Get historical occurrences (last 30 years)
        const historicalOccurrences = await this.getSpeciesOccurrences(
          species,
          bounds,
          { from: currentYear - 30, to: currentYear - 10 }
        );

        // Get recent occurrences (last 10 years)
        const recentOccurrences = await this.getSpeciesOccurrences(
          species,
          bounds,
          { from: currentYear - 10, to: currentYear }
        );

        // Analyze disappearance patterns
        const historicalCount = historicalOccurrences.length;
        const recentCount = recentOccurrences.length;
        const lastSeen = recentOccurrences.length > 0 
          ? Math.max(...recentOccurrences.map(o => o.year))
          : (historicalOccurrences.length > 0 
            ? Math.max(...historicalOccurrences.map(o => o.year))
            : 0);

        // Detect climate refugees based on declining observations
        if (historicalCount > 5 && recentCount < historicalCount * 0.3) {
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
          let disappearanceReason = 'Possible habitat changes';
          
          if (recentCount === 0 && lastSeen < currentYear - 5) {
            severity = 'critical';
            disappearanceReason = 'No recent observations - possible local extinction';
          } else if (recentCount < historicalCount * 0.1) {
            severity = 'high';
            disappearanceReason = 'Severe population decline';
          } else if (recentCount < historicalCount * 0.2) {
            severity = 'medium';
            disappearanceReason = 'Significant population decline';
          }

          climateRefugees.push({
            species,
            lastSeenYear: lastSeen,
            disappearanceReason,
            severity,
            evidence: [
              `Historical observations: ${historicalCount}`,
              `Recent observations: ${recentCount}`,
              `Decline: ${Math.round((1 - recentCount/historicalCount) * 100)}%`
            ]
          });
        }
      } catch (error) {
        console.error(`Error analyzing climate refugee status for ${species}:`, error);
      }
    }

    return climateRefugees;
  }

  async getConservationStatus(speciesNames: string[]): Promise<ConservationStatusData[]> {
    const conservationData: ConservationStatusData[] = [];

    // Enhanced conservation data based on known species
    const conservationDatabase: Record<string, ConservationStatusData> = {
      'Green Sea Turtle': {
        species: 'Green Sea Turtle',
        iucnStatus: 'EN',
        populationTrend: 'increasing',
        threatCategories: ['pollution', 'climate_change', 'fishing_interactions', 'coastal_development'],
        conservationActions: [
          {
            action: 'Nesting beach protection',
            organization: 'Hawaii Department of Land and Natural Resources',
            status: 'ongoing',
            url: 'https://dlnr.hawaii.gov/wildlife/sea-turtles/',
            startDate: '2005'
          },
          {
            action: 'Marine protected areas',
            organization: 'NOAA Marine Sanctuaries',
            status: 'established',
            url: 'https://sanctuaries.noaa.gov/',
            startDate: '1992'
          }
        ],
        assessmentDate: '2022-12-01',
        generationLength: 35
      },
      'Hawaiian Monk Seal': {
        species: 'Hawaiian Monk Seal',
        iucnStatus: 'CR',
        populationTrend: 'stable',
        threatCategories: ['fishing_interactions', 'habitat_loss', 'disease', 'climate_change'],
        conservationActions: [
          {
            action: 'Population monitoring and protection',
            organization: 'NOAA Hawaiian Monk Seal Research Program',
            status: 'ongoing',
            url: 'https://www.fisheries.noaa.gov/species/hawaiian-monk-seal',
            startDate: '1976'
          },
          {
            action: 'Habitat restoration',
            organization: 'Marine Mammal Center',
            status: 'ongoing',
            startDate: '2010'
          }
        ],
        assessmentDate: '2021-07-01',
        generationLength: 18
      },
      'Hawaiian Goose': {
        species: 'Hawaiian Goose',
        iucnStatus: 'VU',
        populationTrend: 'increasing',
        threatCategories: ['habitat_loss', 'predation', 'vehicle_strikes', 'disease'],
        conservationActions: [
          {
            action: 'Captive breeding and release program',
            organization: 'Hawaii Division of Forestry and Wildlife',
            status: 'successful',
            url: 'https://dlnr.hawaii.gov/wildlife/nene/',
            startDate: '1949'
          },
          {
            action: 'Habitat restoration',
            organization: 'Endangered Species Recovery Committee',
            status: 'ongoing',
            startDate: '1967'
          }
        ],
        assessmentDate: '2020-03-01',
        generationLength: 8
      },
      'ʻŌhiʻa Lehua': {
        species: 'ʻŌhiʻa Lehua',
        iucnStatus: 'NT',
        populationTrend: 'decreasing',
        threatCategories: ['disease', 'habitat_loss', 'climate_change'],
        conservationActions: [
          {
            action: 'Rapid ʻŌhiʻa Death research and response',
            organization: 'University of Hawaii',
            status: 'ongoing',
            url: 'https://www.rapidohi adeaths.org/',
            startDate: '2014'
          },
          {
            action: 'Forest protection and monitoring',
            organization: 'Hawaii Department of Land and Natural Resources',
            status: 'ongoing',
            startDate: '2016'
          }
        ],
        assessmentDate: '2023-01-01',
        generationLength: 50
      },
      'Common Box Turtle': {
        species: 'Common Box Turtle',
        iucnStatus: 'VU',
        populationTrend: 'decreasing',
        threatCategories: ['habitat_fragmentation', 'road_mortality', 'collection', 'climate_change'],
        conservationActions: [
          {
            action: 'Habitat corridor creation',
            organization: 'Wildlife Conservation Society',
            status: 'ongoing',
            startDate: '2010'
          },
          {
            action: 'Road crossing structures',
            organization: 'State DOT Wildlife Programs',
            status: 'expanding',
            startDate: '2015'
          }
        ],
        assessmentDate: '2021-11-01',
        generationLength: 20
      },
      'Monarch': {
        species: 'Monarch',
        iucnStatus: 'EN',
        populationTrend: 'decreasing',
        threatCategories: ['habitat_loss', 'pesticides', 'climate_change', 'deforestation'],
        conservationActions: [
          {
            action: 'Milkweed restoration projects',
            organization: 'Monarch Joint Venture',
            status: 'ongoing',
            url: 'https://monarchjointventure.org/',
            startDate: '2008'
          },
          {
            action: 'Overwintering site protection',
            organization: 'World Wildlife Fund Mexico',
            status: 'ongoing',
            startDate: '1986'
          }
        ],
        assessmentDate: '2022-07-01',
        generationLength: 0.25
      }
    };

    for (const species of speciesNames) {
      if (conservationDatabase[species]) {
        conservationData.push(conservationDatabase[species]);
      }
    }

    return conservationData;
  }

  async enhanceSpeciesWithClimateData(
    bioregionId: string,
    bounds: {north: number, south: number, east: number, west: number},
    speciesNames: string[]
  ) {
    const [climateRefugees, conservationStatuses] = await Promise.all([
      this.detectClimateRefugees(bioregionId, bounds, speciesNames),
      this.getConservationStatus(speciesNames)
    ]);

    return {
      climateRefugees,
      conservationStatuses,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const gbifService = new GBIFService();