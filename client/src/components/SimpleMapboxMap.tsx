import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Layers } from 'lucide-react';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Complete US States coordinates for markers
const US_STATES = {
  'AL': { name: 'Alabama', coords: [-86.79113, 32.377716] },
  'AK': { name: 'Alaska', coords: [-152.404419, 61.370716] },
  'AZ': { name: 'Arizona', coords: [-111.431221, 33.729759] },
  'AR': { name: 'Arkansas', coords: [-92.373123, 34.969704] },
  'CA': { name: 'California', coords: [-119.681564, 36.116203] },
  'CO': { name: 'Colorado', coords: [-105.311104, 39.059811] },
  'CT': { name: 'Connecticut', coords: [-72.755371, 41.767] },
  'DE': { name: 'Delaware', coords: [-75.507141, 39.318523] },
  'DC': { name: 'District of Columbia', coords: [-77.026817, 38.897438] },
  'FL': { name: 'Florida', coords: [-82.057549, 27.766279] },
  'GA': { name: 'Georgia', coords: [-83.643074, 33.76] },
  'HI': { name: 'Hawaii', coords: [-157.826182, 21.30895] },
  'ID': { name: 'Idaho', coords: [-114.478828, 44.240459] },
  'IL': { name: 'Illinois', coords: [-88.986137, 40.349457] },
  'IN': { name: 'Indiana', coords: [-86.147685, 40.790443] },
  'IA': { name: 'Iowa', coords: [-93.620866, 42.590794] },
  'KS': { name: 'Kansas', coords: [-98.484246, 39.04] },
  'KY': { name: 'Kentucky', coords: [-84.86311, 37.669789] },
  'LA': { name: 'Louisiana', coords: [-91.867805, 31.106] },
  'ME': { name: 'Maine', coords: [-69.765261, 44.323535] },
  'MD': { name: 'Maryland', coords: [-76.501157, 39.045755] },
  'MA': { name: 'Massachusetts', coords: [-71.530106, 42.407211] },
  'MI': { name: 'Michigan', coords: [-84.5467, 44.182205] },
  'MN': { name: 'Minnesota', coords: [-94.6859, 46.729553] },
  'MS': { name: 'Mississippi', coords: [-89.678696, 32.741646] },
  'MO': { name: 'Missouri', coords: [-91.831833, 38.572954] },
  'MT': { name: 'Montana', coords: [-110.454353, 46.965260] },
  'NE': { name: 'Nebraska', coords: [-99.901813, 41.492537] },
  'NV': { name: 'Nevada', coords: [-117.055374, 38.313515] },
  'NH': { name: 'New Hampshire', coords: [-71.549896, 43.452492] },
  'NJ': { name: 'New Jersey', coords: [-74.756138, 40.221741] },
  'NM': { name: 'New Mexico', coords: [-106.248482, 34.307144] },
  'NY': { name: 'New York', coords: [-74.948051, 42.165726] },
  'NC': { name: 'North Carolina', coords: [-79.806419, 35.630066] },
  'ND': { name: 'North Dakota', coords: [-101.002012, 47.528912] },
  'OH': { name: 'Ohio', coords: [-82.764915, 40.269789] },
  'OK': { name: 'Oklahoma', coords: [-96.921387, 35.482309] },
  'OR': { name: 'Oregon', coords: [-122.070938, 44.931109] },
  'PA': { name: 'Pennsylvania', coords: [-77.209755, 40.269789] },
  'RI': { name: 'Rhode Island', coords: [-71.422132, 41.82355] },
  'SC': { name: 'South Carolina', coords: [-81.035, 33.836082] },
  'SD': { name: 'South Dakota', coords: [-99.438828, 44.299782] },
  'TN': { name: 'Tennessee', coords: [-86.518842, 35.747845] },
  'TX': { name: 'Texas', coords: [-97.563461, 31.106] },
  'UT': { name: 'Utah', coords: [-111.892622, 39.419220] },
  'VT': { name: 'Vermont', coords: [-72.710686, 44.0] },
  'VA': { name: 'Virginia', coords: [-78.169968, 37.769337] },
  'WA': { name: 'Washington', coords: [-121.220637, 47.042418] },
  'WV': { name: 'West Virginia', coords: [-80.954570, 38.349497] },
  'WI': { name: 'Wisconsin', coords: [-89.616508, 44.268543] },
  'WY': { name: 'Wyoming', coords: [-107.518505, 43.075968] }
} as const;

interface WeatherAlert {
  id: string;
  title: string;
  event: string;
  severity: string;
  urgency: string;
  location?: string;
  description?: string;
}

export default function SimpleMapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [radarVisible, setRadarVisible] = useState(false);

  // Fetch weather alerts with error handling
  const { data: alertsResponse, error, isLoading } = useQuery<{alerts: WeatherAlert[]}>({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const alerts = alertsResponse?.alerts || [];
  const filteredAlerts = alerts.filter(alert => 
    alert.event?.toLowerCase().includes('warning') || 
    alert.event?.toLowerCase().includes('watch')
  );

  // Group alerts by state
  const statesWithAlerts = filteredAlerts.reduce((acc: Record<string, WeatherAlert[]>, alert) => {
    const stateMatch = alert.location?.match(/\b([A-Z]{2})\b/);
    const titleStateMatch = alert.title?.match(/\b([A-Z]{2})\b/);
    
    let state = stateMatch ? stateMatch[1] : null;
    if (!state && titleStateMatch) state = titleStateMatch[1];

    if (state && US_STATES[state as keyof typeof US_STATES]) {
      if (!acc[state]) acc[state] = [];
      acc[state].push(alert);
    }
    return acc;
  }, {});

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    if (!mapContainer.current) {
      console.error('Map container not found');
      return;
    }

    if (!mapboxgl.accessToken) {
      console.error('Mapbox token not set');
      return;
    }

    console.log('Creating Mapbox map...');
    console.log('Container dimensions:', mapContainer.current.offsetWidth, 'x', mapContainer.current.offsetHeight);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-95.7129, 37.0902],
        zoom: 4
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('✓ Mapbox map loaded successfully!');
        
        // Add radar layer (initially hidden)
        if (map.current) {
          map.current.addSource('radar-source', {
            type: 'raster',
            tiles: ['https://tilecache.rainviewer.com/v2/radar/0/{z}/{x}/{y}/2/1_1.png'],
            tileSize: 256
          });

          map.current.addLayer({
            id: 'radar-layer',
            type: 'raster',
            source: 'radar-source',
            paint: {
              'raster-opacity': 0
            }
          });

          console.log('✓ Weather radar layer added');
        }
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      map.current.on('style.load', () => {
        console.log('✓ Map style loaded');
      });

    } catch (error) {
      console.error('Failed to create map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add weather alert markers
  useEffect(() => {
    if (!map.current || !Object.keys(statesWithAlerts).length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    Object.entries(statesWithAlerts).forEach(([stateCode, alerts]) => {
      const stateData = US_STATES[stateCode as keyof typeof US_STATES];
      if (!stateData) return;

      const alertCount = alerts.length;

      // Create enhanced marker element with animation
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #ff6b35, #e85d22);
          border: 3px solid #fff;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4), 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        ">${alertCount}
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            background: #dc2626;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `;

      // Enhanced hover effects
      el.addEventListener('mouseenter', () => {
        const markerDiv = el.firstElementChild as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1.15)';
          markerDiv.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.6), 0 4px 12px rgba(0,0,0,0.4)';
        }
      });

      el.addEventListener('mouseleave', () => {
        const markerDiv = el.firstElementChild as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1)';
          markerDiv.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.4), 0 2px 6px rgba(0,0,0,0.3)';
        }
      });

      // Create enhanced popup with better styling
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px'
      }).setHTML(`
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <div style="background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 12px; margin: -10px -10px 12px -10px; border-radius: 8px 8px 0 0;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${stateData.name}</h3>
            <div style="background: #ff6b35; color: white; padding: 4px 12px; border-radius: 12px; margin-top: 8px; text-align: center; font-size: 14px; font-weight: 600; display: inline-block;">
              ${alertCount} Active Alert${alertCount !== 1 ? 's' : ''}
            </div>
          </div>
          <div style="max-height: 240px; overflow-y: auto;">
            ${alerts.slice(0, 5).map((alert, index) => `
              <div style="margin-bottom: 10px; padding: 10px; border-left: 4px solid #ff6b35; background: #f9fafb; border-radius: 0 6px 6px 0; position: relative;">
                <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 4px; line-height: 1.3;">
                  ${alert.event}
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                  <span style="background: ${alert.severity === 'Severe' ? '#dc2626' : alert.severity === 'Moderate' ? '#ea580c' : '#0891b2'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                    ${alert.severity}
                  </span>
                  <span style="background: ${alert.urgency === 'Immediate' ? '#dc2626' : alert.urgency === 'Expected' ? '#ea580c' : '#64748b'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
                    ${alert.urgency}
                  </span>
                </div>
                ${alert.location ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">📍 ${alert.location}</div>` : ''}
              </div>
            `).join('')}
            ${alertCount > 5 ? `
              <div style="text-align: center; color: #6b7280; font-size: 13px; padding: 8px; background: #f3f4f6; border-radius: 6px; margin-top: 8px;">
                ... and ${alertCount - 5} more alert${alertCount - 5 !== 1 ? 's' : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `);

      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([stateData.coords[0], stateData.coords[1]])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    console.log(`✓ Added ${Object.keys(statesWithAlerts).length} alert markers`);
  }, [statesWithAlerts]);

  // Toggle radar overlay
  const toggleRadar = () => {
    if (!map.current) return;
    
    const newOpacity = radarVisible ? 0 : 0.7;
    map.current.setPaintProperty('radar-layer', 'raster-opacity', newOpacity);
    setRadarVisible(!radarVisible);
    console.log(`✓ Radar ${radarVisible ? 'hidden' : 'shown'}`);
  };

  // Log successful data fetch
  if (alertsResponse?.alerts) {
    console.log(`✓ Weather data loaded: ${alerts.length} total alerts, ${filteredAlerts.length} warnings/watches`);
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainer}
        className="w-full h-full"
        style={{ 
          minHeight: '400px',
          backgroundColor: '#1a1a1a'
        }}
      />
      {/* Enhanced Alert Counter */}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl p-4 text-white shadow-2xl border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <MapPin className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="font-bold text-lg">
              {Object.keys(statesWithAlerts).length}
              <span className="text-orange-400 ml-1">States</span>
            </div>
            <div className="text-sm text-slate-300">
              {filteredAlerts.length} Active Alerts
              {isLoading && <span className="ml-2 text-yellow-400 animate-pulse">●</span>}
              {error && <span className="ml-2 text-red-400 animate-bounce">⚠</span>}
            </div>
            <div className="text-xs text-slate-400 mt-1">Warnings & Watches</div>
          </div>
        </div>
      </div>

      {/* Enhanced Radar Toggle */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl p-2 text-white shadow-2xl border border-slate-700/50">
        <button
          onClick={toggleRadar}
          className={`flex items-center gap-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-all duration-300 text-sm font-medium ${
            radarVisible ? 'bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/20' : 'hover:shadow-lg'
          }`}
          title="Toggle precipitation radar overlay"
        >
          <Layers className={`w-4 h-4 transition-transform ${radarVisible ? 'rotate-180' : ''}`} />
          <span>Radar</span>
          {radarVisible && (
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Enhanced Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 text-white shadow-xl border border-slate-700/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Live Weather Data</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300">Connected</span>
            </div>
          </div>
          <div className="text-slate-400">
            Updated every 2 minutes • Click markers for details
          </div>
        </div>
      </div>
    </div>
  );
}