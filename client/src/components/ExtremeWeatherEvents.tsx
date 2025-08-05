import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Users, 
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  Cloud,
  Snowflake,
  Flame,
  Wind,
  Droplets
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

interface StormEvent {
  id: string;
  eventType: string;
  state: string;
  county: string;
  beginDate: string;
  endDate: string;
  deaths: number;
  injuries: number;
  damageProperty: number;
  damageCrops: number;
  magnitude: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ExtremeWeatherData {
  success: boolean;
  events: StormEvent[];
  totalEvents: number;
  statistics: {
    eventTypes: Record<string, number>;
    stateImpacts: Record<string, number>;
    monthlyDistribution: Record<string, number>;
    totals: {
      deaths: number;
      injuries: number;
      propertyDamage: number;
      cropDamage: number;
      totalDamage: number;
    };
  };
  trends: {
    monthlyTrends: Record<string, any>;
    topEventTypes: [string, number][];
  };
  timeRange: string;
}

const eventTypeIcons: Record<string, any> = {
  'Tornado': Wind,
  'Hurricane': Wind,
  'Flash Flood': Droplets,
  'Wildfire': Flame,
  'Winter Storm': Snowflake,
  'Severe Thunderstorm': Zap,
  'Drought': Cloud,
  'Heat Wave': Flame,
  'Blizzard': Snowflake,
  'Hail Storm': Cloud,
  'Ice Storm': Snowflake
};

const severityColors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626'];

export default function ExtremeWeatherEvents() {
  const { data, isLoading, error } = useQuery<ExtremeWeatherData>({
    queryKey: ['/api/extreme-weather-events'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Loading Extreme Weather Events...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Weather Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to load extreme weather events data. Please try again later.</p>
          <p className="text-sm text-gray-500 mt-2">Error details: {error?.message || 'Unknown error'}</p>
        </CardContent>
      </Card>
    );
  }
  
  const { events, statistics, trends, totalEvents, timeRange } = data;

  console.log('ExtremeWeatherEvents data:', { success: data?.success, totalEvents, eventsLength: events?.length });

  // Handle empty data case
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            No Weather Events Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No extreme weather events data is currently available.</p>
          <p className="text-sm text-gray-500 mt-2">Time range: {timeRange || 'Unknown'}</p>
          <p className="text-sm text-gray-500 mt-1">Total events received: {totalEvents || 0}</p>
        </CardContent>
      </Card>
    );
  }

  // Process data for charts
  const eventTypeChart = Object.entries(statistics.eventTypes).map(([type, count]) => ({
    name: type,
    value: count,
    percentage: Math.round((count / totalEvents) * 100)
  }));

  const monthlyChart = Object.entries(statistics.monthlyDistribution).map(([month, count]) => ({
    month: month.substring(0, 3),
    events: count
  }));

  const topStatesChart = Object.entries(statistics.stateImpacts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 8)
    .map(([state, count]) => ({
      state,
      events: count
    }));

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getSeverityLevel = (event: StormEvent) => {
    const casualties = event.deaths + event.injuries;
    const damage = event.damageProperty + event.damageCrops;
    
    if (casualties >= 10 || damage >= 100000000) return 'Critical';
    if (casualties >= 5 || damage >= 50000000) return 'High';
    if (casualties >= 1 || damage >= 10000000) return 'Moderate';
    return 'Low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Moderate': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{timeRange}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Casualties</p>
                <p className="text-2xl font-bold text-red-600">
                  {(statistics.totals.deaths + statistics.totals.injuries).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {statistics.totals.deaths} deaths, {statistics.totals.injuries} injuries
                </p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Damage</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(statistics.totals.totalDamage)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Property + Crop damage
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg per Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(totalEvents / 12)}
                </p>
                <p className="text-xs text-gray-500 mt-1">events per month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Event List</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Types Distribution</CardTitle>
                <CardDescription>Breakdown by weather event type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {eventTypeChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={severityColors[index % severityColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Distribution</CardTitle>
                <CardDescription>Events by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="events" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Affected States */}
          <Card>
            <CardHeader>
              <CardTitle>Most Affected States</CardTitle>
              <CardDescription>States with highest number of extreme weather events</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topStatesChart} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="state" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="events" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Extreme Weather Events</CardTitle>
              <CardDescription>
                Comprehensive list of {totalEvents} events from {timeRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {events.slice(0, 20).map((event) => {
                  const EventIcon = eventTypeIcons[event.eventType] || AlertTriangle;
                  const severity = getSeverityLevel(event);
                  
                  return (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <EventIcon className="h-5 w-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{event.stormSummary || event.episodeNarrative || event.eventType}</h4>
                              <Badge variant={getSeverityColor(severity) as any}>{severity}</Badge>
                            </div>
                            {event.stormSummary && event.stormSummary !== event.eventType && (
                              <p className="text-sm text-gray-600 mb-2">{event.stormSummary}</p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{event.county}, {event.state}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(event.beginDate), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{event.deaths + event.injuries} casualties</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatCurrency(event.damageProperty + event.damageCrops)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {events.length > 20 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  Showing 20 of {totalEvents} events
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Severity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
              <CardDescription>Detailed breakdown of casualties and damage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Human Impact</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Deaths:</span>
                      <span className="font-medium">{statistics.totals.deaths}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Injuries:</span>
                      <span className="font-medium">{statistics.totals.injuries}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Total Casualties:</span>
                      <span className="font-medium">{statistics.totals.deaths + statistics.totals.injuries}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">Economic Impact</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Property Damage:</span>
                      <span className="font-medium">{formatCurrency(statistics.totals.propertyDamage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crop Damage:</span>
                      <span className="font-medium">{formatCurrency(statistics.totals.cropDamage)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Total Damage:</span>
                      <span className="font-medium">{formatCurrency(statistics.totals.totalDamage)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">Event Statistics</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Events:</span>
                      <span className="font-medium">{totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg per Month:</span>
                      <span className="font-medium">{Math.round(totalEvents / 12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Common:</span>
                      <span className="font-medium">{trends.topEventTypes[0]?.[0] || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Type Rankings</CardTitle>
              <CardDescription>Most common extreme weather events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.topEventTypes.slice(0, 8).map(([eventType, count], index) => {
                  const percentage = Math.round((count / totalEvents) * 100);
                  return (
                    <div key={eventType} className="flex items-center gap-3">
                      <div className="w-6 text-sm text-gray-500">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{eventType}</span>
                          <span className="text-sm text-gray-600">{count} events ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}