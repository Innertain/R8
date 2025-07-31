import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, MapPin } from "lucide-react";

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

export default function FemaRssFeed({ maxItems = 5 }: FemaRssFeedProps) {
  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRssFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/fema-rss');
        
        if (!response.ok) {
          throw new Error('Failed to fetch RSS feed');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.items) {
          throw new Error('Invalid RSS feed response');
        }
        
        const limitedItems = data.items.slice(0, maxItems);
        setRssItems(limitedItems);
        
      } catch (err) {
        console.error('RSS feed error:', err);
        setError('Unable to load emergency alerts.');
      } finally {
        setLoading(false);
      }
    };

    fetchRssFeed();
    const interval = setInterval(fetchRssFeed, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [maxItems]);

  const getDisasterTypeColor = (title: string) => {
    const upperTitle = title.toUpperCase();
    if (upperTitle.includes('HURRICANE') || upperTitle.includes('TORNADO')) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    if (upperTitle.includes('FLOOD') || upperTitle.includes('FIRE')) {
      return 'bg-orange-50 border-orange-200 text-orange-800';
    }
    if (upperTitle.includes('DROUGHT') || upperTitle.includes('WINTER')) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    return 'bg-gray-50 border-gray-200 text-gray-800';
  };

  if (loading) {
    return (
      <Card className="bg-gray-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Emergency Alerts
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
            Emergency Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-2">{error}</p>
            <a 
              href="https://www.fema.gov/disaster" 
              className="text-red-600 hover:text-red-800 text-sm underline inline-flex items-center gap-1"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Visit FEMA.gov <ExternalLink className="w-3 h-3" />
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
          Emergency Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {rssItems.length === 0 ? (
          <div className="bg-white rounded-lg p-6 border text-center">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No active emergency alerts</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {rssItems.map((item, index) => {
              const uniqueKey = `${item.link}-${index}`;
              const colorClass = getDisasterTypeColor(item.title);
              
              return (
                <div
                  key={uniqueKey}
                  className={`rounded-lg border p-4 transition-all hover:shadow-sm ${colorClass}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-sm leading-tight flex-1">
                      {item.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      ACTIVE
                    </Badge>
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>FEMA Official</span>
                    </div>
                    
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
            
            <div className="text-center pt-2">
              <a
                href="https://www.fema.gov/disaster"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center gap-1 transition-colors"
              >
                View all alerts on FEMA.gov <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}