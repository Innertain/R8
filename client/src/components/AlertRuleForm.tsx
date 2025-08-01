import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { AlertRule } from "@shared/schema";

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const alertRuleSchema = z.object({
  name: z.string().min(1, "Alert name is required").max(255),
  description: z.string().optional(),
  alertType: z.enum(["weather", "wildfire", "earthquake", "disaster"]),
  states: z.array(z.string()).optional(),
  notificationMethods: z.array(z.enum(["email", "sms", "webhook"])).min(1, "At least one notification method required"),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  cooldownMinutes: z.number().min(1).max(1440),
  maxAlertsPerDay: z.number().min(1).max(100),
  isActive: z.boolean().default(true),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'contains', 'greater_than', 'less_than']),
    value: z.string(),
  })).default([]),
});

type AlertRuleFormData = z.infer<typeof alertRuleSchema>;

interface AlertRuleFormProps {
  initialData?: AlertRule;
  onSuccess: () => void;
}

export function AlertRuleForm({ initialData, onSuccess }: AlertRuleFormProps) {
  const [selectedStates, setSelectedStates] = useState<string[]>(initialData?.states || []);
  const [conditions, setConditions] = useState(initialData?.conditions || [{ field: 'severity', operator: 'equals', value: 'high' }]);
  const { toast } = useToast();

  const form = useForm<AlertRuleFormData>({
    resolver: zodResolver(alertRuleSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      alertType: initialData?.alertType || "weather",
      states: initialData?.states || [],
      notificationMethods: initialData?.notificationMethods || ["email"],
      webhookUrl: initialData?.webhookUrl || "",
      cooldownMinutes: initialData?.cooldownMinutes || 60,
      maxAlertsPerDay: initialData?.maxAlertsPerDay || 10,
      isActive: initialData?.isActive ?? true,
      conditions: initialData?.conditions || [{ field: 'severity', operator: 'equals', value: 'high' }],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AlertRuleFormData) => {
      const url = initialData ? `/api/alerts/rules/${initialData.id}` : '/api/alerts/rules';
      const method = initialData ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          states: selectedStates,
          conditions: conditions,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save alert rule');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: initialData ? "Rule updated" : "Rule created",
        description: initialData ? "Alert rule has been updated successfully." : "New alert rule has been created successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AlertRuleFormData) => {
    mutation.mutate(data);
  };

  const handleStateToggle = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const addCondition = () => {
    setConditions(prev => [...prev, { field: 'severity', operator: 'equals', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<typeof conditions[0]>) => {
    setConditions(prev => prev.map((cond, i) => i === index ? { ...cond, ...updates } : cond));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., High Wind Warnings in California" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe when this alert should trigger..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alertType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weather">🌩️ Weather Alerts</SelectItem>
                      <SelectItem value="wildfire">🔥 Wildfire Incidents</SelectItem>
                      <SelectItem value="earthquake">🌍 Earthquake Activity</SelectItem>
                      <SelectItem value="disaster">⚠️ FEMA Disaster Declarations</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Geographic Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <FormLabel className="text-base">States (leave empty for all states)</FormLabel>
              <div className="grid grid-cols-10 gap-2 mt-2">
                {US_STATES.map(state => (
                  <div key={state} className="flex items-center space-x-1">
                    <Checkbox
                      checked={selectedStates.includes(state)}
                      onCheckedChange={() => handleStateToggle(state)}
                    />
                    <label className="text-sm">{state}</label>
                  </div>
                ))}
              </div>
              {selectedStates.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedStates.map(state => (
                    <Badge key={state} variant="secondary" className="text-xs">
                      {state}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-end space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <FormLabel className="text-sm">Field</FormLabel>
                  <Select
                    value={condition.field}
                    onValueChange={(value) => updateCondition(index, { field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="severity">Severity Level</SelectItem>
                      <SelectItem value="title">Event Title</SelectItem>
                      <SelectItem value="description">Description</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <FormLabel className="text-sm">Operator</FormLabel>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(index, { operator: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <FormLabel className="text-sm">Value</FormLabel>
                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    placeholder="Enter value..."
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCondition(index)}
                  disabled={conditions.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addCondition}>
              Add Condition
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="notificationMethods"
              render={() => (
                <FormItem>
                  <FormLabel>Notification Methods</FormLabel>
                  <div className="space-y-2">
                    {['email', 'sms', 'webhook'].map((method) => (
                      <FormField
                        key={method}
                        control={form.control}
                        name="notificationMethods"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(method)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, method])
                                    : field.onChange(field.value?.filter((value) => value !== method))
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">
                              {method === 'email' && '📧'} 
                              {method === 'sms' && '📱'} 
                              {method === 'webhook' && '🔗'} 
                              {method}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('notificationMethods')?.includes('webhook') && (
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-webhook-endpoint.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional webhook URL to receive alert notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cooldownMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cooldown (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={1440}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum time between alerts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAlertsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Limit</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum alerts per day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Active Alert Rule
                    </FormLabel>
                    <FormDescription>
                      This alert rule will actively monitor for matching events
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : (initialData ? 'Update Rule' : 'Create Rule')}
          </Button>
        </div>
      </form>
    </Form>
  );
}