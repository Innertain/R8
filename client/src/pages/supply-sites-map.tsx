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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Public Supply Sites</h1>
            <p className="text-blue-100 text-sm">
              Find food hubs and supply distribution centers near you
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
      <div className="bg-blue-50 border-b border-blue-200 p-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3 text-sm">
            <div className="flex-1">
              <p className="text-gray-700">
                <strong className="text-blue-900">Partnership:</strong> This map is provided in collaboration with Buncombe County HHS and WNC Food Coalition to help residents find food resources during the SNAP funding gap.
              </p>
              <p className="text-gray-600 mt-1 text-xs">
                Colors indicate how recently inventory was updated: <span className="text-green-600 font-medium">Green</span> = Recent, <span className="text-yellow-600 font-medium">Yellow</span> = Moderate, <span className="text-red-600 font-medium">Red</span> = Needs Update
              </p>
            </div>
            <a
              href="https://form.jotform.com/250033214947047"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium whitespace-nowrap"
            >
              Contact Us <ExternalLink className="h-3 w-3" />
            </a>
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
