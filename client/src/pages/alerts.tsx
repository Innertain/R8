import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Settings, Bell, Clock, MapPin, Trash2, Edit, TestTube, CheckCircle, XCircle } from "lucide-react";
import { AlertRuleForm } from "@/components/AlertRuleForm";
import { NotificationSettings } from "@/components/NotificationSettings";
import { AlertHistory } from "@/components/AlertHistory";
import { useToast } from "@/hooks/use-toast";
import type { AlertRule } from "@shared/schema";

export default function AlertsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch alert rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/alerts/rules'],
  });

  // Fetch notification settings
  const { data: settingsData } = useQuery({
    queryKey: ['/api/alerts/settings'],
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await fetch(`/api/alerts/rules/${ruleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/rules'] });
      toast({
        title: "Rule deleted",
        description: "Alert rule has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete alert rule.",
        variant: "destructive",
      });
    },
  });

  // Test alert mutation
  const testAlertMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await fetch(`/api/alerts/test/${ruleId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to test alert');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/history'] });
      toast({
        title: data.wouldTrigger ? "Test alert sent!" : "Alert conditions not met",
        description: data.message,
        variant: data.wouldTrigger ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to test alert.",
        variant: "destructive",
      });
    },
  });

  const rules = rulesData?.rules || [];
  const settings = settingsData?.settings;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Alert Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {rules.length} Active Rules
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-lg text-gray-600 max-w-4xl">
            Create custom alert rules to receive notifications when emergency events meet your specified criteria.
            Set up email, SMS, or webhook notifications for weather alerts, wildfire incidents, earthquakes, and disaster declarations.
          </p>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Alert Rules</TabsTrigger>
            <TabsTrigger value="history">Alert History</TabsTrigger>
            <TabsTrigger value="settings">Notification Settings</TabsTrigger>
          </TabsList>

          {/* Alert Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Alert Rules</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Alert Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Alert Rule</DialogTitle>
                  </DialogHeader>
                  <AlertRuleForm 
                    onSuccess={() => {
                      setIsCreateDialogOpen(false);
                      queryClient.invalidateQueries({ queryKey: ['/api/alerts/rules'] });
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </div>

            {rulesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-600">Loading alert rules...</div>
              </div>
            ) : rules.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Alert Rules</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first alert rule to start receiving notifications about emergency events.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Alert
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {rules.map((rule: AlertRule) => (
                  <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getAlertTypeIcon(rule.alertType)}</div>
                          <div>
                            <CardTitle className="text-lg">{rule.name}</CardTitle>
                            {rule.description && (
                              <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Type</p>
                          <p className="text-sm text-gray-900 capitalize">{rule.alertType}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">States</p>
                          <p className="text-sm text-gray-900">
                            {rule.states?.length ? rule.states.join(', ') : 'All States'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Cooldown</p>
                          <p className="text-sm text-gray-900">{rule.cooldownMinutes} minutes</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Daily Limit</p>
                          <p className="text-sm text-gray-900">{rule.maxAlertsPerDay} alerts</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Notification Methods</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.notificationMethods.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method === 'email' && '📧'} 
                              {method === 'sms' && '📱'} 
                              {method === 'webhook' && '🔗'} 
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          Created {new Date(rule.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testAlertMutation.mutate(rule.id)}
                            disabled={testAlertMutation.isPending}
                          >
                            <TestTube className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRule(rule)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteRuleMutation.mutate(rule.id)}
                            disabled={deleteRuleMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Alert History Tab */}
          <TabsContent value="history">
            <AlertHistory />
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="settings">
            <NotificationSettings 
              settings={settings}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/alerts/settings'] })}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Rule Dialog */}
        <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Alert Rule</DialogTitle>
            </DialogHeader>
            <AlertRuleForm 
              initialData={editingRule || undefined}
              onSuccess={() => {
                setEditingRule(null);
                queryClient.invalidateQueries({ queryKey: ['/api/alerts/rules'] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}