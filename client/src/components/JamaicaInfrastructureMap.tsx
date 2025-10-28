import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Activity, Building2, Plane, Anchor, Heart, Home, Layers, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Jamaica center coordinates
const JAMAICA_CENTER: [number, number] = [-77.3, 18.15];
const JAMAICA_ZOOM = 8.5;

interface LayerToggleProps {
  layers: {
    hospitals: boolean;
    shelters: boolean;
    airports: boolean;
    ports: boolean;
    roads: boolean;
  };
  toggleLayer: (layer: keyof typeof layers) => void;
  counts: {
    hospitals: number;
    shelters: number;
    airports: number;
    ports: number;
  };
}

function LayerControls({ layers, toggleLayer, counts }: LayerToggleProps) {
  return (
    <Card className="absolute top-4 right-4 z-10 p-4 bg-white/95 backdrop-blur-sm shadow-xl max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Infrastructure Layers
        </h3>
      </div>
      <div className="space-y-2">
        <button
          onClick={() => toggleLayer('hospitals')}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
            layers.hospitals 
              ? 'bg-red-50 border-2 border-red-300' 
              : 'bg-gray-50 border-2 border-gray-200 opacity-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className={`h-4 w-4 ${layers.hospitals ? 'text-red-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${layers.hospitals ? 'text-red-700' : 'text-gray-500'}`}>
              Hospitals & Clinics
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {counts.hospitals}
          </Badge>
        </button>

        <button
          onClick={() => toggleLayer('shelters')}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
            layers.shelters 
              ? 'bg-blue-50 border-2 border-blue-300' 
              : 'bg-gray-50 border-2 border-gray-200 opacity-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Home className={`h-4 w-4 ${layers.shelters ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${layers.shelters ? 'text-blue-700' : 'text-gray-500'}`}>
              Emergency Shelters
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {counts.shelters}
          </Badge>
        </button>

        <button
          onClick={() => toggleLayer('airports')}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
            layers.airports 
              ? 'bg-purple-50 border-2 border-purple-300' 
              : 'bg-gray-50 border-2 border-gray-200 opacity-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Plane className={`h-4 w-4 ${layers.airports ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${layers.airports ? 'text-purple-700' : 'text-gray-500'}`}>
              Airports & Helipads
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {counts.airports}
          </Badge>
        </button>

        <button
          onClick={() => toggleLayer('ports')}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
            layers.ports 
              ? 'bg-cyan-50 border-2 border-cyan-300' 
              : 'bg-gray-50 border-2 border-gray-200 opacity-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Anchor className={`h-4 w-4 ${layers.ports ? 'text-cyan-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${layers.ports ? 'text-cyan-700' : 'text-gray-500'}`}>
              Ports & Harbors
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {counts.ports}
          </Badge>
        </button>

        <button
          onClick={() => toggleLayer('roads')}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
            layers.roads 
              ? 'bg-gray-100 border-2 border-gray-400' 
              : 'bg-gray-50 border-2 border-gray-200 opacity-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className={`h-4 w-4 ${layers.roads ? 'text-gray-700' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${layers.roads ? 'text-gray-800' : 'text-gray-500'}`}>
              Major Roads
            </span>
          </div>
        </button>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3" />
          <span>Data from OpenStreetMap</span>
        </div>
      </div>
    </Card>
  );
}

export default function JamaicaInfrastructureMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [layers, setLayers] = useState({
    hospitals: true,
    shelters: true,
    airports: true,
    ports: true,
    roads: true
  });

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Fetch infrastructure data
  const { data: hospitals, isLoading: hospitalsLoading } = useQuery({
    queryKey: ['/api/jamaica/hospitals'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: shelters, isLoading: sheltersLoading } = useQuery({
    queryKey: ['/api/jamaica/shelters'],
    staleTime: 60 * 60 * 1000,
  });

  const { data: airports, isLoading: airportsLoading } = useQuery({
    queryKey: ['/api/jamaica/airports'],
    staleTime: 60 * 60 * 1000,
  });

  const { data: ports, isLoading: portsLoading } = useQuery({
    queryKey: ['/api/jamaica/ports'],
    staleTime: 60 * 60 * 1000,
  });

  const { data: roads, isLoading: roadsLoading } = useQuery({
    queryKey: ['/api/jamaica/roads'],
    staleTime: 60 * 60 * 1000,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: JAMAICA_CENTER,
      zoom: JAMAICA_ZOOM,
      attributionControl: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add data layers to map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Add hospitals
    if (hospitals && !map.current.getSource('hospitals')) {
      map.current.addSource('hospitals', {
        type: 'geojson',
        data: hospitals
      });

      map.current.addLayer({
        id: 'hospitals-layer',
        type: 'circle',
        source: 'hospitals',
        paint: {
          'circle-radius': 8,
          'circle-color': '#dc2626',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add click handler for hospitals
      map.current.on('click', 'hospitals-layer', (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <div class="flex items-center gap-2 mb-1">
                  <svg class="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <strong class="text-red-700">Hospital</strong>
                </div>
                <p class="text-sm font-medium">${feature.properties.name || 'Unknown'}</p>
                ${feature.properties.amenity ? `<p class="text-xs text-gray-600">Type: ${feature.properties.amenity}</p>` : ''}
              </div>
            `)
            .addTo(map.current!);
        }
      });

      map.current.on('mouseenter', 'hospitals-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'hospitals-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }

    // Add shelters
    if (shelters && !map.current.getSource('shelters')) {
      map.current.addSource('shelters', {
        type: 'geojson',
        data: shelters
      });

      map.current.addLayer({
        id: 'shelters-layer',
        type: 'circle',
        source: 'shelters',
        paint: {
          'circle-radius': 7,
          'circle-color': '#2563eb',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.current.on('click', 'shelters-layer', (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <div class="flex items-center gap-2 mb-1">
                  <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  <strong class="text-blue-700">Shelter</strong>
                </div>
                <p class="text-sm font-medium">${feature.properties.name || 'Community Center'}</p>
                ${feature.properties.amenity ? `<p class="text-xs text-gray-600">Type: ${feature.properties.amenity}</p>` : ''}
              </div>
            `)
            .addTo(map.current!);
        }
      });

      map.current.on('mouseenter', 'shelters-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'shelters-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }

    // Add airports
    if (airports && !map.current.getSource('airports')) {
      map.current.addSource('airports', {
        type: 'geojson',
        data: airports
      });

      map.current.addLayer({
        id: 'airports-layer',
        type: 'circle',
        source: 'airports',
        paint: {
          'circle-radius': 10,
          'circle-color': '#9333ea',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.current.on('click', 'airports-layer', (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <div class="flex items-center gap-2 mb-1">
                  <svg class="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                  </svg>
                  <strong class="text-purple-700">Airport/Helipad</strong>
                </div>
                <p class="text-sm font-medium">${feature.properties.name || 'Aviation Facility'}</p>
                ${feature.properties.aeroway ? `<p class="text-xs text-gray-600">Type: ${feature.properties.aeroway}</p>` : ''}
              </div>
            `)
            .addTo(map.current!);
        }
      });

      map.current.on('mouseenter', 'airports-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'airports-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }

    // Add ports
    if (ports && !map.current.getSource('ports')) {
      map.current.addSource('ports', {
        type: 'geojson',
        data: ports
      });

      map.current.addLayer({
        id: 'ports-layer',
        type: 'circle',
        source: 'ports',
        paint: {
          'circle-radius': 9,
          'circle-color': '#0891b2',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.current.on('click', 'ports-layer', (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <div class="flex items-center gap-2 mb-1">
                  <svg class="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                  </svg>
                  <strong class="text-cyan-700">Port/Harbor</strong>
                </div>
                <p class="text-sm font-medium">${feature.properties.name || 'Maritime Facility'}</p>
              </div>
            `)
            .addTo(map.current!);
        }
      });

      map.current.on('mouseenter', 'ports-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'ports-layer', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }

    // Add roads
    if (roads && !map.current.getSource('roads')) {
      map.current.addSource('roads', {
        type: 'geojson',
        data: roads
      });

      map.current.addLayer({
        id: 'roads-layer',
        type: 'line',
        source: 'roads',
        paint: {
          'line-color': '#374151',
          'line-width': 2,
          'line-opacity': 0.6
        }
      });
    }
  }, [mapLoaded, hospitals, shelters, airports, ports, roads]);

  // Toggle layer visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (map.current.getLayer('hospitals-layer')) {
      map.current.setLayoutProperty('hospitals-layer', 'visibility', layers.hospitals ? 'visible' : 'none');
    }
    if (map.current.getLayer('shelters-layer')) {
      map.current.setLayoutProperty('shelters-layer', 'visibility', layers.shelters ? 'visible' : 'none');
    }
    if (map.current.getLayer('airports-layer')) {
      map.current.setLayoutProperty('airports-layer', 'visibility', layers.airports ? 'visible' : 'none');
    }
    if (map.current.getLayer('ports-layer')) {
      map.current.setLayoutProperty('ports-layer', 'visibility', layers.ports ? 'visible' : 'none');
    }
    if (map.current.getLayer('roads-layer')) {
      map.current.setLayoutProperty('roads-layer', 'visibility', layers.roads ? 'visible' : 'none');
    }
  }, [layers, mapLoaded]);

  const isLoading = hospitalsLoading || sheltersLoading || airportsLoading || portsLoading || roadsLoading;

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" data-testid="map-container" />
      
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-700">Loading Jamaica infrastructure...</p>
          </div>
        </div>
      )}

      <LayerControls 
        layers={layers} 
        toggleLayer={toggleLayer} 
        counts={{
          hospitals: hospitals?.features?.length || 0,
          shelters: shelters?.features?.length || 0,
          airports: airports?.features?.length || 0,
          ports: ports?.features?.length || 0
        }}
      />
    </div>
  );
}
