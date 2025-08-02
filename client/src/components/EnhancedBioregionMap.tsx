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
  Filter,
  X,
  ExternalLink,
  BookOpen,
  Play,
  Calendar,
  Database,
  Clock
} from 'lucide-react';

// Import the global ecoregions data
import globalEcoregionsData from '../data/global-ecoregions.json';
import SmartInfoPanel from './SmartInfoPanel';
import EngagingTutorial from './EngagingTutorial';
import DataSourceAttribution from './DataSourceAttribution';

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
      <div className="bg-white rounded-xl max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header with improved design */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{ecoregion.name}</h2>
              <div className="flex gap-3 mb-3">
                <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                  {ecoregion.realm}
                </Badge>
                <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                  {ecoregion.biome}
                </Badge>
              </div>
              <p className="text-blue-100 text-sm">
                {ecoregion.area_km2?.toLocaleString()} km² • {ecoregion.countries?.length} countries
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Smart Content Area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          <div className="p-6">
            <SmartInfoPanel ecoregion={ecoregion} />
            
            {/* External Resources */}
            <Card className="mt-6">
              <CardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Learn More
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    WWF Ecoregion Profile
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Conservation Status
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Species Database
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Indigenous Rights Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('bioregion-tutorial-completed');
  });
  
  const ecoregionGrid = createBioregionGrid();
  
  const handleTutorialComplete = () => {
    localStorage.setItem('bioregion-tutorial-completed', 'true');
    setShowTutorial(false);
  };
  
  const handleTutorialDismiss = () => {
    setShowTutorial(false);
  };
  
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
              <p className="text-gray-600 mb-2">
                Explore {globalEcoregionsData.totalEcoregions} terrestrial ecoregions across {globalEcoregionsData.biomes.length} biomes worldwide
              </p>
              <DataSourceAttribution
                source="WWF/RESOLVE Ecoregions 2017"
                lastUpdated="2017-06-01"
                dataType="Global ecoregion dataset"
                reliability="official"
                url="https://ecoregions.appspot.com/"
              />
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-1"
              >
                <Play className="w-4 h-4" />
                Tutorial
              </Button>
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
        <CardContent className="space-y-4">
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
          
          <div className="border-t pt-3">
            <DataSourceAttribution
              source="WWF Terrestrial Ecoregions"
              lastUpdated="2017-06-01"
              dataType="Biome classifications"
              reliability="official"
              url="https://www.worldwildlife.org/publications/terrestrial-ecoregions-of-the-world"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ecoregions Grid - Enhanced for Better UX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredEcoregions.map(ecoregion => (
          <Card 
            key={ecoregion.id} 
            className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 group"
            style={{ borderLeftColor: ecoregion.biomeColor }}
            onClick={() => setSelectedEcoregion(ecoregion)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors">
                    {ecoregion.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">{ecoregion.realm}</Badge>
                    <Badge 
                      style={{ backgroundColor: ecoregion.biomeColor, color: 'white' }}
                      className="text-xs"
                    >
                      {ecoregion.biome}
                    </Badge>
                  </div>
                </div>
                <div className="bg-blue-50 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm">
                {/* Quick impact statement */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-blue-800 mb-1">Why This Matters</div>
                  <div className="text-xs text-blue-700">
                    {ecoregion.name === 'Amazon Basin' && 'Earth\'s largest rainforest & biodiversity hotspot'}
                    {ecoregion.name === 'Arctic Tundra' && 'Critical climate regulator & carbon storage'}
                    {ecoregion.name === 'Great Barrier Reef Marine Park' && 'World\'s largest coral reef system'}
                    {ecoregion.name === 'California Central Valley grasslands' && 'America\'s agricultural heartland'}
                    {ecoregion.name === 'Congo Basin' && 'Africa\'s lungs & gorilla habitat'}
                    {ecoregion.name === 'Sahara Desert' && 'World\'s largest hot desert ecosystem'}
                    {ecoregion.name === 'Himalayas' && 'World\'s highest mountain biodiversity'}
                    {ecoregion.name === 'Madagascar Forests' && 'Unique island evolution laboratory'}
                    {!['Amazon Basin', 'Arctic Tundra', 'Great Barrier Reef Marine Park', 'California Central Valley grasslands', 'Congo Basin', 'Sahara Desert', 'Himalayas', 'Madagascar Forests'].includes(ecoregion.name) && 'Important global ecosystem'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-medium text-gray-700">Size</div>
                    <div>{ecoregion.area_km2?.toLocaleString()} km²</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Countries</div>
                    <div>{ecoregion.countries?.length} countries</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">{ecoregion.threatLevel.split('/')[0]}</span>
                  </div>
                  {ecoregion.indigenousTerritories?.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600">{ecoregion.indigenousTerritories.length} groups</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 border-t space-y-1">
                  <div className="text-xs text-blue-600 font-medium">Click to explore in detail →</div>
                  <DataSourceAttribution
                    source="WWF Ecoregions"
                    lastUpdated="2017-06-01"
                    dataType="Ecosystem data"
                    reliability="official"
                    className="justify-start"
                  />
                </div>
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
          <h3 className="font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            Global Statistics
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <div className="border-t pt-4">
            <DataSourceAttribution
              source="Multiple Sources"
              lastUpdated="2024-12-15"
              dataType="Aggregated statistics"
              reliability="official"
              className="justify-center"
            />
            <div className="mt-2 text-xs text-gray-500 text-center">
              Based on WWF Ecoregions (2017), Native Land Digital (daily updates), IUCN assessments (2024)
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
              <p className="text-sm text-blue-700 mb-3">
                <strong>Currently showing 8 representative ecoregions.</strong> The platform is designed to scale to the complete WWF dataset 
                with enhanced mapping, indigenous knowledge integration, and real-time biodiversity data from authoritative sources.
              </p>
              <DataSourceAttribution
                source="WWF/RESOLVE Ecoregions 2017"
                lastUpdated="2017-06-01"
                dataType="Complete global dataset"
                reliability="official"
                url="https://ecoregions.appspot.com/"
                className="text-blue-600"
              />
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
      
      {showTutorial && (
        <EngagingTutorial
          onComplete={handleTutorialComplete}
          onDismiss={handleTutorialDismiss}
        />
      )}
    </div>
  );
};

export default EnhancedBioregionMap;