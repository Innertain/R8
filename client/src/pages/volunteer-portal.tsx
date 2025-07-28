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
import { Phone, User, Calendar, UserPlus, LogIn, CheckCircle, Clock, XCircle, CalendarDays, Trash2, CalendarPlus, Settings, Save, Mail, MapPin, Heart, Briefcase, Bell, List, UserCheck, UserX, Pause, Shield, BellRing, MessageSquare, LogOut, Sparkles, Timer, AlertTriangle, Smartphone } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
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
                    <Badge key={type} className="bg-blue-100 text-blue-900 border border-blue-300">{type}</Badge>
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notificationSettings, setNotificationSettings] = useState({
    newShifts: true,
    shiftReminders: true,
    emergencyAlerts: true,
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: true,
  });

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
    const details = encodeURIComponent(`Volunteer assignment: ${assignment.notes || 'No additional notes'}\n\nLocation: ${shift?.location || 'TBD'}\nStatus: ${assignment.status}`);
    const location = encodeURIComponent(shift?.location || 'Location TBD');
    
    // Parse actual shift date/time data
    let startDate: Date;
    let endDate: Date;
    
    if (shift?.dateTime) {
      // Parse the dateTime format from Airtable (e.g., "Wednesday, Jul 30 • 7:00 PM - 10:00 PM")
      const dateTimeStr = shift.dateTime;
      
      try {
        // Extract components from the date string
        const dateMatch = dateTimeStr.match(/(\w+),\s+(\w+)\s+(\d+)/);
        const timeMatch = dateTimeStr.match(/(\d+):(\d+)\s+(AM|PM)\s*-\s*(\d+):(\d+)\s+(AM|PM)/);
        
        if (dateMatch && timeMatch) {
          const [, , month, day] = dateMatch;
          const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;
          
          // Get current year and construct date
          const currentYear = new Date().getFullYear();
          const monthMap: Record<string, number> = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          
          const monthNum = monthMap[month] ?? 6; // Default to July if not found
          const dayNum = parseInt(day);
          
          // Convert 12-hour to 24-hour format for start time
          let startHour24 = parseInt(startHour);
          if (startPeriod === 'PM' && startHour24 !== 12) startHour24 += 12;
          if (startPeriod === 'AM' && startHour24 === 12) startHour24 = 0;
          
          // Convert 12-hour to 24-hour format for end time
          let endHour24 = parseInt(endHour);
          if (endPeriod === 'PM' && endHour24 !== 12) endHour24 += 12;
          if (endPeriod === 'AM' && endHour24 === 12) endHour24 = 0;
          
          startDate = new Date(currentYear, monthNum, dayNum, startHour24, parseInt(startMin));
          endDate = new Date(currentYear, monthNum, dayNum, endHour24, parseInt(endMin));
          
          // Handle case where end time is next day (e.g., 11 PM to 2 AM)
          if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
          }
        } else {
          throw new Error('Unable to parse date/time format');
        }
      } catch (error) {
        console.log('Could not parse shift dateTime, using default:', error);
        // Fallback to default times
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 1); // Tomorrow
        startDate.setHours(9, 0, 0, 0); // 9 AM
        
        endDate = new Date(startDate);
        endDate.setHours(12, 0, 0, 0); // 12 PM (3 hours)
      }
    } else {
      // No dateTime provided, use defaults
      startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Tomorrow
      startDate.setHours(9, 0, 0, 0); // 9 AM
      
      endDate = new Date(startDate);
      endDate.setHours(12, 0, 0, 0); // 12 PM (3 hours)
    }
    
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
        // If assignment exists and is cancelled, update it instead of creating new one
        if (existingAssignment && existingAssignment.status === 'cancelled') {
          const response = await fetch(`/api/assignments/${existingAssignment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'confirmed',
              notes: `Re-signed up via volunteer portal - ${new Date().toLocaleDateString()}`
            })
          });
          if (!response.ok) throw new Error('Failed to re-sign up');
          return response.json();
        } else if (!existingAssignment) {
          // Create new assignment only if none exists
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
        } else {
          // User is already signed up - don't throw error, just return success
          return { message: 'Already signed up', existingAssignment };
        }
      },
      onSuccess: (data) => {
        // Invalidate all related queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/assignments/volunteer', volunteerId] });
        queryClient.invalidateQueries({ queryKey: ['/api/availability', volunteerId] }); // Refresh calendar
        
        if (data.message === 'Already signed up') {
          toast({
            title: "Already Registered",
            description: "You're already signed up for this shift. Check the 'My Shifts' tab to manage it.",
          });
        } else {
          toast({
            title: "Successfully Signed Up!",
            description: "You've been registered for this volunteer shift.",
          });
        }
      },
      onError: (error: any) => {
        console.error('Sign up error:', error);
        
        // Check if it's a duplicate assignment error
        if (error.status === 409 || (error.message && error.message.includes('already signed up'))) {
          toast({
            title: "Already Signed Up",
            description: "You're already registered for this shift. Check the 'My Shifts' tab to manage your assignments.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: "There was an error signing up for this shift. Please try again.",
            variant: "destructive",
          });
        }
      },
    });

    const cancelMutation = useMutation({
      mutationFn: async () => {
        const response = await fetch(`/api/assignments/${existingAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'cancelled',
            notes: `Cancelled via volunteer portal - ${new Date().toLocaleDateString()}`
          })
        });
        if (!response.ok) throw new Error('Failed to cancel');
        return response.json();
      },
      onSuccess: () => {
        // Invalidate and force refetch all related queries to refresh the UI immediately
        queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/assignments/volunteer', volunteerId] });
        queryClient.invalidateQueries({ queryKey: ['/api/availability', volunteerId] });
        
        // Force immediate refetch to ensure UI updates right away
        queryClient.refetchQueries({ queryKey: ['/api/shifts'] });
        queryClient.refetchQueries({ queryKey: ['/api/assignments/volunteer', volunteerId] });
        
        toast({
          title: "Assignment Cancelled",
          description: "You've been removed from this volunteer shift. You can sign up again if needed.",
        });
      },
      onError: () => {
        toast({
          title: "Cancel Failed",
          description: "There was an error cancelling this shift. Please try again.",
          variant: "destructive",
        });
      },
    });

    // Check if user is already signed up for this shift using component's own assignments data
    const existingAssignment = assignments?.find((assignment: any) => 
      String(assignment.shiftId).trim() === String(shift.id).trim()
    );
    
    const isSignedUp = existingAssignment && existingAssignment.status !== 'cancelled';
    const isCancelled = existingAssignment && existingAssignment.status === 'cancelled';
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
            <Badge className={shift.status === 'urgent' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-green-100 text-green-900 border border-green-300'}>
              {shift.status}
            </Badge>
            {isSignedUp && (
              <Badge className="bg-blue-100 text-blue-900 border border-blue-300 text-xs">
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
        
        <div className="space-y-2">
          {isSignedUp ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">You're Registered</p>
                    <p className="text-xs text-green-600">Status: {existingAssignment?.status || 'Confirmed'}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-900 border border-green-300">
                  Confirmed
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancel
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    // Trigger the dashboard tab (My Shifts) programmatically
                    const dashboardTab = document.querySelector('[data-state="inactive"][value="dashboard"]') as HTMLElement;
                    if (dashboardTab) {
                      dashboardTab.click();
                    } else {
                      // Already on dashboard tab
                      toast({
                        title: "Already Viewing My Shifts",
                        description: "You're already on the My Shifts tab. Your assignments are displayed above.",
                      });
                    }
                  }}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  My Shifts
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className={`w-full ${
                isFull 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : isCancelled
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              onClick={() => signUpMutation.mutate(shift.id)}
              disabled={isFull || signUpMutation.isPending}
            >
              {isFull ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Shift Full
                </>
              ) : signUpMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {isCancelled ? 'Re-registering...' : 'Registering...'}
                </>
              ) : isCancelled ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Register Again
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register for Shift
                </>
              )}
            </Button>
          )}
          
          {isCancelled && !isSignedUp && (
            <div className="flex items-center justify-center p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <Pause className="w-4 h-4 text-orange-600 mr-2" />
              <p className="text-xs text-orange-700">Previously cancelled - you can register again</p>
            </div>
          )}
        </div>
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
            {/* Notification Settings */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative text-gray-500 hover:text-gray-700 settings-hover-effect">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BellRing className="w-5 h-5" />
                    Notification Settings
                  </DialogTitle>
                  <DialogDescription>
                    Manage how you receive updates about volunteer opportunities, shifts, and emergency alerts.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          New Shifts Available
                        </label>
                        <p className="text-xs text-muted-foreground">Get notified when new volunteer opportunities match your preferences</p>
                      </div>
                      <Switch
                        checked={notificationSettings.newShifts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, newShifts: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          Shift Reminders
                        </label>
                        <p className="text-xs text-muted-foreground">Reminders before your upcoming volunteer shifts</p>
                      </div>
                      <Switch
                        checked={notificationSettings.shiftReminders}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, shiftReminders: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Emergency Alerts
                        </label>
                        <p className="text-xs text-muted-foreground">Critical alerts for urgent volunteer needs and emergency situations</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emergencyAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, emergencyAlerts: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Notifications
                        </label>
                        <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          SMS Notifications
                        </label>
                        <p className="text-xs text-muted-foreground">Text message alerts to your phone</p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          Push Notifications
                        </label>
                        <p className="text-xs text-muted-foreground">Browser and device notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Settings Saved",
                          description: "Your notification preferences have been updated.",
                        });
                      }}
                      className="w-full"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {currentVolunteer.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'V'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-medium text-sm">{currentVolunteer.name}</p>
                    <p className="text-xs text-gray-500">{currentVolunteer.phone || currentVolunteer.phoneNumber}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentVolunteer.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentVolunteer.phone || currentVolunteer.phoneNumber}
                    </p>
                    {currentVolunteer.isDriver && (
                      <Badge variant="secondary" className="w-fit text-xs">
                        Driver
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/'}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Browse All Shifts</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Account Settings",
                    description: "Advanced account settings will be available soon.",
                  });
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <Card className="card-hover-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 activity-icon" />
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
                    <Button onClick={() => window.location.href = '/'} className="btn-hover-effect">
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
                        <Badge variant="secondary" className="text-green-900 bg-green-100 border border-green-300">
                          {assignments.filter((a: any) => a.status === 'confirmed').length} Confirmed
                        </Badge>
                        {assignments.filter((a: any) => a.status === 'cancelled').length > 0 && (
                          <Badge variant="secondary" className="text-red-900 bg-red-100 border border-red-300">
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
                        const statusColor = assignment.status === 'confirmed' ? 'text-green-900 bg-green-100 border border-green-300' : 
                                          assignment.status === 'pending' ? 'text-yellow-900 bg-yellow-100 border border-yellow-300' : 'text-red-900 bg-red-100 border border-red-300';
                        const StatusIcon = statusIcon;
                        
                        return (
                          <Card key={assignment.id} className="border-l-4 border-l-blue-500 card-hover-effect">
                            <CardContent className="p-4 shift-card-content">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">
                                      {matchedShift?.activityName || 'River Clean up'}
                                    </h4>
                                    <Badge 
                                      variant="outline"
                                      className={`flex items-center gap-1 ${statusColor} status-badge transition-all duration-300`}
                                    >
                                      <StatusIcon className="h-3 w-3 activity-icon" />
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
                                      className="flex items-center gap-1 text-xs btn-hover-effect"
                                    >
                                      <CalendarPlus className="h-3 w-3 activity-icon" />
                                      Add to Calendar
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 btn-hover-effect"
                                        >
                                          <Trash2 className="h-3 w-3 activity-icon" />
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
            <Card className="card-hover-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 activity-icon" />
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

        <Card className="card-hover-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 activity-icon" />
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
                className="text-xs justify-start btn-hover-effect"
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
              className="w-full btn-hover-effect"
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
              <Button variant="outline" onClick={() => setShowRegister(false)} className="btn-hover-effect">
                Cancel
              </Button>
              <Button 
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                className="btn-hover-effect"
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