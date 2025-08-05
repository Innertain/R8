import NoaaClimateReports from '@/components/NoaaClimateReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Info } from 'lucide-react';

export default function NoaaClimatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Thermometer className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NOAA Climate Monitoring</h1>
              <p className="text-gray-600 mt-1">
                Real-time climate data and monthly reports from the National Centers for Environmental Information
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
                <h3 className="font-semibold text-blue-900 mb-1">About NOAA Climate Data</h3>
                <p className="text-sm text-blue-800">
                  This dashboard displays official climate monitoring reports from NOAA's National Centers for Environmental Information (NCEI). 
                  Data includes temperature anomalies, drought conditions, wildfire reports, storm tracking, and snow/ice monitoring 
                  from authoritative government sources. Reports are updated monthly and cached for optimal performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 pb-8">
        <NoaaClimateReports />
      </div>
    </div>
  );
}