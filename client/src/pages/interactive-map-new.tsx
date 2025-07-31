import { useState } from "react";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InteractiveUSMap from "@/components/InteractiveUSMap";
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
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [showCounties, setShowCounties] = useState(false);

  const handleStateClick = (stateCode: string, stateName: string) => {
    setSelectedState(stateCode);
    setShowCounties(true);
    setSelectedCounty(null);
  };

  const handleCountyClick = (countyName: string, stateCode: string) => {
    setSelectedCounty(countyName);
  };

  const handleBackToStates = () => {
    setSelectedState(null);
    setShowCounties(false);
    setSelectedCounty(null);
  };

  const getSelectedStateName = () => {
    return selectedState ? stateNames[selectedState] || selectedState : null;
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
              {selectedState && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToStates}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to States
                </Button>
              )}
              
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {selectedState 
                  ? (showCounties ? "County View" : "State View") 
                  : "National View"
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
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Interactive US Map
                  {selectedState && (
                    <Badge variant="outline">
                      {selectedState}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveUSMap
                  onStateClick={handleStateClick}
                  onCountyClick={handleCountyClick}
                  selectedState={selectedState}
                  showCounties={showCounties}
                />
              </CardContent>
            </Card>
          </div>

          {/* Emergency Alerts Sidebar */}
          <div className="lg:col-span-1">
            <RealTimeAlerts 
              maxItems={5} 
              stateFilter={getSelectedStateName()} 
            />

            {/* Selected Region Info */}
            {(selectedState || selectedCounty) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedCounty ? "County Information" : "State Information"}
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
                    {selectedState && (
                      <div>
                        <strong className="text-sm">State:</strong>
                        <p className="text-sm text-gray-600">{getSelectedStateName()}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Click on different regions to explore emergency resources and volunteer opportunities.
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