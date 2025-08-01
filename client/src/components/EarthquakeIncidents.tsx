import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Activity, MapPin, Calendar, ExternalLink, Loader2, Map, List } from 'lucide-react';

interface EarthquakeIncident {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  state: string;
  location: string;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  severity: string;
  alertLevel: string;
  tsunami: number;
  source: string;
  type: string;
}

interface EarthquakeIncidentsProps {
  stateFilter?: string;
  onStateFilterChange?: (stateCode: string) => void;
}

export function EarthquakeIncidents({ stateFilter, onStateFilterChange }: EarthquakeIncidentsProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedState, setSelectedState] = useState<string>(stateFilter || 'all');

  // Function to handle state selection and notify parent
  const handleStateClick = (stateCode: string) => {
    setSelectedState(stateCode);
    if (onStateFilterChange) {
      onStateFilterChange(stateCode);
    }
  };
  
  const { data: incidentsData, isLoading, error } = useQuery({
    queryKey: ['/api/earthquake-incidents'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  // State names mapping including Canadian provinces
  const stateNames: Record<string, string> = {
    // US States
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    // US Territories
    'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam', 'AS': 'American Samoa', 'MP': 'Northern Mariana Islands',
    // Canadian Provinces
    'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick', 'NL': 'Newfoundland and Labrador',
    'NS': 'Nova Scotia', 'NT': 'Northwest Territories', 'NU': 'Nunavut', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
    'QC': 'Quebec', 'SK': 'Saskatchewan', 'YT': 'Yukon'
  };

  const incidents = (incidentsData as any)?.incidents || [];

  // Valid state codes to filter out invalid data
  const validStates = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'PR', 'VI', 'GU', 'AS', 'MP', // US Territories
    'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT' // Canada
  ]);

  // Filter incidents by state if specified
  const filteredIncidents = stateFilter && stateFilter !== 'all' 
    ? incidents.filter((incident: EarthquakeIncident) => {
        const titleLower = incident.title.toLowerCase();
        const locationLower = incident.location.toLowerCase();
        const stateLower = incident.state?.toLowerCase() || '';
        const filterLower = stateFilter.toLowerCase();
        
        // Check if state matches directly
        if (stateLower === filterLower) return true;
        
        // Check if state name is in title or location
        const fullStateName = stateNames[stateFilter.toUpperCase()]?.toLowerCase();
        if (fullStateName && (titleLower.includes(fullStateName) || locationLower.includes(fullStateName))) {
          return true;
        }
        
        // Check if state abbreviation is in title or location
        if (titleLower.includes(filterLower) || locationLower.includes(filterLower)) {
          return true;
        }
        
        return false;
      })
    : incidents;

  // Group incidents by state for summary stats - only include valid states
  const incidentsByState = filteredIncidents.reduce((acc: Record<string, EarthquakeIncident[]>, incident: EarthquakeIncident) => {
    let state = incident.state;
    
    // Skip if no state or invalid state code
    if (!state || !validStates.has(state)) {
      return acc;
    }
    
    if (!acc[state]) acc[state] = [];
    acc[state].push(incident);
    return acc;
  }, {});

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'bg-red-600 text-white';
      case 'moderate': return 'bg-orange-600 text-white';
      case 'minor': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getAlertColor = (alertLevel: string) => {
    switch (alertLevel.toLowerCase()) {
      case 'red': return 'bg-red-600 text-white';
      case 'orange': return 'bg-orange-600 text-white';
      case 'yellow': return 'bg-yellow-600 text-white';
      case 'green': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Loading Earthquake Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Fetching latest earthquake data from USGS...</span>
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
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Earthquake Data Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to load earthquake data from USGS GeoJSON feed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Recent Earthquake Activity
          {stateFilter && stateFilter !== 'all' && (
            <Badge variant="outline" className="bg-blue-50">
              {stateNames[stateFilter.toUpperCase()] || stateFilter}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {filteredIncidents.length} earthquake{filteredIncidents.length !== 1 ? 's' : ''} 
          {stateFilter && stateFilter !== 'all' 
            ? ` in ${stateNames[stateFilter.toUpperCase()] || stateFilter}` 
            : ' nationwide'
          } from USGS
          {stateFilter && stateFilter !== 'all' && (
            <span className="text-blue-600 ml-2 text-xs">
              • Filtered by weather alert selection
            </span>
          )}
        </p>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            Map View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List View
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'map' ? (
          <div className="space-y-6">
            {/* Interactive Map Representation */}
            <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4 text-center">
                US & Canada Earthquake Activity Map
                {selectedState !== 'all' && (
                  <span className="block text-sm font-normal text-gray-600 mt-1">
                    Filtered for: {stateNames[selectedState as keyof typeof stateNames] || selectedState}
                  </span>
                )}
              </h3>
              
              {Object.keys(incidentsByState).length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {selectedState === 'all' 
                      ? 'No significant earthquake activity' 
                      : `No recent earthquakes in ${stateNames[selectedState as keyof typeof stateNames] || selectedState}`
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedState === 'all' 
                      ? 'All clear across monitored regions' 
                      : 'This region currently has no recent significant earthquakes'
                    }
                  </p>
                  {selectedState !== 'all' && (
                    <button 
                      onClick={() => handleStateClick('all')}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View all regions
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(incidentsByState)
                      .filter(([stateCode]) => selectedState === 'all' || stateCode === selectedState)
                      .map(([stateCode, stateIncidents]) => {
                      const state = stateNames[stateCode as keyof typeof stateNames];
                      const maxMagnitude = (stateIncidents as EarthquakeIncident[]).reduce((max: number, incident: EarthquakeIncident) => {
                        return Math.max(max, incident.magnitude || 0);
                      }, 0);

                      const getMagnitudeColor = (magnitude: number) => {
                        if (magnitude >= 7.0) return 'bg-red-600 text-white border-red-700';
                        if (magnitude >= 5.0) return 'bg-orange-600 text-white border-orange-700';
                        if (magnitude >= 3.0) return 'bg-yellow-500 text-black border-yellow-600';
                        return 'bg-green-500 text-white border-green-600';
                      };

                      return (
                        <div
                          key={stateCode}
                          className={`p-3 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${
                            selectedState === stateCode 
                              ? 'ring-4 ring-blue-500 shadow-lg scale-105' 
                              : ''
                          } ${getMagnitudeColor(maxMagnitude)}`}
                          onClick={() => {
                            const newState = selectedState === stateCode ? 'all' : stateCode;
                            handleStateClick(newState);
                          }}
                        >
                          <div className="text-center">
                            <div className="font-bold text-lg">{stateCode}</div>
                            <div className="text-xs opacity-90">{state || stateCode}</div>
                            <div className="text-xs font-semibold mt-1">
                              {(stateIncidents as EarthquakeIncident[]).length} earthquake{(stateIncidents as EarthquakeIncident[]).length !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs mt-1">
                              Max: M{maxMagnitude.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedState !== 'all' && (
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => handleStateClick('all')}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        View all regions
                      </button>
                    </div>
                  )}
                </>
              )}
              
              {/* Show earthquakes for selected state */}
              {selectedState !== 'all' && incidentsByState[selectedState] && (
                <div className="mt-6 bg-white rounded-lg border p-4">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">
                    Recent Earthquakes in {stateNames[selectedState as keyof typeof stateNames] || selectedState}
                  </h4>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {(incidentsByState[selectedState] as EarthquakeIncident[]).map((incident: EarthquakeIncident) => (
                      <div key={incident.id} className="p-3 bg-gray-50 rounded border-l-4 border-l-blue-500">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-semibold text-gray-900 text-sm">{incident.title}</h5>
                              <Badge className={getSeverityColor(incident.severity)}>
                                M{incident.magnitude.toFixed(1)}
                              </Badge>
                              {incident.alertLevel && incident.alertLevel !== 'green' && (
                                <Badge className={getAlertColor(incident.alertLevel)}>
                                  {incident.alertLevel.toUpperCase()}
                                </Badge>
                              )}
                              {incident.tsunami > 0 && (
                                <Badge className="bg-blue-600 text-white">
                                  TSUNAMI
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                              {incident.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {incident.depth}km deep
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(incident.pubDate).toLocaleDateString()}
                              </span>
                              <span className="text-blue-600">
                                {incident.location}
                              </span>
                            </div>
                          </div>
                          <a 
                            href={incident.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Details
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Color Legend */}
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">Magnitude Colors</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded border"></div>
                    <span>Major (7.0+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-600 rounded border"></div>
                    <span>Strong (5.0-6.9)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded border"></div>
                    <span>Moderate (3.0-4.9)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded border"></div>
                    <span>Light (&lt;3.0)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredIncidents.filter((i: EarthquakeIncident) => i.magnitude >= 7.0).length}
                  </div>
                  <div className="text-sm text-gray-600">Major (7.0+)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredIncidents.filter((i: EarthquakeIncident) => i.magnitude >= 5.0 && i.magnitude < 7.0).length}
                  </div>
                  <div className="text-sm text-gray-600">Strong (5.0-6.9)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredIncidents.filter((i: EarthquakeIncident) => i.magnitude >= 3.0 && i.magnitude < 5.0).length}
                  </div>
                  <div className="text-sm text-gray-600">Moderate (3.0-4.9)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(incidentsByState).length}
                  </div>
                  <div className="text-sm text-gray-600">Regions Affected</div>
                </CardContent>
              </Card>
            </div>

            {/* Earthquakes List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {stateFilter && stateFilter !== 'all' 
                      ? `No earthquakes in ${stateFilter}` 
                      : 'No earthquakes reported'
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Current data from USGS</p>
                </div>
              ) : (
                filteredIncidents.map((incident: EarthquakeIncident) => (
                  <Card key={incident.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                            <Badge className={getSeverityColor(incident.severity)}>
                              M{incident.magnitude.toFixed(1)}
                            </Badge>
                            {incident.alertLevel && incident.alertLevel !== 'green' && (
                              <Badge className={getAlertColor(incident.alertLevel)}>
                                {incident.alertLevel.toUpperCase()}
                              </Badge>
                            )}
                            {incident.tsunami > 0 && (
                              <Badge className="bg-blue-600 text-white">
                                TSUNAMI
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {incident.location}
                            </span>
                            <span>Depth: {incident.depth}km</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(incident.pubDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <a 
                          href={incident.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Details
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}