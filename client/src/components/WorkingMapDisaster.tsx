import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, MapPin, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// US States with coordinates (same as your working version)
const US_STATES = {
  'AL': { name: 'Alabama', coords: [-86.79113, 32.377716] },
  'AK': { name: 'Alaska', coords: [-152.404419, 61.370716] },
  'AZ': { name: 'Arizona', coords: [-111.431221, 33.729759] },
  'AR': { name: 'Arkansas', coords: [-92.373123, 34.969704] },
  'CA': { name: 'California', coords: [-119.681564, 36.116203] },
  'CO': { name: 'Colorado', coords: [-105.311104, 39.059811] },
  'CT': { name: 'Connecticut', coords: [-72.755371, 41.767] },
  'DE': { name: 'Delaware', coords: [-75.507141, 39.318523] },
  'DC': { name: 'District of Columbia', coords: [-77.026817, 38.907192] },
  'FL': { name: 'Florida', coords: [-82.057549, 27.766279] },
  'GA': { name: 'Georgia', coords: [-83.643074, 33.76] },
  'HI': { name: 'Hawaii', coords: [-155.665857, 19.741755] },
  'ID': { name: 'Idaho', coords: [-114.478828, 44.240459] },
  'IL': { name: 'Illinois', coords: [-88.986137, 40.349457] },
  'IN': { name: 'Indiana', coords: [-86.147685, 40.790443] },
  'IA': { name: 'Iowa', coords: [-93.620866, 42.590794] },
  'KS': { name: 'Kansas', coords: [-96.726486, 38.572954] },
  'KY': { name: 'Kentucky', coords: [-84.670067, 37.839333] },
  'LA': { name: 'Louisiana', coords: [-91.467086, 30.391830] },
  'ME': { name: 'Maine', coords: [-69.765261, 44.323535] },
  'MD': { name: 'Maryland', coords: [-76.501157, 39.045755] },
  'MA': { name: 'Massachusetts', coords: [-71.530106, 42.230171] },
  'MI': { name: 'Michigan', coords: [-84.536095, 44.314844] },
  'MN': { name: 'Minnesota', coords: [-93.094636, 45.919827] },
  'MS': { name: 'Mississippi', coords: [-89.207229, 32.320] },
  'MO': { name: 'Missouri', coords: [-92.189283, 38.572954] },
  'MT': { name: 'Montana', coords: [-110.454353, 47.052767] },
  'NE': { name: 'Nebraska', coords: [-99.901813, 41.12537] },
  'NV': { name: 'Nevada', coords: [-117.055374, 38.313515] },
  'NH': { name: 'New Hampshire', coords: [-71.563896, 43.452492] },
  'NJ': { name: 'New Jersey', coords: [-74.756138, 40.221741] },
  'NM': { name: 'New Mexico', coords: [-106.248482, 34.307144] },
  'NY': { name: 'New York', coords: [-74.948051, 42.165726] },
  'NC': { name: 'North Carolina', coords: [-79.806419, 35.759573] },
  'ND': { name: 'North Dakota', coords: [-99.784012, 47.528912] },
  'OH': { name: 'Ohio', coords: [-82.764915, 40.269789] },
  'OK': { name: 'Oklahoma', coords: [-96.921387, 35.482309] },
  'OR': { name: 'Oregon', coords: [-122.070938, 43.804133] },
  'PA': { name: 'Pennsylvania', coords: [-77.209755, 40.269789] },
  'RI': { name: 'Rhode Island', coords: [-71.51178, 41.82355] },
  'SC': { name: 'South Carolina', coords: [-80.945007, 33.836082] },
  'SD': { name: 'South Dakota', coords: [-99.901813, 44.299782] },
  'TN': { name: 'Tennessee', coords: [-86.784, 35.860119] },
  'TX': { name: 'Texas', coords: [-97.563461, 31.054487] },
  'UT': { name: 'Utah', coords: [-111.892622, 39.419220] },
  'VT': { name: 'Vermont', coords: [-72.580536, 44.26639] },
  'VA': { name: 'Virginia', coords: [-78.169968, 37.54] },
  'WA': { name: 'Washington', coords: [-121.490494, 47.042418] },
  'WV': { name: 'West Virginia', coords: [-80.954570, 38.349497] },
  'WI': { name: 'Wisconsin', coords: [-89.616508, 44.268543] },
  'WY': { name: 'Wyoming', coords: [-107.30249, 43.075968] }
} as const;

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  event: string;
  urgency: string;
  sent: string;
  expires: string;
  senderName: string;
  category: string;
}

export function WorkingMapDisaster() {
  const [selectedState, setSelectedState] = useState<string>('all');

  // Get weather alerts using same endpoint as your working disaster center
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 60 * 1000,
  });

  const rawAlerts = (response as any)?.alerts || [];
  
  // Filter to only show warnings and watches (exact logic from working version)
  const alerts = rawAlerts.filter((alert: WeatherAlert) => {
    const title = alert.title?.toLowerCase() || '';
    const event = alert.event?.toLowerCase() || '';
    const combined = `${title} ${event}`;
    
    // Filter out advisories - only show warnings and watches
    if (combined.includes('advisory')) return false;
    if (combined.includes('statement')) return false;
    if (combined.includes('outlook')) return false;
    
    // Keep warnings and watches
    return combined.includes('warning') || combined.includes('watch');
  });

  // Group alerts by state (exact logic from your working version)
  const statesWithAlerts = alerts.reduce((acc: Record<string, WeatherAlert[]>, alert: WeatherAlert) => {
    const stateMatch = alert.location?.match(/\b([A-Z]{2})\b/);
    const titleStateMatch = alert.title?.match(/\b([A-Z]{2})\b/);
    const descriptionStateMatch = alert.description?.match(/\b([A-Z]{2})\b/);
    
    let state = stateMatch ? stateMatch[1] : null;
    if (!state && titleStateMatch) state = titleStateMatch[1];
    if (!state && descriptionStateMatch) state = descriptionStateMatch[1];

    if (state && US_STATES[state as keyof typeof US_STATES]) {
      if (!acc[state]) acc[state] = [];
      acc[state].push(alert);
    }
    return acc;
  }, {});

  // Convert coordinates to screen position for simple map display
  const coordsToPosition = (lng: number, lat: number) => {
    // Simple conversion for US bounds (approximate)
    const minLng = -125;
    const maxLng = -66.5;
    const minLat = 20;
    const maxLat = 50;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const getSeverityColor = (alerts: WeatherAlert[]) => {
    const hasExtreme = alerts.some(a => a.severity.toLowerCase().includes('extreme'));
    const hasSevere = alerts.some(a => a.severity.toLowerCase().includes('severe'));
    const hasModerate = alerts.some(a => a.severity.toLowerCase().includes('moderate'));
    
    if (hasExtreme) return 'bg-red-900 border-red-700 text-red-100';
    if (hasSevere) return 'bg-red-700 border-red-600 text-red-50';
    if (hasModerate) return 'bg-orange-600 border-orange-500 text-orange-50';
    return 'bg-blue-600 border-blue-500 text-blue-50';
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading weather alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Map</h3>
          <p className="text-gray-300">{error?.toString() || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-800 overflow-hidden">
      {/* Simple US Map Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)
          `
        }}
      >
        {/* Grid overlay for map effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* State Alert Markers */}
      {Object.entries(statesWithAlerts).map(([stateCode, stateAlerts]) => {
        const stateData = US_STATES[stateCode as keyof typeof US_STATES];
        if (!stateData) return null;

        const position = coordsToPosition(stateData.coords[0], stateData.coords[1]);
        const alertCount = (stateAlerts as WeatherAlert[]).length;

        return (
          <div
            key={stateCode}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 group`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            onClick={() => setSelectedState(selectedState === stateCode ? 'all' : stateCode)}
          >
            {/* Marker Circle */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              bg-gradient-to-br from-orange-400 to-red-500 
              border-3 border-white shadow-lg
              font-bold text-white text-sm
              group-hover:from-orange-300 group-hover:to-red-400
              relative
            `}>
              {alertCount}
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-orange-400 opacity-50 animate-pulse -z-10 scale-150" />
            </div>

            {/* State Label */}
            <div className="absolute top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {stateData.name} ({stateCode})
              </div>
            </div>

            {/* Alert Details Popup */}
            {selectedState === stateCode && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
                <Card className="w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm shadow-2xl">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h4 className="font-bold text-lg text-gray-900">
                        {stateData.name} ({stateCode})
                      </h4>
                      <Badge className="bg-orange-600 text-white">
                        {alertCount} Active Alert{alertCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {(stateAlerts as WeatherAlert[]).slice(0, 5).map((alert: WeatherAlert, index: number) => (
                        <div key={index} className="border-l-4 border-orange-500 pl-3 py-2 bg-gray-50 rounded">
                          <div className="font-semibold text-sm text-gray-900">{alert.event}</div>
                          <div className="text-xs text-gray-600">{alert.severity} • {alert.urgency}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{alert.description?.slice(0, 100)}...</div>
                        </div>
                      ))}
                      {alertCount > 5 && (
                        <div className="text-center text-gray-500 text-sm">
                          ... and {alertCount - 5} more alerts
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
      })}

      {/* Info Badges */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white z-10">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <div>
            <div className="font-bold text-sm">
              {Object.keys(statesWithAlerts).length} States with Alerts
            </div>
            <div className="text-xs opacity-90">
              Warnings & Watches Only
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-10">
        Click markers for details • {alerts.length} total alerts • Click again to close
      </div>
    </div>
  );
}

export default WorkingMapDisaster;