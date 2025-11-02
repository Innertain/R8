import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Phone, Calendar, Users, Heart, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import r4Logo from "@/assets/r4-logo.png";
import r8LogoWhite from "@assets/R8 LOGO_white400px_1753778033506.png";

export default function R4VolunteerLanding() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const r4Access = sessionStorage.getItem('r4VolunteerAccess');
    if (r4Access === 'granted') {
      window.location.href = '/volunteer';
    }
  }, []);

  // Set page title and description for SEO
  React.useEffect(() => {
    document.title = 'R4 Reach Volunteer Portal | Disaster Relief & Community Resilience';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join R4 Reach volunteer network for disaster relief and community resilience. Browse shifts, sign up, and make a difference in your community.');
    }
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Check if phone number exists in volunteer system
      const response = await fetch(`/api/volunteers/phone/${encodeURIComponent(phoneNumber)}`);
      
      if (response.ok) {
        const volunteer = await response.json();
        setAccessGranted(true);
        setMessage('Access granted! Welcome to the R4 Volunteer Portal.');

        // Clear any existing R8 access first to prevent conflicts
        sessionStorage.removeItem('platformAccess');
        sessionStorage.removeItem('accessUser');
        
        // Store R4 volunteer access in session (tied to r4VolunteerAccess flag)
        sessionStorage.setItem('r4VolunteerAccess', 'granted');
        sessionStorage.setItem('r4Volunteer', JSON.stringify(volunteer));
        sessionStorage.setItem('accessContext', 'r4_volunteer');

        // Redirect to volunteer portal after a short delay
        setTimeout(() => {
          window.location.href = '/volunteer';
        }, 2000);
      } else {
        setMessage('Phone number not found. Please sign up using the forms below or contact us for assistance.');
      }
    } catch (error) {
      setMessage('Error verifying phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (accessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={r4Logo}
                alt="R4 Reach Logo" 
                className="w-24 h-24"
              />
            </div>
            <CardTitle className="text-2xl text-green-400">Welcome Back!</CardTitle>
            <CardDescription className="text-white/80">
              Redirecting you to the volunteer portal...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={r4Logo} alt="R4 Reach" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-white">R4 Reach</h1>
              <p className="text-sm text-white/80">Volunteer Portal</p>
            </div>
          </div>
          <a href="/coming-soon" className="text-white/80 hover:text-white text-sm">
            About R8 Platform →
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Our Volunteer Network
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            R4 Reach coordinates disaster relief and community resilience efforts. 
            Sign in to browse shifts, manage your schedule, and make a difference.
          </p>
        </div>

        {/* Login Card */}
        <Card className="max-w-md mx-auto mb-12 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">Volunteer Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your phone number to access the volunteer portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg"
                  disabled={loading}
                  data-testid="input-phone"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !phoneNumber}
                data-testid="button-signin"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
              {message && (
                <Alert className={message.includes('granted') ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">New Volunteer?</h3>
          <p className="text-white/90 text-center mb-8">
            Sign up using one of the forms below to join our volunteer network
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://form.jotform.com/243318098770059"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
              data-testid="link-volunteer-signup"
            >
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h4 className="font-bold text-gray-900 mb-2">Volunteer Signup</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Join our general volunteer network for shifts and events
                </p>
                <Button variant="outline" className="w-full">
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </a>

            <a
              href="https://form.jotform.com/243316609742054"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
              data-testid="link-driver-signup"
            >
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h4 className="font-bold text-gray-900 mb-2">Driver Signup</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Help distribute supplies and transport resources
                </p>
                <Button variant="outline" className="w-full">
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </a>

            <a
              href="https://form.jotform.com/243364430721046"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
              data-testid="link-org-signup"
            >
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h4 className="font-bold text-gray-900 mb-2">Organization Signup</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Partner with us as a mutual aid organization
                </p>
                <Button variant="outline" className="w-full">
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Calendar className="w-10 h-10 text-blue-300 mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Browse Shifts</h4>
            <p className="text-white/80 text-sm">
              Find volunteer opportunities that match your schedule and interests
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Users className="w-10 h-10 text-green-300 mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Track Hours</h4>
            <p className="text-white/80 text-sm">
              Monitor your volunteer hours and see your impact on the community
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Heart className="w-10 h-10 text-red-300 mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Make Impact</h4>
            <p className="text-white/80 text-sm">
              Join a network of volunteers working toward disaster relief and community resilience
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 py-8 border-t border-white/20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={r4Logo} alt="R4 Reach" className="w-8 h-8" />
            <span className="text-white/60 text-sm">×</span>
            <img src={r8LogoWhite} alt="R8 Platform" className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm">
            R4 Reach volunteer portal powered by R8 platform technology
          </p>
          <p className="text-white/40 text-xs mt-2">
            A fiscally sponsored project of Valley Hope Foundation, a 501(c)(3) nonprofit
          </p>
        </div>
      </div>
    </div>
  );
}
