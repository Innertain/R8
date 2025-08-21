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
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const weatherMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Use the same RSS endpoint as your working disaster center
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  const rawAlerts = (response as any)?.alerts || [];
  
  // Filter to only show warnings and watches (exact logic from your working version)
  const alerts = rawAlerts.filter((alert: WeatherAlert) => {
    const title = alert.title?.toLowerCase() || '';
    const event = alert.event?.toLowerCase() || '';
    const combined = `${title} ${event}`;
    
    // Filter out advisories - only show warnings and watches
    if (combined.includes('advisory')) return false;
    if (combined.includes('statement')) return false;
    if (combined.includes('outlook')) return false;
    
    // Keep warnings and watches
    return combined.includes('warning') || combined.includes('watch');
  });

  // Use your exact working state grouping logic from InteractiveWeatherMap
  const getAlertsForState = (stateCode: string): WeatherAlert[] => {
    const stateNames: Record<string, string> = Object.fromEntries(
      Object.entries(US_STATES).map(([code, data]) => [code, data.name])
    );

    return alerts.filter((alert: WeatherAlert) => {
      const location = alert.location?.toLowerCase() || '';
      const title = alert.title?.toLowerCase() || '';
      const description = alert.description?.toLowerCase() || '';
      const combined = `${location} ${title} ${description}`;

      // Enhanced state matching - same logic as your working version
      const stateCode2 = stateCode.toLowerCase();
      const stateName = stateNames[stateCode]?.toLowerCase() || '';

      // Direct state code match
      if (combined.includes(stateCode2)) return true;
      if (combined.includes(` ${stateCode2} `) || combined.includes(` ${stateCode2},`)) return true;

      // Full state name match
      if (stateName && combined.includes(stateName)) return true;

      // Specific state pattern matching (like your working version)
      const statePatterns: Record<string, string[]> = {
        'NC': ['north carolina', 'outer banks', 'cape hatteras', 'dare county', 'currituck'],
        'VA': ['virginia', 'chesapeake bay', 'virginia beach'],
        'CA': ['california', 'los angeles', 'san diego', 'san francisco', 'coachella valley'],
        'NY': ['new york', 'long island', 'suffolk', 'nassau'],
        'FL': ['florida', 'miami', 'tampa', 'orlando', 'keys'],
        'TX': ['texas', 'houston', 'dallas', 'austin', 'san antonio'],
        'WA': ['washington', 'seattle', 'spokane', 'tacoma'],
        'OR': ['oregon', 'portland', 'eugene']
      };

      const patterns = statePatterns[stateCode] || [];
      return patterns.some(pattern => combined.includes(pattern));
    });
  };

  // Group alerts by state using exact logic from your working InteractiveWeatherMap
  const statesWithAlerts = alerts.reduce((acc: Record<string, WeatherAlert[]>, alert: WeatherAlert) => {
    // Extract state from location or title/description using robust approach
    const stateMatch = alert.location?.match(/\b([A-Z]{2})\b/);
    const titleStateMatch = alert.title?.match(/\b([A-Z]{2})\b/);
    const descriptionStateMatch = alert.description?.match(/\b([A-Z]{2})\b/);
    
    let state = stateMatch ? stateMatch[1] : null;
    if (!state && titleStateMatch) state = titleStateMatch[1];
    if (!state && descriptionStateMatch) state = descriptionStateMatch[1];

    if (state && US_STATES[state as keyof typeof US_STATES]) {
      if (!acc[state]) acc[state] = [];
      acc[state].push(alert);
    }
    return acc;
  }, {});

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
    if (!mapContainer.current || map.current) return;
    
    // Check for Mapbox token
    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      console.warn('VITE_MAPBOX_TOKEN not found');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Better looking style
        center: [-95.7129, 37.0902],
        zoom: 4
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('✓ Mapbox map loaded successfully');
        setInitialized(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
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

    // Show state-level markers like your working overview
    const stateMarkers = Object.entries(statesWithAlerts).map(([stateCode, stateAlerts]) => {
      const stateData = US_STATES[stateCode as keyof typeof US_STATES];
      if (!stateData) return null;

      const alertCount = (stateAlerts as WeatherAlert[]).length;
      const coords: [number, number] = [stateData.coords[0], stateData.coords[1]];
      
      // Brand colors with glow effect matching your design
      const getStateAlertColor = (count: number): string => {
        if (count >= 15) return '#DC2626'; // Bright red for severe
        if (count >= 10) return '#EA580C'; // Red-orange  
        if (count >= 5) return '#F97316';  // Orange
        if (count >= 2) return '#F59E0B';  // Amber
        return '#EAB308'; // Yellow for few alerts
      };

      const color = getStateAlertColor(alertCount);

      // Create glowing state marker matching your brand
      const el = document.createElement('div');
      el.className = 'state-alert-marker';
      el.style.width = '60px';
      el.style.height = '48px';
      el.style.borderRadius = '8px';
      el.style.backgroundColor = color;
      el.style.border = '2px solid rgba(255,255,255,0.9)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.flexDirection = 'column';
      el.style.fontSize = '11px';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';
      el.style.cursor = 'pointer';
      el.style.textShadow = '0 1px 2px rgba(0,0,0,0.8)';
      el.style.boxShadow = `0 0 20px ${color}80, 0 4px 12px rgba(0,0,0,0.5)`;
      el.style.filter = 'brightness(1.1)';
      el.innerHTML = `
        <div style="font-size: 11px; line-height: 1; font-weight: 900;">${stateCode}</div>
        <div style="font-size: 14px; line-height: 1; font-weight: 900;">${alertCount}</div>
        <div style="font-size: 9px; line-height: 1; opacity: 0.9;">alerts</div>
      `;

      // Create popup showing state details
      const statePopupContent = `
        <div style="padding: 12px; max-width: 300px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <strong style="color: #1f2937; font-size: 16px;">${stateData.name} (${stateCode})</strong>
          </div>
          <div style="margin-bottom: 8px; padding: 4px 8px; background: ${color}; color: white; border-radius: 4px; font-size: 14px; text-align: center;">
            ${alertCount} Active Alerts
          </div>
          <div style="max-height: 200px; overflow-y: auto;">
            ${(stateAlerts as WeatherAlert[]).slice(0, 5).map((alert: WeatherAlert) => `
              <div style="margin-bottom: 6px; padding: 6px; border-left: 3px solid ${getSeverityColor(alert.severity)}; background: #f9fafb;">
                <div style="font-weight: bold; font-size: 12px; color: #374151;">${alert.event}</div>
                <div style="font-size: 11px; color: #6b7280;">${alert.severity} • ${alert.urgency}</div>
              </div>
            `).join('')}
            ${(stateAlerts as WeatherAlert[]).length > 5 ? `<div style="text-align: center; color: #6b7280; font-size: 11px; margin-top: 6px;">... and ${(stateAlerts as WeatherAlert[]).length - 5} more alerts</div>` : ''}
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup({ maxWidth: '320px' }).setHTML(statePopupContent))
        .addTo(map.current!);

      return marker;
    }).filter(Boolean) as mapboxgl.Marker[];

    weatherMarkersRef.current = stateMarkers;
    console.log(`✓ Added ${stateMarkers.length} state alert markers to map (matching your state overview)`);
  };

  const getCoordinatesForAlert = (alert: WeatherAlert): [number, number] => {
    // For state-based markers, use state center coordinates
    return [-95.7129, 37.0902]; // Center US fallback
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
              <Badge variant="secondary" className="bg-red-600 text-white">
                {alerts.length} Warnings/Watches
              </Badge>
              <Badge variant="outline" className="text-orange-400 border-orange-400 text-xs">
                {Object.keys(statesWithAlerts).length} States
              </Badge>
              <Badge variant="outline" className="text-gray-400 border-gray-400 text-xs">
                {rawAlerts.length - alerts.length} Advisories Filtered
              </Badge>
              <div className="flex items-center gap-1">
                <Switch 
                  checked={showAlerts} 
                  onCheckedChange={setShowAlerts}
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