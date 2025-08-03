import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Thermometer,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface EndangeredSpeciesGalleryProps {
  bioregionName: string;
  bioregionId: string;
  speciesData: any;
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

export default function EndangeredSpeciesGallery({ bioregionName, bioregionId, speciesData }: EndangeredSpeciesGalleryProps) {
  const [showConservationDetails, setShowConservationDetails] = useState(false);
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

  const getConservationDescription = (species: string) => {
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

  if (!speciesData?.species?.threatenedSpecies || speciesData.species.threatenedSpecies.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-600" />
              <h4 className="text-lg font-semibold text-red-800">
                {showConservationDetails ? 'Conservation Impact' : 'Endangered Species Gallery'}
              </h4>
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {speciesData.species.threatenedSpecies.length} species at risk
              </Badge>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => setShowConservationDetails(!showConservationDetails)}
            >
              {showConservationDetails ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show Gallery
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Conservation Details
                </>
              )}
            </Button>
          </div>
          
          {!showConservationDetails ? (
            // Species Gallery View
            <div className="space-y-4">
              {selectedSpecies ? (
                // Individual species detail view
                <div className="bg-white border border-red-200 rounded-lg p-4">
                  {(() => {
                    const conservationInfo = getSpeciesConservationData(selectedSpecies);
                    const climateInfo = getSpeciesClimateData(selectedSpecies);
                    const hasPhoto = speciesData.species.speciesPhotos?.[selectedSpecies];
                    
                    return (
                      <>
                        {/* Header with back button */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h4 className="text-lg font-semibold text-gray-900">{selectedSpecies}</h4>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setSelectedSpecies(null)}
                            className="text-gray-600"
                          >
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Back to Gallery
                          </Button>
                        </div>
                        
                        {/* Species photo if available */}
                        {hasPhoto && (
                          <div className="mb-4">
                            <img 
                              src={hasPhoto} 
                              alt={selectedSpecies}
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* IUCN Conservation Status */}
                          {conservationInfo && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                          
                          {/* Climate Impact Data */}
                          {climateInfo ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Thermometer className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-semibold text-red-800">Climate Change Impact</span>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Badge className={getSeverityColor(climateInfo.severity)}>
                                    {climateInfo.severity.toUpperCase()} IMPACT
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-red-700">
                                    <Clock className="w-3 h-3" />
                                    Last seen: {climateInfo.lastSeenYear}
                                  </div>
                                </div>
                                
                                <div className="bg-white/80 p-2 rounded">
                                  <div className="text-xs font-medium text-red-800 mb-1">Reason for Decline:</div>
                                  <div className="text-xs text-gray-700">{climateInfo.disappearanceReason}</div>
                                </div>
                                
                                <div>
                                  <div className="text-xs font-medium text-red-800 mb-1">Supporting Evidence:</div>
                                  <ul className="text-xs text-gray-700 space-y-0.5">
                                    {climateInfo.evidence.map((evidence: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-1">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>{evidence}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-800">Stable Population</span>
                              </div>
                              <div className="text-xs text-green-700">
                                No severe climate impact detected. Continue monitoring population trends.
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Active Conservation Efforts - Full width */}
                        {conservationInfo && conservationInfo.conservationActions.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-800">Active Conservation Projects</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        
                        {/* Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="text-xs">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View on iNaturalist - Recent observations & photos
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                // Species gallery grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {speciesData.species.threatenedSpecies.slice(0, 6).map((species: string, index: number) => {
                    const hasPhoto = speciesData.species.speciesPhotos?.[species];
                    
                    return (
                      <div 
                        key={index} 
                        className="bg-white/90 rounded-lg border border-red-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                        onClick={() => setSelectedSpecies(species)}
                      >
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
                          <div className="mt-2 pt-2 border-t border-red-100">
                            <div className="text-xs text-blue-600 font-medium">Click to view details →</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="bg-red-50/50 border border-red-200 rounded p-3">
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
          ) : (
            // Conservation Details View - Replace entire section
            <div className="space-y-4">
              {speciesData.species.threatenedSpecies.slice(0, 6).map((species: string, index: number) => {
                const conservationInfo = getSpeciesConservationData(species);
                const climateInfo = getSpeciesClimateData(species);
                const hasPhoto = speciesData.species.speciesPhotos?.[species];
                
                return (
                  <div key={index} className="bg-white border border-red-200 rounded-lg p-4">
                    {/* Species Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-900">{species}</h4>
                      </div>
                      {hasPhoto && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
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
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* IUCN Conservation Status */}
                      {conservationInfo && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">IUCN Red List Status</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={getStatusColor(conservationInfo.iucnStatus)}>
                                {conservationInfo.iucnStatus} - {getStatusName(conservationInfo.iucnStatus)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm">
                              {getTrendIcon(conservationInfo.populationTrend)}
                              <span className="capitalize font-medium">Population {conservationInfo.populationTrend}</span>
                            </div>
                            
                            <div className="text-xs text-blue-700">
                              <div className="font-medium">Assessment:</div>
                              <div>{new Date(conservationInfo.assessmentDate).toLocaleDateString()}</div>
                            </div>
                            
                            {/* Threat Categories */}
                            <div>
                              <div className="text-xs font-medium text-blue-800 mb-2">Primary Threats:</div>
                              <div className="flex flex-wrap gap-1">
                                {conservationInfo.threatCategories.slice(0, 2).map((threat: string, idx: number) => (
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
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">Active Conservation</span>
                          </div>
                          
                          <div className="space-y-2">
                            {conservationInfo.conservationActions.slice(0, 2).map((action: any, idx: number) => (
                              <div key={idx} className="bg-white/80 rounded border p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  <div className="text-xs font-medium text-gray-900">{action.action}</div>
                                </div>
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">{action.organization}</span>
                                </div>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {action.status}
                                </Badge>
                              </div>
                            ))}
                            
                            {conservationInfo.conservationActions.length > 2 && (
                              <div className="text-xs text-green-700 font-medium">
                                +{conservationInfo.conservationActions.length - 2} more projects
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Climate Impact Data */}
                      {climateInfo ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Thermometer className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-800">Climate Impact</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(climateInfo.severity)}>
                                {climateInfo.severity.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-red-700">
                              <Clock className="w-3 h-3" />
                              Last seen: {climateInfo.lastSeenYear}
                            </div>
                            
                            <div className="text-xs text-gray-700">
                              <div className="font-medium text-red-800 mb-1">Decline Reason:</div>
                              <div>{climateInfo.disappearanceReason}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">Stable Population</span>
                          </div>
                          <div className="text-xs text-green-700">
                            No severe climate impact detected. Continue monitoring population trends.
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View on iNaturalist
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}