import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, MapPin, Clock, ExternalLink, RefreshCw, Filter, Zap } from 'lucide-react';

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  urgency: string;
  certainty: string;
  sent: string;
  expires?: string;
  senderName: string;
  web?: string;
  event: string;
  category: string;
  alertType?: string;
}

// US States with coordinates for map positioning
const US_STATES = {
  'AL': { name: 'Alabama', coords: [32.3617, -86.2792] },
  'AK': { name: 'Alaska', coords: [64.0685, -152.2782] },
  'AZ': { name: 'Arizona', coords: [34.2744, -111.2847] },
  'AR': { name: 'Arkansas', coords: [34.8938, -92.4426] },
  'CA': { name: 'California', coords: [36.7014, -119.5107] },
  'CO': { name: 'Colorado', coords: [39.2647, -105.6805] },
  'CT': { name: 'Connecticut', coords: [41.6032, -73.0877] },
  'DE': { name: 'Delaware', coords: [38.9896, -75.5050] },
  'FL': { name: 'Florida', coords: [27.9944, -81.7603] },
  'GA': { name: 'Georgia', coords: [32.3293, -83.1137] },
  'HI': { name: 'Hawaii', coords: [19.8987, -155.6659] },
  'ID': { name: 'Idaho', coords: [44.3509, -114.6130] },
  'IL': { name: 'Illinois', coords: [40.0417, -89.1965] },
  'IN': { name: 'Indiana', coords: [39.7662, -86.4755] },
  'IA': { name: 'Iowa', coords: [42.0046, -93.3917] },
  'KS': { name: 'Kansas', coords: [38.4937, -98.3804] },
  'KY': { name: 'Kentucky', coords: [37.5726, -85.1551] },
  'LA': { name: 'Louisiana', coords: [31.0689, -91.9968] },
  'ME': { name: 'Maine', coords: [45.3695, -68.2721] },
  'MD': { name: 'Maryland', coords: [39.5162, -76.9382] },
  'MA': { name: 'Massachusetts', coords: [42.2596, -71.8083] },
  'MI': { name: 'Michigan', coords: [44.8441, -85.7621] },
  'MN': { name: 'Minnesota', coords: [46.2807, -94.3053] },
  'MS': { name: 'Mississippi', coords: [32.6873, -89.6010] },
  'MO': { name: 'Missouri', coords: [38.3566, -92.4580] },
  'MT': { name: 'Montana', coords: [47.0527, -109.6333] },
  'NE': { name: 'Nebraska', coords: [41.5378, -99.7951] },
  'NV': { name: 'Nevada', coords: [39.3289, -116.6312] },
  'NH': { name: 'New Hampshire', coords: [43.6805, -71.5811] },
  'NJ': { name: 'New Jersey', coords: [40.1907, -74.7068] },
  'NM': { name: 'New Mexico', coords: [34.4071, -106.1126] },
  'NY': { name: 'New York', coords: [42.9538, -75.5268] },
  'NC': { name: 'North Carolina', coords: [35.5557, -79.3877] },
  'ND': { name: 'North Dakota', coords: [47.4501, -100.4659] },
  'OH': { name: 'Ohio', coords: [40.2862, -82.7937] },
  'OK': { name: 'Oklahoma', coords: [35.5889, -97.4943] },
  'OR': { name: 'Oregon', coords: [44.0581, -120.7044] },
  'PA': { name: 'Pennsylvania', coords: [40.8781, -77.7996] },
  'RI': { name: 'Rhode Island', coords: [41.5801, -71.4774] },
  'SC': { name: 'South Carolina', coords: [33.9169, -80.8964] },
  'SD': { name: 'South Dakota', coords: [44.4443, -100.2263] },
  'TN': { name: 'Tennessee', coords: [35.8580, -86.3505] },
  'TX': { name: 'Texas', coords: [31.8160, -99.5120] },
  'UT': { name: 'Utah', coords: [39.3210, -111.0937] },
  'VT': { name: 'Vermont', coords: [44.5590, -72.5806] },
  'VA': { name: 'Virginia', coords: [37.5215, -78.8537] },
  'WA': { name: 'Washington', coords: [47.3826, -120.4472] },
  'WV': { name: 'West Virginia', coords: [38.6409, -80.6227] },
  'WI': { name: 'Wisconsin', coords: [44.6243, -89.9941] },
  'WY': { name: 'Wyoming', coords: [42.9957, -107.5512] }
};

interface InteractiveWeatherMapProps {
  stateFilter?: string;
}

export function InteractiveWeatherMap({ stateFilter }: InteractiveWeatherMapProps) {
  const [selectedState, setSelectedState] = useState<string>(stateFilter || 'all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const { data: alertsData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const alerts = alertsData?.alerts || [];
  
  // Filter alerts based on selected state and severity
  const activeAlerts = alerts.filter((alert: WeatherAlert) => {
    let matchesState = selectedState === 'all';
    
    if (!matchesState) {
      // Check if the alert location contains the selected state code or name
      const stateName = US_STATES[selectedState as keyof typeof US_STATES]?.name;
      matchesState = alert.location.includes(selectedState) || 
                   (stateName && alert.location.toLowerCase().includes(stateName.toLowerCase()));
    }
    
    const matchesSeverity = severityFilter === 'all' || alert.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesState && matchesSeverity;
  });

  // Extract states with active alerts for the map visualization
  const statesWithAlerts = alerts.reduce((acc: Record<string, WeatherAlert[]>, alert: WeatherAlert) => {
    // Try to extract state abbreviation from location
    const stateMatch = alert.location.match(/\b([A-Z]{2})\b/g);
    if (stateMatch) {
      stateMatch.forEach(state => {
        if (US_STATES[state as keyof typeof US_STATES]) {
          if (!acc[state]) acc[state] = [];
          acc[state].push(alert);
        }
      });
    }
    return acc;
  }, {});

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'bg-red-600 border-red-700 text-white';
      case 'severe': return 'bg-orange-500 border-orange-600 text-white';
      case 'moderate': return 'bg-yellow-400 border-yellow-500 text-black';
      case 'minor': return 'bg-blue-400 border-blue-500 text-white';
      default: return 'bg-gray-400 border-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 animate-pulse" />
            Loading Active Weather Alerts...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !alertsData?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Weather Alerts Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">Unable to load current weather alerts</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Active Weather Warnings & Watches
                {selectedState !== 'all' && (
                  <Badge variant="outline" className="ml-2">
                    {US_STATES[selectedState as keyof typeof US_STATES]?.name || selectedState}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''} 
                {selectedState !== 'all' 
                  ? ` in ${US_STATES[selectedState as keyof typeof US_STATES]?.name || selectedState}` 
                  : ' from NWS Multi-Feed System'
                }
                {selectedState !== 'all' && (
                  <button 
                    onClick={() => setSelectedState('all')}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                  >
                    (View All States)
                  </button>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Map View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Filter className="w-4 h-4 mr-1" />
                List View
              </Button>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {Object.entries(US_STATES).map(([code, state]) => (
                  <SelectItem key={code} value={code}>
                    {state.name} ({code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'map' ? (
            <div className="space-y-6">
              {/* Interactive Map Representation */}
              <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  United States Weather Alert Map
                  {selectedState !== 'all' && (
                    <span className="block text-sm font-normal text-gray-600 mt-1">
                      Filtered for: {US_STATES[selectedState as keyof typeof US_STATES]?.name || selectedState}
                    </span>
                  )}
                </h3>
                
                {Object.keys(statesWithAlerts).length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      {selectedState === 'all' 
                        ? 'No active weather warnings or watches' 
                        : `No active alerts in ${US_STATES[selectedState as keyof typeof US_STATES]?.name || selectedState}`
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedState === 'all' 
                        ? 'All clear across monitored regions' 
                        : 'This state currently has no active weather warnings or watches'
                      }
                    </p>
                    {selectedState !== 'all' && (
                      <button 
                        onClick={() => setSelectedState('all')}
                        className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        View all states
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(statesWithAlerts)
                      .filter(([stateCode]) => selectedState === 'all' || stateCode === selectedState)
                      .map(([stateCode, stateAlerts]) => {
                      const state = US_STATES[stateCode as keyof typeof US_STATES];
                      const maxSeverity = stateAlerts.reduce((max, alert) => {
                        const severityOrder = { 'extreme': 4, 'severe': 3, 'moderate': 2, 'minor': 1 };
                        const alertLevel = severityOrder[alert.severity.toLowerCase() as keyof typeof severityOrder] || 0;
                        const maxLevel = severityOrder[max.toLowerCase() as keyof typeof severityOrder] || 0;
                        return alertLevel > maxLevel ? alert.severity : max;
                      }, 'minor');

                      return (
                        <div
                          key={stateCode}
                          className={`p-3 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${
                            selectedState === stateCode 
                              ? 'ring-4 ring-blue-500 shadow-lg scale-105' 
                              : ''
                          } ${getSeverityColor(maxSeverity)}`}
                          onClick={() => {
                            setSelectedState(selectedState === stateCode ? 'all' : stateCode);
                          }}
                        >
                          <div className="text-center">
                            <div className="font-bold text-lg">{stateCode}</div>
                            <div className="text-xs opacity-90">{state?.name}</div>
                            <div className="text-xs font-semibold mt-1">
                              {stateAlerts.length} alert{stateAlerts.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {activeAlerts.filter(a => a.severity.toLowerCase() === 'extreme').length}
                    </div>
                    <div className="text-sm text-gray-600">Extreme</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {activeAlerts.filter(a => a.severity.toLowerCase() === 'severe').length}
                    </div>
                    <div className="text-sm text-gray-600">Severe</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {activeAlerts.filter(a => a.severity.toLowerCase() === 'moderate').length}
                    </div>
                    <div className="text-sm text-gray-600">Moderate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {activeAlerts.filter(a => a.severity.toLowerCase() === 'minor').length}
                    </div>
                    <div className="text-sm text-gray-600">Minor</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No active alerts matching your filters</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
                </div>
              ) : (
                activeAlerts.map((alert: WeatherAlert) => (
                  <Card key={alert.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{alert.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(alert.sent).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                            {alert.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {alert.senderName} • {alert.event}
                            </span>
                            {alert.web && (
                              <a
                                href={alert.web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                              >
                                View Details <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InteractiveWeatherMap;