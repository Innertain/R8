import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
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
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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

interface MapboxWeatherMapProps {
  className?: string;
}

const MapboxWeatherMap: React.FC<MapboxWeatherMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [showWeatherLayer, setShowWeatherLayer] = useState(true);
  const [loading, setLoading] = useState(true);

  // Weather event type mapping to icons and colors
  const getWeatherIcon = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('tornado')) return <Zap className="w-4 h-4" />;
    if (type.includes('severe thunderstorm') || type.includes('storm')) return <CloudRain className="w-4 h-4" />;
    if (type.includes('flood') || type.includes('flash flood')) return <CloudRain className="w-4 h-4" />;
    if (type.includes('winter') || type.includes('snow') || type.includes('ice')) return <Snowflake className="w-4 h-4" />;
    if (type.includes('wind') || type.includes('gale')) return <Wind className="w-4 h-4" />;
    if (type.includes('heat') || type.includes('fire')) return <Sun className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getWeatherColor = (eventType: string, severity: string) => {
    const sev = severity.toLowerCase();
    if (sev.includes('extreme')) return '#8B0000'; // Dark red
    if (sev.includes('severe')) return '#DC2626'; // Red
    if (sev.includes('moderate')) return '#F59E0B'; // Amber
    if (sev.includes('minor')) return '#3B82F6'; // Blue
    return '#6B7280'; // Gray
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      console.error('Mapbox token not found');
      setLoading(false);
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Using light style for better contrast
        center: [-98.5795, 39.8283], // Center of US
        zoom: 4
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        setLoading(false);
        loadWeatherData();
      });

      map.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
        setLoading(false);
      });

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
    try {
      const response = await fetch('/api/weather-alerts');
      const data = await response.json();
      
      if (data.success && data.alerts) {
        setWeatherAlerts(data.alerts);
        addWeatherAlertsToMap(data.alerts);
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
  };

  // Add weather alerts to map
  const addWeatherAlertsToMap = (alerts: WeatherAlert[]) => {
    if (!map.current) return;

    // Create GeoJSON data for alerts
    const alertsGeoJSON = {
      type: 'FeatureCollection' as const,
      features: alerts.slice(0, 200).map((alert, index) => {
        // Generate realistic US coordinates based on alert area
        const coords = generateCoordinatesFromArea(alert.areaDesc);
        
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: coords
          },
          properties: {
            id: alert.id,
            title: alert.title,
            event: alert.event,
            severity: alert.severity,
            description: alert.description,
            areaDesc: alert.areaDesc,
            urgency: alert.urgency,
            effective: alert.effective,
            expires: alert.expires
          }
        };
      })
    };

    // Add source
    if (map.current.getSource('weather-alerts')) {
      (map.current.getSource('weather-alerts') as mapboxgl.GeoJSONSource).setData(alertsGeoJSON);
    } else {
      map.current.addSource('weather-alerts', {
        type: 'geojson',
        data: alertsGeoJSON,
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50
      });
    }

    // Add cluster layer
    if (!map.current.getLayer('weather-alerts-clusters')) {
      map.current.addLayer({
        id: 'weather-alerts-clusters',
        type: 'circle',
        source: 'weather-alerts',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#F59E0B', 20,
            '#DC2626', 100,
            '#8B0000'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 100, 30, 750, 40
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add cluster count labels
      map.current.addLayer({
        id: 'weather-alerts-cluster-count',
        type: 'symbol',
        source: 'weather-alerts',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });
    }

    // Add individual alert points
    if (!map.current.getLayer('weather-alerts-points')) {
      map.current.addLayer({
        id: 'weather-alerts-points',
        type: 'circle',
        source: 'weather-alerts',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'severity'], 'Extreme'], '#8B0000',
            ['==', ['get', 'severity'], 'Severe'], '#DC2626',
            ['==', ['get', 'severity'], 'Moderate'], '#F59E0B',
            ['==', ['get', 'severity'], 'Minor'], '#3B82F6',
            '#6B7280'
          ],
          'circle-radius': [
            'case',
            ['==', ['get', 'severity'], 'Extreme'], 12,
            ['==', ['get', 'severity'], 'Severe'], 10,
            8
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });
    }

    // Add click handlers
    map.current.on('click', 'weather-alerts-clusters', (e: any) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['weather-alerts-clusters']
      });

      const clusterId = features[0].properties!.cluster_id;
      (map.current!.getSource('weather-alerts') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err: any, zoom: any) => {
          if (err) return;

          map.current!.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        }
      );
    });

    map.current.on('click', 'weather-alerts-points', (e: any) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const properties = feature.properties!;
        const coordinates = (feature.geometry as any).coordinates.slice();

        // Find the full alert data
        const alert = alerts.find(a => a.id === properties.id);
        if (alert) {
          setSelectedAlert(alert);
          
          // Show popup
          if (popup.current) {
            popup.current.remove();
          }

          popup.current = new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-3">
                <div class="font-bold text-sm mb-1">${alert.event}</div>
                <div class="text-xs text-gray-600 mb-2">${alert.areaDesc}</div>
                <div class="text-xs">
                  <span class="inline-block px-2 py-1 bg-${getWeatherColor(alert.event, alert.severity).replace('#', '')}-100 text-${getWeatherColor(alert.event, alert.severity).replace('#', '')}-800 rounded">
                    ${alert.severity}
                  </span>
                </div>
              </div>
            `)
            .addTo(map.current!);
        }
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'weather-alerts-clusters', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseenter', 'weather-alerts-points', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'weather-alerts-clusters', () => {
      map.current!.getCanvas().style.cursor = '';
    });

    map.current.on('mouseleave', 'weather-alerts-points', () => {
      map.current!.getCanvas().style.cursor = '';
    });
  };

  // Generate realistic coordinates from area description
  const generateCoordinatesFromArea = (areaDesc: string): [number, number] => {
    // Simple mapping of common areas to approximate coordinates
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

    // Check if area description contains a known state
    for (const [state, coords] of Object.entries(areaCoords)) {
      if (areaDesc.includes(state)) {
        // Add some random offset for variety
        return [
          coords[0] + (Math.random() - 0.5) * 4,
          coords[1] + (Math.random() - 0.5) * 2
        ];
      }
    }

    // Default to random US coordinates
    return [
      -125 + Math.random() * 50, // US longitude range
      25 + Math.random() * 25    // US latitude range
    ];
  };

  // Toggle weather layer visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const visibility = showWeatherLayer ? 'visible' : 'none';
    
    if (map.current.getLayer('weather-alerts-clusters')) {
      map.current.setLayoutProperty('weather-alerts-clusters', 'visibility', visibility);
    }
    if (map.current.getLayer('weather-alerts-cluster-count')) {
      map.current.setLayoutProperty('weather-alerts-cluster-count', 'visibility', visibility);
    }
    if (map.current.getLayer('weather-alerts-points')) {
      map.current.setLayoutProperty('weather-alerts-points', 'visibility', visibility);
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
          <p className="text-gray-600">Loading weather map...</p>
        </div>
      </div>
    );
  }

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-600">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Mapbox Token Required</h3>
          <p className="max-w-md">
            Please add your VITE_MAPBOX_TOKEN to the environment variables to display the interactive weather map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
      
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
          <div className="text-sm font-semibold mb-3">Alert Severity</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-800 rounded-full"></div>
              <span>Extreme Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Severe Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Moderate Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Minor Risk</span>
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
                  {getWeatherIcon(selectedAlert.event)}
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
                onClick={() => {
                  setSelectedAlert(null);
                  popup.current?.remove();
                }}
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
                View on Map
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

export default MapboxWeatherMap;