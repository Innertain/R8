import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Thermometer, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Calendar,
  BarChart3,
  Activity,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Shield // Added Shield import
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import TemperatureAnomalyExplainer from './TemperatureAnomalyExplainer';

interface ClimateDataPoint {
  id: string;
  date: string;
  year: number;
  region: string;
  temperatureAnomaly: number;
  baselinePeriod: string;
  dataType: string;
  unit: string;
  source: string;
  significance: 'high' | 'moderate' | 'normal';
}

interface ClimateAnalysis {
  temperatureTrends: {
    recent: Array<{
      year: number;
      anomaly: number;
      region: string;
      significance: string;
    }>;
    historical: Array<{
      year: number;
      anomaly: number;
      region: string;
    }>;
    records: {
      hottestYear: ClimateDataPoint | null;
      coldestYear: ClimateDataPoint | null;
      greatestWarmingAnomaly: ClimateDataPoint | null;
      greatestCoolingAnomaly: ClimateDataPoint | null;
    };
  };
  timeSeriesData: Array<{
    date: string;
    year: number;
    value: number;
    region: string;
    baseline: number;
    significance: string;
  }>;
  baselineComparisons: {
    currentDecade: number;
    previousDecade: number;
    historical20th: number;
    preIndustrial: number;
  };
  climateTrends: {
    globalWarming: boolean;
    decadalTrend: number;
    acceleratingTrend: boolean;
  };
}

interface NoaaClimateAPIResponse {
  success: boolean;
  climateData: ClimateDataPoint[];
  totalDataPoints: number;
  analysis: ClimateAnalysis;
  dataSourceResults: Array<{
    url: string;
    success: boolean;
    itemCount: number;
    error?: string;
  }>;
  lastUpdated: string;
  sources: string[];
  dataTypes: string[];
  cached: boolean;
}

export default function NoaaClimateAnalytics() {
  const { data, isLoading, error } = useQuery<NoaaClimateAPIResponse>({
    queryKey: ['/api/noaa-climate-data'],
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
          Unable to load NOAA climate data. {error?.message || 'Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }

  const { climateData, analysis, totalDataPoints, sources, lastUpdated, cached } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NOAA Climate Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive climate data analysis with historical baselines and temperature anomalies
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Updated: {format(new Date(lastUpdated), 'PPp')}</span>
          {cached && <Badge variant="outline">Cached</Badge>}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Warming Trend</CardTitle>
            {analysis.climateTrends.globalWarming ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-blue-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.climateTrends.globalWarming ? '+' : ''}{analysis.climateTrends.decadalTrend.toFixed(2)}°C
            </div>
            <p className="text-xs text-gray-500">
              Decadal trend {analysis.climateTrends.acceleratingTrend ? '(accelerating)' : '(stable)'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Decade Anomaly</CardTitle>
            <Thermometer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.baselineComparisons.currentDecade > 0 ? '+' : ''}{analysis.baselineComparisons.currentDecade.toFixed(2)}°C
            </div>
            <p className="text-xs text-gray-500">
              vs. 20th century average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hottest Year</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.temperatureTrends.records.hottestYear?.year || 'N/A'}
            </div>
            <p className="text-xs text-gray-500">
              {analysis.temperatureTrends.records.hottestYear ? 
                `+${analysis.temperatureTrends.records.hottestYear.temperatureAnomaly.toFixed(2)}°C anomaly` : 
                'No data available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDataPoints.toLocaleString()}</div>
            <p className="text-xs text-gray-500">
              From {sources.length} official NOAA sources
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Temperature Trends</TabsTrigger>
          <TabsTrigger value="anomalies">Historical Anomalies</TabsTrigger>
          <TabsTrigger value="baselines">Baseline Comparisons</TabsTrigger>
          <TabsTrigger value="records">Climate Records</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                Global Temperature Anomaly Trends
              </CardTitle>
              <CardDescription>
                Temperature deviations from 20th century baseline (1901-2000)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analysis.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    label={{ value: 'Temperature Anomaly (°C)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value > 0 ? '+' : ''}${value.toFixed(2)}°C`, 
                      'Temperature Anomaly'
                    ]}
                    labelFormatter={(year) => `Year: ${year}`}
                  />
                  <ReferenceLine y={0} stroke="black" strokeDasharray="2 2" />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#e74c3c"
                    fill="#e74c3c"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trends (Last 10 Years)</CardTitle>
                <CardDescription>Temperature anomalies by significance level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analysis.temperatureTrends.recent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}°C`, 'Anomaly']}
                    />
                    <Bar 
                      dataKey="anomaly" 
                      fill="#3498db"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Climate Trend Indicators</CardTitle>
                <CardDescription>Key climate change metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Global Warming Detection</span>
                  <Badge variant={analysis.climateTrends.globalWarming ? "destructive" : "default"}>
                    {analysis.climateTrends.globalWarming ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Decadal Trend</span>
                  <span className="text-sm">
                    {analysis.climateTrends.decadalTrend > 0 ? '+' : ''}{analysis.climateTrends.decadalTrend.toFixed(3)}°C
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Accelerating Trend</span>
                  <Badge variant={analysis.climateTrends.acceleratingTrend ? "destructive" : "secondary"}>
                    {analysis.climateTrends.acceleratingTrend ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Baseline Period</span>
                  <span className="text-sm">1901-2000</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
                Historical Temperature Anomalies
              </CardTitle>
              <CardDescription>
                Complete historical record of temperature deviations from baseline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analysis.temperatureTrends.historical}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Temperature Anomaly (°C)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value > 0 ? '+' : ''}${value.toFixed(2)}°C`, 
                      'Temperature Anomaly'
                    ]}
                    labelFormatter={(year) => `Year: ${year}`}
                  />
                  <ReferenceLine y={0} stroke="black" strokeDasharray="2 2" />
                  <Line
                    type="monotone"
                    dataKey="anomaly"
                    stroke="#e74c3c"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="baselines" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Baseline Period Comparisons</CardTitle>
                <CardDescription>Average temperature anomalies by time period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Current Decade (2020s)</span>
                    <span className="text-lg font-bold text-red-600">
                      {analysis.baselineComparisons.currentDecade > 0 ? '+' : ''}{analysis.baselineComparisons.currentDecade.toFixed(2)}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Previous Decade (2010s)</span>
                    <span className="text-lg font-bold text-orange-600">
                      {analysis.baselineComparisons.previousDecade > 0 ? '+' : ''}{analysis.baselineComparisons.previousDecade.toFixed(2)}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">20th Century (1901-2000)</span>
                    <span className="text-lg font-bold text-gray-600">0.00°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Coverage</CardTitle>
                <CardDescription>Climate data sources and coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sources.map((source, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{source}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                  Temperature Records
                </CardTitle>
                <CardDescription>Extreme temperature anomaly events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.temperatureTrends.records.hottestYear && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-800">Hottest Year</span>
                      <Badge variant="destructive">{analysis.temperatureTrends.records.hottestYear.year}</Badge>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      +{analysis.temperatureTrends.records.hottestYear.temperatureAnomaly.toFixed(2)}°C above baseline
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      Region: {analysis.temperatureTrends.records.hottestYear.region}
                    </p>
                  </div>
                )}

                {analysis.temperatureTrends.records.coldestYear && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-800">Coldest Year</span>
                      <Badge variant="secondary">{analysis.temperatureTrends.records.coldestYear.year}</Badge>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      {analysis.temperatureTrends.records.coldestYear.temperatureAnomaly.toFixed(2)}°C below baseline
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Region: {analysis.temperatureTrends.records.coldestYear.region}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sources Status</CardTitle>
                <CardDescription>API endpoint health and data availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.dataSourceResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <span className="text-sm">Source {index + 1}</span>
                      </div>
                      <div className="text-right">
                        {result.success ? (
                          <span className="text-xs text-green-600">{result.itemCount} items</span>
                        ) : (
                          <span className="text-xs text-red-600">Failed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Temperature Anomaly Educational Component */}
      <TemperatureAnomalyExplainer />

      {/* Data Sources Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Info className="h-5 w-5 mr-2" />
            About This Data
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p className="mb-2">
            This climate data comes directly from official NOAA sources including Climate at a Glance and 
            Climate Data Online APIs. Temperature anomalies are calculated against the 20th century 
            baseline period (1901-2000).
          </p>
          <p className="mb-4">
            Global warming trends are determined using statistical analysis of decadal temperature 
            changes. Data is updated automatically and cached for performance.
          </p>
          
          <div className="bg-white rounded-lg p-3 border border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">Related Resources</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/disaster-education?type=hurricane&tab=overview', '_blank')}
                className="text-xs bg-blue-100"
              >
                <Shield className="w-3 h-3 mr-1" />
                Extreme Weather Education
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/alerts', '_blank')}
                className="text-xs bg-blue-100"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Current Weather Alerts
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/map', '_blank')}
                className="text-xs bg-blue-100"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Disaster Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}