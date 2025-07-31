import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, MapPin, Clock, Activity, Target, Zap } from "lucide-react";

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

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#10b981'];

const severityOrder = ['extreme', 'severe', 'moderate', 'minor', 'unknown'];
const urgencyOrder = ['immediate', 'expected', 'future', 'past', 'unknown'];

export default function RssAnalyticsDashboard() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [rssItems, setRssItems] = useState<FemaRssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [alertsResponse, rssResponse] = await Promise.all([
          fetch('/api/emergency-alerts'),
          fetch('/api/fema-rss')
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
        
      } catch (err) {
        console.error('RSS Analytics error:', err);
        setError('Unable to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000); // Refresh every 10 minutes
    return () => clearInterval(interval);
  }, []);

  // Analytics calculations
  const severityStats = severityOrder.map(severity => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: alerts.filter(alert => alert.severity === severity).length,
    color: severity === 'extreme' ? '#ef4444' : 
           severity === 'severe' ? '#f97316' : 
           severity === 'moderate' ? '#eab308' : 
           severity === 'minor' ? '#3b82f6' : '#6b7280'
  })).filter(item => item.value > 0);

  const urgencyStats = urgencyOrder.map(urgency => ({
    name: urgency.charAt(0).toUpperCase() + urgency.slice(1),
    value: alerts.filter(alert => alert.urgency === urgency).length
  })).filter(item => item.value > 0);

  const locationStats = Object.entries(
    alerts.reduce((acc, alert) => {
      const location = alert.location.split(',')[0].trim().substring(0, 15);
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))
   .sort((a, b) => b.value - a.value)
   .slice(0, 8);

  // Time series data for last 7 days
  const timeSeriesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const alertCount = alerts.filter(alert => 
      alert.sent.split('T')[0] === dateStr
    ).length;
    
    const declarationCount = rssItems.filter(item => 
      item.pubDate.split('T')[0] === dateStr
    ).length;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      alerts: alertCount,
      declarations: declarationCount
    };
  }).reverse();

  const totalActiveThreats = alerts.filter(alert => 
    alert.urgency === 'immediate' || alert.severity === 'extreme'
  ).length;

  const averageResponseTime = alerts.length > 0 ? 
    Math.round(alerts.reduce((acc, alert) => {
      const sentTime = new Date(alert.sent);
      const now = new Date();
      return acc + (now.getTime() - sentTime.getTime()) / (1000 * 60 * 60);
    }, 0) / alerts.length) : 0;

  if (loading) {
    return (
      <Card className="bg-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 animate-pulse" />
            Emergency Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-4 border">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Analytics Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Emergency Analytics Dashboard
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 border text-center">
            <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
            <div className="text-xs text-gray-600">Active Alerts</div>
          </div>
          <div className="bg-white rounded-lg p-3 border text-center">
            <div className="text-2xl font-bold text-red-600">{totalActiveThreats}</div>
            <div className="text-xs text-gray-600">High Priority</div>
          </div>
          <div className="bg-white rounded-lg p-3 border text-center">
            <div className="text-2xl font-bold text-green-600">{rssItems.length}</div>
            <div className="text-xs text-gray-600">Declarations</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="severity" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="severity">Severity</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="urgency">Urgency</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="severity" className="mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Alert Severity Distribution
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={severityStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {severityStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {severityStats.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Alerts by Location
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={locationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10} 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="urgency" className="mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Urgency Levels
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={urgencyStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                7-Day Trend Analysis
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="alerts" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Alerts"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="declarations" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Declarations"
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{averageResponseTime}h</div>
                  <div className="text-xs text-gray-600">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round((alerts.filter(a => a.certainty === 'likely').length / alerts.length) * 100) || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Certainty Rate</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}