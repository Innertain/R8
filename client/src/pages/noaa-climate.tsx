import NoaaClimateReports from '@/components/NoaaClimateReports';
import WeatherEventTracker from '@/components/WeatherEventTracker';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, Info } from 'lucide-react';

export default function NoaaClimatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cloud className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Weather Event Tracker</h1>
              <p className="text-gray-600 mt-1">
                Storm counts, geographic locations, and practical weather event monitoring from NOAA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="container mx-auto px-6 py-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Weather Event Tracking</h3>
                <p className="text-sm text-blue-800">
                  This dashboard focuses on practical weather event monitoring: storm counts, geographic locations where events occurred, 
                  and severity tracking. Instead of complex temperature anomaly analysis, we show simple, understandable data 
                  about weather events and their impacts across different regions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 gap-8">
          <WeatherEventTracker />
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Weather Reports</h2>
            <NoaaClimateReports />
          </div>
        </div>
      </div>
    </div>
  );
}