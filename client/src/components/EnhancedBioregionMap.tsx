import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Globe, 
  Layers, 
  Users, 
  TreePine, 
  Shield, 
  AlertTriangle,
  Info,
  MapPin,
  Eye,
  Palette,
  Search,
  Filter
} from 'lucide-react';

// Import the global ecoregions data
import globalEcoregionsData from '../data/global-ecoregions.json';

// Enhanced biome colors with better visual distinction
const ENHANCED_BIOME_COLORS: { [key: number]: string } = {
  1: '#004225', // Tropical Moist Forests - Deep Forest Green
  2: '#806633', // Tropical Dry Forests - Dry Earth Brown
  3: '#CC9900', // Tropical Coniferous - Golden Yellow
  4: '#7BB857', // Temperate Broadleaf - Vibrant Green
  5: '#6F9932', // Temperate Conifer - Pine Green
  6: '#507537', // Boreal Forests - Dark Taiga Green
  7: '#C8B582', // Tropical Grasslands - Savanna Tan
  8: '#BDB76B', // Temperate Grasslands - Prairie Khaki
  9: '#4169E1', // Flooded Grasslands - Royal Blue
  10: '#D2B48C', // Montane Grasslands - Mountain Tan
  11: '#A0A0A0', // Tundra - Arctic Gray
  12: '#B87333', // Mediterranean - Olive Brown
  13: '#DEB887', // Deserts - Desert Sand
  14: '#228B22' // Mangroves - Mangrove Green
};

// Enhanced bioregion grid layout for visual exploration
const createBioregionGrid = () => {
  return globalEcoregionsData.sampleEcoregions.map(ecoregion => ({
    ...ecoregion,
    biomeColor: ENHANCED_BIOME_COLORS[globalEcoregionsData.biomes.find(b => b.name === ecoregion.biome)?.id || 1]
  }));
};

interface EcoregionDetailsProps {
  ecoregion: any;
  onClose: () => void;
}

const EcoregionDetails: React.FC<EcoregionDetailsProps> = ({ ecoregion, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{ecoregion.name}</h2>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{ecoregion.realm}</Badge>
              <Badge style={{ backgroundColor: ecoregion.biomeColor, color: 'white' }}>
                {ecoregion.biome}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            ✕
          </Button>
        </div>
        
        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Globe className="w-4 h-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="indigenous">
                <Users className="w-4 h-4 mr-1" />
                Indigenous
              </TabsTrigger>
              <TabsTrigger value="ecology">
                <TreePine className="w-4 h-4 mr-1" />
                Ecology
              </TabsTrigger>
              <TabsTrigger value="conservation">
                <Shield className="w-4 h-4 mr-1" />
                Conservation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Geographic Information</h3>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Area:</strong> {ecoregion.area_km2?.toLocaleString()} km²</div>
                    <div><strong>Countries:</strong> {ecoregion.countries?.join(', ')}</div>
                    <div><strong>Biogeographic Realm:</strong> {ecoregion.realm}</div>
                    <div><strong>Biome:</strong> {ecoregion.biome}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Conservation Status</h3>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <strong>Threat Level:</strong> {ecoregion.threatLevel}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <strong>Protection:</strong> {ecoregion.protectionStatus}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="indigenous" className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Indigenous Territories & Traditional Knowledge</h3>
                </div>
                <p className="text-sm text-amber-700">
                  This information represents documented traditional knowledge and indigenous territories. 
                  Please respect cultural sensitivities and intellectual property rights.
                </p>
              </div>
              
              {ecoregion.indigenousTerritories?.map((territory: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-amber-500">
                  <CardHeader>
                    <h4 className="text-lg font-semibold text-amber-800">{territory.name}</h4>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-700">{territory.description}</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h5 className="font-semibold text-green-800 mb-2">Traditional Ecological Knowledge</h5>
                      <p className="text-sm text-green-700">{territory.traditionalKnowledge}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!ecoregion.indigenousTerritories?.length && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Indigenous territory information not available for this ecoregion.</p>
                  <p className="text-sm mt-2">We're working to expand our indigenous knowledge database.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ecology" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TreePine className="w-5 h-5" />
                      Key Species
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {ecoregion.keySpecies?.map((species: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-2">
                          {species}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Threat Factors
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {ecoregion.threatFactors?.map((threat: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm">{threat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="conservation" className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Conservation Efforts
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ecoregion.conservationEfforts?.map((effort: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{effort}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">How You Can Help</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• Support organizations working in this ecoregion</div>
                  <div>• Choose sustainable products from this region</div>
                  <div>• Advocate for stronger protection policies</div>
                  <div>• Learn about and respect indigenous rights</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};



const EnhancedBioregionMap: React.FC = () => {
  const [selectedEcoregion, setSelectedEcoregion] = useState<any>(null);
  const [visibleBiomes, setVisibleBiomes] = useState<Set<number>>(
    new Set(globalEcoregionsData.biomes.map(b => b.id))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRealm, setSelectedRealm] = useState<string>('all');
  
  const ecoregionGrid = createBioregionGrid();
  
  const handleBiomeToggle = (biomeId: number) => {
    const newVisibleBiomes = new Set(visibleBiomes);
    if (newVisibleBiomes.has(biomeId)) {
      newVisibleBiomes.delete(biomeId);
    } else {
      newVisibleBiomes.add(biomeId);
    }
    setVisibleBiomes(newVisibleBiomes);
  };
  
  const filteredEcoregions = ecoregionGrid.filter(ecoregion => {
    const biomeId = globalEcoregionsData.biomes.find(b => b.name === ecoregion.biome)?.id || 1;
    const matchesSearch = ecoregion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ecoregion.biome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ecoregion.countries.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRealm = selectedRealm === 'all' || ecoregion.realm === selectedRealm;
    const matchesBiome = visibleBiomes.has(biomeId);
    
    return matchesSearch && matchesRealm && matchesBiome;
  });

  return (
    <div className="relative">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Globe className="w-6 h-6" />
                Global Ecoregions Explorer
              </h2>
              <p className="text-gray-600">
                Explore {globalEcoregionsData.totalEcoregions} terrestrial ecoregions across {globalEcoregionsData.biomes.length} biomes worldwide
              </p>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search ecoregions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={selectedRealm}
                onChange={(e) => setSelectedRealm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Realms</option>
                {globalEcoregionsData.biogeographicRealms.map(realm => (
                  <option key={realm.name} value={realm.name}>{realm.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Biome Filter Legend */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Biomes
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {globalEcoregionsData.biomes.map(biome => (
              <div 
                key={biome.id} 
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all border ${
                  visibleBiomes.has(biome.id) 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80'
                }`}
                onClick={() => handleBiomeToggle(biome.id)}
              >
                <div 
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: biome.color }}
                ></div>
                <div className="flex-1">
                  <div className="text-xs font-medium">{biome.name}</div>
                  <div className="text-xs text-gray-500">{biome.ecoregions} regions</div>
                </div>
                <Eye className={`w-3 h-3 ${visibleBiomes.has(biome.id) ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ecoregions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredEcoregions.map(ecoregion => (
          <Card 
            key={ecoregion.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
            style={{ borderLeftColor: ecoregion.biomeColor }}
            onClick={() => setSelectedEcoregion(ecoregion)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{ecoregion.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{ecoregion.realm}</Badge>
                    <Badge style={{ backgroundColor: ecoregion.biomeColor, color: 'white' }}>
                      {ecoregion.biome}
                    </Badge>
                  </div>
                </div>
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Area:</strong> {ecoregion.area_km2?.toLocaleString()} km²</div>
                <div><strong>Countries:</strong> {ecoregion.countries?.slice(0, 3).join(', ')}{ecoregion.countries?.length > 3 ? '...' : ''}</div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">{ecoregion.threatLevel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">{ecoregion.protectionStatus}</span>
                </div>
                {ecoregion.indigenousTerritories?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600">{ecoregion.indigenousTerritories.length} Indigenous Groups</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredEcoregions.length === 0 && (
        <Card className="mb-6">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No ecoregions found</h3>
            <p className="text-gray-600">Try adjusting your search terms or biome filters</p>
          </CardContent>
        </Card>
      )}
      
      {/* Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold">Global Statistics</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredEcoregions.length}</div>
              <div className="text-sm text-gray-600">Visible Ecoregions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{visibleBiomes.size}</div>
              <div className="text-sm text-gray-600">Active Biomes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Array.from(new Set(filteredEcoregions.flatMap(e => e.countries))).length}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {filteredEcoregions.reduce((sum, e) => sum + (e.indigenousTerritories?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Indigenous Groups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expansion Information */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Complete Global Coverage Available
          </h3>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">🌍 Full WWF/RESOLVE 2017 Dataset</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-blue-700 mb-2">Complete Coverage</div>
                <div>• All 846 terrestrial ecoregions</div>
                <div>• 8 biogeographic realms</div>
                <div>• 14 major biomes</div>
                <div>• 200+ countries & territories</div>
              </div>
              <div>
                <div className="font-semibold text-blue-700 mb-2">Enhanced Features</div>
                <div>• Interactive map visualization</div>
                <div>• Indigenous territory overlays</div>
                <div>• Traditional knowledge database</div>
                <div>• Conservation status tracking</div>
              </div>
              <div>
                <div className="font-semibold text-blue-700 mb-2">Data Integration</div>
                <div>• Native Land Digital API</div>
                <div>• GBIF species occurrence</div>
                <div>• Real-time conservation data</div>
                <div>• Climate change projections</div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Currently showing 8 representative ecoregions.</strong> The platform is designed to scale to the complete WWF dataset 
                with enhanced mapping, indigenous knowledge integration, and real-time biodiversity data from authoritative sources.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedEcoregion && (
        <EcoregionDetails
          ecoregion={selectedEcoregion}
          onClose={() => setSelectedEcoregion(null)}
        />
      )}
    </div>
  );
};

export default EnhancedBioregionMap;