import { useState } from "react";
import { Search, Bell, Calendar, MapPin, RefreshCw, Settings, User, LogOut, BellRing, Volume2, VolumeX, MessageSquare, Sparkles, Timer, AlertTriangle, Mail, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ShiftCard from "@/components/ShiftCard";
import { fetchShiftsFromAirtable, type AirtableShift } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


// Use AirtableShift type from API module

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "John Doe", initials: "JD", email: "john.doe@example.com" });
  const [notificationSettings, setNotificationSettings] = useState({
    newShifts: true,
    shiftReminders: true,
    emergencyAlerts: true,
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: true,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch shifts from Airtable using React Query
  const { data: shifts = [], isLoading, error } = useQuery({
    queryKey: ['/api/shifts'],
    queryFn: fetchShiftsFromAirtable,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear cache on server and refresh data
      await apiRequest('POST', '/api/refresh-cache');
      await queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shift.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || locationFilter === "all" || 
                           (locationFilter === "remote" && shift.location.includes("Remote")) ||
                           (locationFilter === "downtown" && shift.location.toLowerCase().includes("downtown")) ||
                           (locationFilter === "suburbs" && !shift.location.toLowerCase().includes("downtown") && !shift.location.includes("Remote"));
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="text-blue-500 text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">VolunteerShift</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Settings */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative text-gray-500 hover:text-gray-700 settings-hover-effect">
                    <Bell className="w-5 h-5" />
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
                  <Button variant="ghost" className="relative w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                    {currentUser.initials}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/volunteer'}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Volunteer Portal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Settings",
                      description: "Account settings will be available soon.",
                    });
                  }}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Signed Out",
                      description: "You have been signed out successfully.",
                    });
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Shifts</h2>
            <p className="text-gray-600">Find and sign up for volunteer opportunities in your area</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Filter/Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              type="text" 
              placeholder="Search shifts..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="suburbs">Suburbs</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading volunteer shifts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 text-4xl mb-4 w-16 h-16" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load shifts</h3>
            <p className="text-gray-500 mb-6">Please check your connection and try again.</p>
          </div>
        ) : filteredShifts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} showSignup={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 text-4xl mb-4 w-16 h-16" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts available</h3>
            <p className="text-gray-500 mb-6">Check back later for new volunteer opportunities.</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              onClick={() => {
                setSearchQuery("");
                setLocationFilter("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span className="text-sm">Powered by</span>
            <img 
              src="/src/assets/r8-logo.png"
              alt="R8 Logo" 
              className="w-8 h-8"
            />
            <span className="text-sm font-medium">R8</span>
          </div>
        </div>
      </footer>
      


    </div>
  );
}
