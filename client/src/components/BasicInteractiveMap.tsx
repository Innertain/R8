import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, MapPin, Layers } from 'lucide-react';

// US States coordinates
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

export function BasicInteractiveMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [weatherOverlay, setWeatherOverlay] = useState<string>('none');
  const mapRef = useRef<HTMLDivElement>(null);

  // Get weather alerts
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 60 * 1000,
  });

  const rawAlerts = (response as any)?.alerts || [];
  
  // Filter warnings and watches only
  const alerts = rawAlerts.filter((alert: WeatherAlert) => {
    const title = alert.title?.toLowerCase() || '';
    const event = alert.event?.toLowerCase() || '';
    const combined = `${title} ${event}`;
    
    if (combined.includes('advisory')) return false;
    if (combined.includes('statement')) return false;
    if (combined.includes('outlook')) return false;
    
    return combined.includes('warning') || combined.includes('watch');
  });

  // Group alerts by state
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

  // Convert coordinates to screen position for basic map
  const coordsToPosition = (lng: number, lat: number) => {
    const minLng = -125;
    const maxLng = -66.5;
    const minLat = 20;
    const maxLat = 50;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading interactive weather map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Weather Map</h3>
          <p className="text-gray-300">{error?.toString() || 'Unable to load weather data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Basic Interactive Map */}
      <div 
        ref={mapRef}
        className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          backgroundColor: '#0f172a',
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23334155' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E"),
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 40%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
          `
        }}
      >
        {/* Weather Overlay Effect */}
        {weatherOverlay === 'precipitation' && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 30%),
                radial-gradient(circle at 70% 30%, rgba(34, 197, 94, 0.2) 0%, transparent 25%),
                radial-gradient(circle at 45% 70%, rgba(59, 130, 246, 0.4) 0%, transparent 35%)
              `,
              animation: 'pulse 3s ease-in-out infinite'
            }}
          />
        )}
        
        {weatherOverlay === 'temperature' && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 60%, rgba(239, 68, 68, 0.3) 0%, transparent 30%),
                radial-gradient(circle at 80% 40%, rgba(251, 191, 36, 0.2) 0%, transparent 25%),
                radial-gradient(circle at 60% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 35%)
              `
            }}
          />
        )}

        {/* State Alert Markers */}
        {Object.entries(statesWithAlerts).map(([stateCode, stateAlerts]) => {
          const stateData = US_STATES[stateCode as keyof typeof US_STATES];
          if (!stateData) return null;

          const position = coordsToPosition(stateData.coords[0], stateData.coords[1]);
          const alertCount = (stateAlerts as WeatherAlert[]).length;
          const isSelected = selectedState === stateCode;

          return (
            <div
              key={stateCode}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              onClick={() => setSelectedState(isSelected ? null : stateCode)}
            >
              {/* Marker Circle */}
              <div 
                className={`
                  relative flex items-center justify-center
                  w-12 h-12 rounded-full 
                  bg-gradient-to-br from-orange-400 to-red-500 
                  border-3 border-white shadow-xl
                  font-bold text-white text-sm
                  transition-all duration-300 hover:scale-110
                  ${isSelected ? 'scale-125 ring-4 ring-orange-400/50' : ''}
                `}
              >
                {alertCount}
                
                {/* Pulsing animation for high alert counts */}
                {alertCount >= 5 && (
                  <div className="absolute inset-0 rounded-full bg-red-400 opacity-50 animate-ping" />
                )}
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-orange-400 opacity-40 blur-md scale-150 animate-pulse" />
              </div>

              {/* State Label */}
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-20">
                <div className="bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {stateData.name}
                </div>
              </div>

              {/* Alert Details Popup */}
              {isSelected && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30">
                  <div className="w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg border border-gray-200">
                    <div className="p-4">
                      <div className="mb-3">
                        <h4 className="font-bold text-lg text-gray-900">
                          {stateData.name} ({stateCode})
                        </h4>
                        <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                          {alertCount} Active Alert{alertCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {(stateAlerts as WeatherAlert[]).slice(0, 5).map((alert: WeatherAlert, index: number) => (
                          <div key={index} className="border-l-4 border-orange-500 pl-3 py-2 bg-gray-50 rounded-r">
                            <div className="font-semibold text-sm text-gray-900">{alert.event}</div>
                            <div className="text-xs text-gray-600">{alert.severity} • {alert.urgency}</div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {alert.description?.slice(0, 120)}...
                            </div>
                          </div>
                        ))}
                        {alertCount > 5 && (
                          <div className="text-center text-gray-500 text-sm">
                            ... and {alertCount - 5} more alerts
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500"></div>
            <span>Weather Alert</span>
          </div>
          <div>Click markers for details</div>
        </div>
      </div>
      
      {/* Alert Counter */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white z-[1000]">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          <div>
            <div className="font-bold text-sm">
              {Object.keys(statesWithAlerts).length} States with Alerts
            </div>
            <div className="text-xs opacity-90">
              Warnings & Watches Only • {alerts.length} Total Alerts
            </div>
          </div>
        </div>
      </div>

      {/* Weather Layer Toggle */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-1 text-white z-[1000]">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setWeatherOverlay(weatherOverlay === 'precipitation' ? 'none' : 'precipitation')}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded transition-colors text-sm ${
              weatherOverlay === 'precipitation' ? 'bg-white/20' : ''
            }`}
            title="Toggle precipitation radar simulation"
          >
            <Layers className="w-4 h-4" />
            Radar
          </button>
          <button
            onClick={() => setWeatherOverlay(weatherOverlay === 'temperature' ? 'none' : 'temperature')}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded transition-colors text-sm ${
              weatherOverlay === 'temperature' ? 'bg-white/20' : ''
            }`}
            title="Toggle temperature overlay simulation"
          >
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-red-400 rounded" />
            Temp
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-[1000]">
        Interactive weather map • Click markers for details • Toggle weather overlays • Real alert data
      </div>
    </div>
  );
}

export default BasicInteractiveMap;