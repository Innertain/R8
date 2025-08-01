import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Search, Globe, Rss } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Complete list of all 50 states with governor RSS feed URLs
const ALL_STATES = [
  { code: "AL", name: "Alabama", url: "https://www.alabamagovernor.gov/rss.xml" },
  { code: "AK", name: "Alaska", url: "https://gov.alaska.gov/news/rss.xml" },
  { code: "AZ", name: "Arizona", url: "https://azgovernor.gov/news/rss.xml" },
  { code: "AR", name: "Arkansas", url: "https://governor.arkansas.gov/news/rss.xml" },
  { code: "CA", name: "California", url: "https://www.gov.ca.gov/news/rss.xml" },
  { code: "CO", name: "Colorado", url: "https://www.colorado.gov/governor/rss.xml" },
  { code: "CT", name: "Connecticut", url: "https://portal.ct.gov/Office-of-the-Governor/Press-Room/RSS" },
  { code: "DE", name: "Delaware", url: "https://news.delaware.gov/rss.xml" },
  { code: "FL", name: "Florida", url: "https://www.flgov.com/news/rss.xml" },
  { code: "GA", name: "Georgia", url: "https://gov.georgia.gov/press-releases/rss.xml" },
  { code: "HI", name: "Hawaii", url: "https://www.hawaiigovernor.org/news/rss.xml" },
  { code: "ID", name: "Idaho", url: "https://gov.idaho.gov/news/rss.xml" },
  { code: "IL", name: "Illinois", url: "https://www.illinois.gov/news/rss.xml" },
  { code: "IN", name: "Indiana", url: "https://www.in.gov/gov/news/rss.xml" },
  { code: "IA", name: "Iowa", url: "https://governor.iowa.gov/news/rss.xml" },
  { code: "KS", name: "Kansas", url: "https://governor.kansas.gov/news/rss.xml" },
  { code: "KY", name: "Kentucky", url: "https://kentucky.gov/governor/news/rss.xml" },
  { code: "LA", name: "Louisiana", url: "https://gov.louisiana.gov/news/rss.xml" },
  { code: "ME", name: "Maine", url: "https://www.maine.gov/governor/news/rss.xml" },
  { code: "MD", name: "Maryland", url: "https://governor.maryland.gov/news/rss.xml" },
  { code: "MA", name: "Massachusetts", url: "https://www.mass.gov/governor/news/rss.xml" },
  { code: "MI", name: "Michigan", url: "https://www.michigan.gov/governor/news/rss.xml" },
  { code: "MN", name: "Minnesota", url: "https://mn.gov/governor/news/rss.xml" },
  { code: "MS", name: "Mississippi", url: "https://www.ms.gov/governor/news/rss.xml" },
  { code: "MO", name: "Missouri", url: "https://governor.mo.gov/news/rss.xml" },
  { code: "MT", name: "Montana", url: "https://gov.mt.gov/news/rss.xml" },
  { code: "NE", name: "Nebraska", url: "https://governor.nebraska.gov/news/rss.xml" },
  { code: "NV", name: "Nevada", url: "https://gov.nv.gov/news/rss.xml" },
  { code: "NH", name: "New Hampshire", url: "https://www.governor.nh.gov/news/rss.xml" },
  { code: "NJ", name: "New Jersey", url: "https://www.nj.gov/governor/news/rss.xml" },
  { code: "NM", name: "New Mexico", url: "https://www.governor.state.nm.us/news/rss.xml" },
  { code: "NY", name: "New York", url: "https://www.governor.ny.gov/news/rss.xml" },
  { code: "NC", name: "North Carolina", url: "https://governor.nc.gov/news/rss.xml" },
  { code: "ND", name: "North Dakota", url: "https://www.governor.nd.gov/news/rss.xml" },
  { code: "OH", name: "Ohio", url: "https://governor.ohio.gov/news/rss.xml" },
  { code: "OK", name: "Oklahoma", url: "https://www.governor.ok.gov/news/rss.xml" },
  { code: "OR", name: "Oregon", url: "https://www.oregon.gov/governor/news/rss.xml" },
  { code: "PA", name: "Pennsylvania", url: "https://www.pa.gov/governor/news/rss.xml" },
  { code: "RI", name: "Rhode Island", url: "https://www.ri.gov/governor/news/rss.xml" },
  { code: "SC", name: "South Carolina", url: "https://governor.sc.gov/news/rss.xml" },
  { code: "SD", name: "South Dakota", url: "https://gov.sd.gov/news/rss.xml" },
  { code: "TN", name: "Tennessee", url: "https://www.tn.gov/governor/news/rss.xml" },
  { code: "TX", name: "Texas", url: "https://gov.texas.gov/news/rss.xml" },
  { code: "UT", name: "Utah", url: "https://governor.utah.gov/news/rss.xml" },
  { code: "VT", name: "Vermont", url: "https://governor.vermont.gov/news/rss.xml" },
  { code: "VA", name: "Virginia", url: "https://www.governor.virginia.gov/news/rss.xml" },
  { code: "WA", name: "Washington", url: "https://www.governor.wa.gov/news/rss.xml" },
  { code: "WV", name: "West Virginia", url: "https://governor.wv.gov/news/rss.xml" },
  { code: "WI", name: "Wisconsin", url: "https://www.evers.wi.gov/news/rss.xml" },
  { code: "WY", name: "Wyoming", url: "https://gov.wyo.gov/news/rss.xml" }
];

interface RSSFeedStatus {
  state: string;
  stateName: string;
  url: string;
  status: 'success' | 'error' | 'pending';
  lastChecked: string;
  itemCount: number;
  emergencyDeclarations: number;
  error?: string;
  lastDeclaration?: any;
}

export default function RSSMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch RSS monitoring status
  const { data: rssStatus, isLoading, refetch } = useQuery({
    queryKey: ["/api/rss-monitoring-status", refreshTrigger],
  });

  // Fetch current emergency declarations
  const { data: emergencyData } = useQuery({
    queryKey: ["/api/state-emergency-declarations"],
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  // Filter states based on search and status
  const filteredStates = ALL_STATES.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const stateStatus = rssStatus?.statuses?.find((s: RSSFeedStatus) => s.state === state.code);
    if (statusFilter === "all") return true;
    if (statusFilter === "success") return stateStatus?.status === 'success';
    if (statusFilter === "error") return stateStatus?.status === 'error';
    if (statusFilter === "pending") return !stateStatus || stateStatus?.status === 'pending';
    
    return true;
  });

  const getStatusIcon = (state: any) => {
    const stateStatus = rssStatus?.statuses?.find((s: RSSFeedStatus) => s.state === state.code);
    
    if (!stateStatus) return <Clock className="w-4 h-4 text-gray-400" />;
    
    switch (stateStatus.status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (state: any) => {
    const stateStatus = rssStatus?.statuses?.find((s: RSSFeedStatus) => s.state === state.code);
    
    if (!stateStatus) {
      return <Badge variant="outline" className="text-gray-500">Pending</Badge>;
    }
    
    switch (stateStatus.status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600">Checking</Badge>;
    }
  };

  const getStatsOverview = () => {
    if (!rssStatus?.statuses) return { total: 50, connected: 0, errors: 0, pending: 50 };
    
    const connected = rssStatus.statuses.filter((s: RSSFeedStatus) => s.status === 'success').length;
    const errors = rssStatus.statuses.filter((s: RSSFeedStatus) => s.status === 'error').length;
    const pending = 50 - connected - errors;
    
    return { total: 50, connected, errors, pending };
  };

  const stats = getStatsOverview();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rss className="w-5 h-5 text-orange-500" />
                State RSS Feed Monitoring
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Real-time monitoring of all 50 state governor RSS feeds for emergency declarations
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={isLoading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Scanning...' : 'Refresh Scan'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total States</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
              <div className="text-sm text-gray-600">Connected</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="success">Connected Only</SelectItem>
                <SelectItem value="error">Errors Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Emergency Declarations Summary */}
          {emergencyData?.declarations && emergencyData.declarations.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Emergency Declarations Found: {emergencyData.declarations.length}
              </h3>
              <div className="space-y-2">
                {emergencyData.declarations.map((declaration: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{declaration.stateName}</span>: {declaration.title}
                    <span className="text-gray-600 ml-2">
                      ({formatDistanceToNow(new Date(declaration.publishedAt))} ago)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStates.map((state) => {
              const stateStatus = rssStatus?.statuses?.find((s: RSSFeedStatus) => s.state === state.code);
              
              return (
                <div key={state.code} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(state)}
                      <h3 className="font-semibold">{state.name}</h3>
                      <span className="text-sm text-gray-500">({state.code})</span>
                    </div>
                    {getStatusBadge(state)}
                  </div>

                  {stateStatus && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Checked:</span>
                        <span>{formatDistanceToNow(new Date(stateStatus.lastChecked))} ago</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">RSS Items:</span>
                        <span>{stateStatus.itemCount || 0}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emergencies:</span>
                        <span className={stateStatus.emergencyDeclarations > 0 ? "text-red-600 font-semibold" : ""}>
                          {stateStatus.emergencyDeclarations || 0}
                        </span>
                      </div>

                      {stateStatus.error && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          Error: {stateStatus.error}
                        </div>
                      )}

                      {stateStatus.lastDeclaration && (
                        <div className="text-xs bg-yellow-50 p-2 rounded">
                          <div className="font-medium">Latest Emergency:</div>
                          <div>{stateStatus.lastDeclaration.title}</div>
                          <div className="text-gray-600">
                            {formatDistanceToNow(new Date(stateStatus.lastDeclaration.publishedAt))} ago
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Globe className="w-3 h-3" />
                      <a 
                        href={state.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 truncate flex-1"
                      >
                        {state.url}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Missing States Alert */}
          {stats.errors > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                RSS Feed Connection Issues
              </h3>
              <p className="text-sm text-amber-700">
                {stats.errors} state{stats.errors > 1 ? 's' : ''} have RSS feed connection issues. 
                This may result in missing emergency declarations. Check the error details above and verify RSS feed URLs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}