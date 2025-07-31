import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, Clock } from "lucide-react";

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid: string;
}

interface FemaRssFeedProps {
  maxItems?: number;
}

export default function FemaRssFeed({ maxItems = 10 }: FemaRssFeedProps) {
  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRssFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use our backend endpoint to fetch RSS feed
        const response = await fetch('/api/fema-rss');
        
        if (!response.ok) {
          throw new Error('Failed to fetch RSS feed');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.items) {
          throw new Error('Invalid RSS feed response');
        }
        
        // Limit items based on maxItems prop
        const limitedItems = data.items.slice(0, maxItems);
        setRssItems(limitedItems);
        
      } catch (err) {
        console.error('RSS feed error:', err);
        setError('Unable to load emergency alerts. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchRssFeed();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchRssFeed, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [maxItems]);

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

  const getSeverityFromTitle = (title: string) => {
    const upperTitle = title.toUpperCase();
    if (upperTitle.includes('MAJOR') || upperTitle.includes('EMERGENCY') || upperTitle.includes('DISASTER')) {
      return 'high';
    }
    if (upperTitle.includes('WARNING') || upperTitle.includes('ALERT')) {
      return 'medium';
    }
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            FEMA Emergency Alerts
          </CardTitle>
          <CardDescription>Loading latest emergency alerts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            FEMA Emergency Alerts
          </CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Visit <a href="https://www.fema.gov/disaster" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
              FEMA.gov
            </a> for the latest emergency information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          FEMA Emergency Alerts
        </CardTitle>
        <CardDescription>
          Latest emergency and disaster alerts from FEMA
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rssItems.length === 0 ? (
          <p className="text-sm text-gray-600">No recent emergency alerts.</p>
        ) : (
          <div className="space-y-4">
            {rssItems.map((item) => {
              const severity = getSeverityFromTitle(item.title);
              return (
                <div
                  key={item.guid}
                  className="border-l-4 border-orange-200 pl-4 pb-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm leading-tight">
                      {item.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs whitespace-nowrap ${getSeverityColor(severity)}`}
                    >
                      {severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {item.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.pubDate)}
                    </div>
                    
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>Read more</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}