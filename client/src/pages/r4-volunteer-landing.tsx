import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Phone, Calendar, Users, Heart, MapPin, ArrowRight, ExternalLink, Truck } from 'lucide-react';
import { Link } from 'wouter';
import r4Logo from "@/assets/r4-logo.png";
import r8LogoWhite from "@assets/R8 LOGO_white400px_1753778033506.png";
import appalachianLandscape from "@assets/Appalachian _1754183249913.png";

export default function R4VolunteerLanding() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if already logged in - only on mount
  useEffect(() => {
    const r4Access = sessionStorage.getItem('r4VolunteerAccess');
    const hasChecked = sessionStorage.getItem('r4LoginChecked');
    
    if (r4Access === 'granted' && !hasChecked) {
      sessionStorage.setItem('r4LoginChecked', 'true');
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
        sessionStorage.setItem('r4LoginChecked', 'true');

        // Redirect to volunteer portal after a short delay
        setTimeout(() => {
          window.location.replace('/volunteer');
        }, 1500);
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
      <div className="min-h-screen bg-gradient-to-br from-stormy-dark to-stormy-primary/20 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-stormy-dark to-stormy-primary/20">
      {/* Hero Section with R4 Branding */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Extended Background to Prevent Gaps */}
        <div className="absolute inset-0" style={{ top: '-100px', height: 'calc(100% + 200px)' }}>
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-70" 
            style={{ 
              backgroundImage: `url(${appalachianLandscape})`,
              transform: `translateY(${scrollY * 0.5}px)`,
              willChange: 'transform'
            }}
          />
        </div>

        {/* Extended Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stormy-dark/80 via-stormy-dark/70 to-stormy-dark/60" style={{ top: '-100px', height: 'calc(100% + 200px)' }} />

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 lg:px-6 py-12 lg:py-16">
          <div className="text-center space-y-8 lg:space-y-12 max-w-5xl mx-auto">
            {/* Prominent R4 Branding */}
            <div className="space-y-3 lg:space-y-6">
              <div className="flex items-center justify-center space-x-6">
                <img 
                  src={r4Logo}
                  alt="R4 Reach Logo" 
                  className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
                />
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
                  R4 Reach
                </h1>
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold text-white drop-shadow-lg">
                Volunteer Portal
              </h2>
              <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Join our volunteer network for disaster relief and community resilience. 
                Sign in to browse shifts, manage your schedule, and make a difference.
              </p>
            </div>

            {/* Login Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">Volunteer Sign In</h3>

              <form onSubmit={handlePhoneSubmit} className="max-w-md mx-auto space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-emerald-400 focus:ring-emerald-400"
                      disabled={loading}
                      data-testid="input-phone"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter your registered phone number to access the volunteer portal
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !phoneNumber.trim()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 transition-all duration-300"
                    data-testid="button-signin"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>

                  {message && (
                    <Alert className={`${message.includes('granted') ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'}`}>
                      <AlertDescription className={`${message.includes('granted') ? 'text-green-400' : 'text-yellow-400'}`}>
                        {message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-600">
                <div className="text-center space-y-4">
                  <h4 className="text-lg font-semibold text-white">New Volunteer?</h4>
                  <p className="text-gray-300 text-sm">
                    Sign up using one of the forms below to join our volunteer network
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <Button 
                      size="sm" 
                      className="bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
                      onClick={() => window.open('https://form.jotform.com/243318098770059', '_blank')}
                      data-testid="link-volunteer-signup"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Volunteer Signup
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
                      onClick={() => window.open('https://form.jotform.com/243316609742054', '_blank')}
                      data-testid="link-driver-signup"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Driver Signup
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-slate-700 text-white hover:bg-slate-600 border border-slate-600"
                      onClick={() => window.open('https://form.jotform.com/243364430721046', '_blank')}
                      data-testid="link-org-signup"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Organization
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Volunteer with R4 Reach?</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Make a real difference in your community through organized disaster relief and resilience efforts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <Calendar className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Browse Shifts</h3>
              <p className="text-gray-300">
                Find volunteer opportunities that match your schedule and interests across disaster relief and community projects
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <Users className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Track Your Impact</h3>
              <p className="text-gray-300">
                Monitor your volunteer hours and see the tangible impact you're making in the community
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <Heart className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Join a Network</h3>
              <p className="text-gray-300">
                Connect with a community of volunteers working toward disaster relief and long-term community resilience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-slate-900 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={r4Logo} alt="R4 Reach" className="w-12 h-12" />
              <div>
                <p className="text-white font-semibold">R4 Reach Volunteer Portal</p>
                <p className="text-gray-400 text-sm">Powered by R8 platform technology</p>
              </div>
            </div>
            
            <Link href="/coming-soon">
              <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn About R8 Platform
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-700 text-center">
            <p className="text-gray-400 text-sm">
              A fiscally sponsored project of Valley Hope Foundation, a 501(c)(3) nonprofit
            </p>
            <p className="text-gray-500 text-xs mt-2">
              &copy; 2025 R4 Reach. Empowering grassroots mutual aid with the best technology tools.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
