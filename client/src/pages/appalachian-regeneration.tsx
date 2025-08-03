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
  Pickaxe
} from 'lucide-react';
import DataSourceAttribution from '@/components/DataSourceAttribution';
import WildlifeFeedDemo from '@/components/WildlifeFeedDemo';
import appalachianLandscapeImage from '@assets/Appalachian _1754183249913.png';

// Appalachian restoration regions - traditional watershed and forest systems
const appalachianProjects = [
  {
    id: 'blue-ridge',
    name: 'Blue Ridge Headwaters',
    state: 'North Carolina',
    description: 'High-elevation forest restoration focusing on endemic species and traditional mountain farming revival',
    status: 'Critical Priority',
    progress: 67,
    keyProjects: ['Fraser Fir Recovery Program', 'Heritage Seed Bank', 'Mountain Farm Restoration'],
    nativeSpecies: ['Fraser Fir', 'Red Spruce', 'Mountain Laurel'],
    partnerships: ['Appalachian Sustainable Agriculture Project', 'Mountain Horticultural Crops Research'],
    volunteersNeeded: 35
  },
  {
    id: 'great-smoky',
    name: 'Great Smoky Mountains Buffer',
    state: 'Tennessee',
    description: 'Protecting and restoring the biodiversity hotspot through community-led conservation',
    status: 'Active Restoration',
    progress: 78,
    keyProjects: ['Invasive Species Removal', 'Native Plant Nursery', 'Traditional Knowledge Documentation'],
    nativeSpecies: ['American Chestnut', 'Bloodroot', 'Trillium'],
    partnerships: ['Great Smoky Mountains National Park', 'Tennessee Native Plant Society'],
    volunteersNeeded: 20
  },
  {
    id: 'coal-country',
    name: 'Central Appalachian Mine Reclamation',
    state: 'West Virginia',
    description: 'Transforming abandoned mine lands into thriving ecosystems and sustainable communities',
    status: 'Expanding',
    progress: 52,
    keyProjects: ['Mountaintop Reforestation', 'Soil Building Initiative', 'Community Gardens Network'],
    nativeSpecies: ['White Oak', 'Sugar Maple', 'Wild Ginseng'],
    partnerships: ['Appalachian Citizens Law Center', 'Green Forests Work'],
    volunteersNeeded: 45
  },
  {
    id: 'shenandoah',
    name: 'Shenandoah Valley Agriculture',
    state: 'Virginia',
    description: 'Reviving traditional farming practices while protecting watershed health',
    status: 'Heritage Preservation',
    progress: 84,
    keyProjects: ['Heirloom Crop Conservation', 'Rotational Grazing Systems', 'Riparian Restoration'],
    nativeSpecies: ['Pawpaw', 'Persimmon', 'Black Walnut'],
    partnerships: ['Polyface Farm', 'Shenandoah Valley Seed Exchange'],
    volunteersNeeded: 12
  }
];

const regenerationStats = {
  totalAcresRestored: 89450,
  minesSitesCleaned: 312,
  volunteersActive: 1890,
  partnershipsFormed: 127,
  carbonSequestered: 15600, // tons
  speciesReintroduced: 67
};

const AppalachianRegenerationPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<typeof appalachianProjects[0] | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical Priority': return 'bg-red-100 text-red-800 border-red-200';
      case 'Active Restoration': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expanding': return 'bg-green-100 text-green-800 border-green-200';
      case 'Heritage Preservation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-0">
      {/* Hero Section with Landscape */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={appalachianLandscapeImage} 
          alt="Appalachian mountain landscape with rolling green hills and valleys"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 text-white px-6">
            <h1 className="text-5xl font-bold drop-shadow-lg">
              Appalachian Regeneration Network
            </h1>
            <p className="text-xl max-w-3xl mx-auto drop-shadow-md">
              Restoring the ancient mountains through traditional knowledge, forest stewardship, and community-led conservation
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
        <DataSourceAttribution
          source="Appalachian Regional Commission"
          lastUpdated="2025-01-28"
          dataType="Regional restoration initiatives"
          reliability="official"
          className="justify-center"
        />
      </div>

      {/* Wildlife Activity Feed - Now includes integrated conservation details */}
      <WildlifeFeedDemo 
        bioregionName="Southeastern Mixed Forests"
        bioregionId="southeastern_mixed_forests"
        regionTitle="Appalachian"
      />

      {/* Impact Statistics */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Mountain className="w-6 h-6 text-green-600" />
            Healing the Ancient Mountains
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">{regenerationStats.totalAcresRestored.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Acres Restored</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600">{regenerationStats.minesSitesCleaned}</div>
              <div className="text-sm text-gray-600">Mine Sites Reclaimed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{regenerationStats.volunteersActive.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Active Volunteers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{regenerationStats.partnershipsFormed}</div>
              <div className="text-sm text-gray-600">Community Partnerships</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600">{regenerationStats.carbonSequestered.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Tons CO₂ Stored</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">{regenerationStats.speciesReintroduced}</div>
              <div className="text-sm text-gray-600">Native Species Restored</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <DataSourceAttribution
              source="Appalachian Forest Heritage Area"
              lastUpdated="2025-01-15"
              dataType="Conservation metrics"
              reliability="official"
              className="justify-center"
            />
          </div>
        </CardContent>
      </Card>

      {/* Regional Projects Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <TreePine className="w-6 h-6 text-green-600" />
          Active Restoration Regions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appalachianProjects.map(project => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setSelectedProject(project)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{project.state}</span>
                    </div>
                    <Badge className={`${getStatusColor(project.status)} mb-3`}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{project.description}</p>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Restoration Progress</span>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Key Projects</div>
                    {project.keyProjects.slice(0, 2).map((proj, index) => (
                      <div key={index} className="text-gray-600">• {proj}</div>
                    ))}
                    {project.keyProjects.length > 2 && (
                      <div className="text-gray-500">+{project.keyProjects.length - 2} more</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Native Species Focus</div>
                    {project.nativeSpecies.map((species, index) => (
                      <div key={index} className="text-gray-600">• {species}</div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">{project.volunteersNeeded} volunteers needed</span>
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
            Mountain Heritage & Traditional Practices
          </h2>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="forestry" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forestry">
                <TreePine className="w-4 h-4 mr-1" />
                Forest Stewardship
              </TabsTrigger>
              <TabsTrigger value="agriculture">
                <Sprout className="w-4 h-4 mr-1" />
                Heritage Agriculture
              </TabsTrigger>
              <TabsTrigger value="remediation">
                <Pickaxe className="w-4 h-4 mr-1" />
                Land Healing
              </TabsTrigger>
              <TabsTrigger value="water">
                <Waves className="w-4 h-4 mr-1" />
                Watershed Protection
              </TabsTrigger>
            </TabsList>

            <TabsContent value="forestry" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Sustainable Forest Management</h3>
                <p className="text-green-700 mb-3">
                  Traditional Appalachian forestry practices that maintain biodiversity while providing materials for communities, passed down through generations of mountain families.
                </p>
                <div className="text-sm text-green-600">
                  <div>• Selective harvest techniques for diverse age forests</div>
                  <div>• Controlled burning for ecosystem health</div>
                  <div>• Traditional hardwood management</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Appalachian Forest Heritage Foundation"
                lastUpdated="2024-11-30"
                dataType="Traditional forestry practices"
                reliability="community"
              />
            </TabsContent>

            <TabsContent value="agriculture" className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Heritage Seed & Mountain Farming</h3>
                <p className="text-amber-700 mb-3">
                  Preserving heirloom varieties and traditional farming methods adapted to mountain terrain, including heritage breeds and crops that sustained communities for centuries.
                </p>
                <div className="text-sm text-amber-600">
                  <div>• Heirloom seed preservation and exchange</div>
                  <div>• Terraced hillside farming techniques</div>
                  <div>• Heritage livestock breed conservation</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Southern Seed Legacy"
                lastUpdated="2024-12-10"
                dataType="Heritage crop varieties"
                reliability="community"
              />
            </TabsContent>

            <TabsContent value="remediation" className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Mine Land Restoration</h3>
                <p className="text-orange-700 mb-3">
                  Innovative approaches to healing land damaged by extractive industries, creating productive ecosystems and economic opportunities for coal-impacted communities.
                </p>
                <div className="text-sm text-orange-600">
                  <div>• Soil building on disturbed lands</div>
                  <div>• Native tree reforestation on mountaintops</div>
                  <div>• Sustainable agriculture on reclaimed sites</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Office of Surface Mining Reclamation"
                lastUpdated="2024-12-20"
                dataType="Mine reclamation data"
                reliability="official"
              />
            </TabsContent>

            <TabsContent value="water" className="space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-800 mb-2">Headwater Stewardship</h3>
                <p className="text-cyan-700 mb-3">
                  Protecting the source waters that flow from Appalachian mountains to supply millions of people, using traditional knowledge combined with modern conservation science.
                </p>
                <div className="text-sm text-cyan-600">
                  <div>• Riparian buffer restoration</div>
                  <div>• Stream bank stabilization with native plants</div>
                  <div>• Traditional spring protection methods</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Appalachian Waters Alliance"
                lastUpdated="2025-01-05"
                dataType="Watershed protection data"
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
            Help Heal the Mountains
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Restoration Workdays</h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">Join monthly forest restoration and native plant work parties across the region.</p>
              <Button size="sm" className="w-full">Find Workdays</Button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sprout className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Heritage Seed Exchange</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">Preserve mountain heritage by saving and sharing traditional crop varieties.</p>
              <Button size="sm" className="w-full">Join Exchange</Button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Learn Traditional Skills</h3>
              </div>
              <p className="text-sm text-purple-700 mb-3">Workshops on traditional crafts, forest stewardship, and sustainable living.</p>
              <Button size="sm" className="w-full">Find Classes</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">{selectedProject.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{selectedProject.state}</span>
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedProject(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 text-lg">{selectedProject.description}</p>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Restoration Progress</span>
                  <span className="text-gray-600">{selectedProject.progress}%</span>
                </div>
                <Progress value={selectedProject.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Current Projects</h3>
                  <div className="space-y-2">
                    {selectedProject.keyProjects.map((proj, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{proj}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Native Species Focus</h3>
                  <div className="space-y-2">
                    {selectedProject.nativeSpecies.map((species, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{species}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Partnership Organizations</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.partnerships.map((partner, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Volunteer Opportunities</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  We need {selectedProject.volunteersNeeded} volunteers for upcoming restoration activities. 
                  No experience required - we provide training and tools.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Sign Up to Volunteer
                  </Button>
                  <Button size="sm" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              
              <DataSourceAttribution
                source="Regional Partnership Data"
                lastUpdated="2025-01-20"
                dataType="Project status updates"
                reliability="official"
                className="justify-center"
              />
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};

export default AppalachianRegenerationPage;