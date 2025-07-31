import { useEffect, useRef } from "react";
import L from "leaflet";

// Fix for default markers in React/Webpack
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
} catch (e) {
  console.log("Leaflet icon setup:", e);
}

interface DisasterData {
  id: number;
  type: string;
  location: string;
  severity: "high" | "medium" | "low";
  activeVolunteers: number;
  lat: number;
  lng: number;
  bioregion?: string;
}

interface ActivityData {
  id: number;
  type: string;
  location: string;
  participants: number;
  lat: number;
  lng: number;
  bioregion?: string;
}

interface InteractiveLeafletMapProps {
  mapView: "bioregions" | "states" | "counties" | "fema";
  showDisasters: boolean;
  showActivities: boolean;
  onRegionClick?: (regionId: string, regionName: string) => void;
}

// Bioregionally distributed sample data with real coordinates
const disasters: DisasterData[] = [
  {
    id: 1,
    type: "Wildfire",
    location: "Cascade Range, WA",
    severity: "high",
    activeVolunteers: 245,
    lat: 47.7511,
    lng: -121.1533,
    bioregion: "cascade-sierra"
  },
  {
    id: 2,
    type: "Flooding", 
    location: "Louisiana Bayou",
    severity: "medium",
    activeVolunteers: 89,
    lat: 30.9843,
    lng: -91.9623,
    bioregion: "southeastern-coastal"
  },
  {
    id: 3,
    type: "Hurricane",
    location: "Florida Everglades",
    severity: "high", 
    activeVolunteers: 312,
    lat: 25.7617,
    lng: -80.1918,
    bioregion: "southeastern-coastal"
  },
  {
    id: 4,
    type: "Drought",
    location: "Great Basin, NV",
    severity: "medium",
    activeVolunteers: 156,
    lat: 39.8283,
    lng: -116.4191,
    bioregion: "great-basin"
  },
  {
    id: 5,
    type: "Tornado",
    location: "Great Plains, KS",
    severity: "high",
    activeVolunteers: 198,
    lat: 38.5266,
    lng: -96.7265,
    bioregion: "great-plains"
  },
  {
    id: 6,
    type: "Ice Storm",
    location: "Boreal Forest, ON",
    severity: "medium",
    activeVolunteers: 67,
    lat: 51.2538,
    lng: -85.3232,
    bioregion: "boreal-shield"
  }
];

const activities: ActivityData[] = [
  {
    id: 1,
    type: "Salmon Restoration",
    location: "Columbia River, OR",
    participants: 89,
    lat: 45.5152,
    lng: -122.6784,
    bioregion: "pacific-northwest-coastal"
  },
  {
    id: 2,
    type: "Indigenous Land Restoration",
    location: "Boreal Forest, MB",
    participants: 23,
    lat: 53.7609,
    lng: -98.8139,
    bioregion: "boreal-shield"
  },
  {
    id: 3,
    type: "Prairie Conservation",
    location: "Great Plains, ND",
    participants: 145,
    lat: 47.5515,
    lng: -101.0020,
    bioregion: "great-plains"
  },
  {
    id: 4,
    type: "Forest Health Survey",
    location: "Deciduous Forest, OH",
    participants: 67,
    lat: 40.4173,
    lng: -82.9071,
    bioregion: "eastern-deciduous"
  },
  {
    id: 5,
    type: "Desert Wildlife Monitoring",
    location: "Sonoran Desert, AZ",
    participants: 54,
    lat: 33.4484,
    lng: -112.0740,
    bioregion: "sonoran-desert"
  },
  {
    id: 6,
    type: "Wetland Restoration",
    location: "SE Coastal Plain, GA",
    participants: 78,
    lat: 31.5804,
    lng: -84.1557,
    bioregion: "southeastern-coastal"
  }
];

// Detailed bioregional boundaries with natural ecological shapes
const bioregionalBoundaries = {
  "pacific-northwest-coastal": {
    name: "Pacific Northwest Coastal Forests",
    color: "#2D5F3E",
    fillColor: "#4A7C59",
    coordinates: [
      [48.5, -125.0], [49.0, -123.5], [48.8, -121.5], [47.5, -121.0],
      [46.2, -122.5], [45.5, -123.8], [44.0, -124.5], [42.5, -124.3],
      [41.8, -124.0], [41.5, -123.0], [42.0, -122.0], [43.5, -120.5],
      [45.0, -119.0], [46.5, -118.5], [48.0, -119.5], [49.2, -120.8],
      [48.5, -125.0]
    ]
  },
  "cascade-sierra": {
    name: "Cascade-Sierra Mountains",
    color: "#8B4513",
    fillColor: "#CD853F",
    coordinates: [
      [49.0, -121.0], [48.5, -119.5], [47.0, -118.0], [45.5, -117.5],
      [44.0, -118.0], [42.5, -120.0], [40.5, -121.5], [38.0, -119.5],
      [36.5, -118.5], [35.0, -118.0], [34.0, -117.0], [33.5, -116.5],
      [34.5, -115.0], [36.0, -115.5], [38.5, -116.0], [41.0, -117.0],
      [43.0, -116.5], [45.0, -117.0], [47.5, -118.5], [49.0, -121.0]
    ]
  },
  "great-basin": {
    name: "Great Basin Desert",
    color: "#DAA520",
    fillColor: "#F4A460",
    coordinates: [
      [42.0, -120.0], [41.5, -114.0], [40.0, -109.0], [38.5, -109.5],
      [37.0, -114.5], [35.5, -116.0], [36.5, -118.0], [38.0, -119.5],
      [40.0, -121.0], [42.0, -120.0]
    ]
  },
  "great-plains": {
    name: "Great Plains Grasslands",
    color: "#228B22",
    fillColor: "#90EE90",
    coordinates: [
      [49.0, -104.0], [49.0, -96.0], [46.5, -94.5], [44.0, -92.0],
      [41.0, -90.5], [38.5, -94.0], [36.0, -94.5], [33.5, -97.0],
      [32.0, -100.0], [31.5, -103.0], [33.0, -106.0], [36.0, -109.0],
      [39.0, -109.0], [41.5, -104.5], [44.0, -104.0], [47.0, -104.0],
      [49.0, -104.0]
    ]
  },
  "eastern-deciduous": {
    name: "Eastern Deciduous Forests",
    color: "#006400",
    fillColor: "#32CD32",
    coordinates: [
      [47.0, -92.0], [46.0, -84.0], [45.5, -75.0], [44.0, -67.0],
      [41.0, -69.0], [39.0, -75.5], [37.5, -82.0], [35.0, -84.5],
      [33.5, -87.5], [35.0, -91.0], [37.0, -94.0], [40.0, -90.5],
      [43.0, -89.0], [46.0, -90.5], [47.0, -92.0]
    ]
  },
  "southeastern-coastal": {
    name: "Southeastern Coastal Plain",
    color: "#228B22",
    fillColor: "#98FB98",
    coordinates: [
      [36.5, -84.0], [35.5, -75.5], [33.0, -78.5], [31.0, -81.0],
      [28.5, -82.5], [25.5, -80.0], [25.0, -81.5], [26.0, -82.0],
      [29.0, -84.0], [31.0, -87.0], [33.0, -88.0], [35.0, -85.5],
      [36.5, -84.0]
    ]
  },
  "boreal-shield": {
    name: "Boreal Shield & Taiga",
    color: "#483D8B",
    fillColor: "#9370DB",
    coordinates: [
      [60.0, -141.0], [60.0, -52.0], [52.0, -55.0], [48.0, -60.0],
      [46.0, -75.0], [47.0, -90.0], [49.0, -95.0], [52.0, -106.0],
      [55.0, -120.0], [58.0, -135.0], [60.0, -141.0]
    ]
  },
  "arctic-tundra": {
    name: "Arctic Tundra",
    color: "#4B0082",
    fillColor: "#E6E6FA",
    coordinates: [
      [69.0, -141.0], [69.0, -52.0], [60.0, -52.0], [60.0, -141.0], [69.0, -141.0]
    ]
  },
  "sonoran-desert": {
    name: "Sonoran Desert",
    color: "#CD853F",
    fillColor: "#DEB887",
    coordinates: [
      [34.0, -117.0], [32.5, -114.5], [31.0, -111.0], [29.5, -108.5],
      [31.0, -106.0], [33.0, -108.0], [34.5, -114.0], [34.0, -117.0]
    ]
  }
};

export default function InteractiveLeafletMap({ 
  mapView, 
  showDisasters, 
  showActivities, 
  onRegionClick 
}: InteractiveLeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [45, -100], // Center on North America
        zoom: 4,
        minZoom: 3,
        maxZoom: 10
      });

      // Add base layer - use different styles based on map view
      const baseLayer = mapView === "bioregions" 
        ? L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            maxZoom: 18
          })
        : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          });
      
      baseLayer.addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    // Add bioregional overlays with natural boundaries
    if (mapView === "bioregions") {
      Object.entries(bioregionalBoundaries).forEach(([key, region]) => {
        const polygon = L.polygon(region.coordinates as L.LatLngExpression[], {
          color: region.color,
          fillColor: region.fillColor,
          fillOpacity: 0.4,
          weight: 2,
          opacity: 0.8
        });
        
        polygon.bindPopup(`
          <div class="p-3">
            <h3 class="font-bold text-lg">${region.name}</h3>
            <p class="text-sm text-gray-600">Click to explore this bioregion</p>
          </div>
        `);
        
        polygon.on('click', () => {
          onRegionClick?.(key, region.name);
        });
        
        polygon.on('mouseover', function(e: L.LeafletEvent) {
          const layer = e.target as L.Polygon;
          layer.setStyle({
            fillOpacity: 0.6,
            weight: 3
          });
        });
        
        polygon.on('mouseout', function(e: L.LeafletEvent) {
          const layer = e.target as L.Polygon;
          layer.setStyle({
            fillOpacity: 0.4,
            weight: 2
          });
        });
        
        map.addLayer(polygon);
        layersRef.current.push(polygon as L.Layer);
      });
    }

    // Add FEMA regions
    if (mapView === "fema") {
      const femaRegions = [
        { name: "FEMA Region I", bounds: [[41, -73], [47, -66]], color: "#3b82f6" },
        { name: "FEMA Region VI", bounds: [[25, -106], [37, -88]], color: "#10b981" },
        { name: "FEMA Region IX", bounds: [[32, -125], [42, -114]], color: "#f59e0b" },
        { name: "FEMA Region X", bounds: [[42, -125], [49, -110]], color: "#ef4444" }
      ];

      femaRegions.forEach((region, index) => {
        const rectangle = L.rectangle(region.bounds as L.LatLngBoundsExpression, {
          color: region.color,
          fillColor: region.color,
          fillOpacity: 0.2,
          weight: 2,
          dashArray: "10, 10"
        });
        
        rectangle.bindPopup(`<strong>${region.name}</strong>`);
        rectangle.on('click', () => {
          onRegionClick?.(`fema-${index + 1}`, region.name);
        });
        
        map.addLayer(rectangle);
        layersRef.current.push(rectangle as L.Layer);
      });
    }

    // Add disaster markers
    if (showDisasters) {
      disasters.forEach(disaster => {
        const getSeverityColor = (severity: string) => {
          switch (severity) {
            case "high": return "#ef4444";
            case "medium": return "#f59e0b"; 
            case "low": return "#10b981";
            default: return "#6b7280";
          }
        };

        const marker = L.circleMarker([disaster.lat, disaster.lng], {
          color: getSeverityColor(disaster.severity),
          fillColor: getSeverityColor(disaster.severity),
          fillOpacity: 0.8,
          radius: disaster.severity === "high" ? 12 : disaster.severity === "medium" ? 8 : 6,
          weight: 2
        });

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-red-600">${disaster.type}</h3>
            <p class="text-sm">${disaster.location}</p>
            <p class="text-xs text-gray-600">Severity: ${disaster.severity}</p>
            <p class="text-xs text-gray-600">${disaster.activeVolunteers} active volunteers</p>
          </div>
        `);

        map.addLayer(marker);
        layersRef.current.push(marker as L.Layer);
      });
    }

    // Add activity markers
    if (showActivities) {
      activities.forEach(activity => {
        const marker = L.marker([activity.lat, activity.lng], {
          icon: L.divIcon({
            className: 'custom-activity-marker',
            html: `<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 2px; border: 2px solid white;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        });

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-blue-600">${activity.type}</h3>
            <p class="text-sm">${activity.location}</p>
            <p class="text-xs text-gray-600">${activity.participants} participants</p>
          </div>
        `);

        map.addLayer(marker);
        layersRef.current.push(marker as L.Layer);
      });
    }

    return () => {
      // Cleanup on unmount
      layersRef.current.forEach(layer => map.removeLayer(layer));
    };
  }, [mapView, showDisasters, showActivities, onRegionClick]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: "400px" }}
    />
  );
}