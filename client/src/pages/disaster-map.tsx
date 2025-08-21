import React from 'react';
import DisasterMapWithUI from '@/components/DisasterMapWithUI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  Globe,
  Zap,
  CloudRain,
  Flame
} from 'lucide-react';

const DisasterMapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stormy-dark via-stormy-medium to-stormy-dark">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Interactive Disaster Response Map
              </h1>
              <p className="text-gray-300 text-lg max-w-3xl">
                Real-time visualization of weather alerts, federal disasters, supply sites, wildfire incidents, 
                and earthquake activity across the United States.
              </p>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/30">
              <Activity className="w-4 h-4 mr-1" />
              Live Data
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Weather Alerts</span>
              </div>
              <div className="text-2xl font-bold text-white">247</div>
              <div className="text-xs text-gray-400">Active warnings</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">FEMA Disasters</span>
              </div>
              <div className="text-2xl font-bold text-white">18</div>
              <div className="text-xs text-gray-400">Federal declarations</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-300">Wildfires</span>
              </div>
              <div className="text-2xl font-bold text-white">32</div>
              <div className="text-xs text-gray-400">Active incidents</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Supply Sites</span>
              </div>
              <div className="text-2xl font-bold text-white">425+</div>
              <div className="text-xs text-gray-400">Distribution points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 h-[calc(100vh-200px)]">
        <DisasterMapWithUI />
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Data from FEMA, NWS, USGS, InciWeb</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Updated every 15 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Real-time visualization</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterMapPage;