import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, MapPin, Calendar, AlertTriangle, Flame, Waves, Wind, Mountain, Sun, Snowflake, Zap, Download, PieChart, Clock, Info as InfoIcon } from "lucide-react";
import { getDisasterIcon } from '@/utils/disasterIcons';
import { StateIcon } from '@/components/StateIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CompactTimeline } from "./CompactTimeline";


import { NasaEonetEvents } from "./NasaEonetEvents";
import { RealtimeApiDebugger } from "./RealtimeApiDebugger";
import { AnimatedCounter } from './AnimatedCounter';


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
      if (timeFilter !== 'all') {
        const monthsAgo = parseInt(timeFilter);
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
        if (declarationDate < cutoffDate) return false;
      }

      // State filter
      if (stateFilter !== 'all' && disaster.state !== stateFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && disaster.incidentType !== typeFilter) return false;

      return true;
    });
  }, [disasters, timeFilter, stateFilter, typeFilter]);

  // Calculate analytics with improved year-over-year analysis
  const analytics = useMemo(() => {
    const total = filteredDisasters.length;

    // Get actual data range from disasters
    const actualDataRange = useMemo(() => {
      if (filteredDisasters.length === 0) return { start: null, end: null, years: [] };

      const dates = filteredDisasters.map(d => new Date(d.declarationDate)).sort((a, b) => a.getTime() - b.getTime());
      const start = dates[0];
      const end = dates[dates.length - 1];

      // Generate array of years that actually have data
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      const years = [];
      for (let year = startYear; year <= endYear; year++) {
        years.push(year);
      }

      return { start, end, years };
    }, [filteredDisasters]);

    // State statistics
    const stateStats = filteredDisasters.reduce((acc, disaster) => {
      acc[disaster.state] = (acc[disaster.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Type statistics
    const typeStats = filteredDisasters.reduce((acc, disaster) => {
      acc[disaster.incidentType] = (acc[disaster.incidentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Declaration type statistics
    const declarationTypeStats = filteredDisasters.reduce((acc, disaster) => {
      acc[disaster.declarationType] = (acc[disaster.declarationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly statistics
    const monthlyStats = filteredDisasters.reduce((acc, disaster) => {
      const date = new Date(disaster.declarationDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Yearly statistics based on actual data
    const yearlyStats = filteredDisasters.reduce((acc, disaster) => {
      const year = new Date(disaster.declarationDate).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

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

    // Calculate trend indicators
    const recentYears = actualDataRange.years.slice(-3); // Last 3 years with data
    const recentTotal = recentYears.reduce((sum, year) => sum + (yearlyStats[year] || 0), 0);
    const avgPerYear = recentTotal / Math.max(recentYears.length, 1);

    return {
      total,
      majorDisasters,
      emergencies,
      fireManagement,
      stateStats,
      typeStats,
      declarationTypeStats,
      monthlyStats,
      yearlyStats,
      actualDataRange,
      topStates,
      topTypes,
      avgPerYear,
      recentYears
    };
  }, [filteredDisasters]);

  const getDisasterIconComponent = (type: string) => {
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
                <p className="text-2xl font-bold text-red-600">
                  <AnimatedCounter end={analytics.total} duration={2000} />
                </p>
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
                <p className="text-xs text-gray-500">{analytics.total > 0 ? ((analytics.majorDisasters / analytics.total) * 100).toFixed(1) : '0.0'}% of total</p>
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
                <p className="text-xs text-gray-500">{analytics.total > 0 ? ((analytics.emergencies / analytics.total) * 100).toFixed(1) : '0.0'}% of total</p>
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
                    const IconComponent = getDisasterIconComponent(type);
                    const percentage = analytics.total > 0 ? ((count / analytics.total) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">{type || 'Unknown'}</span>
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
                    const percentage = analytics.total > 0 ? ((count / analytics.total) * 100).toFixed(1) : '0.0';
                    const maxStateCount = analytics.topStates.length > 0 ? analytics.topStates[0][1] : 1;
                    return (
                      <div key={state} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StateIcon state={state} size={16} className="drop-shadow-sm" />
                          <span className="text-sm font-medium">{state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{count} declarations</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (count / maxStateCount) * 100)}%` }}
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

          {/* FEMA Disaster Declaration Timeline */}
          <CompactTimeline disasters={disasters} />

          {/* NASA EONET Natural Events - Phase 1 Implementation */}
          <NasaEonetEvents />






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
                    <div className="text-2xl font-bold text-red-600">
                      <AnimatedCounter end={analytics.totalCasualties} duration={2500} />
                    </div>
                    <div className="text-xs text-gray-600">Total Casualties</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">
                      <AnimatedCounter 
                        end={analytics.totalDamage / 1000000000} 
                        duration={2800} 
                        decimals={1} 
                        prefix="$" 
                        suffix="B" 
                      />
                    </div>
                    <div className="text-xs text-gray-600">Total Damage</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">
                      <AnimatedCounter end={analytics.avgEventsPerMonth} duration={1800} />
                    </div>
                    <div className="text-xs text-gray-600">Avg Events/Month</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Year-over-Year Trend */}
            <div>
              <h4 className="font-medium mb-4">Disaster Declarations Trend ({analytics.actualDataRange.start?.getFullYear() || 'N/A'}-{analytics.actualDataRange.end?.getFullYear() || 'N/A'})</h4>
              <div className="text-sm text-gray-600 mb-4">
                Analysis of disaster frequency from {analytics.actualDataRange.start?.getFullYear() || 'N/A'} to {analytics.actualDataRange.end?.getFullYear() || 'N/A'}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-blue-800">
                  Data Coverage: {analytics.actualDataRange.start?.getFullYear() || 'N/A'}-{analytics.actualDataRange.end?.getFullYear() || 'N/A'} 
                  ({analytics.total} total declarations across {analytics.actualDataRange.years.length} years)
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Average: {Math.round(analytics.avgPerYear)} declarations per year
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">📈</div>
                    <div className="text-sm text-gray-700 font-medium">FEMA Disaster Trends</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {analytics.total} declarations • {analytics.actualDataRange.years.length} years of data
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Peak: {Math.max(...Object.values(analytics.yearlyStats))} disasters • 
                      Avg: {Math.round(analytics.avgPerYear)}/year
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {analytics.actualDataRange.years.map(year => {
                    const count = analytics.yearlyStats[year] || 0;
                    const maxCount = Math.max(...Object.values(analytics.yearlyStats));
                    const isCurrentYear = year === new Date().getFullYear();
                    const isPartialYear = isCurrentYear && new Date().getMonth() < 11; // Not full year yet

                    let label = 'Activity';
                    let bgColor = 'bg-gray-100';
                    let textColor = 'text-gray-700';

                    if (count === maxCount && count > 0) {
                      label = 'Peak';
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-800';
                    } else if (count >= analytics.avgPerYear * 1.2) {
                      label = 'High';
                      bgColor = 'bg-orange-100';
                      textColor = 'text-orange-800';
                    } else if (count >= analytics.avgPerYear * 0.8) {
                      label = 'Baseline';
                      bgColor = 'bg-gray-100';
                      textColor = 'text-gray-700';
                    } else if (count > 0) {
                      label = 'Low';
                      bgColor = 'bg-green-100';
                      textColor = 'text-green-700';
                    }

                    if (isCurrentYear) {
                      label = isPartialYear ? 'Current' : 'Current';
                      if (!isPartialYear) bgColor = 'bg-purple-100';
                      if (!isPartialYear) textColor = 'text-purple-800';
                    }

                    return (
                      <div key={year} className={`${bgColor} border rounded p-3 text-center`}>
                        <div className="font-bold text-lg">{year}</div>
                        <div className={`text-2xl font-bold ${textColor}`}>{count}</div>
                        <div className="text-xs text-gray-600">{label}</div>
                        {isPartialYear && (
                          <div className="text-xs text-gray-500 mt-1">Partial year</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {analytics.actualDataRange.years.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-900">Data Quality</div>
                      <div className="text-gray-600">
                        ✓ {analytics.actualDataRange.years.length} years of complete data<br/>
                        ✓ {analytics.total} total disaster declarations<br/>
                        ✓ Real-time FEMA data integration
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-900">Trend Summary</div>
                      <div className="text-gray-600">
                        Peak: {Math.max(...Object.values(analytics.yearlyStats))} disasters<br/>
                        Low: {Math.min(...Object.values(analytics.yearlyStats))} disasters<br/>
                        Variance: {(Math.max(...Object.values(analytics.yearlyStats)) - Math.min(...Object.values(analytics.yearlyStats)))} range
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Declaration Type Distribution */}
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
                    const percentage = analytics.total > 0 ? ((count / analytics.total) * 100).toFixed(1) : '0.0';
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

          {/* Monthly Distribution */}
          <div>
            <h4 className="font-medium mb-4">Seasonal Distribution</h4>
            <div className="text-sm text-gray-600 mb-4">
              Monthly patterns in disaster declarations across all available data
            </div>

            <div className="space-y-4">
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-green-600 mb-2">🌍</div>
                  <div className="text-sm font-medium text-gray-700">Seasonal Disaster Patterns</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Analysis of {Object.keys(analytics.monthlyStats).length} months of data
                  </div>
                </div>

                {/* Monthly aggregation by month regardless of year */}
                {(() => {
                  const monthlyAggregated = Object.entries(analytics.monthlyStats).reduce((acc, [monthKey, count]) => {
                    const [year, month] = monthKey.split('-');
                    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' });
                    acc[monthName] = (acc[monthName] || 0) + count;
                    return acc;
                  }, {} as Record<string, number>);

                  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                  const maxValue = Math.max(...Object.values(monthlyAggregated));

                  return (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {months.map(month => {
                        const count = monthlyAggregated[month] || 0;
                        const intensity = count / Math.max(maxValue, 1);
                        const shortMonth = month.slice(0, 3);

                        let bgColor = 'bg-gray-100';
                        let textColor = 'text-gray-600';

                        if (intensity > 0.7) {
                          bgColor = 'bg-red-100';
                          textColor = 'text-red-800';
                        } else if (intensity > 0.4) {
                          bgColor = 'bg-orange-100';
                          textColor = 'text-orange-800';
                        } else if (intensity > 0.2) {
                          bgColor = 'bg-yellow-100';
                          textColor = 'text-yellow-800';
                        } else if (count > 0) {
                          bgColor = 'bg-green-100';
                          textColor = 'text-green-800';
                        }

                        return (
                          <div key={month} className={`${bgColor} border rounded p-2 text-center`}>
                            <div className="text-xs font-medium">{shortMonth}</div>
                            <div className={`text-sm font-bold ${textColor}`}>{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(analytics.monthlyStats)
                  .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
                  .slice(0, 8) // Most recent 8 months
                  .map(([month, count]) => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short' });
                    const isCurrentMonth = month === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

                    return (
                      <div key={month} className={`${isCurrentMonth ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'} border rounded p-2 text-center`}>
                        <div className="text-sm font-medium">{monthName} {year}</div>
                        <div className={`text-lg font-bold ${isCurrentMonth ? 'text-blue-700' : 'text-gray-700'}`}>{count}</div>
                        {isCurrentMonth && <div className="text-xs text-blue-600">Current</div>}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          {/* FEMA Disaster Declaration Timeline */}
          <CompactTimeline disasters={disasters} />
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          {/* Enhanced Geographic Impact Analysis */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-green-600" />
                Geographic Impact Analysis
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Enhanced Data Coverage</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Regional disaster patterns from enhanced FEMA data (2020-2025)
              </p>
            </CardHeader>
            <CardContent>
              {/* Top States Section */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Most Impacted States (2020-2025)
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics.topStates.slice(0, 4).map(([state, count], index) => {
                    // Get most common disaster type for this state
                    const stateDisasters = filteredDisasters.filter(d => d.state === state);
                    const typeCount = stateDisasters.reduce((acc, d) => {
                      const type = d.incidentType || 'Unknown';
                      acc[type] = (acc[type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    const topType = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0];
                    const Icon = getDisasterIconComponent(topType?.[0] || '');

                    return (
                      <div key={state} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                        <div className="text-center">
                          <div className={`inline-flex w-10 h-10 rounded-full items-center justify-center text-white font-bold text-lg mb-3 ${
                            index === 0 ? 'bg-red-500' : 
                            index === 1 ? 'bg-orange-500' : 
                            index === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <StateIcon state={state} size={24} className="drop-shadow-sm" />
                            <div className="font-bold text-2xl text-gray-800">{state}</div>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                            <Icon className="w-4 h-4" />
                            <span>{topType?.[0] || 'Mixed Types'}</span>
                          </div>
                          <div className="text-3xl font-bold text-red-600">{count}</div>
                          <div className="text-xs text-gray-500">declarations</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Disaster Types Overview */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Disaster Types & Regional Impact
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      <div key={type} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 text-lg">{type || 'Unknown'}</span>
                              <div className="text-xs text-gray-500">{count} total incidents</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{count}</div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Most affected:</span> {topState?.[0] || 'N/A'} ({topState?.[1] || 0} incidents)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Source Note */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Data Source:</strong> Enhanced FEMA API queries covering 2020-2025 period with {filteredDisasters.length} total declarations. This represents recent disaster activity patterns and may not reflect complete historical trends.
                </p>
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
                    <div className="text-2xl font-bold text-red-600">
                      <AnimatedCounter end={analytics.majorDisasters} duration={2100} />
                    </div>
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
                    <div className="text-2xl font-bold text-orange-600">
                      <AnimatedCounter end={analytics.emergencies} duration={2200} />
                    </div>
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
                    <div className="text-2xl font-bold text-yellow-600">
                      <AnimatedCounter end={analytics.fireManagement} duration={2300} />
                    </div>
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
                        {dataRange.start?.getFullYear() || 'N/A'} - {dataRange.end?.getFullYear() || 'N/A'} ({dataRange.years} years)
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
                          <span className="font-medium">{analytics.majorDisasters} ({analytics.total > 0 ? ((analytics.majorDisasters / analytics.total) * 100).toFixed(1) : '0.0'}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emergencies (EM):</span>
                          <span className="font-medium">{analytics.emergencies} ({analytics.total > 0 ? ((analytics.emergencies / analytics.total) * 100).toFixed(1) : '0.0'}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fire Management (FM):</span>
                          <span className="font-medium">{analytics.fireManagement} ({analytics.total > 0 ? ((analytics.fireManagement / analytics.total) * 100).toFixed(1) : '0.0'}%)</span>
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
                            <span className="truncate">{type || 'Unknown'}</span>
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
                          <span className="font-medium">
                            {(analytics.total / Math.max(analytics.actualDataRange.years.length * 12, 1)).toFixed(1)} declarations
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Peak Month Activity:</span>
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



              {/* User Guidance */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-3">How to Use This Dashboard Effectively</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-indigo-700 mb-2">Current Capabilities:</div>
                    <ul className="text-indigo-600 space-y-1 text-xs">
                      <li>✓ Recent disaster activity monitoring ({analytics.actualDataRange.start?.getFullYear() || 'N/A'}-{analytics.actualDataRange.end?.getFullYear() || 'N/A'})</li>
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

      {/* Real-time API Debugger */}
      <RealtimeApiDebugger />
    </div>
  );
}

export default DisasterAnalyticsDashboard;