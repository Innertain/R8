import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Database, Shield, Clock, Globe, AlertTriangle, Activity, Flame, Satellite, Twitter, Rss, RadioIcon } from 'lucide-react';

interface DataSource {
  name: string;
  acronym: string;
  description: string;
  dataTypes: string[];
  updateFrequency: string;
  coverage: string;
  icon: React.ComponentType<any>;
  color: string;
  reliability: 'Official' | 'Verified' | 'Community';
  status?: 'active' | 'disabled';
}

const dataSources: DataSource[] = [
  {
    name: 'Federal Emergency Management Agency',
    acronym: 'FEMA',
    description: 'Official disaster declarations, emergency management assistance, and federal aid coordination',
    dataTypes: ['Major Disasters', 'Emergency Declarations', 'Fire Management Assistance', 'Mission Assignments'],
    updateFrequency: 'Real-time to daily',
    coverage: 'United States, Territories',
    icon: Shield,
    color: 'text-green-600',
    reliability: 'Official'
  },
  {
    name: 'National Weather Service',
    acronym: 'NWS',
    description: 'Weather warnings, watches, and severe weather alerts from NOAA',
    dataTypes: ['Severe Weather Warnings', 'Weather Watches', 'Hazard Alerts', 'Emergency Bulletins'],
    updateFrequency: 'Real-time (minutes)',
    coverage: 'United States, Territories, Marine Areas',
    icon: AlertTriangle,
    color: 'text-blue-600',
    reliability: 'Official'
  },
  {
    name: 'U.S. Geological Survey',
    acronym: 'USGS',
    description: 'Real-time earthquake monitoring and geological hazard information',
    dataTypes: ['Earthquake Activity', 'Magnitude Data', 'Tsunami Alerts', 'Geological Hazards'],
    updateFrequency: 'Real-time (minutes)',
    coverage: 'Global with focus on United States',
    icon: Activity,
    color: 'text-purple-600',
    reliability: 'Official'
  },
  {
    name: 'Incident Information System',
    acronym: 'InciWeb',
    description: 'Interagency wildfire and incident management information',
    dataTypes: ['Wildfire Incidents', 'Fire Status Updates', 'Containment Progress', 'Resource Assignments'],
    updateFrequency: 'Real-time to hourly',
    coverage: 'United States, Federal Lands',
    icon: Flame,
    color: 'text-orange-600',
    reliability: 'Official'
  },
  {
    name: 'NASA Earth Observing System Data and Information System',
    acronym: 'NASA EONET',
    description: 'Natural hazard events including wildfires, severe storms, floods, volcanoes, and sea ice from satellite observations',
    dataTypes: ['Wildfire Events', 'Severe Storms', 'Floods', 'Volcanoes', 'Sea Ice', 'Dust/Haze'],
    updateFrequency: 'Real-time to daily',
    coverage: 'Global',
    icon: Satellite,
    color: 'text-indigo-600',
    reliability: 'Official'
  },
  {
    name: 'Hurricane Center RSS Feeds',
    acronym: 'NHC RSS',
    description: 'National Hurricane Center tropical cyclone and hurricane advisories via RSS feeds',
    dataTypes: ['Hurricane Warnings', 'Tropical Storm Alerts', 'Cyclone Updates', 'Storm Advisories'],
    updateFrequency: 'Real-time (minutes)',
    coverage: 'Atlantic, Pacific Tropical Regions',
    icon: Rss,
    color: 'text-cyan-600',
    reliability: 'Official'
  },
  {
    name: 'Storm Prediction Center RSS',
    acronym: 'SPC RSS',
    description: 'Severe weather forecasts, tornado watches, and convective outlooks from NOAA',
    dataTypes: ['Tornado Watches', 'Severe Weather Outlooks', 'Convective Forecasts', 'Storm Reports'],
    updateFrequency: 'Real-time (minutes)',
    coverage: 'United States',
    icon: RadioIcon,
    color: 'text-yellow-600',
    reliability: 'Official'
  },
  {
    name: 'Twitter Emergency Monitoring',
    acronym: 'Twitter API',
    description: 'TEMPORARILY DISABLED - Live emergency updates from state governors and emergency management officials',
    dataTypes: ['Emergency Declarations', 'Evacuation Orders', 'Public Safety Alerts', 'Storm Updates'],
    updateFrequency: 'Real-time (seconds)',
    coverage: 'United States (50 States + Territories)',
    icon: Twitter,
    color: 'text-gray-500',
    reliability: 'Official',
    status: 'disabled'
  }
];

export function DataSourcesOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Data Sources & Reliability
        </CardTitle>
        <p className="text-sm text-gray-600">
          Understanding the official sources behind our emergency response data
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dataSources.map((source, index) => {
            const IconComponent = source.icon;
            return (
              <div key={index} className={`border rounded-lg p-4 ${source.status === 'disabled' ? 'bg-gray-100 opacity-75' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-6 h-6 ${source.color}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{source.acronym}</h3>
                      <p className="text-xs text-gray-600">{source.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {source.status === 'disabled' && (
                      <Badge variant="destructive" className="text-xs">
                        Disabled
                      </Badge>
                    )}
                    <Badge 
                      variant={source.reliability === 'Official' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {source.reliability}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {source.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Coverage: {source.coverage}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Updates: {source.updateFrequency}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Data Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {source.dataTypes.map((type, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* System Status Section */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4" />
            Current System Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-green-100 rounded p-2">
              <p className="font-medium text-green-800 mb-1">✓ Active Sources: 7</p>
              <p className="text-green-700">FEMA, NWS, USGS, InciWeb, NASA EONET, Hurricane Center RSS, Storm Prediction Center RSS</p>
            </div>
            <div className="bg-red-100 rounded p-2">
              <p className="font-medium text-red-800 mb-1">⚠ Disabled: 1</p>
              <p className="text-red-700">Twitter API (temporarily disabled due to API rate limits)</p>
            </div>
            <div className="bg-blue-100 rounded p-2">
              <p className="font-medium text-blue-800 mb-1">🔄 Data Freshness</p>
              <p className="text-blue-700">Real-time to daily updates across 8 government sources</p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            Data Quality & Freshness
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
            <div>
              <p className="font-medium mb-1">Real-time Sources:</p>
              <p>NWS alerts, USGS earthquakes, and RSS feeds update within minutes of detection. Perfect for emergency response.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Near Real-time Sources:</p>
              <p>FEMA declarations, InciWeb incidents, and NASA EONET events update hourly to daily as agencies process information.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Data Verification:</p>
              <p>All sources are official government agencies with strict data quality standards and emergency protocols.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Geographic Coverage:</p>
              <p>Complete coverage of US states, territories, marine areas, plus global monitoring for selected hazards.</p>
            </div>
          </div>
        </div>

        {/* Twitter API Status Note */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2 mb-2">
            <Twitter className="w-4 h-4" />
            Social Media Monitoring Status
          </h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>✓ Technical Integration:</strong> Successfully tested with live Twitter API v2, proving real-time data retrieval works.</p>
            <p><strong>⚠ Current Status:</strong> Temporarily disabled due to rapid API consumption (96/100 monthly requests used).</p>
            <p><strong>📋 TODO:</strong> Reactivate with paid Twitter API plan or implement enhanced caching optimization for sustainable operation.</p>
            <p><strong>🏛 Coverage:</strong> All 50 state governors + emergency management agencies for comprehensive emergency monitoring.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}