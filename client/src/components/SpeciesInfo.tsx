import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Leaf, 
  ExternalLink, 
  Users, 
  AlertTriangle, 
  Star, 
  BarChart3,
  Clock,
  Globe,
  Info,
  Camera,
  MapPin,
  Calendar,
  Eye,
  HelpCircle
} from 'lucide-react';

interface SpeciesData {
  totalSpecies: number;
  flagshipSpecies: string[];
  endemicSpecies: string[];
  threatenedSpecies: string[];
  topTaxa: Record<string, number>;
  recentSightings: Array<{species: string, location: string, date: string, photo?: string, url: string}>;
  seasonalTrends: Record<string, number>;
  identificationNeeds: Array<{species: string, observations: number, url: string}>;
}

interface ConservationProject {
  name: string;
  url: string;
  description: string;
}

interface SpeciesInfoProps {
  bioregionId: string;
  bioregionName: string;
  species: SpeciesData;
  conservationProjects: ConservationProject[];
  lastUpdated: string;
  isLoading?: boolean;
}

export default function SpeciesInfo({ 
  bioregionId, 
  bioregionName, 
  species, 
  conservationProjects, 
  lastUpdated,
  isLoading = false 
}: SpeciesInfoProps) {
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just updated';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const getTaxaIcon = (taxon: string) => {
    switch (taxon.toLowerCase()) {
      case 'aves': return '🐦';
      case 'mammalia': return '🦌';
      case 'plantae': return '🌱';
      case 'insecta': return '🦋';
      case 'reptilia': return '🦎';
      case 'amphibia': return '🐸';
      case 'fungi': return '🍄';
      default: return '🔬';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600 animate-pulse" />
            <h3 className="text-lg font-semibold">Species Information</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Species Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Species Diversity</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {formatLastUpdated(lastUpdated)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{species.totalSpecies.toLocaleString()}</div>
              <div className="text-sm text-blue-700">Total Species</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{species.flagshipSpecies.length}</div>
              <div className="text-sm text-green-700">Flagship Species</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{species.endemicSpecies.length}</div>
              <div className="text-sm text-purple-700">Endemic Species</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{species.threatenedSpecies.length}</div>
              <div className="text-sm text-red-700">Threatened Species</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Taxa Distribution */}
      {Object.keys(species.topTaxa).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Taxa Distribution</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(species.topTaxa)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([taxon, count]) => (
                  <div key={taxon} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTaxaIcon(taxon)}</span>
                      <span className="font-medium">{taxon}</span>
                    </div>
                    <Badge variant="outline">{count.toLocaleString()} observations</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flagship Species */}
      {species.flagshipSpecies.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">Flagship Species</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Most commonly observed species in this bioregion
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {species.flagshipSpecies.map((species, index) => (
                <Badge key={index} variant="secondary" className="justify-start">
                  {species}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Threatened Species */}
      {species.threatenedSpecies.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold">Species of Conservation Concern</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Threatened or vulnerable species requiring protection
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {species.threatenedSpecies.map((species, index) => (
                <Badge key={index} variant="destructive" className="justify-start">
                  {species}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Wildlife Sightings */}
      {species.recentSightings && species.recentSightings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Recent Wildlife Sightings</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Latest wildlife observations from your bioregion (last 30 days)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {species.recentSightings.slice(0, 8).map((sighting, index) => (
                <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {sighting.photo && (
                      <img 
                        src={sighting.photo} 
                        alt={sighting.species}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{sighting.species}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{sighting.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{sighting.date}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(sighting.url, '_blank')}
                        className="mt-2 h-6 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> These are real observations from community scientists in your area. 
                Click "View" to see full details, photos, and help with identifications!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Identify Species */}
      {species.identificationNeeds && species.identificationNeeds.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Help Identify Species</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Local observations that need your expertise for identification
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {species.identificationNeeds.map((need, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition-colors">
                  <div>
                    <div className="font-medium">{need.species}</div>
                    <div className="text-sm text-gray-600">
                      {need.observations} observation{need.observations !== 1 ? 's' : ''} need help
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(need.url, '_blank')}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Help ID
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-700">
                🔬 <strong>Make a difference:</strong> Your local knowledge can help scientists and nature enthusiasts 
                identify species in your bioregion. Every identification contributes to biodiversity research!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conservation Projects */}
      {conservationProjects.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Get Involved Locally</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Active citizen science projects in your bioregion
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conservationProjects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(project.url, '_blank')}
                      className="ml-4 flex items-center gap-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Data Source:</strong> Species data provided by iNaturalist, a citizen science platform. 
          Observations are made by community scientists worldwide. Data is cached locally and updated daily 
          to minimize API usage while providing fresh biodiversity information.
        </AlertDescription>
      </Alert>
    </div>
  );
}