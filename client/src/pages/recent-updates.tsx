import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Package, AlertTriangle, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface RecentUpdate {
  id: string;
  tableName: string;
  lastModified: string;
  [key: string]: any;
}

interface RecentUpdatesData {
  inventory: RecentUpdate[];
  needs: RecentUpdate[];
  dateRange: {
    from: string;
    to: string;
  };
}

// Custom hook to fetch recent updates
const useRecentUpdates = () => {
  return useQuery({
    queryKey: ['/api/recent-updates'],
    queryFn: async (): Promise<RecentUpdatesData> => {
      const response = await fetch('/api/recent-updates');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch recent updates');
      }

      console.log('Recent updates loaded:', { 
        inventory: result.data.inventory?.length || 0, 
        needs: result.data.needs?.length || 0
      });

      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Helper function to format update item
const formatUpdateItem = (update: RecentUpdate) => {
  const siteName = update['Site Name'] || update['Name'] || 'Unknown Site';
  const itemName = update['Item Name'] || update['Item'] || update['Supply Item'] || 'Unknown Item';
  const quantity = update['Quantity'] || update['Count'] || update['Amount'] || '';
  const status = update['Status'] || update['Availability'] || '';
  
  return { siteName, itemName, quantity, status };
};

// Helper function to get relative time
const getRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Recently';
  }
};

export function RecentUpdatesPage() {
  const { data, isLoading, error } = useRecentUpdates();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load recent updates: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { inventory, needs, dateRange } = data || { inventory: [], needs: [], dateRange: { from: '', to: '' } };
  const totalUpdates = inventory.length + needs.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Recent Updates</h1>
        <p className="text-muted-foreground">
          Inventory and supply needs updated in the last 30 days ({format(new Date(dateRange.from), 'MMM d')} - {format(new Date(dateRange.to), 'MMM d, yyyy')})
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalUpdates}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Updates</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Inventory changes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Updates</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{needs.length}</div>
            <p className="text-xs text-muted-foreground">Supply requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Inventory Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Recent Inventory Updates
            </CardTitle>
            <CardDescription>
              Latest changes to site inventory levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent inventory updates</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inventory.slice(0, 20).map((update) => {
                  const { siteName, itemName, quantity, status } = formatUpdateItem(update);
                  return (
                    <div key={update.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{siteName}</h4>
                          <p className="text-sm text-muted-foreground">{itemName}</p>
                        </div>
                        <div className="text-right">
                          {quantity && (
                            <Badge variant="outline" className="text-xs mb-1">
                              {quantity}
                            </Badge>
                          )}
                          {status && (
                            <Badge variant="secondary" className="text-xs">
                              {status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(update.lastModified)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Needs Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-600" />
              Recent Needs Updates
            </CardTitle>
            <CardDescription>
              Latest supply requests and needs changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {needs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent needs updates</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {needs.slice(0, 20).map((update) => {
                  const { siteName, itemName, quantity, status } = formatUpdateItem(update);
                  return (
                    <div key={update.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{siteName}</h4>
                          <p className="text-sm text-muted-foreground">{itemName}</p>
                        </div>
                        <div className="text-right">
                          {quantity && (
                            <Badge variant="outline" className="text-xs mb-1">
                              {quantity}
                            </Badge>
                          )}
                          {status && (
                            <Badge 
                              variant={status.toLowerCase().includes('urgent') ? 'destructive' : 'secondary'} 
                              className="text-xs"
                            >
                              {status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(update.lastModified)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}