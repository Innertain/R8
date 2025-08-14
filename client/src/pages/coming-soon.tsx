import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Phone, Shield, Users, Globe, ArrowRight, Leaf, Mountain, Waves, Eye, Heart, TrendingUp, Zap, Search, Database, Satellite, Network, TreePine, AlertTriangle, MapPin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import r8LogoWhite from "@assets/R8 LOGO_white400px_1753778033506.png";
import hawaiiLandscape from "@assets/Hawaii_1754183003386.png";
import appalachianLandscape from "@assets/Appalachian _1754183249913.png";
import { AnimatedCounter } from '@/components/ui/animated-counter';


export default function ComingSoonPage() {
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

  // Allow this landing page to be indexed by search engines
  React.useEffect(() => {
    const robotsMeta = document.getElementById('robots-meta');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'index, follow');
    }

    // Set page title and description for SEO
    document.title = 'R8 - Resilience, Response, Regeneration | Coming Soon';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'R8 platform connecting mutual aid networks with disaster supply sites, coordinating volunteers across bioregional regeneration projects. Coming soon - request demo access.');
    }

    // Cleanup function to restore noindex when leaving this page
    return () => {
      const robotsMeta = document.getElementById('robots-meta');
      if (robotsMeta) {
        robotsMeta.setAttribute('content', 'noindex, nofollow');
      }
    };
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Check if phone number is whitelisted
      const response = await fetch(`/api/whitelist/verify/${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();

      if (data.success && data.whitelisted) {
        setAccessGranted(true);
        setMessage('Access granted! You can now explore the platform.');

        // Store access token in session
        sessionStorage.setItem('platformAccess', 'granted');
        sessionStorage.setItem('accessUser', JSON.stringify(data.user));

        // Redirect to main app after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setMessage('Phone number not found in our access list. Please contact our team for demo access.');
      }
    } catch (error) {
      setMessage('Error verifying access. Please try again.');
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
                src={r8LogoWhite}
                alt="R8 Logo" 
                className="w-16 h-16 mr-4"
              />
              <h1 className="text-4xl font-bold tracking-wide gradient-text-r8">R8</h1>
            </div>
            <CardTitle className="text-2xl text-green-400">Access Granted!</CardTitle>
            <CardDescription className="text-white/80">
              Welcome to the Regenerative 8 platform. Redirecting you to the main application...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stormy-dark to-stormy-primary/20">
      {/* Hero Section with R8 Branding */}
      <div className="relative min-h-auto hero-mobile overflow-hidden">
        {/* Single Consistent Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-70" 
            style={{ backgroundImage: `url(${appalachianLandscape})` }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stormy-dark/70 via-stormy-dark/60 to-stormy-dark/50" />

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center lg:min-h-screen px-4 lg:px-6 py-4 lg:py-12">
          <div className="text-center space-y-4 lg:space-y-12 max-w-5xl mx-auto">
            {/* Prominent R8 Branding */}
            <div className="space-y-3 lg:space-y-6">
              <div className="flex items-center justify-center space-x-6">
                <img 
                  src={r8LogoWhite}
                  alt="R8 Logo" 
                  className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
                />
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
                  R8
                </h1>
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold text-white drop-shadow-lg">
                Resilience • Response • Regeneration
              </h2>
              <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                A comprehensive platform connecting mutual aid networks with disaster supply sites, 
                coordinating volunteers across bioregional regeneration projects, and building resilient communities 
                through integrated response systems.
              </p>
            </div>

            {/* Login Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">Request Platform Access</h3>

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
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter your phone number to check access eligibility
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !phoneNumber.trim()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying Access...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Request Access
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

              <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="text-center space-y-4">
                  <h4 className="text-lg font-semibold text-white">Don't have access yet?</h4>
                  <p className="text-gray-300 text-sm">
                    R8 is currently in limited beta. Contact our team to request demo access for your organization.
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
                      onClick={() => window.open('mailto:access@regenerative8.org?subject=Platform Access Request', '_blank')}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Email Us
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            </div>
        </div>
      </div>
      

      
      {/* Mission Section */}
<section className="relative py-6 lg:py-20 min-h-[35vh] lg:min-h-screen flex items-center overflow-hidden -mt-12 lg:-mt-32">
        {/* Extended Parallax Background */}
        <div 
          className="absolute inset-0 w-full"
          style={{
            backgroundImage: `url(${appalachianLandscape})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(${scrollY * 0.3}px)`,
            willChange: 'transform',
            top: '-10px',
            height: 'calc(100% + 20px)',
          }}
        />
        
        {/* Gradient Overlay for Seamless Transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-stormy-dark/50 via-stormy-dark/70 to-stormy-dark/90" />
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 lg:px-6 w-full">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-8 pt-2 lg:pt-20">Our Mission</h2>
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 lg:p-12 border border-slate-700/50 shadow-2xl">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-emerald-400 mb-6 lg:mb-8">
                Empowering mutual aid for regenerative disaster response and recovery.
              </h3>
              <div className="bg-slate-700/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 border border-slate-600/50">
                <p className="text-lg lg:text-xl text-white font-medium text-center">
                  R8 is a resource matching platform for disaster relief, humanitarian aid, and regeneration.
                </p>
              </div>
              <div className="space-y-4 lg:space-y-6 text-left max-w-5xl mx-auto">
                <p className="text-lg lg:text-xl text-gray-200 leading-relaxed">
                  <span className="font-semibold text-white">Real talk:</span> The majority of people recognize that disasters—whether fueled by climate change, systemic failures, or sudden crises—are a growing emergency.
                </p>
                <p className="text-lg lg:text-xl text-gray-200 leading-relaxed">
                  Local grassroots communities have real, proven solutions that address root causes and help communities adapt.
                </p>
                <p className="text-lg lg:text-xl text-gray-200 leading-relaxed">
                  Yet, these efforts are largely invisible in mainstream media and receive 
                  <span className="font-bold text-red-400"> less than 2% of global funding</span>, 
                  despite being some of the most effective, scalable, and cost-efficient approaches to disaster response and long-term resilience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Impact Statistics - Still within the mountain background */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 mt-6 lg:mt-20 stats-section-mobile">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4">Real Impact</h2>
            <p className="text-base lg:text-lg text-gray-300 px-4">
              Real numbers from communities using R8 for mutual aid and disaster response
            </p>
          </div>

        {/* Main Stats Grid - Top Row - Desktop Constrained, Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-3 xl:gap-4 max-w-5xl xl:max-w-6xl mx-auto mb-4 lg:mb-6 stats-grid-mobile">
          {/* Supply Sites */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Supply Sites</h3>
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-blue-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={425} duration={2000} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Active locations</p>
          </div>

          {/* Completed Deliveries */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Completed Deliveries</h3>
              <div className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 flex-shrink-0 mt-0.5 text-center">✓</div>
            </div>
            <div className="text-lg lg:text-xl font-bold text-green-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={1219} duration={2200} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Successfully delivered</p>
          </div>

          {/* Food Boxes */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Food Boxes</h3>
              <div className="w-3 h-3 lg:w-4 lg:h-4 text-orange-500 flex-shrink-0 mt-0.5 text-center">📦</div>
            </div>
            <div className="text-lg lg:text-xl font-bold text-orange-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={101790} duration={2400} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Total distributed</p>
          </div>

          {/* Volunteers */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Volunteers</h3>
              <Users className="w-3 h-3 lg:w-4 lg:h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-purple-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={69} duration={2600} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Active volunteers</p>
          </div>

          {/* Drivers */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Drivers</h3>
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-orange-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={208} duration={2800} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Available drivers</p>
          </div>

          {/* Estimated Families Helped */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Families Helped</h3>
              <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-cyan-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={23248} duration={3000} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Site estimates*</p>
          </div>
        </div>

        {/* Secondary Stats Grid - Bottom Row - Desktop Constrained, Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-3 xl:gap-4 max-w-4xl mx-auto stats-grid-mobile">
          {/* Active Sites (60 days) */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Active Sites (60 days)</h3>
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 flex-shrink-0 mt-0.5" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-green-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={240} duration={2000} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Updated inventory recently</p>
          </div>

          {/* Sites with Deliveries */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Sites with Deliveries</h3>
              <div className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500 flex-shrink-0 mt-0.5 text-center">🚚</div>
            </div>
            <div className="text-lg lg:text-xl font-bold text-blue-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={1295} duration={2200} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Received aid deliveries</p>
          </div>

          {/* Sites with Recent Activity */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Recent Activity</h3>
              <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-red-500 flex-shrink-0 mt-0.5" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-red-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={154} duration={2400} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Active requests or needs</p>
          </div>

          {/* Mutual Aid Partners */}
          <div className="bg-white rounded-xl p-3 lg:p-4 shadow-lg stats-card-mobile overflow-hidden">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600 leading-tight flex-1">Aid Partners</h3>
              <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-purple-600 mb-1 stats-number leading-none">
              <AnimatedCounter end={49} duration={2600} />
            </div>
            <p className="text-xs text-gray-500 leading-tight">Partner organizations</p>
          </div>
        </div>

        <div className="text-center mt-6 lg:mt-8">
          <p className="text-sm text-gray-400 px-4">
            Updated in real-time from active mutual aid networks
          </p>
        </div>

        {/* Mutual Aid Partners Attribution */}
        <div className="mt-8 lg:mt-12 bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-slate-700/50">
          <div className="text-center mb-6">
            <h3 className="text-xl lg:text-2xl font-semibold text-white mb-4">
              Grateful for Our Mutual Aid Partners
            </h3>
            <p className="text-gray-300 text-base lg:text-lg max-w-3xl mx-auto px-4">
              These numbers represent the collaborative efforts of dedicated organizations working together 
              to build resilient communities and coordinate disaster response.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mt-6 lg:mt-8">
            <div className="text-center">
              <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-3 min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-xl font-bold text-emerald-400 mb-1 leading-tight">Valley Hope Foundation</div>
                <p className="text-xs text-gray-400 leading-tight">Community resilience partner</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-3 min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-xl font-bold text-blue-400 mb-1 leading-tight">R4 Reach</div>
                <p className="text-xs text-gray-400 leading-tight">Resource coordination network</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-3 min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-xl font-bold text-cyan-400 mb-1 leading-tight">WNC Supply Sites</div>
                <p className="text-xs text-gray-400 leading-tight">Western NC disaster relief</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-3 min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-xl font-bold text-red-400 mb-1 leading-tight">Aid Arena</div>
                <p className="text-xs text-gray-400 leading-tight">Crisis response coordination platform</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-3 min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-xl font-bold text-purple-400 mb-1 leading-tight">Regional Networks</div>
                <p className="text-xs text-gray-400 leading-tight">Local mutual aid groups</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-3 min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-base lg:text-xl font-bold text-orange-400 mb-1 leading-tight">Community Partners</div>
                <p className="text-xs text-gray-400 leading-tight">Grassroots organizations</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-6 border-t border-slate-600">
            <p className="text-gray-300">
              <span className="font-semibold text-white">Thank you</span> to Valley Hope Foundation, R4 Reach, 
              WNC Supply Sites, Aid Arena, and the many other mutual aid partners who make this collaborative platform possible. 
              Together, we're building stronger, more resilient communities.
            </p>
          </div>
        </div>
        </div>
      </section>
      {/* Driver Network & Logistics Section */}
      <section className="py-4 lg:py-20 bg-gradient-to-b from-stormy-primary/20 to-stormy-dark/90 -mt-8 lg:mt-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-white mb-3 lg:mb-6">
              Driver Network & Distribution Logistics
            </h2>
            <p className="text-sm lg:text-xl text-white/80 max-w-4xl mx-auto px-4">
              Our coordinated driver network enables rapid, efficient distribution of aid from supply sites to communities. 
              We've established a proven logistics platform for mutual aid coordination and resource delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10 lg:mb-16">
            {/* Driver Network Overview */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
                  <div className="text-2xl">🚚</div>
                </div>
                <h3 className="text-2xl font-semibold text-white">Driver Network Platform</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-white mb-2">Comprehensive Logistics System</h4>
                  <p className="text-gray-300 text-sm">
                    Coordinated network for efficient aid distribution from supply sites to communities
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span>Real-time driver availability tracking</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span>Route optimization for efficient deliveries</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span>Volunteer coordination and scheduling</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span>Multi-bioregion coverage capabilities</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Process */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mr-4">
                  <Network className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Distribution Process</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Supply Site Coordination</h4>
                    <p className="text-gray-400 text-sm">Connect with 425+ supply sites to identify available resources and urgent needs</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-400 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Driver Assignment</h4>
                    <p className="text-gray-400 text-sm">Match available drivers with delivery requests based on location and capacity</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Route Optimization</h4>
                    <p className="text-gray-400 text-sm">Plan efficient routes to maximize deliveries and minimize travel time</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-400 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Real-time Tracking</h4>
                    <p className="text-gray-400 text-sm">Monitor delivery progress and update communities on aid arrival times</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Highlights */}
          <div className="bg-gradient-to-r from-slate-800/70 to-slate-700/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/50">
            <h3 className="text-2xl font-semibold text-white mb-8 text-center">Logistics Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-3">📦</div>
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  <AnimatedCounter end={101790} duration={3000} />
                </div>
                <div className="text-white font-medium mb-1">Food Boxes Distributed</div>
                <div className="text-gray-400 text-sm">Delivered to families across multiple bioregions</div>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">🏠</div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  <AnimatedCounter end={23248} duration={3200} />
                </div>
                <div className="text-white font-medium mb-1">Estimated Families Helped</div>
                <div className="text-gray-400 text-sm">Based on delivery records and site estimates</div>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-3">🌍</div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  <AnimatedCounter end={425} duration={2800} />
                </div>
                <div className="text-white font-medium mb-1">Connected Supply Sites</div>
                <div className="text-gray-400 text-sm">Active locations in our distribution network</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-600">
              <p className="text-center text-gray-300">
                <span className="font-semibold text-white">Efficient Coordination:</span> Our driver network reduces response times from days to hours, 
                ensuring critical aid reaches communities when they need it most. Through bioregional coordination, 
                we leverage local knowledge and existing community relationships for maximum impact.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Features Preview Section with Hawaii Background */}
      <section className="py-20 bg-gradient-to-b from-stormy-dark/95 to-stormy-primary/30 relative overflow-hidden">
        {/* Hawaii Landscape Background */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `url(${hawaiiLandscape})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stormy-dark/85 via-stormy-primary/70 to-stormy-dark/85"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for Community Resilience
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Connecting mutual aid networks with disaster supply sites, coordinating volunteers across bioregional regeneration projects. R8 provides the tools communities need to respond, recover, and regenerate.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Mutual Aid Networks</h3>
                <p className="text-gray-400">Connect communities with disaster relief resources and volunteer coordination.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Database className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Supply Site Mapping</h3>
                <p className="text-gray-400">Real-time mapping of disaster supply sites and resource availability.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 text-blue-400">🚚</div>
                </div>
                <h3 className="text-xl font-semibold text-white">Driver Network & Logistics</h3>
                <p className="text-gray-400">Coordinate our driver network and logistics platform to efficiently distribute aid from supply sites to communities in need.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Real-time Alerts</h3>
                <p className="text-gray-400">Stay informed with real-time disaster alerts and emergency notifications.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Volunteer Management</h3>
                <p className="text-gray-400">Comprehensive tools for volunteer coordination, scheduling, vetting, and management across disaster response and regeneration projects.</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <TreePine className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Regenerative Projects</h3>
                <p className="text-gray-400">Build long-term community resilience through ecological restoration.</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto mt-20">
            <h3 className="text-3xl font-semibold text-white mb-8 text-center">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="what-is-r8" className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-emerald-400 text-left">
                  What is R8 and how does it work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base leading-relaxed">
                  R8 is a comprehensive platform that connects mutual aid networks with disaster supply sites and coordinates volunteers across bioregional regeneration projects. It works by creating a unified system where communities can share resources, coordinate response efforts, and build long-term resilience through integrated planning and communication tools.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="who-can-use" className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-emerald-400 text-left">
                  Who can use the R8 platform?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base leading-relaxed">
                  R8 is designed for mutual aid organizations, disaster response teams, community organizers, environmental groups, and individuals who want to contribute to community resilience. The platform serves both emergency response coordinators and long-term regeneration project managers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features" className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-emerald-400 text-left">
                  What features does R8 include?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base leading-relaxed">
                  R8 includes real-time disaster mapping, volunteer coordination tools, supply site tracking, bioregional project management, emergency alert systems, mutual aid network integration, and long-term community resilience planning tools. The platform brings together immediate response capabilities with sustainable regeneration planning.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data-sources" className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-emerald-400 text-left">
                  What data sources does R8 integrate?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base leading-relaxed">
                  R8 integrates multiple authoritative data sources including NOAA climate data, FEMA disaster declarations, NASA Earth observation data, USGS geological information, and real-time feeds from emergency management agencies. This ensures users have access to the most current and reliable information for decision-making.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bioregions" className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-emerald-400 text-left">
                  How does the bioregional approach work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base leading-relaxed">
                  R8's bioregional approach recognizes that ecological and social systems extend beyond political boundaries. The platform organizes projects and resources around natural ecological regions, allowing for more effective coordination of regeneration efforts and resource sharing based on shared environmental and cultural characteristics.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="getting-started" className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-emerald-400 text-left">
                  How can I get started with R8?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base leading-relaxed">
                  Request access through the form above to join our demo program. We're currently working with select organizations and communities to refine the platform before the full public launch. Early access users help us test features and provide feedback to ensure R8 meets real-world community needs.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-stormy-dark border-t border-stormy-light/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
            {/* Logo and Mission */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <img 
                  src={r8LogoWhite}
                  alt="R8 Logo" 
                  className="w-10 h-10 mr-3"
                />
                <span className="text-2xl font-bold text-white">R8</span>
              </div>
              <p className="text-white/80 text-lg mb-4">
                <span className="text-blue-400 font-semibold">Resilience</span> • <span className="text-red-400 font-semibold">Response</span> • <span className="text-green-400 font-semibold">Regeneration</span>
              </p>
              <p className="text-white/60 text-sm">
                Empowering grassroots mutual aid with the best technology tools and network.
              </p>
            </div>

            {/* Contact Links */}
            <div className="text-center lg:text-left">
              <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-3">
                <div>
                  <a 
                    href="https://form.jotform.com/250033214947047" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm block"
                  >
                    Contact R8 →
                  </a>
                </div>
                <div>
                  <a 
                    href="https://form.jotform.com/243608573773062" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm block"
                  >
                    Contact Supply Sites →
                  </a>
                </div>
                <div>
                  <a 
                    href="https://app.jotform.com/243556240110141/250086799464067" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm block"
                  >
                    Contact R4 →
                  </a>
                </div>
              </div>
            </div>

            {/* Fiscal Sponsor */}
            <div className="text-center lg:text-left">
              <h3 className="text-white font-semibold text-lg mb-4">Fiscal Sponsor</h3>
              <div className="space-y-2">
                <p className="text-white/80 text-sm">
                  Our fiscal sponsor is <span className="font-medium">4Reach</span> – Resilience Relief & Recovery Reach 501(c)3
                </p>
                <div>
                  <a 
                    href="https://r4reach.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                  >
                    Visit R4 Reach →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 pt-8 text-center">
            <div className="text-sm text-white/60">
              &copy; 2025 R8. Empowering grassroots mutual aid with the best technology tools and network.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}