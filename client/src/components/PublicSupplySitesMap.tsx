import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Package, Clock, Phone, Globe, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PublicSupplySite {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  siteHours?: string;
  acceptingDonations: boolean;
  distributingSupplies: boolean;
  siteType: string;
  lastInventoryUpdate?: string;
  inventoryRecency: 'green' | 'yellow' | 'red' | 'gray';
  daysSinceUpdate: number;
}

interface MapLegendProps {
  greenThreshold: number;
  yellowThreshold: number;
}

function MapLegend({ greenThreshold, yellowThreshold }: MapLegendProps) {
  return (
    <Card className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm shadow-xl p-4 max-w-xs">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Inventory Status
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700"></div>
          <span>Updated within {greenThreshold} days</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-700"></div>
          <span>Updated {greenThreshold + 1}-{yellowThreshold} days ago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-700"></div>
          <span>Updated over {yellowThreshold} days ago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-gray-600"></div>
          <span>No recent inventory data</span>
        </div>
      </div>
    </Card>
  );
}

interface Props {
  greenThreshold?: number;
  yellowThreshold?: number;
  embed?: boolean;
}

export default function PublicSupplySitesMap({ 
  greenThreshold = 7, 
  yellowThreshold = 30,
  embed = false 
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);

  // Fetch public supply sites with custom thresholds
  const { data: sites, isLoading, error } = useQuery<PublicSupplySite[]>({
    queryKey: ['/api/supply-sites/public', greenThreshold, yellowThreshold],
    queryFn: async () => {
      const url = `/api/supply-sites/public?greenThreshold=${greenThreshold}&yellowThreshold=${yellowThreshold}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch supply sites');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Center on Western NC (Asheville area) initially
    map.current = L.map(mapContainer.current).setView([35.5951, -82.5515], 9);

    // Use Esri World Imagery for satellite view
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add/update markers when sites data changes
  useEffect(() => {
    if (!map.current || !sites) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter sites with valid coordinates
    const validSites = sites.filter(site => 
      site.latitude && site.longitude && 
      !isNaN(site.latitude) && !isNaN(site.longitude)
    );

    if (validSites.length === 0) {
      console.log('No sites with valid coordinates found');
      return;
    }

    // Create custom icons based on recency
    const getMarkerColor = (recency: string) => {
      switch (recency) {
        case 'green': return '#22c55e'; // green-500
        case 'yellow': return '#eab308'; // yellow-500
        case 'red': return '#ef4444'; // red-500
        default: return '#9ca3af'; // gray-400
      }
    };

    const createCustomIcon = (recency: string) => {
      const color = getMarkerColor(recency);
      const borderColor = recency === 'green' ? '#15803d' : 
                          recency === 'yellow' ? '#a16207' : 
                          recency === 'red' ? '#b91c1c' : '#4b5563';
      
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${color};
            border: 3px solid ${borderColor};
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
    };

    // Add markers for each site
    validSites.forEach(site => {
      const marker = L.marker([site.latitude!, site.longitude!], {
        icon: createCustomIcon(site.inventoryRecency)
      });

      // Format last update date
      const lastUpdate = site.lastInventoryUpdate 
        ? new Date(site.lastInventoryUpdate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        : 'Unknown';

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-[250px]">
          <h3 class="font-bold text-lg mb-2">${site.name}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-start gap-2">
              <svg class="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>${site.address}, ${site.city}, ${site.state}</span>
            </div>
            
            ${site.siteHours ? `
              <div class="flex items-start gap-2">
                <svg class="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>${site.siteHours}</span>
              </div>
            ` : ''}
            
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <span><strong>Type:</strong> ${site.siteType}</span>
            </div>
            
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                ${site.acceptingDonations 
                  ? '<span class="text-green-600 font-medium">✓ Accepting Donations</span>'
                  : '<span class="text-gray-500">Not accepting donations</span>'}
              </div>
              <div class="flex items-center gap-2">
                ${site.distributingSupplies 
                  ? '<span class="text-green-600 font-medium">✓ Distributing Supplies</span>'
                  : '<span class="text-gray-500">Not distributing</span>'}
              </div>
            </div>
            
            <div class="mt-3 pt-2 border-t border-gray-200">
              <div class="flex items-center gap-2 text-xs text-gray-600">
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>Inventory updated: ${lastUpdate}</span>
              </div>
              ${site.daysSinceUpdate < 9999 ? `
                <div class="text-xs text-gray-500 mt-1">
                  (${site.daysSinceUpdate} days ago)
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'supply-site-popup'
      });

      marker.addTo(map.current!);
      markers.current.push(marker);
    });

    // Fit map to show all markers
    if (markers.current.length > 0) {
      const group = L.featureGroup(markers.current);
      map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

  }, [sites]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Map</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-white/80">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Loading supply sites...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: embed ? '400px' : '600px' }}
        data-testid="map-supply-sites"
      />
      
      {!embed && <MapLegend greenThreshold={greenThreshold} yellowThreshold={yellowThreshold} />}
      
      {!isLoading && sites && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm shadow-lg px-3 py-2 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            Showing {sites.length} public supply site{sites.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
