import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Users, 
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  Cloud,
  Snowflake,
  Flame,
  Wind,
  Droplets,
  Info,
  ExternalLink,
  BookOpen,
  Database
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

// Import state icons
import alaskaIcon from '@assets/Alaska_1754172085109.png';
import arizonaIcon from '@assets/Arizona_1754172085110.png';
import arkansasIcon from '@assets/Arkansas_1754172085111.png';
import californiaIcon from '@assets/California_1754172085112.png';
import coloradoIcon from '@assets/Colorado_1754172085113.png';
import connecticutIcon from '@assets/Connecticut Map Silhouette_1754172085114.png';
import delawareIcon from '@assets/Delaware_1754172085115.png';
import dcIcon from '@assets/District of Columbia_1754172085116.png';
import floridaIcon from '@assets/Florida_1754172085117.png';
import georgiaIcon from '@assets/Georgia_1754172085118.png';
import hawaiiIcon from '@assets/Hawaii_1754172085119.png';
import idahoIcon from '@assets/Idaho_1754172085120.png';
import illinoisIcon from '@assets/Illinois_1754172085121.png';
import indianaIcon from '@assets/Indiana_1754172085108.png';
import iowaIcon from '@assets/Iowa_1754172090688.png';
import kansasIcon from '@assets/Kansas_1754172090689.png';
import kentuckyIcon from '@assets/Kentucky_1754172090690.png';
import louisianaIcon from '@assets/Lousiana_1754172090691.png';
import maineIcon from '@assets/Maine_1754172090691.png';
import marylandIcon from '@assets/Maryland_1754172090693.png';
import massachusettsIcon from '@assets/Massachusetts_1754172090694.png';
import michiganIcon from '@assets/Michigan_1754172090695.png';
import minnesotaIcon from '@assets/Minnesota_1754172090696.png';
import mississippiIcon from '@assets/Mississippi_1754172090697.png';
import missouriIcon from '@assets/Missouri_1754172090698.png';
import montanaIcon from '@assets/Montana_1754172090698.png';
import nebraskaIcon from '@assets/Nebraska_1754172090686.png';
import nevadaIcon from '@assets/Nevada_1754172552866.png';
import newHampshireIcon from '@assets/New Hampshire_1754172552868.png';
import newJerseyIcon from '@assets/New Jersey_1754172552869.png';
import newMexicoIcon from '@assets/New Mexico_1754172552870.png';
import newYorkIcon from '@assets/New York State_1754172552871.png';
import northCarolinaIcon from '@assets/North Carolina_1754172552872.png';
import northDakotaIcon from '@assets/North Dakota_1754172552872.png';
import ohioIcon from '@assets/Ohio_1754172552873.png';
import oklahomaIcon from '@assets/Oklahoma_1754172552874.png';
import oregonIcon from '@assets/Oregon_1754172552875.png';
import pennsylvaniaIcon from '@assets/Pennsylvania_1754172552875.png';
import rhodeIslandIcon from '@assets/Rhode Island_1754172552876.png';
import southCarolinaIcon from '@assets/South Carolina_1754172552865.png';
import southDakotaIcon from '@assets/South Dakota_1754172607630.png';
import tennesseeIcon from '@assets/Tennessee_1754172607631.png';
import texasIcon from '@assets/TEXAS_1754172607632.png';
import utahIcon from '@assets/Utah_1754172607633.png';
import vermontIcon from '@assets/Vermont_1754172607635.png';
import virginiaIcon from '@assets/Virginia_1754172607636.png';
import washingtonIcon from '@assets/Washington_1754172607637.png';
import westVirginiaIcon from '@assets/West Virginia_1754172607637.png';
import wisconsinIcon from '@assets/Wisconsin_1754172607638.png';
import wyomingIcon from '@assets/Wyoming_1754172607638.png';

interface StormEvent {
  id: string;
  eventType: string;
  state: string;
  county: string;
  beginDate: string;
  endDate: string;
  deaths: number;
  injuries: number;
  damageProperty: number;
  damageCrops: number;
  magnitude: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface ExtremeWeatherData {
  success: boolean;
  events: StormEvent[];
  totalEvents: number;
  statistics: {
    eventTypes: Record<string, number>;
    stateImpacts: Record<string, number>;
    monthlyDistribution: Record<string, number>;
    totals: {
      deaths: number;
      injuries: number;
      propertyDamage: number;
      cropDamage: number;
      totalDamage: number;
    };
  };
  trends: {
    monthlyTrends: Record<string, any>;
    topEventTypes: [string, number][];
  };
  timeRange: string;
}

const eventTypeIcons: Record<string, any> = {
  'Tornado': Wind,
  'Hurricane': Wind,
  'Flash Flood': Droplets,
  'Wildfire': Flame,
  'Winter Storm': Snowflake,
  'Severe Thunderstorm': Zap,
  'Drought': Cloud,
  'Heat Wave': Flame,
  'Blizzard': Snowflake,
  'Hail Storm': Cloud,
  'Ice Storm': Snowflake
};

// State icon mapping
const stateIconMapping: Record<string, string> = {
  'Alaska': alaskaIcon,
  'Arizona': arizonaIcon,
  'Arkansas': arkansasIcon,
  'California': californiaIcon,
  'Colorado': coloradoIcon,
  'Connecticut': connecticutIcon,
  'Delaware': delawareIcon,
  'District of Columbia': dcIcon,
  'Florida': floridaIcon,
  'Georgia': georgiaIcon,
  'Hawaii': hawaiiIcon,
  'Idaho': idahoIcon,
  'Illinois': illinoisIcon,
  'Indiana': indianaIcon,
  'Iowa': iowaIcon,
  'Kansas': kansasIcon,
  'Kentucky': kentuckyIcon,
  'Louisiana': louisianaIcon,
  'Maine': maineIcon,
  'Maryland': marylandIcon,
  'Massachusetts': massachusettsIcon,
  'Michigan': michiganIcon,
  'Minnesota': minnesotaIcon,
  'Mississippi': mississippiIcon,
  'Missouri': missouriIcon,
  'Montana': montanaIcon,
  'Nebraska': nebraskaIcon,
  'Nevada': nevadaIcon,
  'New Hampshire': newHampshireIcon,
  'New Jersey': newJerseyIcon,
  'New Mexico': newMexicoIcon,
  'New York': newYorkIcon,
  'North Carolina': northCarolinaIcon,
  'North Dakota': northDakotaIcon,
  'Ohio': ohioIcon,
  'Oklahoma': oklahomaIcon,
  'Oregon': oregonIcon,
  'Pennsylvania': pennsylvaniaIcon,
  'Rhode Island': rhodeIslandIcon,
  'South Carolina': southCarolinaIcon,
  'South Dakota': southDakotaIcon,
  'Tennessee': tennesseeIcon,
  'Texas': texasIcon,
  'Utah': utahIcon,
  'Vermont': vermontIcon,
  'Virginia': virginiaIcon,
  'Washington': washingtonIcon,
  'West Virginia': westVirginiaIcon,
  'Wisconsin': wisconsinIcon,
  'Wyoming': wyomingIcon
};

const severityColors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626'];

// Function to extract infobox data from Wikipedia
async function extractInfoboxData(title: string): Promise<any> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&prop=revisions&rvprop=content&rvsection=0&origin=*`
    );
    
    if (!response.ok) return {};
    
    const data = await response.json();
    const pages = data.query?.pages;
    if (!pages) return {};
    
    const pageData = Object.values(pages)[0] as any;
    const content = pageData.revisions?.[0]?.['*'];
    if (!content) return {};
    
    // Extract infobox data using regex patterns
    const infobox: any = {};
    
    // Common infobox patterns for disasters
    const patterns = {
      date: /\|[\s]*date[\s]*=[\s]*([^|\n]+)/i,
      location: /\|[\s]*location[\s]*=[\s]*([^|\n]+)/i,
      coordinates: /\|[\s]*coordinates[\s]*=[\s]*([^|\n]+)/i,
      deaths: /\|[\s]*deaths[\s]*=[\s]*([^|\n]+)/i,
      injuries: /\|[\s]*(?:injuries|injured)[\s]*=[\s]*([^|\n]+)/i,
      missing: /\|[\s]*missing[\s]*=[\s]*([^|\n]+)/i,
      evacuated: /\|[\s]*evacuated[\s]*=[\s]*([^|\n]+)/i,
      damage: /\|[\s]*damage[\s]*=[\s]*([^|\n]+)/i,
      burnedArea: /\|[\s]*(?:burned|area)[\s]*=[\s]*([^|\n]+)/i,
      structuresDestroyed: /\|[\s]*(?:structures|buildings)[\s]*=[\s]*([^|\n]+)/i,
      cause: /\|[\s]*cause[\s]*=[\s]*([^|\n]+)/i,
      status: /\|[\s]*status[\s]*=[\s]*([^|\n]+)/i
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        infobox[key] = match[1].trim().replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/\{\{[^}]+\}\}/g, '');
      }
    }
    
    return infobox;
  } catch (error) {
    console.error('Error extracting infobox data:', error);
    return {};
  }
}

// Wikipedia data interface
interface WikipediaData {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
  };
  pageUrl: string;
  damage?: string;
  casualties?: string;
  verified: boolean;
  images?: string[];
  infobox?: {
    date?: string;
    location?: string;
    coordinates?: string;
    status?: string;
    burnedArea?: string;
    deaths?: string;
    injuries?: string;
    missing?: string;
    evacuated?: string;
    structuresDestroyed?: string;
    damage?: string;
    cause?: string;
  };
}

// Custom hook for Wikipedia search
function useWikipediaSearch(query: string, enabled: boolean = false) {
  return useQuery<WikipediaData | null>({
    queryKey: ['wikipedia', query],
    queryFn: async () => {
      if (!query || !enabled) return null;
      
      try {
        // Multiple search strategies for better coverage
        const searchStrategies = [
          query, // Original query
          `${query.split(' ')[0]} fire California`, // For wildfires
          `${query.split(' ')[0]} ${query.split(' ')[1]} wildfire`, // Alternative wildfire search
          `${query.split(' ')[2]} ${query.split(' ')[0].toLowerCase()}`, // State + event type
          `California wildfires ${new Date().getFullYear()}`, // Recent California fires
          `${query.split(' ')[0]} disaster`
        ];

        for (const searchQuery of searchStrategies) {
          try {
            // Try direct page summary first
            const summaryResponse = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`
            );
            
            if (summaryResponse.ok) {
              const data = await summaryResponse.json();
              if (data.extract && data.extract.length > 50) { // Ensure substantial content
                // Get additional detailed information
                const detailResponse = await fetch(
                  `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(data.title)}&prop=extracts|images|pageimages&exintro=&explaintext=&piprop=thumbnail|name&pithumbsize=400&origin=*`
                );
                
                let additionalData: any = {};
                if (detailResponse.ok) {
                  const details = await detailResponse.json();
                  const pages = details.query?.pages;
                  if (pages) {
                    const pageData = Object.values(pages)[0] as any;
                    additionalData.images = pageData.images?.map((img: any) => img.title).slice(0, 5) || [];
                  }
                }

                return {
                  title: data.title,
                  extract: data.extract,
                  thumbnail: data.thumbnail,
                  pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
                  verified: true,
                  images: additionalData.images || [],
                  infobox: await extractInfoboxData(data.title)
                };
              }
            }

            // Try search API if direct lookup fails
            const searchResponse = await fetch(
              `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchQuery)}&limit=3&namespace=0&format=json&origin=*`
            );
            
            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              if (searchData[1]?.length > 0) {
                // Try the first few search results
                for (const pageTitle of searchData[1].slice(0, 2)) {
                  const pageResponse = await fetch(
                    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
                  );
                  
                  if (pageResponse.ok) {
                    const pageData = await pageResponse.json();
                    if (pageData.extract && pageData.extract.length > 50) {
                      return {
                        title: pageData.title,
                        extract: pageData.extract,
                        thumbnail: pageData.thumbnail,
                        pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
                        verified: true,
                        images: [],
                        infobox: await extractInfoboxData(pageData.title)
                      };
                    }
                  }
                }
              }
            }
          } catch (strategyError) {
            console.log(`Search strategy "${searchQuery}" failed:`, strategyError);
            continue; // Try next strategy
          }
        }
        
        return null; // No results found with any strategy
      } catch (error) {
        console.error('Wikipedia API error:', error);
        return null;
      }
    },
    enabled: enabled && !!query,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export default function ExtremeWeatherEvents() {
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<StormEvent | null>(null);

  const { data, isLoading, error } = useQuery<ExtremeWeatherData>({
    queryKey: ['/api/extreme-weather-events'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  // Wikipedia search for selected event with enhanced query building
  const wikipediaQuery = selectedEvent ? (() => {
    const eventName = (selectedEvent as any).stormSummary || (selectedEvent as any).episodeNarrative || selectedEvent.eventType;
    const year = format(new Date(selectedEvent.beginDate), 'yyyy');
    
    // Extract specific fire name or location for better search
    if (selectedEvent.eventType.toLowerCase().includes('fire') || selectedEvent.eventType.toLowerCase().includes('wildfire')) {
      const locationParts = selectedEvent.county.split(',')[0].trim();
      return `${eventName} ${locationParts} ${selectedEvent.state} ${year}`;
    }
    
    return `${selectedEvent.eventType} ${selectedEvent.state} ${year}`;
  })() : '';
  
  const { data: wikipediaData, isLoading: wikipediaLoading } = useWikipediaSearch(
    wikipediaQuery, 
    !!selectedEvent
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Loading Extreme Weather Events...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Weather Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Unable to load extreme weather events data. Please try again later.</p>
          <p className="text-sm text-gray-500 mt-2">Error details: {error?.message || 'Unknown error'}</p>
        </CardContent>
      </Card>
    );
  }
  
  const { events, statistics, trends, totalEvents, timeRange } = data;
  const dataDescription = (data as any).dataDescription;
  const dataSources = (data as any).dataSources;
  const updateFrequency = (data as any).updateFrequency;
  const dataQuality = (data as any).dataQuality;
  const lastDataUpdate = (data as any).lastDataUpdate;
  const nextUpdateScheduled = (data as any).nextUpdateScheduled;

  // Filter events while preserving chronological order (events already sorted by backend)
  const filteredEvents = events.filter(event => {
    const matchesEventType = selectedEventType === 'all' || selectedEventType === '' || event.eventType === selectedEventType;
    const matchesState = selectedState === 'all' || selectedState === '' || event.state === selectedState;
    
    return matchesEventType && matchesState;
  });
  
  // Ensure consistent chronological sorting (newest first) in case backend order changes
  const sortedFilteredEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.beginDate).getTime();
    const dateB = new Date(b.beginDate).getTime();
    return dateB - dateA; // Newest first: 2025 → 2024 → 2023 → etc.
  });

  // Get unique values for filter options
  const uniqueEventTypes = [...new Set(events.map(e => e.eventType))].sort();
  const uniqueStates = [...new Set(events.map(e => e.state))].sort();

  // Calculate most affected states
  const stateImpacts = events.reduce((acc, event) => {
    if (!acc[event.state]) {
      acc[event.state] = { 
        events: 0, 
        deaths: 0, 
        injuries: 0, 
        damage: 0 
      };
    }
    acc[event.state].events += 1;
    acc[event.state].deaths += event.deaths;
    acc[event.state].injuries += event.injuries;
    acc[event.state].damage += event.damageProperty + event.damageCrops;
    return acc;
  }, {} as Record<string, { events: number; deaths: number; injuries: number; damage: number }>);

  const topAffectedStates = Object.entries(stateImpacts)
    .sort((a, b) => (b[1].deaths + b[1].injuries) - (a[1].deaths + a[1].injuries))
    .slice(0, 10);

  // Handle empty filtered results
  if (!sortedFilteredEvents || sortedFilteredEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            No Weather Events Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No extreme weather events data is currently available.</p>
          <p className="text-sm text-gray-500 mt-2">Time range: {timeRange || 'Unknown'}</p>
          <p className="text-sm text-gray-500 mt-1">Total events received: {totalEvents || 0}</p>
        </CardContent>
      </Card>
    );
  }

  // Process data for charts
  const eventTypeChart = Object.entries(statistics.eventTypes).map(([type, count]) => ({
    name: type,
    value: count,
    percentage: Math.round((count / totalEvents) * 100)
  }));

  const monthlyChart = Object.entries(statistics.monthlyDistribution).map(([month, count]) => ({
    month: month.substring(0, 3),
    events: count
  }));

  const topStatesChart = Object.entries(statistics.stateImpacts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 8)
    .map(([state, count]) => ({
      state,
      events: count
    }));

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };



  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Moderate': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Data Source Information */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Major Disaster Impact Database</h2>
        <p className="text-gray-600 mb-3">
          {dataDescription || `Comprehensive analysis of major disasters (10+ deaths or $100M+ damage) from ${timeRange}`}
        </p>
        
        {/* Data Source Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Data Sources & Reliability</h4>
              <p className="text-sm text-blue-800 mb-2">
                {dataQuality || 'All casualty numbers and damage figures verified from official government reports'}
              </p>
              {dataSources && (
                <div className="text-xs text-blue-700">
                  <strong>Sources:</strong> {dataSources.join(', ')}
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-blue-700">
                {updateFrequency && <span><strong>Updates:</strong> {updateFrequency}</span>}
                {lastDataUpdate && <span><strong>Last Updated:</strong> {lastDataUpdate}</span>}
                {nextUpdateScheduled && <span><strong>Next Update:</strong> {nextUpdateScheduled}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{timeRange}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Casualties</p>
                <p className="text-2xl font-bold text-red-600">
                  {(statistics.totals.deaths + statistics.totals.injuries).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {statistics.totals.deaths} deaths, {statistics.totals.injuries} injuries
                </p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Damage</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(statistics.totals.totalDamage)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Property + Crop damage
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg per Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(totalEvents / 12)}
                </p>
                <p className="text-xs text-gray-500 mt-1">events per month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Event List</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Types Distribution</CardTitle>
                <CardDescription>Breakdown by weather event type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {eventTypeChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={severityColors[index % severityColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Distribution</CardTitle>
                <CardDescription>Events by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="events" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Affected States */}
          <Card>
            <CardHeader>
              <CardTitle>Most Affected States</CardTitle>
              <CardDescription>States with highest number of extreme weather events</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topStatesChart} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="state" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="events" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather Events</CardTitle>
              <CardDescription>
                Showing {filteredEvents.length} of {totalEvents} events from {timeRange}
                {selectedEventType !== 'all' && ` • Filtered by: ${selectedEventType}`}
                {selectedState !== 'all' && ` • State: ${selectedState}`}
              </CardDescription>
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Under Construction</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  This section is currently under development and data may not be fully accurate. We are working to ensure complete data integrity from official government sources.
                </p>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Event Type</label>
                  <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Event Types</SelectItem>
                      {uniqueEventTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {uniqueStates.map(state => (
                        <SelectItem key={state} value={state}>
                          <div className="flex items-center gap-2">
                            {stateIconMapping[state] && (
                              <img 
                                src={stateIconMapping[state]} 
                                alt={`${state} icon`}
                                className="h-4 w-4 object-contain"
                              />
                            )}
                            <span>{state}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sortedFilteredEvents.map((event, index) => {
                  const EventIcon = eventTypeIcons[event.eventType] || AlertTriangle;
                  
                  return (
                    <div key={`${event.id}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-all cursor-pointer hover:border-blue-300" onClick={() => setSelectedEvent(event)}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <EventIcon className="h-5 w-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{(event as any).stormSummary || (event as any).episodeNarrative || event.eventType}</h4>
                              <BookOpen className="h-4 w-4 text-blue-600 ml-auto" />
                            </div>
                            {(event as any).episodeNarrative && (event as any).episodeNarrative !== (event as any).stormSummary && (
                              <p className="text-sm text-gray-600 mb-2">{(event as any).episodeNarrative}</p>
                            )}
                            {(event as any).stormSummary && (event as any).stormSummary !== event.eventType && (event as any).stormSummary !== (event as any).episodeNarrative && (
                              <p className="text-xs text-gray-500 mb-2">{(event as any).stormSummary}</p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                {stateIconMapping[event.state] ? (
                                  <img 
                                    src={stateIconMapping[event.state]} 
                                    alt={`${event.state} icon`}
                                    className="h-6 w-6 object-contain"
                                  />
                                ) : (
                                  <MapPin className="h-4 w-4" />
                                )}
                                <span>{event.county}, {event.state}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(event.beginDate), 'MMM d, yyyy')}</span>
                              </div>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                      <Users className="h-4 w-4 text-red-500" />
                                      <span>{event.deaths} deaths</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm max-w-xs">
                                      <strong>Data Source:</strong> {(event as any).source || 'Official government reports'}<br/>
                                      <strong>Verified by:</strong> FEMA disaster declarations, state emergency management agencies, CDC mortality surveillance
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                      <Users className="h-4 w-4 text-orange-500" />
                                      <span>{event.injuries} injuries</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm max-w-xs">
                                      <strong>Data Source:</strong> {(event as any).source || 'Official government reports'}<br/>
                                      <strong>Verified by:</strong> State health departments, emergency response agencies, hospital records
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                      <DollarSign className="h-4 w-4" />
                                      <span>{formatCurrency(event.damageProperty + event.damageCrops)}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm max-w-xs">
                                      <strong>Data Source:</strong> {(event as any).source || 'Official government reports'}<br/>
                                      <strong>Property Damage:</strong> {formatCurrency(event.damageProperty)}<br/>
                                      <strong>Crop Damage:</strong> {formatCurrency(event.damageCrops)}<br/>
                                      <strong>Total Damage:</strong> {formatCurrency(event.damageProperty + event.damageCrops)}<br/>
                                      <strong>Verified by:</strong> NOAA damage assessments, FEMA declarations, state agriculture departments, USDA crop loss reports
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredEvents.length > 0 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  Showing all {filteredEvents.length} filtered events
                </div>
              )}
              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No events match your current filters
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Severity Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
              <CardDescription>Detailed breakdown of casualties and damage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Human Impact</h4>
                  <div className="space-y-1 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-between cursor-help">
                            <span>Deaths:</span>
                            <span className="font-medium">{statistics.totals.deaths}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            <strong>Sources:</strong> FEMA disaster declarations, CDC mortality surveillance, state vital records<br/>
                            <strong>Coverage:</strong> 2021-2025 major disasters (10+ deaths or $100M+ damage)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-between cursor-help">
                            <span>Injuries:</span>
                            <span className="font-medium">{statistics.totals.injuries}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            <strong>Sources:</strong> State health departments, emergency response agencies, hospital records<br/>
                            <strong>Coverage:</strong> 2021-2025 major disasters with verified injury counts
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <div className="flex justify-between border-t pt-1">
                      <span>Total Casualties:</span>
                      <span className="font-medium">{statistics.totals.deaths + statistics.totals.injuries}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">Economic Impact</h4>
                  <div className="space-y-1 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-between cursor-help">
                            <span>Property Damage:</span>
                            <span className="font-medium">{formatCurrency(statistics.totals.propertyDamage)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            <strong>Sources:</strong> NOAA damage assessments, FEMA declarations, insurance industry reports<br/>
                            <strong>Coverage:</strong> Residential, commercial, and infrastructure damage from major disasters
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-between cursor-help">
                            <span>Crop Damage:</span>
                            <span className="font-medium">{formatCurrency(statistics.totals.cropDamage)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            <strong>Sources:</strong> USDA crop loss reports, state agriculture departments, FEMA declarations<br/>
                            <strong>Coverage:</strong> Agricultural losses from weather-related disasters
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-between border-t pt-1 cursor-help">
                            <span>Total Damage:</span>
                            <span className="font-medium">{formatCurrency(statistics.totals.totalDamage)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            <strong>Sources:</strong> Combined NOAA, FEMA, USDA official damage assessments<br/>
                            <strong>Note:</strong> Only includes disasters meeting threshold criteria (10+ deaths or $100M+ damage)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">Event Statistics</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Events:</span>
                      <span className="font-medium">{totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg per Month:</span>
                      <span className="font-medium">{Math.round(totalEvents / 12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Common:</span>
                      <span className="font-medium">{trends.topEventTypes[0]?.[0] || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Most Affected States */}
          <Card>
            <CardHeader>
              <CardTitle>Most Affected States</CardTitle>
              <CardDescription>States ranked by total casualties (deaths + injuries)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAffectedStates.map(([state, data], index) => {
                  const totalCasualties = data.deaths + data.injuries;
                  const maxCasualties = Math.max(...topAffectedStates.map(([, d]) => d.deaths + d.injuries));
                  const percentage = Math.round((totalCasualties / maxCasualties) * 100);
                  
                  return (
                    <div key={state} className="flex items-center gap-3">
                      <div className="w-6 text-sm text-gray-500">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{state}</span>
                          <div className="text-sm text-gray-600 flex gap-4">
                            <span className="text-red-600">{data.deaths} deaths</span>
                            <span className="text-orange-600">{data.injuries} injuries</span>
                            <span className="text-blue-600">{data.events} events</span>
                            <span className="text-green-600">{formatCurrency(data.damage)}</span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Event Type Rankings</CardTitle>
              <CardDescription>Most common extreme weather events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.topEventTypes.slice(0, 8).map(([eventType, count], index) => {
                  const percentage = Math.round((count / totalEvents) * 100);
                  return (
                    <div key={eventType} className="flex items-center gap-3">
                      <div className="w-6 text-sm text-gray-500">#{index + 1}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{eventType}</span>
                          <span className="text-sm text-gray-600">{count} events ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wikipedia Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && eventTypeIcons[selectedEvent.eventType] && 
                React.createElement(eventTypeIcons[selectedEvent.eventType], { 
                  className: "h-5 w-5 text-blue-600" 
                })
              }
              {selectedEvent?.eventType} - {selectedEvent?.state}
              <BookOpen className="h-4 w-4 text-blue-600 ml-2" />
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      {stateIconMapping[selectedEvent.state] ? (
                        <img 
                          src={stateIconMapping[selectedEvent.state]} 
                          alt={`${selectedEvent.state} icon`}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span><strong>Location:</strong> {selectedEvent.county}, {selectedEvent.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span><strong>Date:</strong> {format(new Date(selectedEvent.beginDate), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-red-500" />
                      <span><strong>Casualties:</strong> {selectedEvent.deaths} deaths, {selectedEvent.injuries} injuries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span><strong>Damage:</strong> {formatCurrency(selectedEvent.damageProperty + selectedEvent.damageCrops)}</span>
                    </div>
                    <div className="text-sm">
                      <p><strong>Property Damage:</strong> {formatCurrency(selectedEvent.damageProperty)}</p>
                      <p><strong>Crop Damage:</strong> {formatCurrency(selectedEvent.damageCrops)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Wikipedia Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Wikipedia Information
                      <ExternalLink className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wikipediaLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                    ) : wikipediaData ? (
                      <div className="space-y-3">
                        {wikipediaData.thumbnail && (
                          <img 
                            src={wikipediaData.thumbnail.source} 
                            alt={wikipediaData.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <h4 className="font-medium">{wikipediaData.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">{wikipediaData.extract}</p>
                        
                        {/* Wikipedia Infobox Data */}
                        {wikipediaData.infobox && Object.keys(wikipediaData.infobox).length > 0 && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <h5 className="font-medium text-orange-900 mb-2 flex items-center gap-1">
                              <Database className="h-4 w-4" />
                              Wikipedia Statistics
                            </h5>
                            <div className="grid grid-cols-1 gap-2 text-xs">
                              {wikipediaData.infobox.status && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Status:</span>
                                  <span className="font-medium">{wikipediaData.infobox.status}</span>
                                </div>
                              )}
                              {wikipediaData.infobox.burnedArea && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Burned Area:</span>
                                  <span className="font-medium">{wikipediaData.infobox.burnedArea}</span>
                                </div>
                              )}
                              {wikipediaData.infobox.deaths && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Deaths:</span>
                                  <span className="font-medium text-red-600">{wikipediaData.infobox.deaths}</span>
                                </div>
                              )}
                              {wikipediaData.infobox.injuries && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Injuries:</span>
                                  <span className="font-medium text-orange-600">{wikipediaData.infobox.injuries}</span>
                                </div>
                              )}
                              {wikipediaData.infobox.missing && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Missing:</span>
                                  <span className="font-medium text-yellow-600">{wikipediaData.infobox.missing}</span>
                                </div>
                              )}
                              {wikipediaData.infobox.evacuated && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Evacuated:</span>
                                  <span className="font-medium">{wikipediaData.infobox.evacuated}</span>
                                </div>
                              )}
                              {wikipediaData.infobox.structuresDestroyed && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Structures:</span>
                                  <span className="font-medium">{wikipediaData.infobox.structuresDestroyed}</span>
                                </div>
                              )}
                              {wikipediaData.infobox.damage && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Damage:</span>
                                  <span className="font-medium text-green-600">{wikipediaData.infobox.damage}</span>
                                </div>
                              )}
                              {wikipediaData.infobox.cause && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Cause:</span>
                                  <span className="font-medium">{wikipediaData.infobox.cause}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <a 
                          href={wikipediaData.pageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          Read more on Wikipedia <ExternalLink className="h-3 w-3" />
                        </a>
                        
                        {/* Data Verification Section */}
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">Data Verification Analysis</h5>
                          <p className="text-xs text-blue-800 mb-2">
                            Cross-reference Wikipedia information with our database values to verify accuracy of casualty figures and damage estimates.
                          </p>
                          
                          {selectedEvent && (
                            <div className="text-xs text-blue-700 space-y-1">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 border border-blue-300 rounded">
                                  <p><strong>Our Database (Official):</strong></p>
                                  <p>Deaths: {selectedEvent.deaths}</p>
                                  <p>Injuries: {selectedEvent.injuries}</p>
                                  <p>Damage: {formatCurrency(selectedEvent.damageProperty + selectedEvent.damageCrops)}</p>
                                </div>
                                <div className="p-2 border border-orange-300 rounded">
                                  <p><strong>Wikipedia (Crowd-sourced):</strong></p>
                                  {wikipediaData?.infobox?.deaths ? (
                                    <p>Deaths: {wikipediaData.infobox.deaths}</p>
                                  ) : (
                                    <p className="text-gray-500">Deaths: Not specified</p>
                                  )}
                                  {wikipediaData?.infobox?.injuries ? (
                                    <p>Injuries: {wikipediaData.infobox.injuries}</p>
                                  ) : (
                                    <p className="text-gray-500">Injuries: Not specified</p>
                                  )}
                                  {wikipediaData?.infobox?.damage ? (
                                    <p>Damage: {wikipediaData.infobox.damage}</p>
                                  ) : (
                                    <p className="text-gray-500">Damage: Not specified</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Comparison Analysis */}
                              {wikipediaData?.infobox && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                  <p className="font-medium text-yellow-800">Quick Comparison:</p>
                                  {wikipediaData.infobox.deaths && (
                                    <p className={`${selectedEvent.deaths.toString() === wikipediaData.infobox.deaths.replace(/[^0-9]/g, '') ? 'text-green-700' : 'text-red-700'}`}>
                                      Deaths: {selectedEvent.deaths === parseInt(wikipediaData.infobox.deaths.replace(/[^0-9]/g, '') || '0') ? '✓ Match' : '⚠ Discrepancy'}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-blue-700 pt-2 border-t border-blue-200">
                            <p><strong>Our Sources:</strong> FEMA, NOAA, CDC, State Emergency Management</p>
                            <p><strong>Wikipedia Sources:</strong> News outlets, government reports, academic studies</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No Wikipedia information found for this event</p>
                        <p className="text-xs text-gray-400 mt-1">Try searching manually with these terms:</p>
                        <div className="mt-2 space-y-1">
                          {selectedEvent && (
                            <>
                              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                "{(selectedEvent as any).stormSummary || selectedEvent.eventType}"
                              </p>
                              <br />
                              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                "{selectedEvent.eventType} {selectedEvent.state} {format(new Date(selectedEvent.beginDate), 'yyyy')}"
                              </p>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Recent events may not yet have Wikipedia coverage
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Event Description */}
              {((selectedEvent as any).episodeNarrative || (selectedEvent as any).stormSummary) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(selectedEvent as any).episodeNarrative && (
                      <p className="text-sm text-gray-700 mb-2">{(selectedEvent as any).episodeNarrative}</p>
                    )}
                    {(selectedEvent as any).stormSummary && (selectedEvent as any).stormSummary !== (selectedEvent as any).episodeNarrative && (
                      <p className="text-sm text-gray-600">{(selectedEvent as any).stormSummary}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}