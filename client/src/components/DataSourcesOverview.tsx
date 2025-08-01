import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Database, Shield, Clock, Globe, AlertTriangle, Activity, Flame } from 'lucide-react';

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
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-6 h-6 ${source.color}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{source.acronym}</h3>
                      <p className="text-xs text-gray-600">{source.name}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={source.reliability === 'Official' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {source.reliability}
                  </Badge>
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
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            Data Quality & Freshness
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
            <div>
              <p className="font-medium mb-1">Real-time Sources:</p>
              <p>NWS alerts and USGS earthquakes update within minutes of detection. Perfect for emergency response.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Near Real-time Sources:</p>
              <p>FEMA declarations and InciWeb incidents update hourly to daily as agencies process and verify information.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Data Verification:</p>
              <p>All sources are official government agencies with strict data quality standards and emergency protocols.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Geographic Coverage:</p>
              <p>Complete coverage of US states, territories, and marine areas. Some datasets include global monitoring.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}