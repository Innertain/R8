import { useQuery } from '@tanstack/react-query';

interface SpeciesData {
  totalSpecies: number;
  flagshipSpecies: string[];
  endemicSpecies: string[];
  threatenedSpecies: string[];
  topTaxa: Record<string, number>;
  recentSightings: Array<{species: string, location: string, date: string, photo?: string, url: string}>;
  seasonalTrends: Record<string, number>;
  identificationNeeds: Array<{species: string, observations: number, url: string}>;
  speciesPhotos: Record<string, string>;
}

interface ConservationProject {
  name: string;
  url: string;
  description: string;
}

interface SpeciesResponse {
  bioregionId: string;
  bioregionName: string;
  species: SpeciesData;
  conservationProjects: ConservationProject[];
  dataSource: string;
  lastUpdated: string;
}

export function useSpeciesData(bioregionId: string | null) {
  return useQuery({
    queryKey: ['/api/species/bioregion', bioregionId],
    queryFn: async (): Promise<SpeciesResponse | null> => {
      if (!bioregionId) return null;
      
      const response = await fetch(`/api/species/bioregion/${bioregionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch species data: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!bioregionId,
    staleTime: 72 * 60 * 60 * 1000, // Consider data fresh for 72 hours (matches backend cache) - optimized
    gcTime: 72 * 60 * 60 * 1000, // Keep in cache for 72 hours - optimized
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have data
    refetchOnReconnect: false, // Don't refetch on network reconnect
    retry: 2,
  });
}

export function useSpeciesCacheStatus() {
  return useQuery({
    queryKey: ['/api/species/cache-status'],
    queryFn: async () => {
      const response = await fetch('/api/species/cache-status');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cache status: ${response.statusText}`);
      }
      
      return response.json();
    },
    refetchInterval: 2 * 60 * 60 * 1000, // Refetch every 2 hours - optimized
    staleTime: 2 * 60 * 60 * 1000, // Consider data fresh for 2 hours - optimized
  });
}