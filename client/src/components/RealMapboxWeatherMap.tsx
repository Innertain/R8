import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertTriangle, MapPin, Layers } from 'lucide-react';

// Initialize Mapbox - token should be available
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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

export function RealMapboxWeatherMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [weatherLayer, setWeatherLayer] = useState<string>('precipitation');
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Verify Mapbox token is available
    if (!mapboxgl.accessToken) {
      console.error('Mapbox token not properly set');
      return;
    }

    try {
      console.log('Initializing Mapbox map...');
      console.log('Token available:', !!mapboxgl.accessToken);
      console.log('Container element:', !!mapContainer.current);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-95.7129, 37.0902],
        zoom: 4,
        attributionControl: true,
        accessToken: mapboxgl.accessToken
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Force resize after a brief delay to ensure proper rendering
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
          console.log('✓ Map resize triggered');
        }
      }, 100);

      map.current.on('load', () => {
        if (!map.current) return;
        
        console.log('✓ Mapbox map loaded successfully');
        setInitialized(true);

        // Add weather overlays
        try {
          // RainViewer precipitation radar
          map.current.addSource('rainviewer-radar', {
            type: 'raster',
            tiles: [
              'https://tilecache.rainviewer.com/v2/radar/0/{z}/{x}/{y}/2/1_1.png'
            ],
            tileSize: 256,
            attribution: 'RainViewer'
          });

          map.current.addLayer({
            id: 'radar-layer',
            type: 'raster',
            source: 'rainviewer-radar',
            paint: {
              'raster-opacity': 0.0  // Start hidden
            }
          });

          // Add clouds overlay as temperature alternative (no API key needed)
          map.current.addSource('clouds-tiles', {
            type: 'raster',
            tiles: [
              'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: 'OpenWeatherMap'
          });

          map.current.addLayer({
            id: 'clouds-layer',
            type: 'raster',
            source: 'clouds-tiles',
            paint: {
              'raster-opacity': 0.0  // Start hidden
            }
          });
          
          console.log('✓ Added weather overlay layers');
        } catch (error) {
          console.warn('Could not add weather layers:', error);
        }

        console.log('✓ Weather overlays added successfully');
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      map.current.on('styledata', () => {
        console.log('✓ Map style loaded');
      });

      map.current.on('sourcedata', (e) => {
        if (e.isSourceLoaded) {
          console.log(`✓ Source loaded: ${e.sourceId}`);
        }
      });

    } catch (error) {
      console.error('Map initialization failed:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add/update alert markers
  useEffect(() => {
    if (!map.current || !initialized || Object.keys(statesWithAlerts).length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    Object.entries(statesWithAlerts).forEach(([stateCode, stateAlerts]) => {
      const stateData = US_STATES[stateCode as keyof typeof US_STATES];
      if (!stateData) return;

      const alertCount = (stateAlerts as WeatherAlert[]).length;
      
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'weather-alert-marker';
      markerEl.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #ff6b35, #f7931e);
          border: 3px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4), 0 0 20px rgba(255, 107, 53, 0.3);
          transition: transform 0.2s;
        ">${alertCount}</div>
      `;

      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.1)';
      });
      
      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="max-width: 300px; font-family: system-ui;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">
            ${stateData.name} (${stateCode})
          </h4>
          <div style="margin-bottom: 12px; padding: 4px 8px; background: #ff6b35; color: white; border-radius: 4px; text-align: center; font-size: 14px;">
            ${alertCount} Active Alert${alertCount !== 1 ? 's' : ''}
          </div>
          <div style="max-height: 200px; overflow-y: auto;">
            ${(stateAlerts as WeatherAlert[]).slice(0, 4).map((alert: WeatherAlert) => `
              <div style="margin-bottom: 8px; padding: 8px; border-left: 4px solid #ff6b35; background: #f9fafb; border-radius: 0 4px 4px 0;">
                <div style="font-weight: 600; font-size: 13px; color: #374151; margin-bottom: 2px;">${alert.event}</div>
                <div style="font-size: 12px; color: #6b7280;">${alert.severity} • ${alert.urgency}</div>
              </div>
            `).join('')}
            ${alertCount > 4 ? `
              <div style="text-align: center; color: #6b7280; font-size: 12px; padding: 4px;">
                ... and ${alertCount - 4} more alerts
              </div>
            ` : ''}
          </div>
        </div>
      `);

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([stateData.coords[0], stateData.coords[1]])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    console.log(`✓ Added ${Object.keys(statesWithAlerts).length} alert markers to weather map`);
  }, [initialized, statesWithAlerts]);

  // Toggle weather layers
  const toggleWeatherLayer = (layerType: string) => {
    if (!map.current || !initialized) return;

    if (layerType === 'precipitation') {
      // Toggle radar layer
      const currentOpacity = map.current.getPaintProperty('radar-layer', 'raster-opacity');
      const newOpacity = currentOpacity > 0 ? 0 : 0.7;
      map.current.setPaintProperty('radar-layer', 'raster-opacity', newOpacity);
      map.current.setPaintProperty('clouds-layer', 'raster-opacity', 0);
    } else if (layerType === 'clouds') {
      // Toggle clouds layer  
      const currentOpacity = map.current.getPaintProperty('clouds-layer', 'raster-opacity');
      const newOpacity = currentOpacity > 0 ? 0 : 0.6;
      map.current.setPaintProperty('clouds-layer', 'raster-opacity', newOpacity);
      map.current.setPaintProperty('radar-layer', 'raster-opacity', 0);
    }
    
    setWeatherLayer(layerType);
    console.log(`✓ Toggled ${layerType} overlay`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading weather map...</p>
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
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full mapbox-container" 
        style={{ 
          minHeight: '500px', 
          position: 'relative',
          backgroundColor: '#1e293b'
        }} 
      />
      
      {/* Alert Counter */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
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

      {/* Weather Layer Toggle */}
      <div className="absolute top-4 right-16 bg-black/80 backdrop-blur-sm rounded-lg p-1 text-white z-10">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => toggleWeatherLayer('precipitation')}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded transition-colors text-sm ${
              weatherLayer === 'precipitation' ? 'bg-white/20' : ''
            }`}
            title="Toggle precipitation radar"
          >
            <Layers className="w-4 h-4" />
            Radar
          </button>
          <button
            onClick={() => toggleWeatherLayer('clouds')}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded transition-colors text-sm ${
              weatherLayer === 'clouds' ? 'bg-white/20' : ''
            }`}
            title="Toggle cloud cover overlay"
          >
            <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-white rounded" />
            Clouds
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-10">
        Interactive weather map • Click markers for details • {alerts.length} alerts filtered
      </div>
    </div>
  );
}

export default RealMapboxWeatherMap;