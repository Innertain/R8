import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  Search, 
  Navigation, 
  Zap, 
  Palette, 
  Smartphone, 
  Globe,
  BarChart3,
  Camera,
  Calendar,
  Star,
  PlayCircle,
  Download,
  Filter,
  Eye,
  Users
} from 'lucide-react';

const UserExperienceEnhancements: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('mapping');

  const mappingEnhancements = [
    {
      title: "Progressive Detail Disclosure",
      description: "Show information based on zoom level - regions at world view, species at local view",
      icon: <Eye className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "High",
      timeframe: "2-3 weeks"
    },
    {
      title: "Multi-Scale Visualization Framework",
      description: "4-level hierarchy: Realms → Subrealms → Bioregions → Ecoregions (15→52→185→844)",
      icon: <Map className="w-4 h-4" />,
      difficulty: "High",
      impact: "High",
      timeframe: "4-5 weeks"
    },
    {
      title: "Smart Tooltips & Rich Hover",
      description: "Species photos, climate graphs, conservation status on hover",
      icon: <Globe className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "High",
      timeframe: "1-2 weeks"
    },
    {
      title: "Comparison Mode",
      description: "Side-by-side bioregion comparison with species, climate, and threat analysis",
      icon: <BarChart3 className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "Medium",
      timeframe: "2-3 weeks"
    }
  ];

  const searchNavEnhancements = [
    {
      title: "Intelligent Search System",
      description: "Auto-complete for species names, places, ecological features with fuzzy matching",
      icon: <Search className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "High",
      timeframe: "2-3 weeks"
    },
    {
      title: "Bookmark & Favorites",
      description: "Save and organize favorite locations, species, and bioregions",
      icon: <Star className="w-4 h-4" />,
      difficulty: "Low",
      impact: "Medium",
      timeframe: "1 week"
    },
    {
      title: "Guided Tour Mode",
      description: "Interactive walkthrough of different biomes and key species",
      icon: <PlayCircle className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "High",
      timeframe: "3-4 weeks"
    },
    {
      title: "Advanced Filtering",
      description: "Filter by threat level, species count, climate zone, protection status",
      icon: <Filter className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "Medium",
      timeframe: "2 weeks"
    }
  ];

  const visualEnhancements = [
    {
      title: "Species Spotlight Features",
      description: "Featured species with photos, sounds, behavior videos, and range maps",
      icon: <Camera className="w-4 h-4" />,
      difficulty: "High",
      impact: "High",
      timeframe: "4-5 weeks"
    },
    {
      title: "Seasonal Changes Visualization",
      description: "Time slider showing migration patterns, breeding seasons, vegetation changes",
      icon: <Calendar className="w-4 h-4" />,
      difficulty: "High",
      impact: "High",
      timeframe: "5-6 weeks"
    },
    {
      title: "Conservation Success Stories",
      description: "Interactive stories of restoration projects and species recovery",
      icon: <Users className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "Medium",
      timeframe: "3-4 weeks"
    },
    {
      title: "Climate Impact Overlays",
      description: "Historical trends and future projections with temperature/precipitation changes",
      icon: <Zap className="w-4 h-4" />,
      difficulty: "High",
      impact: "High",
      timeframe: "4-5 weeks"
    }
  ];

  const mobileEnhancements = [
    {
      title: "Touch-Optimized Interface",
      description: "Larger tap targets, swipe gestures, pinch-to-zoom improvements",
      icon: <Smartphone className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "High",
      timeframe: "2-3 weeks"
    },
    {
      title: "Offline Mode Support",
      description: "Cache bioregion data for offline exploration",
      icon: <Download className="w-4 h-4" />,
      difficulty: "High",
      impact: "Medium",
      timeframe: "4-5 weeks"
    },
    {
      title: "Location-Based Discovery",
      description: "GPS integration to show nearby bioregions and species",
      icon: <Navigation className="w-4 h-4" />,
      difficulty: "Medium",
      impact: "High",
      timeframe: "2-3 weeks"
    },
    {
      title: "Simplified Mobile Layout",
      description: "Collapsible panels, bottom sheets, streamlined navigation",
      icon: <Palette className="w-4 h-4" />,
      difficulty: "Low",
      impact: "High",
      timeframe: "1-2 weeks"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-purple-100 text-purple-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEnhancements = (enhancements: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {enhancements.map((enhancement, index) => (
        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3 mb-3">
            {enhancement.icon}
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{enhancement.title}</h4>
              <p className="text-xs text-gray-600 mb-3">{enhancement.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={`text-xs ${getDifficultyColor(enhancement.difficulty)}`}>
                  {enhancement.difficulty}
                </Badge>
                <Badge className={`text-xs ${getImpactColor(enhancement.impact)}`}>
                  {enhancement.impact} Impact
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {enhancement.timeframe}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5" />
          User Experience Enhancement Roadmap
        </h3>
        <p className="text-gray-600">
          Comprehensive improvements to make the bioregion platform more engaging and accessible
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="mapping" className="text-xs">
              <Map className="w-4 h-4 mr-1" />
              Interactive Maps
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs">
              <Search className="w-4 h-4 mr-1" />
              Search & Nav
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs">
              <Eye className="w-4 h-4 mr-1" />
              Visualizations
            </TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs">
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile UX
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mapping" className="space-y-4">
            <div className="mb-4">
              <h4 className="font-semibold text-green-800 mb-2">🗺️ Interactive Mapping Enhancements</h4>
              <p className="text-sm text-gray-600">
                Improvements to make the map more intuitive and informative at different zoom levels
              </p>
            </div>
            {renderEnhancements(mappingEnhancements)}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">🔍 Search & Navigation Improvements</h4>
              <p className="text-sm text-gray-600">
                Enhanced discovery and navigation tools for exploring bioregions efficiently
              </p>
            </div>
            {renderEnhancements(searchNavEnhancements)}
          </TabsContent>

          <TabsContent value="visual" className="space-y-4">
            <div className="mb-4">
              <h4 className="font-semibold text-purple-800 mb-2">🎨 Visual & Storytelling Features</h4>
              <p className="text-sm text-gray-600">
                Rich media and storytelling elements to make ecological data more engaging
              </p>
            </div>
            {renderEnhancements(visualEnhancements)}
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <div className="mb-4">
              <h4 className="font-semibold text-orange-800 mb-2">📱 Mobile & Accessibility Enhancements</h4>
              <p className="text-sm text-gray-600">
                Mobile-first improvements for on-the-go bioregion exploration
              </p>
            </div>
            {renderEnhancements(mobileEnhancements)}
          </TabsContent>
        </Tabs>

        {/* Implementation Timeline */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3">🎯 Recommended Implementation Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-blue-700 mb-2">Phase 1: Quick Wins (1-4 weeks)</div>
              <div className="space-y-1 text-xs">
                <div>• Bookmark system</div>
                <div>• Smart tooltips</div>
                <div>• Mobile layout improvements</div>
                <div>• Advanced filtering</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-purple-700 mb-2">Phase 2: Core Features (2-8 weeks)</div>
              <div className="space-y-1 text-xs">
                <div>• Progressive detail disclosure</div>
                <div>• Intelligent search</div>
                <div>• Comparison mode</div>
                <div>• Touch optimization</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-700 mb-2">Phase 3: Advanced (4-12 weeks)</div>
              <div className="space-y-1 text-xs">
                <div>• Multi-scale visualization</div>
                <div>• Species spotlight features</div>
                <div>• Seasonal changes</div>
                <div>• Climate impact overlays</div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">📊 Expected Success Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">60%</div>
              <div className="text-xs text-gray-600">Increased Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">40%</div>
              <div className="text-xs text-gray-600">Better Mobile Usage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">75%</div>
              <div className="text-xs text-gray-600">Improved Discovery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">50%</div>
              <div className="text-xs text-gray-600">Reduced Bounce Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserExperienceEnhancements;