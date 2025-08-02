import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, ZoomIn, ZoomOut, RotateCcw, Layers } from 'lucide-react';
import { booleanPointInPolygon, point as createPoint, centroid, bbox } from '../utils/turf-polyfill';
import bioregionData from '../data/sample-bioregions.json';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface InteractiveMapViewProps {
  selectedLocation: {lat: number, lng: number, name: string} | null;
  onBioregionSelect: (bioregion: any | null) => void;
}

const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({ 
  selectedLocation, 
  onBioregionSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const bioregionLayersRef = useRef<L.GeoJSON[]>([]);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedBioregion, setSelectedBioregion] = useState<any | null>(null);
  const [mapStyle, setMapStyle] = useState<'openstreetmap' | 'satellite'>('openstreetmap');

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795], // Geographic center of US
      zoom: 4,
      zoomControl: false,
      attributionControl: true
    });

    // Add custom zoom control
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Load bioregion polygons
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing bioregion layers
    bioregionLayersRef.current.forEach(layer => {
      map.removeLayer(layer);
    });
    bioregionLayersRef.current = [];

    // Add bioregion polygons
    const geoJsonLayer = L.geoJSON(bioregionData as any, {
      style: (feature) => ({
        fillColor: getBiomeColor(feature?.properties?.biome || ''),
        weight: 2,
        opacity: 1,
        color: '#333',
        dashArray: '3',
        fillOpacity: 0.3
      }),
      onEachFeature: (feature, layer) => {
        // Add popup with bioregion info
        const props = feature.properties;
        const popupContent = `
          <div class="max-w-sm">
            <h3 class="font-bold text-lg mb-2">${props.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${props.description}</p>
            <div class="text-xs space-y-1">
              <div><strong>Biome:</strong> ${props.biome}</div>
              <div><strong>Area:</strong> ${props.area_km2?.toLocaleString()} km²</div>
              <div><strong>Population:</strong> ${props.population?.toLocaleString()}</div>
              <div><strong>Status:</strong> ${props.conservationStatus}</div>
            </div>
          </div>
        `;
        layer.bindPopup(popupContent);

        // Add click handler
        layer.on('click', () => {
          setSelectedBioregion(feature.properties);
          onBioregionSelect(feature.properties);
          highlightBioregion(feature);
        });

        // Add hover effects
        layer.on('mouseover', function(this: any) {
          this.setStyle({
            weight: 3,
            fillOpacity: 0.5
          });
        });

        layer.on('mouseout', function(this: any) {
          if (selectedBioregion?.name !== feature.properties.name) {
            this.setStyle({
              weight: 2,
              fillOpacity: 0.3
            });
          }
        });
      }
    });

    geoJsonLayer.addTo(map);
    bioregionLayersRef.current.push(geoJsonLayer);

  }, [selectedBioregion, onBioregionSelect]);

  // Handle location updates
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    const map = mapInstanceRef.current;
    const { lat, lng, name } = selectedLocation;

    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add new marker
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`
      <div class="text-center">
        <h4 class="font-semibold">${name}</h4>
        <p class="text-sm text-gray-600">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
      </div>
    `).openPopup();

    markerRef.current = marker;

    // Pan to location
    map.setView([lat, lng], 8);

    // Find containing bioregion using point-in-polygon
    const pointFeature = createPoint([lng, lat]);
    let foundBioregion = null;

    for (const feature of (bioregionData as any).features) {
      if (booleanPointInPolygon(pointFeature, feature as any)) {
        foundBioregion = feature.properties;
        highlightBioregion(feature);
        break;
      }
    }

    if (foundBioregion) {
      setSelectedBioregion(foundBioregion);
      onBioregionSelect(foundBioregion);
    } else {
      // Clear previous selection if no bioregion found
      clearHighlights();
      setSelectedBioregion(null);
      onBioregionSelect(null);
    }

  }, [selectedLocation, onBioregionSelect]);

  // Get color for biome type
  const getBiomeColor = (biome: string): string => {
    const colors: Record<string, string> = {
      'Temperate Broadleaf & Mixed Forests': '#228B22',
      'Temperate Grasslands, Savannas & Shrublands': '#DAA520',
      'Deserts & Xeric Shrublands': '#CD853F',
      'Mediterranean Forests, Woodlands & Scrub': '#9ACD32',
      'Boreal Forests/Taiga': '#006400',
      'Flooded Grasslands & Savannas': '#4682B4'
    };
    return colors[biome] || '#808080';
  };

  // Highlight selected bioregion
  const highlightBioregion = (feature: any) => {
    if (!mapInstanceRef.current) return;

    bioregionLayersRef.current.forEach(layer => {
      layer.eachLayer((sublayer: L.Layer) => {
        const geoJsonLayer = sublayer as L.GeoJSON & { feature?: any; setStyle?: (style: any) => void };
        if (geoJsonLayer.feature === feature && geoJsonLayer.setStyle) {
          geoJsonLayer.setStyle({
            weight: 4,
            fillOpacity: 0.6,
            color: '#ff6b35'
          });
        } else if (geoJsonLayer.setStyle) {
          geoJsonLayer.setStyle({
            weight: 2,
            fillOpacity: 0.3,
            color: '#333'
          });
        }
      });
    });
  };

  // Clear all highlights
  const clearHighlights = () => {
    bioregionLayersRef.current.forEach(layer => {
      layer.eachLayer((sublayer: L.Layer) => {
        const geoJsonLayer = sublayer as L.GeoJSON & { setStyle?: (style: any) => void };
        if (geoJsonLayer.setStyle) {
          geoJsonLayer.setStyle({
            weight: 2,
            fillOpacity: 0.3,
            color: '#333'
          });
        }
      });
    });
  };

  // Map control functions
  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([39.8283, -98.5795], 4);
      clearHighlights();
      setSelectedBioregion(null);
    }
  };

  const toggleMapStyle = () => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new tile layer based on style
    if (mapStyle === 'openstreetmap') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
        maxZoom: 18
      }).addTo(map);
      setMapStyle('satellite');
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);
      setMapStyle('openstreetmap');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Interactive Bioregion Map
          </h3>
          <div className="flex gap-2">
            <Button onClick={zoomIn} size="sm" variant="outline">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button onClick={zoomOut} size="sm" variant="outline">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button onClick={resetView} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button onClick={toggleMapStyle} size="sm" variant="outline">
              <Layers className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Click on bioregion polygons to explore detailed information. 
          {selectedLocation && (
            <span className="font-medium text-blue-600">
              {' '}📍 Showing location: {selectedLocation.name}
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border border-gray-300 z-0"
            style={{ minHeight: '400px' }}
          />
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-10">
            <h4 className="text-xs font-semibold mb-2">Biome Types</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#228B22' }}></div>
                <span>Temperate Forests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#DAA520' }}></div>
                <span>Grasslands</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#CD853F' }}></div>
                <span>Deserts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#9ACD32' }}></div>
                <span>Mediterranean</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#006400' }}></div>
                <span>Boreal Forest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4682B4' }}></div>
                <span>Wetlands</span>
              </div>
            </div>
          </div>

          {/* Current map style indicator */}
          <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded text-xs font-medium border z-10">
            {mapStyle === 'openstreetmap' ? 'Street Map' : 'Satellite'}
          </div>
        </div>

        {/* Selected bioregion info */}
        {selectedBioregion && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">
              Selected: {selectedBioregion.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Biome:</strong><br />
                <span className="text-gray-600">{selectedBioregion.biome}</span>
              </div>
              <div>
                <strong>Area:</strong><br />
                <span className="text-gray-600">{selectedBioregion.area_km2?.toLocaleString()} km²</span>
              </div>
              <div>
                <strong>Population:</strong><br />
                <span className="text-gray-600">{selectedBioregion.population?.toLocaleString()}</span>
              </div>
              <div>
                <strong>Status:</strong><br />
                <span className="text-gray-600">{selectedBioregion.conservationStatus}</span>
              </div>
            </div>
          </div>
        )}

        {/* Technical features info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">✓ Enhanced Features Active</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
            <div>• React-Leaflet Integration</div>
            <div>• OpenStreetMap + Satellite Tiles</div>
            <div>• GeoJSON Polygon Rendering</div>
            <div>• Point-in-Polygon Analysis</div>
            <div>• Interactive Pan/Zoom</div>
            <div>• Responsive Highlighting</div>
            <div>• Real-time Geocoding</div>
            <div>• Biome-based Color Coding</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMapView;