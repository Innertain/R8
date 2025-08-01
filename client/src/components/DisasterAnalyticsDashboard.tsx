import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, MapPin, Calendar, AlertTriangle, Flame, Waves, Wind, Mountain, Sun, Snowflake, Zap, Download, PieChart, Clock } from "lucide-react";

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

  // Filter disasters based on selected filters
  const filteredDisasters = useMemo(() => {
    return disasters.filter(disaster => {
      const now = new Date();
      const declarationDate = new Date(disaster.declarationDate);
      
      // Time filter
      if (timeFilter === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (declarationDate < thirtyDaysAgo) return false;
      } else if (timeFilter === '90days') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        if (declarationDate < ninetyDaysAgo) return false;
      } else if (timeFilter === '2024') {
        if (declarationDate.getFullYear() !== 2024) return false;
      } else if (timeFilter === '2025') {
        if (declarationDate.getFullYear() !== 2025) return false;
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Disaster Analytics Dashboard
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive analysis of {disasters.length} FEMA disaster declarations
              </p>
            </div>
            <Button onClick={exportAnalytics} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3 mt-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
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
                  <SelectItem key={type} value={type}>{type}</SelectItem>
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
            {/* Enhanced Monthly Distribution Chart */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Monthly Declaration Distribution
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Last 12 months of disaster activity
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-end justify-between gap-1 h-32 mb-4">
                    {Object.entries(analytics.monthlyStats)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .slice(-12)
                      .map(([month, count]) => {
                        const maxCount = Math.max(...Object.values(analytics.monthlyStats));
                        const heightPercent = Math.max(15, (count / maxCount) * 100);
                        return (
                          <div key={month} className="flex flex-col items-center flex-1 group">
                            <div className="relative w-full">
                              <div 
                                className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-500 cursor-pointer shadow-sm"
                                style={{ height: `${heightPercent}%`, minHeight: '20px' }}
                                title={`${month}: ${count} declarations`}
                              />
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {count}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="grid grid-cols-12 gap-1 text-center">
                    {Object.entries(analytics.monthlyStats)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .slice(-12)
                      .map(([month, count]) => (
                        <div key={month} className="text-xs text-gray-600">
                          <div className="font-medium">{month.split('-')[1]}/{month.split('-')[0].slice(-2)}</div>
                          <div className="text-gray-800 font-semibold">{count}</div>
                        </div>
                      ))}
                  </div>
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
                  const Icon = getDisasterIcon(disaster.incidentType);
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
              <CardTitle>Geographic Impact Analysis</CardTitle>
              <p className="text-sm text-gray-600">
                Regional disaster patterns and state-level vulnerability assessment
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* State Vulnerability Ranking */}
                <div>
                  <h4 className="font-medium mb-4">State Vulnerability Ranking</h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {analytics.topStates.map(([state, count], index) => (
                      <div key={state} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index < 3 ? 'bg-red-500' : index < 8 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{state}</span>
                        <div className="flex-1 text-right">
                          <span className="text-sm text-gray-600">{count} declarations</span>
                        </div>
                      </div>
                    ))}
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
      </Tabs>
    </div>
  );
}

export default DisasterAnalyticsDashboard;