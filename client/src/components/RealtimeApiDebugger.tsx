import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Database,
  Satellite,
  CloudRain,
  Mountain,
  Zap,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { format } from "date-fns";

interface ApiStatus {
  name: string;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error' | 'loading';
  lastUpdated?: string;
  responseTime?: number;
  dataCount?: number;
  cached?: boolean;
  error?: string;
  icon: React.ElementType;
  description: string;
}

export function RealtimeApiDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Query all API endpoints to check their status
  const { data: femaData } = useQuery({
    queryKey: ['/api/fema-disasters', refreshKey],
    queryFn: () => fetch('/api/fema-disasters').then(res => res.json()),
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { data: nasaData } = useQuery({
    queryKey: ['/api/nasa-eonet-events', refreshKey],
    queryFn: () => fetch('/api/nasa-eonet-events').then(res => res.json()),
    refetchInterval: 30000,
  });

  const { data: weatherData } = useQuery({
    queryKey: ['/api/weather-alerts-rss', refreshKey],
    queryFn: () => fetch('/api/weather-alerts-rss').then(res => res.json()),
    refetchInterval: 30000,
  });

  const { data: wildfireData } = useQuery({
    queryKey: ['/api/wildfire-incidents', refreshKey],
    queryFn: () => fetch('/api/wildfire-incidents').then(res => res.json()),
    refetchInterval: 30000,
  });

  const { data: earthquakeData } = useQuery({
    queryKey: ['/api/earthquake-incidents', refreshKey],
    queryFn: () => fetch('/api/earthquake-incidents').then(res => res.json()),
    refetchInterval: 30000,
  });

  // Build API status array
  const apiStatuses: ApiStatus[] = [
    {
      name: "FEMA Disasters",
      endpoint: "/api/fema-disasters",
      status: femaData?.success ? 'connected' : femaData === undefined ? 'loading' : 'error',
      lastUpdated: femaData?.lastUpdated,
      dataCount: femaData?.items?.length || 0,
      cached: femaData?.cached,
      error: femaData?.error,
      icon: Database,
      description: "Federal disaster declarations and emergency management data"
    },
    {
      name: "NASA EONET",
      endpoint: "/api/nasa-eonet-events",
      status: nasaData?.success ? 'connected' : nasaData === undefined ? 'loading' : 'error',
      lastUpdated: nasaData?.lastUpdated,
      dataCount: nasaData?.totalEvents || 0,
      cached: nasaData?.cached,
      error: nasaData?.error,
      icon: Satellite,
      description: "Live natural disaster events from NASA satellites"
    },
    {
      name: "Weather Alerts",
      endpoint: "/api/weather-alerts-rss",
      status: weatherData?.success ? 'connected' : weatherData === undefined ? 'loading' : 'error',
      lastUpdated: weatherData?.lastUpdated,
      dataCount: weatherData?.alerts?.length || 0,
      cached: weatherData?.cached,
      error: weatherData?.error,
      icon: CloudRain,
      description: "National Weather Service alerts and warnings"
    },
    {
      name: "Wildfire Data",
      endpoint: "/api/wildfire-incidents",
      status: wildfireData?.success ? 'connected' : wildfireData === undefined ? 'loading' : 'error',
      lastUpdated: wildfireData?.lastUpdated,
      dataCount: wildfireData?.incidents?.length || 0,
      cached: wildfireData?.cached,
      error: wildfireData?.error,
      icon: Mountain,
      description: "InciWeb wildfire incident tracking"
    },
    {
      name: "Earthquake Data",
      endpoint: "/api/earthquake-incidents",
      status: earthquakeData?.success ? 'connected' : earthquakeData === undefined ? 'loading' : 'error',
      lastUpdated: earthquakeData?.lastUpdated,
      dataCount: earthquakeData?.incidents?.length || 0,
      cached: earthquakeData?.cached,
      error: earthquakeData?.error,
      icon: Zap,
      description: "USGS earthquake monitoring"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'loading':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'loading':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const connectedCount = apiStatuses.filter(api => api.status === 'connected').length;
  const totalCount = apiStatuses.length;

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-600 text-white border-blue-600 shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 animate-pulse"
        >
          <Activity className="w-4 h-4 mr-2" />
          Watch Center ({connectedCount}/{totalCount})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-96">
      <Card className="shadow-2xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Watch Center
              <Badge variant="outline" className={`text-xs ${connectedCount === totalCount ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                {connectedCount}/{totalCount} Online
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setRefreshKey(prev => prev + 1)}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="outline"
                size="sm"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {apiStatuses.map((api, index) => {
              const Icon = api.icon;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(api.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-semibold text-sm">{api.name}</span>
                      {getStatusIcon(api.status)}
                    </div>
                    {api.cached && (
                      <Badge variant="outline" className="text-xs">
                        Cached
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs opacity-75 mb-2">{api.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {api.lastUpdated && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(api.lastUpdated), 'HH:mm:ss')}</span>
                      </div>
                    )}
                    
                    {api.dataCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        <span>{api.dataCount} records</span>
                      </div>
                    )}
                  </div>

                  {api.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                      <strong>Error:</strong> {api.error}
                    </div>
                  )}

                  {api.status === 'connected' && !api.error && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Wifi className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Connected & Receiving Data</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Last checked: {format(new Date(), 'HH:mm:ss')}</span>
              <span>Auto-refresh: 30s</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}