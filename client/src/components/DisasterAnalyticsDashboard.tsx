import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, MapPin, Calendar, AlertTriangle, Flame, Waves, Wind, Mountain, Sun, Snowflake, Zap, Download, PieChart, Clock, Info as InfoIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface DisasterAnalyticsDashboardProps {
  disasters: FemaDisasterItem[];
}

export function DisasterAnalyticsDashboard({ disasters }: DisasterAnalyticsDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeAnalysis, setActiveAnalysis] = useState<'overview' | 'trends' | 'geographic' | 'impact'>('overview');

  // Get data range info
  const dataRange = useMemo(() => {
    if (disasters.length === 0) return { start: null, end: null, years: 0 };
    
    const dates = disasters.map(d => new Date(d.declarationDate)).sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0];
    const end = dates[dates.length - 1];
    const years = Math.ceil((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    return { start, end, years };
  }, [disasters]);

  // Filter disasters based on selected filters
  const filteredDisasters = useMemo(() => {
    return disasters.filter(disaster => {
      const now = new Date();
      const declarationDate = new Date(disaster.declarationDate);
      
      // Time filter
      if (timeFilter === 'recent') {
        // Last 12 months
        const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        if (declarationDate < twelveMonthsAgo) return false;
      } else if (timeFilter === '2024') {
        if (declarationDate.getFullYear() !== 2024) return false;
      } else if (timeFilter === '2025') {
        if (declarationDate.getFullYear() !== 2025) return false;
      } else if (timeFilter === 'since2022') {
        if (declarationDate.getFullYear() < 2022) return false;
      }
      
      // State filter
      if (stateFilter !== 'all' && disaster.state !== stateFilter) return false;
      
      // Type filter
      if (typeFilter !== 'all' && disaster.incidentType !== typeFilter) return false;
      
      return true;
    });
  }, [disasters, timeFilter, stateFilter, typeFilter]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const stateStats = filteredDisasters.reduce((acc, disaster) => {
      acc[disaster.state] = (acc[disaster.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeStats = filteredDisasters.reduce((acc, disaster) => {
      const type = disaster.incidentType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const declarationTypeStats = filteredDisasters.reduce((acc, disaster) => {
      acc[disaster.declarationType] = (acc[disaster.declarationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyStats = filteredDisasters.reduce((acc, disaster) => {
      const date = new Date(disaster.declarationDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate severity indicators
    const majorDisasters = filteredDisasters.filter(d => d.declarationType === 'DR').length;
    const emergencies = filteredDisasters.filter(d => d.declarationType === 'EM').length;
    const fireManagement = filteredDisasters.filter(d => d.declarationType === 'FM').length;

    // Most affected states
    const topStates = Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Most common disaster types
    const topTypes = Object.entries(typeStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    // Timeline analysis
    const recentDisasters = filteredDisasters
      .sort((a, b) => new Date(b.declarationDate).getTime() - new Date(a.declarationDate).getTime())
      .slice(0, 20);

    return {
      total: filteredDisasters.length,
      majorDisasters,
      emergencies,
      fireManagement,
      stateStats,
      typeStats,
      declarationTypeStats,
      monthlyStats,
      topStates,
      topTypes,
      recentDisasters
    };
  }, [filteredDisasters]);

  const getDisasterIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('fire')) return Flame;
    if (lowerType.includes('flood')) return Waves;
    if (lowerType.includes('hurricane') || lowerType.includes('storm')) return Wind;
    if (lowerType.includes('earthquake')) return Mountain;
    if (lowerType.includes('drought')) return Sun;
    if (lowerType.includes('snow') || lowerType.includes('ice')) return Snowflake;
    if (lowerType.includes('tornado')) return Wind;
    if (lowerType.includes('severe storm')) return Zap;
    return AlertTriangle;
  };

  const exportAnalytics = () => {
    const analyticsData = {
      summary: analytics,
      filteredData: filteredDisasters,
      filters: { timeFilter, stateFilter, typeFilter },
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `disaster-analytics-${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const uniqueStates = Array.from(new Set(disasters.map(d => d.state))).sort();
  const uniqueTypes = Array.from(new Set(disasters.map(d => d.incidentType).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Disaster Analytics Dashboard
            </CardTitle>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Analysis of {disasters.length} FEMA disaster declarations
                {dataRange.start && dataRange.end && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Data Range: {dataRange.start.toLocaleDateString()} to {dataRange.end.toLocaleDateString()} ({dataRange.years} years)
                  </span>
                )}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-2">
                  <InfoIcon className="w-4 h-4" />
                  Critical Data Limitation - READ THIS FIRST
                </h4>
                <div className="text-xs text-red-700 space-y-2">
                  <p><strong>This is NOT complete historical data!</strong></p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium mb-1">What we have:</p>
                      <ul className="space-y-0.5">
                        <li>• 164 declarations total</li>
                        <li>• Dec 2021 - July 2025 only</li>
                        <li>• Heavy focus on 2024-2025</li>
                        <li>• Mostly recent wildfire events</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">What we're missing:</p>
                      <ul className="space-y-0.5">
                        <li>• 1953-2021 historical data</li>
                        <li>• Major CA earthquakes</li>
                        <li>• Hurricane seasons</li>
                        <li>• Thousands of declarations</li>
                      </ul>
                    </div>
                  </div>
                  <p className="font-medium">
                    <strong>California historically has the most disasters</strong> - it only ranks #3 here because we're missing decades of data.
                  </p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-2">
                  <InfoIcon className="w-4 h-4" />
                  About FEMA Disaster Types
                </h4>
                <p className="text-xs text-green-700 leading-relaxed">
                  <strong>Major Disasters (DR)</strong> trigger federal aid for individuals and communities, 
                  <strong> Emergency Declarations (EM)</strong> provide immediate federal assistance, and 
                  <strong>Fire Management Assistance (FM)</strong> helps states fight wildfires.
                </p>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3 mt-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Available Data</SelectItem>
                <SelectItem value="recent">Last 12 Months</SelectItem>
                <SelectItem value="2025">2025 Only</SelectItem>
                <SelectItem value="2024">2024 Only</SelectItem>
                <SelectItem value="since2022">Since 2022</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Disaster Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type || 'Unknown'}>{type || 'Unknown'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Declarations</p>
                <p className="text-2xl font-bold text-red-600">{analytics.total}</p>
                <p className="text-xs text-gray-500">Filtered dataset</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Major Disasters</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.majorDisasters}</p>
                <p className="text-xs text-gray-500">{((analytics.majorDisasters / analytics.total) * 100).toFixed(1)}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Emergencies</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.emergencies}</p>
                <p className="text-xs text-gray-500">{((analytics.emergencies / analytics.total) * 100).toFixed(1)}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Affected States</p>
                <p className="text-2xl font-bold text-green-600">{analytics.topStates.length}</p>
                <p className="text-xs text-gray-500">Unique locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs value={activeAnalysis} onValueChange={(value) => setActiveAnalysis(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Disaster Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="w-4 h-4" />
                  Top Disaster Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topTypes.map(([type, count]) => {
                    const Icon = getDisasterIcon(type);
                    const percentage = ((count / analytics.total) * 100).toFixed(1);
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">{type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{count}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Most Affected States */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-4 h-4" />
                  Most Affected States
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topStates.slice(0, 8).map(([state, count]) => {
                    const percentage = ((count / analytics.total) * 100).toFixed(1);
                    return (
                      <div key={state} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{count} declarations</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (count / analytics.topStates[0][1]) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Disasters Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-4 h-4" />
                Recent Disaster Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {analytics.recentDisasters.map((disaster) => {
                  const Icon = getDisasterIcon(disaster.incidentType || '');
                  return (
                    <div key={disaster.guid} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full border">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{disaster.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              disaster.declarationType === 'DR' ? 'border-red-300 text-red-700' :
                              disaster.declarationType === 'EM' ? 'border-orange-300 text-orange-700' :
                              'border-yellow-300 text-yellow-700'
                            }`}
                          >
                            {disaster.declarationType === 'DR' ? 'Major Disaster' :
                             disaster.declarationType === 'EM' ? 'Emergency' : 'Fire Mgmt'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>{disaster.state}</span>
                          <span>{disaster.incidentType}</span>
                          <span>{new Date(disaster.declarationDate).toLocaleDateString()}</span>
                          <span className="font-mono">#{disaster.disasterNumber}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Enhanced Header with Summary Stats */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    Temporal Trends Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Disaster patterns and frequency analysis over time • {analytics.total} total declarations
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-red-600">{analytics.majorDisasters}</div>
                    <div className="text-xs text-gray-600">Major Disasters</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">{analytics.emergencies}</div>
                    <div className="text-xs text-gray-600">Emergencies</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.fireManagement}</div>
                    <div className="text-xs text-gray-600">Fire Management</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Yearly Trend Chart */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Disaster Declarations Trend (2021-2025)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Dramatic increase in recent years • Shows available data only
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
                  <p className="text-xs text-blue-700">
                    <strong>2024-2025 surge:</strong> 158 declarations vs. only 6 in 2021-2023 combined
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(
                        filteredDisasters.reduce((acc, disaster) => {
                          const year = new Date(disaster.declarationDate).getFullYear().toString();
                          acc[year] = (acc[year] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([year, count]) => ({
                          year,
                          declarations: count,
                          growth: year === '2021' ? 0 : 
                                 year === '2022' ? -75 :  // Decrease from 2021
                                 year === '2023' ? 0 :    // Same as 2022
                                 year === '2024' ? 7900 : // Massive increase
                                 year === '2025' ? -2.5 : 0 // Slight decrease from 2024
                        }))}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const year = parseInt(label);
                            const count = payload[0].value;
                            let context = '';
                            if (year === 2021) context = 'Limited data (Dec only)';
                            else if (year === 2022 || year === 2023) context = 'Very low activity period';
                            else if (year === 2024) context = 'Major surge in declarations';
                            else if (year === 2025) context = 'Continued high activity (through July)';
                            
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg max-w-xs">
                                <p className="font-bold text-gray-900 text-lg">{label}</p>
                                <p className="text-blue-600 font-semibold">
                                  {`${count} declarations`}
                                </p>
                                {context && (
                                  <p className="text-xs text-gray-600 mt-1">{context}</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="declarations" 
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Year-by-year breakdown */}
                <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                  {Object.entries(
                    filteredDisasters.reduce((acc, disaster) => {
                      const year = new Date(disaster.declarationDate).getFullYear().toString();
                      acc[year] = (acc[year] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([year, count]) => (
                      <div key={year} className={`p-2 rounded-lg text-xs ${
                        year === '2024' || year === '2025' ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="font-bold text-gray-800">{year}</div>
                        <div className={`text-lg font-bold ${
                          year === '2024' || year === '2025' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {count}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {year === '2021' ? 'Dec only' :
                           year === '2022' || year === '2023' ? 'Low' :
                           year === '2024' ? 'Surge' :
                           year === '2025' ? 'High' : ''}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Declaration Type Distribution */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Declaration Type Distribution
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Breakdown by disaster classification
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.declarationTypeStats).map(([type, count]) => {
                    const percentage = ((count / analytics.total) * 100).toFixed(1);
                    const label = type === 'DR' ? 'Major Disasters' : type === 'EM' ? 'Emergencies' : 'Fire Management';
                    const color = type === 'DR' ? 'red' : type === 'EM' ? 'orange' : 'yellow';
                    const bgColor = type === 'DR' ? 'bg-red-50' : type === 'EM' ? 'bg-orange-50' : 'bg-yellow-50';
                    const borderColor = type === 'DR' ? 'border-red-200' : type === 'EM' ? 'border-orange-200' : 'border-yellow-200';
                    
                    return (
                      <div key={type} className={`p-4 rounded-lg border ${bgColor} ${borderColor} hover:shadow-sm transition-shadow`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              type === 'DR' ? 'bg-red-500' : 
                              type === 'EM' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                            <span className="font-medium text-gray-900">{label}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{count}</div>
                            <div className="text-xs text-gray-600">{percentage}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              type === 'DR' ? 'bg-red-500' : 
                              type === 'EM' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Timeline Visualization */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-green-600" />
                Recent Disaster Timeline
              </CardTitle>
              <p className="text-sm text-gray-600">
                Most recent 10 disaster declarations with incident details
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentDisasters.slice(0, 10).map((disaster, index) => {
                  const Icon = getDisasterIcon(disaster.incidentType || 'Unknown');
                  const typeColor = disaster.declarationType === 'DR' ? 'text-red-600' : 
                                  disaster.declarationType === 'EM' ? 'text-orange-600' : 'text-yellow-600';
                  const typeBg = disaster.declarationType === 'DR' ? 'bg-red-50' : 
                               disaster.declarationType === 'EM' ? 'bg-orange-50' : 'bg-yellow-50';
                  
                  return (
                    <div key={disaster.disasterNumber} className={`flex items-center gap-4 p-3 rounded-lg border ${typeBg} hover:shadow-sm transition-shadow`}>
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${typeBg}`}>
                          <Icon className={`w-4 h-4 ${typeColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {disaster.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {disaster.state} • {disaster.incidentType}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(disaster.declarationDate).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className={`text-xs ${typeColor}`}>
                          {disaster.declarationType === 'DR' ? 'Major' : 
                           disaster.declarationType === 'EM' ? 'Emergency' : 'Fire Mgmt'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Geographic Impact Analysis
                <Badge variant="destructive" className="text-xs">Recent Data Only</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Regional disaster patterns for 2024-2025 period only • Does not reflect historical patterns
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mt-2">
                <p className="text-xs text-orange-700">
                  <strong>Note:</strong> California leads historically with 300+ disasters since 1953, but ranks #3 here due to missing historical data. 
                  Oklahoma's #1 ranking reflects recent wildfire activity only.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* State Vulnerability Ranking */}
                <div>
                  <h4 className="font-medium mb-4">State Vulnerability Ranking</h4>
                  <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                    {analytics.topStates.map(([state, count], index) => {
                      // Get most common disaster type for this state
                      const stateDisasters = filteredDisasters.filter(d => d.state === state);
                      const typeCount = stateDisasters.reduce((acc, d) => {
                        const type = d.incidentType || 'Unknown';
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      const topType = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0];
                      const Icon = getDisasterIcon(topType?.[0] || '');
                      
                      return (
                        <div key={state} className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                          index < 3 ? 'bg-red-50 border-red-200 hover:border-red-300' : 
                          index < 6 ? 'bg-orange-50 border-orange-200 hover:border-orange-300' : 
                          'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
                        }`}>
                          {/* Ranking Badge */}
                          <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            index < 3 ? 'bg-red-500' : index < 6 ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}>
                            {index + 1}
                          </div>
                          
                          {/* State Name - Top */}
                          <div className="text-center mb-3">
                            <h3 className="text-xl font-bold text-gray-800">{state}</h3>
                          </div>
                          
                          {/* Disaster Type - Middle */}
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                              {topType?.[0] || 'Mixed Types'}
                            </span>
                          </div>
                          
                          {/* Count - Bottom */}
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${
                              index < 3 ? 'text-red-600' : index < 6 ? 'text-orange-600' : 'text-yellow-600'
                            }`}>
                              {count}
                            </div>
                            <div className="text-xs text-gray-600">declarations</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Regional Analysis */}
                <div>
                  <h4 className="font-medium mb-4">Disaster Type by Region</h4>
                  <div className="space-y-3">
                    {analytics.topTypes.slice(0, 6).map(([type, count]) => {
                      const statesWithType = filteredDisasters
                        .filter(d => d.incidentType === type)
                        .reduce((acc, d) => {
                          acc[d.state] = (acc[d.state] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                      
                      const topState = Object.entries(statesWithType).sort(([,a], [,b]) => b - a)[0];
                      const Icon = getDisasterIcon(type);
                      
                      return (
                        <div key={type} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4 text-gray-600" />
                            <span className="font-medium">{type}</span>
                            <Badge variant="outline">{count} total</Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            Most affected: <span className="font-medium">{topState?.[0]}</span> ({topState?.[1]} incidents)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impact & Severity Analysis</CardTitle>
              <p className="text-sm text-gray-600">
                Assessment of disaster severity and impact patterns
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Severity Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900">High Impact</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{analytics.majorDisasters}</div>
                    <div className="text-sm text-red-700">Major Disaster Declarations</div>
                    <div className="text-xs text-red-600 mt-1">
                      Require significant federal assistance
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-900">Medium Impact</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{analytics.emergencies}</div>
                    <div className="text-sm text-orange-700">Emergency Declarations</div>
                    <div className="text-xs text-orange-600 mt-1">
                      Immediate federal assistance needed
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Specialized</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{analytics.fireManagement}</div>
                    <div className="text-sm text-yellow-700">Fire Management</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Wildfire suppression assistance
                    </div>
                  </div>
                </div>

                {/* High-Impact States Analysis */}
                <div>
                  <h4 className="font-medium mb-4">High-Impact States (Major Disasters)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics.topStates
                      .filter(([state]) => {
                        const stateMajorDisasters = filteredDisasters
                          .filter(d => d.state === state && d.declarationType === 'DR').length;
                        return stateMajorDisasters > 0;
                      })
                      .slice(0, 8)
                      .map(([state, totalCount]) => {
                        const majorDisasters = filteredDisasters
                          .filter(d => d.state === state && d.declarationType === 'DR').length;
                        const emergencies = filteredDisasters
                          .filter(d => d.state === state && d.declarationType === 'EM').length;
                        
                        return (
                          <div key={state} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{state}</span>
                              <Badge variant="outline">{totalCount} total</Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Major Disasters:</span>
                                <span className="font-medium text-red-600">{majorDisasters}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Emergencies:</span>
                                <span className="font-medium text-orange-600">{emergencies}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          {/* Recommendations and Data Improvement Section */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Dashboard Recommendations & Data Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Quality Assessment */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <InfoIcon className="w-4 h-4" />
                  Current Data Quality Assessment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Coverage:</span>
                      <span className="font-medium text-purple-600">
                        {dataRange.start?.getFullYear()} - {dataRange.end?.getFullYear()} ({dataRange.years} years)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Records:</span>
                      <span className="font-medium">{disasters.length} declarations</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Completeness:</span>
                      <span className="font-medium text-red-600">Severely Limited</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Distribution:</span>
                      <span className="font-medium text-purple-600">2024: 80, 2025: 78, Earlier: 6</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Historical Coverage:</span>
                      <span className="font-medium text-red-600">Missing 1953-2021</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Update Frequency:</span>
                      <span className="font-medium text-green-600">Real-time</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reliability:</span>
                      <span className="font-medium text-green-600">High (Official FEMA)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights for Current Data */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3">Key Insights from Available Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-800">Most Active States (Recent Period)</div>
                      <div className="mt-2 space-y-1">
                        {analytics.topStates.slice(0, 3).map(([state, count], index) => (
                          <div key={state} className="flex justify-between text-xs">
                            <span>#{index + 1} {state}</span>
                            <span className="font-medium">{count} declarations</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-green-800">Declaration Types Distribution</div>
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Major Disasters (DR):</span>
                          <span className="font-medium">{analytics.majorDisasters} ({((analytics.majorDisasters / analytics.total) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emergencies (EM):</span>
                          <span className="font-medium">{analytics.emergencies} ({((analytics.emergencies / analytics.total) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fire Management (FM):</span>
                          <span className="font-medium">{analytics.fireManagement} ({((analytics.fireManagement / analytics.total) * 100).toFixed(1)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="font-medium text-orange-800">Most Common Disaster Types</div>
                      <div className="mt-2 space-y-1">
                        {analytics.topTypes.slice(0, 4).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-xs">
                            <span className="truncate">{type}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-medium text-purple-800">Temporal Pattern</div>
                      <div className="mt-2 text-xs">
                        <div className="flex justify-between">
                          <span>Avg per Month:</span>
                          <span className="font-medium">{(analytics.total / (dataRange.years * 12)).toFixed(1)} declarations</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Peak Activity:</span>
                          <span className="font-medium">
                            {Object.entries(analytics.monthlyStats)
                              .sort(([,a], [,b]) => b - a)[0]?.[0]?.split('-')[1] || 'N/A'} 
                            ({Object.entries(analytics.monthlyStats)
                              .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} declarations)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations for Improvement */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3">Recommendations for Enhanced Analytics</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="font-medium text-yellow-800 mb-2">Data Enhancement Priorities</div>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li>• Access complete FEMA historical data (1953-present)</li>
                          <li>• Include individual assistance and public assistance data</li>
                          <li>• Add economic impact metrics (damage estimates)</li>
                          <li>• Integrate county-level geographic data</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-medium text-green-800 mb-2">Analysis Improvements</div>
                        <ul className="text-xs text-green-700 space-y-1">
                          <li>• Seasonal pattern analysis</li>
                          <li>• Multi-year trend comparisons</li>
                          <li>• Population-adjusted disaster rates</li>
                          <li>• Recovery time analytics</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-800 mb-2">Visualization Enhancements</div>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Interactive geographic heat maps</li>
                          <li>• Timeline slider for historical exploration</li>
                          <li>• Disaster correlation analysis</li>
                          <li>• Predictive modeling indicators</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="font-medium text-red-800 mb-2">Data Integration Opportunities</div>
                        <ul className="text-xs text-red-700 space-y-1">
                          <li>• Climate data correlation</li>
                          <li>• Infrastructure vulnerability mapping</li>
                          <li>• Social vulnerability indices</li>
                          <li>• Real-time disaster monitoring feeds</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Guidance */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-3">How to Use This Dashboard Effectively</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-indigo-700 mb-2">Current Capabilities:</div>
                    <ul className="text-indigo-600 space-y-1 text-xs">
                      <li>✓ Recent disaster activity monitoring ({dataRange.start?.getFullYear()}-{dataRange.end?.getFullYear()})</li>
                      <li>✓ State-level comparative analysis</li>
                      <li>✓ Disaster type categorization</li>
                      <li>✓ Real-time declaration tracking</li>
                      <li>✓ Monthly pattern identification</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-indigo-700 mb-2">Best Practices:</div>
                    <ul className="text-indigo-600 space-y-1 text-xs">
                      <li>• Use filters to focus on specific regions/timeframes</li>
                      <li>• Compare recent patterns to identify emerging trends</li>
                      <li>• Consider seasonal variations in disaster frequency</li>
                      <li>• Remember: Rankings reflect recent data only</li>
                      <li>• Cross-reference with other emergency data sources</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DisasterAnalyticsDashboard;