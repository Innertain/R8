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
  } | null;
  precipitationData?: {
    value: number;
    unit: string;
  } | null;
  percentageData?: number | null;
  reportType: string;
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
    other: NoaaReport[];
  };
  totalReports: number;
  lastUpdated: string;
  source: string;
  cached?: boolean;
}

const categoryIcons = {
  temperature: Thermometer,
  drought: Droplets,
  wildfire: Flame,
  storms: Wind,
  ice: Snowflake,
  other: Cloud
};

const categoryColors = {
  temperature: '#ff6b6b',
  drought: '#feca57',
  wildfire: '#ff9ff3',
  storms: '#54a0ff',
  ice: '#5f27cd',
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

  const { reports, categorized, totalReports, lastUpdated, source, cached } = data;

  // Prepare chart data
  const categoryData = Object.entries(categorized).map(([key, reports]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: reports.length,
    color: categoryColors[key as keyof typeof categoryColors]
  }));

  // Extract temperature trends from recent reports
  const temperatureTrends = categorized.temperature
    .filter(report => report.temperatureAnomaly)
    .slice(0, 12)
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
        <Badge variant="outline" className="text-sm">
          {totalReports} Reports • {source}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(categorized).map(([category, reports]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const color = categoryColors[category as keyof typeof categoryColors];
          
          return (
            <Card key={category} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">
                      {category === 'other' ? 'Other Reports' : category}
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

      {/* Data Visualization Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="drought">Drought</TabsTrigger>
          <TabsTrigger value="extreme">Extreme Events</TabsTrigger>
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

            {/* Other Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-gray-500" />
                  Other Climate Reports ({categorized.other.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {categorized.other.length > 0 ? (
                    categorized.other.slice(0, 5).map((report) => (
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
                    <p className="text-sm text-gray-500">No other reports available</p>
                  )}
                </div>
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
                                {report.percentageData}%
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