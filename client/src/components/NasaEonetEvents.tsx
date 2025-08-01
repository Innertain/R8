import React, { useState } from "react";
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
  Thermometer
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
  const [limitEvents, setLimitEvents] = useState<number>(20);

  // Build query URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") {
      params.append('category', selectedCategory);
    }
    params.append('limit', limitEvents.toString());
    
    return `/api/nasa-eonet-events${params.toString() ? '?' + params.toString() : ''}`;
  };

  const { data, isLoading, error, refetch } = useQuery<EonetResponse>({
    queryKey: ['/api/nasa-eonet-events', selectedCategory, limitEvents],
    queryFn: () => fetch(buildApiUrl()).then(res => res.json()),
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000 // Consider data stale after 15 minutes
  });

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

  const filteredEvents = selectedCategory === "all" 
    ? data.events 
    : data.events.filter(event => event.category?.id === selectedCategory);

  const categories = Array.from(new Set(data.events.map(e => e.category?.id).filter(Boolean)));

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
            <SelectTrigger className="w-full sm:w-48">
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

          <Select value={limitEvents.toString()} onValueChange={(value) => setLimitEvents(parseInt(value))}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Show 10</SelectItem>
              <SelectItem value="20">Show 20</SelectItem>
              <SelectItem value="50">Show 50</SelectItem>
              <SelectItem value="100">Show 100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {filteredEvents.slice(0, limitEvents).map((event) => {
            const Icon = getCategoryIcon(event.category?.id || '');
            const categoryColor = getCategoryColor(event.category?.id || '');
            
            return (
              <div
                key={event.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800 text-sm">{event.title}</h3>
                  </div>
                  {event.category && (
                    <Badge className={`text-xs ${categoryColor}`}>
                      {event.category.title}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="space-y-1">
                    {event.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(event.date || new Date()), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                    
                    {(event.latitude && event.longitude) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.latitude.toFixed(3)}, {event.longitude.toFixed(3)}</span>
                      </div>
                    )}
                    
                    {event.magnitude && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Magnitude: {event.magnitude} {event.magnitudeUnit}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {event.source && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Source:</span>
                        <a 
                          href={event.source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {event.source.id}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Tracking points:</span>
                      <span>{event.geometry.length}</span>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No events found for the selected category</p>
          </div>
        )}

        {filteredEvents.length > limitEvents && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing {limitEvents} of {filteredEvents.length} events
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}