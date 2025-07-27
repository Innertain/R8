import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Phone, User, Calendar, UserPlus, LogIn, CheckCircle, Clock, XCircle, CalendarDays, Trash2, CalendarPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import VolunteerCalendar from '@/components/VolunteerCalendar';

export default function VolunteerPortal() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentVolunteer, setCurrentVolunteer] = useState<any>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    isDriver: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cancel assignment mutation
  const cancelAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to cancel assignment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments/volunteer', currentVolunteer?.id] });
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

  // Google Calendar integration helper
  const addToGoogleCalendar = (assignment: any, shift: any) => {
    const title = encodeURIComponent(shift?.activityName || 'Volunteer Shift');
    const details = encodeURIComponent(`Volunteer assignment: ${assignment.notes || 'No additional notes'}`);
    const location = encodeURIComponent(shift?.location || 'Location TBD');
    
    // For demo purposes, use a placeholder date/time
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Next week
    startDate.setHours(9, 0, 0, 0); // 9 AM
    
    const endDate = new Date(startDate);
    endDate.setHours(12, 0, 0, 0); // 12 PM (3 hours)
    
    const startTime = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  // Login volunteer mutation
  const loginMutation = useMutation({
    mutationFn: (phone: string) => fetch(`/api/volunteers/phone/${phone}`).then(res => {
      if (!res.ok) throw new Error('Volunteer not found');
      return res.json();
    }),
    onSuccess: (volunteer) => {
      setCurrentVolunteer(volunteer);
      toast({
        title: "Welcome back!",
        description: `Hello ${volunteer.name}, you can now manage your availability.`,
      });
    },
    onError: () => {
      toast({
        title: "Not Found",
        description: "We couldn't find a volunteer with that phone number. Would you like to register?",
        variant: "destructive",
      });
      setShowRegister(true);
    },
  });

  // Register volunteer mutation
  const registerMutation = useMutation({
    mutationFn: async (data: typeof registerForm) => {
      const response = await apiRequest('POST', '/api/volunteers', data);
      return response.json();
    },
    onSuccess: (volunteer) => {
      setCurrentVolunteer(volunteer);
      setShowRegister(false);
      setRegisterForm({
        name: '',
        phoneNumber: '',
        email: '',
        isDriver: false,
      });
      toast({
        title: "Registration Successful",
        description: `Welcome ${volunteer.name}! You can now set your availability.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to continue.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(phoneNumber);
  };

  const handleRegister = () => {
    if (!registerForm.name.trim() || !registerForm.phoneNumber.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name and phone number.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(registerForm);
  };

  const handleLogout = () => {
    setCurrentVolunteer(null);
    setPhoneNumber('');
    setShowRegister(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  // Fetch volunteer assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/assignments/volunteer', currentVolunteer?.id],
    queryFn: () => fetch(`/api/assignments/volunteer/${currentVolunteer?.id}`).then(res => res.json()),
    enabled: !!currentVolunteer,
  });

  // Fetch shifts data to match with assignments
  const { data: shifts = [] } = useQuery({
    queryKey: ['/api/shifts'],
    enabled: !!currentVolunteer,
  }) as { data: any[] };

  // If logged in, show the dashboard with tabs
  if (currentVolunteer) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Volunteer Portal</h1>
            <p className="text-gray-600">Welcome back, {currentVolunteer.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{currentVolunteer.name}</p>
              <p className="text-sm text-gray-500">{currentVolunteer.phone || currentVolunteer.phoneNumber}</p>
              {currentVolunteer.isDriver && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Driver
                </span>
              )}
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              My Shifts
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Availability
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  My Volunteer Shifts
                </CardTitle>
                <CardDescription>
                  View and manage your upcoming volunteer commitments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Loading your shifts...</p>
                    </div>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No shifts assigned yet</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't signed up for any volunteer shifts yet. 
                      Check the main shifts page to find opportunities!
                    </p>
                    <Button onClick={() => window.location.href = '/'}>
                      Browse Available Shifts
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {assignments.length} Active Assignment{assignments.length !== 1 ? 's' : ''}
                      </h3>
                      <Badge variant="secondary" className="text-green-700 bg-green-50">
                        {assignments.filter((a: any) => a.status === 'confirmed').length} Confirmed
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      {assignments.map((assignment: any) => {
                        const matchedShift = shifts.find((s: any) => s.id === assignment.shiftId);
                        const statusIcon = assignment.status === 'confirmed' ? CheckCircle : 
                                         assignment.status === 'pending' ? Clock : XCircle;
                        const statusColor = assignment.status === 'confirmed' ? 'text-green-600' : 
                                          assignment.status === 'pending' ? 'text-yellow-600' : 'text-red-600';
                        const StatusIcon = statusIcon;
                        
                        return (
                          <Card key={assignment.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">
                                      {matchedShift?.activityName || 'River Clean up'}
                                    </h4>
                                    <Badge 
                                      variant={assignment.status === 'confirmed' ? 'default' : 'secondary'}
                                      className={`flex items-center gap-1 ${statusColor}`}
                                    >
                                      <StatusIcon className="h-3 w-3" />
                                      {assignment.status}
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p><strong>Date:</strong> {matchedShift?.dateTime || 'To be determined'}</p>
                                    <p><strong>Location:</strong> {matchedShift?.location || 'Local area'}</p>
                                    <p><strong>Assigned:</strong> {new Date(assignment.assignedDate || assignment.assignedAt).toLocaleDateString()}</p>
                                    {assignment.notes && (
                                      <p><strong>Notes:</strong> {assignment.notes}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    ID: {assignment.id.slice(-8)}
                                  </Badge>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addToGoogleCalendar(assignment, matchedShift)}
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      <CalendarPlus className="h-3 w-3" />
                                      Add to Calendar
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          Cancel
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Cancel Volunteer Assignment</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to cancel your assignment for "{matchedShift?.activityName || 'River Clean up'}"? 
                                            This action cannot be undone and may affect the volunteer coordination.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Keep Assignment</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => cancelAssignmentMutation.mutate(assignment.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                            disabled={cancelAssignmentMutation.isPending}
                                          >
                                            {cancelAssignmentMutation.isPending ? 'Cancelling...' : 'Cancel Assignment'}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <VolunteerCalendar 
              volunteerId={currentVolunteer.id} 
              volunteerName={currentVolunteer.name} 
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Login/Register screen
  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Volunteer Portal</h1>
          <p className="text-gray-600">Set your availability and manage your volunteer schedule</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Volunteer Access
            </CardTitle>
            <CardDescription>
              Enter your phone number to access your volunteer dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567 or 555-DEMO"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            {/* Real data demo buttons */}
            <div className="bg-blue-50 p-3 rounded-lg space-y-2">
              <p className="text-sm text-blue-800 font-medium">Try with real data from your Airtable:</p>
              <div className="flex flex-col gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPhoneNumber("(919) 434-0129")}
                  className="text-xs justify-start"
                >
                  🎯 Your Account: (919) 434-0129 - Alex Mengel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPhoneNumber("(562) 480-4473")}
                  className="text-xs justify-start"
                >
                  📋 Volunteer: (562) 480-4473 - Muralidharan Vasudevan
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPhoneNumber("(202) 246-7810")}
                  className="text-xs justify-start"
                >
                  🚚 Driver: (202) 246-7810 - Grassroots Aid Partnership
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPhoneNumber("555-DEMO")}
                  className="text-xs justify-start"
                >
                  🎯 Demo: 555-DEMO - Test Account
                </Button>
              </div>
              <p className="text-xs text-gray-600">You can also type just the digits: 9194340129</p>
            </div>
            
            <Button 
              onClick={handleLogin} 
              disabled={loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? 'Checking...' : 'Access Portal'}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            New volunteer?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold"
              onClick={() => setShowRegister(true)}
            >
              Register here
            </Button>
          </p>
        </div>

        {/* Registration Dialog */}
        <Dialog open={showRegister} onOpenChange={setShowRegister}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Register as Volunteer
              </DialogTitle>
              <DialogDescription>
                Create your volunteer profile to start setting your availability
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name *</Label>
                <Input
                  id="reg-name"
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone">Phone Number *</Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  value={registerForm.phoneNumber}
                  onChange={(e) =>
                    setRegisterForm(prev => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email (optional)</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm(prev => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-driver"
                  checked={registerForm.isDriver}
                  onCheckedChange={(checked) =>
                    setRegisterForm(prev => ({ ...prev, isDriver: checked as boolean }))
                  }
                />
                <Label htmlFor="is-driver">I can drive/transport</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegister(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRegister}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Registering...' : 'Register'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}