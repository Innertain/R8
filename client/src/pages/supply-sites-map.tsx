import { useLocation } from 'wouter';
import PublicSupplySitesMap from '@/components/PublicSupplySitesMap';
import { Button } from '@/components/ui/button';
import { Home, ExternalLink, Code, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SupplySitesMapPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Check if we're in embed mode
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';
  
  // Get threshold parameters from URL if provided
  const params = new URLSearchParams(window.location.search);
  const greenThreshold = parseInt(params.get('green') || '7');
  const yellowThreshold = parseInt(params.get('yellow') || '30');

  // Generate embed code
  const embedUrl = `${window.location.origin}/supply-sites-map?embed=true`;
  const embedCode = `<!-- WNC Food Resources Map by R8 -->
<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="WNC Food Resources Map"
></iframe>
<div style="text-align: center; margin-top: 8px; font-size: 12px; color: #666;">
  Powered by <a href="https://www.itsr8.com" target="_blank" rel="noopener" style="color: #059669; text-decoration: none; font-weight: 600;">R8</a>
</div>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Embed code copied!",
      description: "Paste this code into your website to embed the map.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (isEmbed) {
    // Embed mode - minimal UI with R8 attribution
    return (
      <div className="w-full h-screen flex flex-col">
        <div className="flex-1">
          <PublicSupplySitesMap 
            greenThreshold={greenThreshold}
            yellowThreshold={yellowThreshold}
            embed={true}
          />
        </div>
        <div className="bg-white border-t border-gray-200 px-4 py-2 text-center">
          <p className="text-xs text-gray-600">
            Powered by{' '}
            <a 
              href="https://www.itsr8.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-semibold no-underline hover:underline"
              data-testid="link-r8-attribution"
            >
              R8
            </a>
          </p>
        </div>
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
              Is your food hub or distribution center not listed? <a href="https://form.jotform.com/243608573773062" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-900 underline font-medium" data-testid="link-join-network">Contact us to join the network</a>
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

      {/* Footer with embed code feature */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-300 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {!showEmbedCode ? (
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => setShowEmbedCode(true)}
                    variant="outline"
                    className="gap-2 bg-white hover:bg-emerald-50 border-emerald-600 text-emerald-700 hover:text-emerald-800"
                    data-testid="button-show-embed"
                  >
                    <Code className="h-4 w-4" />
                    Embed This Map
                  </Button>
                  <span className="text-xs text-gray-600">
                    Add this map to your website • Data updates every 5 minutes
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Embed Code (includes R8 attribution)</p>
                    <Button 
                      onClick={() => setShowEmbedCode(false)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600"
                      data-testid="button-hide-embed"
                    >
                      Close
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                      <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
                    </div>
                    <Button 
                      onClick={copyEmbedCode}
                      variant="default"
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 shrink-0"
                      data-testid="button-copy-embed"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Code className="h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    This embed code includes a "Powered by R8" attribution with a link to itsr8.com. Please keep this attribution when embedding.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
