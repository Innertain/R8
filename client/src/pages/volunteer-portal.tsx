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
import { Phone, User, Calendar, UserPlus, LogIn, CheckCircle, Clock, XCircle, CalendarDays, Trash2, CalendarPlus, Settings, Save, Mail, MapPin, Heart, Briefcase, Bell, List, UserCheck, UserX, Pause, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import VolunteerCalendar from '@/components/VolunteerCalendar';
import ShiftCard from '@/components/ShiftCard';



// Volunteer Profile Component
function VolunteerProfile({ volunteer }: { volunteer: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: volunteer.name || '',
    email: volunteer.email || '',
    bio: volunteer.bio || '',
    skills: volunteer.skills || [],
    interests: volunteer.interests || [],
    emergencyContact: volunteer.emergencyContact || '',
    emergencyPhone: volunteer.emergencyPhone || '',
    dietaryRestrictions: volunteer.dietaryRestrictions || '',
    hasTransportation: volunteer.hasTransportation || false,
    maxHoursPerWeek: volunteer.maxHoursPerWeek || '',
    preferredShiftTypes: volunteer.preferredShiftTypes || [],
    status: volunteer.status || 'active', // active, inactive
    notifications: volunteer.notifications || {
      email: true,
      sms: false,
      reminders: true,
      newShifts: true
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch skills and interests from Airtable
  const { data: skillsData } = useQuery({
    queryKey: ['/api/volunteer-skills'],
    queryFn: () => fetch('/api/volunteer-skills').then(res => res.json()),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch(`/api/volunteers/${volunteer.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/volunteers/${volunteer.id}`] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your volunteer profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Use skills and interests from your Airtable data
  const skillOptions = skillsData?.skills || [
    'Event Planning', 'Teaching', 'Technology', 'Writing', 'Photography',
    'Marketing', 'Fundraising', 'Customer Service', 'Manual Labor', 'Cooking',
    'Childcare', 'Elder Care', 'Medical/Healthcare', 'Construction', 'Driving',
    'Languages', 'Administrative', 'Social Media', 'Graphic Design', 'Legal'
  ];

  const interestOptions = skillsData?.interests || [
    'Environmental', 'Education', 'Health & Wellness', 'Community Development',
    'Animal Welfare', 'Arts & Culture', 'Sports & Recreation', 'Senior Services',
    'Youth Programs', 'Food Security', 'Homelessness', 'Disaster Relief',
    'Advocacy', 'Research', 'Faith-Based', 'International'
  ];

  const shiftTypeOptions = [
    'Morning Shifts', 'Evening Shifts', 'Weekend', 'Weekday', 'One-time Events',
    'Recurring Commitments', 'Remote Work', 'Physical Labor', 'Office Work',
    'Outdoor Activities', 'Client-Facing', 'Behind-the-Scenes'
  ];

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Volunteer Profile</h2>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <Button
          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({...prev, name: e.target.value}))}
                  />
                ) : (
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{volunteer.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({...prev, email: e.target.value}))}
                  />
                ) : (
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{volunteer.email || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <textarea
                  id="bio"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({...prev, bio: e.target.value}))}
                  placeholder="Tell us about yourself and why you volunteer..."
                />
              ) : (
                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{volunteer.bio || 'No bio provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Skills & Interests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Skills</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {skillOptions.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={profileForm.skills.includes(skill)}
                        onCheckedChange={() => 
                          setProfileForm(prev => ({
                            ...prev, 
                            skills: toggleArrayItem(prev.skills, skill)
                          }))
                        }
                      />
                      <Label htmlFor={`skill-${skill}`} className="text-sm">{skill}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(volunteer.skills || []).map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                  {(!volunteer.skills || volunteer.skills.length === 0) && (
                    <p className="text-sm text-gray-500">No skills listed</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>Areas of Interest</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {interestOptions.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={profileForm.interests.includes(interest)}
                        onCheckedChange={() => 
                          setProfileForm(prev => ({
                            ...prev, 
                            interests: toggleArrayItem(prev.interests, interest)
                          }))
                        }
                      />
                      <Label htmlFor={`interest-${interest}`} className="text-sm">{interest}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(volunteer.interests || []).map((interest: string) => (
                    <Badge key={interest} variant="outline">{interest}</Badge>
                  ))}
                  {(!volunteer.interests || volunteer.interests.length === 0) && (
                    <p className="text-sm text-gray-500">No interests listed</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Emergency Contact & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency-contact">Emergency Contact Name</Label>
                {isEditing ? (
                  <Input
                    id="emergency-contact"
                    value={profileForm.emergencyContact}
                    onChange={(e) => setProfileForm(prev => ({...prev, emergencyContact: e.target.value}))}
                  />
                ) : (
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{volunteer.emergencyContact || 'Not provided'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="emergency-phone">Emergency Phone</Label>
                {isEditing ? (
                  <Input
                    id="emergency-phone"
                    type="tel"
                    value={profileForm.emergencyPhone}
                    onChange={(e) => setProfileForm(prev => ({...prev, emergencyPhone: e.target.value}))}
                  />
                ) : (
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{volunteer.emergencyPhone || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="dietary">Dietary Restrictions / Allergies</Label>
              {isEditing ? (
                <Input
                  id="dietary"
                  value={profileForm.dietaryRestrictions}
                  onChange={(e) => setProfileForm(prev => ({...prev, dietaryRestrictions: e.target.value}))}
                  placeholder="e.g., Vegetarian, Nut allergy, None"
                />
              ) : (
                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{volunteer.dietaryRestrictions || 'None specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Volunteer Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-transportation"
                  checked={isEditing ? profileForm.hasTransportation : volunteer.hasTransportation}
                  onCheckedChange={(checked) => 
                    isEditing && setProfileForm(prev => ({...prev, hasTransportation: checked as boolean}))
                  }
                  disabled={!isEditing}
                />
                <Label htmlFor="has-transportation">I have reliable transportation</Label>
              </div>
              <div>
                <Label htmlFor="max-hours">Max Hours Per Week</Label>
                {isEditing ? (
                  <Input
                    id="max-hours"
                    type="number"
                    value={profileForm.maxHoursPerWeek}
                    onChange={(e) => setProfileForm(prev => ({...prev, maxHoursPerWeek: e.target.value}))}
                    placeholder="e.g., 10"
                  />
                ) : (
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{volunteer.maxHoursPerWeek || 'No limit set'}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Preferred Shift Types</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {shiftTypeOptions.map(shiftType => (
                    <div key={shiftType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shift-${shiftType}`}
                        checked={profileForm.preferredShiftTypes.includes(shiftType)}
                        onCheckedChange={() => 
                          setProfileForm(prev => ({
                            ...prev, 
                            preferredShiftTypes: toggleArrayItem(prev.preferredShiftTypes, shiftType)
                          }))
                        }
                      />
                      <Label htmlFor={`shift-${shiftType}`} className="text-sm">{shiftType}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(volunteer.preferredShiftTypes || []).map((type: string) => (
                    <Badge key={type} className="bg-blue-100 text-blue-800">{type}</Badge>
                  ))}
                  {(!volunteer.preferredShiftTypes || volunteer.preferredShiftTypes.length === 0) && (
                    <p className="text-sm text-gray-500">No preferences set</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-email"
                checked={isEditing ? profileForm.notifications.email : volunteer.notifications?.email}
                onCheckedChange={(checked) => 
                  isEditing && setProfileForm(prev => ({
                    ...prev, 
                    notifications: {...prev.notifications, email: checked as boolean}
                  }))
                }
                disabled={!isEditing}
              />
              <Label htmlFor="notify-email">Email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-sms"
                checked={isEditing ? profileForm.notifications.sms : volunteer.notifications?.sms}
                onCheckedChange={(checked) => 
                  isEditing && setProfileForm(prev => ({
                    ...prev, 
                    notifications: {...prev.notifications, sms: checked as boolean}
                  }))
                }
                disabled={!isEditing}
              />
              <Label htmlFor="notify-sms">SMS notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-reminders"
                checked={isEditing ? profileForm.notifications.reminders : volunteer.notifications?.reminders}
                onCheckedChange={(checked) => 
                  isEditing && setProfileForm(prev => ({
                    ...prev, 
                    notifications: {...prev.notifications, reminders: checked as boolean}
                  }))
                }
                disabled={!isEditing}
              />
              <Label htmlFor="notify-reminders">Shift reminders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-new-shifts"
                checked={isEditing ? profileForm.notifications.newShifts : volunteer.notifications?.newShifts}
                onCheckedChange={(checked) => 
                  isEditing && setProfileForm(prev => ({
                    ...prev, 
                    notifications: {...prev.notifications, newShifts: checked as boolean}
                  }))
                }
                disabled={!isEditing}
              />
              <Label htmlFor="notify-new-shifts">New shift opportunities</Label>
            </div>
          </CardContent>
        </Card>

        {/* Account Status Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
            <CardDescription>
              Manage your volunteer account status and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Status Display */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge className={
                volunteer.status === 'active' ? 'bg-green-100 text-green-800' :
                volunteer.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }>
                {volunteer.status === 'active' ? '✓ Active Volunteer' :
                 volunteer.status === 'inactive' ? '⏸ Taking a Break' :
                 'Active Volunteer'}
              </Badge>
            </div>

            {/* Status Options */}
            {isEditing && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Change Status:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-active"
                      checked={profileForm.status === 'active'}
                      onCheckedChange={() => setProfileForm(prev => ({...prev, status: 'active'}))}
                    />
                    <Label htmlFor="status-active" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">Active Volunteer</div>
                        <div className="text-xs text-gray-500">Ready to take on shifts and receive notifications</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-inactive"
                      checked={profileForm.status === 'inactive'}
                      onCheckedChange={() => setProfileForm(prev => ({...prev, status: 'inactive'}))}
                    />
                    <Label htmlFor="status-inactive" className="flex items-center gap-2">
                      <Pause className="h-4 w-4 text-yellow-600" />
                      <div>
                        <div className="font-medium">Taking a Break</div>
                        <div className="text-xs text-gray-500">Keep my profile but don't assign new shifts</div>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Account Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <UserX className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-red-700">Remove My Data</div>
                    <p className="text-sm text-gray-600">
                      Permanently delete your volunteer account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Remove My Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <UserX className="h-5 w-5 text-red-500" />
                          Remove Volunteer Data
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your volunteer account including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Your profile information and preferences</li>
                            <li>Shift history and assignments</li>
                            <li>Availability calendar data</li>
                            <li>All associated records</li>
                          </ul>
                          <strong className="block mt-2 text-red-600">This action cannot be undone.</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep My Account</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            // TODO: Implement delete account functionality
                            toast({
                              title: "Account Deletion",
                              description: "Account deletion feature will be implemented soon. Please contact support for assistance.",
                            });
                          }}
                        >
                          Yes, Remove My Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => updateProfileMutation.mutate(profileForm)}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

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

  // Fetch shifts data to match with assignments - force fresh data from Airtable
  const { data: shifts = [] } = useQuery({
    queryKey: ['/api/shifts'],
    queryFn: () => fetch('/api/shifts').then(res => res.json()),
    enabled: !!currentVolunteer,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  }) as { data: any[] };

  // Authenticated shift card with proper volunteer ID
  const AuthenticatedShiftCard = ({ shift, volunteerId }: { shift: any; volunteerId: string }) => {
    const { data: assignments = [] } = useQuery({
      queryKey: ['/api/assignments/volunteer', volunteerId],
      queryFn: () => fetch(`/api/assignments/volunteer/${volunteerId}`).then(res => res.json()),
    });

    const signUpMutation = useMutation({
      mutationFn: async (shiftId: string) => {
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            volunteerId: volunteerId,
            shiftId: shiftId,
            status: 'confirmed',
            notes: `Signed up via volunteer portal - ${new Date().toLocaleDateString()}`
          })
        });
        if (!response.ok) throw new Error('Failed to sign up');
        return response.json();
      },
      onSuccess: () => {
        // Invalidate all related queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/assignments/volunteer', volunteerId] });
        queryClient.invalidateQueries({ queryKey: ['/api/availability', volunteerId] }); // Refresh calendar
        toast({
          title: "Successfully Signed Up!",
          description: "You've been registered for this volunteer shift.",
        });
      },
      onError: (error) => {
        toast({
          title: "Sign Up Failed",
          description: "There was an error signing up for this shift. Please try again.",
          variant: "destructive",
        });
      },
    });

    // Check if user is already signed up for this shift using component's own assignments data
    const isSignedUp = assignments?.some((assignment: any) => 
      assignment.shiftId === shift.id && assignment.status !== 'cancelled'
    );
    const isFull = shift.status === "full";
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{shift.activityName}</h3>
            <p className="text-sm text-gray-600">{shift.dateTime}</p>
            <p className="text-sm text-gray-600">{shift.location}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={shift.status === 'urgent' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
              {shift.status}
            </Badge>
            {isSignedUp && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Signed Up
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            {shift.volunteersSignedUp} / {shift.volunteersNeeded} volunteers
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${Math.min((shift.volunteersSignedUp / shift.volunteersNeeded) * 100, 100)}%` }}
            />
          </div>
        </div>
        
        <Button
          className={`w-full ${
            isSignedUp 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : isFull 
                ? 'bg-gray-400 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          onClick={() => !isSignedUp && signUpMutation.mutate(shift.id)}
          disabled={isFull || signUpMutation.isPending || isSignedUp}
        >
          {isSignedUp ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              You're Signed Up
            </>
          ) : isFull ? (
            'Full'
          ) : signUpMutation.isPending ? (
            'Signing Up...'
          ) : (
            'Sign Up for Shift'
          )}
        </Button>
      </div>
    );
  };

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
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger 
              value="dashboard" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 sm:py-2 min-h-[60px] sm:min-h-[40px] transition-all duration-200 hover:bg-blue-50 hover:scale-105 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <UserCheck className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">My Shifts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="browse" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 sm:py-2 min-h-[60px] sm:min-h-[40px] transition-all duration-200 hover:bg-blue-50 hover:scale-105 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <List className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Browse</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 sm:py-2 min-h-[60px] sm:min-h-[40px] transition-all duration-200 hover:bg-blue-50 hover:scale-105 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <Calendar className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Calendar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 sm:py-2 min-h-[60px] sm:min-h-[40px] transition-all duration-200 hover:bg-blue-50 hover:scale-105 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <Settings className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Profile</span>
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
                        {assignments.filter((a: any) => a.status !== 'cancelled').length} Active Assignment{assignments.filter((a: any) => a.status !== 'cancelled').length !== 1 ? 's' : ''}
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-green-700 bg-green-50">
                          {assignments.filter((a: any) => a.status === 'confirmed').length} Confirmed
                        </Badge>
                        {assignments.filter((a: any) => a.status === 'cancelled').length > 0 && (
                          <Badge variant="secondary" className="text-red-700 bg-red-50">
                            {assignments.filter((a: any) => a.status === 'cancelled').length} Cancelled
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {assignments.filter((a: any) => a.status !== 'cancelled').map((assignment: any) => {
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
          
          <TabsContent value="browse" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Available Volunteer Shifts
                </CardTitle>
                <CardDescription>
                  Sign up for shifts that match your availability and skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {shifts.map((shift: any) => (
                    <AuthenticatedShiftCard 
                      key={shift.id} 
                      shift={shift} 
                      volunteerId={currentVolunteer.id} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <VolunteerCalendar 
              volunteerId={currentVolunteer.id} 
              volunteerName={currentVolunteer.name} 
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <VolunteerProfile volunteer={currentVolunteer} />
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
            
            {/* Demo account only */}
            <div className="bg-blue-50 p-3 rounded-lg space-y-2">
              <p className="text-sm text-blue-800 font-medium">Demo Account Available:</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPhoneNumber("555-DEMO")}
                className="text-xs justify-start"
              >
                🎭 Demo: 555-DEMO - Test Account
              </Button>
              <p className="text-xs text-blue-600 mt-2">
                Use the demo account to explore volunteer portal features
              </p>
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