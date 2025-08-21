import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CloudRain, Activity, Layers } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox token
if (import.meta.env.VITE_MAPBOX_TOKEN) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
}

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
}

const WorkingMapboxWeatherMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const weatherMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Use the same query as InteractiveWeatherMap
  const { data: response } = useQuery({
    queryKey: ['/api/weather-alerts-rss'],
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  const alerts = (response as any)?.alerts || [];

  useEffect(() => {
    if (!mapContainer.current || map.current || !import.meta.env.VITE_MAPBOX_TOKEN) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-95.7129, 37.0902],
        zoom: 4
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setInitialized(true);
        addWeatherAlerts();
      });

    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add weather alerts when data changes
  useEffect(() => {
    if (initialized && alerts.length > 0) {
      addWeatherAlerts();
    }
  }, [alerts, initialized]);

  const addWeatherAlerts = () => {
    if (!map.current || !alerts.length) return;

    // Clear existing markers
    weatherMarkersRef.current.forEach(marker => marker.remove());
    weatherMarkersRef.current = [];

    alerts.slice(0, 100).forEach((alert: WeatherAlert) => {
      // Use multiple location sources for better geocoding
      const locationText = alert.location || alert.title || alert.description || '';
      const coords = getCoordinatesFromLocation(locationText);
      const icon = getWeatherIcon(alert.event || alert.title);
      const color = getSeverityColor(alert.severity);
      
      console.log(`Placing alert "${alert.event}" at location: ${alert.location} -> [${coords[0]}, ${coords[1]}]`);

      // Create marker element
      const el = document.createElement('div');
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '2px solid white';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '14px';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.innerHTML = icon;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([coords[0], coords[1]])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 16px;">${icon}</span>
              ${alert.event || 'Weather Alert'}
            </h3>
            <p style="margin: 0 0 6px 0; color: #666; font-size: 12px;">${alert.location}</p>
            <div style="padding: 3px 6px; background: ${color}; color: white; border-radius: 3px; font-size: 11px; display: inline-block; margin-bottom: 6px;">
              ${alert.severity} • ${alert.urgency}
            </div>
            <p style="margin: 0; font-size: 12px; line-height: 1.3;">
              ${alert.description.substring(0, 150)}${alert.description.length > 150 ? '...' : ''}
            </p>
          </div>
        `))
        .addTo(map.current!);

      weatherMarkersRef.current.push(marker);
    });
  };

  const getWeatherIcon = (eventType: string): string => {
    const type = eventType.toLowerCase();
    if (type.includes('tornado')) return '🌪️';
    if (type.includes('thunderstorm') || type.includes('severe thunderstorm')) return '⛈️';
    if (type.includes('flood') || type.includes('flash flood')) return '🌊';
    if (type.includes('winter') || type.includes('snow') || type.includes('ice')) return '❄️';
    if (type.includes('wind') || type.includes('gale')) return '💨';
    if (type.includes('heat') || type.includes('fire')) return '🔥';
    if (type.includes('hurricane') || type.includes('tropical storm')) return '🌀';
    if (type.includes('fog') || type.includes('dense fog')) return '🌫️';
    return '⚠️';
  };

  const getSeverityColor = (severity: string): string => {
    const sev = severity?.toLowerCase() || '';
    if (sev.includes('extreme')) return '#8B0000';
    if (sev.includes('severe')) return '#DC2626';
    if (sev.includes('moderate')) return '#F59E0B';
    return '#3B82F6';
  };

  const getCoordinatesFromLocation = (location: string): [number, number] => {
    // Specific geographic features and coastal/marine areas
    const marineCoords: Record<string, [number, number]> = {
      'Delaware Bay': [-75.0941, 39.0458], 'Chesapeake Bay': [-76.1327, 38.5767], 'Cape Cod Bay': [-70.2962, 41.6688],
      'Buzzards Bay': [-70.7461, 41.5579], 'Nantucket Sound': [-70.2962, 41.3579], 'Block Island Sound': [-71.5561, 41.1579],
      'Long Island Sound': [-72.6851, 41.2579], 'Fire Island': [-73.1851, 40.6426], 'Montauk Point': [-71.8565, 41.0707],
      'Outer Banks': [-75.5296, 35.2193], 'Hatteras Island': [-75.7004, 35.2193], 'Ocracoke Island': [-75.9876, 35.1154],
      'Cape Hatteras': [-75.6504, 35.2315], 'Cape Fear': [-78.0661, 33.8376], 'Pamlico Sound': [-76.0327, 35.4193],
      'Albemarle Sound': [-75.9327, 36.1193], 'Currituck Sound': [-75.8327, 36.3193], 'Bogue Sound': [-77.0327, 34.6193],
      'Core Sound': [-76.3327, 34.8193], 'Roanoke Sound': [-75.6327, 35.8193], 'Croatan Sound': [-75.7327, 35.9193],
      'East Carteret': [-76.5833, 34.7333], 'West Carteret': [-77.0833, 34.7333], 'Carteret County': [-76.6833, 34.7333],
      'Dare County': [-75.6333, 35.5333], 'Hyde County': [-76.1333, 35.4333], 'Tyrrell County': [-76.1833, 35.8333]
    };

    // Enhanced county and city coordinates for more precise placement
    const locationCoords: Record<string, [number, number]> = {
      // Major cities and counties with precise coordinates
      'New York City': [-74.0059, 40.7128], 'Los Angeles': [-118.2437, 34.0522], 'Chicago': [-87.6298, 41.8781],
      'Houston': [-95.3698, 29.7604], 'Phoenix': [-112.0740, 33.4484], 'Philadelphia': [-75.1652, 39.9526],
      'San Antonio': [-98.4936, 29.4241], 'San Diego': [-117.1611, 32.7157], 'Dallas': [-96.7970, 32.7767],
      'San Jose': [-121.8863, 37.3382], 'Austin': [-97.7431, 30.2672], 'Jacksonville': [-81.6557, 30.3322],
      'Miami': [-80.1918, 25.7617], 'Atlanta': [-84.3880, 33.7490], 'Boston': [-71.0589, 42.3601],
      'Denver': [-104.9903, 39.7392], 'Seattle': [-122.3321, 47.6062], 'Nashville': [-86.7816, 36.1627],
      'Oklahoma City': [-97.5164, 35.4676], 'Las Vegas': [-115.1398, 36.1699], 'Portland': [-122.6784, 45.5152],
      'Tucson': [-110.9265, 32.2226], 'Fresno': [-119.7871, 36.7378], 'Sacramento': [-121.4684, 38.5816],
      'Kansas City': [-94.5786, 39.0997], 'Mesa': [-111.8315, 33.4152], 'Virginia Beach': [-75.9780, 36.8529],
      'Colorado Springs': [-104.8214, 38.8339], 'Omaha': [-95.9345, 41.2524], 'Raleigh': [-78.6382, 35.7796],
      'Long Beach': [-118.1937, 33.7701], 'Miami Gardens': [-80.2456, 25.9420],
      'Oakland': [-122.2711, 37.8044], 'Minneapolis': [-93.2650, 44.9778], 'Tampa': [-82.4572, 27.9506],
      'Tulsa': [-95.9928, 36.1540], 'Arlington': [-97.1081, 32.7357], 'Wichita': [-97.3301, 37.6872],
      'Bakersfield': [-119.0187, 35.3733], 'New Orleans': [-90.0715, 29.9511], 'Honolulu': [-157.8583, 21.3099],
      'Anaheim': [-117.9145, 33.8366], 'Santa Ana': [-117.8681, 33.7455], 'Riverside': [-117.3961, 33.9533],
      'Corpus Christi': [-97.3964, 27.8006], 'Lexington': [-84.5037, 38.0406], 'Stockton': [-121.2908, 37.9577],
      'Henderson': [-115.0372, 36.0395], 'Saint Paul': [-93.0900, 44.9537], 'Cincinnati': [-84.5120, 39.1031],
      'Pittsburgh': [-79.9959, 40.4406], 'Greensboro': [-79.7920, 36.0726], 'Plano': [-96.6917, 33.0198],
      'Lincoln': [-96.6917, 40.8136], 'Orlando': [-81.3792, 28.5383], 'Anchorage': [-149.9003, 61.2181],
      'Irvine': [-117.8265, 33.6846], 'Newark': [-74.1724, 40.7357], 'Durham': [-78.8784, 35.9940],
      'Chula Vista': [-117.0842, 32.6401], 'Fort Wayne': [-85.1394, 41.0793], 'Jersey City': [-74.0431, 40.7178],
      'St. Petersburg': [-82.6404, 27.7676], 'Laredo': [-99.5075, 27.5306], 'Madison': [-89.4012, 43.0731],
      'Chandler': [-111.8415, 33.3062], 'Buffalo': [-78.8784, 42.8864], 'Lubbock': [-101.8313, 33.5779],
      'Scottsdale': [-111.9260, 33.4942], 'Reno': [-119.7674, 39.5296], 'Glendale': [-112.1860, 33.5387],
      'Gilbert': [-111.7890, 33.3528], 'Winston Salem': [-80.2442, 36.0999], 'North Las Vegas': [-115.1175, 36.1989],
      'Norfolk': [-76.2859, 36.8468], 'Chesapeake': [-76.2875, 36.7682], 'Garland': [-96.6389, 32.9126],
      'Irving': [-96.9489, 32.8140], 'Hialeah': [-80.2781, 25.8576], 'Fremont': [-121.9886, 37.5485],
      'Boise': [-116.2146, 43.6150], 'Richmond': [-77.4360, 37.5407], 'Baton Rouge': [-91.1871, 30.4515],
      
      // NWS Weather Forecast Office locations for more accurate placement
      'Grand Canyon Country': [-112.1401, 36.0544], 'Eastern Arizona': [-109.0452, 34.2744], 
      'Northern Arizona': [-111.6513, 35.1983], 'Central Arizona': [-112.0740, 33.4484],
      'Southern California': [-117.8265, 33.6846], 'Central California': [-119.7871, 36.7378],
      'Northern California': [-122.4194, 37.7749], 'San Francisco Bay Area': [-122.4194, 37.7749],
      'Colorado Rockies': [-105.0178, 39.7392], 'Eastern Colorado': [-104.0219, 39.7391],
      'Florida Keys': [-81.0784, 24.5557], 'South Florida': [-80.1918, 25.7617], 'Central Florida': [-81.3792, 28.5383],
      'North Florida': [-84.27277, 30.4518], 'Northeast Florida': [-81.6557, 30.3322], 'Northwest Florida': [-87.2169, 30.4213],
      'North Georgia': [-84.39, 34.7489], 'Central Georgia': [-83.6324, 32.5404], 'South Georgia': [-83.2482, 31.5804],
      'Chicago Metro': [-87.6298, 41.8781], 'Central Illinois': [-89.6501, 39.8014], 'Southern Illinois': [-89.2181, 37.7378],
      'Northwest Indiana': [-87.0024, 41.6034], 'Central Indiana': [-86.1349, 39.7910], 'Southern Indiana': [-87.0024, 38.0406],
      'Eastern Iowa': [-91.5302, 41.6005], 'Central Iowa': [-93.6091, 41.5868], 'Western Iowa': [-95.8608, 41.5868],
      'Eastern Kansas': [-94.6859, 39.0473], 'Central Kansas': [-98.3804, 38.5266], 'Western Kansas': [-101.0313, 38.5266],
      'Louisville Metro': [-85.7585, 38.2527], 'Eastern Kentucky': [-82.4194, 37.8393], 'Western Kentucky': [-87.4895, 37.0842],
      'New Orleans Metro': [-90.0715, 29.9511], 'North Louisiana': [-92.6437, 32.5252], 'Central Louisiana': [-92.4426, 31.1801],
      'Baltimore Metro': [-76.6122, 39.2904], 'Washington DC Metro': [-77.0369, 38.9072], 'Eastern Maryland': [-75.7141, 38.3498],
      'Boston Metro': [-71.0589, 42.3601], 'Western Massachusetts': [-72.5195, 42.1015], 'Cape Cod': [-70.2962, 41.6688],
      'Detroit Metro': [-83.0458, 42.3314], 'Grand Rapids': [-85.6681, 42.9634], 'Northern Michigan': [-84.5467, 45.0617],
      'Twin Cities': [-93.2650, 44.9778], 'Southern Minnesota': [-93.5911, 44.0121], 'Northern Minnesota': [-94.6859, 46.7296],
      'Jackson Metro': [-90.1848, 32.2988], 'North Mississippi': [-89.2181, 34.2048], 'Gulf Coast Mississippi': [-89.0928, 30.3674],
      'Kansas City Metro': [-94.5786, 39.0997], 'St. Louis Metro': [-90.1994, 38.6270], 'Southwest Missouri': [-93.2923, 37.2153],
      'Billings': [-108.5007, 45.7833], 'Great Falls': [-111.2833, 47.4941], 'Missoula': [-113.9940, 46.8059],
      'Omaha Metro': [-95.9345, 41.2524], 'North Platte': [-100.7665, 41.1240], 'Lincoln': [-96.6917, 40.8136],
      'Las Vegas Metro': [-115.1398, 36.1699], 'Northern Nevada': [-116.4194, 40.5000]
    };

    // State coordinates as fallback
    const stateCoords: Record<string, [number, number]> = {
      'Alabama': [-86.79113, 32.377716], 'Alaska': [-152.404419, 64.0685], 'Arizona': [-111.093731, 34.048927],
      'Arkansas': [-92.373123, 34.736009], 'California': [-119.681564, 36.116203], 'Colorado': [-105.311104, 39.059811],
      'Connecticut': [-72.755371, 41.767], 'Delaware': [-75.526755, 39.161921], 'Florida': [-81.686783, 27.766279],
      'Georgia': [-83.441162, 32.157435], 'Hawaii': [-157.826182, 21.30895], 'Idaho': [-114.478828, 44.240459],
      'Illinois': [-88.986137, 40.192138], 'Indiana': [-86.147685, 40.790798], 'Iowa': [-93.620866, 42.032974],
      'Kansas': [-98.484246, 39.04], 'Kentucky': [-84.86311, 37.522], 'Louisiana': [-91.953125, 31.244823],
      'Maine': [-69.765261, 44.323535], 'Maryland': [-76.501157, 39.045755], 'Massachusetts': [-71.530106, 42.407211],
      'Michigan': [-84.5467, 44.182205], 'Minnesota': [-94.636230, 46.729553], 'Mississippi': [-89.678696, 32.741646],
      'Missouri': [-91.831833, 38.572954], 'Montana': [-110.454353, 47.052166], 'Nebraska': [-99.901813, 41.492537],
      'Nevada': [-116.419389, 38.313515], 'New Hampshire': [-71.549709, 43.452492], 'New Jersey': [-74.756138, 40.221741],
      'New Mexico': [-106.248482, 34.307144], 'New York': [-74.948051, 42.165726], 'North Carolina': [-79.806419, 35.759573],
      'North Dakota': [-101.002012, 47.551493], 'Ohio': [-82.764915, 40.269789], 'Oklahoma': [-97.534994, 35.482309],
      'Oregon': [-120.767635, 43.804133], 'Pennsylvania': [-77.209755, 40.269789], 'Rhode Island': [-71.422132, 41.82355],
      'South Carolina': [-81.035, 33.836081], 'South Dakota': [-99.901813, 44.299782], 'Tennessee': [-86.784, 35.860119],
      'Texas': [-97.563461, 31.054487], 'Utah': [-111.892622, 39.419220], 'Vermont': [-72.580536, 44.26639],
      'Virginia': [-78.169968, 37.54], 'Washington': [-121.490494, 47.042418], 'West Virginia': [-80.954570, 38.349497],
      'Wisconsin': [-89.616508, 44.268543], 'Wyoming': [-107.30249, 43.075968]
    };

    // Enhanced parsing for NWS location formats
    const cleanLocation = location.toLowerCase().trim();
    
    // First check marine/coastal areas
    for (const [loc, coords] of Object.entries(marineCoords)) {
      if (cleanLocation.includes(loc.toLowerCase())) {
        return [coords[0], coords[1]];
      }
    }
    
    // Parse county names - NWS format: "CountyName, ST" or "CountyName County, ST"
    const countyPattern = /([a-zA-Z\s]+)(?:\s+County)?,\s*([A-Z]{2})/g;
    let match;
    while ((match = countyPattern.exec(location)) !== null) {
      const countyName = match[1].trim();
      const state = match[2];
      const countyKey = `${countyName} County, ${state}`;
      
      if (locationCoords[countyKey]) {
        return locationCoords[countyKey];
      }
    }

    // Try to match specific cities and locations
    for (const [loc, coords] of Object.entries(locationCoords)) {
      if (cleanLocation.includes(loc.toLowerCase())) {
        return [coords[0], coords[1]];
      }
    }

    // Then try state matching with slight offset to avoid overlapping
    for (const [state, coords] of Object.entries(stateCoords)) {
      if (location.includes(state)) {
        return [
          coords[0] + (Math.random() - 0.5) * 1.5, // Smaller random offset
          coords[1] + (Math.random() - 0.5) * 0.8
        ];
      }
    }

    // Extract county names and use geocoding fallback
    const countyMatch = location.match(/(\w+)\s+County/i);
    if (countyMatch) {
      const countyName = countyMatch[1];
      // Basic county-to-coordinates mapping for common counties
      const countyCoords: Record<string, [number, number]> = {
        'Los Angeles': [-118.2437, 34.0522], 'Cook': [-87.6298, 41.8781], 'Harris': [-95.3698, 29.7604],
        'Maricopa': [-112.0740, 33.4484], 'San Diego': [-117.1611, 32.7157], 'Orange': [-117.8265, 33.6846],
        'Miami Dade': [-80.1918, 25.7617], 'Dallas': [-96.7970, 32.7767], 'Kings': [-73.9442, 40.6782],
        'Queens': [-73.7949, 40.7282], 'Wayne': [-83.0458, 42.3314], 'Clark': [-115.1398, 36.1699],
        'Tarrant': [-97.2781, 32.7555], 'Santa Clara': [-121.8863, 37.3382], 'King': [-122.3321, 47.6062],
        'Riverside': [-117.3961, 33.9533], 'San Bernardino': [-117.2898, 34.1084], 'Broward': [-80.2374, 26.1901],
        'Alameda': [-122.2711, 37.8044], 'Sacramento': [-121.4684, 38.5816], 'Contra Costa': [-122.0002, 37.9161],
        'Travis': [-97.7431, 30.2672], 'Cuyahoga': [-81.6934, 41.4993], 'Fulton': [-84.3880, 33.7490]
      };
      
      if (countyCoords[countyName]) {
        return countyCoords[countyName];
      }
    }

    // Default fallback to central US
    return [-98.5795, 39.8283];
  };

  const toggleAlerts = (show: boolean) => {
    weatherMarkersRef.current.forEach(marker => {
      if (show) {
        marker.addTo(map.current!);
      } else {
        marker.remove();
      }
    });
    setShowAlerts(show);
  };

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-bold text-red-600 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600">Please add VITE_MAPBOX_TOKEN to your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Controls */}
      <Card className="absolute top-4 left-4 w-64 bg-white/95 backdrop-blur z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium text-sm">Weather Alerts</div>
                <div className="text-xs text-gray-500">{alerts.length} active</div>
              </div>
            </div>
            <Switch checked={showAlerts} onCheckedChange={toggleAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="absolute top-4 right-4 w-40 bg-white/95 backdrop-blur z-10">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              {initialized ? 'Live Data' : 'Loading...'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="absolute bottom-4 right-4 w-36 bg-white/95 backdrop-blur z-10">
        <CardContent className="p-3">
          <div className="text-xs font-semibold mb-2">Alert Icons</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1">
              <span>🌪️</span><span>Tornado</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⛈️</span><span>Storm</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌊</span><span>Flood</span>
            </div>
            <div className="flex items-center gap-1">
              <span>❄️</span><span>Winter</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔥</span><span>Heat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkingMapboxWeatherMap;