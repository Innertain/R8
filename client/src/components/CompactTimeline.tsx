import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Calendar, MapPin, ExternalLink, Globe } from "lucide-react";
import { getDisasterIcon } from "@/utils/disasterIcons";

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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // State abbreviation to full name mapping
  const getStateName = (abbreviation: string) => {
    const stateMap: Record<string, string> = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
      'DC': 'District of Columbia', 'PR': 'Puerto Rico', 'VI': 'U.S. Virgin Islands', 
      'GU': 'Guam', 'AS': 'American Samoa', 'MP': 'Northern Mariana Islands'
    };
    return stateMap[abbreviation] || abbreviation;
  };

  // Filter out fire management incidents and apply filters
  const filteredDisasters = disasters
    .filter(d => d.declarationType !== 'FM') // Remove fire incidents
    .filter(d => timelineFilter === 'all' || d.declarationType === timelineFilter)
    .sort((a, b) => {
      // Sort by incident date (incidentBeginDate) if available, otherwise fall back to declaration date
      const aDate = a.incidentBeginDate ? new Date(a.incidentBeginDate) : new Date(a.declarationDate);
      const bDate = b.incidentBeginDate ? new Date(b.incidentBeginDate) : new Date(b.declarationDate);
      return bDate.getTime() - aDate.getTime();
    });

  const getCustomDisasterIcon = (type: string) => {
    if (!type) return null;
    return getDisasterIcon(type);
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
          FEMA Disaster Declaration Timeline
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
            Scrollable • No Fire Incidents
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Official FEMA disaster declarations timeline - scroll down to load more events
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
              const customIcon = getCustomDisasterIcon(disaster.incidentType || 'Unknown');
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
                  {/* Timeline Node with Custom Icon */}
                  <div className={`absolute left-2 w-12 h-12 rounded-full ${nodeColor} border-3 border-white shadow-lg z-20 flex items-center justify-center transition-all duration-300 hover:scale-110`}>
                    {customIcon ? (
                      <img 
                        src={customIcon} 
                        alt={disaster.incidentType || 'Disaster'} 
                        className="w-9 h-9 object-contain" 
                      />
                    ) : (
                      <AlertTriangle className="w-7 h-7 text-white" />
                    )}
                  </div>
                  
                  {/* Connection Line */}
                  <div className={`absolute left-14 top-6 w-12 h-0.5 ${connectionColor} border-t-2 border-dashed z-10`}></div>
                  
                  {/* Expandable Event Card */}
                  <div className="ml-28">
                    <div 
                      className={`border-2 rounded-xl p-4 ${typeBg} hover:shadow-xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 cursor-pointer`}
                      onClick={() => setExpandedCard(expandedCard === disaster.disasterNumber ? null : disaster.disasterNumber)}
                    >
                      {/* Compact Summary Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${nodeColor} shadow-lg border-2 border-white`}>
                            {customIcon ? (
                              <img 
                                src={customIcon} 
                                alt={disaster.incidentType || 'Disaster'} 
                                className="w-8 h-8 object-contain" 
                              />
                            ) : (
                              <AlertTriangle className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-base leading-tight">
                              {getStateName(disaster.state)} {disaster.incidentType}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`${typeColor} font-semibold text-xs`}>
                                {disaster.declarationType === 'DR' ? 'MAJOR DISASTER' : 'EMERGENCY'}
                              </Badge>
                              <span className="text-xs text-gray-600">#{disaster.disasterNumber}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
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
                          
                          {/* Expand/Collapse Indicator */}
                          <div className={`transition-transform duration-200 ${expandedCard === disaster.disasterNumber ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedCard === disaster.disasterNumber && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* When Section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-blue-800 text-sm">When</span>
                              </div>
                              <div className="text-sm text-blue-700">
                                {disaster.incidentBeginDate ? (
                                  <>
                                    {new Date(disaster.incidentBeginDate).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                    {disaster.incidentEndDate && (
                                      <div className="text-xs mt-1">
                                        Until {new Date(disaster.incidentEndDate).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-blue-600">Date not specified</span>
                                )}
                              </div>
                            </div>

                            {/* Declaration Info */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold text-purple-800 text-sm">Declaration</span>
                              </div>
                              <div className="text-sm text-purple-700">
                                {declarationDate.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                                <div className="text-xs mt-1 text-purple-600">
                                  {daysSinceDeclaration === 0 ? 'Declared today' : 
                                   daysSinceDeclaration === 1 ? 'Declared yesterday' : 
                                   daysSinceDeclaration < 7 ? `Declared ${daysSinceDeclaration} days ago` :
                                   daysSinceDeclaration < 30 ? `Declared ${Math.floor(daysSinceDeclaration / 7)} weeks ago` :
                                   daysSinceDeclaration < 365 ? `Declared ${Math.floor(daysSinceDeclaration / 30)} months ago` :
                                   `Declared ${Math.floor(daysSinceDeclaration / 365)} years ago`}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Location Map Section */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-800 text-sm">Location</span>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-green-700">
                                {getStateName(disaster.state)}, United States
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <a 
                                  href={`https://www.google.com/maps/search/${encodeURIComponent(disaster.incidentType || 'disaster')}+disaster+${encodeURIComponent(getStateName(disaster.state))}+${disaster.state}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Google Maps
                                </a>
                                <a 
                                  href={`https://www.google.com/maps/search/${encodeURIComponent(disaster.incidentType || 'disaster')}+disaster+${encodeURIComponent(getStateName(disaster.state))}+${disaster.state}/data=!3m1!1e3`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <Globe className="w-3 h-3" />
                                  Satellite View
                                </a>
                              </div>
                              <div className="text-xs text-green-600">
                                Opens interactive maps for disaster area analysis
                              </div>
                            </div>
                          </div>

                          {/* Additional Details */}
                          {(disaster.femaRegion || disaster.designatedArea || disaster.description) && (
                            <div className="bg-white/80 border border-gray-200 rounded-lg p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {disaster.femaRegion && (
                                  <div>
                                    <span className="font-semibold text-gray-700">FEMA Region:</span>
                                    <div className="text-gray-600">{disaster.femaRegion}</div>
                                  </div>
                                )}
                                {disaster.designatedArea && (
                                  <div>
                                    <span className="font-semibold text-gray-700">Designated Area:</span>
                                    <div className="text-gray-600">{disaster.designatedArea}</div>
                                  </div>
                                )}
                                {disaster.description && (
                                  <div className="md:col-span-2">
                                    <span className="font-semibold text-gray-700">Description:</span>
                                    <div className="text-gray-600 mt-1">{disaster.description}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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