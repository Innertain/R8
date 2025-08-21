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
  Zap, Search, Filter, RefreshCw, AlertTriangle, 
  InfoIcon, Clock, MapPin, Eye, EyeOff
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox token
if (import.meta.env.VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
}

// US States mapping
const US_STATES = {
  'AL': { name: 'Alabama', coords: [-86.79113, 32.377716] },
  'AK': { name: 'Alaska', coords: [-152.404419, 64.0685] },
  'AZ': { name: 'Arizona', coords: [-111.093731, 34.048927] },
  'AR': { name: 'Arkansas', coords: [-92.373123, 34.736009] },
  'CA': { name: 'California', coords: [-119.681564, 36.116203] },
  'CO': { name: 'Colorado', coords: [-105.311104, 39.059811] },
  'CT': { name: 'Connecticut', coords: [-72.755371, 41.767] },
  'DE': { name: 'Delaware', coords: [-75.526755, 39.161921] },
  'FL': { name: 'Florida', coords: [-81.686783, 27.766279] },
  'GA': { name: 'Georgia', coords: [-83.441162, 32.157435] },
  'HI': { name: 'Hawaii', coords: [-157.826182, 21.30895] },
  'ID': { name: 'Idaho', coords: [-114.478828, 44.240459] },
  'IL': { name: 'Illinois', coords: [-88.986137, 40.192138] },
  'IN': { name: 'Indiana', coords: [-86.147685, 40.790798] },
  'IA': { name: 'Iowa', coords: [-93.620866, 42.032974] },
  'KS': { name: 'Kansas', coords: [-98.484246, 39.04] },
  'KY': { name: 'Kentucky', coords: [-84.86311, 37.522] },
  'LA': { name: 'Louisiana', coords: [-91.953125, 31.244823] },
  'ME': { name: 'Maine', coords: [-69.765261, 44.323535] },
  'MD': { name: 'Maryland', coords: [-76.501157, 39.045755] },
  'MA': { name: 'Massachusetts', coords: [-71.530106, 42.407211] },
  'MI': { name: 'Michigan', coords: [-84.5467, 44.182205] },
  'MN': { name: 'Minnesota', coords: [-94.636230, 46.729553] },
  'MS': { name: 'Mississippi', coords: [-89.678696, 32.741646] },
  'MO': { name: 'Missouri', coords: [-91.831833, 38.572954] },
  'MT': { name: 'Montana', coords: [-110.454353, 47.052166] },
  'NE': { name: 'Nebraska', coords: [-99.901813, 41.492537] },
  'NV': { name: 'Nevada', coords: [-116.419389, 38.313515] },
  'NH': { name: 'New Hampshire', coords: [-71.549709, 43.452492] },
  'NJ': { name: 'New Jersey', coords: [-74.756138, 40.221741] },
  'NM': { name: 'New Mexico', coords: [-106.248482, 34.307144] },
  'NY': { name: 'New York', coords: [-74.948051, 42.165726] },
  'NC': { name: 'North Carolina', coords: [-79.806419, 35.759573] },
  'ND': { name: 'North Dakota', coords: [-101.002012, 47.551493] },
  'OH': { name: 'Ohio', coords: [-82.764915, 40.269789] },
  'OK': { name: 'Oklahoma', coords: [-97.534994, 35.482309] },
  'OR': { name: 'Oregon', coords: [-120.767635, 43.804133] },
  'PA': { name: 'Pennsylvania', coords: [-77.209755, 40.269789] },
  'RI': { name: 'Rhode Island', coords: [-71.422132, 41.82355] },
  'SC': { name: 'South Carolina', coords: [-81.035, 33.836081] },
  'SD': { name: 'South Dakota', coords: [-99.901813, 44.299782] },
  'TN': { name: 'Tennessee', coords: [-86.784, 35.860119] },
  'TX': { name: 'Texas', coords: [-97.563461, 31.054487] },
  'UT': { name: 'Utah', coords: [-111.892622, 39.419220] },
  'VT': { name: 'Vermont', coords: [-72.580536, 44.26639] },
  'VA': { name: 'Virginia', coords: [-78.169968, 37.54] },
  'WA': { name: 'Washington', coords: [-121.490494, 47.042418] },
  'WV': { name: 'West Virginia', coords: [-80.954570, 38.349497] },
  'WI': { name: 'Wisconsin', coords: [-89.616508, 44.268543] },
  'WY': { name: 'Wyoming', coords: [-107.30249, 43.075968] }
} as const;

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

const DisasterMapWithUI: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const weatherMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Use the same query as your working disaster center
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  const alerts = (response as any)?.alerts || [];

  // Use your existing state grouping logic
  const getAlertsForState = (stateCode: string): WeatherAlert[] => {
    const stateNames: Record<string, string> = Object.fromEntries(
      Object.entries(US_STATES).map(([code, data]) => [code, data.name])
    );

    return alerts.filter((alert: WeatherAlert) => {
      const location = alert.location?.toLowerCase() || '';
      const title = alert.title?.toLowerCase() || '';
      const description = alert.description?.toLowerCase() || '';

      // Check for state code in location
      if (location.includes(stateCode.toLowerCase()) || 
          title.includes(stateCode.toLowerCase()) || 
          description.includes(stateCode.toLowerCase())) {
        return true;
      }

      // Check for full state name
      const stateName = stateNames[stateCode]?.toLowerCase() || '';
      if (stateName && (location.includes(stateName) || title.includes(stateName) || description.includes(stateName))) {
        return true;
      }

      return false;
    });
  };

  // Get states with active alerts (like your working version)
  const statesWithAlerts = Object.keys(US_STATES).reduce((acc, stateCode) => {
    const stateAlerts = getAlertsForState(stateCode);
    if (stateAlerts.length > 0) {
      acc[stateCode] = stateAlerts;
    }
    return acc;
  }, {} as Record<string, WeatherAlert[]>);

  // Filter alerts based on selected state and severity (your existing logic)
  const filteredAlerts = alerts.filter((alert: WeatherAlert) => {
    // State filter
    if (selectedState !== 'all') {
      const stateAlerts = getAlertsForState(selectedState);
      if (!stateAlerts.includes(alert)) return false;
    }

    // Severity filter
    if (severityFilter !== 'all') {
      if (alert.severity?.toLowerCase() !== severityFilter.toLowerCase()) return false;
    }

    return true;
  });

  useEffect(() => {
    if (!mapContainer.current || map.current || !import.meta.env.VITE_MAPBOX_TOKEN) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark theme for your brand
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
      const coords = getCoordinatesForAlert(alert);
      const icon = getWeatherIcon(alert.event || alert.title);
      const color = getSeverityColor(alert.severity);

      // Create stable, visible marker
      const el = document.createElement('div');
      el.className = 'weather-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '16px';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.6)';
      el.innerHTML = icon;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="padding: 12px; max-width: 280px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 18px;">${icon}</span>
              <strong style="color: #1f2937;">${alert.event}</strong>
            </div>
            <div style="margin-bottom: 6px; color: #6b7280; font-size: 12px;">${alert.location}</div>
            <div style="padding: 2px 6px; background: ${color}; color: white; border-radius: 4px; font-size: 11px; display: inline-block; margin-bottom: 8px;">
              ${alert.severity} • ${alert.urgency}
            </div>
            <div style="color: #374151; font-size: 13px; line-height: 1.4;">
              ${alert.description.substring(0, 200)}${alert.description.length > 200 ? '...' : ''}
            </div>
          </div>
        `))
        .addTo(map.current!);

      weatherMarkersRef.current.push(marker);
    });

    console.log(`✓ Added ${weatherMarkersRef.current.length} weather alert markers to map`);
  };

  const getCoordinatesForAlert = (alert: WeatherAlert): [number, number] => {
    const location = alert.location?.toLowerCase() || '';
    
    // Specific coastal areas - critical for accuracy
    const coastalAreas: Record<string, [number, number]> = {
      'outer banks': [-75.5296, 35.2193],
      'hatteras island': [-75.7004, 35.2193],
      'ocracoke island': [-75.9876, 35.1154],
      'cape hatteras': [-75.6504, 35.2315],
      'east carteret': [-76.5833, 34.7333],
      'cape cod bay': [-70.2962, 41.6688],
      'nantucket sound': [-70.2962, 41.3579],
      'delaware bay': [-75.0941, 39.0458],
      'chesapeake bay': [-76.1327, 38.5767],
      'pamlico sound': [-76.0327, 35.4193]
    };

    // Check coastal areas first
    for (const [area, coords] of Object.entries(coastalAreas)) {
      if (location.includes(area)) {
        return [coords[0], coords[1]];
      }
    }

    // Match to states using your existing logic
    for (const [stateCode, stateData] of Object.entries(US_STATES)) {
      const stateName = stateData.name.toLowerCase();
      if (location.includes(stateCode.toLowerCase()) || location.includes(stateName)) {
        // Add small random offset to prevent overlapping
        return [
          stateData.coords[0] + (Math.random() - 0.5) * 1.0,
          stateData.coords[1] + (Math.random() - 0.5) * 0.6
        ];
      }
    }

    // Default fallback
    return [-95.7129, 37.0902];
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
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-500 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-300">Please add VITE_MAPBOX_TOKEN to your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Dark Map */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Your Existing Disaster Watch UI - Adapted for Map */}
      <Card className="absolute top-4 left-4 w-80 bg-gray-900/95 backdrop-blur-sm shadow-2xl z-10 max-h-[calc(100vh-2rem)] overflow-hidden border border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-yellow-500" />
              Weather Alerts Map
            </CardTitle>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-600 text-white">
                {alerts.length} Active Alerts
              </Badge>
              <div className="flex items-center gap-1">
                <Switch 
                  checked={showAlerts} 
                  onCheckedChange={setShowAlerts}
                  size="sm"
                />
                <span className="text-xs text-gray-300">Show markers</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 bg-gray-900/95 text-white overflow-y-auto max-h-[70vh]">
          {/* Your existing filters */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white">All States ({Object.keys(statesWithAlerts).length} active)</SelectItem>
                {Object.entries(US_STATES).map(([code, state]) => {
                  const alertCount = statesWithAlerts[code]?.length || 0;
                  return (
                    <SelectItem key={code} value={code} disabled={alertCount === 0} className="text-white">
                      {state.name} ({code}) {alertCount > 0 ? `- ${alertCount} alerts` : '- no alerts'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white">All Severities</SelectItem>
                <SelectItem value="extreme" className="text-white">Extreme</SelectItem>
                <SelectItem value="severe" className="text-white">Severe</SelectItem>
                <SelectItem value="moderate" className="text-white">Moderate</SelectItem>
                <SelectItem value="minor" className="text-white">Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Your existing alert list */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading weather alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No alerts match your filters</p>
              </div>
            ) : (
              filteredAlerts.slice(0, 20).map((alert: WeatherAlert) => (
                <Card 
                  key={alert.id} 
                  className="cursor-pointer border border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-1">{getWeatherIcon(alert.event)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityBadge(alert.severity)}
                          <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                            {alert.urgency}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm text-white truncate">
                          {alert.event}
                        </h4>
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-300 truncate">
                            {alert.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
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
    </div>
  );
};

export default DisasterMapWithUI;