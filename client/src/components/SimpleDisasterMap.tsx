import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertTriangle, MapPin } from 'lucide-react';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

// US States coordinates (same as your working version)
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

export function SimpleDisasterMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Get weather alerts using the same endpoint as your working disaster center
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    console.log('Initializing Mapbox map...');
    console.log('Token available:', !!import.meta.env.VITE_MAPBOX_TOKEN);
    console.log('Container ready:', !!mapContainer.current);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-95.7129, 37.0902],
        zoom: 4
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setInitialized(true);
        console.log('✓ Simple map loaded successfully');
      });
      
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });
      
      map.current.on('style.load', () => {
        console.log('✓ Map style loaded');
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

  // Add markers when map is ready and we have data
  useEffect(() => {
    if (!map.current || !initialized || Object.keys(statesWithAlerts).length === 0) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add state markers
    Object.entries(statesWithAlerts).forEach(([stateCode, stateAlerts]) => {
      const stateData = US_STATES[stateCode as keyof typeof US_STATES];
      if (!stateData) return;

      const alertCount = (stateAlerts as WeatherAlert[]).length;
      
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'state-alert-marker';
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(45deg, #ff6b35, #f7931e);
        border: 3px solid #fff;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
        cursor: pointer;
        transition: transform 0.2s;
      `;
      markerElement.textContent = alertCount.toString();
      
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="font-family: system-ui; max-width: 300px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
            ${stateData.name} (${stateCode})
          </div>
          <div style="margin-bottom: 8px; padding: 4px 8px; background: #ff6b35; color: white; border-radius: 4px; text-align: center;">
            ${alertCount} Active Alert${alertCount !== 1 ? 's' : ''}
          </div>
          <div style="max-height: 200px; overflow-y: auto;">
            ${(stateAlerts as WeatherAlert[]).slice(0, 3).map((alert: WeatherAlert) => `
              <div style="margin-bottom: 8px; padding: 8px; border-left: 4px solid #ff6b35; background: #f9fafb;">
                <div style="font-weight: bold; font-size: 13px; color: #374151;">${alert.event}</div>
                <div style="font-size: 12px; color: #6b7280;">${alert.severity} • ${alert.urgency}</div>
              </div>
            `).join('')}
            ${alertCount > 3 ? `<div style="text-align: center; color: #6b7280; font-size: 12px;">... and ${alertCount - 3} more</div>` : ''}
          </div>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat([stateData.coords[0], stateData.coords[1]])
        .setPopup(popup)
        .addTo(map.current!);
    });

    console.log(`✓ Added ${Object.keys(statesWithAlerts).length} state markers (warnings/watches only)`);
  }, [initialized, statesWithAlerts]);

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
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Alert Badge */}
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

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-10">
        Click markers for alert details • {alerts.length} total alerts filtered
      </div>
    </div>
  );
}

export default SimpleDisasterMap;