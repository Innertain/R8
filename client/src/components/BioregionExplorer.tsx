import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Globe, Search, Leaf, Info, ExternalLink } from 'lucide-react';
import { geocodeLocation } from '../utils/geocode';

// Sample bioregion data (in a real app, this would come from data/bioregions.geojson)
const SAMPLE_BIOREGIONS = [
  {
    id: 'na_pacific_northwest',
    name: 'Pacific Northwest Coastal Forests',
    description: 'Temperate rainforests and coastal ecosystems from Northern California to Southeast Alaska.',
    bounds: {
      north: 61.0,
      south: 39.0,
      east: -116.0,
      west: -180.0
    },
    properties: {
      biome: 'Temperate Broadleaf & Mixed Forests',
      area_km2: 463000,
      countries: ['United States', 'Canada'],
      climate: 'Oceanic climate with mild, wet winters and cool, dry summers'
    }
  },
  {
    id: 'na_great_plains',
    name: 'Great Plains Mixed Grasslands',
    description: 'Vast grassland ecosystem stretching from Canada to Texas, supporting diverse prairie wildlife.',
    bounds: {
      north: 54.0,
      south: 30.0,
      east: -93.0,
      west: -108.0
    },
    properties: {
      biome: 'Temperate Grasslands, Savannas & Shrublands',
      area_km2: 780000,
      countries: ['United States', 'Canada'],
      climate: 'Continental climate with hot summers and cold winters'
    }
  },
  {
    id: 'na_appalachian',
    name: 'Appalachian Mixed Mesophytic Forests',
    description: 'Ancient mountain forests with exceptional biodiversity from Georgia to Maine.',
    bounds: {
      north: 47.0,
      south: 30.0,
      east: -67.0,
      west: -90.0
    },
    properties: {
      biome: 'Temperate Broadleaf & Mixed Forests',
      area_km2: 245000,
      countries: ['United States'],
      climate: 'Humid continental and subtropical climate'
    }
  },
  {
    id: 'na_sonoran_desert',
    name: 'Sonoran Desert',
    description: 'Hot desert ecosystem known for saguaro cacti and unique desert biodiversity.',
    bounds: {
      north: 35.0,
      south: 23.0,
      east: -109.0,
      west: -117.0
    },
    properties: {
      biome: 'Deserts & Xeric Shrublands',
      area_km2: 260000,
      countries: ['United States', 'Mexico'],
      climate: 'Hot desert climate with very hot summers'
    }
  },
  {
    id: 'na_california_chaparral',
    name: 'California Chaparral & Woodlands',
    description: 'Mediterranean-climate ecosystem with fire-adapted shrublands and oak woodlands.',
    bounds: {
      north: 40.0,
      south: 30.0,
      east: -114.0,
      west: -125.0
    },
    properties: {
      biome: 'Mediterranean Forests, Woodlands & Scrub',
      area_km2: 85000,
      countries: ['United States', 'Mexico'],
      climate: 'Mediterranean climate with dry summers and mild, wet winters'
    }
  }
];

interface LocationFormProps {
  onLocationSelect: (location: {lat: number, lng: number, name: string}) => void;
  isLoading: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({ onLocationSelect, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputValue.trim()) {
      setError('Please enter a ZIP code or state name');
      return;
    }

    try {
      const result = await geocodeLocation(inputValue);
      if (result) {
        onLocationSelect(result);
      } else {
        setError('Location not found. Please try a valid ZIP code or state name.');
      }
    } catch (err) {
      setError('Error finding location. Please try again.');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" />
          Find Your Bioregion
        </h3>
        <p className="text-sm text-gray-600">
          Enter a U.S. ZIP code (e.g., "90210") or state name/abbreviation (e.g., "California" or "CA")
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="location-input">Location</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="location-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="90210 or California"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? 'Searching...' : 'Find'}
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

interface MapViewProps {
  selectedLocation: {lat: number, lng: number, name: string} | null;
  selectedBioregion: any | null;
}

const MapView: React.FC<MapViewProps> = ({ selectedLocation, selectedBioregion }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Interactive Bioregion Map
        </h3>
      </CardHeader>
      <CardContent>
        {/* Placeholder for React-Leaflet map */}
        <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-lg p-8 border-2 border-dashed border-green-200 text-center">
          <div className="space-y-4">
            <Leaf className="w-16 h-16 mx-auto text-green-500" />
            <div>
              <h4 className="text-lg font-semibold text-green-800">Interactive Map Coming Soon</h4>
              <p className="text-sm text-green-600 mt-2 max-w-md mx-auto">
                This will display an interactive map with bioregion polygons using React-Leaflet and OpenStreetMap tiles.
                {selectedLocation && (
                  <span className="block mt-2 font-medium">
                    📍 Selected: {selectedLocation.name}
                  </span>
                )}
              </p>
            </div>
            
            {selectedBioregion && (
              <div className="bg-white rounded-lg p-4 border border-green-200 text-left max-w-md mx-auto">
                <h5 className="font-semibold text-green-800">{selectedBioregion.name}</h5>
                <p className="text-sm text-gray-600 mt-1">{selectedBioregion.description}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            Implementation Notes
          </h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• React-Leaflet integration with OpenStreetMap tiles</p>
            <p>• GeoJSON polygon rendering for bioregion boundaries</p>
            <p>• Turf.js point-in-polygon analysis for location matching</p>
            <p>• Interactive pan/zoom with responsive highlighting</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BioregionExplorer: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, name: string} | null>(null);
  const [selectedBioregion, setSelectedBioregion] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simple point-in-bounds check (replaces Turf.js for demo)
  const findBioregionForLocation = (lat: number, lng: number) => {
    return SAMPLE_BIOREGIONS.find(bioregion => {
      const { bounds } = bioregion;
      return lat >= bounds.south && lat <= bounds.north && 
             lng >= bounds.west && lng <= bounds.east;
    });
  };

  const handleLocationSelect = async (location: {lat: number, lng: number, name: string}) => {
    setIsLoading(true);
    setSelectedLocation(location);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bioregion = findBioregionForLocation(location.lat, location.lng);
    setSelectedBioregion(bioregion);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Bioregion Explorer</h2>
              <p className="text-sm text-gray-600">
                Discover the ecological regions of North America
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-2">
              <Info className="w-4 h-4" />
              About Bioregions
            </h4>
            <p className="text-xs text-green-700 leading-relaxed">
              Bioregions are geographic areas defined by natural characteristics rather than political boundaries. 
              They represent distinct ecological communities with shared climate, geology, hydrology, and native species. 
              Understanding your bioregion helps connect you to local ecosystems and sustainable practices.
            </p>
          </div>
        </CardContent>
      </Card>

      <LocationForm onLocationSelect={handleLocationSelect} isLoading={isLoading} />
      
      <MapView selectedLocation={selectedLocation} selectedBioregion={selectedBioregion} />

      {selectedBioregion ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Your Bioregion: {selectedBioregion.name}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{selectedBioregion.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Characteristics</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Biome:</strong> {selectedBioregion.properties.biome}</div>
                    <div><strong>Area:</strong> {selectedBioregion.properties.area_km2.toLocaleString()} km²</div>
                    <div><strong>Countries:</strong> {selectedBioregion.properties.countries.join(', ')}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Climate</h4>
                  <p className="text-sm text-gray-600">{selectedBioregion.properties.climate}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    One Earth Navigator
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Native Species Guide
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Conservation Status
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : selectedLocation ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Location Found: {selectedLocation.name}
              </h3>
              <p className="text-gray-600">
                {isLoading ? 'Analyzing bioregion...' : 'No bioregion data available for this location.'}
              </p>
              {!isLoading && (
                <p className="text-sm text-gray-500 mt-2">
                  Try a different location or check back later for expanded coverage.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Sample Data Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5" />
            Implementation Guide
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Current Status</h4>
              <p className="text-xs text-yellow-700">
                This is a demonstration using sample bioregion data. For full functionality, you'll need:
              </p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                <li>Complete bioregions.geojson file in data/ directory</li>
                <li>React-Leaflet integration for interactive mapping</li>
                <li>Turf.js for precise point-in-polygon analysis</li>
                <li>Additional dependencies in package.json</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Required Files</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>📁 data/bioregions.geojson</li>
                  <li>🗂️ src/utils/geocode.js ✓</li>
                  <li>🧩 BioregionExplorer.tsx ✓</li>
                  <li>🗺️ MapView component (needs React-Leaflet)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Dependencies Needed</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>react-leaflet (mapping)</li>
                  <li>@turf/turf (geospatial analysis)</li>
                  <li>whatwg-fetch (polyfill)</li>
                  <li>leaflet (base mapping library) ✓</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BioregionExplorer;