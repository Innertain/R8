import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface VectorMapProps {
  onRegionClick?: (regionId: string, regionName: string, regionType: 'state' | 'bioregion') => void;
  selectedRegion?: string;
  mapType: 'states' | 'bioregions';
}

// Simplified GeoJSON-style coordinates for US states (actual shapes, not boxes)
const stateVectorData = {
  "CA": {
    name: "California",
    coordinates: [
      [[-124.482003, 42.009518], [-124.211006, 41.998902], [-124.053108, 42.000709], 
       [-123.233256, 42.006186], [-122.378853, 42.011663], [-121.037003, 41.995232], 
       [-120.001861, 41.995232], [-119.996384, 40.264519], [-120.001861, 39.239668], 
       [-118.71478, 38.101128], [-117.498899, 37.21934], [-116.540435, 36.501861], 
       [-115.85034, 35.970598], [-114.634459, 35.00118], [-114.634459, 34.87521], 
       [-114.470841, 34.710618], [-114.333228, 34.448009], [-114.136058, 34.305608], 
       [-114.256615, 34.174162], [-114.415382, 34.108438], [-114.535939, 33.933176], 
       [-114.497536, 33.697668], [-114.524921, 33.54979], [-114.727567, 33.40739], 
       [-114.661844, 33.034958], [-114.524921, 33.029481], [-114.470841, 32.843265], 
       [-114.524921, 32.755634], [-114.72209, 32.717694], [-116.04751, 32.624187], 
       [-117.126467, 32.536556], [-117.24494, 32.668003], [-117.377534, 32.697932], 
       [-117.471717, 32.746639], [-117.550761, 32.808998], [-117.598746, 32.842863], 
       [-117.786808, 32.909301], [-118.183716, 33.054285], [-118.370039, 33.164069], 
       [-118.421831, 33.187593], [-118.634951, 33.336306], [-118.715187, 33.347217], 
       [-118.785447, 33.367719], [-118.855707, 33.462687], [-118.958618, 33.489568], 
       [-118.990748, 33.613717], [-119.081198, 33.703125], [-119.438325, 34.348126], 
       [-119.881876, 34.463751], [-120.640074, 35.156253], [-121.143852, 36.195001], 
       [-121.714349, 36.195001], [-122.247627, 37.195001], [-122.515849, 37.854125], 
       [-122.936301, 38.595001], [-123.728879, 39.0625], [-124.109351, 40.105621], 
       [-124.482003, 42.009518]]
    ]
  },
  "TX": {
    name: "Texas", 
    coordinates: [
      [[-106.645646, 25.837164], [-93.508292, 25.837164], [-93.508292, 29.417565], 
       [-93.507934, 29.421428], [-93.50759, 29.77502], [-93.341613, 30.05364], 
       [-93.120961, 30.244644], [-93.095953, 30.28351], [-93.0936, 30.358671], 
       [-93.016338, 30.427934], [-92.889698, 30.469117], [-92.749329, 30.4519], 
       [-92.710518, 30.434633], [-92.697189, 30.373056], [-92.68548, 30.298777], 
       [-92.701951, 30.227156], [-92.72977, 30.156951], [-92.766052, 30.095373], 
       [-92.847709, 29.979339], [-92.970703, 29.888896], [-93.095953, 29.813506], 
       [-93.155625, 29.776733], [-93.204536, 29.735549], [-93.241699, 29.675232], 
       [-93.279624, 29.588984], [-93.341613, 29.468302], [-93.406654, 29.330711], 
       [-93.441162, 29.177088], [-93.466278, 29.013734], [-93.486725, 28.847755], 
       [-93.527908, 28.670517], [-93.585937, 28.484017], [-93.6554, 28.29204], 
       [-93.727722, 28.096436], [-93.796329, 27.897522], [-93.849045, 27.691289], 
       [-93.886089, 27.478838], [-93.906536, 27.261169], [-93.909899, 27.039408], 
       [-93.897415, 26.814452], [-93.871857, 26.587405], [-94.817121, 25.837164], 
       [-97.484808, 25.837164], [-97.952648, 25.872104], [-98.233282, 26.06103], 
       [-98.411026, 26.2208], [-98.522797, 26.320984], [-98.608017, 26.421168], 
       [-98.684768, 26.540456], [-98.751049, 26.679849], [-98.805069, 26.83947], 
       [-98.853054, 27.025687], [-98.904438, 27.234417], [-98.97058, 27.464552], 
       [-99.052237, 27.713992], [-99.149857, 27.979116], [-99.26216, 28.256553], 
       [-99.389801, 28.541372], [-99.53221, 28.828608], [-99.688649, 29.115844], 
       [-99.859154, 29.395589], [-100.041698, 29.663875], [-100.239081, 29.918644], 
       [-100.449829, 30.157996], [-100.671591, 30.389237], [-100.901725, 30.608062], 
       [-101.1393, 30.811766], [-101.379891, 30.995419], [-101.620482, 31.156022], 
       [-101.85881, 31.290575], [-102.09214, 31.396077], [-102.31891, 31.471468], 
       [-102.537213, 31.515440], [-102.746862, 31.527493], [-102.946926, 31.506935], 
       [-103.135809, 31.452744], [-103.312648, 31.364920], [-103.474562, 31.244464], 
       [-103.619152, 31.093375], [-103.744402, 30.913554], [-103.849047, 30.707322], 
       [-103.932046, 30.477188], [-103.992981, 30.225746], [-104.030926, 29.957462], 
       [-104.045872, 29.674851], [-104.037398, 29.380616], [-104.006929, 29.077756], 
       [-103.955546, 28.769411], [-103.884567, 28.457549], [-103.794947, 28.146797], 
       [-103.688302, 27.839562], [-103.565735, 27.537811], [-103.428448, 27.242466], 
       [-103.277359, 26.954120], [-103.113568, 26.673618], [-102.938076, 26.402960], 
       [-102.752182, 26.142145], [-102.556887, 25.892172], [-106.645646, 25.837164]]
    ]
  },
  "FL": {
    name: "Florida",
    coordinates: [
      [[-87.359296, 35.00118], [-85.606675, 34.984749], [-85.431413, 34.124869], 
       [-85.184951, 33.160898], [-85.069935, 32.580372], [-84.960751, 32.421875], 
       [-85.004212, 32.322956], [-84.889196, 32.262709], [-85.058981, 32.13674], 
       [-85.053504, 32.01077], [-85.141136, 31.840985], [-85.042017, 31.539753], 
       [-85.113751, 31.27686], [-85.004212, 31.003013], [-85.497137, 30.997536], 
       [-87.600282, 30.997536], [-87.633143, 30.86609], [-87.408589, 30.674846], 
       [-87.446927, 30.510088], [-87.37758, 30.427934], [-87.518128, 30.280622], 
       [-87.655051, 30.247519], [-87.90699, 30.411132], [-87.934375, 30.657595], 
       [-88.011052, 30.685041], [-88.10697, 30.56077], [-88.137438, 30.367774], 
       [-88.394438, 30.367774], [-88.471115, 31.895754], [-88.241084, 33.796253], 
       [-88.098827, 34.891641], [-88.202745, 34.995517], [-87.359296, 35.00118]]
    ]
  },
  "NY": {
    name: "New York",
    coordinates: [
      [[-79.762152, 42.269327], [-79.762152, 42.696007], [-79.149363, 42.844539], 
       [-78.930207, 42.86371], [-78.853530, 42.783338], [-78.555044, 42.783338], 
       [-78.492053, 42.770176], [-78.492053, 42.635729], [-78.941544, 42.635729], 
       [-79.012506, 42.500000], [-79.072834, 42.319939], [-78.486575, 42.271327], 
       [-78.216362, 42.271327], [-77.966989, 42.271327], [-77.837836, 42.303104], 
       [-77.759681, 42.269327], [-77.722217, 42.271327], [-77.391479, 42.271327], 
       [-77.355495, 42.271327], [-77.3215, 42.271327], [-77.045998, 42.271327], 
       [-76.507492, 42.271327], [-76.3125, 42.271327], [-76.25, 42.271327], 
       [-74.867477, 42.271327], [-74.778717, 42.271327], [-74.66875, 42.271327], 
       [-74.218750, 42.271327], [-73.967499, 42.271327], [-73.343750, 42.271327], 
       [-72.281250, 42.026551], [-71.859375, 41.640078], [-71.812500, 41.508577], 
       [-71.859375, 41.375010], [-72.093750, 41.211722], [-72.281250, 41.145570], 
       [-72.531250, 40.946714], [-73.218750, 40.979898], [-73.937500, 40.713956], 
       [-74.218750, 40.647304], [-74.156250, 40.563895], [-74.031250, 40.430224], 
       [-73.906250, 40.346544], [-73.906250, 40.230947], [-73.828125, 40.113014], 
       [-73.968750, 40.046414], [-74.218750, 40.013057], [-74.218750, 39.913014], 
       [-74.453125, 39.929223], [-74.968750, 40.030723], [-75.203125, 40.080170], 
       [-75.390625, 39.962223], [-75.718750, 39.878012], [-79.762152, 42.269327]]
    ]
  }
};

// Bioregional vector boundaries (simplified ecological regions)
const bioregionVectorData = {
  "pacific_northwest": {
    name: "Pacific Northwest Coastal Forests",
    coordinates: [
      [[-125.0, 48.0], [-124.0, 47.0], [-123.0, 46.0], [-122.0, 45.0], 
       [-121.0, 44.0], [-120.0, 43.0], [-119.0, 42.0], [-118.0, 41.0],
       [-117.0, 40.0], [-116.0, 39.0], [-115.0, 38.0], [-114.0, 37.0],
       [-113.0, 36.0], [-112.0, 35.0], [-123.0, 35.0], [-124.0, 40.0],
       [-125.0, 45.0], [-125.0, 48.0]]
    ],
    color: "#2d5016"
  },
  "great_plains": {
    name: "Great Plains Prairie",
    coordinates: [
      [[-104.0, 49.0], [-96.0, 49.0], [-96.0, 37.0], [-100.0, 32.0],
       [-104.0, 32.0], [-104.0, 37.0], [-104.0, 49.0]]
    ],
    color: "#daa520"
  },
  "eastern_forests": {
    name: "Eastern Deciduous Forests", 
    coordinates: [
      [[-96.0, 49.0], [-80.0, 49.0], [-80.0, 45.0], [-75.0, 40.0],
       [-70.0, 35.0], [-75.0, 30.0], [-85.0, 25.0], [-96.0, 25.0],
       [-96.0, 35.0], [-96.0, 49.0]]
    ],
    color: "#228b22"
  },
  "southwestern_desert": {
    name: "Southwestern Desert",
    coordinates: [
      [[-115.0, 37.0], [-103.0, 37.0], [-103.0, 25.0], [-115.0, 25.0],
       [-120.0, 30.0], [-115.0, 37.0]]
    ],
    color: "#cd853f"
  }
};

export default function VectorMap({ 
  onRegionClick, 
  selectedRegion,
  mapType 
}: VectorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const regionLayersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [39.8283, -98.5795], // Center of USA
        zoom: 4,
        minZoom: 3,
        maxZoom: 8,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add appropriate base layer based on map type
      if (mapType === 'bioregions') {
        // Natural/satellite view for bioregions
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
      } else {
        // Clean political map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
      }
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    regionLayersRef.current.forEach(layer => map.removeLayer(layer));
    regionLayersRef.current = [];

    // Add vector regions based on map type
    const dataToUse = mapType === 'states' ? stateVectorData : bioregionVectorData;
    
    Object.entries(dataToUse).forEach(([id, region]) => {
      const isSelected = selectedRegion === id;
      
      // Create polygon from coordinates
      const polygon = L.polygon(region.coordinates as L.LatLngExpression[], {
        color: mapType === 'bioregions' ? (region as any).color : (isSelected ? "#2563eb" : "#6b7280"),
        fillColor: mapType === 'bioregions' ? (region as any).color : (isSelected ? "#3b82f6" : "#e5e7eb"),
        fillOpacity: isSelected ? 0.4 : 0.2,
        weight: isSelected ? 3 : 2,
        opacity: 0.8
      });

      polygon.bindPopup(`
        <div class="p-3 max-w-xs">
          <h3 class="font-bold text-lg mb-2">${region.name}</h3>
          <p class="text-sm text-gray-700 mb-3">
            ${mapType === 'bioregions' 
              ? 'Natural ecological boundary based on ecosystem characteristics'
              : 'Click to explore emergency resources and volunteer opportunities'
            }
          </p>
        </div>
      `);

      polygon.on('click', () => {
        onRegionClick?.(id, region.name, mapType === 'states' ? 'state' : 'bioregion');
      });

      polygon.on('mouseover', function(e: L.LeafletEvent) {
        const layer = e.target as L.Polygon;
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0.3,
            weight: 3
          });
        }
      });

      polygon.on('mouseout', function(e: L.LeafletEvent) {
        const layer = e.target as L.Polygon;
        if (!isSelected) {
          layer.setStyle({
            fillOpacity: 0.2,
            weight: 2
          });
        }
      });

      map.addLayer(polygon);
      regionLayersRef.current.push(polygon);
    });

    return () => {
      // Cleanup function
    };
  }, [selectedRegion, mapType, onRegionClick]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg border border-gray-200 shadow-sm"
      />
      
      {selectedRegion && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ 
                backgroundColor: mapType === 'bioregions' 
                  ? (bioregionVectorData[selectedRegion as keyof typeof bioregionVectorData] as any)?.color || '#666'
                  : '#3b82f6'
              }}
            ></div>
            <span className="font-medium text-sm">
              {mapType === 'states' 
                ? (stateVectorData[selectedRegion as keyof typeof stateVectorData] as any)?.name
                : (bioregionVectorData[selectedRegion as keyof typeof bioregionVectorData] as any)?.name
              }
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {mapType === 'bioregions' 
              ? 'Ecological boundary based on natural systems'
              : 'Political administrative boundary'
            }
          </p>
        </div>
      )}
    </div>
  );
}