import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Layers } from 'lucide-react';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// US States coordinates for markers
const US_STATES = {
  'CA': { name: 'California', coords: [-119.681564, 36.116203] },
  'TX': { name: 'Texas', coords: [-97.563461, 31.106] },
  'FL': { name: 'Florida', coords: [-82.057549, 27.766279] },
  'NY': { name: 'New York', coords: [-74.948051, 42.165726] },
  'PA': { name: 'Pennsylvania', coords: [-77.209755, 40.269789] },
  'IL': { name: 'Illinois', coords: [-88.986137, 40.349457] },
  'OH': { name: 'Ohio', coords: [-82.764915, 40.269789] },
  'GA': { name: 'Georgia', coords: [-83.643074, 33.76] },
  'NC': { name: 'North Carolina', coords: [-79.806419, 35.630066] },
  'MI': { name: 'Michigan', coords: [-84.5467, 44.182205] }
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

      // Create marker element
      const el = document.createElement('div');
      el.innerHTML = `
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
        ">${alertCount}</div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup().setHTML(`
        <div style="max-width: 250px;">
          <h3 style="margin: 0 0 8px 0;">${stateData.name}</h3>
          <div style="background: #ff6b35; color: white; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px;">
            ${alertCount} Active Alert${alertCount !== 1 ? 's' : ''}
          </div>
          ${alerts.slice(0, 3).map(alert => `
            <div style="margin-bottom: 4px; font-size: 12px;">
              <strong>${alert.event}</strong><br>
              ${alert.severity} • ${alert.urgency}
            </div>
          `).join('')}
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
      {/* Alert Counter */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          <div>
            <div className="font-bold text-sm">
              {Object.keys(statesWithAlerts).length} States with Alerts
              {isLoading && <span className="ml-2 text-xs text-yellow-400">(Loading...)</span>}
              {error && <span className="ml-2 text-xs text-red-400">(Retrying...)</span>}
            </div>
            <div className="text-xs text-gray-300">Warnings & Watches Only</div>
          </div>
        </div>
      </div>

      {/* Radar Toggle */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 text-white">
        <button
          onClick={toggleRadar}
          className={`flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded transition-colors text-sm ${
            radarVisible ? 'bg-white/20' : ''
          }`}
        >
          <Layers className="w-4 h-4" />
          Radar
        </button>
      </div>
    </div>
  );
}