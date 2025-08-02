import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Heart, 
  TreePine, 
  Users, 
  Globe,
  Info,
  Sparkles
} from 'lucide-react';

interface SmartInfoPanelProps {
  ecoregion: any;
  className?: string;
}

const SmartInfoPanel: React.FC<SmartInfoPanelProps> = ({ ecoregion, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['quick-facts']));
  const [showingAdvanced, setShowingAdvanced] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getThreatLevelColor = (level: string) => {
    if (level.includes('Critical')) return 'text-red-600 bg-red-50';
    if (level.includes('Vulnerable')) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getProtectionProgress = (status: string) => {
    if (status.includes('75-90%')) return 85;
    if (status.includes('50-75%')) return 62;
    if (status.includes('25-50%')) return 37;
    if (status.includes('10-25%')) return 17;
    if (status.includes('5-25%')) return 15;
    return 5;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Essential Info - Always Visible */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('quick-facts')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Essential Facts</h3>
            </div>
            {expandedSections.has('quick-facts') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.has('quick-facts') && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Size</div>
                  <div className="text-lg">{ecoregion.area_km2?.toLocaleString()} km²</div>
                  <div className="text-xs text-gray-500">
                    {ecoregion.area_km2 > 1000000 ? 'Massive ecosystem' : 
                     ecoregion.area_km2 > 100000 ? 'Large ecosystem' : 'Regional ecosystem'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Conservation Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getThreatLevelColor(ecoregion.threatLevel)}`}>
                      {ecoregion.threatLevel}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Protection Level</div>
                  <div className="space-y-2">
                    <Progress value={getProtectionProgress(ecoregion.protectionStatus)} className="h-2" />
                    <div className="text-xs text-gray-600">{ecoregion.protectionStatus} protected</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Location</div>
                  <div className="text-sm">{ecoregion.countries?.slice(0, 2).join(', ')}</div>
                  {ecoregion.countries?.length > 2 && (
                    <div className="text-xs text-gray-500">+{ecoregion.countries.length - 2} more countries</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Why This Matters - Engaging hook */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => toggleSection('why-matters')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Why This Ecosystem Matters</h3>
            </div>
            {expandedSections.has('why-matters') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedSections.has('why-matters') && (
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
              {ecoregion.name === 'Amazon Basin' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-800">🌿 The Lungs of the Earth</div>
                  <div className="text-sm text-green-700">
                    Produces 20% of the world's oxygen and stores massive amounts of carbon that help regulate global climate.
                    Home to 1 in 10 of all species on Earth.
                  </div>
                </div>
              )}
              {ecoregion.name === 'Arctic Tundra' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-blue-800">❄️ Earth's Climate Regulator</div>
                  <div className="text-sm text-blue-700">
                    Acts as Earth's refrigerator, reflecting sunlight and storing vast amounts of carbon in permafrost.
                    Critical for global weather patterns and sea level stability.
                  </div>
                </div>
              )}
              {ecoregion.name === 'Great Barrier Reef Marine Park' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-cyan-800">🐠 Marine Biodiversity Hotspot</div>
                  <div className="text-sm text-cyan-700">
                    Supports 25% of all marine species despite covering less than 1% of ocean area.
                    Protects coastlines and supports millions of livelihoods.
                  </div>
                </div>
              )}
              {ecoregion.name === 'California Central Valley grasslands' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-amber-800">🌾 Agricultural Heartland</div>
                  <div className="text-sm text-amber-700">
                    Produces 25% of America's food supply. Original grasslands supported incredible biodiversity
                    and sophisticated indigenous management systems for thousands of years.
                  </div>
                </div>
              )}
              <div className="mt-3 text-xs text-gray-600">
                Click sections below to learn more about the species, people, and conservation efforts here.
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Smart Progressive Disclosure */}
      <div className="flex gap-2">
        <Button
          variant={showingAdvanced ? "default" : "outline"}
          size="sm"
          onClick={() => setShowingAdvanced(!showingAdvanced)}
          className="flex items-center gap-1"
        >
          <Lightbulb className="w-4 h-4" />
          {showingAdvanced ? 'Show Less' : 'Learn More'}
        </Button>
        {!showingAdvanced && (
          <div className="text-xs text-gray-500 flex items-center">
            Click to explore species, indigenous knowledge & conservation
          </div>
        )}
      </div>

      {/* Advanced Content - Only when requested */}
      {showingAdvanced && (
        <div className="space-y-4">
          {/* Indigenous Knowledge */}
          {ecoregion.indigenousTerritories?.length > 0 && (
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection('indigenous')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold">Indigenous Wisdom</h3>
                    <Badge variant="outline" className="text-xs">
                      {ecoregion.indigenousTerritories.length} groups
                    </Badge>
                  </div>
                  {expandedSections.has('indigenous') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </CardHeader>
              {expandedSections.has('indigenous') && (
                <CardContent>
                  <div className="space-y-4">
                    {ecoregion.indigenousTerritories.slice(0, 2).map((territory: any, index: number) => (
                      <div key={index} className="border-l-4 border-l-amber-400 pl-4">
                        <div className="font-medium text-amber-800">{territory.name}</div>
                        <div className="text-sm text-gray-700 mt-1">{territory.description}</div>
                        <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-2">
                          <div className="text-xs font-medium text-amber-800 mb-1">Traditional Knowledge</div>
                          <div className="text-xs text-amber-700">{territory.traditionalKnowledge}</div>
                        </div>
                      </div>
                    ))}
                    {ecoregion.indigenousTerritories.length > 2 && (
                      <div className="text-xs text-gray-500 italic">
                        +{ecoregion.indigenousTerritories.length - 2} more indigenous groups with traditional knowledge
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Key Species */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection('species')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Notable Species</h3>
                </div>
                {expandedSections.has('species') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CardHeader>
            {expandedSections.has('species') && (
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ecoregion.keySpecies?.map((species: string, index: number) => (
                    <Badge key={index} variant="outline" className="justify-center p-2 text-xs">
                      {species}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* How You Can Help */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Take Action</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="font-medium text-blue-800 mb-1">Support Conservation</div>
                  <div className="text-blue-700 text-xs">Donate to organizations protecting this ecosystem</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="font-medium text-green-800 mb-1">Sustainable Choices</div>
                  <div className="text-green-700 text-xs">Choose products that don't harm these regions</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <div className="font-medium text-purple-800 mb-1">Learn & Share</div>
                  <div className="text-purple-700 text-xs">Spread awareness about this ecosystem's importance</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="font-medium text-amber-800 mb-1">Respect Indigenous Rights</div>
                  <div className="text-amber-700 text-xs">Support indigenous land stewardship efforts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartInfoPanel;