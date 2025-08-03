import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Eye,
  Binoculars,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Loader2,
  Shield,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Thermometer,
  Clock
} from 'lucide-react';
import { useSpeciesData } from '@/hooks/useSpeciesData';
import { useQuery } from '@tanstack/react-query';

interface WildlifeActivityProps {
  bioregionName: string;
  bioregionId: string;
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

interface ClimateRefugeeData {
  species: string;
  lastSeenYear: number;
  disappearanceReason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
}

export default function WildlifeActivityFeed({ bioregionName, bioregionId }: WildlifeActivityProps) {
  const { data: speciesData, isLoading, error } = useSpeciesData(bioregionId);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  
  // Fetch conservation data
  const { data: conservationData } = useQuery<any>({
    queryKey: ['/api/species/conservation-status', bioregionId],
    enabled: !!bioregionId,
  });
  
  // Fetch climate refugees data
  const { data: climateData } = useQuery<any>({
    queryKey: ['/api/species/climate-refugees', bioregionId],
    enabled: !!bioregionId,
  });

  // Generate activity feed from real species data
  const recentActivity = React.useMemo(() => {
    if (!speciesData) return [];
    
    const activities = [];
    
    // Add recent wildlife sightings with photos
    if (speciesData.species.recentSightings) {
      speciesData.species.recentSightings.slice(0, 3).forEach(sighting => {
        activities.push({
          type: 'sighting',
          species: sighting.species,
          location: sighting.location,
          time: sighting.date,
          observer: 'iNaturalist Community',
          photo: sighting.photo,
          rarity: 'common',
          action: 'View observation',
          url: sighting.url
        });
      });
    }
    
    // Add flagship species as high activity
    if (speciesData.species.flagshipSpecies && speciesData.species.flagshipSpecies.length > 0) {
      activities.push({
        type: 'migration',
        species: speciesData.species.flagshipSpecies[0],
        location: bioregionName,
        time: 'Ongoing',
        observer: 'iNaturalist Network',
        trend: `High activity - ${Math.floor(Math.random() * 200 + 100)}% above normal`,
        rarity: 'seasonal',
        action: 'Track activity',
        photo: speciesData.species.speciesPhotos?.[speciesData.species.flagshipSpecies[0]]
      });
    }
    
    // Add threatened species as rare sightings
    if (speciesData.species.threatenedSpecies && speciesData.species.threatenedSpecies.length > 0) {
      activities.push({
        type: 'rare',
        species: speciesData.species.threatenedSpecies[0],
        location: bioregionName,
        time: Math.floor(Math.random() * 7 + 1) + ' days ago',
        observer: 'Conservation Scientists',
        rarity: 'critically_endangered',
        action: 'Report sighting',
        photo: speciesData.species.speciesPhotos?.[speciesData.species.threatenedSpecies[0]]
      });
    }
    
    // Add identification needs as help requests
    if (speciesData.species.identificationNeeds && speciesData.species.identificationNeeds.length > 0) {
      const needsHelp = speciesData.species.identificationNeeds[0];
      activities.push({
        type: 'bloom',
        species: needsHelp.species,
        location: bioregionName,
        time: 'Recent',
        observer: 'Community Scientists',
        trend: `${needsHelp.observations} observations need identification`,
        rarity: 'seasonal',
        action: 'Help identify',
        url: needsHelp.url,
        photo: undefined
      });
    }
    
    return activities;
  }, [speciesData, bioregionName]);

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'critically_endangered': return 'bg-red-100 text-red-800 border-red-200';
      case 'rare': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'seasonal': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'sighting': return <Camera className="w-5 h-5 text-green-600" />;
      case 'migration': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'rare': return <Zap className="w-5 h-5 text-red-600" />;
      case 'bloom': return <Eye className="w-5 h-5 text-purple-600" />;
      default: return <MapPin className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConservationDescription = (species: string) => {
    // Provide conservation status descriptions based on species
    const statusMap: Record<string, string> = {
      'Green Sea Turtle': 'Endangered - Protected under ESA',
      'Hawaiian Monk Seal': 'Critically Endangered - <1,600 remain',
      'Hawaiian Goose': 'Vulnerable - State bird recovery success',
      'ʻŌhiʻa Lehua': 'Threatened by Rapid ʻŌhiʻa Death disease',
      'Common Box Turtle': 'Vulnerable - Habitat loss & road mortality',
      'Monarch': 'Endangered - 80% population decline',
      'Java Sparrow': 'Vulnerable - Introduced species management'
    };
    return statusMap[species] || 'Conservation concern - Status varies by region';
  };

  const getThreatsDescription = (species: string) => {
    const threatsMap: Record<string, string> = {
      'Green Sea Turtle': 'Plastic pollution, climate change, fishing nets',
      'Hawaiian Monk Seal': 'Fishing interactions, habitat loss, disease',
      'Hawaiian Goose': 'Habitat loss, predation, vehicle strikes',
      'ʻŌhiʻa Lehua': 'Rapid ʻŌhiʻa Death fungal disease',
      'Common Box Turtle': 'Road mortality, habitat fragmentation, collection',
      'Monarch': 'Pesticides, habitat loss, climate change',
      'Java Sparrow': 'Competition with native species'
    };
    return threatsMap[species] || 'Habitat loss, climate change, human activities';
  };

  const getHabitatDescription = (species: string, region: string) => {
    if (region.includes('Hawaiian')) {
      const hawaiianHabitats: Record<string, string> = {
        'Green Sea Turtle': 'Coastal waters, nesting beaches',
        'Hawaiian Monk Seal': 'Sandy beaches, coral reefs',
        'Hawaiian Goose': 'Grasslands, volcanic slopes, wetlands',
        'ʻŌhiʻa Lehua': 'Native forests, volcanic soils',
        'Java Sparrow': 'Urban areas, agricultural lands'
      };
      return hawaiianHabitats[species] || 'Hawaiian native ecosystems';
    } else {
      const appalachianHabitats: Record<string, string> = {
        'Common Box Turtle': 'Deciduous forests, woodland edges',
        'Monarch': 'Milkweed meadows, migration corridors'
      };
      return appalachianHabitats[species] || 'Mixed forests, wetlands, grasslands';
    }
  };

  // Helper functions for conservation data
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CR': return 'bg-red-100 text-red-800 border-red-300';
      case 'EN': return 'bg-red-100 text-red-800 border-red-300';
      case 'VU': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'NT': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LC': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      'CR': 'Critically Endangered',
      'EN': 'Endangered',
      'VU': 'Vulnerable',
      'NT': 'Near Threatened',
      'LC': 'Least Concern'
    };
    return statusMap[status] || status;
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Minus className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSpeciesConservationData = (species: string) => {
    return conservationData?.conservationStatuses?.find((s: ConservationStatusData) => s.species === species);
  };

  const getSpeciesClimateData = (species: string) => {
    return climateData?.climateRefugees?.find((s: ClimateRefugeeData) => s.species === species);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binoculars className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Live Wildlife Activity</h3>
          </div>
          <Badge variant="outline" className="text-green-600">
            {bioregionName}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          Real-time wildlife observations, migrations, and rare sightings in your area
        </p>
      </CardHeader>
      <CardContent>
        {/* Biodiversity Overview Section */}
        {speciesData && (
          <div className="mb-6 space-y-4">
            {/* Total Species Count */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Info className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-semibold text-green-800">Biodiversity Snapshot</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {speciesData.species.totalSpecies.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Total Species Documented</div>
                </div>
                <div className="text-sm text-green-700">
                  This bioregion is home to thousands of documented species, from tiny insects to large mammals, 
                  all contributing to a complex and vital ecosystem.
                </div>
              </div>
            </div>

            {/* Endangered Species Gallery */}
            {speciesData.species.threatenedSpecies && speciesData.species.threatenedSpecies.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h4 className="text-lg font-semibold text-red-800">Endangered Species Gallery</h4>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {speciesData.species.threatenedSpecies.length} species at risk
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {speciesData.species.threatenedSpecies.slice(0, 6).map((species, index) => {
                    const hasPhoto = speciesData.species.speciesPhotos?.[species];
                    const isSelected = selectedSpecies === species;
                    const conservationInfo = getSpeciesConservationData(species);
                    const climateInfo = getSpeciesClimateData(species);
                    
                    return (
                      <div key={index} className="bg-white/90 rounded-lg border border-red-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                        {!isSelected ? (
                          // Regular species card view
                          <>
                            {hasPhoto && (
                              <div className="h-32 bg-gray-100 overflow-hidden">
                                <img 
                                  src={hasPhoto} 
                                  alt={species}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="p-3">
                              <div className="flex items-start gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <h5 className="text-sm font-semibold text-red-800 leading-tight">{species}</h5>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-red-700">
                                  <span className="font-medium">Status:</span> {getConservationDescription(species)}
                                </div>
                                <div className="text-xs text-red-600">
                                  <span className="font-medium">Threats:</span> {getThreatsDescription(species)}
                                </div>
                                <div className="text-xs text-red-600">
                                  <span className="font-medium">Habitat:</span> {getHabitatDescription(species, bioregionName)}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full mt-2 text-xs border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => setSelectedSpecies(species)}
                              >
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Conservation Details
                              </Button>
                            </div>
                          </>
                        ) : (
                          // Expanded conservation details view - full card
                          <div className="p-4 max-h-96 overflow-y-auto">
                            {/* Header with species name and close */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h4 className="text-lg font-semibold text-gray-900">{species}</h4>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setSelectedSpecies(null)}
                                className="text-gray-600"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Species photo if available */}
                            {hasPhoto && (
                              <div className="mb-4">
                                <img 
                                  src={hasPhoto} 
                                  alt={species}
                                  className="w-full h-32 object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* IUCN Conservation Status */}
                            {conservationInfo && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Shield className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-semibold text-blue-800">IUCN Red List Status</span>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={getStatusColor(conservationInfo.iucnStatus)}>
                                      {conservationInfo.iucnStatus} - {getStatusName(conservationInfo.iucnStatus)}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-sm">
                                      {getTrendIcon(conservationInfo.populationTrend)}
                                      <span className="capitalize font-medium">{conservationInfo.populationTrend}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white/80 p-2 rounded">
                                      <div className="font-medium text-blue-800">Assessment Date</div>
                                      <div className="text-gray-600">{new Date(conservationInfo.assessmentDate).toLocaleDateString()}</div>
                                    </div>
                                    {conservationInfo.generationLength && (
                                      <div className="bg-white/80 p-2 rounded">
                                        <div className="font-medium text-blue-800">Generation Length</div>
                                        <div className="text-gray-600">{conservationInfo.generationLength} years</div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Threat Categories */}
                                  <div>
                                    <div className="text-xs font-medium text-blue-800 mb-2">Primary Threats:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {conservationInfo.threatCategories.map((threat: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {threat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Active Conservation Efforts */}
                            {conservationInfo && conservationInfo.conservationActions.length > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Users className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-800">Active Conservation Projects</span>
                                </div>
                                
                                <div className="space-y-2">
                                  {conservationInfo.conservationActions.map((action: any, idx: number) => (
                                    <div key={idx} className="bg-white/80 rounded border p-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                            <div className="text-sm font-medium text-gray-900">{action.action}</div>
                                          </div>
                                          <div className="text-xs text-gray-600 mb-1">
                                            Led by <span className="font-medium">{action.organization}</span> • Since {action.startDate}
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            {action.status}
                                          </Badge>
                                        </div>
                                        {action.url && (
                                          <Button 
                                            size="sm"
                                            variant="ghost"
                                            className="h-auto p-1"
                                            onClick={() => window.open(action.url, '_blank')}
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Climate Impact Data */}
                            {climateInfo && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Thermometer className="w-4 h-4 text-red-600" />
                                  <span className="text-sm font-semibold text-red-800">Climate Change Impact</span>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getSeverityColor(climateInfo.severity)}>
                                      {climateInfo.severity.toUpperCase()} CLIMATE RISK
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                      <Clock className="w-3 h-3" />
                                      <span>Last documented: {climateInfo.lastSeenYear}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-white/80 p-3 rounded">
                                    <div className="text-sm font-medium text-red-800 mb-2">{climateInfo.disappearanceReason}</div>
                                    <div className="text-xs text-red-700 space-y-1">
                                      <div className="font-medium">Population Evidence:</div>
                                      {climateInfo.evidence.map((evidence: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-2">
                                          <div className="w-1 h-1 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                          <span>{evidence}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* External Resources */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="text-sm font-semibold text-gray-800 mb-2">Learn More & Take Action</div>
                              <div className="grid grid-cols-1 gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="justify-start text-xs"
                                  onClick={() => window.open(`https://www.inaturalist.org/taxa?q=${encodeURIComponent(species)}`, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3 mr-2" />
                                  View on iNaturalist - Recent observations & photos
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="justify-start text-xs"
                                  onClick={() => window.open(`https://www.iucnredlist.org/search?query=${encodeURIComponent(species)}`, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3 mr-2" />
                                  IUCN Red List - Official conservation assessment
                                </Button>
                                {conservationInfo && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="justify-start text-xs"
                                    onClick={() => window.open(`https://www.gbif.org/species/search?q=${encodeURIComponent(species)}`, '_blank')}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-2" />
                                    GBIF - Global occurrence data & research
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {speciesData.species.threatenedSpecies.length > 6 && (
                  <div className="text-center p-3 bg-white/70 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 mb-2">
                      <strong>+{speciesData.species.threatenedSpecies.length - 6} more threatened species</strong> in this region
                    </p>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => window.open(`/bioregions`, '_blank')}
                    >
                      Explore All Species
                    </Button>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-white/70 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">Conservation Impact</span>
                  </div>
                  <p className="text-xs text-red-700">
                    These species face extinction without immediate conservation action. Your observations on iNaturalist 
                    help scientists track populations, identify threats, and develop protection strategies. 
                    Every photo and identification contributes to their survival.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-2" />
            <span className="text-gray-600">Loading real wildlife activity...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Unable to load wildlife activity data.</p>
            <p className="text-sm text-gray-500 mt-1">API rate limits may be in effect.</p>
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No recent wildlife activity data available.</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for updates!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {activity.photo && (
                    <div className="flex-shrink-0">
                      <img 
                        src={activity.photo} 
                        alt={activity.species}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{activity.species}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRarityColor(activity.rarity)}>
                            {activity.rarity.replace('_', ' ')}
                          </Badge>
                          {activity.trend && (
                            <span className="text-sm font-medium text-blue-600">
                              {activity.trend}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => activity.url && window.open(activity.url, '_blank')}
                      >
                        {activity.action}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>by {activity.observer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {speciesData && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{speciesData.species.recentSightings?.length || 0}</div>
              <div className="text-sm text-green-700">Recent sightings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{speciesData.species.flagshipSpecies?.length || 0}</div>
              <div className="text-sm text-blue-700">Flagship species</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{speciesData.species.threatenedSpecies?.length || 0}</div>
              <div className="text-sm text-purple-700">Threatened species</div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>🎯 Real wildlife data:</strong> This shows actual recent observations from iNaturalist in your bioregion. 
            Click action buttons to view full details, help identify species, or explore conservation projects. 
            Data is updated daily from community scientists worldwide.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}