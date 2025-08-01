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

// Function to get readable location from coordinates
const getLocationName = (lat: number, lon: number): string => {
  // Simple region mapping based on coordinates
  if (lat >= 25 && lat <= 49 && lon >= -125 && lon <= -66) {
    // United States
    if (lat >= 25 && lat <= 31 && lon >= -117 && lon <= -80) return "Southern US";
    if (lat >= 32 && lat <= 42 && lon >= -125 && lon <= -100) return "Western US";
    if (lat >= 32 && lat <= 42 && lon >= -100 && lon <= -80) return "Central US";
    if (lat >= 39 && lat <= 49 && lon >= -125 && lon <= -100) return "Northwestern US";
    if (lat >= 39 && lat <= 49 && lon >= -100 && lon <= -66) return "Northern US";
    return "United States";
  }
  if (lat >= 49 && lat <= 85 && lon >= -141 && lon <= -52) return "Canada";
  if (lat >= 14 && lat <= 33 && lon >= -118 && lon <= -86) return "Mexico/Central America";
  if (lat >= -60 && lat <= 15 && lon >= -82 && lon <= -35) return "South America";
  if (lat >= 35 && lat <= 75 && lon >= -10 && lon <= 50) return "Europe";
  if (lat >= -35 && lat <= 40 && lon >= -20 && lon <= 55) return "Africa";
  if (lat >= -50 && lat <= 80 && lon >= 25 && lon <= 180) return "Asia";
  if (lat >= -50 && lat <= -10 && lon >= 110 && lon <= 180) return "Australia/Oceania";
  
  // Ocean regions
  if (lon >= -180 && lon <= -30) return "Pacific Ocean";
  if (lon >= -30 && lon <= 40) return "Atlantic Ocean";
  if (lon >= 40 && lon <= 120) return "Indian Ocean";
  
  return "Remote Location";
};

export function NasaEonetEvents() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>("all");
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

  const filteredEvents = data?.events.filter(event => {
    // Filter by category
    if (selectedCategory !== 'all' && event.category?.id !== selectedCategory) return false;
    
    // Filter by incident type
    if (selectedIncidentType !== 'all') {
      const eventTitle = event.title.toLowerCase();
      switch (selectedIncidentType) {
        case 'wildfires':
          return eventTitle.includes('fire') || event.category?.id === 'wildfires';
        case 'storms':
          return eventTitle.includes('storm') || eventTitle.includes('cyclone') || eventTitle.includes('hurricane') || event.category?.id === 'severeStorms';
        case 'volcanoes':
          return eventTitle.includes('volcano') || event.category?.id === 'volcanoes';
        case 'earthquakes':
          return eventTitle.includes('earthquake') || event.category?.id === 'earthquakes';
        case 'floods':
          return eventTitle.includes('flood') || event.category?.id === 'floods';
        default:
          return true;
      }
    }
    
    return true;
  }) || [];

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

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategory, selectedIncidentType]);

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
            <div className="relative">
              <Globe className="w-6 h-6 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
            </div>
            Live Natural Disasters
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              NASA Satellite Data
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {data.cached && (
              <Badge variant="outline" className="text-xs">Cached</Badge>
            )}
            <span>Updated: {format(new Date(data.lastUpdated || new Date()), 'HH:mm')}</span>
          </div>
        </div>

        {/* Explanation Box */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">What you're seeing</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                These are real natural disasters happening right now around the world, detected by NASA satellites. 
                Each event shows when it started, where it's located, and how big it is. The data comes directly from 
                official government agencies like the US Forest Service, Geological Survey, and military weather services.
              </p>
            </div>
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

          {/* Incident Type Filter */}
          <Select value={selectedIncidentType} onValueChange={setSelectedIncidentType}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="wildfires">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Wildfires
                </div>
              </SelectItem>
              <SelectItem value="storms">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Storms & Hurricanes
                </div>
              </SelectItem>
              <SelectItem value="volcanoes">
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4" />
                  Volcanoes
                </div>
              </SelectItem>
              <SelectItem value="earthquakes">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Earthquakes
                </div>
              </SelectItem>
              <SelectItem value="floods">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4" />
                  Floods
                </div>
              </SelectItem>
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
                    <div className={`p-3 rounded-full shadow-sm ${categoryColor.replace('border-', 'bg-').replace('text-', 'text-white bg-')}`}>
                      <Icon className="w-5 h-5" />
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    {event.date && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-blue-900">When</div>
                          <div className="text-blue-700">{format(new Date(event.date || new Date()), 'MMM dd, yyyy')}</div>
                          <div className="text-xs text-blue-600">{format(new Date(event.date || new Date()), 'h:mm a')}</div>
                        </div>
                      </div>
                    )}
                    
                    {(event.latitude && event.longitude) && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <div className="font-medium text-green-900">Location</div>
                          <div className="text-green-700 font-semibold">
                            {getLocationName(event.latitude, event.longitude)}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {event.latitude > 0 ? `${event.latitude.toFixed(2)}°N` : `${Math.abs(event.latitude).toFixed(2)}°S`}, {' '}
                            {event.longitude > 0 ? `${event.longitude.toFixed(2)}°E` : `${Math.abs(event.longitude).toFixed(2)}°W`}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {event.magnitude && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-medium text-orange-900">Size/Intensity</div>
                          <div className="text-orange-700 font-semibold">{event.magnitude} {event.magnitudeUnit}</div>
                          <div className="text-xs text-orange-600">
                            {event.magnitudeUnit === 'acres' ? 'Burned area' : 
                             event.magnitudeUnit === 'kts' ? 'Wind speed' : 
                             'Measured intensity'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {event.source && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <ExternalLink className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium text-purple-900">Data Source</div>
                          <a 
                            href={event.source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-700 hover:text-purple-800 font-medium"
                          >
                            {event.source.id === 'IRWIN' ? 'US Forest Service' :
                             event.source.id === 'JTWC' ? 'Military Weather' :
                             event.source.id === 'USGS' ? 'US Geological Survey' :
                             event.source.id}
                          </a>
                          <div className="text-xs text-purple-600">Official agency data</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Satellite Updates</div>
                        <div className="text-gray-700">{event.geometry.length} tracking points</div>
                        <div className="text-xs text-gray-600">
                          {event.geometry.length === 1 ? 'Single location' : 
                           event.geometry.length < 5 ? 'Few updates' : 
                           event.geometry.length < 20 ? 'Regular monitoring' : 
                           'Highly monitored'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="font-medium text-blue-900 text-sm mb-2">Additional Details</div>
                      <p className="text-sm text-blue-800 leading-relaxed">{event.description}</p>
                    </div>
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