import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, MapPin, Clock, ExternalLink, RefreshCw, Zap, Info as InfoIcon } from 'lucide-react';
import { RealtimeApiDebugger } from './RealtimeApiDebugger';
import { getWeatherAlertIcon } from '@/utils/disasterIcons';

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
  'FL': { name: 'Florida', coords: [27.7663, -81.6868] },
  'GA': { name: 'Georgia', coords: [32.1656, -82.9001] },
  'HI': { name: 'Hawaii', coords: [19.8968, -155.5828] },
  'ID': { name: 'Idaho', coords: [44.0682, -114.7420] },
  'IL': { name: 'Illinois', coords: [40.0495, -89.4001] },
  'IN': { name: 'Indiana', coords: [40.2732, -86.1349] },
  'IA': { name: 'Iowa', coords: [41.8780, -93.0977] },
  'KS': { name: 'Kansas', coords: [38.5111, -96.8005] },
  'KY': { name: 'Kentucky', coords: [37.8393, -84.2700] },
  'LA': { name: 'Louisiana', coords: [31.1801, -91.8749] },
  'ME': { name: 'Maine', coords: [45.3695, -69.2187] },
  'MD': { name: 'Maryland', coords: [39.0458, -76.6413] },
  'MA': { name: 'Massachusetts', coords: [42.4072, -71.3824] },
  'MI': { name: 'Michigan', coords: [44.3467, -85.4102] },
  'MN': { name: 'Minnesota', coords: [46.7296, -94.6859] },
  'MS': { name: 'Mississippi', coords: [32.3547, -89.3985] },
  'MO': { name: 'Missouri', coords: [37.9643, -91.8318] },
  'MT': { name: 'Montana', coords: [47.0527, -110.2148] },
  'NE': { name: 'Nebraska', coords: [41.4925, -99.9018] },
  'NV': { name: 'Nevada', coords: [38.8026, -116.4194] },
  'NH': { name: 'New Hampshire', coords: [43.1939, -71.5724] },
  'NJ': { name: 'New Jersey', coords: [40.0583, -74.4057] },
  'NM': { name: 'New Mexico', coords: [34.8405, -106.2485] },
  'NY': { name: 'New York', coords: [42.1657, -74.9481] },
  'NC': { name: 'North Carolina', coords: [35.6301, -79.8064] },
  'ND': { name: 'North Dakota', coords: [47.5515, -101.0020] },
  'OH': { name: 'Ohio', coords: [40.3888, -82.7649] },
  'OK': { name: 'Oklahoma', coords: [35.0078, -97.0929] },
  'OR': { name: 'Oregon', coords: [44.9319, -119.5681] },
  'PA': { name: 'Pennsylvania', coords: [40.9699, -77.7278] },
  'RI': { name: 'Rhode Island', coords: [41.6772, -71.5101] },
  'SC': { name: 'South Carolina', coords: [33.8191, -80.9066] },
  'SD': { name: 'South Dakota', coords: [44.2853, -99.4632] },
  'TN': { name: 'Tennessee', coords: [35.7449, -86.7489] },
  'TX': { name: 'Texas', coords: [31.9686, -99.9018] },
  'UT': { name: 'Utah', coords: [39.3210, -111.0937] },
  'VT': { name: 'Vermont', coords: [44.0582, -72.5806] },
  'VA': { name: 'Virginia', coords: [37.7693, -78.2057] },
  'WA': { name: 'Washington', coords: [47.3917, -121.5708] },
  'WV': { name: 'West Virginia', coords: [38.4680, -80.9696] },
  'WI': { name: 'Wisconsin', coords: [44.2619, -89.6165] },
  'WY': { name: 'Wyoming', coords: [42.7475, -107.2085] },
  'DC': { name: 'District of Columbia', coords: [38.8974, -77.0365] },
  'PR': { name: 'Puerto Rico', coords: [18.2208, -66.5901] },
  'VI': { name: 'U.S. Virgin Islands', coords: [18.0001, -64.8199] },
  'GU': { name: 'Guam', coords: [13.4443, 144.7937] },
  'AS': { name: 'American Samoa', coords: [-14.2710, -170.1322] },
  'MP': { name: 'Northern Mariana Islands', coords: [17.3308, 145.3846] }
};

// Helper function to determine severity color styling
const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'extreme':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'severe':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'minor':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface InteractiveWeatherMapProps {
  stateFilter?: string;
  onStateFilterChange?: (state: string) => void;
}

export function InteractiveWeatherMap({ stateFilter, onStateFilterChange }: InteractiveWeatherMapProps) {
  const [selectedState, setSelectedState] = useState<string>(stateFilter || 'all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Function to handle state selection and notify parent
  const handleStateClick = (stateCode: string) => {
    setSelectedState(stateCode);
    if (onStateFilterChange) {
      onStateFilterChange(stateCode);
    }
  };

  // Update local state when prop changes
  useEffect(() => {
    if (stateFilter !== undefined) {
      setSelectedState(stateFilter);
    }
  }, [stateFilter]);

  const { data: response, refetch, isLoading, error } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 300000, // 5 minutes
  });

  const alerts = (response as any)?.alerts || [];

  // Group alerts by state
  const statesWithAlerts = alerts.reduce((acc: Record<string, WeatherAlert[]>, alert: WeatherAlert) => {
    // Extract state from location
    const stateMatch = alert.location?.match(/\b([A-Z]{2})\b/);
    const state = stateMatch ? stateMatch[1] : null;
    
    if (state && US_STATES[state as keyof typeof US_STATES]) {
      if (!acc[state]) acc[state] = [];
      acc[state].push(alert);
    }
    return acc;
  }, {});

  // Filter alerts based on selected state and severity
  const filteredAlerts = alerts.filter((alert: WeatherAlert) => {
    // State filter
    if (selectedState !== 'all') {
      const stateMatch = alert.location?.match(/\b([A-Z]{2})\b/);
      const alertState = stateMatch ? stateMatch[1] : null;
      if (alertState !== selectedState) return false;
    }

    // Severity filter
    if (severityFilter !== 'all') {
      if (alert.severity?.toLowerCase() !== severityFilter.toLowerCase()) return false;
    }

    return true;
  });

  const activeAlerts = filteredAlerts;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Weather Alerts Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading weather alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Weather Alerts Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">Unable to load weather alerts</p>
            <p className="text-sm text-gray-500 mt-1">Please check your internet connection and try again</p>
            <Button onClick={() => refetch()} className="mt-4" variant="outline">
              Try Again
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
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Interactive Weather Alerts Map
              </CardTitle>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Real-time monitoring of weather warnings and watches across the United States
                  {(selectedState !== 'all' || severityFilter !== 'all') && (
                    <button 
                      onClick={() => {
                        setSelectedState('all');
                        setSeverityFilter('all');
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      (Clear Filters)
                    </button>
                  )}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                    <InfoIcon className="w-4 h-4" />
                    About Weather Alert Data
                  </h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    This data comes from three official sources: <strong>National Weather Service (NWS)</strong> provides detailed local warnings and watches, 
                    <strong> National Hurricane Center</strong> issues tropical storm alerts, and <strong>Storm Prediction Center</strong> handles severe weather forecasts. 
                    Only active warnings and watches are shown - advisories are filtered out. Alerts are updated every few minutes and include severity levels from Minor to Extreme.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Select value={selectedState} onValueChange={(value) => {
              console.log('State filter changed to:', value);
              setSelectedState(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States ({Object.keys(statesWithAlerts).length} active)</SelectItem>
                {Object.entries(US_STATES).map(([code, state]) => {
                  const alertCount = statesWithAlerts[code]?.length || 0;
                  return (
                    <SelectItem key={code} value={code} disabled={alertCount === 0}>
                      {state.name} ({code}) {alertCount > 0 ? `- ${alertCount} alerts` : '- no alerts'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={(value) => {
              console.log('Severity filter changed to:', value);
              setSeverityFilter(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities ({alerts.length})</SelectItem>
                <SelectItem value="extreme">Extreme ({alerts.filter((a: WeatherAlert) => a.severity.toLowerCase() === 'extreme').length})</SelectItem>
                <SelectItem value="severe">Severe ({alerts.filter((a: WeatherAlert) => a.severity.toLowerCase() === 'severe').length})</SelectItem>
                <SelectItem value="moderate">Moderate ({alerts.filter((a: WeatherAlert) => a.severity.toLowerCase() === 'moderate').length})</SelectItem>
                <SelectItem value="minor">Minor ({alerts.filter((a: WeatherAlert) => a.severity.toLowerCase() === 'minor').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                      onClick={() => handleStateClick('all')}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View all states
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(statesWithAlerts)
                      .filter(([stateCode]) => selectedState === 'all' || stateCode === selectedState)
                      .map(([stateCode, stateAlerts]) => {
                      const state = US_STATES[stateCode as keyof typeof US_STATES];
                      const maxSeverity = (stateAlerts as WeatherAlert[]).reduce((max: string, alert: WeatherAlert) => {
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
                            const newState = selectedState === stateCode ? 'all' : stateCode;
                            handleStateClick(newState);
                          }}
                        >
                          <div className="text-center">
                            <div className="font-bold text-lg">{stateCode}</div>
                            <div className="text-xs opacity-90">{state?.name}</div>
                            <div className="text-xs font-semibold mt-1">
                              {(stateAlerts as WeatherAlert[]).length} alert{(stateAlerts as WeatherAlert[]).length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show detailed alerts when a specific state is selected */}
                  {selectedState !== 'all' && activeAlerts.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Active Alerts in {US_STATES[selectedState as keyof typeof US_STATES]?.name || selectedState}
                      </h4>
                      <div className="grid gap-4 max-h-96 overflow-y-auto">
                        {activeAlerts.map((alert: WeatherAlert) => (
                          <Card key={alert.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/30">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-start gap-4 mb-3">
                                    <div className="flex-shrink-0 p-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-md">
                                      {getWeatherAlertIcon(alert.event || alert.title) ? (
                                        <img 
                                          src={getWeatherAlertIcon(alert.event || alert.title)!} 
                                          alt={alert.event || 'Weather Alert'} 
                                          className="w-10 h-10 object-contain" 
                                        />
                                      ) : (
                                        <AlertTriangle className="w-10 h-10 text-yellow-500" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-bold text-gray-900 text-base">{alert.title}</h5>
                                        <Badge className={`${getSeverityColor(alert.severity)} font-semibold px-3 py-1`}>
                                          {alert.severity.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <div className="text-sm font-medium text-gray-700 mb-1">
                                        {alert.event}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>{alert.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{alert.sent ? new Date(alert.sent).toLocaleString() : 'Current Alert'}</span>
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
                                        className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                      >
                                        View Full Alert <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Summary Statistics with Custom Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {activeAlerts.filter((a: WeatherAlert) => a.severity.toLowerCase() === 'extreme').length}
                    </div>
                    <div className="text-sm text-gray-600">Extreme</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {activeAlerts.filter((a: WeatherAlert) => a.severity.toLowerCase() === 'severe').length}
                    </div>
                    <div className="text-sm text-gray-600">Severe</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {activeAlerts.filter((a: WeatherAlert) => a.severity.toLowerCase() === 'moderate').length}
                    </div>
                    <div className="text-sm text-gray-600">Moderate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <InfoIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {activeAlerts.filter((a: WeatherAlert) => a.severity.toLowerCase() === 'minor').length}
                    </div>
                    <div className="text-sm text-gray-600">Minor</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Real-time API Debugger */}
      <RealtimeApiDebugger />
    </div>
  );
}

export default InteractiveWeatherMap;