import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  CloudRain, 
  Zap, 
  Wind, 
  Snowflake, 
  Sun, 
  AlertTriangle,
  Layers,
  X,
  MapPin,
  Activity
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  event: string;
  areaDesc: string;
  urgency: string;
  certainty: string;
  effective: string;
  expires: string;
}

interface LeafletWeatherMapProps {
  className?: string;
}

const LeafletWeatherMap: React.FC<LeafletWeatherMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [showWeatherLayer, setShowWeatherLayer] = useState(true);
  const [loading, setLoading] = useState(true);

  // Weather event type mapping to colors
  const getWeatherColor = (eventType: string, severity: string) => {
    const sev = severity.toLowerCase();
    if (sev.includes('extreme')) return '#8B0000'; // Dark red
    if (sev.includes('severe')) return '#DC2626'; // Red
    if (sev.includes('moderate')) return '#F59E0B'; // Amber
    if (sev.includes('minor')) return '#3B82F6'; // Blue
    return '#6B7280'; // Gray
  };

  const getWeatherIcon = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('tornado')) return '🌪️';
    if (type.includes('severe thunderstorm') || type.includes('storm')) return '⛈️';
    if (type.includes('flood') || type.includes('flash flood')) return '🌊';
    if (type.includes('winter') || type.includes('snow') || type.includes('ice')) return '❄️';
    if (type.includes('wind') || type.includes('gale')) return '💨';
    if (type.includes('heat') || type.includes('fire')) return '🔥';
    return '⚠️';
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('Initializing Leaflet map...');

    try {
      // Create Leaflet map
      map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map.current);

      // Create markers layer
      markersLayer.current = L.layerGroup().addTo(map.current);

      console.log('Leaflet map created successfully!');
      setMapLoaded(true);
      setLoading(false);
      loadWeatherData();

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Load weather alert data
  const loadWeatherData = async () => {
    console.log('Loading weather data...');
    try {
      const response = await fetch('/api/weather-alerts');
      const data = await response.json();
      
      console.log('Weather data received:', data.alerts?.length || 0, 'alerts');
      
      if (data.success && data.alerts) {
        setWeatherAlerts(data.alerts);
        addWeatherAlertsToMap(data.alerts);
      } else {
        console.log('No weather alerts found');
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
  };

  // Add weather alerts to map
  const addWeatherAlertsToMap = (alerts: WeatherAlert[]) => {
    if (!map.current || !markersLayer.current) return;

    // Clear existing markers
    markersLayer.current.clearLayers();

    console.log('Adding', alerts.length, 'weather alerts to map');

    alerts.slice(0, 100).forEach((alert, index) => {
      const coords = generateCoordinatesFromArea(alert.areaDesc);
      const color = getWeatherColor(alert.event, alert.severity);
      const emoji = getWeatherIcon(alert.event);

      // Create custom icon
      const customIcon = L.divIcon({
        html: `<div style="
          background-color: ${color}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 2px solid white; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${emoji}</div>`,
        className: 'custom-weather-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      // Create marker
      const marker = L.marker([coords[1], coords[0]], { icon: customIcon });
      
      // Add popup
      marker.bindPopup(`
        <div class="p-3 max-w-xs">
          <div class="font-bold text-sm mb-1">${alert.event}</div>
          <div class="text-xs text-gray-600 mb-2">${alert.areaDesc}</div>
          <div class="text-xs mb-2">${alert.description.substring(0, 100)}...</div>
          <div class="flex items-center gap-2">
            <span class="inline-block px-2 py-1 text-xs rounded" style="background-color: ${color}20; color: ${color};">
              ${alert.severity}
            </span>
            <span class="text-xs text-gray-500">${alert.urgency}</span>
          </div>
          <button onclick="window.showAlertDetails('${alert.id}')" class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
            View Details
          </button>
        </div>
      `);

      // Add click handler
      marker.on('click', () => {
        setSelectedAlert(alert);
      });

      markersLayer.current!.addLayer(marker);
    });

    console.log('Weather alerts added to map successfully');
  };

  // Generate realistic coordinates from area description
  const generateCoordinatesFromArea = (areaDesc: string): [number, number] => {
    const areaCoords: Record<string, [number, number]> = {
      'California': [-119.4179, 36.7783],
      'Texas': [-99.9018, 31.9686],
      'Florida': [-81.5158, 27.6648],
      'New York': [-74.0060, 40.7128],
      'Illinois': [-89.3985, 40.6331],
      'Pennsylvania': [-77.1945, 40.2732],
      'Ohio': [-82.7649, 40.3888],
      'Georgia': [-83.2572, 32.1656],
      'North Carolina': [-78.6569, 35.7596],
      'Michigan': [-84.5555, 44.3467],
      'New Jersey': [-74.7429, 40.0583],
      'Virginia': [-78.6569, 37.4316],
      'Washington': [-120.7401, 47.7511],
      'Arizona': [-111.0937, 34.0489],
      'Massachusetts': [-71.0942, 42.2373],
      'Tennessee': [-86.7816, 35.7796],
      'Indiana': [-86.1349, 40.2732],
      'Maryland': [-76.5019, 39.0458],
      'Missouri': [-91.8318, 38.5767],
      'Wisconsin': [-89.6165, 43.7844]
    };

    for (const [state, coords] of Object.entries(areaCoords)) {
      if (areaDesc.includes(state)) {
        return [
          coords[0] + (Math.random() - 0.5) * 4,
          coords[1] + (Math.random() - 0.5) * 2
        ];
      }
    }

    return [
      -125 + Math.random() * 50,
      25 + Math.random() * 25
    ];
  };

  // Toggle weather layer visibility
  useEffect(() => {
    if (!map.current || !markersLayer.current || !mapLoaded) return;

    if (showWeatherLayer) {
      map.current.addLayer(markersLayer.current);
    } else {
      map.current.removeLayer(markersLayer.current);
    }
  }, [showWeatherLayer, mapLoaded]);

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

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interactive weather map...</p>
          <p className="text-sm text-gray-500 mt-2">Using OpenStreetMap with Leaflet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full z-0" />
      
      {/* Layer Controls */}
      <Card className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-sm shadow-lg z-10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="w-5 h-5" />
            Weather Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Weather Alerts</div>
                <div className="text-xs text-gray-500">
                  {weatherAlerts.length} active alerts
                </div>
              </div>
            </div>
            <Switch
              checked={showWeatherLayer}
              onCheckedChange={setShowWeatherLayer}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Panel */}
      <Card className="absolute top-4 right-4 w-64 bg-white/95 backdrop-blur-sm shadow-lg z-10">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Live Weather Data</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Alerts:</span>
              <span className="font-medium">{weatherAlerts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Extreme:</span>
              <span className="font-medium text-red-600">
                {weatherAlerts.filter(a => a.severity === 'Extreme').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Severe:</span>
              <span className="font-medium text-red-500">
                {weatherAlerts.filter(a => a.severity === 'Severe').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Moderate:</span>
              <span className="font-medium text-yellow-600">
                {weatherAlerts.filter(a => a.severity === 'Moderate').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="absolute bottom-4 right-4 w-56 bg-white/95 backdrop-blur-sm shadow-lg z-10">
        <CardContent className="pt-4">
          <div className="text-sm font-semibold mb-3">Weather Alert Icons</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🌪️</span>
              <span>Tornado Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">⛈️</span>
              <span>Severe Thunderstorm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🌊</span>
              <span>Flood Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">❄️</span>
              <span>Winter Weather</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">💨</span>
              <span>High Wind</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <span>Heat/Fire Warning</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
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
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Area</div>
              <div className="text-sm text-gray-900">{selectedAlert.areaDesc}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
              <div className="text-sm text-gray-900 leading-relaxed">
                {selectedAlert.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-gray-700">Effective</div>
                <div className="text-gray-900">
                  {new Date(selectedAlert.effective).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Expires</div>
                <div className="text-gray-900">
                  {new Date(selectedAlert.expires).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MapPin className="w-4 h-4 mr-1" />
                Zoom to Location
              </Button>
              <Button size="sm" className="flex-1">
                Get Updates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeafletWeatherMap;