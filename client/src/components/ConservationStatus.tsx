import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Calendar,
  Users,
  Loader2,
  Info
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ConservationAction {
  action: string;
  organization: string;
  status: string;
  url?: string;
  startDate?: string;
}

interface ConservationStatusData {
  species: string;
  iucnStatus: string;
  populationTrend: string;
  threatCategories: string[];
  conservationActions: ConservationAction[];
  assessmentDate: string;
  generationLength?: number;
}

interface ConservationStatusApiResponse {
  bioregionId: string;
  bioregionName: string;
  conservationStatuses: ConservationStatusData[];
  dataSource: string;
  lastUpdated: string;
}

interface ConservationStatusProps {
  bioregionName: string;
  bioregionId: string;
}

export default function ConservationStatus({ bioregionName, bioregionId }: ConservationStatusProps) {
  const { data: conservationData, isLoading, error } = useQuery<ConservationStatusApiResponse>({
    queryKey: ['/api/species/conservation-status', bioregionId],
    enabled: !!bioregionId,
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CR': return 'bg-red-100 text-red-800 border-red-300';
      case 'EN': return 'bg-red-100 text-red-800 border-red-300';
      case 'VU': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'NT': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LC': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      'CR': 'Critically Endangered',
      'EN': 'Endangered',
      'VU': 'Vulnerable',
      'NT': 'Near Threatened',
      'LC': 'Least Concern',
      'DD': 'Data Deficient',
      'NE': 'Not Evaluated'
    };
    return statusMap[status] || status;
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Minus className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch(trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getActionStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'successful':
      case 'established':
      case 'ongoing': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expanding': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatThreatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Conservation Status Integration</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading conservation status data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !conservationData?.conservationStatuses || conservationData.conservationStatuses.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Conservation Status Integration</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">
              Conservation status data is being compiled for species in {bioregionName}.
            </p>
            <p className="text-sm text-gray-500 mt-1">Check back later for detailed conservation information.</p>
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
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Conservation Status Integration</h3>
            <Badge variant="outline" className="text-blue-600">
              {conservationData?.conservationStatuses?.length || 0} species tracked
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Comprehensive IUCN Red List status, population trends, and active conservation efforts in {bioregionName}
        </p>
      </CardHeader>
      <CardContent>
        {/* Conservation Overview */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-blue-800">Conservation Overview</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white/70 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {conservationData?.conservationStatuses?.filter(s => ['CR', 'EN'].includes(s.iucnStatus)).length || 0}
              </div>
              <div className="text-sm text-red-700">Critically Threatened</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {conservationData?.conservationStatuses?.filter(s => s.iucnStatus === 'VU').length || 0}
              </div>
              <div className="text-sm text-orange-700">Vulnerable</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {conservationData?.conservationStatuses?.filter(s => s.populationTrend === 'increasing').length || 0}
              </div>
              <div className="text-sm text-green-700">Recovering</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {conservationData?.conservationStatuses?.reduce((total, s) => total + s.conservationActions.length, 0) || 0}
              </div>
              <div className="text-sm text-blue-700">Active Projects</div>
            </div>
          </div>
        </div>

        {/* Species Conservation Details */}
        <div className="space-y-6">
          {conservationData?.conservationStatuses?.map((species: ConservationStatusData, index: number) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{species.species}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(species.iucnStatus)}>
                        {species.iucnStatus} - {getStatusName(species.iucnStatus)}
                      </Badge>
                      <div className={`flex items-center gap-1 ${getTrendColor(species.populationTrend)}`}>
                        {getTrendIcon(species.populationTrend)}
                        <span className="text-sm font-medium capitalize">
                          {species.populationTrend} trend
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://www.iucnredlist.org/search?query=${encodeURIComponent(species.species)}`, '_blank')}
                  className="flex items-center gap-1"
                >
                  IUCN Details
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>

              {/* Species Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Assessment Info</h5>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>Last assessed: {new Date(species.assessmentDate).toLocaleDateString()}</span>
                    </div>
                    {species.generationLength && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Info className="w-3 h-3" />
                        <span>Generation length: {species.generationLength} years</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Primary Threats</h5>
                  <div className="flex flex-wrap gap-1">
                    {species.threatCategories.slice(0, 4).map((threat, threatIndex) => (
                      <Badge key={threatIndex} variant="outline" className="text-xs">
                        {formatThreatCategory(threat)}
                      </Badge>
                    ))}
                    {species.threatCategories.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{species.threatCategories.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Conservation Actions */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-green-600" />
                  <h5 className="text-sm font-semibold text-green-800">Active Conservation Efforts</h5>
                </div>
                
                <div className="space-y-2">
                  {species.conservationActions.map((action, actionIndex) => (
                    <div key={actionIndex} className="flex items-start justify-between p-2 bg-white/80 rounded border">
                      <div className="flex items-start gap-2">
                        {getActionStatusIcon(action.status)}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{action.action}</div>
                          <div className="text-xs text-gray-600">
                            by {action.organization} • Since {action.startDate}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {action.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {action.url && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(action.url, '_blank')}
                          className="text-xs"
                        >
                          Learn More
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Conservation Status Guide</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-700">
            <div><strong>CR:</strong> Critically Endangered</div>
            <div><strong>EN:</strong> Endangered</div>
            <div><strong>VU:</strong> Vulnerable</div>
            <div><strong>NT:</strong> Near Threatened</div>
            <div><strong>LC:</strong> Least Concern</div>
            <div><strong>DD:</strong> Data Deficient</div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Data from IUCN Red List and regional conservation authorities. Conservation actions represent ongoing 
            efforts to protect and recover species populations in their natural habitats.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}