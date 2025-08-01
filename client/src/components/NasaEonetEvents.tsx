import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Flame, 
  Mountain, 
  Waves, 
  Cloud, 
  Snowflake, 
  Wind, 
  AlertTriangle,
  MapPin,
  ExternalLink,
  Globe,
  Calendar,
  Zap,
  Sun,
  Thermometer,
  ChevronDown,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface EonetEvent {
  id: string;
  title: string;
  description: string;
  link: string;
  category: {
    id: string;
    title: string;
  } | null;
  source: {
    id: string;
    url: string;
  } | null;
  date: string | null;
  latitude: number | null;
  longitude: number | null;
  coordinates: [number, number] | null;
  magnitude: number | null;
  magnitudeUnit: string | null;
  geometry: any[];
}

interface EonetCategory {
  id: string;
  title: string;
  events: EonetEvent[];
}

interface EonetResponse {
  success: boolean;
  events: EonetEvent[];
  eventsByCategory: EonetCategory[];
  totalEvents: number;
  categories: string[];
  source: string;
  lastUpdated: string;
  cached?: boolean;
}

// Icon mapping for different event categories
const getCategoryIcon = (categoryId: string) => {
  const iconMap: Record<string, React.ElementType> = {
    wildfires: Flame,
    volcanoes: Mountain,
    floods: Waves,
    severeStorms: Wind,
    droughts: Sun,
    earthquakes: AlertTriangle,
    dustAndHaze: Cloud,
    snow: Snowflake,
    temperatureExtremes: Thermometer,
    landslides: Mountain,
    seaAndLakeIce: Snowflake,
    manmade: Zap
  };
  
  return iconMap[categoryId] || Globe;
};

// Color mapping for different event categories
const getCategoryColor = (categoryId: string) => {
  const colorMap: Record<string, string> = {
    wildfires: 'bg-red-100 text-red-700 border-red-200',
    volcanoes: 'bg-orange-100 text-orange-700 border-orange-200',
    floods: 'bg-blue-100 text-blue-700 border-blue-200',
    severeStorms: 'bg-purple-100 text-purple-700 border-purple-200',
    droughts: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    earthquakes: 'bg-gray-100 text-gray-700 border-gray-200',
    dustAndHaze: 'bg-amber-100 text-amber-700 border-amber-200',
    snow: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    temperatureExtremes: 'bg-pink-100 text-pink-700 border-pink-200',
    landslides: 'bg-green-100 text-green-700 border-green-200',
    seaAndLakeIce: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    manmade: 'bg-zinc-100 text-zinc-700 border-zinc-200'
  };
  
  return colorMap[categoryId] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export function NasaEonetEvents() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Build query URL with filters (fetch more data initially for infinite scroll)
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") {
      params.append('category', selectedCategory);
    }
    params.append('limit', '100'); // Fetch more data for smooth scrolling
    
    return `/api/nasa-eonet-events${params.toString() ? '?' + params.toString() : ''}`;
  };

  const { data, isLoading, error, refetch } = useQuery<EonetResponse>({
    queryKey: ['/api/nasa-eonet-events', selectedCategory],
    queryFn: () => fetch(buildApiUrl()).then(res => res.json()),
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000 // Consider data stale after 15 minutes
  });

  const filteredEvents = selectedCategory === "all" 
    ? data?.events || []
    : data?.events.filter(event => event.category?.id === selectedCategory) || [];

  // Infinite scroll functionality
  const loadMore = useCallback(() => {
    if (!data || visibleCount >= filteredEvents.length) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, filteredEvents.length));
      setIsLoadingMore(false);
    }, 300); // Small delay for smooth UX
  }, [data, visibleCount]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, isLoadingMore]);

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            NASA EONET Events - Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">Unable to load real-time natural disaster events</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.success) {
    return (
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            NASA EONET Events - No Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-600">No natural disaster events available at this time</p>
        </CardContent>
      </Card>
    );
  }

  const categories = Array.from(new Set(data?.events.map(e => e.category?.id).filter(Boolean) || []));

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            NASA EONET Natural Events
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Global Real-Time
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {data.cached && (
              <Badge variant="outline" className="text-xs">Cached</Badge>
            )}
            <span>Updated: {format(new Date(data.lastUpdated || new Date()), 'HH:mm')}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories ({data.totalEvents})</SelectItem>
              {categories.map(categoryId => {
                const categoryData = data.eventsByCategory.find(c => c.id === categoryId);
                const Icon = getCategoryIcon(categoryId || '');
                return (
                  <SelectItem key={categoryId || 'unknown'} value={categoryId || 'unknown'}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {categoryData?.title} ({categoryData?.events.length || 0})
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Showing {Math.min(visibleCount, filteredEvents.length)} of {filteredEvents.length}</span>
            {filteredEvents.length > visibleCount && (
              <Badge variant="outline" className="text-xs">
                Scroll for more
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredEvents.slice(0, visibleCount).map((event, index) => {
            const Icon = getCategoryIcon(event.category?.id || '');
            const categoryColor = getCategoryColor(event.category?.id || '');
            
            return (
              <div
                key={event.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gray-50 hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${categoryColor.replace('border-', 'bg-').replace('text-', 'text-white bg-')}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1">{event.title}</h3>
                      {event.category && (
                        <Badge className={`text-xs ${categoryColor} mb-2`}>
                          {event.category.title}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs text-gray-600">
                  <div className="space-y-2">
                    {event.date && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{format(new Date(event.date || new Date()), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                    
                    {(event.latitude && event.longitude) && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-mono">{event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</span>
                      </div>
                    )}
                    
                    {event.magnitude && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span>Magnitude: <strong>{event.magnitude} {event.magnitudeUnit}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {event.source && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-gray-500">Source:</span>
                        <a 
                          href={event.source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                        >
                          {event.source.id}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Globe className="w-4 h-4 text-purple-600" />
                      <span>Tracking points: <strong>{event.geometry.length}</strong></span>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Infinite scroll trigger */}
          {filteredEvents.length > visibleCount && (
            <div 
              ref={observerRef}
              className="flex items-center justify-center py-6"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more events...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                  <span>Scroll to load more</span>
                </div>
              )}
            </div>
          )}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-sm">No natural disaster events found for the selected category</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}