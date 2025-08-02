import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSpeciesCacheStatus } from '@/hooks/useSpeciesData';
import { queryClient } from '@/lib/queryClient';

export default function SpeciesCacheStatus() {
  const { data: cacheStatus, isLoading, refetch } = useSpeciesCacheStatus();

  const refreshCache = async (bioregionId: string) => {
    try {
      const response = await fetch(`/api/species/refresh-cache/${bioregionId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Invalidate related queries to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['/api/species/bioregion', bioregionId] });
        queryClient.invalidateQueries({ queryKey: ['/api/species/cache-status'] });
        refetch();
      }
    } catch (error) {
      console.error('Failed to refresh cache:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (hoursOld: number) => {
    if (hoursOld < 6) return 'text-green-600';
    if (hoursOld < 24) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (hoursOld: number) => {
    if (hoursOld < 6) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (hoursOld < 24) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Species Data Cache</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cacheStatus?.cacheEntries?.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Species Data Cache</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            No cached species data available. Species data will be loaded when you explore bioregions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Species Data Cache</h3>
          </div>
          <Badge variant="outline">
            {cacheStatus.totalBioregions} bioregions cached
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Species data is cached locally to minimize API usage while providing fresh biodiversity information.
          </p>
          
          {cacheStatus.cacheEntries.map((entry: any) => (
            <div key={entry.bioregionId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {getStatusIcon(entry.hoursOld)}
                <div>
                  <div className="font-medium text-sm">
                    {entry.bioregionId.replace('na_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs text-gray-500">
                    {entry.totalSpecies.toLocaleString()} species • 
                    Last updated {formatDate(entry.lastSynced)} 
                    <span className={`ml-1 ${getStatusColor(entry.hoursOld)}`}>
                      ({entry.hoursOld}h ago)
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshCache(entry.bioregionId)}
                className="flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Smart Caching</span>
            </div>
            <p className="text-xs text-blue-700">
              Data is automatically refreshed every 24 hours and cached to respect iNaturalist API rate limits. 
              Green = Fresh (6h), Yellow = Aging (24h), Red = Stale (24h+)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}