import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertTriangle, MapPin, Layers, Cloud } from 'lucide-react';

// Initialize Mapbox
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
  effective?: string;
  expires?: string;
}

export default function MapboxWeatherMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [weatherLayer, setWeatherLayer] = useState<'none' | 'radar' | 'clouds'>('none');

  // Fetch weather alerts
  const { data: alertsResponse, isLoading } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 1000,
  });

  // Extract alerts array from response
  const alerts = alertsResponse?.alerts || [];
  
  // Filter for warnings and watches only
  const filteredAlerts = Array.isArray(alerts) ? alerts.filter((alert: WeatherAlert) => 
    alert.event?.toLowerCase().includes('warning') || 
    alert.event?.toLowerCase().includes('watch')
  ) : [];

  // Group alerts by state
  const statesWithAlerts = filteredAlerts.reduce((acc: Record<string, WeatherAlert[]>, alert: WeatherAlert) => {
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

    if (!mapboxgl.accessToken) {
      console.error('Mapbox token not available');
      return;
    }

    try {
      console.log('Initializing Mapbox map...');
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-95.7129, 37.0902],
        zoom: 4,
        attributionControl: true
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;
        
        console.log('✓ Mapbox loaded successfully');
        setInitialized(true);

        // Add precipitation radar source (initially invisible)
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

        // Add cloud cover source (initially invisible)  
        map.current.addSource('clouds-source', {
          type: 'raster',
          tiles: ['https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png'],
          tileSize: 256
        });

        map.current.addLayer({
          id: 'clouds-layer', 
          type: 'raster',
          source: 'clouds-source',
          paint: {
            'raster-opacity': 0
          }
        });

        console.log('✓ Weather layers added');
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers when alerts change
  useEffect(() => {
    if (!map.current || !initialized || isLoading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add state markers
    Object.entries(statesWithAlerts).forEach(([stateCode, stateAlerts]) => {
      const stateData = US_STATES[stateCode as keyof typeof US_STATES];
      if (!stateData) return;

      const alertCount = stateAlerts.length;

      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'alert-marker';
      markerEl.innerHTML = `
        <div style="
          background: #ff6b35;
          border: 3px solid #fff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        ">${alertCount}</div>
      `;

      // Add hover effects
      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.1)';
      });

      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
      });

      // Create popup content
      const popupContent = `
        <div style="max-width: 300px; font-family: system-ui;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937; font-size: 16px;">
            ${stateData.name} (${stateCode})
          </h4>
          <div style="margin-bottom: 12px; padding: 6px 12px; background: #ff6b35; color: white; border-radius: 4px; text-align: center; font-size: 14px; font-weight: 600;">
            ${alertCount} Active Alert${alertCount !== 1 ? 's' : ''}
          </div>
          <div style="max-height: 200px; overflow-y: auto;">
            ${stateAlerts.slice(0, 4).map((alert: WeatherAlert) => `
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
      `;

      // Create marker with popup
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([stateData.coords[0], stateData.coords[1]])
        .setPopup(new mapboxgl.Popup().setHTML(popupContent))
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    console.log(`✓ Added ${Object.keys(statesWithAlerts).length} weather alert markers`);
  }, [statesWithAlerts, initialized, isLoading]);

  // Toggle weather layers
  const toggleWeatherLayer = (layerType: 'radar' | 'clouds') => {
    if (!map.current || !initialized) return;

    // Reset all layers to invisible
    map.current.setPaintProperty('radar-layer', 'raster-opacity', 0);
    map.current.setPaintProperty('clouds-layer', 'raster-opacity', 0);

    if (weatherLayer === layerType) {
      // Toggle off if same layer
      setWeatherLayer('none');
    } else {
      // Show selected layer
      const opacity = layerType === 'radar' ? 0.7 : 0.6;
      map.current.setPaintProperty(`${layerType}-layer`, 'raster-opacity', opacity);
      setWeatherLayer(layerType);
      console.log(`✓ ${layerType} layer activated`);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ 
          minHeight: '500px',
          position: 'relative'
        }} 
      />
      
      {/* Alert Counter */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          <div>
            <div className="font-bold text-sm">{Object.keys(statesWithAlerts).length} States with Alerts</div>
            <div className="text-xs text-gray-300">Warnings & Watches Only</div>
          </div>
        </div>
      </div>

      {/* Weather Layer Controls */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 text-white z-10">
        <div className="flex gap-1">
          <button
            onClick={() => toggleWeatherLayer('radar')}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded transition-colors text-sm ${
              weatherLayer === 'radar' ? 'bg-white/20' : ''
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
            title="Toggle cloud cover"
          >
            <Cloud className="w-4 h-4" />
            Clouds  
          </button>
        </div>
      </div>
    </div>
  );
}