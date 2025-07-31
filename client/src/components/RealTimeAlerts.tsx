import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, Clock, MapPin } from "lucide-react";

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

interface AlertsResponse {
  success: boolean;
  alerts: EmergencyAlert[];
  source: string;
  lastUpdated: string;
}

interface RealTimeAlertsProps {
  maxItems?: number;
  stateFilter?: string;
}

export default function RealTimeAlerts({ maxItems = 5, stateFilter }: RealTimeAlertsProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/emergency-alerts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch emergency alerts');
        }
        
        const data: AlertsResponse = await response.json();
        
        if (!data.success) {
          throw new Error('Invalid alerts response');
        }
        
        let filteredAlerts = data.alerts || [];
        
        // Filter by state if specified
        if (stateFilter) {
          filteredAlerts = filteredAlerts.filter(alert => 
            alert.location.toUpperCase().includes(stateFilter.toUpperCase())
          );
        }
        
        setAlerts(filteredAlerts.slice(0, maxItems));
        setSource(data.source);
        
      } catch (err) {
        console.error('Emergency alerts error:', err);
        setError('Unable to load emergency alerts.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [maxItems, stateFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
      case 'severe': 
        return 'bg-red-50 border-red-200 text-red-800';
      case 'moderate':
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'minor':
      case 'low':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: 
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric', 
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Live Emergency Alerts
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

  if (error) {
    return (
      <Card className="bg-gray-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Live Emergency Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-2">{error}</p>
            <a 
              href="https://api.weather.gov/alerts/active" 
              className="text-red-600 hover:text-red-800 text-sm underline inline-flex items-center gap-1"
              target="_blank" 
              rel="noopener noreferrer"
            >
              View NWS Active Alerts <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Live Emergency Alerts
          {source && (
            <Badge variant="outline" className="text-xs">
              {source}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-lg p-6 border text-center">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              {stateFilter ? `No active alerts for ${stateFilter}` : 'No active emergency alerts'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {alerts.map((alert) => {
              const colorClass = getSeverityColor(alert.severity);
              
              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 transition-all hover:shadow-sm ${colorClass}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-sm leading-tight flex-1">
                      {alert.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      {alert.severity?.toUpperCase() || 'ALERT'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-700 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{alert.location}</span>
                  </div>
                  
                  {alert.description && (
                    <p className="text-xs text-gray-700 mb-3 leading-relaxed line-clamp-2">
                      {alert.description.length > 120 
                        ? `${alert.description.substring(0, 120)}...` 
                        : alert.description
                      }
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(alert.sent)}</span>
                    </div>
                    
                    {alert.web && (
                      <a
                        href={alert.web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="text-center pt-2">
              <a
                href="https://www.fema.gov/api/open/v2/IpawsArchivedAlerts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"
              >
                View all IPAWS alerts <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}