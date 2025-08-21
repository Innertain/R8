import React, { useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Layers } from 'lucide-react';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Weather event to icon mapping using your disaster watch center icons
const WEATHER_ICONS = {
  'hurricane': 'HURICAN_1754119781366.png',
  'tropical storm': 'HURICAN_1754119781366.png', 
  'flood': 'FLOOD_1754119781365.png',
  'flash flood': 'FLOOD_1754119781365.png',
  'fire': 'Fire_1754119781364.png',
  'red flag': 'Fire_1754119781364.png',
  'tornado': 'TORNATOR_1754119781369.png',
  'severe thunderstorm': 'STORM_1754119781368.png',
  'thunderstorm': 'STORM_1754119781368.png',
  'winter storm': 'ICE _ WINTER STORM_1754119781367.png',
  'blizzard': 'ICE _ WINTER STORM_1754119781367.png',
  'ice storm': 'ICE _ WINTER STORM_1754119781367.png',
  'wind': 'WIND_1754119781370.png',
  'high wind': 'WIND_1754119781370.png',
  'heat': 'Heatwave_1754119781366.png',
  'excessive heat': 'Heatwave_1754119781366.png',
  'earthquake': 'Earth Quake_1754119781363.png'
} as const;

// State silhouette mapping using your exact state icon files
const STATE_ICONS = {
  'AL': 'Alabama_1754172085109.png',
  'AK': 'Alaska_1754172085109.png', 
  'AZ': 'Arizona_1754172085110.png',
  'AR': 'Arkansas_1754172085111.png',
  'CA': 'California_1754172085112.png',
  'CO': 'Colorado_1754172085113.png',
  'CT': 'Connecticut Map Silhouette_1754172085114.png',
  'DE': 'Delaware_1754172085115.png',
  'DC': 'District of Columbia_1754172085116.png',
  'FL': 'Florida_1754172085117.png',
  'GA': 'Georgia_1754172085118.png',
  'HI': 'Hawaii_1754172085119.png',
  'ID': 'Idaho_1754172085120.png',
  'IL': 'Illinois_1754172085121.png',
  'IN': 'Indiana_1754172085108.png',
  'IA': 'Iowa_1754172090688.png',
  'KS': 'Kansas_1754172090689.png',
  'KY': 'Kentucky_1754172090690.png',
  'LA': 'Lousiana_1754172090691.png',
  'ME': 'Maine_1754172090691.png',
  'MD': 'Maryland_1754172090693.png',
  'MA': 'Massachusetts_1754172090694.png',
  'MI': 'Michigan_1754172090695.png',
  'MN': 'Minnesota_1754172090696.png',
  'MS': 'Mississippi_1754172090697.png',
  'MO': 'Missouri_1754172090698.png',
  'MT': 'Montana_1754172090698.png',
  'NE': 'Nebraska_1754172090686.png',
  'NV': 'Nevada_1754172552866.png',
  'NH': 'New Hampshire_1754172552868.png',
  'NJ': 'New Jersey_1754172552869.png',
  'NM': 'New Mexico_1754172552870.png',
  'NY': 'New York State_1754172552871.png',
  'NC': 'North Carolina_1754172552872.png',
  'ND': 'North Dakota_1754172552872.png',
  'OH': 'Ohio_1754172552873.png',
  'OK': 'Oklahoma_1754172552874.png',
  'OR': 'Oregon_1754172552875.png',
  'PA': 'Pennsylvania_1754172552875.png',
  'RI': 'Rhode Island_1754172552876.png',
  'SC': 'South Carolina_1754172552865.png',
  'SD': 'South Dakota_1754172607630.png',
  'TN': 'Tennessee_1754172607631.png',
  'TX': 'TEXAS_1754172607632.png',
  'UT': 'Utah_1754172607633.png',
  'VT': 'Vermont State map sign_1754172607634.png',
  'VA': 'Virginia_1754172607636.png',
  'WA': 'Washington_1754172607637.png',
  'WV': 'West Virginia_1754172607637.png',
  'WI': 'Wisconsin_1754172607638.png',
  'WY': 'Wyoming_1754172607638.png'
} as const;

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

  // Helper function to get weather icon for event type
  const getWeatherIcon = (eventType: string): string => {
    const event = eventType.toLowerCase();
    console.log('Looking for weather icon for:', event);
    
    // Direct mappings for common weather events
    if (event.includes('tropical storm') || event.includes('hurricane')) return 'HURICAN_1754119781366.png';
    if (event.includes('flood')) return 'FLOOD_1754119781365.png';
    if (event.includes('fire') || event.includes('red flag')) return 'Fire_1754119781364.png';
    if (event.includes('tornado')) return 'TORNATOR_1754119781369.png';
    if (event.includes('thunderstorm') || event.includes('severe')) return 'STORM_1754119781368.png';
    if (event.includes('winter') || event.includes('blizzard') || event.includes('ice')) return 'ICE _ WINTER STORM_1754119781367.png';
    if (event.includes('wind') || event.includes('gale')) return 'WIND_1754119781370.png';
    if (event.includes('heat')) return 'Heatwave_1754119781366.png';
    if (event.includes('earthquake')) return 'Earth Quake_1754119781363.png';
    
    console.log('Using default storm icon for:', event);
    return 'STORM_1754119781368.png'; // Default to storm icon
  };

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

      // Get the primary weather event for this state to show on marker
      const primaryAlert = alerts[0];
      const weatherIcon = getWeatherIcon(primaryAlert.event);
      
      // Create enhanced marker element with weather icon
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border: 3px solid #ff6b35;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4), 0 3px 10px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        ">
          <img 
            src="/attached_assets/${encodeURIComponent(weatherIcon)}" 
            alt="${primaryAlert.event}"
            style="width: 44px; height: 44px; object-fit: contain; border-radius: 50%; clip-path: circle(50% at center);"
            onerror="console.log('Weather marker icon failed:', '${weatherIcon}', 'encoded:', encodeURIComponent('${weatherIcon}')); this.style.display='none'; this.nextElementSibling.style.display='flex'"
          />
          <div style="display: none; color: #ff6b35; font-size: 18px; font-weight: bold; width: 100%; height: 100%; align-items: center; justify-content: center;">${alertCount}</div>
          <div style="
            position: absolute;
            bottom: -4px;
            right: -4px;
            background: #ff6b35;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${alertCount}</div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
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

      // Create enhanced popup with state icons
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        closeOnMove: false,
        maxWidth: '380px'
      }).setHTML(`
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 320px;">
          <!-- Enhanced Header with State Info -->
          <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 16px; margin: -10px -10px 16px -10px; border-radius: 12px 12px 0 0; position: relative;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 72px; height: 72px; background: rgba(255, 255, 255, 0.95); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255, 107, 53, 0.6); padding: 4px; box-shadow: 0 6px 16px rgba(255, 107, 53, 0.3); position: relative; overflow: hidden;">
                <img 
                  src="/attached_assets/${encodeURIComponent(STATE_ICONS[stateCode as keyof typeof STATE_ICONS])}" 
                  alt="${stateData.name} State Silhouette" 
                  style="width: 64px; height: 64px; object-fit: contain; opacity: 1; border-radius: 12px;"
                  onload="console.log('State icon loaded for ${stateCode}:', '${STATE_ICONS[stateCode as keyof typeof STATE_ICONS]}');"
                  onerror="console.log('Failed to load state icon for ${stateCode}:', '${STATE_ICONS[stateCode as keyof typeof STATE_ICONS]}', 'encoded:', encodeURIComponent('${STATE_ICONS[stateCode as keyof typeof STATE_ICONS]}')); this.style.display='none'; this.nextElementSibling.style.display='flex'"
                />
                <div style="display: none; color: #ff6b35; font-size: 18px; font-weight: bold; text-align: center; width: 100%; height: 100%; align-items: center; justify-content: center;">${stateCode}</div>
                <div style="position: absolute; top: -8px; right: -8px; background: #ff6b35; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${alertCount}</div>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: white;">${stateData.name}</h3>
                <div style="color: #94a3b8; font-size: 14px; margin-top: 2px;">${stateCode} • United States</div>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, #ff6b35, #e85d22); color: white; padding: 8px 16px; border-radius: 20px; text-align: center; font-size: 15px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
              <div style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 2s infinite;"></div>
              ${alertCount} Active Alert${alertCount !== 1 ? 's' : ''}
            </div>
          </div>

          <!-- Alert Cards Container -->
          <div style="max-height: 360px; overflow-y: auto; padding: 0 6px; scrollbar-width: thin;">
            ${alerts.slice(0, 8).map((alert, index) => `
              <div style="
                margin-bottom: 14px; 
                padding: 18px; 
                background: linear-gradient(135deg, #ffffff, #f8fafc); 
                border-radius: 16px; 
                border: 1px solid #e2e8f0; 
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                border-left: 4px solid ${alert.severity === 'Severe' ? '#dc2626' : alert.severity === 'Moderate' ? '#ea580c' : '#0891b2'};
              " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0, 0, 0, 0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 3px 12px rgba(0, 0, 0, 0.08)'">
                
                <!-- Weather Event Icon -->
                <div style="position: absolute; top: 16px; right: 16px; width: 56px; height: 56px; background: rgba(255, 255, 255, 0.95); border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 4px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); border: 2px solid rgba(255, 107, 53, 0.2); overflow: hidden;">
                  <img 
                    src="/attached_assets/${encodeURIComponent(getWeatherIcon(alert.event))}" 
                    alt="${alert.event} Weather Icon" 
                    style="width: 48px; height: 48px; object-fit: contain; opacity: 1; border-radius: 8px;"
                    onload="console.log('Weather alert icon loaded for ${alert.event}:', '${getWeatherIcon(alert.event)}');"
                    onerror="console.log('Failed to load weather alert icon for ${alert.event}:', '${getWeatherIcon(alert.event)}', 'encoded:', encodeURIComponent('${getWeatherIcon(alert.event)}')); this.style.display='none'; this.nextElementSibling.style.display='block'"
                  />
                  <div style="display: none; width: 12px; height: 12px; background: #ff6b35; border-radius: 50%;"></div>
                </div>

                <!-- Alert Title -->
                <div style="font-weight: 700; font-size: 16px; color: #1e293b; margin-bottom: 8px; line-height: 1.3; padding-right: 40px;">
                  ${alert.event}
                </div>

                <!-- Severity & Urgency Badges -->
                <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                  <div style="
                    background: ${alert.severity === 'Severe' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : alert.severity === 'Moderate' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'linear-gradient(135deg, #0891b2, #0e7490)'}; 
                    color: white; 
                    padding: 4px 12px; 
                    border-radius: 20px; 
                    font-size: 12px; 
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  ">
                    <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
                    ${alert.severity || 'Unknown'}
                  </div>
                  <div style="
                    background: ${alert.urgency === 'Immediate' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : alert.urgency === 'Expected' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'linear-gradient(135deg, #64748b, #475569)'}; 
                    color: white; 
                    padding: 4px 12px; 
                    border-radius: 20px; 
                    font-size: 12px; 
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  ">
                    <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
                    ${alert.urgency || 'Unknown'}
                  </div>
                </div>

                <!-- Location Info -->
                ${alert.location ? `
                  <div style="
                    background: rgba(59, 130, 246, 0.1); 
                    color: #1e40af; 
                    padding: 8px 12px; 
                    border-radius: 8px; 
                    font-size: 13px; 
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                  ">
                    <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24">
                      <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22S19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z"/>
                    </svg>
                    ${alert.location}
                  </div>
                ` : ''}
              </div>
            `).join('')}

            ${alertCount > 8 ? `
              <div style="
                text-align: center; 
                color: #64748b; 
                font-size: 14px; 
                padding: 18px; 
                background: linear-gradient(135deg, #f1f5f9, #e2e8f0); 
                border-radius: 16px; 
                border: 1px dashed #cbd5e1;
                margin-top: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              ">
                <div style="width: 6px; height: 6px; background: #64748b; border-radius: 50%;"></div>
                ${alertCount - 8} additional alert${alertCount - 8 !== 1 ? 's' : ''} active
              </div>
            ` : ''}
          </div>

          <!-- Footer Action -->
          <div style="
            background: linear-gradient(135deg, #f8fafc, #f1f5f9); 
            padding: 12px 16px; 
            margin: 16px -10px -10px -10px; 
            border-radius: 0 0 12px 12px; 
            border-top: 1px solid #e2e8f0;
            text-align: center;
          ">
            <div style="color: #64748b; font-size: 12px; font-weight: 500;">
              Click outside or press ESC to close • Data refreshes every 2 minutes
            </div>
          </div>
        </div>
        
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
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

      {/* Weather Data Info */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl p-2 text-white shadow-2xl border border-slate-700/50">
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Live Data</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 text-white shadow-xl border border-slate-700/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-300">National Weather Service • Real-time Alerts</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300">Connected</span>
            </div>
          </div>
          <div className="text-slate-400">
            Updated every 2 minutes • Click markers for detailed alerts
          </div>
        </div>
      </div>
    </div>
  );
}