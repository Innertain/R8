import { useState } from "react";
import { MapPin, ArrowLeft, Layers, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InteractiveUSMap from "@/components/InteractiveUSMap";
import BioregionalMap from "@/components/BioregionalMap";
import RealTimeAlerts from "@/components/RealTimeAlerts";

// State name mapping for display
const stateNames: { [key: string]: string } = {
  "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
  "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
  "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
  "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
  "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
  "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
  "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
  "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
  "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
  "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
};

export default function InteractiveMap() {
  const [mapType, setMapType] = useState<"political" | "bioregions">("bioregions");
  
  // Political boundaries state
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [showCounties, setShowCounties] = useState(false);

  // Bioregional state
  const [selectedBioregion, setSelectedBioregion] = useState<string | null>(null);

  const handleStateClick = (stateCode: string, stateName: string) => {
    setSelectedState(stateCode);
    setShowCounties(true);
    setSelectedCounty(null);
  };

  const handleCountyClick = (countyName: string, stateCode: string) => {
    setSelectedCounty(countyName);
  };

  const handleBioregionClick = (bioregionId: string, bioregionName: string) => {
    setSelectedBioregion(bioregionId);
  };

  const handleBackToStates = () => {
    setSelectedState(null);
    setShowCounties(false);
    setSelectedCounty(null);
  };

  const handleBackToBioregions = () => {
    setSelectedBioregion(null);
  };

  const getSelectedStateName = () => {
    return selectedState ? stateNames[selectedState] || selectedState : null;
  };

  const getFilterLocation = () => {
    if (mapType === "political") {
      return getSelectedStateName();
    } else {
      // For bioregions, we could filter by bioregion name, but for now use null
      return null;
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
              <h1 className="text-xl font-semibold text-gray-900">Emergency Response Map</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {(selectedState || selectedBioregion) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={mapType === "political" ? handleBackToStates : handleBackToBioregions}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {mapType === "political" ? "Back to States" : "Back to Bioregions"}
                </Button>
              )}
              
              <Badge variant="secondary" className="flex items-center gap-1">
                {mapType === "political" ? <MapPin className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {mapType === "political" 
                  ? (selectedState 
                      ? (showCounties ? "County View" : "State View") 
                      : "National View"
                    )
                  : (selectedBioregion ? "Bioregion View" : "Ecological View")
                }
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {mapType === "political" ? <MapPin className="w-5 h-5 text-blue-600" /> : <Globe className="w-5 h-5 text-green-600" />}
                  Interactive North America Map
                  {selectedState && mapType === "political" && (
                    <Badge variant="outline">
                      {selectedState}
                    </Badge>
                  )}
                  {selectedBioregion && mapType === "bioregions" && (
                    <Badge variant="outline">
                      Bioregion {selectedBioregion}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={mapType} onValueChange={(value) => setMapType(value as "political" | "bioregions")} className="mb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="political" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Political Boundaries
                    </TabsTrigger>
                    <TabsTrigger value="bioregions" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Ecological Regions
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="political" className="mt-4">
                    <InteractiveUSMap
                      onStateClick={handleStateClick}
                      onCountyClick={handleCountyClick}
                      selectedState={selectedState}
                      showCounties={showCounties}
                    />
                  </TabsContent>
                  
                  <TabsContent value="bioregions" className="mt-4">
                    <BioregionalMap
                      onBioregionClick={handleBioregionClick}
                      selectedBioregion={selectedBioregion}
                      showEcoRegions={true}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Alerts Sidebar */}
          <div className="lg:col-span-1">
            <RealTimeAlerts 
              maxItems={5} 
              stateFilter={getFilterLocation()} 
            />

            {/* Selected Region Info */}
            {(selectedState || selectedCounty || selectedBioregion) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedBioregion ? "Bioregion Information" : 
                     selectedCounty ? "County Information" : "State Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedCounty && (
                      <div>
                        <strong className="text-sm">County:</strong>
                        <p className="text-sm text-gray-600">{selectedCounty}</p>
                      </div>
                    )}
                    {selectedState && mapType === "political" && (
                      <div>
                        <strong className="text-sm">State:</strong>
                        <p className="text-sm text-gray-600">{getSelectedStateName()}</p>
                      </div>
                    )}
                    {selectedBioregion && mapType === "bioregions" && (
                      <div>
                        <strong className="text-sm">Ecological Region:</strong>
                        <p className="text-sm text-gray-600">Bioregion {selectedBioregion}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Natural ecosystem boundaries that cross political borders
                        </p>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        {mapType === "bioregions" 
                          ? "Explore emergency resources organized by natural ecosystem boundaries."
                          : "Click on different regions to explore emergency resources and volunteer opportunities."
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}