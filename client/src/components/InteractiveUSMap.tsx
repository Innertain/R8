import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  onStateClick?: (stateCode: string, stateName: string) => void;
  onCountyClick?: (countyName: string, stateCode: string) => void;
  selectedState?: string;
  showCounties?: boolean;
}

// US States GeoJSON boundaries (simplified)
const statesBounds = {
  "AL": { name: "Alabama", bounds: [[30.13, -88.47], [35.01, -84.89]] },
  "AK": { name: "Alaska", bounds: [[54.77, -179.14], [71.35, -129.99]] },
  "AZ": { name: "Arizona", bounds: [[31.33, -114.82], [37.00, -109.05]] },
  "AR": { name: "Arkansas", bounds: [[33.00, -94.62], [36.50, -89.64]] },
  "CA": { name: "California", bounds: [[32.53, -124.48], [42.01, -114.13]] },
  "CO": { name: "Colorado", bounds: [[36.99, -109.06], [41.00, -102.04]] },
  "CT": { name: "Connecticut", bounds: [[40.95, -73.73], [42.05, -71.79]] },
  "DE": { name: "Delaware", bounds: [[38.45, -75.79], [39.84, -75.05]] },
  "FL": { name: "Florida", bounds: [[24.52, -87.63], [31.00, -80.03]] },
  "GA": { name: "Georgia", bounds: [[30.36, -85.61], [35.00, -80.84]] },
  "HI": { name: "Hawaii", bounds: [[18.91, -178.33], [28.40, -154.81]] },
  "ID": { name: "Idaho", bounds: [[41.99, -117.24], [49.00, -111.04]] },
  "IL": { name: "Illinois", bounds: [[36.97, -91.51], [42.51, -87.02]] },
  "IN": { name: "Indiana", bounds: [[37.77, -88.10], [41.76, -84.78]] },
  "IA": { name: "Iowa", bounds: [[40.38, -96.64], [43.50, -90.14]] },
  "KS": { name: "Kansas", bounds: [[36.99, -102.05], [40.00, -94.59]] },
  "KY": { name: "Kentucky", bounds: [[36.50, -89.57], [39.15, -81.96]] },
  "LA": { name: "Louisiana", bounds: [[28.93, -94.04], [33.02, -88.82]] },
  "ME": { name: "Maine", bounds: [[43.06, -71.08], [47.46, -66.95]] },
  "MD": { name: "Maryland", bounds: [[37.91, -79.49], [39.72, -75.05]] },
  "MA": { name: "Massachusetts", bounds: [[41.24, -73.51], [42.89, -69.93]] },
  "MI": { name: "Michigan", bounds: [[41.70, -90.42], [48.31, -82.12]] },
  "MN": { name: "Minnesota", bounds: [[43.50, -97.24], [49.38, -89.49]] },
  "MS": { name: "Mississippi", bounds: [[30.17, -91.66], [35.01, -88.10]] },
  "MO": { name: "Missouri", bounds: [[36.00, -95.77], [40.61, -89.10]] },
  "MT": { name: "Montana", bounds: [[44.36, -116.05], [49.00, -104.04]] },
  "NE": { name: "Nebraska", bounds: [[39.99, -104.05], [43.00, -95.31]] },
  "NV": { name: "Nevada", bounds: [[35.00, -120.01], [42.00, -114.04]] },
  "NH": { name: "New Hampshire", bounds: [[42.70, -72.56], [45.31, -70.61]] },
  "NJ": { name: "New Jersey", bounds: [[38.93, -75.56], [41.36, -73.89]] },
  "NM": { name: "New Mexico", bounds: [[31.33, -109.05], [37.00, -103.00]] },
  "NY": { name: "New York", bounds: [[40.50, -79.76], [45.01, -71.86]] },
  "NC": { name: "North Carolina", bounds: [[33.84, -84.32], [36.59, -75.46]] },
  "ND": { name: "North Dakota", bounds: [[45.94, -104.05], [49.00, -96.55]] },
  "OH": { name: "Ohio", bounds: [[38.40, -84.82], [41.98, -80.52]] },
  "OK": { name: "Oklahoma", bounds: [[33.62, -103.00], [37.00, -94.43]] },
  "OR": { name: "Oregon", bounds: [[41.99, -124.56], [46.29, -116.46]] },
  "PA": { name: "Pennsylvania", bounds: [[39.72, -80.52], [42.27, -74.69]] },
  "RI": { name: "Rhode Island", bounds: [[41.15, -71.89], [42.02, -71.12]] },
  "SC": { name: "South Carolina", bounds: [[32.05, -83.35], [35.22, -78.54]] },
  "SD": { name: "South Dakota", bounds: [[42.48, -104.06], [45.95, -96.44]] },
  "TN": { name: "Tennessee", bounds: [[34.98, -90.31], [36.68, -81.65]] },
  "TX": { name: "Texas", bounds: [[25.84, -106.65], [36.50, -93.51]] },
  "UT": { name: "Utah", bounds: [[37.00, -114.05], [42.00, -109.04]] },
  "VT": { name: "Vermont", bounds: [[42.73, -73.44], [45.01, -71.47]] },
  "VA": { name: "Virginia", bounds: [[36.54, -83.68], [39.46, -75.24]] },
  "WA": { name: "Washington", bounds: [[45.54, -124.85], [49.00, -116.92]] },
  "WV": { name: "West Virginia", bounds: [[37.20, -82.64], [40.64, -77.72]] },
  "WI": { name: "Wisconsin", bounds: [[42.49, -92.89], [47.31, -86.25]] },
  "WY": { name: "Wyoming", bounds: [[40.99, -111.06], [45.01, -104.05]] }
};

export default function InteractiveUSMap({ 
  onStateClick, 
  onCountyClick, 
  selectedState,
  showCounties = false 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const stateLayersRef = useRef<L.Layer[]>([]);
  const countyLayersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [39.8283, -98.5795], // Center of USA
        zoom: 4,
        minZoom: 3,
        maxZoom: 10,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add base map layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    stateLayersRef.current.forEach(layer => map.removeLayer(layer));
    stateLayersRef.current = [];
    countyLayersRef.current.forEach(layer => map.removeLayer(layer));
    countyLayersRef.current = [];

    // Add state boundaries
    Object.entries(statesBounds).forEach(([code, state]) => {
      const isSelected = selectedState === code;
      
      const rectangle = L.rectangle(state.bounds as L.LatLngBoundsExpression, {
        color: isSelected ? "#2563eb" : "#6b7280",
        fillColor: isSelected ? "#3b82f6" : "#e5e7eb",
        fillOpacity: isSelected ? 0.3 : 0.1,
        weight: isSelected ? 3 : 1,
        opacity: 0.8
      });

      rectangle.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold">${state.name}</h3>
          <p class="text-sm text-gray-600">Click to explore counties</p>
        </div>
      `);

      rectangle.on('click', () => {
        onStateClick?.(code, state.name);
      });

      rectangle.on('mouseover', function(e: L.LeafletEvent) {
        const layer = e.target as L.Rectangle;
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0.2,
            weight: 2
          });
        }
      });

      rectangle.on('mouseout', function(e: L.LeafletEvent) {
        const layer = e.target as L.Rectangle;
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0.1,
            weight: 1
          });
        }
      });

      map.addLayer(rectangle);
      stateLayersRef.current.push(rectangle);
    });

    // Add county boundaries if showing counties for selected state
    if (showCounties && selectedState) {
      const selectedStateBounds = statesBounds[selectedState as keyof typeof statesBounds];
      if (selectedStateBounds) {
        // Zoom to selected state
        map.fitBounds(selectedStateBounds.bounds as L.LatLngBoundsExpression, { padding: [20, 20] });
        
        // Add sample counties (in a real app, you'd fetch actual county GeoJSON data)
        addSampleCounties(map, selectedState, selectedStateBounds);
      }
    }

    return () => {
      // Cleanup function
    };
  }, [selectedState, showCounties, onStateClick, onCountyClick]);

  const addSampleCounties = (map: L.Map, stateCode: string, stateBounds: any) => {
    // This is a simplified example - in production you'd use actual county GeoJSON data
    const bounds = stateBounds.bounds;
    const latRange = bounds[1][0] - bounds[0][0];
    const lngRange = bounds[1][1] - bounds[0][1];
    
    // Create sample county divisions
    const countiesPerRow = 4;
    const countiesPerCol = 3;
    
    for (let row = 0; row < countiesPerCol; row++) {
      for (let col = 0; col < countiesPerRow; col++) {
        const countyName = `County ${row * countiesPerRow + col + 1}`;
        
        const minLat = bounds[0][0] + (row * latRange) / countiesPerCol;
        const maxLat = bounds[0][0] + ((row + 1) * latRange) / countiesPerCol;
        const minLng = bounds[0][1] + (col * lngRange) / countiesPerRow;
        const maxLng = bounds[0][1] + ((col + 1) * lngRange) / countiesPerRow;
        
        const countyBounds: L.LatLngBoundsExpression = [[minLat, minLng], [maxLat, maxLng]];
        
        const county = L.rectangle(countyBounds, {
          color: "#059669",
          fillColor: "#d1fae5",
          fillOpacity: 0.2,
          weight: 1,
          opacity: 0.6
        });

        county.bindPopup(`
          <div class="p-2">
            <h4 class="font-semibold">${countyName}</h4>
            <p class="text-xs text-gray-600">${statesBounds[stateCode as keyof typeof statesBounds].name}</p>
            <p class="text-xs text-blue-600 mt-1">View emergency info</p>
          </div>
        `);

        county.on('click', () => {
          onCountyClick?.(countyName, stateCode);
        });

        county.on('mouseover', function(e: L.LeafletEvent) {
          const layer = e.target as L.Rectangle;
          layer.setStyle({
            fillOpacity: 0.4,
            weight: 2
          });
        });

        county.on('mouseout', function(e: L.LeafletEvent) {
          const layer = e.target as L.Rectangle;
          layer.setStyle({
            fillOpacity: 0.2,
            weight: 1
          });
        });

        map.addLayer(county);
        countyLayersRef.current.push(county);
      }
    }
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg border border-gray-200 shadow-sm"
      />
      
      {selectedState && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="font-medium text-sm">
              {statesBounds[selectedState as keyof typeof statesBounds]?.name}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {showCounties ? "Showing counties" : "Click to show counties"}
          </p>
        </div>
      )}
    </div>
  );
}