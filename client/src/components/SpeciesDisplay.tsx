import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Camera, MapPin, Activity, AlertCircle } from 'lucide-react';

interface Species {
  id: number;
  name: string;
  common_name?: string;
  group: string;
  observation_count: number;
  photo?: string;
}

interface SpeciesResponse {
  success: boolean;
  bioregion_id: string;
  species_count: number;
  species: Species[];
  note?: string;
  error?: string;
}

export default function SpeciesDisplay() {
  const [bioregionId, setBioregionId] = useState('california_central_valley');
  const [bbox, setBbox] = useState('-122.5,36.0,-119.0,38.5'); // Example: Central Valley CA
  const [enabled, setEnabled] = useState(false);

  // Query for species data
  const { data, isLoading, error, refetch } = useQuery<SpeciesResponse>({
    queryKey: ['/api/bioregion/:id/species', bioregionId, bbox],
    queryFn: async () => {
      const params = new URLSearchParams({ bbox });
      const response = await fetch(`/api/bioregion/${bioregionId}/species?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    },
    enabled: enabled && !!bioregionId && !!bbox,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false
  });

  // Query for API usage stats
  const { data: usageData } = useQuery({
    queryKey: ['/api/inaturalist/usage'],
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: false
  });

  const handleTest = () => {
    setEnabled(true);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* API Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            iNaturalist Species Data Test
          </CardTitle>
          <CardDescription>
            Test the conservative iNaturalist API integration with 30-day caching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Bioregion ID</label>
              <Input
                value={bioregionId}
                onChange={(e) => setBioregionId(e.target.value)}
                placeholder="e.g., california_central_valley"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Bounding Box (SW lng,lat, NE lng,lat)</label>
              <Input
                value={bbox}
                onChange={(e) => setBbox(e.target.value)}
                placeholder="e.g., -122.5,36.0,-119.0,38.5"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleTest} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Test API
            </Button>
            
            {usageData?.success && (
              <Badge variant={usageData.usage.requests_this_session > 40 ? "destructive" : "secondary"}>
                Requests: {usageData.usage.requests_this_session}/50
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Usage Stats */}
      {usageData?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Usage Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Session Requests</div>
                <div className="text-gray-600">{usageData.usage.requests_this_session}/50</div>
              </div>
              <div>
                <div className="font-medium">Cached Bioregions</div>
                <div className="text-gray-600">{usageData.usage.cached_bioregions}</div>
              </div>
              <div>
                <div className="font-medium">Status</div>
                <Badge variant={usageData.status === 'normal' ? 'secondary' : 'destructive'}>
                  {usageData.status}
                </Badge>
              </div>
              <div>
                <div className="font-medium">Cache Duration</div>
                <div className="text-gray-600">30 days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <div>
                <div className="font-medium">API Error</div>
                <div className="text-sm">{error.message}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Species in {data.bioregion_id}</span>
              <Badge variant="secondary">{data.species_count} species</Badge>
            </CardTitle>
            {data.note && (
              <CardDescription className="text-amber-600">
                ⚠️ {data.note}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {data.species.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No species data available</p>
                <p className="text-sm">Try a different bounding box or check API limits</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.species.map((species) => (
                  <div key={species.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {species.photo && (
                      <img 
                        src={species.photo} 
                        alt={species.common_name || species.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <div className="space-y-2">
                      <div>
                        {species.common_name && (
                          <h4 className="font-medium">{species.common_name}</h4>
                        )}
                        <p className="text-sm text-gray-600 italic">{species.name}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{species.group}</Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Activity className="w-3 h-3" />
                          {species.observation_count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">Conservative Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <ul className="space-y-1">
            <li>• Maximum 50 requests per hour</li>
            <li>• 2-second delay between requests</li>
            <li>• Species data cached for 30 days</li>
            <li>• Exponential backoff on errors</li>
            <li>• Geographic bounds required to limit data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}