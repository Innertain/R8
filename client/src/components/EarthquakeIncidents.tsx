import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Activity, MapPin, Calendar, ExternalLink, Loader2, Map, List, Info as InfoIcon } from 'lucide-react';

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

  // State names mapping including Canadian provinces and countries
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
    'QC': 'Quebec', 'SK': 'Saskatchewan', 'YT': 'Yukon',
    // International Countries
    'RU': 'Russia', 'JP': 'Japan', 'CL': 'Chile', 'PERU': 'Peru', 'IND': 'Indonesia', 'PH': 'Philippines',
    'TR': 'Turkey', 'GR': 'Greece', 'IR': 'Iran', 'MX': 'Mexico', 'GT': 'Guatemala', 'NZ': 'New Zealand',
    'OCEAN': 'Ocean', 'INTL': 'International'
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
    'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT', // Canada
    'RU', 'JP', 'CL', 'PERU', 'IND', 'PH', 'TR', 'GR', 'IR', 'MX', 'GT', 'NZ', 'OCEAN', 'INTL' // International
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

  // Debug logging to help troubleshoot filtering issues
  if (process.env.NODE_ENV === 'development') {
    console.log(`Earthquake debug: Total incidents: ${incidents.length}, Filtered incidents: ${filteredIncidents.length}, State filter: ${stateFilter}`);
    if (stateFilter && stateFilter !== 'all' && filteredIncidents.length === 0 && incidents.length > 0) {
      console.log(`No earthquakes found for filter "${stateFilter}". Available states:`, [...new Set(incidents.map((i: any) => i.state))]);
    }
  }

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
            <Badge variant="outline" className="bg-orange-100 border-orange-300 text-orange-800">
              ⚠️ Filtered: {stateNames[stateFilter.toUpperCase()] || stateFilter}
            </Badge>
          )}
        </CardTitle>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {filteredIncidents.length} earthquake{filteredIncidents.length !== 1 ? 's' : ''} 
            {stateFilter && stateFilter !== 'all' 
              ? ` in ${stateNames[stateFilter.toUpperCase()] || stateFilter}` 
              : ' worldwide'
            } from USGS
            {stateFilter && stateFilter !== 'all' && (
              <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1 mt-2">
                <span className="text-orange-700 text-xs font-medium">
                  ⚠️ Filtered by {stateNames[stateFilter.toUpperCase()] || stateFilter} selection from another section
                </span>
                <button 
                  onClick={() => window.location.reload()}
                  className="ml-2 text-orange-600 hover:text-orange-800 text-xs underline"
                >
                  Clear filter & show all earthquakes
                </button>
              </div>
            )}
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2 mb-2">
              <InfoIcon className="w-4 h-4" />
              About Earthquake Data
            </h4>
            <p className="text-xs text-purple-700 leading-relaxed">
              This data comes from the <strong>U.S. Geological Survey (USGS)</strong> real-time earthquake feed. 
              Earthquakes are measured on the <strong>Richter scale</strong> (magnitude 1-10+), with alerts based on impact and population exposure. 
              <strong>Alert levels</strong> include Green (minimal impact), Yellow (local damage possible), Orange (regional impact), and Red (widespread damage expected). 
              Data updates within minutes of seismic detection.
            </p>
          </div>
        </div>
        
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
                Global Earthquake Activity Map
                {selectedState !== 'all' && (
                  <span className="block text-sm font-normal text-gray-600 mt-1">
                    Filtered for: {stateNames[selectedState as keyof typeof stateNames] || selectedState}
                  </span>
                )}
              </h3>
              
              {/* Cross-Component Filter Warning */}
              {stateFilter && stateFilter !== 'all' && stateFilter !== selectedState && (
                <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-700 font-medium text-sm">
                        ⚠️ Currently filtered by {stateNames[stateFilter.toUpperCase()] || stateFilter} from another section
                      </span>
                    </div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
                    >
                      Clear Filter
                    </button>
                  </div>
                  <p className="text-orange-600 text-xs mt-1">
                    This is hiding {incidents.length - filteredIncidents.length} earthquakes from other regions
                  </p>
                </div>
              )}
              
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
                      ? (incidents.length === 0 
                          ? 'Unable to load earthquake data from USGS. Please check your connection or try again.'
                          : 'All clear across monitored regions')
                      : `This region currently has no recent significant earthquakes. ${incidents.length} earthquakes available in other regions.`
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
              
              {/* Summary Statistics Cards - same as list view */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
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
                          
                          {/* Enhanced Location Links with Precise Coordinates */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <a 
                              href={incident.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              USGS Details
                            </a>
                            
                            {/* Precise map links using exact coordinates */}
                            <a 
                              href={`https://www.google.com/maps/@${incident.latitude},${incident.longitude},12z`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" />
                              Google Maps
                            </a>
                            <a 
                              href={`https://www.google.com/maps/@${incident.latitude},${incident.longitude},12z/data=!3m1!1e3`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
                            >
                              <Activity className="w-3 h-3" />
                              Satellite View
                            </a>
                          </div>
                        </div>
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