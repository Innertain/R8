import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Activity,
  Heart,
  Clock
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
  cached?: boolean;
  lastUpdated?: string;
}

// Recent Updates Component
function RecentUpdatesSection() {
  const { data: recentUpdates, isLoading } = useQuery({
    queryKey: ['/api/recent-updates'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!recentUpdates?.data) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No recent activity found</p>
      </div>
    );
  }

  const { inventory = [], needs = [] } = recentUpdates.data;
  const allUpdates = [
    ...inventory.slice(0, 5).map((item: any) => ({
      ...item,
      type: 'inventory',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    })),
    ...needs.slice(0, 5).map((item: any) => ({
      ...item,
      type: 'needs',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }))
  ].sort((a, b) => new Date(b.lastModified || b.createdTime).getTime() - new Date(a.lastModified || a.createdTime).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {allUpdates.map((update, index) => {
        const Icon = update.icon;
        const timeAgo = new Date(update.lastModified || update.createdTime);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60 * 60));
        const timeDisplay = diffHours < 1 ? 'Just now' : 
                           diffHours < 24 ? `${diffHours}h ago` : 
                           `${Math.floor(diffHours / 24)}d ago`;

        return (
          <div key={`${update.type}-${update.id || index}`} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-full ${update.bgColor}`}>
              <Icon className={`w-4 h-4 ${update.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {update.fields?.['Site Name'] || 
                   update.fields?.Name || 
                   update.fields?.['Organization Name'] ||
                   update.fields?.['Site'] ||
                   update.fields?.['Location'] ||
                   'Supply Site'}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {update.type === 'inventory' ? 'Inventory' : 'Need'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                {update.type === 'inventory' 
                  ? `Updated: ${update.fields?.['Item Name'] || update.fields?.['Item'] || update.fields?.['Supply Type'] || 'inventory items'} (Qty: ${update.fields?.['Quantity'] || update.fields?.['Count'] || 'N/A'})`
                  : `Requested: ${update.fields?.['Item Needed'] || update.fields?.['Request'] || update.fields?.['Description'] || update.fields?.['Supply Needed'] || 'supplies needed'}`
                }
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{timeDisplay}</span>
                {(update.fields?.City || update.fields?.Location || update.fields?.Address) && (
                  <>
                    <span>•</span>
                    <span>
                      {update.fields?.City && update.fields?.State 
                        ? `${update.fields.City}, ${update.fields.State}`
                        : update.fields?.Location || update.fields?.Address || 'Location available'
                      }
                    </span>
                  </>
                )}
                {update.fields?.Status && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {update.fields.Status}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="text-center pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Showing latest {allUpdates.length} updates from {inventory.length} inventory and {needs.length} needs records
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Auto-refreshes every 30 seconds • Last update: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
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

      // Return both data and raw result for accessing counts, plus cache metadata
      return { 
        sites: sites || [], 
        deliveries: deliveries || [], 
        volunteers: volunteers || [], 
        drivers: drivers || [],
        data: result.data,
        counts: result.counts,
        cached: result.cached,
        lastUpdated: result.lastUpdated
      };
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export default function StatsDashboard() {
  const { data: statsData, isLoading, error } = useStatsData();
  const [selectedState, setSelectedState] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  // Extract cache information from API response
  useEffect(() => {
    if (statsData) {
      const cacheData = statsData as any;
      console.log('Cache data received:', { cached: cacheData.cached, lastUpdated: cacheData.lastUpdated });
      if (cacheData.lastUpdated) {
        setLastUpdated(cacheData.lastUpdated);
        setIsCached(cacheData.cached || false);
        console.log('Cache state set:', { lastUpdated: cacheData.lastUpdated, isCached: cacheData.cached });
      } else {
        console.log('No lastUpdated found in cache data');
      }
    }
  }, [statsData]);

  // Process data for visualizations
  const processStatsData = (data: StatsData | undefined): StateSummary[] => {
    if (!data) return [];

    const stateMap = new Map<string, StateSummary>();

    // Helper function to normalize state names and filter out invalid ones
    const normalizeState = (state: string | null | undefined): string | null => {
      if (!state || state.trim() === '' || state.toLowerCase() === 'unknown') return null;
      
      // Normalize common state variations and clean up whitespace
      const normalized = state.trim().toUpperCase();
      
      // Handle common state name variations
      if (normalized === 'NORTH CAROLINA') return 'NC';
      if (normalized === 'CALIFORNIA') return 'CA';  
      if (normalized === 'WEST VIRGINIA') return 'WV';
      if (normalized === 'NC ') return 'NC'; // Handle trailing space
      
      return normalized;
    };

    // Initialize with sites data
    data.sites?.forEach((site: any) => {
      const state = normalizeState(site.State);
      if (!state) return; // Skip invalid states
      
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

    // Create site lookup map for delivery state resolution
    const siteStateMap = new Map();
    data.sites?.forEach((site: any) => {
      siteStateMap.set(site.id, site.State);
    });

    // Add deliveries data - resolve state through drop-off site
    data.deliveries?.forEach((delivery: any) => {
      let deliveryState = delivery.State || delivery['Delivery State'];
      
      // If no direct state, try to get it from the drop-off site
      if (!deliveryState && delivery['Drop Off Site']?.length > 0) {
        const dropOffSiteId = delivery['Drop Off Site'][0]; // Get first site ID
        deliveryState = siteStateMap.get(dropOffSiteId);
      }
      
      const state = normalizeState(deliveryState);
      if (!state) return; // Skip invalid states
      
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
      if (delivery.Status === 'Delivery Completed' || delivery.status === 'completed') {
        stateMap.get(state)!.completedDeliveries++;
      }
    });

    // Note: Volunteers and drivers don't have location data yet, so we skip them for state breakdown

    return Array.from(stateMap.values())
      .filter(summary => summary.state !== 'UNKNOWN') // Extra safety filter
      .sort((a, b) => 
        (b.sites + b.deliveries) - (a.sites + a.deliveries)
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
    partners: (statsData as any)?.counts?.partners || 0,
    completedDeliveries: (statsData as any)?.counts?.completedDeliveries || 0,
    totalFoodBoxes: (statsData as any)?.counts?.totalFoodBoxes || 0,
    estimatedFamiliesHelped: (statsData as any)?.counts?.estimatedFamiliesHelped || 0,
    activeSitesLast60Days: (statsData as any)?.counts?.activeSitesLast60Days || 0,
    sitesWithDeliveries: (statsData as any)?.counts?.sitesWithDeliveries || 0,
    sitesWithRecentActivity: (statsData as any)?.counts?.sitesWithRecentActivity || 0
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Families Helped</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{(totals.estimatedFamiliesHelped || 0).toLocaleString()}</div>
            <p className="text-xs text-gray-600">Site estimates*</p>
          </CardContent>
        </Card>
      </div>

      {/* Site Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites (60 days)</CardTitle>
            <MapPin className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600">{totals.activeSitesLast60Days.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Updated inventory recently</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites with Deliveries</CardTitle>
            <Package className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-indigo-600">{totals.sitesWithDeliveries.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Received aid deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites with Recent Activity</CardTitle>
            <Users className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-600">{totals.sitesWithRecentActivity.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Active requests or needs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mutual Aid Partners</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{totals.partners.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Partner organizations</p>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer for estimated families */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 italic">
          * Estimated families helped numbers are estimates provided by supply sites and may not reflect exact counts.
          Supply sites are locations that have received aid deliveries or requested supplies in the system.
        </p>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="states">By State</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Supply Site Activity
              </CardTitle>
              <CardDescription>
                Latest inventory updates and needs requests from active supply sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentUpdatesSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sites and Deliveries by State (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topStates} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sites" fill="#3b82f6" name="Supply Sites" />
                  <Bar dataKey="deliveries" fill="#10b981" name="Deliveries" />
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isCached ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  Data Freshness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-gray-800">
                  {isCached ? 'Cached' : 'Fresh'}
                </div>
                {lastUpdated ? (
                  <p className="text-sm text-gray-600">
                    Updated {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Loading cache status...
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Refreshes every 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}