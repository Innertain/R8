import { useState } from "react";
import { MapPin, Layers, Filter, Home, AlertTriangle, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapSVG from "@/components/MapSVG";

// Bioregionally-aware mock data for demonstration
const mockDisasters = [
  { id: 1, type: "Wildfire", location: "Pacific Northwest Coastal", severity: "high", activeVolunteers: 245, bioregion: "pacific-northwest-coastal" },
  { id: 2, type: "Flooding", location: "Great Plains", severity: "medium", activeVolunteers: 89, bioregion: "great-plains" },
  { id: 3, type: "Hurricane", location: "Southeastern Coastal Plain", severity: "high", activeVolunteers: 312, bioregion: "southeastern-coastal" },
  { id: 4, type: "Drought", location: "Great Basin", severity: "medium", activeVolunteers: 156, bioregion: "great-basin" },
];

const mockCommunityActivities = [
  { id: 1, type: "Food Distribution", location: "Eastern Deciduous Forests", participants: 67, bioregion: "eastern-deciduous" },
  { id: 2, type: "Indigenous Land Restoration", location: "Boreal Shield", participants: 23, bioregion: "boreal-shield" },
  { id: 3, type: "Climate Resilience Workshop", location: "Great Plains", participants: 145, bioregion: "great-plains" },
  { id: 4, type: "Coastal Protection", location: "Pacific Northwest Coastal", participants: 89, bioregion: "pacific-northwest-coastal" },
];

type MapViewType = "bioregions" | "states" | "counties" | "fema";

export default function InteractiveMap() {
  const [mapView, setMapView] = useState<MapViewType>("states");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showDisasters, setShowDisasters] = useState(true);
  const [showActivities, setShowActivities] = useState(true);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Community Response Map</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={mapView} onValueChange={(value: MapViewType) => setMapView(value)}>
                <SelectTrigger className="w-48">
                  <Layers className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select map view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bioregions">Bioregions</SelectItem>
                  <SelectItem value="states">States & Provinces</SelectItem>
                  <SelectItem value="counties">Counties</SelectItem>
                  <SelectItem value="fema">FEMA Regions</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={showDisasters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDisasters(!showDisasters)}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Disasters
                </Button>
                <Button
                  variant={showActivities ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowActivities(!showActivities)}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Activities
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {mapView === "bioregions" && "Bioregional View"}
                  {mapView === "states" && "States & Provinces"}
                  {mapView === "counties" && "County Level"}
                  {mapView === "fema" && "FEMA Regions"}
                </CardTitle>
                <CardDescription>
                  Interactive map showing disaster response and community activities across North America
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                <MapSVG 
                  mapView={mapView}
                  onRegionClick={(regionId, regionName) => setSelectedRegion(regionName)}
                  showDisasters={showDisasters}
                  showActivities={showActivities}
                />
                {selectedRegion && (
                  <div className="mt-4">
                    <Badge variant="secondary">
                      Selected: {selectedRegion}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Map Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Disaster Severity</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">High Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Low Priority</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Activity Types</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Home className="w-3 h-3 text-blue-500" />
                      <span className="text-sm">Food Distribution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-green-500" />
                      <span className="text-sm">Community Events</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <span className="text-sm">Disaster Response</span>
                    </div>
                  </div>
                </div>
                
                {mapView === "bioregions" && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Bioregions</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{backgroundColor: "#8FBC8F"}}></div>
                        <span>Pacific Northwest Coastal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{backgroundColor: "#F0E68C"}}></div>
                        <span>Great Plains</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{backgroundColor: "#90EE90"}}></div>
                        <span>Eastern Deciduous</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{backgroundColor: "#DDA0DD"}}></div>
                        <span>Boreal Shield</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Events */}
            <Card>
              <CardHeader>
                <CardTitle>Active Events</CardTitle>
                <CardDescription>
                  Current disasters and community activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="disasters" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="disasters">Disasters</TabsTrigger>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="disasters" className="space-y-3 mt-4">
                    {mockDisasters.map((disaster) => (
                      <div key={disaster.id} className="p-3 border rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{disaster.type}</span>
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(disaster.severity)}`}></div>
                        </div>
                        <p className="text-xs text-gray-600">{disaster.location}</p>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{disaster.activeVolunteers} volunteers</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="activities" className="space-y-3 mt-4">
                    {mockCommunityActivities.map((activity) => (
                      <div key={activity.id} className="p-3 border rounded-lg space-y-1">
                        <span className="font-medium text-sm">{activity.type}</span>
                        <p className="text-xs text-gray-600">{activity.location}</p>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{activity.participants} participants</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Disasters</span>
                  <span className="font-medium">{mockDisasters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Community Activities</span>
                  <span className="font-medium">{mockCommunityActivities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Volunteers</span>
                  <span className="font-medium">
                    {mockDisasters.reduce((sum, d) => sum + d.activeVolunteers, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}