import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ExternalLink, Clock, MapPin, Filter, Download, Share2, TrendingUp, Activity } from "lucide-react";

interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  urgency: string;
  certainty: string;
  sent: string;
  expires?: string;
  senderName: string;
  web?: string;
}

interface FemaRssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
}

interface ReliefWebItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
  country: string;
  glideCode: string;
  disasterType: string;
}

interface HumanitarianItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
  category: string;
  region: string;
  newsType: string;
}

interface AlertsResponse {
  success: boolean;
  alerts: EmergencyAlert[];
  source: string;
  lastUpdated: string;
}

interface RssResponse {
  success: boolean;
  items: FemaRssItem[];
}

interface EnhancedRssFeedProps {
  maxItems?: number;
  stateFilter?: string;
  showFilters?: boolean;
  showAnalytics?: boolean;
}

const severityColors = {
  extreme: "bg-red-100 border-red-300 text-red-800",
  severe: "bg-orange-100 border-orange-300 text-orange-800", 
  moderate: "bg-yellow-100 border-yellow-300 text-yellow-800",
  minor: "bg-blue-100 border-blue-300 text-blue-800",
  unknown: "bg-gray-100 border-gray-300 text-gray-800"
};

const urgencyColors = {
  immediate: "border-l-4 border-l-red-500",
  expected: "border-l-4 border-l-orange-500",
  future: "border-l-4 border-l-yellow-500",
  past: "border-l-4 border-l-gray-500",
  unknown: "border-l-4 border-l-gray-400"
};

export default function EnhancedRssFeed({ 
  maxItems = 10, 
  stateFilter, 
  showFilters = true,
  showAnalytics = true 
}: EnhancedRssFeedProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [rssItems, setRssItems] = useState<FemaRssItem[]>([]);
  const [globalDisasters, setGlobalDisasters] = useState<ReliefWebItem[]>([]);
  const [humanitarianNews, setHumanitarianNews] = useState<HumanitarianItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'declarations' | 'global' | 'news'>('live');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>(stateFilter || 'all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch live alerts, RSS declarations, global disasters, and humanitarian news
        const [alertsResponse, rssResponse, globalResponse, newsResponse] = await Promise.all([
          fetch('/api/emergency-alerts'),
          fetch('/api/fema-rss'),
          fetch('/api/reliefweb-disasters'),
          fetch('/api/humanitarian-news')
        ]);
        
        if (alertsResponse.ok) {
          const alertsData: AlertsResponse = await alertsResponse.json();
          if (alertsData.success) {
            setAlerts(alertsData.alerts || []);
          }
        }
        
        if (rssResponse.ok) {
          const rssData: RssResponse = await rssResponse.json();
          if (rssData.success) {
            setRssItems(rssData.items || []);
          }
        }
        
        if (globalResponse.ok) {
          const globalData = await globalResponse.json();
          if (globalData.success) {
            setGlobalDisasters(globalData.items || []);
          }
        }
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          if (newsData.success) {
            setHumanitarianNews(newsData.items || []);
          }
        }
        
      } catch (err) {
        console.error('Enhanced RSS feed error:', err);
        setError('Unable to load emergency data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (locationFilter !== 'all' && !alert.location.toUpperCase().includes(locationFilter.toUpperCase())) return false;
    return true;
  }).slice(0, maxItems);

  // Filter RSS items based on location filter
  const filteredRssItems = rssItems.filter(item => {
    if (locationFilter !== 'all' && !item.title.toUpperCase().includes(locationFilter.toUpperCase())) return false;
    return true;
  }).slice(0, maxItems);

  // Analytics data
  const severityStats = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationStats = alerts.reduce((acc, alert) => {
    const location = alert.location.split(',')[0].trim(); // Get first part of location
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exportData = () => {
    const data = activeTab === 'live' ? filteredAlerts : filteredRssItems;
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `emergency-${activeTab}-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const shareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency ${activeTab === 'live' ? 'Alerts' : 'Declarations'}`,
          text: `${activeTab === 'live' ? filteredAlerts.length : filteredRssItems.length} active emergency ${activeTab === 'live' ? 'alerts' : 'declarations'}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            Emergency Data Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-4 border">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50/50 w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Emergency Data Feed
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={shareData}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'live' | 'declarations' | 'global' | 'news')}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="live" className="flex items-center gap-1 text-xs">
              <Activity className="w-3 h-3" />
              Live ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="declarations" className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3" />
              US ({rssItems.length})
            </TabsTrigger>
            <TabsTrigger value="global" className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              Global ({globalDisasters.length})
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3" />
              News ({humanitarianNews.length})
            </TabsTrigger>
          </TabsList>

          {showFilters && (
            <div className="flex gap-2 mt-4">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {Object.keys(locationStats).slice(0, 10).map(location => (
                    <SelectItem key={location} value={location}>
                      {location} ({locationStats[location]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showAnalytics && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm font-medium text-gray-600 mb-3">Severity Breakdown</div>
                <div className="space-y-2">
                  {Object.entries(severityStats).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between text-sm">
                      <span className="capitalize">{severity}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm font-medium text-gray-600 mb-3">Active Locations</div>
                <div className="space-y-2">
                  {Object.entries(locationStats).slice(0, 4).map(([location, count]) => (
                    <div key={location} className="flex justify-between text-sm">
                      <span className="truncate">{location}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm font-medium text-gray-600 mb-3">Data Sources</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>FEMA IPAWS</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>NWS Alerts</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>RSS Declarations</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm font-medium text-gray-600 mb-3">Feed Status</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Last Update</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Refresh Rate</span>
                    <span className="font-medium">5min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Items</span>
                    <span className="font-medium">{alerts.length + rssItems.length + globalDisasters.length + humanitarianNews.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <TabsContent value="live" className="mt-6">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border text-center">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No active emergency alerts</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 transition-all hover:shadow-sm bg-white ${urgencyColors[alert.urgency as keyof typeof urgencyColors] || urgencyColors.unknown}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-sm leading-tight flex-1">
                        {alert.title}
                      </h3>
                      <Badge className={severityColors[alert.severity as keyof typeof severityColors] || severityColors.unknown}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {alert.description && (
                      <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                        {alert.description.substring(0, 150)}
                        {alert.description.length > 150 && '...'}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{alert.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.sent).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {alert.web && (
                        <a
                          href={alert.web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          Details <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="declarations" className="mt-6">
            {filteredRssItems.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No recent US disaster declarations</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRssItems.map((item, index) => (
                  <div
                    key={`${item.guid}-${index}`}
                    className="rounded-lg border p-4 transition-all hover:shadow-sm bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-sm leading-tight flex-1">
                        {item.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        DECLARED
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                      </div>
                      
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        View Declaration <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="global" className="mt-6">
            {globalDisasters.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No global disasters reported</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {globalDisasters.slice(0, maxItems).map((disaster, index) => {
                  const disasterColors = {
                    'earthquake': 'bg-red-50 border-red-200',
                    'flood': 'bg-blue-50 border-blue-200',
                    'wildfire': 'bg-orange-50 border-orange-200',
                    'hurricane': 'bg-purple-50 border-purple-200',
                    'drought': 'bg-yellow-50 border-yellow-200',
                    'other': 'bg-gray-50 border-gray-200'
                  };
                  
                  return (
                    <div
                      key={`${disaster.guid}-${index}`}
                      className={`rounded-lg border p-4 transition-all hover:shadow-sm ${disasterColors[disaster.disasterType as keyof typeof disasterColors] || disasterColors.other}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-sm leading-tight flex-1">
                          {disaster.title}
                        </h3>
                        <Badge className="text-xs whitespace-nowrap capitalize bg-blue-100 text-blue-800">
                          {disaster.disasterType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{disaster.country}</span>
                        </div>
                        {disaster.glideCode && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono bg-gray-100 px-1 rounded">{disaster.glideCode}</span>
                          </div>
                        )}
                      </div>
                      
                      {disaster.description && (
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                          {disaster.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(disaster.pubDate).toLocaleDateString()}</span>
                        </div>
                        
                        <a
                          href={disaster.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          ReliefWeb <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            {humanitarianNews.length === 0 ? (
              <div className="bg-white rounded-lg p-6 border text-center">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No humanitarian news available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {humanitarianNews.slice(0, maxItems).map((news, index) => {
                  const newsColors = {
                    'conflict': 'bg-red-50 border-red-200',
                    'climate': 'bg-green-50 border-green-200',
                    'health': 'bg-blue-50 border-blue-200',
                    'food': 'bg-yellow-50 border-yellow-200',
                    'policy': 'bg-purple-50 border-purple-200',
                    'funding': 'bg-indigo-50 border-indigo-200',
                    'general': 'bg-gray-50 border-gray-200'
                  };
                  
                  return (
                    <div
                      key={`${news.guid}-${index}`}
                      className={`rounded-lg border p-4 transition-all hover:shadow-sm ${newsColors[news.newsType as keyof typeof newsColors] || newsColors.general}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-sm leading-tight flex-1">
                          {news.title}
                        </h3>
                        <Badge className="text-xs whitespace-nowrap capitalize bg-orange-100 text-orange-800">
                          {news.newsType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{news.region}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="bg-gray-100 px-1 rounded">{news.category}</span>
                        </div>
                      </div>
                      
                      {news.description && (
                        <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                          {news.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(news.pubDate).toLocaleDateString()}</span>
                        </div>
                        
                        <a
                          href={news.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          Read More <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}