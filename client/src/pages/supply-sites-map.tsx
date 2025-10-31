import { useLocation } from 'wouter';
import PublicSupplySitesMap from '@/components/PublicSupplySitesMap';
import { Button } from '@/components/ui/button';
import { Home, ExternalLink } from 'lucide-react';

export default function SupplySitesMapPage() {
  const [, setLocation] = useLocation();
  
  // Check if we're in embed mode
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';
  
  // Get threshold parameters from URL if provided
  const params = new URLSearchParams(window.location.search);
  const greenThreshold = parseInt(params.get('green') || '7');
  const yellowThreshold = parseInt(params.get('yellow') || '30');

  if (isEmbed) {
    // Embed mode - minimal UI, just the map
    return (
      <div className="w-full h-screen">
        <PublicSupplySitesMap 
          greenThreshold={greenThreshold}
          yellowThreshold={yellowThreshold}
          embed={true}
        />
      </div>
    );
  }

  // Regular mode - full page with header
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">WNC Food Resources Map</h1>
            <p className="text-emerald-100 text-sm">
              Food hubs and supply distribution centers for Western North Carolina
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setLocation('/')}
            className="gap-2"
            data-testid="button-home"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-emerald-50 border-b border-emerald-200 p-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="flex-1">
              <p className="text-gray-700">
                <strong className="text-emerald-900">Coordinated by:</strong> R4 Reach, Valley Hope Foundation, WNC supply Sites, and mutual aid partners supporting Hurricane Helene recovery and SNAP funding gap relief.
              </p>
              <p className="text-gray-600 mt-2 text-xs">
                <strong>Map Legend:</strong> Colors show inventory recency: <span className="text-green-600 font-medium">Green</span> = ≤7 days, <span className="text-yellow-600 font-medium">Yellow</span> = 8-30 days, <span className="text-red-600 font-medium">Red</span> = {'>'}30 days, <span className="text-gray-600 font-medium">Gray</span> = No data
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> This map shows only food hubs that have signed up with our network. It is not all-inclusive of food resources in Western North Carolina.
            </p>
            <p className="text-xs text-yellow-800 mt-2">
              Is your food hub or distribution center not listed? <a href="https://form.jotform.com/250033214947047" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 underline font-medium">Contact us to join the network</a>
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <PublicSupplySitesMap 
          greenThreshold={greenThreshold}
          yellowThreshold={yellowThreshold}
          embed={false}
        />
      </div>

      {/* Footer with embed instructions */}
      <div className="bg-gray-100 border-t border-gray-300 p-3">
        <div className="max-w-7xl mx-auto text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <strong>For organizations:</strong> This map is embeddable. Add{' '}
              <code className="bg-gray-200 px-1 py-0.5 rounded">?embed=true</code> to the URL to use in an iframe.
            </div>
            <div className="text-gray-500">
              Data updates every 5 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
