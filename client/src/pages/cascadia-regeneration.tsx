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
  CloudRain
} from 'lucide-react';
import DataSourceAttribution from '@/components/DataSourceAttribution';
import WildlifeActivityFeed from '@/components/WildlifeActivityFeed';
import cascadiaLandscapeUrl from '../assets/cascadia-landscape.jpg?url';

// Cascadia restoration regions - temperate rainforest and watershed ecosystems
const cascadiaProjects = [
  {
    id: 'olympic-peninsula',
    name: 'Olympic Peninsula Temperate Rainforest',
    state: 'Washington',
    description: 'Protecting and restoring ancient temperate rainforest ecosystems through Indigenous knowledge and forest stewardship',
    status: 'Critical Priority',
    progress: 73,
    keyProjects: ['Old-Growth Protection', 'Salmon Stream Restoration', 'Indigenous Knowledge Integration'],
    nativeSpecies: ['Sitka Spruce', 'Western Red Cedar', 'Douglas Fir'],
    partnerships: ['Olympic Forest Coalition', 'Quinault Nation', 'Peninsula Restoration Society'],
    volunteersNeeded: 42
  },
  {
    id: 'columbia-river',
    name: 'Columbia River Gorge Watershed',
    state: 'Oregon & Washington',
    description: 'Restoring the mighty Columbia River corridor through dam removal, fish passage, and riparian forest recovery',
    status: 'Active Restoration',
    progress: 86,
    keyProjects: ['Dam Removal Initiative', 'Salmon Habitat Restoration', 'Native Forest Replanting'],
    nativeSpecies: ['Chinook Salmon', 'Steelhead Trout', 'Oregon White Oak'],
    partnerships: ['Columbia River Inter-Tribal Fish Commission', 'Bonneville Environmental Foundation'],
    volunteersNeeded: 28
  },
  {
    id: 'cascade-range',
    name: 'North Cascades Forest Recovery',
    state: 'Washington',
    description: 'Healing clearcut forests and protecting biodiversity corridors throughout the Cascade Mountain ecosystem',
    status: 'Expanding',
    progress: 61,
    keyProjects: ['Clearcut Reforestation', 'Wildlife Corridor Creation', 'Fire Ecology Restoration'],
    nativeSpecies: ['Mountain Goat', 'Pacific Marten', 'Whitebark Pine'],
    partnerships: ['North Cascades Conservation Council', 'Washington Native Plant Society'],
    volunteersNeeded: 35
  },
  {
    id: 'puget-sound',
    name: 'Puget Sound Shoreline Restoration',
    state: 'Washington',
    description: 'Revitalizing Puget Sound marine ecosystems through kelp forest restoration and orca habitat protection',
    status: 'Marine Conservation',
    progress: 78,
    keyProjects: ['Kelp Forest Restoration', 'Orca Habitat Protection', 'Shoreline Armor Removal'],
    nativeSpecies: ['Bull Kelp', 'Pacific Herring', 'Dungeness Crab'],
    partnerships: ['Puget Sound Partnership', 'SeaDoc Society', 'Whale Research Center'],
    volunteersNeeded: 19
  },
  {
    id: 'coastal-range',
    name: 'Oregon Coast Range Timber Transition',
    state: 'Oregon',
    description: 'Transitioning industrial timber lands to diverse native forest ecosystems and sustainable forestry practices',
    status: 'Forest Transition',
    progress: 55,
    keyProjects: ['Sustainable Forest Conversion', 'Riparian Buffer Enhancement', 'Native Species Reintroduction'],
    nativeSpecies: ['Oregon Grape', 'Red Alder', 'Roosevelt Elk'],
    partnerships: ['Beyond Toxics', 'Oregon Wild', 'Coast Range Forest Trust'],
    volunteersNeeded: 33
  }
];

const regenerationStats = {
  totalAcresRestored: 127650,
  salmonRunsRevived: 15,
  volunteersActive: 2340,
  partnershipsFormed: 89,
  carbonSequestered: 23400, // tons
  oldGrowthProtected: 8950 // acres
};

const CascadiaRegenerationPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<typeof cascadiaProjects[0] | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical Priority': return 'bg-red-100 text-red-800 border-red-200';
      case 'Active Restoration': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expanding': return 'bg-green-100 text-green-800 border-green-200';
      case 'Marine Conservation': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Forest Transition': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-0">
      {/* Hero Section with Landscape */}
      <div className="relative h-96 overflow-hidden">
        {/* Beautiful Cascadia mountain landscape */}
        <img 
          src={cascadiaLandscapeUrl} 
          alt="Cascadia temperate rainforest and snow-capped mountains"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', cascadiaLandscapeUrl);
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => console.log('Image loaded successfully:', cascadiaLandscapeUrl)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 text-white px-6">
            <h1 className="text-5xl font-bold drop-shadow-lg">
              Cascadia Bioregion Regeneration
            </h1>
            <p className="text-xl max-w-3xl mx-auto drop-shadow-md">
              Restoring the temperate rainforests, watersheds, and marine ecosystems of the Pacific Northwest through Indigenous wisdom and ecological science
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
        <DataSourceAttribution
          source="Cascadia Forest Alliance"
          lastUpdated="2025-01-28"
          dataType="Regional restoration initiatives"
          reliability="official"
          className="justify-center"
        />
      </div>

      {/* Wildlife Activity Feed - Now includes integrated conservation details */}
      <WildlifeActivityFeed 
        bioregionName="Cascadia Bioregion"
        bioregionId="cascadia_bioregion"
      />

      {/* Impact Statistics */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TreePine className="w-6 h-6 text-green-600" />
            Healing the Temperate Rainforest
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">{regenerationStats.totalAcresRestored.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Acres Restored</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{regenerationStats.salmonRunsRevived}</div>
              <div className="text-sm text-gray-600">Salmon Runs Revived</div>
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
              <div className="text-3xl font-bold text-emerald-600">{regenerationStats.oldGrowthProtected.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Old-Growth Protected</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <DataSourceAttribution
              source="Pacific Northwest Forest Restoration Alliance"
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
          <Mountain className="w-6 h-6 text-green-600" />
          Active Restoration Regions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cascadiaProjects.map(project => (
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
            Indigenous Wisdom & Cascadian Traditions
          </h2>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="forest" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forest">
                <TreePine className="w-4 h-4 mr-1" />
                Forest Stewardship
              </TabsTrigger>
              <TabsTrigger value="salmon">
                <Fish className="w-4 h-4 mr-1" />
                Salmon Restoration
              </TabsTrigger>
              <TabsTrigger value="marine">
                <Waves className="w-4 h-4 mr-1" />
                Marine Ecosystems
              </TabsTrigger>
              <TabsTrigger value="watershed">
                <CloudRain className="w-4 h-4 mr-1" />
                Watershed Healing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="forest" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Indigenous Forest Management</h3>
                <p className="text-green-700 mb-3">
                  Traditional practices of Coast Salish, Chinook, and other Indigenous nations for managing temperate rainforest ecosystems through cultural burning, selective harvest, and ceremonial stewardship.
                </p>
                <div className="text-sm text-green-600">
                  <div>• Cultural burning for forest health</div>
                  <div>• Selective cedar bark harvesting</div>
                  <div>• Traditional ecological calendar following</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Indigenous Forest Alliance of BC & PNW"
                lastUpdated="2024-11-30"
                dataType="Traditional forestry practices"
                reliability="community"
              />
            </TabsContent>

            <TabsContent value="salmon" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Salmon Nation Restoration</h3>
                <p className="text-blue-700 mb-3">
                  Reviving salmon runs through dam removal, spawning habitat restoration, and the Indigenous knowledge that has sustained these keystone species for millennia.
                </p>
                <div className="text-sm text-blue-600">
                  <div>• Traditional fish weir construction</div>
                  <div>• Spawning gravel restoration</div>
                  <div>• Riparian forest enhancement</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Columbia River Inter-Tribal Fish Commission"
                lastUpdated="2024-12-10"
                dataType="Salmon restoration data"
                reliability="official"
              />
            </TabsContent>

            <TabsContent value="marine" className="space-y-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h3 className="font-semibold text-cyan-800 mb-2">Kelp Forest & Marine Recovery</h3>
                <p className="text-cyan-700 mb-3">
                  Protecting and restoring kelp forests, eel grass beds, and marine biodiversity using both traditional Indigenous stewardship and modern marine science.
                </p>
                <div className="text-sm text-cyan-600">
                  <div>• Bull kelp forest restoration</div>
                  <div>• Traditional shellfish management</div>
                  <div>• Marine protected area establishment</div>
                </div>
              </div>
              <DataSourceAttribution
                source="SeaDoc Society & Coastal First Nations"
                lastUpdated="2024-12-20"
                dataType="Marine restoration data"
                reliability="official"
              />
            </TabsContent>

            <TabsContent value="watershed" className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">Watershed Restoration</h3>
                <p className="text-emerald-700 mb-3">
                  Healing entire watersheds from headwaters to sea, integrating Indigenous water knowledge with restoration science to create resilient hydrological systems.
                </p>
                <div className="text-sm text-emerald-600">
                  <div>• Stream daylighting and restoration</div>
                  <div>• Wetland reconstruction</div>
                  <div>• Traditional water ceremony sites protection</div>
                </div>
              </div>
              <DataSourceAttribution
                source="Pacific Northwest Watershed Alliance"
                lastUpdated="2025-01-05"
                dataType="Watershed restoration data"
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
            Join the Cascadia Regeneration
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TreePine className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Forest Restoration Days</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">Help plant native trees, remove invasive species, and restore old-growth forest ecosystems.</p>
              <Button size="sm" className="w-full">Find Restoration Days</Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Fish className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Salmon Habitat Projects</h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">Support salmon runs through stream restoration, gravel placement, and habitat monitoring.</p>
              <Button size="sm" className="w-full">Join Salmon Work</Button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Learn Indigenous Practices</h3>
              </div>
              <p className="text-sm text-purple-700 mb-3">Workshops on traditional ecological knowledge, plant medicine, and land stewardship.</p>
              <Button size="sm" className="w-full">Find Programs</Button>
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

export default CascadiaRegenerationPage;