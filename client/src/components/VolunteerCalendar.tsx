import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface VolunteerCalendarProps {
  volunteerId: string;
  volunteerName: string;
}

export default function VolunteerCalendar({ volunteerId, volunteerName }: VolunteerCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    notes: '',
    isRecurring: false,
    recurringPattern: 'weekly'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch volunteer availability
  const { data: availability = [], isLoading } = useQuery({
    queryKey: ['/api/availability', volunteerId],
    queryFn: () => fetch(`/api/availability/${volunteerId}`).then(res => res.json()),
  });

  // Create availability mutation
  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/availability', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability', volunteerId] });
      setDialogOpen(false);
      setSelectedSlot(null);
      setAvailabilityForm({ notes: '', isRecurring: false, recurringPattern: 'weekly' });
      toast({
        title: "Availability Added",
        description: "Your availability has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save availability",
        variant: "destructive",
      });
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/availability/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability', volunteerId] });
      toast({
        title: "Availability Removed",
        description: "Your availability has been removed.",
      });
    },
  });

  // Convert availability data to calendar events
  const events: CalendarEvent[] = availability.map((avail: any) => ({
    id: avail.id,
    title: avail.isRecurring ? `Available (${avail.recurringPattern})` : 'Available',
    start: new Date(avail.startTime),
    end: new Date(avail.endTime),
    resource: avail,
  }));

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setDialogOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (confirm('Do you want to remove this availability?')) {
      deleteAvailabilityMutation.mutate(event.id);
    }
  }, [deleteAvailabilityMutation]);

  const handleSubmitAvailability = () => {
    if (!selectedSlot) return;

    createAvailabilityMutation.mutate({
      volunteerId,
      startTime: selectedSlot.start.toISOString(),
      endTime: selectedSlot.end.toISOString(),
      notes: availabilityForm.notes,
      isRecurring: availabilityForm.isRecurring,
      recurringPattern: availabilityForm.isRecurring ? availabilityForm.recurringPattern : null,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading calendar...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {volunteerName}'s Availability Calendar
          </CardTitle>
          <CardDescription>
            Click and drag on the calendar to add your available time slots. Click existing slots to remove them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              views={['month', 'week', 'day']}
              defaultView="week"
              min={new Date(1970, 1, 1, 6, 0, 0)}
              max={new Date(1970, 1, 1, 23, 0, 0)}
              step={30}
              timeslots={2}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.resource?.isRecurring ? '#10b981' : '#3b82f6',
                  borderColor: event.resource?.isRecurring ? '#059669' : '#2563eb',
                },
              })}
              formats={{
                timeGutterFormat: (date, culture, localizer) => {
                  const mainTime = format(date, 'h:mm a');
                  const militaryTime = format(date, 'HH:mm');
                  return `${mainTime}\n${militaryTime}`;
                },
                dayHeaderFormat: (date, culture, localizer) =>
                  format(date, 'eeee M/d'),
              }}
              messages={{
                allDay: 'All Day',
                previous: 'Previous',
                next: 'Next',
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
                agenda: 'Agenda',
                date: 'Date',
                time: 'Time',
                event: 'Available',
                noEventsInRange: 'No availability set for this time period.',
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Availability Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Availability
            </DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  Set your availability from{' '}
                  <strong>
                    {format(selectedSlot.start, 'MMM dd, yyyy h:mm a')}
                  </strong>{' '}
                  to{' '}
                  <strong>
                    {format(selectedSlot.end, 'MMM dd, yyyy h:mm a')}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={availabilityForm.isRecurring}
                onCheckedChange={(checked) =>
                  setAvailabilityForm(prev => ({ ...prev, isRecurring: checked as boolean }))
                }
              />
              <Label htmlFor="recurring">Make this recurring</Label>
            </div>

            {availabilityForm.isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="pattern">Recurring Pattern</Label>
                <select
                  id="pattern"
                  value={availabilityForm.recurringPattern}
                  onChange={(e) =>
                    setAvailabilityForm(prev => ({ ...prev, recurringPattern: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about your availability..."
                value={availabilityForm.notes}
                onChange={(e) =>
                  setAvailabilityForm(prev => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAvailability}
              disabled={createAvailabilityMutation.isPending}
            >
              {createAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>One-time availability: {events.filter(e => !e.resource?.isRecurring).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Recurring availability: {events.filter(e => e.resource?.isRecurring).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Total slots: {events.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}