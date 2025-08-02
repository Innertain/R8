import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Users, TreePine, AlertTriangle, Thermometer } from 'lucide-react';
import SpeciesInfo from './SpeciesInfo';
import WildlifeActivityFeed from './WildlifeActivityFeed';
import { useSpeciesData } from '@/hooks/useSpeciesData';

interface BioregionDetailsProps {
  bioregion: any;
  isLoading?: boolean;
}

const BioregionDetails: React.FC<BioregionDetailsProps> = ({ bioregion, isLoading }) => {
  const { data: speciesData, isLoading: speciesLoading, error: speciesError } = useSpeciesData(bioregion?.id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing bioregion...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bioregion) {
    return null;
  }

  const getConservationStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Relatively Stable': 'text-green-600 bg-green-50 border-green-200',
      'Vulnerable': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Threatened': 'text-orange-600 bg-orange-50 border-orange-200',
      'Critically Endangered': 'text-red-600 bg-red-50 border-red-200',
      'Moderately Threatened': 'text-yellow-700 bg-yellow-100 border-yellow-300'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Your Bioregion: {bioregion.name}
          </h3>
          <div className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${getConservationStatusColor(bioregion.conservationStatus)}`}>
            {bioregion.conservationStatus}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">{bioregion.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Characteristics */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TreePine className="w-4 h-4" />
                  Ecological Characteristics
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <strong>Biome:</strong> 
                    <span className="text-gray-600">{bioregion.biome}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Area:</strong> 
                    <span className="text-gray-600">{bioregion.area_km2?.toLocaleString()} km²</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Countries:</strong> 
                    <span className="text-gray-600">{bioregion.countries?.join(', ')}</span>
                  </div>
                  {bioregion.keySpecies && (
                    <div>
                      <strong>Key Species:</strong>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {bioregion.keySpecies.slice(0, 4).map((species: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {species}
                          </span>
                        ))}
                        {bioregion.keySpecies.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{bioregion.keySpecies.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Climate & Demographics */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Climate & Population
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <strong>Climate Type:</strong>
                    <span className="text-gray-600">{bioregion.climate || 'Varies'}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Population:</strong>
                    <span className="text-gray-600">{bioregion.population ? bioregion.population.toLocaleString() : 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Major Cities:</strong>
                    <span className="text-gray-600">{bioregion.majorCities?.join(', ') || 'Various'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Threats */}
            {bioregion.threats && bioregion.threats.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Conservation Threats
                </h4>
                <div className="flex flex-wrap gap-2">
                  {bioregion.threats.map((threat: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {threat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Traditional Knowledge */}
            {bioregion.traditionalKnowledge && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Traditional Ecological Knowledge
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {bioregion.traditionalKnowledge}
                  </p>
                </div>
              </div>
            )}

            {/* Action Links */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Learn More & Take Action</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Local Flora Guide
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Native Species Guide
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Conservation Projects
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Climate Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Wildlife Activity - This is what users actually want to see! */}
      <WildlifeActivityFeed bioregionName={bioregion.name} />
    </div>
  );
};

export default BioregionDetails;