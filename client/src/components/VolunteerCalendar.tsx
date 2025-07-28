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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, Clock, User, UserPlus, CheckCircle, XCircle, MapPin, ExternalLink, Trash2 } from 'lucide-react';
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

  // Fetch volunteer assignments (shifts they signed up for)
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/assignments/volunteer', volunteerId],
    queryFn: () => fetch(`/api/assignments/volunteer/${volunteerId}`).then(res => res.json()),
  });

  // Fetch shifts data to get shift details
  const { data: shifts = [] } = useQuery({
    queryKey: ['/api/shifts'],
    queryFn: () => fetch('/api/shifts').then(res => res.json()),
    staleTime: 0,
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

  // Cancel assignment mutation
  const cancelAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => apiRequest('PATCH', `/api/assignments/${assignmentId}`, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assignments/volunteer/${volunteerId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      toast({
        title: "Assignment Cancelled",
        description: "Your shift assignment has been cancelled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Cancellation Failed",
        description: "Unable to cancel assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Sign up mutation for re-signup
  const signUpMutation = useMutation({
    mutationFn: (shiftId: string) => apiRequest('POST', '/api/assignments', {
      volunteerId: volunteerId,
      shiftId: shiftId,
      status: 'confirmed'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assignments/volunteer/${volunteerId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      toast({
        title: "Successfully Signed Up!",
        description: "You've been registered for this volunteer shift.",
      });
    },
    onError: () => {
      toast({
        title: "Sign Up Failed",
        description: "There was an error signing up for this shift. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Convert availability data to calendar events
  const availabilityEvents: CalendarEvent[] = availability.map((avail: any) => ({
    id: `avail-${avail.id}`,
    title: '', // Remove text from calendar display
    start: new Date(avail.startTime),
    end: new Date(avail.endTime),
    resource: { 
      ...avail, 
      type: 'availability',
      displayTitle: avail.isRecurring ? `Available (${avail.recurringPattern})` : 'Available'
    },
  }));

  // Convert shift assignments to calendar events (show all assignments with different styling)
  const shiftEvents: CalendarEvent[] = assignments
    .map((assignment: any) => {
      // Find the corresponding shift details
      console.log(`Looking for shiftId: ${assignment.shiftId} in ${shifts.length} shifts`);
      const shift = shifts.find((s: any) => {
        // Convert both to strings and trim to ensure clean comparison
        const shiftId = String(s.id).trim();
        const assignmentShiftId = String(assignment.shiftId).trim();
        const matches = shiftId === assignmentShiftId;
        console.log(`Comparing shift "${shiftId}" with assignment "${assignmentShiftId}": ${matches}`);
        return matches;
      });
      
      if (!shift) {
        console.log(`No shift found for assignment ${assignment.id} with shiftId ${assignment.shiftId}`);
        console.log('Available shifts:', shifts.map((s: any) => ({ id: s.id, name: s.activityName })));
      }

      // Use real shift data or placeholder if not found
      const shiftToUse = shift || {
        id: assignment.shiftId,
        activityName: `Assigned Shift (${assignment.shiftName || 'Loading...'})`,
        dateTime: null,
        location: 'Location TBD'
      };

      // Parse the shift date/time - handle different formats
      let shiftDate: Date;
      let endDate: Date;
      
      if (shiftToUse.dateTime) {
        const dateTimeStr = shiftToUse.dateTime;
        
        // First try normal Date parsing
        shiftDate = new Date(dateTimeStr);
        
        if (isNaN(shiftDate.getTime())) {
          console.log(`Trying to parse custom format: ${dateTimeStr}`);
          
          // Parse format like "Wednesday, Jul 30 • 7:00 PM - 10:00 PM"
          // Use a simpler regex pattern to avoid parsing issues
          const dateMatch = dateTimeStr.match(/(\w+)\s+(\d+)/);
          const timeMatch = dateTimeStr.match(/(\d+):(\d+)\s+(AM|PM)/);
          
          if (dateMatch && timeMatch) {
            const [, month, day] = dateMatch;
            const [, hour, minute, period] = timeMatch;
            
            // Get current year and construct date
            const currentYear = new Date().getFullYear();
            const monthMap: Record<string, number> = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            
            const monthNum = monthMap[month] ?? 6; // Default to July if not found
            const dayNum = parseInt(day);
            
            // Convert 12-hour to 24-hour format
            let hour24 = parseInt(hour);
            if (period === 'PM' && hour24 !== 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;
            
            shiftDate = new Date(currentYear, monthNum, dayNum, hour24, parseInt(minute));
            endDate = new Date(shiftDate);
            endDate.setHours(endDate.getHours() + 3); // Default 3-hour duration
            
            // If the date is in the past, assume it's next year
            if (shiftDate < new Date()) {
              shiftDate.setFullYear(currentYear + 1);
              endDate.setFullYear(currentYear + 1);
            }
            
            console.log(`Parsed date successfully: ${shiftDate} to ${endDate}`);
          } else {
            console.log(`Could not parse date format: ${dateTimeStr}`);
            // Use current date + 7 days as fallback
            shiftDate = new Date();
            shiftDate.setDate(shiftDate.getDate() + 7);
            shiftDate.setHours(9, 0, 0, 0);
            endDate = new Date(shiftDate);
            endDate.setHours(12, 0, 0, 0);
          }
        } else {
          // Standard date parsing worked
          endDate = new Date(shiftDate);
          endDate.setHours(endDate.getHours() + 3);
        }
      } else {
        console.log(`No dateTime for shift ${shiftToUse.id}, using placeholder`);
        // Use current date + 7 days as fallback
        shiftDate = new Date();
        shiftDate.setDate(shiftDate.getDate() + 7);
        shiftDate.setHours(9, 0, 0, 0);
        endDate = new Date(shiftDate);
        endDate.setHours(12, 0, 0, 0);
      }

      return {
        id: `shift-${assignment.id}`,
        title: '', // Remove text from calendar display
        start: shiftDate,
        end: endDate,
        resource: { 
          ...assignment, 
          shift: shiftToUse, 
          type: 'shift',
          status: assignment.status,
          displayTitle: assignment.status === 'cancelled' 
            ? `${shiftToUse.activityName} (Cancelled)` 
            : shiftToUse.activityName // Store title for tooltips/modals
        },
      };
    })
    .filter(Boolean) as CalendarEvent[];

  // Combine both availability and shift events
  const events: CalendarEvent[] = [...availabilityEvents, ...shiftEvents];

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setDialogOpen(true);
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

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

  if (isLoading || assignmentsLoading) {
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
      {/* Google Calendar Sync Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar Sync
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically sync your availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Google Calendar</p>
                <p className="text-sm text-gray-500">Sync your availability automatically</p>
              </div>
            </div>
            <Button variant="outline" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Connect (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {volunteerName}'s Availability Calendar
          </CardTitle>
          <CardDescription>
            Click and drag to add availability (blue). View your committed shifts (green with 🎯). Click events for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Available Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Confirmed Shifts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span>Pending Shifts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded opacity-70"></div>
              <span>Cancelled Shifts</span>
            </div>
          </div>
          <div className="h-[600px] md:h-[600px] sm:h-[500px]">
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
              eventPropGetter={(event) => {
                if (event.resource?.type === 'shift') {
                  // Different colors based on shift status - clean solid colors
                  const status = event.resource.status;
                  if (status === 'cancelled') {
                    return {
                      style: {
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        border: '2px solid #dc2626',
                        color: 'transparent', // Hide any text
                        cursor: 'pointer',
                        opacity: 0.8,
                        borderRadius: '4px',
                      },
                    };
                  } else if (status === 'confirmed') {
                    return {
                      style: {
                        backgroundColor: '#047857',
                        borderColor: '#065f46',
                        border: '2px solid #065f46',
                        color: 'transparent', // Hide any text
                        cursor: 'pointer',
                        borderRadius: '4px',
                      },
                    };
                  } else {
                    // Pending or other status
                    return {
                      style: {
                        backgroundColor: '#b45309',
                        borderColor: '#92400e',
                        border: '2px solid #92400e',
                        color: 'transparent', // Hide any text
                        cursor: 'pointer',
                        borderRadius: '4px',
                      },
                    };
                  }
                } else {
                  // Blue for availability - darker colors for better contrast
                  return {
                    style: {
                      backgroundColor: event.resource?.isRecurring ? '#1d4ed8' : '#2563eb',
                      borderColor: event.resource?.isRecurring ? '#1e40af' : '#1d4ed8',
                      border: event.resource?.isRecurring ? '2px solid #1e40af' : '2px solid #1d4ed8',
                      color: 'transparent', // Hide any text
                      cursor: 'pointer',
                      borderRadius: '4px',
                    },
                  };
                }
              }}
              formats={{
                timeGutterFormat: (date, culture, localizer) => {
                  const mainTime = format(date, 'ha');
                  const militaryTime = format(date, 'HH:mm');
                  return `${mainTime}\n${militaryTime}`;
                },
                dayHeaderFormat: (date, culture, localizer) =>
                  format(date, 'eeee M/d'),
              }}
              components={{
                timeGutterHeader: () => (
                  <div className="text-center py-2 text-sm font-medium text-gray-700">
                    Time
                  </div>
                ),
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

      {/* Enhanced Event Details Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedEvent.resource?.type === 'shift' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Volunteer Shift
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-blue-600" />
                      Availability
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>

              {selectedEvent.resource?.type === 'shift' ? (
                // Shift Details Modal
                <div className="space-y-4">
                  <div className={`border rounded-lg p-4 ${
                    selectedEvent.resource.status === 'cancelled' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold ${
                        selectedEvent.resource.status === 'cancelled' 
                          ? 'text-red-900' 
                          : 'text-green-900'
                      }`}>
                        {selectedEvent.resource.displayTitle || selectedEvent.resource.shift?.activityName || 'Shift'}
                      </h3>
                      <Badge className={
                        selectedEvent.resource.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-green-100 text-green-800 border-green-200'
                      }>
                        {selectedEvent.resource.status || 'Confirmed'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className={`h-4 w-4 ${
                          selectedEvent.resource.status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                        }`} />
                        <span>{selectedEvent.resource.shift?.dateTime || selectedEvent.start.toLocaleString()}</span>
                      </div>
                      
                      {selectedEvent.resource.shift?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className={`h-4 w-4 ${
                            selectedEvent.resource.status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                          }`} />
                          <span>{selectedEvent.resource.shift.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${
                          selectedEvent.resource.status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                        }`} />
                        <span>
                          {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {selectedEvent.resource.notes && (
                      <div className={`mt-3 pt-3 border-t ${
                        selectedEvent.resource.status === 'cancelled' ? 'border-red-200' : 'border-green-200'
                      }`}>
                        <p className={`text-xs ${
                          selectedEvent.resource.status === 'cancelled' ? 'text-red-700' : 'text-green-700'
                        }`}>
                          <strong>Notes:</strong> {selectedEvent.resource.notes}
                        </p>
                      </div>
                    )}
                    
                    {selectedEvent.resource.status === 'cancelled' && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs text-red-700 font-medium">
                          ⚠️ This shift has been cancelled. You can sign up for it again from the "Browse Shifts" tab if needed.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {selectedEvent.resource.status !== 'cancelled' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const shift = selectedEvent.resource.shift;
                            const startTime = new Date(selectedEvent.start);
                            const endTime = new Date(selectedEvent.end);
                            
                            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(shift?.activityName || 'Volunteer Shift')}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Location: ${shift?.location || 'TBD'}\nStatus: ${selectedEvent.resource.status}\n\nManage this shift in your Volunteer Portal.`)}&location=${encodeURIComponent(shift?.location || '')}`;
                            
                            window.open(googleCalendarUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Add to Calendar
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowEventModal(false)}
                        >
                          Close
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel your assignment for "${selectedEvent.resource.shift?.activityName || 'this shift'}"?`)) {
                              // Call the cancel assignment mutation
                              cancelAssignmentMutation.mutate(selectedEvent.resource.id);
                              setShowEventModal(false);
                            }
                          }}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancel Assignment
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowEventModal(false)}
                        >
                          Close
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() => {
                            // Call the signup mutation to re-signup for this shift
                            signUpMutation.mutate(selectedEvent.resource.shift?.id || selectedEvent.resource.shiftId);
                            setShowEventModal(false);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Sign Up Again
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Availability Details Modal
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      {selectedEvent.resource.displayTitle || 'Available Time'}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                        <span>{selectedEvent.start.toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-900" />
                        <span>
                          {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {selectedEvent.resource?.isRecurring && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span>Recurring: {selectedEvent.resource.recurringPattern}</span>
                        </div>
                      )}
                    </div>

                    {selectedEvent.resource?.notes && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-700">
                          <strong>Notes:</strong> {selectedEvent.resource.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowEventModal(false)}
                    >
                      Close
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this availability?')) {
                          deleteAvailabilityMutation.mutate(selectedEvent.id.replace('avail-', ''));
                          setShowEventModal(false);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}