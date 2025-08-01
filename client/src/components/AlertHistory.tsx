import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Mail, Phone, Globe, Search, Filter, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { AlertDelivery } from "@shared/schema";

export function AlertHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['/api/alerts/history'],
  });

  const deliveries: AlertDelivery[] = historyData?.deliveries || [];

  // Filter deliveries based on search and filters
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = searchTerm === "" || 
      delivery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === "all" || delivery.severity === severityFilter;
    const matchesMethod = methodFilter === "all" || delivery.deliveryMethod === methodFilter;
    const matchesStatus = statusFilter === "all" || delivery.deliveryStatus === statusFilter;

    return matchesSearch && matchesSeverity && matchesMethod && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      case 'webhook': return <Globe className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return '🌩️';
      case 'wildfire': return '🔥';
      case 'earthquake': return '🌍';
      case 'disaster': return '⚠️';
      default: return '📢';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Clock className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">Alert History</h2>
        <Badge variant="outline">{deliveries.length} Total Alerts</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Method</label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || severityFilter !== "all" || methodFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredDeliveries.length} of {deliveries.length} alerts
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSeverityFilter("all");
                  setMethodFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert History List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Loading alert history...</div>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {deliveries.length === 0 ? "No Alert History" : "No Matching Alerts"}
            </h3>
            <p className="text-gray-600">
              {deliveries.length === 0 
                ? "You haven't received any alerts yet. Create alert rules to start monitoring emergency events."
                : "No alerts match your current filter criteria. Try adjusting your search or filters."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <Card key={delivery.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getAlertTypeIcon(delivery.alertType)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{delivery.title}</h3>
                      <p className="text-gray-600 mt-1">{delivery.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(delivery.severity)}>
                      {delivery.severity}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Location</p>
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {delivery.location || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Method</p>
                    <p className="text-gray-900 flex items-center">
                      {getMethodIcon(delivery.deliveryMethod)}
                      <span className="ml-1 capitalize">{delivery.deliveryMethod}</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Status</p>
                    <p className="text-gray-900 flex items-center">
                      {getStatusIcon(delivery.deliveryStatus)}
                      <span className="ml-1 capitalize">{delivery.deliveryStatus}</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Sent</p>
                    <p className="text-gray-900">
                      {new Date(delivery.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {delivery.deliveryStatus === 'failed' && delivery.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {delivery.errorMessage}
                    </p>
                  </div>
                )}

                {delivery.sourceData && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                      View Source Data
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-40">
                      {JSON.stringify(delivery.sourceData, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}