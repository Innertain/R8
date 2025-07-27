import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, User, Calendar, UserPlus, LogIn } from 'lucide-react';
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

  // If logged in, show the calendar
  if (currentVolunteer) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Volunteer Portal</h1>
            <p className="text-gray-600">Manage your availability and shifts</p>
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

        <VolunteerCalendar 
          volunteerId={currentVolunteer.id} 
          volunteerName={currentVolunteer.name} 
        />
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