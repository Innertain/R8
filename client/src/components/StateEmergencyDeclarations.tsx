import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ExternalLink, Clock, MapPin, Filter, Search, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EmergencyDeclaration {
  id: string;
  state: string;
  stateName: string;
  title: string;
  description: string;
  emergencyType: string;
  publishedAt: string;
  source: string;
  url: string;
  author?: string;
  urlToImage?: string;
}

interface EmergencyDeclarationsResponse {
  success: boolean;
  declarations: EmergencyDeclaration[];
  count: number;
  lastUpdated: string;
  sources: string[];
  searchQueries: string[];
}

export function StateEmergencyDeclarations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch, isRefetching } = useQuery<EmergencyDeclarationsResponse>({
    queryKey: ["/api/state-emergency-declarations"],
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            State Emergency Declarations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading emergency declarations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            State Emergency Declarations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Failed to load emergency declarations</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const declarations = data?.declarations || [];

  // Filter declarations
  const filteredDeclarations = declarations.filter(declaration => {
    const matchesSearch = 
      declaration.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      declaration.stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      declaration.emergencyType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = stateFilter === "all" || declaration.state === stateFilter;
    const matchesType = typeFilter === "all" || declaration.emergencyType === typeFilter;
    
    return matchesSearch && matchesState && matchesType;
  });

  // Get unique states and types for filters
  const uniqueStates = Array.from(new Set(declarations.map(d => d.state)))
    .sort()
    .map(state => ({
      code: state,
      name: declarations.find(d => d.state === state)?.stateName || state
    }));

  const uniqueTypes = Array.from(new Set(declarations.map(d => d.emergencyType))).sort();

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flooding': return 'bg-blue-100 text-blue-800';
      case 'wildfire': return 'bg-orange-100 text-orange-800';
      case 'storm/hurricane': return 'bg-purple-100 text-purple-800';
      case 'winter weather': return 'bg-cyan-100 text-cyan-800';
      case 'earthquake': return 'bg-yellow-100 text-yellow-800';
      case 'tornado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              State Emergency Declarations
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Real-time emergency declarations from official government RSS feeds ({data?.count || 0} declarations)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search declarations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredDeclarations.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Emergency Declarations</h3>
            <p className="text-gray-600 mb-4">
              Great news! Currently monitoring {data?.totalStatesMonitored || 0} state government sources and no active emergency declarations found.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>✓ Live RSS parsing from official government sources</p>
              <p>✓ {data?.sources?.[0] || 'Official Government RSS Feeds Only'}</p>
              <p>✓ Last updated: {data?.lastUpdated ? formatDistanceToNow(new Date(data.lastUpdated), { addSuffix: true }) : 'recently'}</p>
            </div>
            {(searchTerm || stateFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setStateFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeclarations.map((declaration) => (
              <Card key={declaration.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {declaration.urlToImage && (
                      <img
                        src={declaration.urlToImage}
                        alt="News"
                        className="w-full lg:w-32 h-24 object-cover rounded-md"
                      />
                    )}
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {declaration.stateName}
                            </Badge>
                            <Badge className={getTypeColor(declaration.emergencyType)}>
                              {declaration.emergencyType}
                            </Badge>
                          </div>
                          
                          <h3 className="font-semibold text-lg leading-tight">
                            {declaration.title}
                          </h3>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="shrink-0"
                        >
                          <a 
                            href={declaration.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Read Full Article
                          </a>
                        </Button>
                      </div>

                      {declaration.description && (
                        <p className="text-gray-600 leading-relaxed">
                          {declaration.description}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(declaration.publishedAt), { addSuffix: true })}
                          </span>
                          <span>Source: {declaration.source}</span>
                        </div>
                        {declaration.author && (
                          <span>By {declaration.author}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data?.lastUpdated && (
          <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
            Last updated: {formatDistanceToNow(new Date(data.lastUpdated), { addSuffix: true })}
            <br />
            Data sources: {data.sources?.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}