import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wind, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Thermometer,
  Eye,
  Users,
  Leaf,
  RefreshCw,
  Activity
} from 'lucide-react';
import DataSourceAttribution from '@/components/DataSourceAttribution';

interface AirQualityAlert {
  id: string;
  stationId: string;
  stationName: string;
  aqi: number;
  aqiCategory: string;
  primaryPollutant: string;
  location: string;
  state: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  healthRecommendations: string[];
  affectedGroups: string[];
  dataSource: string;
}

interface AirQualityResponse {
  success: boolean;
  alerts: AirQualityAlert[];
  count: number;
  lastUpdated: string;
  sources: string[];
}

export default function AirQualityPage() {
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const { data: airQualityData, isLoading, refetch } = useQuery<AirQualityResponse>({
    queryKey: ['/api/air-quality/current'],
    staleTime: 2 * 60 * 60 * 1000, // 2 hours - optimized
    gcTime: 4 * 60 * 60 * 1000, // 4 hours cache - optimized
  });

  const handleManualRefresh = async () => {
    setIsManualRefresh(true);
    try {
      await fetch('/api/air-quality/monitor', { method: 'POST' });
      await refetch();
    } catch (error) {
      console.error('Error triggering manual refresh:', error);
    } finally {
      setIsManualRefresh(false);
    }
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return 'bg-green-100 text-green-800 border-green-200';
    if (aqi <= 100) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (aqi <= 150) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (aqi <= 200) return 'bg-red-100 text-red-800 border-red-200';
    if (aqi <= 300) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-900 text-white border-gray-700';
  };

  const getAQIIcon = (aqi: number) => {
    if (aqi <= 50) return <Leaf className="w-4 h-4" />;
    if (aqi <= 100) return <Eye className="w-4 h-4" />;
    if (aqi <= 150) return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getSeverityText = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getPollutantDisplay = (pollutant: string): string => {
    const pollutants: Record<string, string> = {
      'pm25': 'PM2.5',
      'pm10': 'PM10',
      'ozone': 'Ozone',
      'no2': 'NO₂',
      'so2': 'SO₂',
      'co': 'Carbon Monoxide'
    };
    return pollutants[pollutant] || pollutant.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading air quality data...</p>
          </div>
        </div>
      </div>
    );
  }

  const alerts = airQualityData?.alerts || [];
  const significantAlerts = alerts.filter(alert => alert.aqi > 100);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Wind className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Air Quality Monitor</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Real-time air quality monitoring and health alerts from EPA, PurpleAir, and global monitoring networks
        </p>
        
        <div className="flex justify-center items-center gap-4">
          <Button 
            onClick={handleManualRefresh}
            disabled={isManualRefresh}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isManualRefresh ? 'animate-spin' : ''}`} />
            {isManualRefresh ? 'Updating...' : 'Refresh Data'}
          </Button>
          
          <DataSourceAttribution
            source="EPA AQS + PurpleAir + WAQI"
            lastUpdated={airQualityData?.lastUpdated || new Date().toISOString()}
            dataType="Real-time air quality"
            reliability="official"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Current Air Quality Status
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{alerts.length}</div>
              <div className="text-sm text-gray-600">Monitoring Stations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">{significantAlerts.length}</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{airQualityData?.sources.length || 3}</div>
              <div className="text-sm text-gray-600">Data Sources</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Cards */}
      {significantAlerts.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Current Air Quality Alerts
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {significantAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-orange-400">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{alert.stationName}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${getAQIColor(alert.aqi)} flex items-center gap-1`}>
                      {getAQIIcon(alert.aqi)}
                      AQI {alert.aqi}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700 mb-1">Air Quality Level</div>
                      <div className="text-gray-600">{getSeverityText(alert.aqi)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 mb-1">Primary Pollutant</div>
                      <div className="text-gray-600">{getPollutantDisplay(alert.primaryPollutant)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Affected Groups
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {alert.affectedGroups.map((group, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-gray-700 mb-2">Health Recommendations</div>
                    <div className="space-y-1">
                      {alert.healthRecommendations.map((rec, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Data Source: {alert.dataSource}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Good Air Quality</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No significant air quality alerts at this time. All monitored areas show acceptable air quality levels.
            </p>
          </CardContent>
        </Card>
      )}

      {/* All Stations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          All Monitoring Stations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{alert.stationName}</h4>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {alert.location}
                    </div>
                  </div>
                  <Badge className={`${getAQIColor(alert.aqi)} text-xs`}>
                    {alert.aqi}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={alert.aqi > 100 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                      {getSeverityText(alert.aqi)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primary:</span>
                    <span>{getPollutantDisplay(alert.primaryPollutant)}</span>
                  </div>
                  <div className="text-xs text-gray-500 pt-1 border-t">
                    {alert.dataSource}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Thermometer className="w-6 h-6 text-blue-600" />
            Understanding Air Quality Index (AQI)
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">AQI Scale</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">0-50: Good</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">51-100: Moderate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">101-150: Unhealthy for Sensitive Groups</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">151-200: Unhealthy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">201-300: Very Unhealthy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-800 rounded"></div>
                  <span className="text-sm">301+: Hazardous</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• <strong>EPA AQS:</strong> Official government monitoring stations</div>
                <div>• <strong>PurpleAir:</strong> Crowdsourced sensor network</div>
                <div>• <strong>WAQI:</strong> Global air quality monitoring</div>
                <div>• <strong>Updates:</strong> Every 30 minutes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}