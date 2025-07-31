import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { 
  TrendingUp, 
  MapPin, 
  Users, 
  Truck, 
  Package,
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react";

// Color schemes for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATE_COLORS = {
  'CA': '#3b82f6', 'TX': '#ef4444', 'FL': '#10b981', 'NY': '#f59e0b',
  'PA': '#8b5cf6', 'IL': '#06b6d4', 'OH': '#84cc16', 'GA': '#f97316',
  'NC': '#ec4899', 'MI': '#6366f1'
};

interface StatsData {
  sites: any[];
  deliveries: any[];
  volunteers: any[];
  drivers: any[];
  data?: any;
  counts?: any;
}

interface StateSummary {
  state: string;
  sites: number;
  deliveries: number;
  volunteers: number;
  drivers: number;
  completedDeliveries: number;
}

// Custom hook to fetch all stats data
const useStatsData = () => {
  return useQuery({
    queryKey: ['/api/stats'],
    queryFn: async (): Promise<StatsData> => {
      const response = await fetch('/api/stats');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      const { sites, deliveries, volunteers, drivers } = result.data;

      console.log('Stats data loaded:', { 
        sites: sites?.length || 0, 
        deliveries: deliveries?.length || 0, 
        completedDeliveries: result.counts?.completedDeliveries || 0,
        volunteers: volunteers?.length || 0, 
        drivers: drivers?.length || 0,
        totalFoodBoxes: result.counts?.totalFoodBoxes || 0
      });

      // Return both data and raw result for accessing counts
      return { 
        sites: sites || [], 
        deliveries: deliveries || [], 
        volunteers: volunteers || [], 
        drivers: drivers || [],
        data: result.data,
        counts: result.counts
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default function StatsDashboard() {
  const { data: statsData, isLoading, error } = useStatsData();
  const [selectedState, setSelectedState] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");

  // Process data for visualizations
  const processStatsData = (data: StatsData | undefined): StateSummary[] => {
    if (!data) return [];

    const stateMap = new Map<string, StateSummary>();

    // Initialize with sites data
    data.sites?.forEach((site: any) => {
      const state = site.State || 'Unknown';
      if (!stateMap.has(state)) {
        stateMap.set(state, {
          state,
          sites: 0,
          deliveries: 0,
          volunteers: 0,
          drivers: 0,
          completedDeliveries: 0
        });
      }
      stateMap.get(state)!.sites++;
    });

    // Add deliveries data
    data.deliveries?.forEach((delivery: any) => {
      const state = delivery.State || delivery['Delivery State'] || 'Unknown';
      if (!stateMap.has(state)) {
        stateMap.set(state, {
          state,
          sites: 0,
          deliveries: 0,
          volunteers: 0,
          drivers: 0,
          completedDeliveries: 0
        });
      }
      stateMap.get(state)!.deliveries++;
      if (delivery.Status === 'Completed' || delivery.status === 'completed') {
        stateMap.get(state)!.completedDeliveries++;
      }
    });

    // Add volunteers data - support both API responses and Airtable records
    data.volunteers?.forEach((volunteer: any) => {
      const state = volunteer.state || volunteer.State || volunteer['State'] || 'Unknown';
      if (!stateMap.has(state)) {
        stateMap.set(state, {
          state,
          sites: 0,
          deliveries: 0,
          volunteers: 0,
          drivers: 0,
          completedDeliveries: 0
        });
      }
      stateMap.get(state)!.volunteers++;
    });

    // Add drivers data
    data.drivers?.forEach((driver: any) => {
      const state = driver.State || driver.state || 'Unknown';
      if (!stateMap.has(state)) {
        stateMap.set(state, {
          state,
          sites: 0,
          deliveries: 0,
          volunteers: 0,
          drivers: 0,
          completedDeliveries: 0
        });
      }
      stateMap.get(state)!.drivers++;
    });

    return Array.from(stateMap.values()).sort((a, b) => 
      (b.sites + b.deliveries + b.volunteers + b.drivers) - (a.sites + a.deliveries + a.volunteers + a.drivers)
    );
  };

  const stateSummaries = processStatsData(statsData);
  const filteredData = selectedState === "all" ? stateSummaries : stateSummaries.filter(s => s.state === selectedState);

  // Calculate totals from processed data and API counts
  const totals = {
    sites: statsData?.data?.sites?.length || 0,
    deliveries: statsData?.data?.deliveries?.length || 0,
    volunteers: statsData?.data?.volunteers?.length || 0,
    drivers: statsData?.data?.drivers?.length || 0,
    completedDeliveries: (statsData as any)?.counts?.completedDeliveries || 0,
    totalFoodBoxes: (statsData as any)?.counts?.totalFoodBoxes || 0
  };

  // Prepare chart data
  const topStates = stateSummaries.slice(0, 10);
  const pieData = [
    { name: 'Supply Sites', value: totals.sites, fill: '#3b82f6' },
    { name: 'Total Deliveries', value: totals.deliveries, fill: '#10b981' },
    { name: 'Volunteers', value: totals.volunteers, fill: '#f59e0b' },
    { name: 'Drivers', value: totals.drivers, fill: '#ef4444' }
  ];

  const deliveryStatusData = [
    { name: 'Completed', value: totals.completedDeliveries, fill: '#10b981' },
    { name: 'In Progress', value: totals.deliveries - totals.completedDeliveries, fill: '#f59e0b' }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-gray-600">Unable to fetch statistics from Airtable. Please check your connection.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Impact Dashboard</h1>
        <p className="text-gray-600">Real-time statistics and impact metrics from your volunteer network</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {stateSummaries.map(state => (
              <SelectItem key={state.state} value={state.state}>
                {state.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supply Sites</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totals.sites.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Deliveries</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totals.completedDeliveries.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Boxes</CardTitle>
            <Package className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totals.totalFoodBoxes.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Total distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totals.volunteers.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Active volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totals.drivers.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Available drivers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="states">By State</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deliveryStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deliveryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="states" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resources by State (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topStates} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sites" stackId="a" fill="#3b82f6" name="Supply Sites" />
                  <Bar dataKey="volunteers" stackId="a" fill="#f59e0b" name="Volunteers" />
                  <Bar dataKey="drivers" stackId="a" fill="#ef4444" name="Drivers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* State Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown by State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        State
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sites
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deliveries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volunteers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drivers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stateSummaries.map((state) => (
                      <tr key={state.state} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Badge variant="outline">{state.state}</Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {state.sites.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {state.deliveries.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {state.volunteers.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {state.drivers.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {state.deliveries > 0 ? (
                            <Badge 
                              variant={
                                state.completedDeliveries / state.deliveries > 0.8 ? "default" : 
                                state.completedDeliveries / state.deliveries > 0.5 ? "secondary" : "destructive"
                              }
                            >
                              {((state.completedDeliveries / state.deliveries) * 100).toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance by State</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topStates} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completedDeliveries" fill="#10b981" name="Completed Deliveries" />
                  <Bar dataKey="deliveries" fill="#f59e0b" name="Total Deliveries" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {totals.deliveries > 0 ? ((totals.completedDeliveries / totals.deliveries) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-sm text-gray-600">
                  {totals.completedDeliveries.toLocaleString()} of {totals.deliveries.toLocaleString()} deliveries completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Active States
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stateSummaries.length}
                </div>
                <p className="text-sm text-gray-600">
                  States with active operations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Network Strength
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {((totals.volunteers + totals.drivers) / Math.max(totals.sites, 1)).toFixed(1)}
                </div>
                <p className="text-sm text-gray-600">
                  Average volunteers + drivers per site
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}