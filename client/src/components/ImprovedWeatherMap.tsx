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
  CloudRain, Search, MapPin, Clock, 
  AlertTriangle, RefreshCw, Eye
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

const ImprovedWeatherMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const weatherMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Use the same query as existing components
  const { data: response, isLoading, error, refetch } = useQuery({
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

  const addWeatherAlerts = async () => {
    if (!map.current) return;

    // Clear existing markers
    weatherMarkersRef.current.forEach(marker => marker.remove());
    weatherMarkersRef.current = [];

    if (!showAlerts) return;

    for (const alert of filteredAlerts.slice(0, 50)) {
      try {
        const coords = await getCoordinatesFromLocation(alert.location || alert.title);
        const icon = getWeatherIcon(alert.event || alert.title);
        const color = getSeverityColor(alert.severity);

        // Create larger, more visible marker
        const el = document.createElement('div');
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = color;
        el.style.border = '3px solid white';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '18px';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        el.style.zIndex = '1000';
        el.innerHTML = icon;

        // Add hover effect
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.zIndex = '1001';
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.zIndex = '1000';
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([coords[0], coords[1]])
          .addTo(map.current!);

        // Add click handler to select alert
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedAlert(alert);
          // Fly to alert location
          map.current?.flyTo({
            center: [coords[0], coords[1]],
            zoom: 8,
            duration: 1000
          });
        });

        weatherMarkersRef.current.push(marker);

        console.log(`✓ Placed ${alert.event} at [${coords[0]}, ${coords[1]}] for location: ${alert.location}`);
      } catch (error) {
        console.error(`Failed to place alert: ${alert.event}`, error);
      }
    }
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

  const getCoordinatesFromLocation = async (location: string): Promise<[number, number]> => {
    // Comprehensive geocoding with proper state/region mapping
    const locationMappings: Record<string, [number, number]> = {
      // State centers - primary geocoding
      'alabama': [-86.79, 32.38], 'alaska': [-152.40, 64.07], 'arizona': [-111.09, 34.05],
      'arkansas': [-92.37, 34.74], 'california': [-119.68, 36.12], 'colorado': [-105.31, 39.06],
      'connecticut': [-72.76, 41.77], 'delaware': [-75.53, 39.16], 'florida': [-81.69, 27.77],
      'georgia': [-83.44, 32.16], 'hawaii': [-157.83, 21.31], 'idaho': [-114.48, 44.24],
      'illinois': [-88.99, 40.19], 'indiana': [-86.15, 40.79], 'iowa': [-93.62, 42.03],
      'kansas': [-98.48, 39.04], 'kentucky': [-84.86, 37.52], 'louisiana': [-91.95, 31.24],
      'maine': [-69.77, 44.32], 'maryland': [-76.50, 39.05], 'massachusetts': [-71.53, 42.41],
      'michigan': [-84.55, 44.18], 'minnesota': [-94.64, 46.73], 'mississippi': [-89.68, 32.74],
      'missouri': [-91.83, 38.57], 'montana': [-110.45, 47.05], 'nebraska': [-99.90, 41.49],
      'nevada': [-116.42, 38.31], 'new hampshire': [-71.55, 43.45], 'new jersey': [-74.76, 40.22],
      'new mexico': [-106.25, 34.31], 'new york': [-74.95, 42.17], 'north carolina': [-79.81, 35.76],
      'north dakota': [-101.00, 47.55], 'ohio': [-82.76, 40.27], 'oklahoma': [-97.53, 35.48],
      'oregon': [-120.77, 43.80], 'pennsylvania': [-77.21, 40.27], 'rhode island': [-71.42, 41.82],
      'south carolina': [-81.04, 33.84], 'south dakota': [-99.90, 44.30], 'tennessee': [-86.78, 35.86],
      'texas': [-97.56, 31.05], 'utah': [-111.89, 39.42], 'vermont': [-72.58, 44.27],
      'virginia': [-78.17, 37.54], 'washington': [-121.49, 47.04], 'west virginia': [-80.95, 38.35],
      'wisconsin': [-89.62, 44.27], 'wyoming': [-107.30, 43.08],

      // Coastal and marine areas - critical for proper placement
      'outer banks': [-75.53, 35.22], 'hatteras island': [-75.70, 35.22], 'ocracoke island': [-75.99, 35.12],
      'cape hatteras': [-75.65, 35.23], 'cape cod': [-70.30, 41.67], 'cape cod bay': [-70.30, 41.67],
      'martha\'s vineyard': [-70.60, 41.39], 'nantucket': [-70.10, 41.28], 'nantucket sound': [-70.30, 41.36],
      'long island sound': [-72.69, 41.26], 'block island sound': [-71.56, 41.16], 'buzzards bay': [-70.75, 41.56],
      'chesapeake bay': [-76.13, 38.58], 'delaware bay': [-75.09, 39.05], 'pamlico sound': [-76.03, 35.42],
      'albemarle sound': [-75.93, 36.12], 'dare county': [-75.63, 35.53], 'carteret county': [-76.68, 34.73],
      'east carteret': [-76.58, 34.73], 'west carteret': [-77.08, 34.73],
      'galveston bay': [-94.90, 29.30], 'mobile bay': [-87.91, 30.45], 'tampa bay': [-82.46, 27.95],
      'san francisco bay': [-122.42, 37.77], 'puget sound': [-122.42, 47.61], 'lake michigan': [-87.01, 43.53],
      'lake erie': [-81.24, 42.26], 'lake ontario': [-77.94, 43.72], 'lake superior': [-87.55, 47.72],

      // Major metropolitan areas for better urban placement
      'new york city': [-74.01, 40.71], 'los angeles': [-118.24, 34.05], 'chicago': [-87.63, 41.88],
      'houston': [-95.37, 29.76], 'phoenix': [-112.07, 33.45], 'philadelphia': [-75.17, 39.95],
      'san antonio': [-98.49, 29.42], 'san diego': [-117.16, 32.72], 'dallas': [-96.80, 32.78],
      'san jose': [-121.89, 37.34], 'austin': [-97.74, 30.27], 'jacksonville': [-81.66, 30.33],
      'miami': [-80.19, 25.76], 'atlanta': [-84.39, 33.75], 'boston': [-71.06, 42.36],
      'denver': [-104.99, 39.74], 'seattle': [-122.33, 47.61], 'nashville': [-86.78, 36.16],

      // County-level mappings for precision
      'los angeles county': [-118.24, 34.05], 'orange county': [-117.83, 33.68], 'san diego county': [-117.16, 32.72],
      'riverside county': [-117.40, 33.95], 'san bernardino county': [-117.29, 34.11], 'ventura county': [-119.23, 34.37],
      'kern county': [-119.02, 35.37], 'fresno county': [-119.79, 36.74], 'santa barbara county': [-120.25, 34.58]
    };

    const cleanLocation = location.toLowerCase().trim();

    // Direct location matching with exact coordinates
    for (const [key, coords] of Object.entries(locationMappings)) {
      if (cleanLocation.includes(key)) {
        // Add small random offset to prevent overlapping markers
        const offset = 0.2;
        return [
          coords[0] + (Math.random() - 0.5) * offset,
          coords[1] + (Math.random() - 0.5) * offset
        ];
      }
    }

    // State abbreviation parsing for NWS format
    const stateAbbreviations: Record<string, [number, number]> = {
      'al': [-86.79, 32.38], 'ak': [-152.40, 64.07], 'az': [-111.09, 34.05], 'ar': [-92.37, 34.74],
      'ca': [-119.68, 36.12], 'co': [-105.31, 39.06], 'ct': [-72.76, 41.77], 'de': [-75.53, 39.16],
      'fl': [-81.69, 27.77], 'ga': [-83.44, 32.16], 'hi': [-157.83, 21.31], 'id': [-114.48, 44.24],
      'il': [-88.99, 40.19], 'in': [-86.15, 40.79], 'ia': [-93.62, 42.03], 'ks': [-98.48, 39.04],
      'ky': [-84.86, 37.52], 'la': [-91.95, 31.24], 'me': [-69.77, 44.32], 'md': [-76.50, 39.05],
      'ma': [-71.53, 42.41], 'mi': [-84.55, 44.18], 'mn': [-94.64, 46.73], 'ms': [-89.68, 32.74],
      'mo': [-91.83, 38.57], 'mt': [-110.45, 47.05], 'ne': [-99.90, 41.49], 'nv': [-116.42, 38.31],
      'nh': [-71.55, 43.45], 'nj': [-74.76, 40.22], 'nm': [-106.25, 34.31], 'ny': [-74.95, 42.17],
      'nc': [-79.81, 35.76], 'nd': [-101.00, 47.55], 'oh': [-82.76, 40.27], 'ok': [-97.53, 35.48],
      'or': [-120.77, 43.80], 'pa': [-77.21, 40.27], 'ri': [-71.42, 41.82], 'sc': [-81.04, 33.84],
      'sd': [-99.90, 44.30], 'tn': [-86.78, 35.86], 'tx': [-97.56, 31.05], 'ut': [-111.89, 39.42],
      'vt': [-72.58, 44.27], 'va': [-78.17, 37.54], 'wa': [-121.49, 47.04], 'wv': [-80.95, 38.35],
      'wi': [-89.62, 44.27], 'wy': [-107.30, 43.08]
    };

    // Parse state abbreviations from NWS format
    const stateMatch = location.match(/\b([A-Z]{2})\b/);
    if (stateMatch) {
      const abbr = stateMatch[1].toLowerCase();
      if (stateAbbreviations[abbr]) {
        const coords = stateAbbreviations[abbr];
        const offset = 1.0;
        return [
          coords[0] + (Math.random() - 0.5) * offset,
          coords[1] + (Math.random() - 0.5) * offset
        ];
      }
    }

    // Fallback to center US
    console.warn(`Could not geocode location: ${location}`);
    return [-95.71, 37.09];
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

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-600 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600">Please add VITE_MAPBOX_TOKEN to your environment variables to use the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Enhanced Control Panel */}
      <Card className="absolute top-4 left-4 w-96 bg-white/95 backdrop-blur-sm shadow-2xl z-10 max-h-[calc(100vh-2rem)] overflow-hidden border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-xl font-bold">
            <div className="flex items-center gap-2">
              <CloudRain className="w-6 h-6 text-blue-600" />
              Live Weather Alerts
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                {alerts.length} Active
              </Badge>
              <Badge variant="outline" className="text-green-700 border-green-300">
                Live Data
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={showAlerts} 
                onCheckedChange={setShowAlerts}
              />
              <Eye className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts by location or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities ({alerts.length})</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alert List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading weather alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No alerts match your filters
              </div>
            ) : (
              filteredAlerts.slice(0, 20).map((alert: WeatherAlert) => (
                <Card 
                  key={alert.id} 
                  className={`cursor-pointer border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 ${
                    selectedAlert?.id === alert.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1">{getWeatherIcon(alert.event)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityBadge(alert.severity)}
                          <Badge variant="outline" className="text-xs">
                            {alert.urgency}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 mb-1">
                          {alert.event}
                        </h4>
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <p className="text-xs text-gray-700 truncate">
                            {alert.location}
                          </p>
                        </div>
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

      {/* Selected Alert Detail Panel */}
      {selectedAlert && (
        <Card className="absolute top-4 right-4 w-96 bg-white shadow-2xl z-20 max-h-[80vh] overflow-y-auto border-2">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getWeatherIcon(selectedAlert.event)}</span>
                  {selectedAlert.event}
                </CardTitle>
                <div className="flex items-center gap-2">
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
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </div>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {selectedAlert.location}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
              <div className="text-sm text-gray-900 leading-relaxed bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                {selectedAlert.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-gray-700">Sent</div>
                <div className="text-gray-900 text-xs">
                  {new Date(selectedAlert.sent).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Expires</div>
                <div className="text-gray-900 text-xs">
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

export default ImprovedWeatherMap;