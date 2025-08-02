import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Database, Leaf, Cloud, Bird, Fish, Bug, TreePine } from 'lucide-react';

const DatasetRecommendations: React.FC = () => {
  const governmentDatasets = [
    {
      name: "NOAA Climate Data Online API",
      url: "https://www.ncdc.noaa.gov/cdo-web/webservices/v2",
      description: "Historical climate, weather, and environmental monitoring data",
      icon: <Cloud className="w-4 h-4" />,
      integration: "Climate overlays, temperature/precipitation trends for each bioregion",
      status: "Free API with token",
      rateLimit: "5 req/sec, 10k/day"
    },
    {
      name: "USGS Biodiversity Information (GBIF US)",
      url: "https://www.gbif.us",
      description: "Species occurrence records for US, territories, and Canada",
      icon: <Bug className="w-4 h-4" />,
      integration: "Real-time species sightings overlaid on bioregion maps",
      status: "Free, no auth required",
      rateLimit: "Rate limited for frequent queries"
    },
    {
      name: "EPA EnviroAtlas",
      url: "https://www.epa.gov/enviroatlas/data-download",
      description: "Environmental and ecosystem service data at multiple scales",
      icon: <Leaf className="w-4 h-4" />,
      integration: "Ecosystem health indicators, pollution data, land use patterns",
      status: "Free download",
      rateLimit: "Bulk download available"
    }
  ];

  const citizenScienceDatasets = [
    {
      name: "GBIF Global Biodiversity API",
      url: "https://api.gbif.org/v1/",
      description: "1.9+ billion species occurrence records worldwide",
      icon: <Database className="w-4 h-4" />,
      integration: "Global species distribution maps, endemic species highlighting",
      status: "Free API",
      rateLimit: "Stable API, bulk downloads available",
      code: `# Get species occurrences
response = requests.get(
  'https://api.gbif.org/v1/occurrence/search',
  params={'taxonKey': species_key, 'limit': 100}
)`
    },
    {
      name: "iNaturalist API",
      url: "https://api.inaturalist.org/v1/",
      description: "130+ million citizen science observations with photos",
      icon: <Bug className="w-4 h-4" />,
      integration: "Recent wildlife sightings with photos, community identification",
      status: "Free API with OAuth",
      rateLimit: "Rate limited above 100 pages",
      code: `# Using pyinaturalist
from pyinaturalist import get_observations
obs = get_observations(
  place_id=bioregion_id,
  quality_grade='research'
)`
    },
    {
      name: "eBird API 2.0",
      url: "https://api.ebird.org/v2/",
      description: "Real-time bird sighting data from global network",
      icon: <Bird className="w-4 h-4" />,
      integration: "Live bird migration patterns, seasonal abundance charts",
      status: "Free API key required",
      rateLimit: "Reasonable limits",
      code: `# Recent bird observations
observations = get_observations(
  region_code=bioregion_code,
  days_back=30,
  api_key=api_key
)`
    }
  ];

  const specializedDatasets = [
    {
      name: "NOAA Fisheries Ecosystem Data",
      url: "https://www.fisheries.noaa.gov/topic/ecosystems",
      description: "Marine ecosystem health, phytoplankton, productivity metrics",
      icon: <Fish className="w-4 h-4" />,
      integration: "Coastal bioregion marine data, ocean health indicators",
      status: "2024 Ocean Ecosystem Indicators available"
    },
    {
      name: "NASA EARTHDATA",
      url: "https://earthdata.nasa.gov/",
      description: "Satellite imagery, vegetation indices, land cover changes",
      icon: <TreePine className="w-4 h-4" />,
      integration: "Real-time satellite views, vegetation health monitoring",
      status: "Free registration required"
    },
    {
      name: "Infomap Bioregions",
      url: "https://www.mapequation.org/bioregions/",
      description: "Network-theory based bioregion delineation from species data",
      icon: <Database className="w-4 h-4" />,
      integration: "Advanced bioregion boundary refinement using species networks",
      status: "Research tool with API"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            Recommended Dataset Integrations
          </h3>
          <p className="text-gray-600">
            Authoritative data sources to enrich the bioregion platform with real-time ecological information
          </p>
        </CardHeader>
        <CardContent>
          {/* Government Sources */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-blue-800">🏛️ Government Data Sources</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {governmentDatasets.map((dataset, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-2">
                    {dataset.icon}
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm">{dataset.name}</h5>
                      <p className="text-xs text-gray-600">{dataset.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div><strong>Integration:</strong> {dataset.integration}</div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{dataset.status}</Badge>
                      <Badge variant="secondary" className="text-xs">{dataset.rateLimit}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Science */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-green-800">🔬 Citizen Science & Biodiversity APIs</h4>
            <div className="space-y-4">
              {citizenScienceDatasets.map((dataset, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {dataset.icon}
                    <div className="flex-1">
                      <h5 className="font-semibold">{dataset.name}</h5>
                      <p className="text-sm text-gray-600">{dataset.description}</p>
                      <p className="text-sm mt-1"><strong>Use Case:</strong> {dataset.integration}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{dataset.status}</Badge>
                      <Badge variant="secondary" className="text-xs">{dataset.rateLimit}</Badge>
                    </div>
                  </div>
                  {dataset.code && (
                    <div className="bg-gray-50 rounded p-3 mt-3">
                      <code className="text-xs text-gray-800">{dataset.code}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Sources */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-purple-800">🛰️ Specialized Ecological Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specializedDatasets.map((dataset, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-2">
                    {dataset.icon}
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm">{dataset.name}</h5>
                      <p className="text-xs text-gray-600 mb-2">{dataset.description}</p>
                      <p className="text-xs"><strong>Integration:</strong> {dataset.integration}</p>
                      <Badge variant="outline" className="text-xs mt-2">{dataset.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation Priority */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-3">🎯 Recommended Implementation Priority</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-yellow-700 mb-2">Phase 1 (High Impact)</div>
                <div className="space-y-1 text-xs">
                  <div>• GBIF species occurrence overlay</div>
                  <div>• iNaturalist recent sightings</div>
                  <div>• NOAA climate data integration</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-yellow-700 mb-2">Phase 2 (Enhanced Features)</div>
                <div className="space-y-1 text-xs">
                  <div>• eBird real-time bird data</div>
                  <div>• EPA ecosystem health metrics</div>
                  <div>• NASA satellite imagery</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-yellow-700 mb-2">Phase 3 (Advanced)</div>
                <div className="space-y-1 text-xs">
                  <div>• Marine ecosystem indicators</div>
                  <div>• Species network analysis</div>
                  <div>• Predictive modeling</div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">⚙️ Technical Implementation Notes</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• All APIs support JSON responses and can be integrated with existing React components</div>
              <div>• GBIF and iNaturalist provide bulk download options for offline analysis</div>
              <div>• Rate limiting requires intelligent caching and request batching</div>
              <div>• Most services offer both real-time and historical data access</div>
              <div>• Authentication ranges from no-auth (Weather.gov) to OAuth2 (iNaturalist)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetRecommendations;