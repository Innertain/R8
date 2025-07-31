import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface SimpleVectorMapProps {
  onRegionClick?: (regionId: string, regionName: string, regionType: 'state' | 'bioregion') => void;
  selectedRegion?: string;
  mapType: 'states' | 'bioregions';
}

// Simple state data with hover info
const stateData = {
  "CA": { 
    name: "California", 
    pop: "39.5M", 
    capital: "Sacramento",
    disasters: "Wildfires, Earthquakes",
    bounds: [[32.5, -124.5], [42.0, -114.0]] 
  },
  "TX": { 
    name: "Texas", 
    pop: "30.0M", 
    capital: "Austin",
    disasters: "Hurricanes, Tornadoes", 
    bounds: [[25.8, -106.6], [36.5, -93.5]] 
  },
  "FL": { 
    name: "Florida", 
    pop: "22.6M", 
    capital: "Tallahassee",
    disasters: "Hurricanes, Flooding", 
    bounds: [[24.5, -87.6], [31.0, -80.0]] 
  },
  "NY": { 
    name: "New York", 
    pop: "19.4M", 
    capital: "Albany",
    disasters: "Blizzards, Ice Storms", 
    bounds: [[40.5, -79.8], [45.0, -71.9]] 
  }
};

const bioregionData = {
  "pacific_northwest": {
    name: "Pacific Northwest",
    climate: "Temperate oceanic",
    species: "Douglas Fir, Salmon",
    threats: "Logging, Climate Change",
    bounds: [[40.0, -125.0], [49.0, -110.0]]
  },
  "great_plains": {
    name: "Great Plains",
    climate: "Semi-arid continental", 
    species: "Bison, Prairie Grass",
    threats: "Agriculture, Drought",
    bounds: [[32.0, -104.0], [49.0, -96.0]]
  },
  "eastern_forests": {
    name: "Eastern Forests",
    climate: "Humid continental",
    species: "Oak, Maple, Deer", 
    threats: "Urbanization, Invasive Species",
    bounds: [[25.0, -96.0], [49.0, -67.0]]
  },
  "desert": {
    name: "Southwestern Desert",
    climate: "Hot desert",
    species: "Saguaro, Roadrunner",
    threats: "Water Scarcity, Heat",
    bounds: [[25.0, -115.0], [37.0, -103.0]]
  }
};

export default function SimpleVectorMap({ onRegionClick, selectedRegion, mapType }: SimpleVectorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [39.8283, -98.5795],
        zoom: 4,
        minZoom: 3,
        maxZoom: 8,
      });

      // Add base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    
    // Clear existing layers
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    const dataToUse = mapType === 'states' ? stateData : bioregionData;

    // Add rectangles for each region
    Object.entries(dataToUse).forEach(([id, region]) => {
      const isSelected = selectedRegion === id;
      const isHovered = hoveredRegion === id;
      
      const rectangle = L.rectangle(region.bounds as L.LatLngBoundsExpression, {
        color: mapType === 'states' 
          ? (isSelected ? "#2563eb" : isHovered ? "#3b82f6" : "#6b7280")
          : (isSelected ? "#16a34a" : isHovered ? "#22c55e" : "#84cc16"),
        fillColor: mapType === 'states'
          ? (isSelected ? "#3b82f6" : isHovered ? "#60a5fa" : "#e5e7eb") 
          : (isSelected ? "#22c55e" : isHovered ? "#4ade80" : "#d4edda"),
        fillOpacity: isSelected ? 0.4 : isHovered ? 0.3 : 0.2,
        weight: isSelected ? 3 : isHovered ? 2 : 1,
      });

      // Add to map
      rectangle.addTo(map);

      // Click handler
      rectangle.on('click', () => {
        onRegionClick?.(id, region.name, mapType === 'states' ? 'state' : 'bioregion');
      });

      // Mouse events
      rectangle.on('mouseover', () => {
        setHoveredRegion(id);
      });

      rectangle.on('mouseout', () => {
        setHoveredRegion(null);
      });

      // Add label
      const center = rectangle.getBounds().getCenter();
      const marker = L.marker(center, {
        icon: L.divIcon({
          className: 'region-label',
          html: `<div style="
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: ${mapType === 'states' ? '#1e40af' : '#166534'};
            border: 1px solid ${mapType === 'states' ? '#3b82f6' : '#22c55e'};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            white-space: nowrap;
          ">${region.name}</div>`,
          iconSize: [100, 30],
          iconAnchor: [50, 15]
        })
      });
      
      marker.addTo(map);
    });

  }, [mapType, selectedRegion, hoveredRegion, onRegionClick]);

  // Get hovered region data for display
  const getHoveredData = () => {
    if (!hoveredRegion) return null;
    const dataToUse = mapType === 'states' ? stateData : bioregionData;
    return dataToUse[hoveredRegion as keyof typeof dataToUse];
  };

  const hoveredData = getHoveredData();

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg border border-gray-200 shadow-sm"
      />
      
      {/* Hover Info Panel */}
      {hoveredData && hoveredRegion && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border max-w-xs z-[1000]">
          <div className="text-sm">
            <h3 className={`font-bold text-lg mb-2 ${mapType === 'states' ? 'text-blue-700' : 'text-green-700'}`}>
              {hoveredData.name}
            </h3>
            
            {mapType === 'states' ? (
              <div className="space-y-1">
                <div><strong>Population:</strong> {(hoveredData as any).pop}</div>
                <div><strong>Capital:</strong> {(hoveredData as any).capital}</div>
                <div><strong>Common Disasters:</strong> {(hoveredData as any).disasters}</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div><strong>Climate:</strong> {(hoveredData as any).climate}</div>
                <div><strong>Key Species:</strong> {(hoveredData as any).species}</div>
                <div><strong>Threats:</strong> {(hoveredData as any).threats}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Region Info */}
      {selectedRegion && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className={`w-4 h-4 rounded ${mapType === 'states' ? 'bg-blue-500' : 'bg-green-500'}`}
            ></div>
            <span className="font-medium text-sm">
              {mapType === 'states' 
                ? (stateData[selectedRegion as keyof typeof stateData] as any)?.name
                : (bioregionData[selectedRegion as keyof typeof bioregionData] as any)?.name
              }
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Selected {mapType === 'states' ? 'state' : 'bioregion'}
          </p>
        </div>
      )}
    </div>
  );
}