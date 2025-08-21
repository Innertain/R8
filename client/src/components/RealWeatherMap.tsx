import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, MapPin, Layers, Eye, EyeOff } from 'lucide-react';

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

// Slippy map tile functions
function deg2num(lat: number, lon: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

function num2deg(x: number, y: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const lonDeg = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const latDeg = (latRad * 180) / Math.PI;
  return { lat: latDeg, lon: lonDeg };
}

export function RealWeatherMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 39.0902, lon: -95.7129 });
  const [zoom, setZoom] = useState(4);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [weatherLayers, setWeatherLayers] = useState({ 
    radar: false, 
    temperature: false,
    satellite: false 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const tilesRef = useRef<Map<string, HTMLImageElement>>(new Map());

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

  // Convert lat/lng to canvas coordinates
  const latLngToCanvasPos = (lat: number, lng: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    // Web Mercator projection
    const x = ((lng + 180) / 360) * Math.pow(2, zoom) * 256;
    const latRad = (lat * Math.PI) / 180;
    const y = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * Math.pow(2, zoom) * 256;
    
    // Convert to canvas coordinates based on current center
    const centerTile = deg2num(mapCenter.lat, mapCenter.lon, zoom);
    const centerPixelX = centerTile.x * 256;
    const centerPixelY = centerTile.y * 256;
    
    const canvasX = x - centerPixelX + canvas.width / 2;
    const canvasY = y - centerPixelY + canvas.height / 2;
    
    return { x: canvasX, y: canvasY };
  };

  // Load and draw map tiles
  const drawMap = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate visible tiles
    const tileSize = 256;
    const tilesX = Math.ceil(canvas.width / tileSize) + 1;
    const tilesY = Math.ceil(canvas.height / tileSize) + 1;
    
    const centerTile = deg2num(mapCenter.lat, mapCenter.lon, zoom);
    const startX = centerTile.x - Math.floor(tilesX / 2);
    const startY = centerTile.y - Math.floor(tilesY / 2);

    // Load base map tiles (CartoDB Dark)
    const loadPromises: Promise<void>[] = [];
    
    for (let x = startX; x < startX + tilesX; x++) {
      for (let y = startY; y < startY + tilesY; y++) {
        const tileKey = `base-${zoom}-${x}-${y}`;
        
        if (!tilesRef.current.has(tileKey)) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          tilesRef.current.set(tileKey, img);
          
          const loadPromise = new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}.png`;
          });
          
          loadPromises.push(loadPromise);
        }
      }
    }

    // Draw base tiles
    for (let x = startX; x < startX + tilesX; x++) {
      for (let y = startY; y < startY + tilesY; y++) {
        const tileKey = `base-${zoom}-${x}-${y}`;
        const img = tilesRef.current.get(tileKey);
        
        if (img && img.complete) {
          const drawX = (x - centerTile.x) * tileSize + canvas.width / 2;
          const drawY = (y - centerTile.y) * tileSize + canvas.height / 2;
          ctx.drawImage(img, drawX, drawY, tileSize, tileSize);
        }
      }
    }

    // Load and draw weather overlays
    if (weatherLayers.radar) {
      for (let x = startX; x < startX + tilesX; x++) {
        for (let y = startY; y < startY + tilesY; y++) {
          const tileKey = `radar-${zoom}-${x}-${y}`;
          
          if (!tilesRef.current.has(tileKey)) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            tilesRef.current.set(tileKey, img);
            
            img.onload = () => {
              const drawX = (x - centerTile.x) * tileSize + canvas.width / 2;
              const drawY = (y - centerTile.y) * tileSize + canvas.height / 2;
              ctx.globalAlpha = 0.6;
              ctx.drawImage(img, drawX, drawY, tileSize, tileSize);
              ctx.globalAlpha = 1.0;
            };
            img.src = `https://tilecache.rainviewer.com/v2/radar/0/${zoom}/${x}/${y}/2/1_1.png`;
          } else {
            const img = tilesRef.current.get(tileKey);
            if (img && img.complete) {
              const drawX = (x - centerTile.x) * tileSize + canvas.width / 2;
              const drawY = (y - centerTile.y) * tileSize + canvas.height / 2;
              ctx.globalAlpha = 0.6;
              ctx.drawImage(img, drawX, drawY, tileSize, tileSize);
              ctx.globalAlpha = 1.0;
            }
          }
        }
      }
    }

    // Draw weather alert markers
    Object.entries(statesWithAlerts).forEach(([stateCode, stateAlerts]) => {
      const stateData = US_STATES[stateCode as keyof typeof US_STATES];
      if (!stateData) return;

      const pos = latLngToCanvasPos(stateData.coords[1], stateData.coords[0]);
      const alertCount = (stateAlerts as WeatherAlert[]).length;

      // Only draw if marker is visible
      if (pos.x >= -50 && pos.x <= canvas.width + 50 && pos.y >= -50 && pos.y <= canvas.height + 50) {
        // Draw glow
        ctx.shadowColor = 'rgba(255, 107, 53, 0.6)';
        ctx.shadowBlur = 20;
        
        // Draw marker circle
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 20);
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(1, '#f7931e');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(alertCount.toString(), pos.x, pos.y);
        
        ctx.shadowBlur = 0;
      }
    });
  };

  // Handle canvas interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    // Convert pixel movement to lat/lng
    const pixelsPerDegree = Math.pow(2, zoom) * 256 / 360;
    const newLon = mapCenter.lon - deltaX / pixelsPerDegree;
    const newLat = mapCenter.lat + deltaY / (pixelsPerDegree * Math.cos(mapCenter.lat * Math.PI / 180));
    
    setMapCenter({ lat: newLat, lon: newLon });
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(2, Math.min(10, zoom + delta));
    setZoom(newZoom);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a marker
    let clickedState: string | null = null;
    Object.entries(statesWithAlerts).forEach(([stateCode, stateAlerts]) => {
      const stateData = US_STATES[stateCode as keyof typeof US_STATES];
      if (!stateData) return;

      const pos = latLngToCanvasPos(stateData.coords[1], stateData.coords[0]);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      if (distance <= 20) {
        clickedState = stateCode;
      }
    });

    setSelectedState(selectedState === clickedState ? null : clickedState);
  };

  // Update map when parameters change
  useEffect(() => {
    drawMap();
  }, [mapCenter, zoom, weatherLayers, statesWithAlerts]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawMap();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading weather radar map...</p>
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
      {/* Canvas Map */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        style={{ background: '#0f172a' }}
      />
      
      {/* Alert Counter */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white z-[1000]">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-500" />
          <div>
            <div className="font-bold text-sm">
              {Object.keys(statesWithAlerts).length} States with Alerts
            </div>
            <div className="text-xs opacity-90">
              Zoom: {zoom} • Drag to pan • Scroll to zoom
            </div>
          </div>
        </div>
      </div>

      {/* Weather Layer Controls */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-1 text-white z-[1000]">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setWeatherLayers(prev => ({ ...prev, radar: !prev.radar }))}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-white/20 rounded transition-colors text-sm ${
              weatherLayers.radar ? 'bg-white/20' : ''
            }`}
            title="Toggle precipitation radar"
          >
            <Layers className="w-4 h-4" />
            Radar
            {weatherLayers.radar ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Selected State Popup */}
      {selectedState && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2000]">
          <div className="w-96 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg border border-gray-200">
            <div className="p-4">
              <div className="mb-3">
                <h4 className="font-bold text-lg text-gray-900">
                  {US_STATES[selectedState as keyof typeof US_STATES]?.name} ({selectedState})
                </h4>
                <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {statesWithAlerts[selectedState]?.length} Active Alert{statesWithAlerts[selectedState]?.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {statesWithAlerts[selectedState]?.slice(0, 5).map((alert: WeatherAlert, index: number) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-3 py-2 bg-gray-50 rounded-r">
                    <div className="font-semibold text-sm text-gray-900">{alert.event}</div>
                    <div className="text-xs text-gray-600">{alert.severity} • {alert.urgency}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {alert.description?.slice(0, 120)}...
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setSelectedState(null)}
                className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-[1000]">
        Real weather radar map • Click markers for alerts • Drag to pan • Scroll to zoom • {alerts.length} total alerts
      </div>
    </div>
  );
}

export default RealWeatherMap;