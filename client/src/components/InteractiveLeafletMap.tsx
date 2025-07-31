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

// Sample data with real coordinates
const disasters: DisasterData[] = [
  {
    id: 1,
    type: "Wildfire",
    location: "Northern California",
    severity: "high",
    activeVolunteers: 245,
    lat: 40.7589,
    lng: -121.8375,
    bioregion: "pacific-northwest-coastal"
  },
  {
    id: 2,
    type: "Flooding", 
    location: "Louisiana",
    severity: "medium",
    activeVolunteers: 89,
    lat: 30.9843,
    lng: -91.9623,
    bioregion: "southeastern-coastal"
  },
  {
    id: 3,
    type: "Hurricane",
    location: "Florida Keys",
    severity: "high", 
    activeVolunteers: 312,
    lat: 24.5557,
    lng: -81.7826,
    bioregion: "southeastern-coastal"
  },
  {
    id: 4,
    type: "Drought",
    location: "Nevada",
    severity: "medium",
    activeVolunteers: 156,
    lat: 39.8283,
    lng: -116.4191,
    bioregion: "great-basin"
  }
];

const activities: ActivityData[] = [
  {
    id: 1,
    type: "Food Distribution",
    location: "Detroit, MI",
    participants: 67,
    lat: 42.3314,
    lng: -83.0458,
    bioregion: "eastern-deciduous"
  },
  {
    id: 2,
    type: "Indigenous Land Restoration",
    location: "Winnipeg, MB",
    participants: 23,
    lat: 49.8951,
    lng: -97.1384,
    bioregion: "boreal-shield"
  },
  {
    id: 3,
    type: "Climate Resilience Workshop",
    location: "Kansas City, MO",
    participants: 145,
    lat: 39.0997,
    lng: -94.5786,
    bioregion: "great-plains"
  },
  {
    id: 4,
    type: "Coastal Protection",
    location: "Portland, OR",
    participants: 89,
    lat: 45.5152,
    lng: -122.6784,
    bioregion: "pacific-northwest-coastal"
  }
];

// Bioregional boundaries (simplified GeoJSON-like data)
const bioregionalBoundaries = {
  "pacific-northwest-coastal": {
    name: "Pacific Northwest Coastal",
    color: "#8FBC8F",
    bounds: [[42, -125], [50, -120]]
  },
  "great-basin": {
    name: "Great Basin", 
    color: "#F4A460",
    bounds: [[35, -120], [42, -110]]
  },
  "great-plains": {
    name: "Great Plains",
    color: "#F0E68C", 
    bounds: [[32, -104], [49, -96]]
  },
  "eastern-deciduous": {
    name: "Eastern Deciduous Forests",
    color: "#90EE90",
    bounds: [[35, -85], [45, -75]]
  },
  "southeastern-coastal": {
    name: "Southeastern Coastal Plain",
    color: "#98FB98",
    bounds: [[25, -95], [35, -75]]
  },
  "boreal-shield": {
    name: "Boreal Shield",
    color: "#DDA0DD", 
    bounds: [[45, -110], [60, -75]]
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

      // Add base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    // Add bioregional overlays if in bioregions view
    if (mapView === "bioregions") {
      Object.entries(bioregionalBoundaries).forEach(([key, region]) => {
        const rectangle = L.rectangle(region.bounds as L.LatLngBoundsExpression, {
          color: region.color,
          fillColor: region.color,
          fillOpacity: 0.3,
          weight: 2
        });
        
        rectangle.bindPopup(`<strong>${region.name}</strong>`);
        rectangle.on('click', () => {
          onRegionClick?.(key, region.name);
        });
        
        map.addLayer(rectangle);
        layersRef.current.push(rectangle as L.Layer);
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