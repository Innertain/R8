import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Snowflake, 
  Flame, 
  Cloud, 
  Globe, 
  Calendar,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';

interface NoaaReport {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  pubDate: string;
  temperatureAnomaly?: {
    value: number;
    unit: string;
    confidence?: string;
  } | null;
  precipitationData?: {
    value: number;
    unit: string;
    confidence?: string;
  } | null;
  percentageData?: {
    value: number;
    context: string;
    confidence: string;
  } | number | null;
  reportType: string;
  severityLevel?: string;
  geographicScope?: string;
  feedSource?: string;
}

interface NoaaClimateData {
  success: boolean;
  reports: NoaaReport[];
  categorized: {
    temperature: NoaaReport[];
    drought: NoaaReport[];
    wildfire: NoaaReport[];
    storms: NoaaReport[];
    ice: NoaaReport[];
    flooding: NoaaReport[];
    air_quality: NoaaReport[];
    ocean: NoaaReport[];
    other: NoaaReport[];
  };
  totalReports: number;
  originalCount: number;
  statistics: {
    severity: Record<string, number>;
    geographicScope: Record<string, number>;
    feedSources: Record<string, number>;
    temperatureTrends: any[];
    precipitationTrends: any[];
  };
  feedResults: Array<{
    url: string;
    success: boolean;
    itemCount: number;
    error?: string;
  }>;
  lastUpdated: string;
  sources: string[];
  cached?: boolean;
}

const categoryIcons = {
  temperature: Thermometer,
  drought: Droplets,
  wildfire: Flame,
  storms: Wind,
  ice: Snowflake,
  flooding: Droplets,
  air_quality: Wind,
  ocean: Droplets,
  other: Cloud
};

const categoryColors = {
  temperature: '#ff6b6b',
  drought: '#feca57',
  wildfire: '#ff9ff3',
  storms: '#54a0ff',
  ice: '#5f27cd',
  flooding: '#3742fa',
  air_quality: '#70a1ff',
  ocean: '#5352ed',
  other: '#74b9ff'
};

const severityColors = {
  severe: '#e74c3c',
  moderate: '#f39c12',
  normal: '#27ae60'
};

export default function NoaaClimateReports() {
  const { data, isLoading, error } = useQuery<NoaaClimateData>({
    queryKey: ['/api/noaa-monthly-reports'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Thermometer className="h-6 w-6 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold">NOAA Climate Reports</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            NOAA Climate Data Unavailable
          </CardTitle>
          <CardDescription className="text-red-600">
            Unable to fetch climate reports from NOAA. Please check your internet connection.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { 
    reports, 
    categorized, 
    totalReports, 
    originalCount = 0, 
    statistics = { severity: {}, geographicScope: {}, feedSources: {}, temperatureTrends: [], precipitationTrends: [] }, 
    feedResults = [], 
    lastUpdated, 
    sources = [], 
    cached 
  } = data;

  // Prepare chart data
  const categoryData = Object.entries(categorized).map(([key, reports]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: reports.length,
    color: categoryColors[key as keyof typeof categoryColors]
  }));

  // Extract temperature trends from recent reports
  const temperatureTrends = categorized.temperature
    .filter(report => report.temperatureAnomaly)
    .slice(0, 24)
    .map((report, index) => ({
      month: format(new Date(report.pubDate), 'MMM'),
      anomaly: report.temperatureAnomaly?.value || 0,
      date: report.pubDate
    }));

  // Get recent drought percentages
  const droughtData = categorized.drought
    .filter(report => report.percentageData)
    .slice(0, 8)
    .map((report, index) => ({
      region: `Report ${index + 1}`,
      percentage: report.percentageData || 0,
      date: report.pubDate
    }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NOAA Climate Reports</h1>
            <p className="text-gray-600 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              Last updated: {format(new Date(lastUpdated), 'PPP p')}
              {cached && <Badge variant="secondary" className="ml-2">Cached</Badge>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {totalReports} Unique Reports
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {originalCount} Total Sources
          </Badge>
          <Badge variant="outline" className="text-sm">
            {feedResults?.filter(f => f.success).length || 0}/{feedResults?.length || 0} Feeds Active
          </Badge>
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="space-y-6">
        {/* Category Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Climate Report Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(categorized).map(([category, reports]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const color = categoryColors[category as keyof typeof categoryColors];
              
              return (
                <Card key={category} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">
                          {category === 'air_quality' ? 'Air Quality' : 
                           category === 'other' ? 'Other Reports' : 
                           category.replace('_', ' ')}
                        </p>
                        <p className="text-2xl font-bold" style={{ color }}>
                          {reports.length}
                        </p>
                      </div>
                      <Icon className="h-8 w-8" style={{ color }} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statistics?.severity || {}).map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{level}</span>
                    <Badge variant={level === 'critical' ? 'destructive' : 
                                  level === 'high' ? 'default' : 'secondary'}>
                      {count}
                    </Badge>
                  </div>
                ))}
                {Object.keys(statistics?.severity || {}).length === 0 && (
                  <p className="text-sm text-gray-500">No severity data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Geographic Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statistics?.geographicScope || {}).map(([scope, count]) => (
                  <div key={scope} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{scope}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
                {Object.keys(statistics?.geographicScope || {}).length === 0 && (
                  <p className="text-sm text-gray-500">No geographic data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(feedResults || []).map((feed, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 truncate">
                      {feed.success ? sources?.[index]?.split(' ')[0] || `Feed ${index + 1}` : `Failed ${index + 1}`}
                    </span>
                    <Badge variant={feed.success ? 'default' : 'destructive'} className="text-xs">
                      {feed.success ? feed.itemCount : 'Error'}
                    </Badge>
                  </div>
                ))}
                {(!feedResults || feedResults.length === 0) && (
                  <p className="text-sm text-gray-500">No feed data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Data Visualization Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="extreme">Extreme Events</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">All Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Report Distribution by Category</CardTitle>
                <CardDescription>Breakdown of current climate reports</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Climate Activity</CardTitle>
                <CardDescription>Latest 10 reports across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {reports.slice(0, 10).map((report) => {
                    const categoryKey = Object.keys(categorized).find(key => 
                      categorized[key as keyof typeof categorized].includes(report)
                    ) || 'other';
                    const Icon = categoryIcons[categoryKey as keyof typeof categoryIcons];
                    const color = categoryColors[categoryKey as keyof typeof categoryColors];
                    
                    return (
                      <div key={report.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                        <Icon className="h-5 w-5 mt-1" style={{ color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {report.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(report.pubDate), 'MMM d, yyyy')} • {report.reportType}
                          </p>
                        </div>
                        <Badge variant="outline" style={{ borderColor: color, color }}>
                          {categoryKey}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="temperature" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                Temperature Anomaly Trends
              </CardTitle>
              <CardDescription>
                Temperature deviations from historical averages over recent months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {temperatureTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={temperatureTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Temperature Anomaly (°F)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}°F`, 'Anomaly']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="anomaly" 
                      stroke="#ff6b6b" 
                      fill="#ff6b6b" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No temperature anomaly data available in recent reports
                </div>
              )}
            </CardContent>
          </Card>

          {/* Temperature Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Temperature Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorized.temperature.slice(0, 5).map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{report.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{format(new Date(report.pubDate), 'PPP')}</span>
                          <span>{report.reportType}</span>
                          {report.temperatureAnomaly && (
                            <Badge 
                              variant={report.temperatureAnomaly.value > 0 ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {report.temperatureAnomaly.value > 0 ? 
                                <TrendingUp className="h-3 w-3 mr-1" /> : 
                                <TrendingDown className="h-3 w-3 mr-1" />
                              }
                              {Math.abs(report.temperatureAnomaly.value)}°{report.temperatureAnomaly.unit.charAt(0).toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={report.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drought" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-yellow-500" />
                Drought Conditions
              </CardTitle>
              <CardDescription>
                Percentage data from recent drought monitoring reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {droughtData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={droughtData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis label={{ value: 'Drought %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Drought Level']}
                    />
                    <Bar dataKey="percentage" fill="#feca57" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No drought percentage data available in recent reports
                </div>
              )}
            </CardContent>
          </Card>

          {/* Drought Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Drought Monitoring Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorized.drought.length > 0 ? (
                  categorized.drought.slice(0, 5).map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{report.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {report.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{format(new Date(report.pubDate), 'PPP')}</span>
                            <span>{report.reportType}</span>
                            {report.percentageData && (
                              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                                {report.percentageData}% affected
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={report.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No drought reports available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drought Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-yellow-500" />
                  Drought Conditions ({categorized.drought.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categorized.drought.length > 0 ? (
                    categorized.drought.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {format(new Date(report.pubDate), 'MMM d')}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No drought reports available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Air Quality Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-blue-500" />
                  Air Quality Reports ({categorized.air_quality.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categorized.air_quality.length > 0 ? (
                    categorized.air_quality.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {format(new Date(report.pubDate), 'MMM d')}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No air quality reports available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ocean/Marine Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-blue-600" />
                  Ocean & Marine Reports ({categorized.ocean.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categorized.ocean.length > 0 ? (
                    categorized.ocean.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {format(new Date(report.pubDate), 'MMM d')}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No ocean/marine reports available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Flooding Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-cyan-500" />
                  Flooding Reports ({categorized.flooding.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categorized.flooding.length > 0 ? (
                    categorized.flooding.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {format(new Date(report.pubDate), 'MMM d')}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No flooding reports available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="extreme" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wildfire Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flame className="h-5 w-5 mr-2 text-orange-500" />
                  Wildfire Reports ({categorized.wildfire.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categorized.wildfire.length > 0 ? (
                    categorized.wildfire.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {format(new Date(report.pubDate), 'MMM d')}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No wildfire reports available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Storm Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wind className="h-5 w-5 mr-2 text-blue-500" />
                  Storm Reports ({categorized.storms.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categorized.storms.length > 0 ? (
                    categorized.storms.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {format(new Date(report.pubDate), 'MMM d')}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No storm reports available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ice & Snow Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Snowflake className="h-5 w-5 mr-2 text-cyan-500" />
                  Ice & Snow Reports ({categorized.ice.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categorized.ice.length > 0 ? (
                    categorized.ice.slice(0, 5).map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {format(new Date(report.pubDate), 'MMM d')}
                          </span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No ice/snow reports available</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                  Temperature Trends
                </CardTitle>
                <CardDescription>Recent temperature anomaly data from reports</CardDescription>
              </CardHeader>
              <CardContent>
                {statistics?.temperatureTrends && statistics.temperatureTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={statistics.temperatureTrends.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      />
                      <YAxis label={{ value: 'Anomaly (°F)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}°F`, 'Temperature Anomaly']}
                        labelFormatter={(date) => format(new Date(date), 'PPP')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ff6b6b" 
                        strokeWidth={2}
                        dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No temperature trend data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Precipitation Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                  Precipitation Trends
                </CardTitle>
                <CardDescription>Recent precipitation data from reports</CardDescription>
              </CardHeader>
              <CardContent>
                {statistics?.precipitationTrends && statistics.precipitationTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={statistics.precipitationTrends.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      />
                      <YAxis label={{ value: 'Precipitation', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => 
                          [`${value} ${props.payload.unit}`, 'Precipitation']}
                        labelFormatter={(date) => format(new Date(date), 'PPP')}
                      />
                      <Bar dataKey="value" fill="#54a0ff" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No precipitation trend data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Severity Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Severity Analysis
                </CardTitle>
                <CardDescription>Distribution of report severity levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(statistics?.severity || {}).map(([level, count]) => ({
                        name: level.charAt(0).toUpperCase() + level.slice(1),
                        value: count,
                        color: level === 'critical' ? '#e74c3c' : 
                               level === 'high' ? '#f39c12' : 
                               level === 'moderate' ? '#3498db' : '#27ae60'
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(statistics?.severity || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry[0] === 'critical' ? '#e74c3c' : 
                          entry[0] === 'high' ? '#f39c12' : 
                          entry[0] === 'moderate' ? '#3498db' : '#27ae60'
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Scope Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-500" />
                  Geographic Coverage
                </CardTitle>
                <CardDescription>Distribution by geographic scope</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Object.entries(statistics?.geographicScope || {}).map(([scope, count]) => ({
                    scope: scope.charAt(0).toUpperCase() + scope.slice(1),
                    count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scope" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value, 'Reports']} />
                    <Bar dataKey="count" fill="#27ae60" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Climate Reports ({totalReports})</CardTitle>
              <CardDescription>Complete list of NOAA monthly climate monitoring reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reports.map((report) => {
                  const categoryKey = Object.keys(categorized).find(key => 
                    categorized[key as keyof typeof categorized].includes(report)
                  ) || 'other';
                  const color = categoryColors[categoryKey as keyof typeof categoryColors];
                  
                  return (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{report.title}</h3>
                            <Badge variant="outline" style={{ borderColor: color, color }}>
                              {categoryKey}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                            {report.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{format(new Date(report.pubDate), 'PPP')}</span>
                            <span>{report.reportType}</span>
                            {report.temperatureAnomaly && (
                              <span className="text-red-600">
                                Temp: {report.temperatureAnomaly.value > 0 ? '+' : ''}{report.temperatureAnomaly.value}°{report.temperatureAnomaly.unit.charAt(0).toUpperCase()}
                              </span>
                            )}
                            {report.precipitationData && (
                              <span className="text-blue-600">
                                Precip: {report.precipitationData.value} {report.precipitationData.unit}
                              </span>
                            )}
                            {report.percentageData && (
                              <span className="text-yellow-600">
                                {typeof report.percentageData === 'object' 
                                  ? `${report.percentageData.value}% ${report.percentageData.context}`
                                  : `${report.percentageData}%`}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={report.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
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