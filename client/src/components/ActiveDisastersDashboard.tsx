import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, MapPin, Calendar, ExternalLink, Flame, Waves, Wind, Mountain, Sun, Snowflake, Zap, Home, Filter, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

interface ActiveDisastersDashboardProps {
  disasters: FemaDisasterItem[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

// Get appropriate icon for disaster type
const getDisasterIcon = (type?: string) => {
  if (!type) return AlertTriangle;
  const lowerType = type.toLowerCase();
  if (lowerType.includes('fire')) return Flame;
  if (lowerType.includes('flood')) return Waves;
  if (lowerType.includes('hurricane') || lowerType.includes('storm') || lowerType.includes('wind')) return Wind;
  if (lowerType.includes('earthquake')) return Mountain;
  if (lowerType.includes('snow') || lowerType.includes('ice') || lowerType.includes('winter')) return Snowflake;
  if (lowerType.includes('drought') || lowerType.includes('heat')) return Sun;
  if (lowerType.includes('tornado')) return Zap;
  return AlertTriangle;
};

// Get severity color based on disaster type and recency
const getSeverityColor = (type?: string, declarationDate?: string) => {
  const isRecent = declarationDate && 
    new Date(declarationDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  if (!type) return isRecent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  
  const lowerType = type.toLowerCase();
  if (lowerType.includes('fire') || lowerType.includes('hurricane')) {
    return isRecent ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-600';
  }
  if (lowerType.includes('flood') || lowerType.includes('storm')) {
    return isRecent ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-600';
  }
  if (lowerType.includes('earthquake')) {
    return isRecent ? 'bg-orange-100 text-orange-800' : 'bg-orange-50 text-orange-600';
  }
  return isRecent ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-50 text-yellow-600';
};

export function ActiveDisastersDashboard({ disasters, loading }: ActiveDisastersDashboardProps) {
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'state' | 'type'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  // Get unique states and disaster types for filters
  const availableStates = useMemo(() => {
    const states = Array.from(new Set(disasters.map(d => d.state))).sort();
    return states;
  }, [disasters]);

  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(disasters.map(d => d.incidentType).filter(Boolean))).sort();
    return types;
  }, [disasters]);

  // Filter and sort disasters
  const filteredDisasters = useMemo(() => {
    let filtered = disasters.filter(disaster => {
      // State filter
      if (stateFilter !== 'all' && disaster.state !== stateFilter) return false;
      
      // Type filter
      if (typeFilter !== 'all' && disaster.incidentType !== typeFilter) return false;
      
      // Time filter
      if (timeFilter !== 'all') {
        const declarationDate = new Date(disaster.declarationDate);
        const now = new Date();
        
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
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          disaster.title.toLowerCase().includes(searchLower) ||
          disaster.state.toLowerCase().includes(searchLower) ||
          disaster.incidentType?.toLowerCase().includes(searchLower) ||
          disaster.designatedArea?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Sort disasters
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.declarationDate).getTime() - new Date(a.declarationDate).getTime();
      } else if (sortBy === 'state') {
        return a.state.localeCompare(b.state);
      } else if (sortBy === 'type') {
        return (a.incidentType || '').localeCompare(b.incidentType || '');
      }
      return 0;
    });

    return filtered;
  }, [disasters, stateFilter, typeFilter, timeFilter, searchTerm, sortBy]);

  // Analytics data
  const analyticsData = useMemo(() => {
    const stateStats = filteredDisasters.reduce((acc, disaster) => {
      acc[disaster.state] = (acc[disaster.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeStats = filteredDisasters.reduce((acc, disaster) => {
      const type = disaster.incidentType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyStats = filteredDisasters.reduce((acc, disaster) => {
      const date = new Date(disaster.declarationDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      stateData: Object.entries(stateStats)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      typeData: Object.entries(typeStats)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      monthlyData: Object.entries(monthlyStats)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12)
    };
  }, [filteredDisasters]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Loading Active Disasters...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Active FEMA Disaster Declarations
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {filteredDisasters.length} of {disasters.length} total disasters
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Filter className="w-4 h-4 mr-1" />
                List View
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Input
              placeholder="Search disasters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States ({availableStates.length})</SelectItem>
                {availableStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types ({availableTypes.length})</SelectItem>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger>
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

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="state">Sort by State</SelectItem>
                <SelectItem value="type">Sort by Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'list' ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredDisasters.map((disaster) => {
                const Icon = getDisasterIcon(disaster.incidentType);
                const severityColor = getSeverityColor(disaster.incidentType, disaster.declarationDate);
                
                return (
                  <Card key={disaster.guid} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-full bg-gray-100">
                            <Icon className="w-5 h-5 text-gray-700" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {disaster.title}
                              </h3>
                              <Badge className={severityColor}>
                                {disaster.incidentType || 'Disaster'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{disaster.state}</span>
                                {disaster.designatedArea && (
                                  <span className="text-gray-500">
                                    • {disaster.designatedArea}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(disaster.declarationDate).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Home className="w-4 h-4" />
                                <span>{disaster.declarationType}</span>
                              </div>
                            </div>
                            
                            {disaster.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {disaster.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredDisasters.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No disasters found matching your filters</p>
                  <p className="text-sm mt-1">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{filteredDisasters.length}</div>
                    <div className="text-sm text-gray-600">Total Disasters</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{availableStates.length}</div>
                    <div className="text-sm text-gray-600">States Affected</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{availableTypes.length}</div>
                    <div className="text-sm text-gray-600">Disaster Types</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredDisasters.filter(d => 
                        new Date(d.declarationDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length}
                    </div>
                    <div className="text-sm text-gray-600">Recent (30 days)</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Disasters by State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.stateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="state" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Disasters by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.typeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analyticsData.typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ActiveDisastersDashboard;