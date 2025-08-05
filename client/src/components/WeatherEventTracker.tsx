import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Calendar, 
  Activity,
  AlertTriangle,
  Cloud,
  Zap,
  Wind,
  Sun,
  Thermometer,
  Droplets
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface WeatherReport {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  location?: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Normal';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface WeatherAPIResponse {
  success: boolean;
  reports: WeatherReport[];
  totalReports: number;
  lastUpdated: string;
  sources: string[];
  cached: boolean;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('storm') || cat.includes('tornado')) return <Zap className="h-4 w-4" />;
  if (cat.includes('temperature') || cat.includes('heat')) return <Thermometer className="h-4 w-4" />;
  if (cat.includes('drought') || cat.includes('flooding')) return <Droplets className="h-4 w-4" />;
  if (cat.includes('wind')) return <Wind className="h-4 w-4" />;
  return <Cloud className="h-4 w-4" />;
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export default function WeatherEventTracker() {
  const { data, isLoading, error } = useQuery<WeatherAPIResponse>({
    queryKey: ['/api/noaa-monthly-reports'],
    refetchInterval: 2 * 60 * 60 * 1000, // Refetch every 2 hours
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load weather event data. {error?.message || 'Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }

  const reports = data.reports || [];
  
  // Count events by category
  const eventCounts = reports.reduce((acc: Record<string, number>, report) => {
    acc[report.category] = (acc[report.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(eventCounts).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count,
    fill: category.includes('Storm') ? '#3b82f6' : 
          category.includes('Temperature') ? '#ef4444' :
          category.includes('Drought') ? '#f59e0b' : '#6b7280'
  }));

  // Recent events (last 30 days)
  const recentEvents = reports
    .filter(report => {
      const reportDate = new Date(report.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return reportDate >= thirtyDaysAgo;
    })
    .slice(0, 5);

  // Location-based summary
  const locationCounts = reports.reduce((acc: Record<string, number>, report) => {
    if (report.location) {
      acc[report.location] = (acc[report.location] || 0) + 1;
    }
    return acc;
  }, {});

  const topLocations = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              Weather events tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storm Events</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventCounts['Storms'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Storm systems recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(locationCounts).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Geographic areas affected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {data.lastUpdated ? format(new Date(data.lastUpdated), 'MMM dd') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Data refresh date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Categories Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Event Types</CardTitle>
          <CardDescription>
            Count of weather events by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Weather Events</CardTitle>
            <CardDescription>
              Latest events from the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.length > 0 ? recentEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getCategoryIcon(event.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">{event.title}</h4>
                      <Badge className={`text-xs ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {event.location && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No recent events in the last 30 days</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Affected Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Most Affected Locations</CardTitle>
            <CardDescription>
              Geographic areas with the most weather events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topLocations.length > 0 ? topLocations.map(([location, count]) => (
                <div key={location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{location}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {count} events
                  </Badge>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No location data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Source Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Data Sources</h3>
              <p className="text-sm text-blue-800">
                Weather event data from: {data.sources?.join(', ') || 'NOAA RSS Feeds'}. 
                This shows practical weather tracking including storm counts, geographic locations, 
                and event severity levels. Data is updated {data.cached ? 'from cache' : 'in real-time'}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}