import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Flame, Zap, CloudRain, MapPin, Layers, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-110m.json";

interface DisasterData {
  emergencyDeclarations: any[];
  weatherAlerts: any[];
  wildfireIncidents: any[];
  earthquakeIncidents: any[];
  femaDisasters: any[];
}

export default function InteractiveMapPage() {
  const [selectedLayers, setSelectedLayers] = useState({
    emergencies: true,
    weather: true,
    wildfires: true,
    earthquakes: true,
    fema: true
  });
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [selectedDataType, setSelectedDataType] = useState("all");

  // Fetch all disaster data
  const { data: emergencyData } = useQuery({
    queryKey: ["/api/state-emergency-declarations"],
  });

  const { data: weatherData } = useQuery({
    queryKey: ["/api/weather-alerts-rss"],
  });

  const { data: wildfireData } = useQuery({
    queryKey: ["/api/wildfire-incidents"],
  });

  const { data: earthquakeData } = useQuery({
    queryKey: ["/api/earthquake-incidents"],
  });

  const { data: femaData } = useQuery({
    queryKey: ["/api/fema-disasters"],
  });

  const disasterData: DisasterData = {
    emergencyDeclarations: emergencyData?.declarations || [],
    weatherAlerts: weatherData?.alerts || [],
    wildfireIncidents: wildfireData?.incidents || [],
    earthquakeIncidents: earthquakeData?.incidents || [],
    femaDisasters: femaData?.items || []
  };

  // State code to name mapping
  const stateNames: { [key: string]: string } = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'District of Columbia'
  };

  // Get state data aggregation
  const getStateData = (stateCode: string) => {
    const stateName = stateNames[stateCode] || stateCode;
    
    const emergencies = disasterData.emergencyDeclarations.filter(d => d.state === stateCode);
    const weather = disasterData.weatherAlerts.filter(a => 
      a.areas?.some((area: any) => area.includes(stateName)) || 
      a.title?.includes(stateName)
    );
    const wildfires = disasterData.wildfireIncidents.filter(w => w.state === stateCode);
    const earthquakes = disasterData.earthquakeIncidents.filter(e => 
      e.location?.includes(stateName) || e.state === stateCode
    );
    const fema = disasterData.femaDisasters.filter(f => f.state === stateCode);

    return {
      emergencies,
      weather,
      wildfires,
      earthquakes,
      fema,
      totalIncidents: emergencies.length + weather.length + wildfires.length + earthquakes.length + fema.length
    };
  };

  // Get state color based on incident severity
  const getStateColor = (stateCode: string) => {
    const data = getStateData(stateCode);
    
    if (data.totalIncidents === 0) return "#e5e7eb"; // Gray for no incidents
    if (data.totalIncidents <= 2) return "#fbbf24"; // Amber for low
    if (data.totalIncidents <= 5) return "#f97316"; // Orange for medium
    return "#dc2626"; // Red for high
  };

  const handleStateHover = (geo: any) => {
    const stateCode = geo.properties.NAME;
    const stateAbbrev = Object.keys(stateNames).find(key => stateNames[key] === stateCode);
    
    if (stateAbbrev) {
      setHoveredState(stateAbbrev);
      setTooltipContent({
        name: stateCode,
        code: stateAbbrev,
        data: getStateData(stateAbbrev)
      });
    }
  };

  const handleStateLeave = () => {
    setHoveredState(null);
    setTooltipContent(null);
  };

  // Generate markers for specific incidents
  const getIncidentMarkers = () => {
    const markers: any[] = [];

    // Wildfire markers
    if (selectedLayers.wildfires) {
      disasterData.wildfireIncidents.forEach((fire, index) => {
        if (fire.latitude && fire.longitude) {
          markers.push({
            id: `wildfire-${index}`,
            coordinates: [fire.longitude, fire.latitude],
            type: 'wildfire',
            data: fire,
            icon: Flame,
            color: '#dc2626'
          });
        }
      });
    }

    // Earthquake markers
    if (selectedLayers.earthquakes) {
      disasterData.earthquakeIncidents.forEach((quake, index) => {
        if (quake.latitude && quake.longitude) {
          markers.push({
            id: `earthquake-${index}`,
            coordinates: [quake.longitude, quake.latitude],
            type: 'earthquake',
            data: quake,
            icon: Zap,
            color: '#7c3aed'
          });
        }
      });
    }

    return markers;
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Interactive Disaster Map
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Real-time visualization of emergency data across all 50 states
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data Types</SelectItem>
                  <SelectItem value="emergencies">Emergency Declarations</SelectItem>
                  <SelectItem value="weather">Weather Alerts</SelectItem>
                  <SelectItem value="wildfires">Wildfire Incidents</SelectItem>
                  <SelectItem value="earthquakes">Earthquake Activity</SelectItem>
                  <SelectItem value="fema">FEMA Disasters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Layer Controls */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Data Layers
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedLayers).map(([key, enabled]) => (
                <Button
                  key={key}
                  variant={enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLayers(prev => ({ ...prev, [key]: !enabled }))}
                  className="capitalize"
                >
                  {key === 'emergencies' && <AlertTriangle className="w-4 h-4 mr-1" />}
                  {key === 'weather' && <CloudRain className="w-4 h-4 mr-1" />}
                  {key === 'wildfires' && <Flame className="w-4 h-4 mr-1" />}
                  {key === 'earthquakes' && <Zap className="w-4 h-4 mr-1" />}
                  {key === 'fema' && <Info className="w-4 h-4 mr-1" />}
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>No Incidents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-400 rounded"></div>
                <span>Low (1-2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Medium (3-5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>High (6+)</span>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative bg-blue-50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <ComposableMap
              projection="geoAlbersUsa"
              projectionConfig={{
                scale: 1000,
              }}
              width={1000}
              height={600}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateCode = Object.keys(stateNames).find(key => 
                      stateNames[key] === geo.properties.NAME
                    );
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => handleStateHover(geo)}
                        onMouseLeave={handleStateLeave}
                        style={{
                          default: {
                            fill: stateCode ? getStateColor(stateCode) : "#e5e7eb",
                            stroke: "#fff",
                            strokeWidth: 0.5,
                            outline: "none",
                          },
                          hover: {
                            fill: stateCode ? getStateColor(stateCode) : "#e5e7eb",
                            stroke: "#fff",
                            strokeWidth: 1,
                            outline: "none",
                            filter: "brightness(1.1)",
                          },
                          pressed: {
                            fill: stateCode ? getStateColor(stateCode) : "#e5e7eb",
                            stroke: "#fff",
                            strokeWidth: 1,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Incident Markers */}
              {getIncidentMarkers().map((marker) => (
                <Marker key={marker.id} coordinates={marker.coordinates}>
                  <circle
                    r={4}
                    fill={marker.color}
                    stroke="#fff"
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                  />
                </Marker>
              ))}
            </ComposableMap>

            {/* Tooltip */}
            {tooltipContent && (
              <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-10">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{tooltipContent.name}</h4>
                  
                  <div className="space-y-1 text-sm">
                    {tooltipContent.data.emergencies.length > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{tooltipContent.data.emergencies.length} Emergency Declaration{tooltipContent.data.emergencies.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {tooltipContent.data.weather.length > 0 && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <CloudRain className="w-4 h-4" />
                        <span>{tooltipContent.data.weather.length} Weather Alert{tooltipContent.data.weather.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {tooltipContent.data.wildfires.length > 0 && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Flame className="w-4 h-4" />
                        <span>{tooltipContent.data.wildfires.length} Wildfire{tooltipContent.data.wildfires.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {tooltipContent.data.earthquakes.length > 0 && (
                      <div className="flex items-center gap-2 text-purple-600">
                        <Zap className="w-4 h-4" />
                        <span>{tooltipContent.data.earthquakes.length} Earthquake{tooltipContent.data.earthquakes.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {tooltipContent.data.fema.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Info className="w-4 h-4" />
                        <span>{tooltipContent.data.fema.length} FEMA Disaster{tooltipContent.data.fema.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {tooltipContent.data.totalIncidents === 0 && (
                      <div className="text-green-600 text-sm">No active incidents</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{disasterData.emergencyDeclarations.length}</div>
              <div className="text-sm text-gray-600">Emergency Declarations</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CloudRain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{disasterData.weatherAlerts.length}</div>
              <div className="text-sm text-gray-600">Weather Alerts</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{disasterData.wildfireIncidents.length}</div>
              <div className="text-sm text-gray-600">Wildfire Incidents</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{disasterData.earthquakeIncidents.length}</div>
              <div className="text-sm text-gray-600">Earthquakes</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">{disasterData.femaDisasters.length}</div>
              <div className="text-sm text-gray-600">FEMA Disasters</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Disaster Watch Center Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Emergency Declarations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              State Emergency Declarations
            </CardTitle>
            <p className="text-sm text-gray-600">Real-time emergency declarations from official government RSS feeds</p>
          </CardHeader>
          <CardContent>
            {disasterData.emergencyDeclarations.length > 0 ? (
              <div className="space-y-3">
                {disasterData.emergencyDeclarations.slice(0, 5).map((declaration: any, index: number) => (
                  <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-red-800">{declaration.stateName}</h4>
                      <Badge variant="destructive" className="text-xs">Emergency</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{declaration.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Source: {declaration.source}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(declaration.publishedAt))} ago</span>
                    </div>
                  </div>
                ))}
                {disasterData.emergencyDeclarations.length > 5 && (
                  <div className="text-center">
                    <Badge variant="outline">+{disasterData.emergencyDeclarations.length - 5} more declarations</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No emergency declarations found</p>
                <p className="text-sm">All states currently normal</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-500" />
              Active Weather Alerts
            </CardTitle>
            <p className="text-sm text-gray-600">National Weather Service and Hurricane Center alerts</p>
          </CardHeader>
          <CardContent>
            {disasterData.weatherAlerts.length > 0 ? (
              <div className="space-y-3">
                {disasterData.weatherAlerts.slice(0, 5).map((alert: any, index: number) => (
                  <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-blue-800">{alert.event}</h4>
                      <Badge 
                        variant={alert.severity === 'severe' ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.headline}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Area: {alert.areaDesc}</span>
                      <span>•</span>
                      <span>{alert.senderName}</span>
                    </div>
                  </div>
                ))}
                {disasterData.weatherAlerts.length > 5 && (
                  <div className="text-center">
                    <Badge variant="outline">+{disasterData.weatherAlerts.length - 5} more alerts</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CloudRain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No active weather alerts</p>
                <p className="text-sm">Weather conditions normal</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wildfire Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Active Wildfire Incidents
            </CardTitle>
            <p className="text-sm text-gray-600">InciWeb wildfire tracking data</p>
          </CardHeader>
          <CardContent>
            {disasterData.wildfireIncidents.length > 0 ? (
              <div className="space-y-3">
                {disasterData.wildfireIncidents.slice(0, 5).map((fire: any, index: number) => (
                  <div key={index} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-orange-800">{fire.title}</h4>
                      <Badge 
                        variant={fire.status === 'Active' ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        {fire.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                      <span>State: {fire.state}</span>
                      {fire.acres && <span>Size: {fire.acres.toLocaleString()} acres</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Type: {fire.incidentType}</span>
                      <span>•</span>
                      <span>Source: {fire.source}</span>
                    </div>
                  </div>
                ))}
                {disasterData.wildfireIncidents.length > 5 && (
                  <div className="text-center">
                    <Badge variant="outline">+{disasterData.wildfireIncidents.length - 5} more incidents</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Flame className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No active wildfire incidents</p>
                <p className="text-sm">Fire conditions normal</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Earthquake Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Recent Earthquake Activity
            </CardTitle>
            <p className="text-sm text-gray-600">USGS significant earthquake monitoring</p>
          </CardHeader>
          <CardContent>
            {disasterData.earthquakeIncidents.length > 0 ? (
              <div className="space-y-3">
                {disasterData.earthquakeIncidents.slice(0, 5).map((quake: any, index: number) => (
                  <div key={index} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-purple-800">{quake.title}</h4>
                      <Badge 
                        variant={quake.magnitude >= 5.0 ? 'destructive' : 'secondary'} 
                        className="text-xs"
                      >
                        M{quake.magnitude}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                      <span>Location: {quake.location}</span>
                      <span>Depth: {quake.depth}km</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Alert: {quake.alertLevel}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(quake.pubDate))} ago</span>
                    </div>
                  </div>
                ))}
                {disasterData.earthquakeIncidents.length > 5 && (
                  <div className="text-center">
                    <Badge variant="outline">+{disasterData.earthquakeIncidents.length - 5} more earthquakes</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No significant earthquakes</p>
                <p className="text-sm">Seismic activity normal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FEMA Disasters - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" />
            FEMA Disaster Declarations
          </CardTitle>
          <p className="text-sm text-gray-600">Federal Emergency Management Agency disaster information</p>
        </CardHeader>
        <CardContent>
          {disasterData.femaDisasters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {disasterData.femaDisasters.slice(0, 6).map((disaster: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{disaster.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      #{disaster.disasterNumber}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                    <span>State: {disaster.state}</span>
                    <span>Type: {disaster.incidentType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Declared: {formatDistanceToNow(new Date(disaster.declarationDate))} ago</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No FEMA disasters</p>
              <p className="text-sm">No federal disaster declarations</p>
            </div>
          )}
          {disasterData.femaDisasters.length > 6 && (
            <div className="text-center mt-4">
              <Badge variant="outline">+{disasterData.femaDisasters.length - 6} more FEMA disasters</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}