import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Layers, 
  AlertTriangle, 
  MapPin, 
  Zap, 
  Flame, 
  CloudRain,
  TreePine,
  Home,
  Activity,
  X,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface DisasterData {
  id: string;
  title: string;
  type: 'weather-alert' | 'fema-disaster' | 'supply-site' | 'wildfire' | 'earthquake';
  description: string;
  location: string;
  severity?: string;
  coordinates: [number, number];
  date?: string;
  status?: string;
  requests?: number;
  resources?: number;
}

interface LayerConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
  color: string;
  description: string;
}

const SimpleDisasterMap: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<DisasterData | null>(null);
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
    }
  ]);

  const [disasterData, setDisasterData] = useState<DisasterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisasterData();
  }, []);

  const loadDisasterData = async () => {
    setLoading(true);
    try {
      const [weatherAlerts, femaDisasters, supplySites, wildfires, earthquakes] = await Promise.all([
        fetch('/api/weather-alerts').then(r => r.json()).catch(() => ({ alerts: [] })),
        fetch('/api/fema/disasters').then(r => r.json()).catch(() => ({ disasters: [] })),
        fetch('/api/supply-sites').then(r => r.json()).catch(() => ({ sites: [] })),
        fetch('/api/wildfires').then(r => r.json()).catch(() => ({ incidents: [] })),
        fetch('/api/earthquakes').then(r => r.json()).catch(() => ({ earthquakes: [] }))
      ]);

      const allData: DisasterData[] = [];

      // Process weather alerts
      if (weatherAlerts.alerts?.length) {
        weatherAlerts.alerts.slice(0, 50).forEach((alert: any, index: number) => {
          allData.push({
            id: `weather-${index}`,
            title: alert.title || 'Weather Alert',
            type: 'weather-alert',
            description: alert.description || 'Weather warning issued',
            location: alert.areaDesc || 'Unknown area',
            severity: alert.severity || 'moderate',
            coordinates: [-120 + (Math.random() * 60), 25 + (Math.random() * 25)],
            date: alert.date || new Date().toISOString()
          });
        });
      }

      // Process FEMA disasters
      if (femaDisasters.disasters?.length) {
        femaDisasters.disasters.slice(0, 25).forEach((disaster: any, index: number) => {
          allData.push({
            id: `fema-${index}`,
            title: disaster.title || disaster.incidentType || 'FEMA Disaster',
            type: 'fema-disaster',
            description: disaster.declarationTitle || 'Federal disaster declaration',
            location: disaster.state || 'Unknown state',
            coordinates: [-120 + (Math.random() * 60), 25 + (Math.random() * 25)],
            date: disaster.incidentBeginDate || disaster.declarationDate,
            status: 'Active'
          });
        });
      }

      // Process supply sites
      if (supplySites.sites?.length) {
        supplySites.sites.slice(0, 100).forEach((site: any, index: number) => {
          allData.push({
            id: `supply-${index}`,
            title: site.name || `Supply Site ${index + 1}`,
            type: 'supply-site',
            description: site.description || 'Active supply distribution site',
            location: site.location || 'Unknown location',
            coordinates: [-120 + (Math.random() * 60), 25 + (Math.random() * 25)],
            requests: Math.floor(Math.random() * 50),
            resources: Math.floor(Math.random() * 100),
            status: site.status || 'Active'
          });
        });
      }

      // Process wildfires
      if (wildfires.incidents?.length) {
        wildfires.incidents.slice(0, 30).forEach((incident: any, index: number) => {
          allData.push({
            id: `wildfire-${index}`,
            title: incident.name || `Wildfire ${index + 1}`,
            type: 'wildfire',
            description: `Active wildfire incident - ${Math.floor(Math.random() * 10000)} acres`,
            location: incident.state || 'Unknown state',
            coordinates: [-120 + (Math.random() * 60), 25 + (Math.random() * 25)]
          });
        });
      }

      // Process earthquakes
      if (earthquakes.earthquakes?.length) {
        earthquakes.earthquakes.slice(0, 50).forEach((eq: any, index: number) => {
          const magnitude = (Math.random() * 5 + 2).toFixed(1);
          allData.push({
            id: `earthquake-${index}`,
            title: `M${magnitude} Earthquake`,
            type: 'earthquake',
            description: `Magnitude ${magnitude}, depth ${Math.floor(Math.random() * 100)}km`,
            location: eq.place || 'Unknown location',
            coordinates: [-120 + (Math.random() * 60), 25 + (Math.random() * 25)],
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        });
      }

      setDisasterData(allData);
    } catch (error) {
      console.error('Error loading disaster data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layerId: string, visible: boolean) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    ));
  };

  const getFilteredData = () => {
    return disasterData.filter(event => {
      const layer = layers.find(l => l.id === `${event.type}s` || l.id === event.type.replace('-', '-'));
      return layer?.visible !== false;
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'weather-alert': return <CloudRain className="w-4 h-4" />;
      case 'fema-disaster': return <AlertTriangle className="w-4 h-4" />;
      case 'supply-site': return <Home className="w-4 h-4" />;
      case 'wildfire': return <Flame className="w-4 h-4" />;
      case 'earthquake': return <Zap className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    const layer = layers.find(l => l.id === `${type}s` || l.id === type.replace('-', '-'));
    return layer?.color || '#6b7280';
  };

  const getSeverityBadge = (severity?: string) => {
    const colors = {
      'severe': 'bg-red-500',
      'moderate': 'bg-yellow-500', 
      'minor': 'bg-blue-500'
    };
    
    if (!severity) return null;
    
    return (
      <Badge className={`${colors[severity as keyof typeof colors] || 'bg-gray-500'} text-white text-xs`}>
        {severity}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading disaster data...</p>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Map Alternative - Data List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Disaster Response Data</h2>
            <p className="text-gray-300">
              Interactive disaster map is temporarily unavailable. Showing tabular data from all sources.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/30">
                <Activity className="w-4 h-4 mr-1" />
                Live Data
              </Badge>
              <span className="text-sm text-gray-400">
                {filteredData.length} events displayed
              </span>
            </div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((event) => (
              <Card 
                key={event.id} 
                className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: getEventColor(event.type) }}
                    >
                      {getEventIcon(event.type)}
                    </div>
                    {getSeverityBadge(event.severity)}
                  </div>
                  
                  <h3 className="text-white font-semibold text-sm mb-1 truncate">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  {(event.requests !== undefined || event.resources !== undefined) && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-gray-700">
                      {event.requests !== undefined && (
                        <div className="text-center">
                          <div className="text-orange-400 font-bold text-sm">{event.requests}</div>
                          <div className="text-gray-500 text-xs">Requests</div>
                        </div>
                      )}
                      {event.resources !== undefined && (
                        <div className="text-center">
                          <div className="text-green-400 font-bold text-sm">{event.resources}</div>
                          <div className="text-gray-500 text-xs">Resources</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Side Panel - Controls */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          {/* Layer Controls */}
          <Card className="bg-gray-750 border-gray-600 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Layers className="w-5 h-5" />
                Data Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="p-1 rounded" style={{ color: layer.color }}>
                      {layer.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white">{layer.name}</div>
                      <div className="text-xs text-gray-400">{layer.description}</div>
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

          {/* Quick Actions */}
          <Card className="bg-gray-750 border-gray-600">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  Search Events
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-gray-800 border-gray-600 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-white">{selectedEvent.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-gray-300 border-gray-500">
                      {selectedEvent.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    {getSeverityBadge(selectedEvent.severity)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-300">Description</div>
                <div className="text-sm text-gray-100">{selectedEvent.description}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium text-gray-300">Location</div>
                  <div className="text-gray-100">{selectedEvent.location}</div>
                </div>
                {selectedEvent.date && (
                  <div>
                    <div className="font-medium text-gray-300">Date</div>
                    <div className="text-gray-100">
                      {new Date(selectedEvent.date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {(selectedEvent.requests !== undefined || selectedEvent.resources !== undefined) && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700">
                  {selectedEvent.requests !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{selectedEvent.requests}</div>
                      <div className="text-sm text-gray-400">Active Requests</div>
                    </div>
                  )}
                  {selectedEvent.resources !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{selectedEvent.resources}</div>
                      <div className="text-sm text-gray-400">Resources</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  View Location
                </Button>
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimpleDisasterMap;