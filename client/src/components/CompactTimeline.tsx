import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Flame, Waves, Wind, Mountain, Sun, Snowflake, Zap } from "lucide-react";

interface FemaDisasterItem {
  guid: string;
  title: string;
  state: string;
  declarationType: string;
  disasterNumber: string;
  incidentType?: string;
  declarationDate: string;
  incidentBeginDate?: string;
  incidentEndDate?: string;
  description?: string;
  femaRegion?: string;
  placeCode?: string;
  designatedArea?: string;
}

interface CompactTimelineProps {
  disasters: FemaDisasterItem[];
}

export function CompactTimeline({ disasters }: CompactTimelineProps) {
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter out fire management incidents and apply filters
  const filteredDisasters = disasters
    .filter(d => d.declarationType !== 'FM') // Remove fire incidents
    .filter(d => timelineFilter === 'all' || d.declarationType === timelineFilter)
    .sort((a, b) => new Date(b.declarationDate).getTime() - new Date(a.declarationDate).getTime());

  const getDisasterIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('fire')) return Flame;
    if (lowerType.includes('flood')) return Waves;
    if (lowerType.includes('hurricane') || lowerType.includes('storm')) return Wind;
    if (lowerType.includes('earthquake')) return Mountain;
    if (lowerType.includes('drought')) return Sun;
    if (lowerType.includes('snow') || lowerType.includes('ice')) return Snowflake;
    if (lowerType.includes('severe weather')) return Zap;
    return AlertTriangle;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop <= clientHeight + 100 && !isLoading && displayCount < filteredDisasters.length) {
      setIsLoading(true);
      setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + 10, filteredDisasters.length));
        setIsLoading(false);
        console.log('Loading more timeline events...');
      }, 500);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-green-600" />
          Interactive Disaster Timeline
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
            Scrollable • No Fire Incidents
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Compact scrollable timeline - scroll down to load more events
        </p>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
          <Button
            variant={timelineFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => setTimelineFilter('all')}
          >
            All Events ({filteredDisasters.length})
          </Button>
          <Button
            variant={timelineFilter === 'DR' ? 'default' : 'outline'}
            size="sm"
            className="text-xs text-red-600 hover:bg-red-50 border-red-200"
            onClick={() => setTimelineFilter('DR')}
          >
            Major Disasters ({disasters.filter(d => d.declarationType === 'DR').length})
          </Button>
          <Button
            variant={timelineFilter === 'EM' ? 'default' : 'outline'}
            size="sm"
            className="text-xs text-orange-600 hover:bg-orange-50 border-orange-200"
            onClick={() => setTimelineFilter('EM')}
          >
            Emergencies ({disasters.filter(d => d.declarationType === 'EM').length})
          </Button>
          <div className="text-xs text-gray-500 py-2 px-3">
            Fire incidents excluded
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pl-2">
        <div 
          ref={scrollRef}
          className="relative h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          onScroll={handleScroll}
        >
          {/* Timeline Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 via-green-400 to-gray-300 rounded-full shadow-sm"></div>
          
          {/* Timeline Events */}
          <div className="space-y-4 pb-8">
            {filteredDisasters.slice(0, displayCount).map((disaster, index) => {
              const Icon = getDisasterIcon(disaster.incidentType || 'Unknown');
              const typeColor = disaster.declarationType === 'DR' ? 'text-red-600' : 'text-orange-600';
              const typeBg = disaster.declarationType === 'DR' 
                ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300' 
                : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
              const nodeColor = disaster.declarationType === 'DR' 
                ? 'bg-red-500 shadow-red-200' 
                : 'bg-orange-500 shadow-orange-200';
              const connectionColor = disaster.declarationType === 'DR' 
                ? 'border-red-300' 
                : 'border-orange-300';
              
              const declarationDate = new Date(disaster.declarationDate);
              const daysSinceDeclaration = Math.floor((new Date().getTime() - declarationDate.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={disaster.disasterNumber} className="relative group">
                  {/* Timeline Node */}
                  <div className={`absolute left-5 w-6 h-6 rounded-full ${nodeColor} border-4 border-white shadow-lg z-20 flex items-center justify-center transition-all duration-300 hover:scale-125`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  {/* Connection Line */}
                  <div className={`absolute left-11 top-3 w-8 h-0.5 ${connectionColor} border-t-2 border-dashed z-10`}></div>
                  
                  {/* Compact Event Card */}
                  <div className="ml-20">
                    <div className={`border-2 rounded-xl p-4 ${typeBg} hover:shadow-xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 cursor-pointer`}>
                      {/* Compact Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${nodeColor} shadow-lg`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-base leading-tight mb-1">
                            {disaster.state} {disaster.incidentType}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`${typeColor} font-semibold text-xs`}>
                              {disaster.declarationType === 'DR' ? 'MAJOR DISASTER' : 'EMERGENCY'}
                            </Badge>
                            <span className="text-xs text-gray-600">#{disaster.disasterNumber}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {disaster.incidentBeginDate 
                              ? new Date(disaster.incidentBeginDate).toLocaleDateString()
                              : declarationDate.toLocaleDateString()
                            }
                          </div>
                          <div className="text-xs text-gray-600">
                            {disaster.incidentBeginDate ? 'Incident Date' : 'Declaration Date'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Timeline Information */}
                      <div className="bg-white/80 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-600 font-bold mb-1">Incident Period</div>
                            <div className="text-xs text-gray-800">
                              {disaster.incidentBeginDate ? (
                                <>
                                  {new Date(disaster.incidentBeginDate).toLocaleDateString()}
                                  {disaster.incidentEndDate && (
                                    <> - {new Date(disaster.incidentEndDate).toLocaleDateString()}</>
                                  )}
                                </>
                              ) : (
                                'Not specified'
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-600 font-bold mb-1">Declaration Date</div>
                            <div className="text-xs text-gray-800">
                              {declarationDate.toLocaleDateString()}
                              <div className="text-xs text-gray-500 mt-1">
                                {daysSinceDeclaration === 0 ? 'Today' : 
                                 daysSinceDeclaration === 1 ? '1 day ago' : 
                                 daysSinceDeclaration < 7 ? `${daysSinceDeclaration} days ago` :
                                 daysSinceDeclaration < 30 ? `${Math.floor(daysSinceDeclaration / 7)} weeks ago` :
                                 `${Math.floor(daysSinceDeclaration / 30)} months ago`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="text-sm text-gray-500">Loading more events...</div>
            </div>
          )}
          
          {/* Status Indicator */}
          <div className="text-center py-4">
            <div className="text-xs text-gray-400">
              Showing {Math.min(displayCount, filteredDisasters.length)} of {filteredDisasters.length} events
              {displayCount < filteredDisasters.length && " • Scroll for more"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}