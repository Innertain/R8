import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CloudRain, Activity } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox token immediately
if (import.meta.env.VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
}

interface SimpleMapboxMapProps {
  className?: string;
}

const SimpleMapboxMap: React.FC<SimpleMapboxMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Initialize map
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-95.7129, 37.0902],
        zoom: 4.5
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully');
        setInitialized(true);
        
        // Load weather alerts immediately
        addWeatherAlerts();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

    } catch (error) {
      console.error('Failed to create map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Store weather markers for toggling
  const weatherMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const addWeatherAlerts = async () => {
    if (!map.current || !initialized) return;

    try {
      console.log('🌐 Fetching weather alerts from RSS feeds...');
      const response = await fetch('/api/weather-alerts-rss');
      const data = await response.json();
      
      console.log('📊 Weather alerts received:', data.alerts?.length || 0, 'alerts');
      console.log('📋 Sample alert:', data.alerts?.[0]);

      if (data.success && data.alerts && data.alerts.length > 0) {
        console.log('✅ Processing', data.alerts.length, 'weather alerts');
        setAlertCount(data.alerts.length);

        // Create features from NWS alerts - match the InteractiveWeatherMap structure
        const features = data.alerts.slice(0, 100).map((alert: any, index: number) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: getCoordinatesForAlert(alert.title || alert.event || alert.areaDesc)
          },
          properties: {
            title: alert.title || alert.event || 'Weather Alert',
            description: alert.description || alert.summary || '',
            severity: alert.severity || 'Moderate',
            area: alert.location || alert.areaDesc || '',
            event: alert.event || 'Weather Alert',
            urgency: alert.urgency || 'Unknown'
          }
        }));

        const geojson: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features
        };

        console.log('Sample feature coordinates:', features[0]?.geometry.coordinates);
        console.log('Sample feature properties:', features[0]?.properties);

        // Add weather markers with proper icons
        console.log('Creating weather markers with event-specific icons');
        
        // Clear existing markers
        weatherMarkersRef.current.forEach(marker => marker.remove());
        weatherMarkersRef.current = [];

        features.forEach((feature: any, index: number) => {
          const coords = feature.geometry.coordinates;
          const props = feature.properties;
          
          // Get weather icon and color
          const icon = getWeatherIcon(props.event || props.title);
          const color = getSeverityColor(props.severity);
          
          // Create custom HTML marker
          const el = document.createElement('div');
          el.style.width = '32px';
          el.style.height = '32px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = color;
          el.style.border = '3px solid white';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.fontSize = '14px';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
          el.innerHTML = icon;
          el.title = `${props.event || props.title} - ${props.severity}`;
          
          // Create marker with popup
          const marker = new mapboxgl.Marker(el)
            .setLngLat([coords[0], coords[1]])
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div style="padding: 12px; max-width: 280px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">${icon}</span>
                  ${props.event || props.title}
                </h3>
                <p style="margin: 0 0 6px 0; color: #666; font-size: 12px;">${props.area}</p>
                <div style="padding: 4px 8px; background: ${color}; color: white; border-radius: 4px; font-size: 12px; display: inline-block; margin-bottom: 8px;">
                  ${props.severity} • ${props.urgency}
                </div>
                <p style="margin: 0; font-size: 13px; line-height: 1.4;">
                  ${props.description.substring(0, 200)}${props.description.length > 200 ? '...' : ''}
                </p>
              </div>
            `))
            .addTo(map.current!);
            
          weatherMarkersRef.current.push(marker);
        });
        
        console.log('✓', features.length, 'weather alert markers with icons added to map');
      } else {
        console.error('❌ No weather alerts found or API call failed');
        setAlertCount(0);
      }
    } catch (error) {
      console.error('❌ Error loading weather alerts:', error);
      setAlertCount(0);
    }
  };

  const getWeatherIcon = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('tornado')) return '🌪️';
    if (type.includes('severe thunderstorm') || type.includes('thunderstorm')) return '⛈️';
    if (type.includes('flood') || type.includes('flash flood')) return '🌊';
    if (type.includes('winter') || type.includes('snow') || type.includes('ice') || type.includes('blizzard')) return '❄️';
    if (type.includes('wind') || type.includes('gale')) return '💨';
    if (type.includes('heat') || type.includes('fire') || type.includes('excessive heat')) return '🔥';
    if (type.includes('hurricane') || type.includes('tropical storm')) return '🌀';
    if (type.includes('dense fog') || type.includes('fog')) return '🌫️';
    if (type.includes('dust storm') || type.includes('dust')) return '🌪️';
    if (type.includes('coastal flood') || type.includes('storm surge')) return '🌊';
    return '⚠️';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return '#8B0000';
      case 'Severe': return '#DC2626';
      case 'Moderate': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const getCoordinatesForAlert = (areaDesc: string): [number, number] => {
    // Simple state to coordinates mapping
    const stateCoords: Record<string, [number, number]> = {
      'Alabama': [-86.79113, 32.377716],
      'Alaska': [-152.404419, 64.0685],
      'Arizona': [-111.093731, 34.048927],
      'Arkansas': [-92.373123, 34.736009],
      'California': [-119.681564, 36.116203],
      'Colorado': [-105.311104, 39.059811],
      'Connecticut': [-72.755371, 41.767],
      'Delaware': [-75.526755, 39.161921],
      'Florida': [-81.686783, 27.766279],
      'Georgia': [-83.441162, 32.157435],
      'Hawaii': [-157.826182, 21.30895],
      'Idaho': [-114.478828, 44.240459],
      'Illinois': [-88.986137, 40.192138],
      'Indiana': [-86.147685, 40.790798],
      'Iowa': [-93.620866, 42.032974],
      'Kansas': [-98.484246, 39.04],
      'Kentucky': [-84.86311, 37.522],
      'Louisiana': [-91.953125, 31.244823],
      'Maine': [-69.765261, 44.323535],
      'Maryland': [-76.501157, 39.045755],
      'Massachusetts': [-71.530106, 42.407211],
      'Michigan': [-84.5467, 44.182205],
      'Minnesota': [-94.636230, 46.729553],
      'Mississippi': [-89.678696, 32.741646],
      'Missouri': [-91.831833, 38.572954],
      'Montana': [-110.454353, 47.052166],
      'Nebraska': [-99.901813, 41.492537],
      'Nevada': [-116.419389, 38.313515],
      'New Hampshire': [-71.549709, 43.452492],
      'New Jersey': [-74.756138, 40.221741],
      'New Mexico': [-106.248482, 34.307144],
      'New York': [-74.948051, 42.165726],
      'North Carolina': [-79.806419, 35.759573],
      'North Dakota': [-101.002012, 47.551493],
      'Ohio': [-82.764915, 40.269789],
      'Oklahoma': [-97.534994, 35.482309],
      'Oregon': [-120.767635, 43.804133],
      'Pennsylvania': [-77.209755, 40.269789],
      'Rhode Island': [-71.422132, 41.82355],
      'South Carolina': [-81.035, 33.836081],
      'South Dakota': [-99.901813, 44.299782],
      'Tennessee': [-86.784, 35.860119],
      'Texas': [-97.563461, 31.054487],
      'Utah': [-111.892622, 39.419220],
      'Vermont': [-72.580536, 44.26639],
      'Virginia': [-78.169968, 37.54],
      'Washington': [-121.490494, 47.042418],
      'West Virginia': [-80.954570, 38.349497],
      'Wisconsin': [-89.616508, 44.268543],
      'Wyoming': [-107.30249, 43.075968]
    };

    // Find state in area description
    for (const [state, coords] of Object.entries(stateCoords)) {
      if (areaDesc.includes(state)) {
        // Add small random offset
        return [
          coords[0] + (Math.random() - 0.5) * 2,
          coords[1] + (Math.random() - 0.5) * 1
        ];
      }
    }

    // Default to center US with random offset
    return [-95 + (Math.random() - 0.5) * 40, 37 + (Math.random() - 0.5) * 20];
  };

  const toggleAlerts = (show: boolean) => {
    if (!weatherMarkersRef.current) return;
    
    weatherMarkersRef.current.forEach(marker => {
      if (show) {
        marker.addTo(map.current!);
      } else {
        marker.remove();
      }
    });
    setShowAlerts(show);
  };

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-bold text-red-600 mb-2">Mapbox Token Missing</h3>
          <p className="text-gray-600">Please add VITE_MAPBOX_TOKEN to your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Simple Controls */}
      <Card className="absolute top-4 left-4 w-64 bg-white/90 backdrop-blur z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium text-sm">Weather Alerts</div>
                <div className="text-xs text-gray-500">{alertCount} active</div>
              </div>
            </div>
            <Switch checked={showAlerts} onCheckedChange={toggleAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="absolute top-4 right-4 w-48 bg-white/90 backdrop-blur z-10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              {initialized ? 'Map Loaded' : 'Loading...'}
            </span>
          </div>
          {alertCount > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Showing {showAlerts ? alertCount : 0} alerts
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="absolute bottom-4 right-4 w-40 bg-white/90 backdrop-blur z-10">
        <CardContent className="p-3">
          <div className="text-xs font-semibold mb-2">Severity</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-800 rounded-full"></div>
              <span>Extreme</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Severe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Minor</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleMapboxMap;