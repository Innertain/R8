import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface BioregionalMapProps {
  onBioregionClick?: (bioregionId: string, bioregionName: string) => void;
  selectedBioregion?: string;
  showEcoRegions?: boolean;
}

// North American Bioregions based on One Earth's classification
const bioregions = {
  "1": { 
    name: "Alaskan Boreal Interior", 
    bounds: [[60.0, -170.0], [70.0, -130.0]],
    color: "#2d5016",
    description: "Boreal forests and tundra of interior Alaska"
  },
  "2": { 
    name: "Pacific Coastal Temperate Rainforest", 
    bounds: [[40.0, -125.0], [60.0, -120.0]],
    color: "#1a472a",
    description: "Temperate rainforests from California to Alaska"
  },
  "3": { 
    name: "North American Great Lakes", 
    bounds: [[42.0, -95.0], [50.0, -75.0]],
    color: "#0077be",
    description: "Great Lakes basin and surrounding forests"
  },
  "4": { 
    name: "Northeastern American Forests", 
    bounds: [[40.0, -80.0], [47.0, -65.0]],
    color: "#228b22",
    description: "Mixed deciduous and coniferous forests of the Northeast"
  },
  "5": { 
    name: "Southeastern Mixed Forests", 
    bounds: [[25.0, -95.0], [40.0, -75.0]],
    color: "#6b8e23",
    description: "Mixed forests and wetlands of the Southeast"
  },
  "6": { 
    name: "Great Plains Prairie", 
    bounds: [[35.0, -105.0], [50.0, -90.0]],
    color: "#daa520",
    description: "Grasslands and prairies of central North America"
  },
  "7": { 
    name: "Western Desert & Shrublands", 
    bounds: [[30.0, -120.0], [45.0, -105.0]],
    color: "#cd853f",
    description: "Desert ecosystems of the American Southwest"
  },
  "8": { 
    name: "Rocky Mountain Highlands", 
    bounds: [[35.0, -115.0], [50.0, -100.0]],
    color: "#8b4513",
    description: "Mountain forests and alpine ecosystems"
  },
  "9": { 
    name: "California Mediterranean", 
    bounds: [[32.0, -125.0], [42.0, -115.0]],
    color: "#9acd32",
    description: "Mediterranean climate regions of California"
  },
  "10": { 
    name: "Canadian Boreal Shield", 
    bounds: [[50.0, -95.0], [65.0, -60.0]],
    color: "#2f4f2f",
    description: "Boreal forests and lakes of the Canadian Shield"
  },
  "11": { 
    name: "Arctic Tundra", 
    bounds: [[65.0, -170.0], [85.0, -60.0]],
    color: "#b0c4de",
    description: "Arctic tundra and permafrost regions"
  },
  "12": { 
    name: "Tropical Caribbean", 
    bounds: [[18.0, -85.0], [28.0, -75.0]],
    color: "#32cd32",
    description: "Tropical forests and coastal ecosystems"
  }
};

export default function BioregionalMap({ 
  onBioregionClick, 
  selectedBioregion,
  showEcoRegions = false 
}: BioregionalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const bioregionLayersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [50.0, -100.0], // Center on North America
        zoom: 3,
        minZoom: 2,
        maxZoom: 8,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add satellite/terrain base layer for ecological context
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);

      // Add terrain overlay for ecological boundaries
      L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-lines/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        opacity: 0.3
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    bioregionLayersRef.current.forEach(layer => map.removeLayer(layer));
    bioregionLayersRef.current = [];

    // Add bioregion boundaries
    Object.entries(bioregions).forEach(([id, bioregion]) => {
      const isSelected = selectedBioregion === id;
      
      const bioregionShape = L.rectangle(bioregion.bounds as L.LatLngBoundsExpression, {
        color: bioregion.color,
        fillColor: bioregion.color,
        fillOpacity: isSelected ? 0.4 : 0.2,
        weight: isSelected ? 3 : 2,
        opacity: 0.8,
        className: 'bioregion-boundary'
      });

      bioregionShape.bindPopup(`
        <div class="p-3 max-w-xs">
          <h3 class="font-bold text-lg mb-2">${bioregion.name}</h3>
          <p class="text-sm text-gray-700 mb-3">${bioregion.description}</p>
          <div class="text-xs text-gray-500">
            Click to explore this bioregion's emergency resources and volunteer opportunities
          </div>
        </div>
      `);

      bioregionShape.on('click', () => {
        onBioregionClick?.(id, bioregion.name);
      });

      bioregionShape.on('mouseover', function(e: L.LeafletEvent) {
        const layer = e.target as L.Rectangle;
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0.3,
            weight: 3
          });
        }
      });

      bioregionShape.on('mouseout', function(e: L.LeafletEvent) {
        const layer = e.target as L.Rectangle;
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0.2,
            weight: 2
          });
        }
      });

      map.addLayer(bioregionShape);
      bioregionLayersRef.current.push(bioregionShape);
    });

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <div class="bg-white p-3 rounded-lg shadow-lg border text-xs">
          <h4 class="font-bold mb-2">North American Bioregions</h4>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded" style="background-color: #2d5016"></div>
              <span>Boreal Forests</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded" style="background-color: #1a472a"></div>
              <span>Temperate Rainforest</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded" style="background-color: #228b22"></div>
              <span>Mixed Forests</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded" style="background-color: #daa520"></div>
              <span>Grasslands</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded" style="background-color: #cd853f"></div>
              <span>Desert</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded" style="background-color: #0077be"></div>
              <span>Great Lakes</span>
            </div>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    return () => {
      // Cleanup function
    };
  }, [selectedBioregion, showEcoRegions, onBioregionClick]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg border border-gray-200 shadow-sm"
      />
      
      {selectedBioregion && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ 
                backgroundColor: bioregions[selectedBioregion as keyof typeof bioregions]?.color 
              }}
            ></div>
            <span className="font-medium text-sm">
              {bioregions[selectedBioregion as keyof typeof bioregions]?.name}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {bioregions[selectedBioregion as keyof typeof bioregions]?.description}
          </p>
        </div>
      )}
      
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 border">
        <div className="text-xs text-gray-600 text-center">
          <div className="font-medium mb-1">Ecological Boundaries</div>
          <div>Based on natural ecosystems</div>
        </div>
      </div>
    </div>
  );
}