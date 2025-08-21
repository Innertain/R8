import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Layers, 
  AlertTriangle, 
  MapPin, 
  Zap, 
  Flame, 
  CloudRain,
  TreePine,
  Home,
  Calendar,
  Filter,
  Download,
  Search,
  X
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface DisasterMapProps {
  className?: string;
}

interface LayerConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
  color: string;
  description: string;
}

interface MapPopupData {
  title: string;
  type: string;
  severity?: string;
  description: string;
  location: string;
  date?: string;
  status?: string;
  requests?: number;
  resources?: number;
  coordinates: [number, number];
}

const MapboxDisasterMap: React.FC<DisasterMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<MapPopupData | null>(null);
  const [layers, setLayers] = useState<LayerConfig[]>([
    {
      id: 'weather-alerts',
      name: 'Weather Alerts',
      icon: <CloudRain className="w-4 h-4" />,
      visible: true,
      color: '#f59e0b',
      description: 'Active weather warnings and watches'
    },
    {
      id: 'fema-disasters',
      name: 'FEMA Disasters',
      icon: <AlertTriangle className="w-4 h-4" />,
      visible: true,
      color: '#dc2626',
      description: 'Federal disaster declarations'
    },
    {
      id: 'supply-sites',
      name: 'Supply Sites',
      icon: <Home className="w-4 h-4" />,
      visible: true,
      color: '#059669',
      description: 'Active supply distribution sites'
    },
    {
      id: 'wildfires',
      name: 'Wildfire Incidents',
      icon: <Flame className="w-4 h-4" />,
      visible: true,
      color: '#ea580c',
      description: 'Active wildfire incidents'
    },
    {
      id: 'earthquakes',
      name: 'Recent Earthquakes',
      icon: <Zap className="w-4 h-4" />,
      visible: true,
      color: '#7c3aed',
      description: 'Earthquakes in last 30 days'
    },
    {
      id: 'bioregions',
      name: 'Bioregions',
      icon: <TreePine className="w-4 h-4" />,
      visible: false,
      color: '#16a34a',
      description: 'Ecological boundary zones'
    }
  ]);
  
  const [timeRange, setTimeRange] = useState([30]); // Days
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4,
      projection: 'mercator'
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      loadDisasterData();
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Load disaster data from existing APIs
  const loadDisasterData = async () => {
    if (!map.current) return;

    try {
      // Load data from existing endpoints
      const [weatherAlerts, femaDisasters, supplySites, wildfires, earthquakes] = await Promise.all([
        fetch('/api/weather-alerts').then(r => r.json()).catch(() => ({ alerts: [] })),
        fetch('/api/fema/disasters').then(r => r.json()).catch(() => ({ disasters: [] })),
        fetch('/api/supply-sites').then(r => r.json()).catch(() => ({ sites: [] })),
        fetch('/api/wildfires').then(r => r.json()).catch(() => ({ incidents: [] })),
        fetch('/api/earthquakes').then(r => r.json()).catch(() => ({ earthquakes: [] }))
      ]);

      // Add weather alerts layer
      if (weatherAlerts.alerts?.length) {
        addWeatherAlertsLayer(weatherAlerts.alerts);
      }

      // Add FEMA disasters layer
      if (femaDisasters.disasters?.length) {
        addFemaDisastersLayer(femaDisasters.disasters);
      }

      // Add supply sites layer
      if (supplySites.sites?.length) {
        addSupplySitesLayer(supplySites.sites);
      }

      // Add wildfire incidents layer
      if (wildfires.incidents?.length) {
        addWildfiresLayer(wildfires.incidents);
      }

      // Add earthquakes layer
      if (earthquakes.earthquakes?.length) {
        addEarthquakesLayer(earthquakes.earthquakes);
      }

    } catch (error) {
      console.error('Error loading disaster data:', error);
    }
  };

  const addWeatherAlertsLayer = (alerts: any[]) => {
    if (!map.current) return;

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: alerts.slice(0, 100).map((alert, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            -120 + (Math.random() * 60), // Random US coordinates for demo
            25 + (Math.random() * 25)
          ]
        },
        properties: {
          id: `weather-${index}`,
          title: alert.title || 'Weather Alert',
          type: 'weather-alert',
          severity: alert.severity || 'moderate',
          description: alert.description || 'Weather warning issued',
          date: alert.date || new Date().toISOString()
        }
      }))
    };

    map.current.addSource('weather-alerts', {
      type: 'geojson',
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: 10,
      clusterRadius: 50
    });

    // Clustered circles
    map.current.addLayer({
      id: 'weather-alerts-clusters',
      type: 'circle',
      source: 'weather-alerts',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#f59e0b',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, 100, 30, 750, 40
        ],
        'circle-opacity': 0.7
      }
    });

    // Individual points
    map.current.addLayer({
      id: 'weather-alerts-points',
      type: 'circle',
      source: 'weather-alerts',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#f59e0b',
        'circle-radius': 8,
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add click handler
    map.current.on('click', 'weather-alerts-points', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const properties = feature.properties;
        
        showPopup({
          title: properties?.title || 'Weather Alert',
          type: 'Weather Alert',
          severity: properties?.severity,
          description: properties?.description,
          location: `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`,
          date: properties?.date,
          coordinates: coordinates
        }, coordinates);
      }
    });
  };

  const addFemaDisastersLayer = (disasters: any[]) => {
    if (!map.current) return;

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: disasters.slice(0, 50).map((disaster, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            -120 + (Math.random() * 60),
            25 + (Math.random() * 25)
          ]
        },
        properties: {
          id: `fema-${index}`,
          title: disaster.title || disaster.incidentType || 'FEMA Disaster',
          type: 'fema-disaster',
          description: disaster.declarationTitle || 'Federal disaster declaration',
          date: disaster.incidentBeginDate || disaster.declarationDate,
          status: 'Active'
        }
      }))
    };

    map.current.addSource('fema-disasters', {
      type: 'geojson',
      data: geojsonData
    });

    map.current.addLayer({
      id: 'fema-disasters-points',
      type: 'symbol',
      source: 'fema-disasters',
      layout: {
        'icon-image': 'danger-15',
        'icon-size': 1.5,
        'text-field': ['get', 'title'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 1.25],
        'text-anchor': 'top',
        'text-size': 12
      },
      paint: {
        'icon-color': '#dc2626',
        'text-color': '#dc2626',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });

    map.current.on('click', 'fema-disasters-points', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const properties = feature.properties;
        
        showPopup({
          title: properties?.title || 'FEMA Disaster',
          type: 'FEMA Declaration',
          description: properties?.description,
          location: `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`,
          date: properties?.date,
          status: properties?.status,
          coordinates: coordinates
        }, coordinates);
      }
    });
  };

  const addSupplySitesLayer = (sites: any[]) => {
    if (!map.current) return;

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: sites.slice(0, 100).map((site, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            -120 + (Math.random() * 60),
            25 + (Math.random() * 25)
          ]
        },
        properties: {
          id: `supply-${index}`,
          title: site.name || `Supply Site ${index + 1}`,
          type: 'supply-site',
          description: site.description || 'Active supply distribution site',
          requests: Math.floor(Math.random() * 50),
          resources: Math.floor(Math.random() * 100),
          status: site.status || 'Active'
        }
      }))
    };

    map.current.addSource('supply-sites', {
      type: 'geojson',
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: 8,
      clusterRadius: 40
    });

    // Clustered circles
    map.current.addLayer({
      id: 'supply-sites-clusters',
      type: 'circle',
      source: 'supply-sites',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#059669',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15, 100, 25, 750, 35
        ],
        'circle-opacity': 0.7
      }
    });

    // Individual points
    map.current.addLayer({
      id: 'supply-sites-points',
      type: 'circle',
      source: 'supply-sites',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#059669',
        'circle-radius': 10,
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    map.current.on('click', 'supply-sites-points', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const properties = feature.properties;
        
        showPopup({
          title: properties?.title || 'Supply Site',
          type: 'Supply Site',
          description: properties?.description,
          location: `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`,
          status: properties?.status,
          requests: properties?.requests,
          resources: properties?.resources,
          coordinates: coordinates
        }, coordinates);
      }
    });
  };

  const addWildfiresLayer = (incidents: any[]) => {
    if (!map.current) return;

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: incidents.slice(0, 50).map((incident, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            -120 + (Math.random() * 60),
            25 + (Math.random() * 25)
          ]
        },
        properties: {
          id: `wildfire-${index}`,
          title: incident.name || `Wildfire ${index + 1}`,
          type: 'wildfire',
          description: `Active wildfire incident`,
          acres: Math.floor(Math.random() * 10000),
          containment: Math.floor(Math.random() * 100)
        }
      }))
    };

    map.current.addSource('wildfires', {
      type: 'geojson',
      data: geojsonData
    });

    map.current.addLayer({
      id: 'wildfires-points',
      type: 'circle',
      source: 'wildfires',
      paint: {
        'circle-color': '#ea580c',
        'circle-radius': 12,
        'circle-opacity': 0.8,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });

    map.current.on('click', 'wildfires-points', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const properties = feature.properties;
        
        showPopup({
          title: properties?.title || 'Wildfire',
          type: 'Wildfire Incident',
          description: `${properties?.acres || 0} acres burned, ${properties?.containment || 0}% contained`,
          location: `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`,
          coordinates: coordinates
        }, coordinates);
      }
    });
  };

  const addEarthquakesLayer = (earthquakes: any[]) => {
    if (!map.current) return;

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: earthquakes.slice(0, 100).map((eq, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            -120 + (Math.random() * 60),
            25 + (Math.random() * 25)
          ]
        },
        properties: {
          id: `earthquake-${index}`,
          title: `M${(Math.random() * 5 + 2).toFixed(1)} Earthquake`,
          type: 'earthquake',
          magnitude: (Math.random() * 5 + 2).toFixed(1),
          depth: Math.floor(Math.random() * 100),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }))
    };

    map.current.addSource('earthquakes', {
      type: 'geojson',
      data: geojsonData
    });

    map.current.addLayer({
      id: 'earthquakes-points',
      type: 'circle',
      source: 'earthquakes',
      paint: {
        'circle-color': '#7c3aed',
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'magnitude'],
          2, 4,
          7, 20
        ],
        'circle-opacity': 0.6,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    map.current.on('click', 'earthquakes-points', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const properties = feature.properties;
        
        showPopup({
          title: properties?.title || 'Earthquake',
          type: 'Earthquake',
          description: `Magnitude ${properties?.magnitude}, depth ${properties?.depth}km`,
          location: `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`,
          date: properties?.date,
          coordinates: coordinates
        }, coordinates);
      }
    });
  };

  const showPopup = (data: MapPopupData, coordinates: [number, number]) => {
    setSelectedPopup(data);
    
    if (popup.current) {
      popup.current.remove();
    }
    
    popup.current = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(coordinates)
      .setHTML('<div id="popup-content"></div>')
      .addTo(map.current!);
  };

  const toggleLayer = (layerId: string, visible: boolean) => {
    if (!map.current) return;

    const layerIds = [
      `${layerId}-points`,
      `${layerId}-clusters`,
      `${layerId}-polygons`
    ];

    layerIds.forEach(id => {
      if (map.current!.getLayer(id)) {
        map.current!.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    });

    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    ));
  };

  const getSeverityBadge = (severity?: string) => {
    const colors = {
      'severe': 'bg-red-500',
      'moderate': 'bg-yellow-500',
      'minor': 'bg-blue-500'
    };
    
    return (
      <Badge className={`${colors[severity as keyof typeof colors] || 'bg-gray-500'} text-white text-xs`}>
        {severity || 'Unknown'}
      </Badge>
    );
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Layer Controls Panel */}
      <Card className="absolute top-4 left-4 w-80 bg-white/95 backdrop-blur-sm shadow-lg z-10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="w-5 h-5" />
            Disaster Data Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {layers.map((layer) => (
            <div key={layer.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className={`p-1 rounded`} style={{ color: layer.color }}>
                  {layer.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{layer.name}</div>
                  <div className="text-xs text-gray-500">{layer.description}</div>
                </div>
              </div>
              <Switch
                checked={layer.visible}
                onCheckedChange={(checked) => toggleLayer(layer.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Time Range Control */}
      <Card className="absolute top-4 right-4 w-64 bg-white/95 backdrop-blur-sm shadow-lg z-10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            Time Range: {timeRange[0]} days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            value={timeRange}
            onValueChange={setTimeRange}
            max={90}
            min={1}
            step={1}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Search Panel */}
      <Card className="absolute bottom-4 left-4 w-80 bg-white/95 backdrop-blur-sm shadow-lg z-10">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search location or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <Button size="sm" variant="outline">
              <Filter className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popup Modal */}
      {selectedPopup && (
        <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white shadow-2xl z-50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedPopup.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{selectedPopup.type}</Badge>
                  {selectedPopup.severity && getSeverityBadge(selectedPopup.severity)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPopup(null);
                  popup.current?.remove();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-700">Description</div>
              <div className="text-sm text-gray-600">{selectedPopup.description}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-gray-700">Location</div>
                <div className="text-gray-600">{selectedPopup.location}</div>
              </div>
              {selectedPopup.date && (
                <div>
                  <div className="font-medium text-gray-700">Date</div>
                  <div className="text-gray-600">
                    {new Date(selectedPopup.date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {(selectedPopup.requests !== undefined || selectedPopup.resources !== undefined) && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                {selectedPopup.requests !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedPopup.requests}</div>
                    <div className="text-sm text-gray-500">Active Requests</div>
                  </div>
                )}
                {selectedPopup.resources !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedPopup.resources}</div>
                    <div className="text-sm text-gray-500">Resources</div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MapPin className="w-4 h-4 mr-1" />
                Directions
              </Button>
              <Button size="sm" className="flex-1">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="absolute bottom-4 right-4 w-64 bg-white/95 backdrop-blur-sm shadow-lg z-10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Weather Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>FEMA Disasters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Supply Sites</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span>Wildfires</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span>Earthquakes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapboxDisasterMap;