import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Thermometer,
  TrendingDown,
  AlertTriangle,
  Calendar,
  MapPin,
  ExternalLink,
  Info,
  Clock,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ClimateRefugeeData {
  species: string;
  lastSeenYear: number;
  disappearanceReason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
}

interface ClimateRefugeesApiResponse {
  bioregionId: string;
  bioregionName: string;
  climateRefugees: ClimateRefugeeData[];
  dataSource: string;
  lastUpdated: string;
}

interface ClimateRefugeesProps {
  bioregionName: string;
  bioregionId: string;
}

export default function ClimateRefugees({ bioregionName, bioregionId }: ClimateRefugeesProps) {
  const { data: climateData, isLoading, error } = useQuery<ClimateRefugeesApiResponse>({
    queryKey: ['/api/species/climate-refugees', bioregionId],
    enabled: !!bioregionId,
  });

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Thermometer className="w-4 h-4 text-yellow-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActionMessage = (severity: string) => {
    switch(severity) {
      case 'critical': return 'Urgent conservation action needed - possible local extinction';
      case 'high': return 'Immediate habitat protection and restoration required';
      case 'medium': return 'Enhanced monitoring and conservation efforts recommended';
      default: return 'Continue monitoring population trends';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold">Climate Refugees</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-red-600 mr-2" />
            <span className="text-gray-600">Analyzing climate impact data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !climateData?.climateRefugees || climateData.climateRefugees.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold">Climate Refugees</h3>
          </div>
          <p className="text-sm text-gray-600">
            Species that have disappeared or declined significantly due to climate change
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-800 mb-2">Good News!</h4>
              <p className="text-green-700">
                No significant climate refugee patterns detected in {bioregionName}. 
                This suggests species populations are currently stable despite climate pressures.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold">Climate Refugees</h3>
            <Badge variant="outline" className="text-red-600">
              {climateData?.climateRefugees?.length || 0} species at risk
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Species experiencing significant population declines potentially linked to climate change in {bioregionName}
        </p>
      </CardHeader>
      <CardContent>
        {/* Climate Impact Overview */}
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="text-lg font-semibold text-red-800">Climate Change Impact Assessment</h4>
          </div>
          <p className="text-sm text-red-700 mb-4">
            Using 30 years of observation data from GBIF, we've identified species showing concerning population 
            declines that may be linked to changing climate conditions. These "climate refugees" require immediate attention.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/70 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {climateData?.climateRefugees?.filter((r: ClimateRefugeeData) => r.severity === 'critical').length || 0}
              </div>
              <div className="text-sm text-red-700">Critical Risk</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {climateData?.climateRefugees?.filter((r: ClimateRefugeeData) => r.severity === 'high').length || 0}
              </div>
              <div className="text-sm text-orange-700">High Risk</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {climateData?.climateRefugees?.filter((r: ClimateRefugeeData) => r.severity === 'medium').length || 0}
              </div>
              <div className="text-sm text-yellow-700">Medium Risk</div>
            </div>
          </div>
        </div>

        {/* Climate Refugee Species List */}
        <div className="space-y-4">
          {climateData?.climateRefugees?.map((refugee: ClimateRefugeeData, index: number) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(refugee.severity)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{refugee.species}</h4>
                    <Badge className={`mt-1 ${getSeverityColor(refugee.severity)}`}>
                      {refugee.severity.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://www.gbif.org/species/search?q=${encodeURIComponent(refugee.species)}`, '_blank')}
                  className="flex items-center gap-1"
                >
                  View Data
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-3 h-3" />
                  <span>Last recorded observation: {refugee.lastSeenYear}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{refugee.disappearanceReason}</span>
                </div>
              </div>

              {/* Evidence Data */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Population Evidence:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {refugee.evidence.map((evidence, evidenceIndex) => (
                    <li key={evidenceIndex} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      {evidence}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Required */}
              <div className={`p-3 rounded-lg border ${
                refugee.severity === 'critical' ? 'bg-red-50 border-red-200' :
                refugee.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                refugee.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-800">Recommended Action:</span>
                </div>
                <p className="text-xs text-gray-700">
                  {getActionMessage(refugee.severity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Understanding Climate Refugees</span>
          </div>
          <p className="text-xs text-blue-700">
            Climate refugees are species experiencing significant population declines that may be linked to changing 
            environmental conditions. This analysis uses historical occurrence data to identify species that have 
            disappeared from their traditional ranges or show concerning population trends. Early detection enables 
            targeted conservation efforts before species reach critical endangerment levels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}