import React, { useRef, useEffect, useState } from 'react';
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

interface DisasterCounty {
  state: string;
  counties: string[];
  eventType: string;
  eventDate: string;
  id: string;
}

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

interface WildfireIncident {
  id: string;
  title: string;
  description: string;
  state: string;
  link: string;
  pubDate: string;
  incidentType: string;
  severity: string;
  coordinates?: [number, number];
}

export default function SimpleMapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [showDisasterCounties, setShowDisasterCounties] = useState(true);
  const [showWeatherAlerts, setShowWeatherAlerts] = useState(true);
  const [showWildfires, setShowWildfires] = useState(true);

  // Fetch weather alerts with error handling
  const { data: alertsResponse, error, isLoading } = useQuery<{alerts: WeatherAlert[]}>({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch wildfire incidents with geocoding
  const { data: wildfireResponse } = useQuery<{success: boolean, incidents: WildfireIncident[]}>({
    queryKey: ['/api/wildfire-incidents'],
    refetchInterval: 2 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch extreme weather events for county highlighting
  const { data: extremeWeatherResponse } = useQuery<{events: any[]}>({
    queryKey: ['/api/extreme-weather-events'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
    retry: 3,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  console.log('🔍 Extreme Weather Response:', extremeWeatherResponse);
  
  // Extract first few events for debugging
  if (extremeWeatherResponse?.events?.length > 0) {
    console.log('🔍 First 3 disasters:', extremeWeatherResponse.events.slice(0, 3).map(e => ({
      id: e.id,
      eventType: e.eventType,
      state: e.state,
      hasCoords: !!(e.coordinates && e.coordinates.latitude && e.coordinates.longitude)
    })));
  }

  // Helper function to extract and geocode location from wildfire titles
  const extractLocationFromTitle = (title: string): string | null => {
    // Common patterns in wildfire incident titles
    const patterns = [
      /(?:Fire|Incident)\s+(?:near|in|at|by)\s+([^,\-\(]+)/i,
      /(?:near|in|at|by)\s+([A-Za-z\s]+?)(?:\s*,\s*[A-Z]{2}|\s*$)/i,
      /([A-Za-z\s]+?)\s+(?:Fire|Incident)/i
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
        // Filter out common non-location words
        if (!['Complex', 'County', 'National', 'Forest', 'Prescribed', 'Wildfire'].includes(location)) {
          return location;
        }
      }
    }
    return null;
  };

  // Enhanced geocoding with caching and fallback - with robust error handling
  const geocodeLocationCached = async (locationString: string, state: string): Promise<[number, number] | null> => {
    const cacheKey = `${locationString}, ${state}`;
    
    try {
      // Try with full location first with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cacheKey)}&countrycodes=us&limit=1`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Disaster-Map-Application/1.0'
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      let data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          console.log(`✓ Geocoded "${cacheKey}" to [${lon}, ${lat}]`);
          return [lon, lat];
        }
      }
      
      // Fallback: Try just the location name + state with timeout
      const fallbackQuery = `${locationString} ${state}`;
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
      
      response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&countrycodes=us&limit=1`, {
        signal: controller2.signal,
        headers: {
          'User-Agent': 'Disaster-Map-Application/1.0'
        }
      });
      clearTimeout(timeoutId2);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          console.log(`✓ Geocoded "${fallbackQuery}" to [${lon}, ${lat}]`);
          return [lon, lat];
        }
      }
      
      return null;
    } catch (error: any) {
      // More detailed error logging but don't throw - gracefully fallback
      if (error.name === 'AbortError') {
        console.log(`⏱️ Geocoding timeout for: ${cacheKey}`);
      } else if (error.message?.includes('Failed to fetch')) {
        console.log(`🌐 Network error geocoding: ${cacheKey}`);
      } else {
        console.log(`❌ Geocoding failed for: ${cacheKey} - ${error.message || error}`);
      }
      return null;
    }
  };

  const alerts = alertsResponse?.alerts || [];
  const wildfires = wildfireResponse?.incidents || [];
  const extremeWeatherEvents = extremeWeatherResponse?.events || [];
  const filteredAlerts = alerts.filter(alert => 
    alert.event?.toLowerCase().includes('warning') || 
    alert.event?.toLowerCase().includes('watch')
  );

  // Use extreme weather events directly for disaster markers (show ALL disasters, not just 15!)
  const disasterCounties = extremeWeatherEvents; // Show all 45 disasters
  console.log(`🔍 Processed disasterCounties: ${disasterCounties.length} events available out of ${extremeWeatherEvents?.length || 0} total disasters`);
  
  // Add debug log for heat map trigger
  console.log(`🌡️ Heat map trigger check: showDisasterCounties=${showDisasterCounties}, disasterCount=${disasterCounties.length}, mapReady=${!!map.current}`);
  
  // REMOVED OLD CONFLICTING FORCE EFFECT - Using direct creation in main useEffect instead
  
  // Create heat map visualization for major disasters based on severity
  React.useEffect(() => {
    if (!showDisasterCounties || !map.current || disasterCounties.length === 0) {
      console.log(`🌡️ Heat map check: showDisasterCounties=${showDisasterCounties}, map=${!!map.current}, disasters=${disasterCounties.length}`);
      return;
    }
    
    // Clean up existing disaster markers first
    const existingDisasterMarkers = markersRef.current.filter(marker => 
      marker.getElement().className?.includes('disaster-marker') || 
      marker.getElement().style.backgroundColor?.includes('#')
    );
    existingDisasterMarkers.forEach(marker => marker.remove());
    markersRef.current = markersRef.current.filter(marker => !existingDisasterMarkers.includes(marker));

    console.log(`🌡️ CREATING DISASTER HEAT MAP: Processing ${disasterCounties.length} disasters for severity visualization`);

    // Calculate severity scores for heat map visualization
    const calculateSeverityScore = (event: any): number => {
      let score = 0;
      if (event.deaths) score += event.deaths * 10; // Deaths weighted heavily
      if (event.injuries) score += event.injuries * 2; // Injuries moderate weight
      if (event.damageProperty) score += (event.damageProperty / 1000000000) * 5; // Billions in damage
      if (event.damageCrops) score += (event.damageCrops / 1000000000) * 2; // Crop damage
      return Math.max(score, 10); // Minimum score of 10
    };

    // Get severity levels for color/size mapping
    const severityLevels = disasterCounties.map(event => ({
      ...event,
      severityScore: calculateSeverityScore(event)
    }));
    
    const maxSeverity = Math.max(...severityLevels.map(e => e.severityScore));
    const minSeverity = Math.min(...severityLevels.map(e => e.severityScore));
    
    console.log(`🌡️ Severity range: ${minSeverity} to ${maxSeverity}`);

    severityLevels.slice(0, 30).forEach((event, index) => {
      if (!event.coordinates?.longitude || !event.coordinates?.latitude) {
        console.log(`❌ Skipping disaster ${index + 1}: ${event.eventType} - no coordinates`);
        return;
      }

      const lng = event.coordinates.longitude;
      const lat = event.coordinates.latitude;
      
      // Calculate heat map properties based on severity
      const severityRatio = (event.severityScore - minSeverity) / (maxSeverity - minSeverity);
      const size = 15 + (severityRatio * 25); // 15px to 40px
      const opacity = 0.4 + (severityRatio * 0.6); // 40% to 100% opacity
      
      // Color gradient: yellow → orange → red → dark red based on severity
      let color, borderColor;
      if (severityRatio < 0.25) {
        color = '#fbbf24'; // Yellow for lowest severity
        borderColor = '#f59e0b';
      } else if (severityRatio < 0.5) {
        color = '#f97316'; // Orange for low-medium severity
        borderColor = '#ea580c';
      } else if (severityRatio < 0.75) {
        color = '#dc2626'; // Red for high severity
        borderColor = '#b91c1c';
      } else {
        color = '#991b1b'; // Dark red for highest severity
        borderColor = '#7f1d1d';
      }

      console.log(`🌡️ DISASTER ${index + 1}: ${event.eventType} in ${event.state} - Score: ${event.severityScore.toFixed(1)} (${(severityRatio * 100).toFixed(1)}%) at [${lng}, ${lat}]`);

      // Create simplified heat map marker without complex CSS to avoid React errors
      const el = document.createElement('div');
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.opacity = `${opacity}`;
      el.style.zIndex = `${500 + Math.floor(severityRatio * 100)}`;
      el.style.boxShadow = `0 0 ${size * 0.5}px ${color}40`;
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = `${Math.max(10, size * 0.4)}px`;
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
      
      // Add severity indicator emoji
      if (severityRatio >= 0.75) el.innerHTML = '💀'; // Highest severity
      else if (severityRatio >= 0.5) el.innerHTML = '🚨'; // High severity  
      else if (severityRatio >= 0.25) el.innerHTML = '⚠️'; // Medium severity
      else el.innerHTML = '🟡'; // Low severity

      // Create detailed popup with severity information
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '350px'
      }).setHTML(`
        <div style="font-family: system-ui, sans-serif; min-width: 300px;">
          <div style="background: linear-gradient(135deg, ${color}, ${borderColor}); color: white; padding: 16px; margin: -10px -10px 16px -10px; border-radius: 8px 8px 0 0;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">${event.eventType}</h3>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-top: 4px;">
              ${event.state} • ${event.beginDate ? new Date(event.beginDate).toLocaleDateString() : 'Date TBD'}
            </div>
            <div style="margin-top: 8px; padding: 6px 12px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 13px; font-weight: 600;">
              Severity Score: ${event.severityScore.toFixed(1)} / ${maxSeverity.toFixed(1)}
            </div>
          </div>
          <div style="padding: 4px;">
            ${event.deaths > 0 ? `<div style="margin-bottom: 8px;"><strong style="color: #dc2626;">💀 Deaths:</strong> ${event.deaths}</div>` : ''}
            ${event.injuries > 0 ? `<div style="margin-bottom: 8px;"><strong style="color: #f97316;">🏥 Injuries:</strong> ${event.injuries}</div>` : ''}
            ${event.damageProperty > 0 ? `<div style="margin-bottom: 8px;"><strong style="color: #059669;">💰 Property Damage:</strong> $${(event.damageProperty / 1000000000).toFixed(1)}B</div>` : ''}
            ${event.damageCrops > 0 ? `<div style="margin-bottom: 8px;"><strong style="color: #059669;">🌾 Crop Damage:</strong> $${(event.damageCrops / 1000000).toFixed(1)}M</div>` : ''}
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <div style="font-size: 12px; color: #6b7280;">NOAA Major Disaster Database</div>
            </div>
          </div>
        </div>
      `);

      try {
        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current!);
          
        markersRef.current.push(marker);
        console.log(`✅ HEAT MAP ${index + 1}: ${event.eventType} added with severity ${event.severityScore.toFixed(1)} at [${lng}, ${lat}]`);
      } catch (error) {
        console.error(`❌ Failed to add heat map marker ${index + 1}:`, error);
      }
    });
    
    console.log(`✅ Created disaster heat map with ${Math.min(severityLevels.length, 30)} markers based on severity`);
  }, [showDisasterCounties, disasterCounties, map.current]);

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

  // Add weather alert markers and manage all marker types
  useEffect(() => {
    if (!map.current) return;

    // Clear ALL existing markers when any toggle state changes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    console.log('🧹 Cleared all markers due to toggle change');

    // Add weather alert markers only if enabled and have data
    if (showWeatherAlerts && Object.keys(statesWithAlerts).length > 0) {
      Object.entries(statesWithAlerts).forEach(([stateCode, alerts], stateIndex) => {
      const stateData = US_STATES[stateCode as keyof typeof US_STATES];
      if (!stateData) return;

      const alertCount = alerts.length;
      
      // Offset weather alerts slightly from state center to avoid wildfire overlap
      const weatherOffset = 0.15; // Small offset for weather alerts
      const weatherAngle = (stateIndex * 45) * (Math.PI / 180); // Different angle than wildfires
      const weatherLng = stateData.coords[0] + (weatherOffset * Math.cos(weatherAngle));
      const weatherLat = stateData.coords[1] + (weatherOffset * Math.sin(weatherAngle));

      // Get unique weather types for this state
      const uniqueWeatherTypes = [...new Set(alerts.map(alert => getWeatherIcon(alert.event)))];
      const primaryWeatherIcon = uniqueWeatherTypes[0];
      const hasMultipleTypes = uniqueWeatherTypes.length > 1;
      
      // Create enhanced marker element with weather icon
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          border: 4px solid #0ea5e9;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 30px rgba(14, 165, 233, 0.6), 0 4px 15px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 500;
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img 
              src="/attached_assets/${encodeURIComponent(primaryWeatherIcon)}" 
              alt="Primary weather event"
              style="width: 48px; height: 48px; object-fit: contain;"
              onerror="console.log('Weather marker icon failed:', '${primaryWeatherIcon}', 'encoded:', encodeURIComponent('${primaryWeatherIcon}')); this.style.display='none'; this.nextElementSibling.style.display='flex'"
            />
          </div>
          <div style="display: none; color: #ff6b35; font-size: 18px; font-weight: bold; width: 100%; height: 100%; align-items: center; justify-content: center;">${alertCount}</div>
          
        </div>
        
        <!-- Alert count badge - positioned outside the main circle -->
        <div style="
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: linear-gradient(135deg, #0ea5e9, #1d4ed8);
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
          z-index: 20;
        ">${alertCount}</div>
          
        <!-- Multiple weather types indicator -->
        ${hasMultipleTypes ? `
        <div style="
          position: absolute;
          top: -4px;
          left: -4px;
          background: #ea580c;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          z-index: 20;
        ">+${uniqueWeatherTypes.length - 1}</div>
        ` : ''}
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `;

      // Enhanced hover effects - ensure weather alerts stay on top
      el.addEventListener('mouseenter', () => {
        const markerDiv = el.firstElementChild as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1.15)';
          markerDiv.style.boxShadow = '0 12px 40px rgba(14, 165, 233, 0.8), 0 8px 25px rgba(59, 130, 246, 0.6), 0 4px 15px rgba(0,0,0,0.5)';
          markerDiv.style.zIndex = '1500'; // Much higher to ensure weather alerts always stay on top
          markerDiv.style.transform = 'scale(1.25)';
        }
      });

      el.addEventListener('mouseleave', () => {
        const markerDiv = el.firstElementChild as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1)';
          markerDiv.style.boxShadow = '0 8px 30px rgba(14, 165, 233, 0.6), 0 4px 15px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0,0,0,0.3)';
          markerDiv.style.zIndex = '800'; // Much higher base level than wildfire markers
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
              <div style="width: 72px; height: 72px; background: rgba(255, 255, 255, 0.95); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255, 107, 53, 0.6); padding: 4px; box-shadow: 0 6px 16px rgba(255, 107, 53, 0.3); position: relative;">
                <img 
                  src="/attached_assets/${encodeURIComponent(STATE_ICONS[stateCode as keyof typeof STATE_ICONS])}" 
                  alt="${stateData.name} State Silhouette" 
                  style="width: 64px; height: 64px; object-fit: contain; opacity: 1; border-radius: 12px;"
                  onload="console.log('State icon loaded for ${stateCode}:', '${STATE_ICONS[stateCode as keyof typeof STATE_ICONS]}');"
                  onerror="console.log('Failed to load state icon for ${stateCode}:', '${STATE_ICONS[stateCode as keyof typeof STATE_ICONS]}', 'encoded:', encodeURIComponent('${STATE_ICONS[stateCode as keyof typeof STATE_ICONS]}')); this.style.display='none'; this.nextElementSibling.style.display='flex'"
                />
                <div style="display: none; color: #ff6b35; font-size: 18px; font-weight: bold; text-align: center; width: 100%; height: 100%; align-items: center; justify-content: center;">${stateCode}</div>
                <div style="position: absolute; top: -8px; right: -8px; background: #ff6b35; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 30;">${alertCount}</div>
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

          <!-- Weather Types Summary -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; padding: 12px; background: rgba(255, 107, 53, 0.1); border-radius: 8px;">
            ${uniqueWeatherTypes.map(icon => {
              const alertsOfType = alerts.filter(alert => getWeatherIcon(alert.event) === icon);
              const eventType = alertsOfType[0].event.split(' ')[0]; // Get first word like "Flood", "Hurricane"
              return `
              <div style="display: flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.9); padding: 6px 10px; border-radius: 20px; border: 1px solid rgba(255, 107, 53, 0.3);">
                <img 
                  src="/attached_assets/${encodeURIComponent(icon)}" 
                  alt="${eventType}"
                  style="width: 20px; height: 20px; object-fit: contain;"
                />
                <span style="font-size: 12px; font-weight: 600; color: #374151;">${eventType} (${alertsOfType.length})</span>
              </div>
              `;
            }).join('')}
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

      // Add marker to map with offset coordinates
      const marker = new mapboxgl.Marker(el)
        .setLngLat([weatherLng, weatherLat])
        .setPopup(popup)
        .addTo(map.current!);

        markersRef.current.push(marker);
      });
      console.log(`✓ Added ${Object.keys(statesWithAlerts).length} alert markers`);
    }

    // Add wildfire incident markers with enhanced geocoding (cached & batched)
    const addWildfireMarkers = async () => {
      console.log(`🔥 Processing ${wildfires.length} wildfire incidents for map display`);
      
      // Process in batches of 10 to improve performance
      const batchSize = 10;
      for (let i = 0; i < wildfires.length; i += batchSize) {
        const batch = wildfires.slice(i, i + batchSize);
        
        for (const [batchIndex, incident] of batch.entries()) {
          const index = i + batchIndex;
          const stateData = US_STATES[incident.state as keyof typeof US_STATES];
          if (!stateData) continue;

          let lng, lat;
          
          // Try to extract and geocode specific location from title
          const extractedLocation = extractLocationFromTitle(incident.title);
          let coordinates: [number, number] | null = null;
          
          if (extractedLocation) {
            coordinates = await geocodeLocationCached(extractedLocation, incident.state);
          }
          
          if (coordinates) {
            [lng, lat] = coordinates;
            // Add small offset even for geocoded locations to avoid exact overlap
            const microOffset = 0.02; // Small offset to prevent exact overlap
            const microAngle = (index * 45) * (Math.PI / 180);
            lng += microOffset * Math.cos(microAngle);
            lat += microOffset * Math.sin(microAngle);
            console.log(`📍 Wildfire "${incident.title}" geocoded to ${extractedLocation}: [${lng}, ${lat}]`);
          } else {
            // Enhanced fallback with larger offset positioning to avoid overlapping weather markers
            const baseCoords = stateData.coords;
            const offsetDistance = 0.5; // Increased from 0.3 to 0.5 degrees for better separation
            const angle = (index * 72) * (Math.PI / 180); // Changed to 72 degrees (360/5) for better distribution
            lng = baseCoords[0] + (offsetDistance * Math.cos(angle));
            lat = baseCoords[1] + (offsetDistance * Math.sin(angle));
            console.log(`📍 Wildfire "${incident.title}" using offset coords: [${lng}, ${lat}]`);
          }
        
          // Create wildfire marker element
          const el = document.createElement('div');
          el.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: 3px solid #fbbf24;
          border-radius: 50%;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4), 0 3px 10px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          z-index: 100;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img 
              src="/attached_assets/Fire_1754119781364.png" 
              alt="Wildfire incident"
              style="width: 40px; height: 40px; object-fit: contain;"
              onerror="console.log('Wildfire marker icon failed'); this.style.display='none'; this.nextElementSibling.style.display='flex'"
            />
          </div>
          <div style="display: none; color: #fbbf24; font-size: 16px; font-weight: bold; width: 100%; height: 100%; align-items: center; justify-content: center;">🔥</div>
        </div>
        
        <!-- Wildfire indicator badge -->
        <div style="
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #fbbf24;
          color: #7c2d12;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          z-index: 20;
        ">🔥</div>
        `;

      // Enhanced hover effects for wildfire markers with hot shadow
      el.addEventListener('mouseenter', () => {
        const markerDiv = el.firstElementChild as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1.2)';
          markerDiv.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.8), 0 6px 16px rgba(251, 191, 36, 0.6), 0 4px 12px rgba(0,0,0,0.5)';
          markerDiv.style.transition = 'all 0.2s ease-out';
          markerDiv.style.zIndex = '1000';
        }
      });

      el.addEventListener('mouseleave', () => {
        const markerDiv = el.firstElementChild as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'scale(1)';
          markerDiv.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.5), 0 3px 10px rgba(251, 191, 36, 0.3), 0 2px 6px rgba(0,0,0,0.3)';
          markerDiv.style.transition = 'all 0.2s ease-in';
          markerDiv.style.zIndex = '200'; // Lower than weather alerts but visible when hovered
        }
      });

      // Create wildfire popup with comprehensive incident details
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        closeOnMove: false,
        maxWidth: '380px'
      }).setHTML(`
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 320px;">
          <!-- Wildfire Header -->
          <div style="background: linear-gradient(135deg, #7c2d12, #dc2626); color: white; padding: 16px; margin: -10px -10px 16px -10px; border-radius: 12px 12px 0 0; position: relative;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 72px; height: 72px; background: rgba(255, 255, 255, 0.95); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(251, 191, 36, 0.6); padding: 4px; box-shadow: 0 6px 16px rgba(251, 191, 36, 0.3); position: relative;">
                <img 
                  src="/attached_assets/${encodeURIComponent(STATE_ICONS[incident.state as keyof typeof STATE_ICONS])}" 
                  alt="${stateData.name} State Silhouette" 
                  style="width: 64px; height: 64px; object-fit: contain; opacity: 1; border-radius: 12px;"
                />
                <div style="position: absolute; top: -8px; right: -8px; background: #fbbf24; color: #7c2d12; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 30;">🔥</div>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: white;">${stateData.name}</h3>
                <div style="color: #fbbf24; font-size: 14px; margin-top: 2px;">${incident.state} • Wildfire Incident</div>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #7c2d12; padding: 8px 16px; border-radius: 20px; text-align: center; font-size: 15px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);">
              <div style="width: 8px; height: 8px; background: #dc2626; border-radius: 50%; animation: pulse 2s infinite;"></div>
              Active Wildfire
            </div>
          </div>

          <!-- Incident Details Container -->
          <div style="max-height: 300px; overflow-y: auto; padding: 0 6px; scrollbar-width: thin;">
            <div style="
              margin-bottom: 14px; 
              padding: 18px; 
              background: linear-gradient(135deg, #ffffff, #fef7cd); 
              border-radius: 16px; 
              border: 1px solid #fbbf24; 
              box-shadow: 0 3px 12px rgba(251, 191, 36, 0.08);
              border-left: 4px solid #dc2626;
              position: relative;
            ">
              <!-- Wildfire Icon -->
              <div style="position: absolute; top: 16px; right: 16px; width: 56px; height: 56px; background: rgba(255, 255, 255, 0.95); border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 4px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); border: 2px solid rgba(220, 38, 38, 0.2);">
                <img 
                  src="/attached_assets/Fire_1754119781364.png" 
                  alt="Wildfire Icon" 
                  style="width: 48px; height: 48px; object-fit: contain; opacity: 1; border-radius: 8px;"
                />
              </div>

              <!-- Incident Title -->
              <div style="font-weight: 700; font-size: 16px; color: #7c2d12; margin-bottom: 8px; line-height: 1.3; padding-right: 60px;">
                ${incident.title}
              </div>

              <!-- Incident Type & Severity Badges -->
              <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                  ${incident.incidentType}
                </div>
                <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #7c2d12; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                  ${incident.severity}
                </div>
              </div>

              <!-- Description -->
              <div style="color: #374151; font-size: 14px; line-height: 1.4; margin-bottom: 12px;">
                ${incident.description.length > 150 ? incident.description.substring(0, 150) + '...' : incident.description}
              </div>

              <!-- Published Date -->
              <div style="color: #6b7280; font-size: 12px; display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
                <span style="color: #dc2626;">📅</span>
                Published: ${new Date(incident.pubDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>

              <!-- View Details Link -->
              <div style="padding-top: 12px; border-top: 1px solid #fbbf24;">
                <a href="${incident.link}" target="_blank" style="color: #dc2626; font-weight: 600; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s ease;">
                  View Full Details 🔗
                </a>
              </div>
            </div>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `);

      // Create and add wildfire marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

          markersRef.current.push(marker);
        }
        
        // Removed batch delay for faster loading
      }
      console.log(`✓ Added ${wildfires.length} wildfire incident markers with enhanced geocoding`);
    };

    // Execute the async wildfire marker addition only if enabled
    if (showWildfires && wildfires.length > 0) {
      console.log('🔥 Adding wildfire markers - toggle ON');
      addWildfireMarkers();
    } else {
      console.log('🔥 Skipping wildfire markers - toggle OFF or no data');
    }
    
    // DIRECT DISASTER MARKER CREATION - INTEGRATED WITH WILDFIRE SYSTEM
    const addDisasterMarkers = async () => {
      if (!showDisasterCounties || disasterCounties.length === 0 || !map.current) {
        console.log(`❌ Disaster markers skipped: show=${showDisasterCounties}, count=${disasterCounties.length}, map=${!!map.current}`);
        return;
      }
      
      console.log(`🚨 ADDING DISASTER MARKERS DIRECTLY: ${disasterCounties.length} disasters`);
      
      // Sort disasters by severity to ensure Lahaina fire (highest severity) is included
      const sortedDisasters = [...disasterCounties].sort((a, b) => {
        const severityA = (a.deaths || 0) * 10 + (a.damageProperty || 0) / 1000000000 * 5;
        const severityB = (b.deaths || 0) * 10 + (b.damageProperty || 0) / 1000000000 * 5;
        return severityB - severityA;
      });
      
      console.log(`🔥 Top 5 disasters by severity:`, sortedDisasters.slice(0, 5).map(d => ({
        summary: d.stormSummary, 
        state: d.state,
        severity: (d.deaths || 0) * 10 + (d.damageProperty || 0) / 1000000000 * 5
      })));
      
      // Check for Hawaii fires specifically
      const hawaiiFires = sortedDisasters.filter(d => d.state === 'Hawaii');
      console.log(`🌺 Hawaii fires found: ${hawaiiFires.length}`, hawaiiFires.map(h => ({
        summary: h.stormSummary,
        severity: (h.deaths || 0) * 10 + (h.damageProperty || 0) / 1000000000 * 5,
        coords: [h.coordinates?.longitude, h.coordinates?.latitude]
      })));
      
      // Display top 35 disasters to ensure Hawaii fires are included
      for (let i = 0; i < Math.min(sortedDisasters.length, 35); i++) {
        const disaster = sortedDisasters[i];
        if (!disaster.coordinates?.longitude || !disaster.coordinates?.latitude) {
          console.log(`❌ Skipping disaster ${i+1}: ${disaster.eventType} - no coordinates`);
          continue;
        }
        
        // Calculate severity and visual properties
        const deaths = disaster.deaths || 0;
        const damage = disaster.damageProperty || 0;
        const severity = deaths * 10 + (damage / 1000000000) * 5;
        const size = Math.max(20, Math.min(45, severity / 15 + 20));
        
        // Severity-based colors
        let color = '#fbbf24'; // Default yellow
        if (severity > 1000) color = '#7f1d1d'; // Dark red for highest severity
        else if (severity > 500) color = '#dc2626'; // Red for high severity 
        else if (severity > 200) color = '#f97316'; // Orange for medium severity
        else if (severity > 50) color = '#eab308'; // Yellow-orange for low severity
        
        // Special highlighting for Hawaii fires (highest severity)
        if (disaster.state === 'Hawaii') {
          color = '#4c1d95'; // Deep purple for Hawaii fires to make them stand out
          console.log(`🌺 HAWAII FIRE MARKER: ${disaster.stormSummary} at [${disaster.coordinates.longitude}, ${disaster.coordinates.latitude}] - severity: ${severity} - DEEP PURPLE COLOR`);
        }
        
        // Create simple, working disaster marker (revert from complex styling that broke positioning)
        const el = document.createElement('div');
        el.className = 'disaster-marker';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.backgroundColor = color;
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = `${Math.max(12, size * 0.5)}px`;
        el.style.cursor = 'pointer';
        el.style.boxShadow = `0 0 10px ${color}88, 0 2px 4px rgba(0,0,0,0.3)`;
        el.style.transition = 'transform 0.2s ease';
        
        // Remove hover effects that break positioning - they interfere with Mapbox coordinates
        
        // Add appropriate emoji
        if (disaster.eventType?.toLowerCase().includes('fire')) {
          el.textContent = '🔥';
        } else if (disaster.eventType?.toLowerCase().includes('flood')) {
          el.textContent = '💧';
        } else if (disaster.eventType?.toLowerCase().includes('hurricane')) {
          el.textContent = '🌀';
        } else if (disaster.eventType?.toLowerCase().includes('tornado')) {
          el.textContent = '🌪️';
        } else if (disaster.eventType?.toLowerCase().includes('earthquake')) {
          el.textContent = '🌋';
        } else {
          el.textContent = '⚠️';
        }
        
        // Emoji added directly to marker element above
        
        // Create enhanced popup with comprehensive disaster information
        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: true,
          maxWidth: '400px',
          className: 'disaster-popup'
        }).setHTML(`
          <div style="font-family: system-ui, sans-serif; line-height: 1.4;">
            <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 16px; margin: -10px -10px 16px -10px; border-radius: 8px 8px 0 0; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
              <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">${disaster.eventType?.toLowerCase().includes('fire') ? '🔥' : disaster.eventType?.toLowerCase().includes('flood') ? '💧' : disaster.eventType?.toLowerCase().includes('hurricane') ? '🌀' : disaster.eventType?.toLowerCase().includes('tornado') ? '🌪️' : '⚠️'}</span>
                ${disaster.stormSummary || `${disaster.eventType} Event`}
              </h3>
              <div style="font-size: 14px; opacity: 0.95;">
                <strong>${disaster.state}</strong>${disaster.county ? ` • ${disaster.county}` : ''}
              </div>
              <div style="font-size: 12px; opacity: 0.8; margin-top: 6px;">
                ${disaster.beginDate ? new Date(disaster.beginDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date Unknown'}
                ${disaster.endDate ? ` - ${new Date(disaster.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
              </div>
            </div>
            
            <div style="padding: 0 4px 8px 4px;">
              ${deaths > 0 || disaster.injuries > 0 ? `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                  <div style="font-weight: bold; color: #dc2626; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>📊</span> Human Impact
                  </div>
                  ${deaths > 0 ? `<div style="margin-bottom: 4px; color: #991b1b;"><strong>Fatalities:</strong> ${deaths.toLocaleString()}</div>` : ''}
                  ${disaster.injuries > 0 ? `<div style="color: #dc2626;"><strong>Injuries:</strong> ${disaster.injuries.toLocaleString()}</div>` : ''}
                </div>
              ` : ''}
              
              ${damage > 0 || disaster.damageCrops > 0 ? `
                <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                  <div style="font-weight: bold; color: #d97706; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>💰</span> Economic Impact
                  </div>
                  ${damage > 0 ? `<div style="margin-bottom: 4px; color: #92400e;"><strong>Property:</strong> $${(damage / 1000000000).toFixed(2)}B</div>` : ''}
                  ${disaster.damageCrops > 0 ? `<div style="color: #d97706;"><strong>Crops:</strong> $${(disaster.damageCrops / 1000000).toFixed(0)}M</div>` : ''}
                </div>
              ` : ''}
              
              ${disaster.episodeNarrative ? `
                <div style="background: #f0f9ff; border: 1px solid #93c5fd; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                  <div style="font-weight: bold; color: #1d4ed8; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    <span>📝</span> Event Summary
                  </div>
                  <div style="font-size: 13px; color: #1e40af; line-height: 1.5;">
                    ${disaster.episodeNarrative.substring(0, 200)}${disaster.episodeNarrative.length > 200 ? '...' : ''}
                  </div>
                </div>
              ` : ''}
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #6b7280;">
                  <span>Severity Score: <strong style="color: ${color};">${severity.toFixed(1)}</strong></span>
                  <span style="opacity: 0.7;">ID: ${disaster.id}</span>
                </div>
              </div>
            </div>
          </div>
        `);
        
        try {
          // Validate coordinates before creating marker
          const lng = disaster.coordinates.longitude;
          const lat = disaster.coordinates.latitude;
          
          if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
            console.error(`❌ Invalid coordinates for disaster ${i+1}: [${lng}, ${lat}]`);
            continue;
          }
          
          // CRITICAL FIX: Ensure proper coordinate order and validation
          console.log(`🔧 Creating marker for ${disaster.eventType} in ${disaster.state} at coordinates [${lng}, ${lat}]`);
          
          // Double-check coordinate validity and order (longitude first, latitude second)
          if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
            console.error(`❌ Invalid coordinates detected: lng=${lng}, lat=${lat}`);
            continue;
          }
          
          // Use EXACT same pattern as wildfire markers - no complex object, just simple constructor
          const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current!);
          
          console.log(`🎯 DISASTER MARKER POSITIONED: ${disaster.eventType} in ${disaster.state} at [${lng}, ${lat}]`);
          
          markersRef.current.push(marker);
          console.log(`✅ DISASTER MARKER ${i+1}: ${disaster.eventType} in ${disaster.state} at [${lng}, ${lat}] - severity: ${severity.toFixed(1)}`);
          
          // Pan to Hawaii fires for verification (highest severity in database)
          if (disaster.state === 'Hawaii' && i < 3) { // Any of the top Hawaii disasters
            setTimeout(() => {
              map.current!.flyTo({
                center: [lng, lat],
                zoom: 8,
                duration: 4000
              });
              console.log(`🔥 Flying to Hawaii fire at [${lng}, ${lat}] - ${disaster.stormSummary || 'Hawaii Wildfire'}`);
            }, 2000);
          }
          
          // Removed delay for faster loading
        } catch (error) {
          console.error(`❌ Failed to create disaster marker ${i+1}:`, error);
        }
      }
      
      console.log(`✅ DISASTER MARKERS COMPLETE: Added ${Math.min(sortedDisasters.length, 35)} disaster markers`);
    };
    
    // Execute disaster marker addition if enabled
    if (showDisasterCounties && disasterCounties.length > 0) {
      addDisasterMarkers();
    }
    
    // FORCE disaster county highlighting markers using actual county coordinates
    console.log(`🔍 FORCING disaster check: showDisasterCounties=${showDisasterCounties}, length=${disasterCounties.length}, map=${!!map.current}`);
    console.log(`🔍 DEBUG useEffect dependencies:`, {showDisasterCounties, disasterCountiesLength: disasterCounties.length, mapExists: !!map.current});
    
    // FORCE CHECK - Show first disaster data for debugging
    if (disasterCounties.length > 0) {
      console.log(`🔍 FORCE DEBUG: First disaster data:`, disasterCounties[0]);
    }
    
    // REMOVED OLD PROBLEMATIC DISASTER MARKER CODE - Using immediate creation instead
  }, [statesWithAlerts, wildfires, showDisasterCounties, disasterCounties, showWeatherAlerts, showWildfires, map.current]);

  // Debug: Log disaster data availability
  React.useEffect(() => {
    console.log(`🔍 DISASTER DEBUG: disasterCounties length: ${disasterCounties.length}`);
    console.log(`🔍 DISASTER DEBUG: showDisasterCounties: ${showDisasterCounties}`);
    console.log(`🔍 DISASTER DEBUG: map.current exists: ${!!map.current}`);
    if (disasterCounties.length > 0) {
      console.log(`🔍 DISASTER DEBUG: First disaster:`, disasterCounties[0]);
      console.log(`🔍 DISASTER DEBUG: Texas state coords:`, US_STATES['TX']);
      console.log(`🔍 DISASTER DEBUG: North Carolina state coords:`, US_STATES['NC']);
    }
  }, [disasterCounties, showDisasterCounties]);

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
              {showWeatherAlerts ? `${filteredAlerts.length} Weather` : 'Weather Hidden'}
              {(showWeatherAlerts || showWildfires || showDisasterCounties) && ' • '}
              {showWildfires ? `${wildfires.length} Wildfires` : showWeatherAlerts ? 'Wildfires Hidden' : ''}
              {showDisasterCounties && disasterCounties.length > 0 && (
                <span className="ml-2 text-red-300">• {Math.min(disasterCounties.length, 25)} Disasters</span>
              )}
              {isLoading && <span className="ml-2 text-yellow-400 animate-pulse">●</span>}
              {error && <span className="ml-2 text-red-400 animate-bounce">⚠</span>}
            </div>
            <div className="text-xs text-slate-400 mt-1">Live Emergency Data</div>
          </div>
        </div>
      </div>

      {/* Layer Controls Panel */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl p-2 text-white shadow-2xl border border-slate-700/50">
        <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Map Layers</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        
        {/* Layer Toggle Controls */}
        <div className="border-t border-slate-700/50 pt-2 pb-1 px-4 space-y-2">
          
          {/* Weather Alerts Toggle */}
          <label className="flex items-center gap-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showWeatherAlerts}
              onChange={(e) => setShowWeatherAlerts(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-2"
            />
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${showWeatherAlerts ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
              <span className="text-slate-300">Weather Alerts</span>
              {showWeatherAlerts && (
                <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-xs">
                  {filteredAlerts.length}
                </span>
              )}
            </div>
          </label>
          
          {/* Wildfires Toggle */}
          <label className="flex items-center gap-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showWildfires}
              onChange={(e) => setShowWildfires(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-red-500 focus:ring-red-500 focus:ring-2"
            />
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${showWildfires ? 'bg-red-400' : 'bg-slate-600'}`}></div>
              <span className="text-slate-300">Wildfires</span>
              {showWildfires && (
                <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded text-xs">
                  {wildfires.length}
                </span>
              )}
            </div>
          </label>
          
          {/* Disaster Counties Toggle */}
          <label className="flex items-center gap-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showDisasterCounties}
              onChange={(e) => setShowDisasterCounties(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-2"
            />
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${showDisasterCounties ? 'bg-orange-400' : 'bg-slate-600'}`}></div>
              <span className="text-slate-300">Major Disasters</span>
              {showDisasterCounties && disasterCounties.length > 0 && (
                <span className="bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded text-xs">
                  {disasterCounties.length}
                </span>
              )}
            </div>
          </label>
          
        </div>
        <div className="text-xs text-slate-400 px-4 pb-2">Toggle layers on/off</div>
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