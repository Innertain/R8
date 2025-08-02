import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Database, Globe, Leaf } from 'lucide-react';

const DataSourcesOverview: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5" />
          Enhanced Bioregion Dataset
        </h3>
        <p className="text-sm text-gray-600">
          Comprehensive ecoregion coverage including Hawaii, Alaska, Caribbean, and diverse biome types
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Dataset Overview */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-3">📊 Current Dataset Coverage</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-2">
                <div className="font-semibold text-green-700">🏝️ Hawaiian Ecoregions</div>
                <div>• Hawaiian Tropical Dry Forests</div>
                <div>• Hawaiian Tropical Rainforests</div>
                <div>• Endemic species and conservation data</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-green-700">❄️ Arctic & Subarctic</div>
                <div>• Alaska Boreal Interior</div>
                <div>• Alaskan Arctic Tundra</div>
                <div>• Central Canadian Shield Forests</div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-green-700">🌴 Tropical & Caribbean</div>
                <div>• Puerto Rico Moist Forests</div>
                <div>• Tropical dry and moist broadleaf forests</div>
                <div>• Endemic Caribbean species</div>
              </div>
            </div>
          </div>

          {/* Biome Diversity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">🌍 Biome Types Represented</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Tropical & Subtropical Forests</span>
                  <span className="text-green-600">3 regions</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperate Forests</span>
                  <span className="text-green-600">3 regions</span>
                </div>
                <div className="flex justify-between">
                  <span>Boreal Forest/Taiga</span>
                  <span className="text-green-600">2 regions</span>
                </div>
                <div className="flex justify-between">
                  <span>Grasslands & Savannas</span>
                  <span className="text-green-600">3 regions</span>
                </div>
                <div className="flex justify-between">
                  <span>Deserts & Xeric Shrublands</span>
                  <span className="text-green-600">3 regions</span>
                </div>
                <div className="flex justify-between">
                  <span>Tundra & Montane</span>
                  <span className="text-green-600">2 regions</span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">🗺️ Geographic Coverage</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Continental United States</span>
                  <span className="text-blue-600">10 regions</span>
                </div>
                <div className="flex justify-between">
                  <span>Hawaii</span>
                  <span className="text-blue-600">2 regions</span>
                </div>
                <div className="flex justify-between">
                  <span>Alaska</span>
                  <span className="text-blue-600">2 regions</span>
                </div>
                <div className="flex justify-between">
                  <span>Caribbean (Puerto Rico)</span>
                  <span className="text-blue-600">1 region</span>
                </div>
                <div className="flex justify-between">
                  <span>Canada</span>
                  <span className="text-blue-600">2 regions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Source Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-3">📚 Based on Scientific Classification Systems</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
              <div>
                <div className="font-semibold mb-2">WWF Terrestrial Ecoregions 2017</div>
                <div>• 847 global terrestrial ecoregions</div>
                <div>• 14 major biome classifications</div>
                <div>• Peer-reviewed scientific methodology</div>
                <div>• Updated conservation assessments</div>
              </div>
              <div>
                <div className="font-semibold mb-2">EPA Level III & IV Ecoregions</div>
                <div>• High-resolution US coverage</div>
                <div>• Hawaii-specific regional data</div>
                <div>• Detailed climate and species data</div>
                <div>• 1:250,000 scale accuracy</div>
              </div>
            </div>
          </div>

          {/* Expansion Capabilities */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-3">🚀 Ready for Global Expansion</h4>
            <p className="text-xs text-yellow-700 mb-3">
              The current system can be expanded to include the full WWF dataset with 847+ global ecoregions:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-yellow-700">
              <div>
                <div className="font-semibold">Available Datasets:</div>
                <div>• RESOLVE Ecoregions 2017</div>
                <div>• Nature Conservancy modifications</div>
                <div>• Global 200 priority ecoregions</div>
              </div>
              <div>
                <div className="font-semibold">Additional Coverage:</div>
                <div>• All continents and islands</div>
                <div>• Marine and freshwater ecosystems</div>
                <div>• Arctic and Antarctic regions</div>
              </div>
              <div>
                <div className="font-semibold">Technical Ready:</div>
                <div>• GeoJSON conversion support</div>
                <div>• Scalable polygon rendering</div>
                <div>• Point-in-polygon optimization</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-gray-800 mb-3">External Resources</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                WWF Ecoregions 2017
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                EPA Ecoregion Maps
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                One Earth Navigator
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Global Ecoregion Data
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Leaf className="w-3 h-3 mr-1" />
                Conservation Status
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSourcesOverview;