import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Flame, MapPin, Calendar, ExternalLink, Loader2, Info as InfoIcon } from 'lucide-react';
import { RealtimeApiDebugger } from './RealtimeApiDebugger';

interface WildfireIncident {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  state: string;
  acres: number | null;
  status: string;
  incidentType: string;
  source: string;
  severity: string;
}

interface WildfireIncidentsProps {
  stateFilter?: string;
  onStateFilterChange?: (stateCode: string) => void;
}

export function WildfireIncidents({ stateFilter, onStateFilterChange }: WildfireIncidentsProps) {
  const [selectedState, setSelectedState] = useState<string>(stateFilter || 'all');

  // Function to handle state selection and notify parent
  const handleStateClick = (stateCode: string) => {
    setSelectedState(stateCode);
    if (onStateFilterChange) {
      onStateFilterChange(stateCode);
    }
  };
  const { data: incidentsData, isLoading, error } = useQuery({
    queryKey: ['/api/wildfire-incidents'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  const incidents = (incidentsData as any)?.incidents || [];
  
  // State mapping for better filtering
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

  // Filter incidents by state if specified
  const filteredIncidents = stateFilter && stateFilter !== 'all' 
    ? incidents.filter((incident: WildfireIncident) => {
        // Primary filter: match by the incident's state field
        const incidentState = incident.state?.toUpperCase() || '';
        const filterState = stateFilter.toUpperCase();
        
        // Direct state code match (most reliable)
        if (incidentState === filterState) {
          return true;
        }
        
        // Fallback: check if state name appears in title (for edge cases)
        const titleLower = incident.title.toLowerCase();
        const fullStateName = stateNames[filterState]?.toLowerCase();
        if (fullStateName && titleLower.includes(fullStateName)) {
          return true;
        }
        
        return false;
      })
    : incidents;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'contained': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'controlled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suppressed': return 'bg-green-100 text-green-800 border-green-200';
      case 'out': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'bg-red-600 text-white';
      case 'moderate': return 'bg-orange-500 text-white';
      case 'minor': return 'bg-yellow-400 text-black';
      default: return 'bg-gray-400 text-white';
    }
  };

  const formatAcres = (acres: number | null) => {
    if (!acres) return 'Unknown size';
    return acres.toLocaleString() + ' acres';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 animate-pulse text-orange-600" />
            Loading Wildfire Incidents...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
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
            Wildfire Data Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to load wildfire incident data from InciWeb RSS feed.</p>
        </CardContent>
      </Card>
    );
  }

  // Valid US state codes to filter out invalid data
  const validStates = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]);

  // Group incidents by state for summary stats - only include valid states
  const incidentsByState = filteredIncidents.reduce((acc: Record<string, WildfireIncident[]>, incident: WildfireIncident) => {
    let state = incident.state;
    
    // Skip if no state or invalid state code
    if (!state || !validStates.has(state)) {
      return acc;
    }
    
    if (!acc[state]) acc[state] = [];
    acc[state].push(incident);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            Active Wildfire Incidents
            {stateFilter && stateFilter !== 'all' && (
              <Badge variant="outline" className="ml-2">
                {stateNames[stateFilter.toUpperCase()] || stateFilter}
              </Badge>
            )}
          </CardTitle>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} 
              {stateFilter && stateFilter !== 'all' 
                ? ` in ${stateNames[stateFilter.toUpperCase()] || stateFilter}` 
                : ' nationwide'
              } from InciWeb
              {stateFilter && stateFilter !== 'all' && (
                <span className="text-blue-600 ml-2 text-xs">
                  • Filtered by weather alert selection
                </span>
              )}
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-orange-800 flex items-center gap-2 mb-2">
                <InfoIcon className="w-4 h-4" />
                About Wildfire Data
              </h4>
              <p className="text-xs text-orange-700 leading-relaxed">
                This data comes from <strong>InciWeb (Incident Information System)</strong>, the interagency wildfire information system used by federal, state, and local emergency management agencies. 
                Incident statuses include <strong>Active</strong> (currently burning), <strong>Contained</strong> (firefighters have control lines), <strong>Controlled</strong> (fire is out but still monitored), and <strong>Out</strong> (fire completely extinguished). 
                Data is updated in real-time as field crews report progress.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Wildfire Incidents Map View */}
            <div className="space-y-6">
              {/* Interactive Map Representation */}
              <div className="bg-gradient-to-b from-orange-50 to-orange-100 rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  United States Wildfire Incident Map
                  {selectedState !== 'all' && (
                    <span className="block text-sm font-normal text-gray-600 mt-1">
                      Filtered for: {stateNames[selectedState as keyof typeof stateNames] || selectedState}
                    </span>
                  )}
                </h3>
                
                {Object.keys(incidentsByState).length === 0 ? (
                  <div className="text-center py-8">
                    <Flame className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      {selectedState === 'all' 
                        ? 'No active wildfire incidents' 
                        : `No active incidents in ${stateNames[selectedState as keyof typeof stateNames] || selectedState}`
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedState === 'all' 
                        ? 'All clear across monitored regions' 
                        : 'This state currently has no active wildfire incidents'
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
                      {Object.entries(incidentsByState)
                        .filter(([stateCode]) => selectedState === 'all' || stateCode === selectedState)
                        .map(([stateCode, stateIncidents]) => {
                        const state = stateNames[stateCode as keyof typeof stateNames];
                        const maxStatus = (stateIncidents as WildfireIncident[]).reduce((max: string, incident: WildfireIncident) => {
                          const statusOrder = { 'active': 4, 'contained': 3, 'controlled': 2, 'out': 1, 'suppressed': 1 };
                          const incidentLevel = statusOrder[incident.status.toLowerCase() as keyof typeof statusOrder] || 0;
                          const maxLevel = statusOrder[max.toLowerCase() as keyof typeof statusOrder] || 0;
                          return incidentLevel > maxLevel ? incident.status : max;
                        }, 'out');

                        const getStatusColor = (status: string) => {
                          switch (status.toLowerCase()) {
                            case 'active': return 'bg-red-500 text-white border-red-600';
                            case 'contained': return 'bg-yellow-500 text-white border-yellow-600';
                            case 'controlled': return 'bg-blue-500 text-white border-blue-600';
                            case 'out': 
                            case 'suppressed': return 'bg-green-500 text-white border-green-600';
                            default: return 'bg-gray-400 text-white border-gray-500';
                          }
                        };

                        return (
                          <div
                            key={stateCode}
                            className={`p-3 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${
                              selectedState === stateCode 
                                ? 'ring-4 ring-orange-500 shadow-lg scale-105' 
                                : ''
                            } ${getStatusColor(maxStatus)}`}
                            onClick={() => {
                              const newState = selectedState === stateCode ? 'all' : stateCode;
                              handleStateClick(newState);
                            }}
                          >
                            <div className="text-center">
                              <div className="font-bold text-lg">{stateCode}</div>
                              <div className="text-xs opacity-90">{state || stateCode}</div>
                              <div className="text-xs font-semibold mt-1">
                                {(stateIncidents as WildfireIncident[]).length} incident{(stateIncidents as WildfireIncident[]).length !== 1 ? 's' : ''}
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
                          View all states
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {/* Show incidents for selected state */}
                {selectedState !== 'all' && incidentsByState[selectedState] && (
                  <div className="mt-6 bg-white rounded-lg border p-4">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">
                      Wildfire Incidents in {stateNames[selectedState as keyof typeof stateNames] || selectedState}
                    </h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {(incidentsByState[selectedState] as WildfireIncident[]).map((incident: WildfireIncident) => (
                        <div key={incident.id} className="p-3 bg-gray-50 rounded border-l-4 border-l-orange-500">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold text-gray-900 text-sm">{incident.title}</h5>
                                <Badge className={getStatusColor(incident.status)}>
                                  {incident.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                {incident.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {incident.acres && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {incident.acres.toLocaleString()} acres
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(incident.pubDate).toLocaleDateString()}
                                </span>
                                <span className="text-orange-600">
                                  {incident.incidentType}
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
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {filteredIncidents.filter((i: WildfireIncident) => i.status === 'Active').length}
                      </div>
                      <div className="text-sm text-gray-600">Active</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {filteredIncidents.filter((i: WildfireIncident) => i.status === 'Contained').length}
                      </div>
                      <div className="text-sm text-gray-600">Contained</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {filteredIncidents.filter((i: WildfireIncident) => i.status === 'Controlled').length}
                      </div>
                      <div className="text-sm text-gray-600">Controlled</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredIncidents.filter((i: WildfireIncident) => i.status === 'Out' || i.status === 'Suppressed').length}
                      </div>
                      <div className="text-sm text-gray-600">Out</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Object.keys(incidentsByState).length}
                      </div>
                      <div className="text-sm text-gray-600">States Affected</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Color Legend */}
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Incident Status Colors</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded border"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded border"></div>
                      <span>Contained</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded border"></div>
                      <span>Controlled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded border"></div>
                      <span>Out/Suppressed</span>
                    </div>
                  </div>
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