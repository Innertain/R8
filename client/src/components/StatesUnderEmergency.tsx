import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Calendar, ExternalLink, Shield, Activity, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface EmergencyState {
  state: string;
  stateName: string;
  femaDeclarations: Array<{
    disasterNumber: string;
    declarationType: string;
    incidentType: string;
    title: string;
    declarationDate: string;
    incidentBeginDate?: string;
  }>;
  weatherAlerts: Array<{
    event: string;
    severity: string;
    urgency: string;
    certainty: string;
    areaDesc: string;
    effective: string;
    expires?: string;
    headline: string;
  }>;
  emergencyLevel: 'severe' | 'moderate' | 'minor';
  lastUpdated: string;
}

interface StatesUnderEmergencyResponse {
  success: boolean;
  states: EmergencyState[];
  count: number;
  summary: {
    severe: number;
    moderate: number;
    minor: number;
  };
  lastUpdated: string;
  sources: string[];
}

export function StatesUnderEmergency() {
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [filterLevel, setFilterLevel] = useState<'all' | 'severe' | 'moderate' | 'minor'>('all');

  const { data, isLoading, error, refetch } = useQuery<StatesUnderEmergencyResponse>({
    queryKey: ['/api/states-under-emergency'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const toggleStateExpansion = (stateCode: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateCode)) {
      newExpanded.delete(stateCode);
    } else {
      newExpanded.add(stateCode);
    }
    setExpandedStates(newExpanded);
  };

  const filteredStates = data?.states?.filter(state => 
    filterLevel === 'all' || state.emergencyLevel === filterLevel
  ) || [];

  const getEmergencyLevelColor = (level: string) => {
    switch (level) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDeclarationTypeColor = (type: string) => {
    switch (type) {
      case 'DR': return 'bg-red-600 text-white'; // Major Disaster
      case 'EM': return 'bg-orange-600 text-white'; // Emergency
      case 'FM': return 'bg-purple-600 text-white'; // Fire Management
      default: return 'bg-gray-600 text-white';
    }
  };

  const getDeclarationTypeName = (type: string) => {
    switch (type) {
      case 'DR': return 'Major Disaster';
      case 'EM': return 'Emergency';
      case 'FM': return 'Fire Management';
      default: return type;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'bg-red-600 text-white animate-pulse';
      case 'severe': return 'bg-orange-600 text-white';
      case 'moderate': return 'bg-yellow-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            States Under Emergency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading emergency state data...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            States Under Emergency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Failed to load emergency state data
            </div>
            <p className="text-sm text-red-600 mb-3">
              Unable to fetch current emergency status from FEMA and NWS APIs.
            </p>
            <Button onClick={() => refetch()} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              States Under Emergency
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Real-time emergency status from FEMA declarations and National Weather Service alerts
            </p>
          </div>
          <Button onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Total States</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{data.count}</div>
            <div className="text-xs text-gray-500">Under Emergency</div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-sm">Severe</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{data.summary.severe}</div>
            <div className="text-xs text-red-500">Major Disasters</div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-sm">Moderate</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{data.summary.moderate}</div>
            <div className="text-xs text-orange-500">Emergencies</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-sm">Minor</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{data.summary.minor}</div>
            <div className="text-xs text-yellow-500">Weather Alerts</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Filter by Level:</span>
          <div className="flex gap-2">
            {(['all', 'severe', 'moderate', 'minor'] as const).map((level) => (
              <Button
                key={level}
                size="sm"
                variant={filterLevel === level ? "default" : "outline"}
                onClick={() => setFilterLevel(level)}
                className="text-xs"
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                {level !== 'all' && (
                  <span className="ml-1 px-1 bg-white/20 rounded text-xs">
                    {data.summary[level]}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* States List */}
        <div className="space-y-3">
          {filteredStates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No states found with {filterLevel} emergency level
            </div>
          ) : (
            filteredStates.map((state) => (
              <div key={state.state} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleStateExpansion(state.state)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{state.stateName}</span>
                        <span className="text-sm text-gray-500">({state.state})</span>
                      </div>
                      
                      <Badge className={`text-xs font-medium ${getEmergencyLevelColor(state.emergencyLevel)}`}>
                        {state.emergencyLevel.toUpperCase()}
                      </Badge>
                      
                      {state.femaDeclarations.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {state.femaDeclarations.length} FEMA Declaration{state.femaDeclarations.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      
                      {state.weatherAlerts.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {state.weatherAlerts.length} Weather Alert{state.weatherAlerts.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(state.lastUpdated).toLocaleTimeString()}
                      </span>
                      {expandedStates.has(state.state) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedStates.has(state.state) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                    {/* FEMA Declarations */}
                    {state.femaDeclarations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-red-600" />
                          FEMA Emergency Declarations
                        </h4>
                        <div className="space-y-2">
                          {state.femaDeclarations.map((declaration, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`text-xs ${getDeclarationTypeColor(declaration.declarationType)}`}>
                                      {getDeclarationTypeName(declaration.declarationType)}
                                    </Badge>
                                    <span className="text-sm font-medium">#{declaration.disasterNumber}</span>
                                  </div>
                                  <h5 className="font-medium text-sm text-gray-800 mb-1">
                                    {declaration.title}
                                  </h5>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>Type: {declaration.incidentType}</div>
                                    <div>Declared: {new Date(declaration.declarationDate).toLocaleDateString()}</div>
                                    {declaration.incidentBeginDate && (
                                      <div>Incident Start: {new Date(declaration.incidentBeginDate).toLocaleDateString()}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weather Alerts */}
                    {state.weatherAlerts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          Active Weather Alerts
                        </h4>
                        <div className="space-y-2">
                          {state.weatherAlerts.slice(0, 5).map((alert, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                                      {alert.severity.toUpperCase()}
                                    </Badge>
                                    <span className="text-sm font-medium">{alert.event}</span>
                                  </div>
                                  <p className="text-sm text-gray-800 mb-2">
                                    {alert.headline}
                                  </p>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>Urgency: {alert.urgency} | Certainty: {alert.certainty}</div>
                                    <div>Effective: {new Date(alert.effective).toLocaleString()}</div>
                                    {alert.expires && (
                                      <div>Expires: {new Date(alert.expires).toLocaleString()}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {state.weatherAlerts.length > 5 && (
                            <div className="text-xs text-gray-500 text-center py-2">
                              ... and {state.weatherAlerts.length - 5} more alerts
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Data Sources */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-800 mb-2">Data Sources</div>
          <div className="text-xs text-blue-700 space-y-1">
            {data.sources.map((source, index) => (
              <div key={index}>• {source}</div>
            ))}
            <div className="text-blue-600 mt-2">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatesUnderEmergency;