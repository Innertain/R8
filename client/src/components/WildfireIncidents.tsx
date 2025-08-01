import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flame, MapPin, Calendar, ExternalLink, Loader2 } from 'lucide-react';

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
}

export function WildfireIncidents({ stateFilter }: WildfireIncidentsProps) {
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
        const titleLower = incident.title.toLowerCase();
        const descLower = incident.description.toLowerCase();
        const stateLower = incident.state?.toLowerCase() || '';
        const filterLower = stateFilter.toLowerCase();
        
        // Check if state matches directly
        if (stateLower === filterLower) return true;
        
        // Check if state name is in title or description
        const fullStateName = stateNames[stateFilter.toUpperCase()]?.toLowerCase();
        if (fullStateName && (titleLower.includes(fullStateName) || descLower.includes(fullStateName))) {
          return true;
        }
        
        // Check if state abbreviation is in title or description
        if (titleLower.includes(filterLower) || descLower.includes(filterLower)) {
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

  // Group incidents by state for summary stats
  const incidentsByState = filteredIncidents.reduce((acc: Record<string, WildfireIncident[]>, incident: WildfireIncident) => {
    const state = incident.state || 'Unknown';
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
          <p className="text-sm text-gray-600">
            {filteredIncidents.length} active incident{filteredIncidents.length !== 1 ? 's' : ''} 
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
        </CardHeader>
        <CardContent>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
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
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(incidentsByState).length}
                </div>
                <div className="text-sm text-gray-600">States Affected</div>
              </CardContent>
            </Card>
          </div>

          {/* Incidents List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-8">
                <Flame className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  {stateFilter && stateFilter !== 'all' 
                    ? `No wildfire incidents in ${stateFilter}` 
                    : 'No wildfire incidents reported'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">Current data from InciWeb RSS</p>
              </div>
            ) : (
              filteredIncidents.map((incident: WildfireIncident) => (
                <Card key={incident.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                          {incident.severity && (
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                          {incident.state && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{incident.state}</span>
                            </div>
                          )}
                          {incident.acres && (
                            <div className="flex items-center gap-1">
                              <Flame className="w-4 h-4" />
                              <span>{formatAcres(incident.acres)}</span>
                            </div>
                          )}
                          {incident.pubDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(incident.pubDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-3">
                          <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                            {incident.incidentType}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          {incident.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            Source: {incident.source}
                          </span>
                          {incident.link && (
                            <a
                              href={incident.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
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
        </CardContent>
      </Card>
    </div>
  );
}