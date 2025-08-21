import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CloudRain, Activity, Layers } from 'lucide-react';
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
}

const WorkingMapboxWeatherMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const weatherMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Use the same query as InteractiveWeatherMap
  const { data: response } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  const alerts = (response as any)?.alerts || [];

  useEffect(() => {
    if (!mapContainer.current || map.current || !import.meta.env.VITE_MAPBOX_TOKEN) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-95.7129, 37.0902],
        zoom: 4
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setInitialized(true);
        addWeatherAlerts();
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
    if (initialized && alerts.length > 0) {
      addWeatherAlerts();
    }
  }, [alerts, initialized]);

  const addWeatherAlerts = () => {
    if (!map.current || !alerts.length) return;

    // Clear existing markers
    weatherMarkersRef.current.forEach(marker => marker.remove());
    weatherMarkersRef.current = [];

    alerts.slice(0, 100).forEach((alert: WeatherAlert) => {
      const coords = getCoordinatesFromLocation(alert.location || alert.title);
      const icon = getWeatherIcon(alert.event || alert.title);
      const color = getSeverityColor(alert.severity);

      // Create marker element
      const el = document.createElement('div');
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '14px';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.innerHTML = icon;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([coords[0], coords[1]])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 16px;">${icon}</span>
              ${alert.event || 'Weather Alert'}
            </h3>
            <p style="margin: 0 0 6px 0; color: #666; font-size: 12px;">${alert.location}</p>
            <div style="padding: 3px 6px; background: ${color}; color: white; border-radius: 3px; font-size: 11px; display: inline-block; margin-bottom: 6px;">
              ${alert.severity} • ${alert.urgency}
            </div>
            <p style="margin: 0; font-size: 12px; line-height: 1.3;">
              ${alert.description.substring(0, 150)}${alert.description.length > 150 ? '...' : ''}
            </p>
          </div>
        `))
        .addTo(map.current!);

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
    // State coordinates mapping
    const stateCoords: Record<string, [number, number]> = {
      'Alabama': [-86.79113, 32.377716], 'Alaska': [-152.404419, 64.0685], 'Arizona': [-111.093731, 34.048927],
      'Arkansas': [-92.373123, 34.736009], 'California': [-119.681564, 36.116203], 'Colorado': [-105.311104, 39.059811],
      'Connecticut': [-72.755371, 41.767], 'Delaware': [-75.526755, 39.161921], 'Florida': [-81.686783, 27.766279],
      'Georgia': [-83.441162, 32.157435], 'Hawaii': [-157.826182, 21.30895], 'Idaho': [-114.478828, 44.240459],
      'Illinois': [-88.986137, 40.192138], 'Indiana': [-86.147685, 40.790798], 'Iowa': [-93.620866, 42.032974],
      'Kansas': [-98.484246, 39.04], 'Kentucky': [-84.86311, 37.522], 'Louisiana': [-91.953125, 31.244823],
      'Maine': [-69.765261, 44.323535], 'Maryland': [-76.501157, 39.045755], 'Massachusetts': [-71.530106, 42.407211],
      'Michigan': [-84.5467, 44.182205], 'Minnesota': [-94.636230, 46.729553], 'Mississippi': [-89.678696, 32.741646],
      'Missouri': [-91.831833, 38.572954], 'Montana': [-110.454353, 47.052166], 'Nebraska': [-99.901813, 41.492537],
      'Nevada': [-116.419389, 38.313515], 'New Hampshire': [-71.549709, 43.452492], 'New Jersey': [-74.756138, 40.221741],
      'New Mexico': [-106.248482, 34.307144], 'New York': [-74.948051, 42.165726], 'North Carolina': [-79.806419, 35.759573],
      'North Dakota': [-101.002012, 47.551493], 'Ohio': [-82.764915, 40.269789], 'Oklahoma': [-97.534994, 35.482309],
      'Oregon': [-120.767635, 43.804133], 'Pennsylvania': [-77.209755, 40.269789], 'Rhode Island': [-71.422132, 41.82355],
      'South Carolina': [-81.035, 33.836081], 'South Dakota': [-99.901813, 44.299782], 'Tennessee': [-86.784, 35.860119],
      'Texas': [-97.563461, 31.054487], 'Utah': [-111.892622, 39.419220], 'Vermont': [-72.580536, 44.26639],
      'Virginia': [-78.169968, 37.54], 'Washington': [-121.490494, 47.042418], 'West Virginia': [-80.954570, 38.349497],
      'Wisconsin': [-89.616508, 44.268543], 'Wyoming': [-107.30249, 43.075968]
    };

    // Find state in location
    for (const [state, coords] of Object.entries(stateCoords)) {
      if (location.includes(state)) {
        return [
          coords[0] + (Math.random() - 0.5) * 2,
          coords[1] + (Math.random() - 0.5) * 1
        ];
      }
    }

    return [-95 + (Math.random() - 0.5) * 40, 37 + (Math.random() - 0.5) * 20];
  };

  const toggleAlerts = (show: boolean) => {
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
          <h3 className="text-lg font-bold text-red-600 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600">Please add VITE_MAPBOX_TOKEN to your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Controls */}
      <Card className="absolute top-4 left-4 w-64 bg-white/95 backdrop-blur z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium text-sm">Weather Alerts</div>
                <div className="text-xs text-gray-500">{alerts.length} active</div>
              </div>
            </div>
            <Switch checked={showAlerts} onCheckedChange={toggleAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="absolute top-4 right-4 w-40 bg-white/95 backdrop-blur z-10">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              {initialized ? 'Live Data' : 'Loading...'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="absolute bottom-4 right-4 w-36 bg-white/95 backdrop-blur z-10">
        <CardContent className="p-3">
          <div className="text-xs font-semibold mb-2">Alert Icons</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1">
              <span>🌪️</span><span>Tornado</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⛈️</span><span>Storm</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌊</span><span>Flood</span>
            </div>
            <div className="flex items-center gap-1">
              <span>❄️</span><span>Winter</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔥</span><span>Heat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkingMapboxWeatherMap;