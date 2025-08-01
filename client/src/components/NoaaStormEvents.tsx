import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  MapPin,
  Calendar,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Navigation,
  ExternalLink,
  ChevronDown,
  Loader2,
  Wind,
  CloudRain,
  Tornado
} from "lucide-react";
import { format } from "date-fns";

interface NoaaStormEvent {
  id: string;
  eventId: string;
  episodeId: string;
  eventType: string;
  state: string;
  stateFips: string;
  yearMonth: string;
  beginDate: string;
  endDate: string;
  injuriesDirect: number;
  injuriesIndirect: number;
  deathsDirect: number;
  deathsIndirect: number;
  damageProperty: number;
  damageCrops: number;
  source: string;
  magnitude: number | null;
  magnitudeType: string;
  floodCause: string;
  category: string;
  torEfScale: string | null;
  beginLocation: string;
  endLocation: string;
  beginLat: number | null;
  beginLon: number | null;
  endLat: number | null;
  endLon: number | null;
  episodeNarrative: string;
  eventNarrative: string;
  dataSource: string;
}

interface NoaaStormResponse {
  success: boolean;
  events: NoaaStormEvent[];
  totalEvents: number;
  source: string;
  lastUpdated: string;
  cached?: boolean;
  note?: string;
}

// Icon mapping for different storm event types
const getEventTypeIcon = (eventType: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'Hurricane (Typhoon)': Wind,
    'Tropical Storm': CloudRain,
    'Tornado': Tornado,
    'Thunderstorm Wind': Wind,
    'Hail': CloudRain,
    'Flash Flood': CloudRain,
    'Flood': CloudRain
  };
  
  return iconMap[eventType] || Zap;
};

// Color mapping for different storm event types
const getEventTypeColor = (eventType: string) => {
  const colorMap: Record<string, string> = {
    'Hurricane (Typhoon)': 'bg-red-100 text-red-700 border-red-200',
    'Tropical Storm': 'bg-orange-100 text-orange-700 border-orange-200',
    'Tornado': 'bg-purple-100 text-purple-700 border-purple-200',
    'Thunderstorm Wind': 'bg-blue-100 text-blue-700 border-blue-200',
    'Hail': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Flash Flood': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Flood': 'bg-teal-100 text-teal-700 border-teal-200'
  };
  
  return colorMap[eventType] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// Format currency values
const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
};

export function NoaaStormEvents() {
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Build query URL with filters
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    if (selectedEventType !== "all") {
      params.append('eventType', selectedEventType);
    }
    if (selectedState !== "all") {
      params.append('state', selectedState);
    }
    params.append('limit', '50');
    
    return `/api/noaa-storm-events${params.toString() ? '?' + params.toString() : ''}`;
  };

  const { data, isLoading, error, refetch } = useQuery<NoaaStormResponse>({
    queryKey: ['/api/noaa-storm-events', selectedEventType, selectedState],
    queryFn: () => fetch(buildApiUrl()).then(res => res.json()),
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    staleTime: 15 * 60 * 1000, // Consider data stale after 15 minutes
    retry: 3
  });

  // Debug logging
  console.log('NOAA Storm Events - data:', data);
  console.log('NOAA Storm Events - isLoading:', isLoading);
  console.log('NOAA Storm Events - error:', error);

  const filteredEvents = data?.events || [];

  // Infinite scroll functionality
  const loadMore = useCallback(() => {
    if (!data || visibleCount >= filteredEvents.length) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, filteredEvents.length));
      setIsLoadingMore(false);
    }, 300);
  }, [data, visibleCount, filteredEvents.length]);

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
  }, [selectedEventType, selectedState]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Loading NOAA Storm Events...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('NOAA Storm Events error:', error);
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            NOAA Storm Events - Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">Unable to load storm event data: {error?.message || 'Unknown error'}</p>
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
            NOAA Storm Events - No Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-600">No storm events available at this time</p>
        </CardContent>
      </Card>
    );
  }

  const eventTypes = Array.from(new Set(data.events.map(e => e.eventType).filter(Boolean)));
  const states = Array.from(new Set(data.events.map(e => e.state).filter(Boolean))).sort();

  // Calculate summary statistics
  const totalDamage = filteredEvents.reduce((sum, event) => sum + event.damageProperty + event.damageCrops, 0);
  const totalCasualties = filteredEvents.reduce((sum, event) => sum + event.deathsDirect + event.deathsIndirect + event.injuriesDirect + event.injuriesIndirect, 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            NOAA Storm Events Database
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Phase 2
            </Badge>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              {filteredEvents.length} Events
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {data.cached && (
              <Badge variant="outline" className="text-xs">Cached</Badge>
            )}
            <span>Updated: {format(new Date(data.lastUpdated || new Date()), 'HH:mm')}</span>
          </div>
        </div>

        {data.note && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            {data.note}
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-xl font-bold text-blue-700">{data.totalEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Damage</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(totalDamage)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Impact</p>
                <p className="text-xl font-bold text-purple-700">{totalCasualties} people</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-3 mt-4">
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types ({data.totalEvents})</SelectItem>
              {eventTypes.map(eventType => {
                const count = data.events.filter(e => e.eventType === eventType).length;
                const Icon = getEventTypeIcon(eventType);
                return (
                  <SelectItem key={eventType} value={eventType}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {eventType} ({count})
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-full lg:w-32">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map(state => {
                const count = data.events.filter(e => e.state === state).length;
                return (
                  <SelectItem key={state} value={state}>
                    {state} ({count})
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
        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
          {filteredEvents.slice(0, visibleCount).map((event, index) => {
            const Icon = getEventTypeIcon(event.eventType);
            const eventTypeColor = getEventTypeColor(event.eventType);
            const totalDamageEvent = event.damageProperty + event.damageCrops;
            const totalCasualtiesEvent = event.deathsDirect + event.deathsIndirect + event.injuriesDirect + event.injuriesIndirect;
            
            return (
              <div
                key={event.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gray-50 hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${eventTypeColor.replace('border-', 'bg-').replace('text-', 'text-white bg-')}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{event.eventType}</h3>
                        <Badge className={`text-xs ${eventTypeColor}`}>
                          {event.state}
                        </Badge>
                        {event.magnitude && (
                          <Badge variant="outline" className="text-xs">
                            {event.magnitudeType}: {event.magnitude}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{event.beginLocation} → {event.endLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{format(new Date(event.beginDate), 'MMM dd, yyyy')} - {format(new Date(event.endDate), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    {(event.beginLat && event.beginLon) && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-mono text-xs">{event.beginLat.toFixed(4)}, {event.beginLon.toFixed(4)}</span>
                      </div>
                    )}

                    {totalDamageEvent > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <DollarSign className="w-4 h-4 text-red-600" />
                        <span>Damage: <strong>{formatCurrency(totalDamageEvent)}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {totalCasualtiesEvent > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>
                          <strong>{event.deathsDirect + event.deathsIndirect}</strong> deaths, 
                          <strong> {event.injuriesDirect + event.injuriesIndirect}</strong> injuries
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Navigation className="w-4 h-4 text-gray-600" />
                      <span>Source: <strong>{event.source}</strong></span>
                    </div>
                  </div>
                </div>

                {event.eventNarrative && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">{event.eventNarrative}</p>
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
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No storm events found</h3>
            <p className="text-sm">No storm events found for the selected filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}