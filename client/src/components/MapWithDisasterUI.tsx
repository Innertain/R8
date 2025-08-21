import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  CloudRain, Activity, Search, Filter, MapPin, Clock, 
  AlertTriangle, Wind, Snowflake, Zap, Sun, Eye, EyeOff
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox token
if (import.meta.env.VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  event: string;
  urgency: string;
  sent: string;
  expires: string;
  senderName: string;
  category: string;
}

const MapWithDisasterUI: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const weatherMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Use the same query as existing components
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  const alerts = (response as any)?.alerts || [];

  // Filter alerts based on search and severity
  const filteredAlerts = alerts.filter((alert: WeatherAlert) => {
    const matchesSearch = searchTerm === '' || 
      alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || 
      alert.severity?.toLowerCase() === severityFilter.toLowerCase();
    
    return matchesSearch && matchesSeverity;
  });

  useEffect(() => {
    if (!mapContainer.current || map.current || !import.meta.env.VITE_MAPBOX_TOKEN) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-95.7129, 37.0902],
        zoom: 4
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setInitialized(true);
      });

    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add weather alerts when data changes
  useEffect(() => {
    if (initialized && filteredAlerts.length > 0) {
      addWeatherAlerts();
    }
  }, [filteredAlerts, initialized, showAlerts]);

  const addWeatherAlerts = () => {
    if (!map.current) return;

    // Clear existing markers
    weatherMarkersRef.current.forEach(marker => marker.remove());
    weatherMarkersRef.current = [];

    if (!showAlerts) return;

    filteredAlerts.slice(0, 100).forEach((alert: WeatherAlert) => {
      const coords = getCoordinatesFromLocation(alert.location || alert.title);
      const icon = getWeatherIcon(alert.event || alert.title);
      const color = getSeverityColor(alert.severity);

      // Create marker element
      const el = document.createElement('div');
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '12px';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.innerHTML = icon;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([coords[0], coords[1]])
        .addTo(map.current!);

      // Add click handler to select alert
      el.addEventListener('click', () => {
        setSelectedAlert(alert);
      });

      weatherMarkersRef.current.push(marker);
    });
  };

  const getWeatherIcon = (eventType: string): string => {
    const type = eventType.toLowerCase();
    if (type.includes('tornado')) return '🌪️';
    if (type.includes('thunderstorm') || type.includes('severe thunderstorm')) return '⛈️';
    if (type.includes('flood') || type.includes('flash flood')) return '🌊';
    if (type.includes('winter') || type.includes('snow') || type.includes('ice')) return '❄️';
    if (type.includes('wind') || type.includes('gale')) return '💨';
    if (type.includes('heat') || type.includes('fire')) return '🔥';
    if (type.includes('hurricane') || type.includes('tropical storm')) return '🌀';
    if (type.includes('fog') || type.includes('dense fog')) return '🌫️';
    return '⚠️';
  };

  const getSeverityColor = (severity: string): string => {
    const sev = severity?.toLowerCase() || '';
    if (sev.includes('extreme')) return '#8B0000';
    if (sev.includes('severe')) return '#DC2626';
    if (sev.includes('moderate')) return '#F59E0B';
    return '#3B82F6';
  };

  const getCoordinatesFromLocation = (location: string): [number, number] => {
    // Enhanced location parsing with precise state coordinates
    const stateCoords: Record<string, [number, number]> = {
      'alabama': [-86.79113, 32.377716], 'alaska': [-152.404419, 64.0685],
      'arizona': [-111.093731, 34.048927], 'arkansas': [-92.373123, 34.736009],
      'california': [-119.681564, 36.116203], 'colorado': [-105.311104, 39.059811],
      'connecticut': [-72.755371, 41.767], 'delaware': [-75.526755, 39.161921],
      'florida': [-81.686783, 27.766279], 'georgia': [-83.441162, 32.157435],
      'hawaii': [-157.826182, 21.30895], 'idaho': [-114.478828, 44.240459],
      'illinois': [-88.986137, 40.192138], 'indiana': [-86.147685, 40.790798],
      'iowa': [-93.620866, 42.032974], 'kansas': [-98.484246, 39.04],
      'kentucky': [-84.86311, 37.522], 'louisiana': [-91.953125, 31.244823],
      'maine': [-69.765261, 44.323535], 'maryland': [-76.501157, 39.045755],
      'massachusetts': [-71.530106, 42.407211], 'michigan': [-84.5467, 44.182205],
      'minnesota': [-94.636230, 46.729553], 'mississippi': [-89.678696, 32.741646],
      'missouri': [-91.831833, 38.572954], 'montana': [-110.454353, 47.052166],
      'nebraska': [-99.901813, 41.492537], 'nevada': [-116.419389, 38.313515],
      'new hampshire': [-71.549709, 43.452492], 'new jersey': [-74.756138, 40.221741],
      'new mexico': [-106.248482, 34.307144], 'new york': [-74.948051, 42.165726],
      'north carolina': [-79.806419, 35.759573], 'north dakota': [-101.002012, 47.551493],
      'ohio': [-82.764915, 40.269789], 'oklahoma': [-97.534994, 35.482309],
      'oregon': [-120.767635, 43.804133], 'pennsylvania': [-77.209755, 40.269789],
      'rhode island': [-71.422132, 41.82355], 'south carolina': [-81.035, 33.836081],
      'south dakota': [-99.901813, 44.299782], 'tennessee': [-86.784, 35.860119],
      'texas': [-97.563461, 31.054487], 'utah': [-111.892622, 39.419220],
      'vermont': [-72.580536, 44.26639], 'virginia': [-78.169968, 37.54],
      'washington': [-121.490494, 47.042418], 'west virginia': [-80.954570, 38.349497],
      'wisconsin': [-89.616508, 44.268543], 'wyoming': [-107.30249, 43.075968]
    };

    // Enhanced marine/coastal area coordinates
    const marineCoords: Record<string, [number, number]> = {
      // North Carolina coastal areas
      'hatteras island': [-75.7004, 35.2193], 'ocracoke island': [-75.9876, 35.1154],
      'outer banks': [-75.5296, 35.2193], 'east carteret': [-76.5833, 34.7333],
      'cape hatteras': [-75.6504, 35.2315], 'cape fear': [-78.0661, 33.8376],
      'pamlico sound': [-76.0327, 35.4193], 'albemarle sound': [-75.9327, 36.1193],
      
      // East Coast marine areas
      'delaware bay': [-75.0941, 39.0458], 'chesapeake bay': [-76.1327, 38.5767],
      'cape cod bay': [-70.2962, 41.6688], 'buzzards bay': [-70.7461, 41.5579],
      'nantucket sound': [-70.2962, 41.3579], 'block island sound': [-71.5561, 41.1579],
      'long island sound': [-72.6851, 41.2579], 'fire island': [-73.1851, 40.6426],
      'montauk point': [-71.8565, 41.0707], 'vineyard sound': [-70.7461, 41.3579],
      
      // West Coast marine areas
      'san francisco bay': [-122.4194, 37.7749], 'monterey bay': [-121.8974, 36.6177],
      'puget sound': [-122.4194, 47.6062], 'columbia river': [-123.9351, 46.2396],
      
      // Gulf Coast areas
      'galveston bay': [-94.9027, 29.3013], 'mobile bay': [-87.9073, 30.4518],
      'tampa bay': [-82.4572, 27.9506], 'charlotte harbor': [-82.0609, 26.9342],
      
      // Great Lakes
      'lake superior': [-87.5467, 47.7211], 'lake michigan': [-87.0073, 43.5291],
      'lake huron': [-82.4103, 44.7631], 'lake erie': [-81.2428, 42.2619],
      'lake ontario': [-77.9360, 43.7181]
    };

    // County parsing for better precision
    const countyCoords: Record<string, [number, number]> = {
      'los angeles county': [-118.2437, 34.0522], 'orange county': [-117.8265, 33.6846],
      'san diego county': [-117.1611, 32.7157], 'riverside county': [-117.3961, 33.9533],
      'san bernardino county': [-117.2898, 34.1084], 'ventura county': [-119.2321, 34.3705],
      'santa barbara county': [-120.2462, 34.5794], 'kern county': [-119.0187, 35.3733],
      'fresno county': [-119.7871, 36.7378], 'tulare county': [-118.8597, 36.2077],
      'kings county': [-119.9107, 36.1324], 'merced county': [-120.7463, 37.1855],
      'madera county': [-119.8696, 37.0599], 'mariposa county': [-119.9663, 37.4849]
    };

    const cleanLocation = location.toLowerCase().trim();
    
    // First check specific marine/coastal areas
    for (const [loc, coords] of Object.entries(marineCoords)) {
      if (cleanLocation.includes(loc.toLowerCase())) {
        return [coords[0], coords[1]];
      }
    }
    
    // Check county names
    for (const [county, coords] of Object.entries(countyCoords)) {
      if (cleanLocation.includes(county.toLowerCase())) {
        return [coords[0], coords[1]];
      }
    }

    // Parse state abbreviations (NWS format often uses abbreviations)
    const stateAbbrMap: Record<string, string> = {
      'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas', 'ca': 'california',
      'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware', 'fl': 'florida', 'ga': 'georgia',
      'hi': 'hawaii', 'id': 'idaho', 'il': 'illinois', 'in': 'indiana', 'ia': 'iowa',
      'ks': 'kansas', 'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
      'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi',
      'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada', 'nh': 'new hampshire',
      'nj': 'new jersey', 'nm': 'new mexico', 'ny': 'new york', 'nc': 'north carolina',
      'nd': 'north dakota', 'oh': 'ohio', 'ok': 'oklahoma', 'or': 'oregon', 'pa': 'pennsylvania',
      'ri': 'rhode island', 'sc': 'south carolina', 'sd': 'south dakota', 'tn': 'tennessee',
      'tx': 'texas', 'ut': 'utah', 'vt': 'vermont', 'va': 'virginia', 'wa': 'washington',
      'wv': 'west virginia', 'wi': 'wisconsin', 'wy': 'wyoming'
    };

    // Check for state abbreviations
    for (const [abbr, fullName] of Object.entries(stateAbbrMap)) {
      if (cleanLocation.includes(abbr) && stateCoords[fullName]) {
        const coords = stateCoords[fullName];
        return [
          coords[0] + (Math.random() - 0.5) * 2.0,
          coords[1] + (Math.random() - 0.5) * 1.2
        ];
      }
    }

    // Check full state names
    for (const [state, coords] of Object.entries(stateCoords)) {
      if (cleanLocation.includes(state)) {
        return [
          coords[0] + (Math.random() - 0.5) * 2.0,
          coords[1] + (Math.random() - 0.5) * 1.2
        ];
      }
    }

    return [-95.7129, 37.0902]; // Default center US
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      'Extreme': 'bg-red-800 text-white',
      'Severe': 'bg-red-600 text-white', 
      'Moderate': 'bg-yellow-500 text-white',
      'Minor': 'bg-blue-500 text-white'
    };
    
    return (
      <Badge className={`${colors[severity as keyof typeof colors] || 'bg-gray-500 text-white'} text-xs`}>
        {severity}
      </Badge>
    );
  };

  const getStateSummary = () => {
    const stateCounts: Record<string, number> = {};
    
    alerts.forEach((alert: WeatherAlert) => {
      const location = alert.location?.toLowerCase() || '';
      // Extract state abbreviations from location
      const stateMatch = location.match(/\b([A-Z]{2})\b/);
      if (stateMatch) {
        const state = stateMatch[1];
        stateCounts[state] = (stateCounts[state] || 0) + 1;
      }
    });

    const stateColors = [
      'bg-red-600', 'bg-orange-500', 'bg-yellow-600', 'bg-blue-600', 
      'bg-purple-600', 'bg-green-600', 'bg-indigo-600', 'bg-pink-600'
    ];

    return Object.entries(stateCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([state, count], index) => ({
        state,
        count,
        color: stateColors[index % stateColors.length]
      }));
  };

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-bold text-red-600 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600">Please add VITE_MAPBOX_TOKEN to your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Enhanced Disaster Watch Center UI Overlay */}
      <Card className="absolute top-4 left-4 w-96 bg-white/95 backdrop-blur shadow-xl z-10 max-h-[calc(100vh-2rem)] overflow-hidden border-2">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <CloudRain className="w-6 h-6 text-blue-600" />
            Live Weather Alerts Map
          </CardTitle>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {alerts.length} Active Alerts
              </Badge>
              <Badge variant="outline" className="text-green-700 border-green-300">
                Real-time Data
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={showAlerts} 
                onCheckedChange={setShowAlerts}
                size="sm"
              />
              <span className="text-xs font-medium">Markers</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 overflow-y-auto max-h-[60vh]">
          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by severity" />
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

          {/* State Summary Stats */}
          {filteredAlerts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Alert Summary by State</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {getStateSummary().slice(0, 12).map(({state, count, color}) => (
                  <div key={state} className={`${color} text-white rounded px-2 py-1 text-center font-medium`}>
                    {state}: {count}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert List */}
          <div className="space-y-2">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Loading weather alerts...</span>
                  </div>
                ) : 'No alerts match your filters'}
              </div>
            ) : (
              filteredAlerts.slice(0, 25).map((alert: WeatherAlert) => (
                <Card 
                  key={alert.id} 
                  className={`cursor-pointer border hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 ${
                    selectedAlert?.id === alert.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-1">{getWeatherIcon(alert.event)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityBadge(alert.severity)}
                          <Badge variant="outline" className="text-xs">
                            {alert.urgency}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 truncate mb-1">
                          {alert.event}
                        </h4>
                        <p className="text-xs text-gray-700 truncate mb-1">
                          📍 {alert.location}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Expires: {new Date(alert.expires).toLocaleDateString()}</span>
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

      {/* Selected Alert Detail */}
      {selectedAlert && (
        <Card className="absolute top-4 right-4 w-96 bg-white shadow-2xl z-20 max-h-[80vh] overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-xl">{getWeatherIcon(selectedAlert.event)}</span>
                  {selectedAlert.event}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {getSeverityBadge(selectedAlert.severity)}
                  <Badge variant="outline" className="text-xs">
                    {selectedAlert.urgency}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlert(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Location</div>
              <div className="text-sm text-gray-900">{selectedAlert.location}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
              <div className="text-sm text-gray-900 leading-relaxed">
                {selectedAlert.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-gray-700">Sent</div>
                <div className="text-gray-900">
                  {new Date(selectedAlert.sent).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Expires</div>
                <div className="text-gray-900">
                  {new Date(selectedAlert.expires).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Issued by</div>
              <div className="text-sm text-gray-900">{selectedAlert.senderName}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapWithDisasterUI;