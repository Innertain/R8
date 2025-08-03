import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Users, 
  TreePine, 
  Waves, 
  Mountain, 
  Leaf,
  Calendar,
  ExternalLink,
  Heart,
  Sprout,
  Fish,
  Sun
} from 'lucide-react';
import DataSourceAttribution from '@/components/DataSourceAttribution';
import WildlifeFeedDemo from '@/components/WildlifeFeedDemo';

// Hawaiian ahupua'a data - traditional watershed management systems
const hawaiianAhupuaa = [
  {
    id: 'waikiki',
    name: 'Waikīkī Ahupua\'a',
    island: 'O\'ahu',
    description: 'Urban restoration focusing on native coastal plants and traditional fishpond restoration',
    status: 'Active Restoration',
    progress: 45,
    keyProjects: ['Waikīkī Fishpond Restoration', 'Native Coastal Plant Recovery', 'Cultural Education Center'],
    nativeSpecies: ['Naupaka', 'Pohuehue', 'Milo'],
    partnerships: ['Waikīkī Aquarium', 'Native Hawaiian Student Association'],
    volunteersNeeded: 15
  },
  {
    id: 'haleakala',
    name: 'Haleakalā Watershed',
    island: 'Maui',
    description: 'High-elevation forest restoration and endangered species recovery',
    status: 'Critical Priority',
    progress: 72,
    keyProjects: ['Silversword Recovery Program', 'Invasive Species Removal', 'Native Forest Restoration'],
    nativeSpecies: ['Silversword', 'Māmane', 'Sandalwood'],
    partnerships: ['Haleakalā National Park', 'Maui Forest Bird Recovery Project'],
    volunteersNeeded: 25
  },
  {
    id: 'kohala',
    name: 'Kohala Mountain Watershed',
    island: 'Hawaiʻi',
    description: 'Protecting critical water sources through native forest restoration',
    status: 'Expanding',
    progress: 58,
    keyProjects: ['Watershed Fencing', 'Native Tree Plantings', 'Stream Restoration'],
    nativeSpecies: ['Koa', 'ʻŌhiʻa', 'Māmaki'],
    partnerships: ['The Nature Conservancy', 'Kohala Watershed Partnership'],
    volunteersNeeded: 30
  },
  {
    id: 'hanalei',
    name: 'Hanalei Valley Taro Fields',
    island: 'Kauaʻi',
    description: 'Traditional taro cultivation and sustainable agriculture practices',
    status: 'Cultural Preservation',
    progress: 83,
    keyProjects: ['Traditional Taro Farming', 'Water System Restoration', 'Cultural Education'],
    nativeSpecies: ['Kalo (Taro)', 'Native Sedges', 'Stream Plants'],
    partnerships: ['Hanalei Watershed Hui', 'Taro Farmers Cooperative'],
    volunteersNeeded: 10
  }
];

const regenerationStats = {
  totalAcresRestored: 12850,
  nativeSpeciesRecovered: 47,
  volunteersActive: 2340,
  partnershipsFormed: 156,
  carbonSequestered: 8900, // tons
  waterProtected: 2.4 // billion gallons annually
};

const HawaiiRegenerationPage: React.FC = () => {
  const [selectedAhupuaa, setSelectedAhupuaa] = useState<typeof hawaiianAhupuaa[0] | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical Priority': return 'bg-red-100 text-red-800 border-red-200';
      case 'Active Restoration': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expanding': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cultural Preservation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Hawaiʻi Regeneration Network
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Connecting communities to restore native ecosystems and traditional practices across the Hawaiian Islands
        </p>
        <DataSourceAttribution
          source="Hawaiian Conservation Organizations"
          lastUpdated="2025-02-02"
          dataType="Active restoration projects"
          reliability="official"
          className="justify-center"
        />
      </div>

      {/* Wildlife Activity Feed */}
      <WildlifeFeedDemo />

      {/* Impact Statistics */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Sprout className="w-6 h-6 text-green-600" />
            Collective Impact Across Hawaiʻi
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">{regenerationStats.totalAcresRestored.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Acres Restored</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{regenerationStats.nativeSpeciesRecovered}</div>
              <div className="text-sm text-gray-600">Native Species Recovered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{regenerationStats.volunteersActive.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Active Volunteers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">{regenerationStats.partnershipsFormed}</div>
              <div className="text-sm text-gray-600">Community Partnerships</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600">{regenerationStats.carbonSequestered.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Tons CO₂ Sequestered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">{regenerationStats.waterProtected}</div>
              <div className="text-sm text-gray-600">Billion Gal. Protected</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <DataSourceAttribution
              source="Hawaii Conservation Alliance"
              lastUpdated="2025-01-15"
              dataType="Restoration metrics"
              reliability="official"
              className="justify-center"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ahupua'a Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Mountain className="w-6 h-6 text-green-600" />
          Active Ahupua'a Restoration Projects
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hawaiianAhupuaa.map(ahupuaa => (
            <Card 
              key={ahupuaa.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setSelectedAhupuaa(ahupuaa)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{ahupuaa.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{ahupuaa.island}</span>
                    </div>
                    <Badge className={`${getStatusColor(ahupuaa.status)} mb-3`}>
                      {ahupuaa.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{ahupuaa.description}</p>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Restoration Progress</span>
                    <span className="text-sm text-gray-600">{ahupuaa.progress}%</span>
                  </div>
                  <Progress value={ahupuaa.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Key Projects</div>
                    {ahupuaa.keyProjects.slice(0, 2).map((project, index) => (
                      <div key={index} className="text-gray-600">• {project}</div>
                    ))}
                    {ahupuaa.keyProjects.length > 2 && (
                      <div className="text-gray-500">+{ahupuaa.keyProjects.length - 2} more</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Native Species Focus</div>
                    {ahupuaa.nativeSpecies.map((species, index) => (
                      <div key={index} className="text-gray-600">• {species}</div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">{ahupuaa.volunteersNeeded} volunteers needed</span>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Join Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Traditional Knowledge Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            ʻĀina-Based Traditional Practices
          </h2>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agriculture" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="agriculture">
                <Leaf className="w-4 h-4 mr-1" />
                Agriculture
              </TabsTrigger>
              <TabsTrigger value="aquaculture">
                <Fish className="w-4 h-4 mr-1" />
                Aquaculture
              </TabsTrigger>
              <TabsTrigger value="forestry">
                <TreePine className="w-4 h-4 mr-1" />
                Forestry
              </TabsTrigger>
              <TabsTrigger value="water">
                <Waves className="w-4 h-4 mr-1" />
                Water Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agriculture" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Traditional Taro (Kalo) Cultivation</h3>
                <p className="text-green-700 mb-3">
                  Ancient Hawaiian agricultural practices that create sustainable food systems while enhancing watershed health and biodiversity.
                </p>
                <div className="text-sm text-green-600">
                  <div>• Terraced lo'i systems for water conservation</div>
                  <div>• Rotational planting for soil health</div>
                  <div>• Native companion plantings</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Native Hawaiian Cultural Organizations"
                lastUpdated="2024-12-01"
                dataType="Traditional agricultural practices"
                reliability="community"
              />
            </TabsContent>

            <TabsContent value="aquaculture" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Ancient Fishpond Systems</h3>
                <p className="text-blue-700 mb-3">
                  Traditional Hawaiian aquaculture that provided sustainable protein while maintaining healthy coastal ecosystems.
                </p>
                <div className="text-sm text-blue-600">
                  <div>• Loko i'a (fishpond) restoration</div>
                  <div>• Native fish species recovery</div>
                  <div>• Coastal habitat enhancement</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Hui Mālama Loko I'a"
                lastUpdated="2024-11-20"
                dataType="Fishpond restoration data"
                reliability="community"
              />
            </TabsContent>

            <TabsContent value="forestry" className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Native Forest Stewardship</h3>
                <p className="text-amber-700 mb-3">
                  Traditional forest management practices that maintain biodiversity while providing materials for cultural practices.
                </p>
                <div className="text-sm text-amber-600">
                  <div>• Selective harvesting techniques</div>
                  <div>• Fire management practices</div>
                  <div>• Sacred grove protection</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Native Hawaiian Forestry Initiative"
                lastUpdated="2024-10-15"
                dataType="Forest management practices"
                reliability="community"
              />
            </TabsContent>

            <TabsContent value="water" className="space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-800 mb-2">Watershed Management (Ahupua'a System)</h3>
                <p className="text-cyan-700 mb-3">
                  Integrated land management from mountain to sea that ensures sustainable water resources for all communities.
                </p>
                <div className="text-sm text-cyan-600">
                  <div>• Ridge-to-reef conservation</div>
                  <div>• Stream restoration practices</div>
                  <div>• Groundwater protection</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Hawaiian Watershed Partnerships"
                lastUpdated="2025-01-10"
                dataType="Watershed management data"
                reliability="official"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Get Involved Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Kōkua (Help) Hawaiʻi Regenerate
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Volunteer Workdays</h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">Join hands-on restoration activities every weekend across all islands.</p>
              <Button size="sm" className="w-full">Find Workdays</Button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sprout className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Adopt a Native Plant</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">Sponsor native plants for restoration projects and track their growth.</p>
              <Button size="sm" className="w-full">Adopt Plants</Button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Cultural Learning</h3>
              </div>
              <p className="text-sm text-purple-700 mb-3">Learn traditional practices from Native Hawaiian cultural practitioners.</p>
              <Button size="sm" className="w-full">Join Classes</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Detail Modal */}
      {selectedAhupuaa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">{selectedAhupuaa.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{selectedAhupuaa.island}</span>
                    <Badge className={getStatusColor(selectedAhupuaa.status)}>
                      {selectedAhupuaa.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedAhupuaa(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 text-lg">{selectedAhupuaa.description}</p>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Restoration Progress</span>
                  <span className="text-gray-600">{selectedAhupuaa.progress}%</span>
                </div>
                <Progress value={selectedAhupuaa.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Current Projects</h3>
                  <div className="space-y-2">
                    {selectedAhupuaa.keyProjects.map((project, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{project}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Native Species Focus</h3>
                  <div className="space-y-2">
                    {selectedAhupuaa.nativeSpecies.map((species, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{species}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Community Partnerships</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAhupuaa.partnerships.map((partner, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">How You Can Help</h3>
                <p className="text-blue-700 mb-3">
                  We need {selectedAhupuaa.volunteersNeeded} more volunteers to meet our restoration goals for this ahupua'a.
                </p>
                <div className="flex gap-3">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Users className="w-4 h-4 mr-2" />
                    Volunteer
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HawaiiRegenerationPage;