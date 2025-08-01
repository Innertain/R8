import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ExternalLink, Clock, MapPin, Filter, Download, Share2, TrendingUp, Activity, Flame, Zap, Waves, Wind, Mountain, Home, TreePine, Factory, Snowflake, Sun, Calendar, ChevronDown, ChevronUp, BarChart3, CloudRain, CloudSnow, CloudLightning, Thermometer } from "lucide-react";
import { getWeatherAlertIcon } from '@/utils/disasterIcons';
import DisasterAnalyticsDashboard from "./DisasterAnalyticsDashboard";
import ActiveDisastersDashboard from "./ActiveDisastersDashboard";
import StateAnalysisDashboard from "./StateAnalysisDashboard";

interface EmergencyAlert {
  id: string;
  title: string;
  severity: string;
  alertType: string;
  location: string;
  description?: string;
  pubDate: string;
  guid: string;
  link?: string;
}

interface FemaDisasterItem {
  guid: string;
  title: string;
  state: string;
  declarationType: string;
  disasterNumber: string;
  incidentType?: string;
  declarationDate: string;
  incidentBeginDate?: string;
  incidentEndDate?: string;
  description?: string;
  femaRegion?: string;
  placeCode?: string;
  designatedArea?: string;
}

interface ReliefWebItem {
  guid: string;
  title: string;
  country: string;
  disasterType: string;
  glideCode?: string;
  description?: string;
  pubDate: string;
  link: string;
}

interface EnhancedRssFeedProps {
  stateFilter?: string;
  maxItems?: number;
  showFilters?: boolean;
  showAnalytics?: boolean;
}

export function EnhancedRssFeed({ 
  stateFilter, 
  maxItems = 50, 
  showFilters = true, 
  showAnalytics = true 
}: EnhancedRssFeedProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [femaDisasters, setFemaDisasters] = useState<FemaDisasterItem[]>([]);
  const [globalDisasters, setGlobalDisasters] = useState<ReliefWebItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'declarations' | 'analytics' | 'global'>('live');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>(stateFilter || 'all');
  const [stateSearchFilter, setStateSearchFilter] = useState<string>('all');
  const [disasterTypeFilter, setDisasterTypeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch enhanced weather alerts from multiple RSS feeds
        const alertsResponse = await fetch('/api/weather-alerts-rss');
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          if (alertsData.success) {
            setAlerts(alertsData.alerts || []);
          }
        }

        // Fetch FEMA disaster declarations
        const femaResponse = await fetch('/api/fema-disasters');
        if (femaResponse.ok) {
          const femaData = await femaResponse.json();
          if (femaData.success) {
            setFemaDisasters(femaData.items || []);
          }
        }

        // Fetch global disasters from ReliefWeb
        const globalResponse = await fetch('/api/reliefweb-disasters');
        if (globalResponse.ok) {
          const globalData = await globalResponse.json();
          if (globalData.success) {
            setGlobalDisasters(globalData.items || []);
          }
        }
        
      } catch (err) {
        console.error('Enhanced RSS feed error:', err);
        setError('Unable to load emergency data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchEmergencyData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Function to get appropriate icon for alert type with enhanced weather icons
  const getAlertIcon = (alertType: string) => {
    if (!alertType) return AlertTriangle;
    
    // Try custom disaster icons first
    const customIcon = getWeatherAlertIcon(alertType);
    if (customIcon) {
      return customIcon;
    }
    
    // Fallback to lucide icons
    const type = alertType.toLowerCase();
    if (type.includes('fire')) return Flame;
    if (type.includes('flood')) return Waves;
    if (type.includes('storm') || type.includes('wind')) return Wind;
    if (type.includes('heat')) return Sun;
    if (type.includes('snow') || type.includes('ice')) return CloudSnow;
    if (type.includes('rain') || type.includes('precipitation')) return CloudRain;
    if (type.includes('thunder') || type.includes('lightning')) return CloudLightning;
    if (type.includes('temperature') || type.includes('temp')) return Thermometer;
    if (type.includes('earthquake')) return Mountain;
    if (type.includes('weather')) return Sun;
    return AlertTriangle;
  };

  // Function to get appropriate icon for disaster type
  const getDisasterIcon = (disasterType?: string) => {
    if (!disasterType) return AlertTriangle;
    const type = disasterType.toLowerCase();
    if (type.includes('fire')) return Flame;
    if (type.includes('flood')) return Waves;
    if (type.includes('hurricane') || type.includes('storm')) return Wind;
    if (type.includes('earthquake')) return Mountain;
    if (type.includes('drought')) return Sun;
    if (type.includes('snow') || type.includes('ice')) return Snowflake;
    if (type.includes('tornado')) return Wind;
    if (type.includes('severe storm')) return Zap;
    return AlertTriangle;
  };

  // Filter alerts based on severity and location
  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = severityFilter === 'all' || (alert.severity && alert.severity.toLowerCase().includes(severityFilter.toLowerCase()));
    const locationMatch = locationFilter === 'all' || (alert.location && alert.location.toLowerCase().includes(locationFilter.toLowerCase()));
    return severityMatch && locationMatch;
  }).slice(0, maxItems);

  // Get unique states and disaster types for filter options
  const uniqueStates = [...new Set(femaDisasters.map(d => d.state))].sort();
  const uniqueDisasterTypes = [...new Set(femaDisasters.map(d => d.incidentType).filter(Boolean))].sort();

  // Filter FEMA disasters by state, disaster type, and remove duplicates
  const filteredFemaDisasters = femaDisasters
    .filter(disaster => {
      // Apply existing state filter prop
      if (stateFilter && stateFilter !== 'all') {
        return disaster.state === stateFilter;
      }
      // Apply new state search filter
      if (stateSearchFilter && stateSearchFilter !== 'all') {
        return disaster.state === stateSearchFilter;
      }
      // Apply disaster type filter
      if (disasterTypeFilter && disasterTypeFilter !== 'all') {
        return disaster.incidentType === disasterTypeFilter;
      }
      return true;
    })
    .filter((disaster, index, self) => {
      // Remove duplicates based on disaster number (keep first occurrence)
      return index === self.findIndex(d => d.disasterNumber === disaster.disasterNumber);
    })
    .slice(0, maxItems);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate statistics for analytics
  const femaStats = {
    totalDeclarations: femaDisasters.length,
    byState: femaDisasters.reduce((acc, disaster) => {
      acc[disaster.state] = (acc[disaster.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: femaDisasters.reduce((acc, disaster) => {
      const type = disaster.incidentType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byDeclarationType: femaDisasters.reduce((acc, disaster) => {
      acc[disaster.declarationType] = (acc[disaster.declarationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const severityStats = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationStats = alerts.reduce((acc, alert) => {
    const location = alert.location.split(',')[0].trim(); // Get first part of location
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exportData = () => {
    const data = activeTab === 'live' ? filteredAlerts : filteredFemaDisasters;
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `emergency-${activeTab}-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const shareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency ${activeTab === 'live' ? 'Alerts' : 'Declarations'}`,
          text: `${activeTab === 'live' ? filteredAlerts.length : filteredFemaDisasters.length} active emergency ${activeTab === 'live' ? 'alerts' : 'declarations'}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            Emergency Data Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-4 border">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50/50 w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Emergency Data Feed
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={shareData}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'live' | 'declarations' | 'analytics' | 'global')}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="live" className="flex items-center gap-1 text-xs">
              <CloudLightning className="w-3 h-3" />
              Weather Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="declarations" className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3" />
              Active Disasters ({femaDisasters.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
              <BarChart3 className="w-3 h-3" />
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="global" className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              Global ({globalDisasters.length})
            </TabsTrigger>
          </TabsList>

          {showFilters && (
            <div className="flex gap-2 mt-4">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {Object.keys(locationStats).slice(0, 10).map(location => (
                    <SelectItem key={location} value={location}>
                      {location} ({locationStats[location]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showAnalytics && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm font-medium text-gray-600 mb-3">Severity Breakdown</div>
                <div className="space-y-2">
                  {Object.entries(severityStats).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between text-sm">
                      <span className="capitalize">{severity}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm font-medium text-gray-600 mb-3">Active Locations</div>
                <div className="space-y-2">
                  {Object.entries(locationStats).slice(0, 4).map(([location, count]) => (
                    <div key={location} className="flex justify-between text-sm">
                      <span className="truncate">{location}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm font-medium text-gray-600 mb-3">Alert Types</div>
                <div className="space-y-2">
                  {Object.entries(alerts.reduce((acc, alert) => {
                    acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)).slice(0, 4).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="truncate">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm font-medium text-gray-600 mb-3">Total Active</div>
                <div className="text-2xl font-bold text-orange-600">{alerts.length}</div>
                <div className="text-xs text-gray-500">Live Alerts</div>
              </div>
            </div>
          )}

          <TabsContent value="live" className="mt-6">
            {/* Weather Alerts Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CloudLightning className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-blue-900">National Weather Service Alerts</h3>
                  <p className="text-sm text-blue-700">Real-time weather warnings and watches from NOAA/NWS emergency systems</p>
                </div>
              </div>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border text-center">
                <Sun className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No active weather alerts - Clear conditions</p>
                <p className="text-xs text-gray-500 mt-1">Powered by National Weather Service</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlerts.map((alert, index) => {
                  const AlertIconComponent = getAlertIcon(alert.alertType);
                  const customIconUrl = getWeatherAlertIcon(alert.alertType);
                  const severityColors = {
                    'extreme': 'bg-red-100 border-red-300 text-red-800',
                    'severe': 'bg-orange-100 border-orange-300 text-orange-800',
                    'moderate': 'bg-yellow-100 border-yellow-300 text-yellow-800',
                    'minor': 'bg-blue-100 border-blue-300 text-blue-800'
                  };
                  
                  return (
                    <div
                      key={`${alert.guid}-${index}`}
                      className={`rounded-lg border p-4 transition-all hover:shadow-lg bg-gradient-to-br ${severityColors[alert.severity.toLowerCase() as keyof typeof severityColors] || 'bg-gray-100 border-gray-300'} hover:scale-105`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-white/70 shadow-sm border border-white/30">
                            {customIconUrl ? (
                              <img src={customIconUrl} alt={alert.alertType} className="w-5 h-5 object-contain" />
                            ) : (
                              <AlertIconComponent className="w-5 h-5" />
                            )}
                          </div>
                          <h3 className="font-semibold text-sm leading-tight flex-1">
                            {alert.title}
                          </h3>
                        </div>
                        <Badge className={`text-xs whitespace-nowrap font-bold shadow-sm ${alert.severity === 'Extreme' ? 'bg-red-600 text-white animate-pulse' : 
                          alert.severity === 'Severe' ? 'bg-orange-600 text-white' : 
                          alert.severity === 'Moderate' ? 'bg-yellow-600 text-white' : 
                          'bg-blue-600 text-white'}`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="font-medium">{alert.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="bg-blue-500/20 text-blue-900 px-2 py-1 rounded text-xs font-semibold border border-blue-300 shadow-sm">
                            NWS: {alert.alertType}
                          </span>
                        </div>
                      </div>
                      
                      {alert.description && (
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed line-clamp-3">
                          {alert.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-white/30">
                        <div className="flex items-center gap-1 text-xs opacity-75">
                          <Clock className="w-3 h-3" />
                          <span>{alert.pubDate && alert.pubDate !== 'Invalid Date' ? new Date(alert.pubDate).toLocaleDateString() : 'Current Alert'}</span>
                        </div>
                        
                        {alert.link && (
                          <a
                            href={alert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium inline-flex items-center gap-1 hover:underline opacity-75 hover:opacity-100 transition-opacity bg-white/50 px-2 py-1 rounded"
                          >
                            NWS Alert <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="declarations" className="mt-6">
            {/* Enhanced Analytics Integration - Comprehensive Data Analysis */}
            {femaDisasters.length > 0 && (
              <div className="mb-6">
                <DisasterAnalyticsDashboard disasters={femaDisasters} />
              </div>
            )}
            
            {/* FEMA Statistics Dashboard */}
            {femaDisasters.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Disaster Types</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(femaStats.byType).slice(0, 3).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="truncate">{type}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">By State</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(femaStats.byState).slice(0, 3).map(([state, count]) => (
                      <div key={state} className="flex justify-between text-xs">
                        <span className="truncate">{state}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm">Declaration Types</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(femaStats.byDeclarationType).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="truncate">
                          {type === 'DR' ? 'Major Disaster' : type === 'EM' ? 'Emergency' : 'Fire Mgmt'}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-sm">Total Active</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{femaStats.totalDeclarations}</div>
                  <div className="text-xs text-gray-500">2024-2025 Declarations</div>
                </div>
              </div>
            )}

            {/* Search and Filter Controls for Disaster Cards */}
            {showFilters && femaDisasters.length > 0 && (
              <div className="bg-white rounded-lg p-4 border mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-sm">Search & Filter Disasters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* State Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Search by State</label>
                    <Select value={stateSearchFilter} onValueChange={setStateSearchFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All States" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States ({uniqueStates.length})</SelectItem>
                        {uniqueStates.map(state => (
                          <SelectItem key={state} value={state}>
                            {state} ({femaDisasters.filter(d => d.state === state).length})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Disaster Type Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Filter by Disaster Type</label>
                    <Select value={disasterTypeFilter} onValueChange={setDisasterTypeFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types ({uniqueDisasterTypes.length})</SelectItem>
                        {uniqueDisasterTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type} ({femaDisasters.filter(d => d.incidentType === type).length})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(stateSearchFilter !== 'all' || disasterTypeFilter !== 'all') && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStateSearchFilter('all');
                        setDisasterTypeFilter('all');
                      }}
                      className="text-xs"
                    >
                      Clear All Filters
                    </Button>
                    <span className="ml-3 text-xs text-gray-600">
                      Showing {filteredFemaDisasters.length} of {femaDisasters.length} disasters
                    </span>
                  </div>
                )}
              </div>
            )}

            {filteredFemaDisasters.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  No disasters found{stateSearchFilter !== 'all' ? ` for ${stateSearchFilter}` : ''}{disasterTypeFilter !== 'all' ? ` (${disasterTypeFilter})` : ''}
                </p>
                {(stateSearchFilter !== 'all' || disasterTypeFilter !== 'all') && (
                  <p className="text-xs text-gray-500 mt-2">Try adjusting your search filters above.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFemaDisasters.map((disaster, index) => {
                  const DisasterIcon = getDisasterIcon(disaster.incidentType);
                  
                  // Skip duplicate disasters with same disaster number (show only unique ones)
                  const isDuplicate = index > 0 && filteredFemaDisasters.slice(0, index).some(d => d.disasterNumber === disaster.disasterNumber);
                  if (isDuplicate) return null;
                  
                  return (
                    <div
                      key={`${disaster.guid}-${index}`}
                      className="rounded-lg border p-4 transition-all hover:shadow-md bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="p-2 rounded-full bg-gray-100">
                            <DisasterIcon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm leading-tight">
                              {disaster.incidentType || 'Disaster'} - {disaster.state}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">#{disaster.disasterNumber}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs whitespace-nowrap ${
                            disaster.declarationType === 'DR' ? 'bg-red-100 text-red-800' :
                            disaster.declarationType === 'EM' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {disaster.declarationType === 'DR' ? 'MAJOR DISASTER' :
                           disaster.declarationType === 'EM' ? 'EMERGENCY' : 'FIRE MGMT'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {disaster.incidentType && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                              {disaster.incidentType}
                            </span>
                          </div>
                        )}
                        
                        {/* Simplified Date Information */}
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>Declared: {formatDate(disaster.declarationDate)}</span>
                          </div>
                          {disaster.incidentBeginDate && (
                            <div>
                              Incident: {formatDate(disaster.incidentBeginDate)}
                              {disaster.incidentEndDate && ` - ${formatDate(disaster.incidentEndDate)}`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {disaster.description && (
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed line-clamp-3">
                          {disaster.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(disaster.declarationDate)}</span>
                        </div>
                        
                        <div className="text-xs text-blue-700 font-medium">
                          FEMA-{disaster.disasterNumber}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-8">
              <ActiveDisastersDashboard disasters={femaDisasters} loading={loading} />
              <StateAnalysisDashboard disasters={femaDisasters} />
            </div>
          </TabsContent>

          <TabsContent value="global" className="mt-6">
            {globalDisasters.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No international disasters reported</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalDisasters.slice(0, maxItems).map((disaster, index) => {
                  const DisasterIcon = getDisasterIcon(disaster.disasterType);
                  return (
                    <div
                      key={`${disaster.guid}-${index}`}
                      className="rounded-lg border p-4 transition-all hover:shadow-sm bg-white"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-gray-100">
                            <DisasterIcon className="w-4 h-4 text-gray-600" />
                          </div>
                          <h3 className="font-semibold text-sm leading-tight flex-1">
                            {disaster.title}
                          </h3>
                        </div>
                        <Badge className="text-xs whitespace-nowrap capitalize bg-green-100 text-green-800">
                          {disaster.disasterType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{disaster.country}</span>
                        </div>
                        {disaster.glideCode && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono bg-gray-100 px-1 rounded">{disaster.glideCode}</span>
                          </div>
                        )}
                      </div>
                      
                      {disaster.description && (
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                          {disaster.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(disaster.pubDate).toLocaleDateString()}</span>
                        </div>
                        
                        <a
                          href={disaster.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          ReliefWeb <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}

export default EnhancedRssFeed;