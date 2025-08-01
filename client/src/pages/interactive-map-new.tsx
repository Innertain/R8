import { useState } from "react";
import { MapPin, ArrowLeft, Layers, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

import { DisasterAnalyticsDashboard } from "@/components/DisasterAnalyticsDashboard";

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
  const [mapType, setMapType] = useState<"states" | "bioregions">("bioregions");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);
  const [selectedRegionType, setSelectedRegionType] = useState<'state' | 'bioregion' | null>(null);
  const [globalStateFilter, setGlobalStateFilter] = useState<string>('all');

  // Fetch FEMA disaster data
  const { data: femaData, isLoading } = useQuery({
    queryKey: ['/api/fema-disasters'],
    enabled: true
  });

  const handleRegionClick = (regionId: string, regionName: string, regionType: 'state' | 'bioregion') => {
    setSelectedRegion(regionId);
    setSelectedRegionName(regionName);
    setSelectedRegionType(regionType);
  };

  const handleBackToMap = () => {
    setSelectedRegion(null);
    setSelectedRegionName(null);
    setSelectedRegionType(null);
  };

  const getFilterLocation = () => {
    return selectedRegionType === 'state' ? selectedRegionName : null;
  };

  // Function to handle state filter changes from weather map
  const handleStateFilterChange = (stateCode: string) => {
    console.log('State filter changed to:', stateCode);
    setGlobalStateFilter(stateCode);
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
              {selectedRegion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToMap}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Map
                </Button>
              )}
              
              <Badge variant="secondary" className="flex items-center gap-1">
                {mapType === "states" ? <MapPin className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {selectedRegion
                  ? `${selectedRegionType === 'state' ? 'State' : 'Bioregion'} View`
                  : `${mapType === 'states' ? 'Political' : 'Ecological'} View`
                }
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-full space-y-8">
          {/* Disaster Analytics Dashboard */}
          <div className="w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-600">Loading disaster data...</div>
              </div>
            ) : (
              <DisasterAnalyticsDashboard disasters={(femaData as any)?.items || []} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}