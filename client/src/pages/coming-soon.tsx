import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Phone, Shield, Users, Globe, ArrowRight, Leaf, Mountain, Waves, Eye, Heart, TrendingUp, Zap, Search, Database, Satellite } from 'lucide-react';
import r8LogoWhite from "@assets/R8 LOGO_white400px_1753778033506.png";
import hawaiiLandscape from "@assets/Hawaii_1754183003386.png";
import appalachianLandscape from "@assets/Appalachian _1754183249913.png";

export default function ComingSoonPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);

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
      <div className="relative h-screen overflow-hidden">
        {/* Background Images Collage */}
        <div className="absolute inset-0 grid grid-cols-2">
          <div 
            className="bg-cover bg-center opacity-60" 
            style={{ backgroundImage: `url(${hawaiiLandscape})` }}
          />
          <div 
            className="bg-cover bg-center opacity-60" 
            style={{ backgroundImage: `url(${appalachianLandscape})` }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stormy-dark/80 via-stormy-primary/70 to-stormy-dark/90" />

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <div className="text-center max-w-6xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <img 
                src={r8LogoWhite}
                alt="R8 Logo" 
                className="w-20 h-20 mr-4"
              />
              <h1 className="text-6xl font-bold tracking-wide gradient-text-r8">R8</h1>
            </div>

            <div className="space-y-6">
              {/* Main 3 R's with Reactive Gradient Effects */}
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                  <span className="inline-block transform hover:scale-105 transition-all duration-300 hover:rotate-1">
                    <span className="gradient-word-resilience drop-shadow-xl">Resilience</span>
                  </span>
                  <span className="mx-3 text-white/40 text-2xl">→</span>
                  <span className="inline-block transform hover:scale-105 transition-all duration-300 hover:-rotate-1">
                    <span className="gradient-word-response drop-shadow-xl">Response</span>
                  </span>
                  <span className="mx-3 text-white/40 text-2xl">→</span>
                  <span className="inline-block transform hover:scale-105 transition-all duration-300 hover:rotate-1">
                    <span className="gradient-word-regeneration drop-shadow-xl">Regeneration</span>
                  </span>
                </h2>
              </div>

              {/* Continuous Scrolling R Words */}
              <div className="relative overflow-hidden h-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="animate-scroll-seamless whitespace-nowrap flex items-center text-lg">
                    <span className="scroll-word-purple mx-8">
                      <span className="text-2xl font-black">R</span>esponsibility
                    </span>
                    <span className="scroll-word-amber mx-8">
                      <span className="text-2xl font-black">R</span>esources
                    </span>
                    <span className="scroll-word-teal mx-8">
                      <span className="text-2xl font-black">R</span>ecovery
                    </span>
                    <span className="scroll-word-emerald mx-8">
                      <span className="text-2xl font-black">R</span>estoration
                    </span>
                    <span className="scroll-word-indigo mx-8">
                      <span className="text-2xl font-black">R</span>enewal
                    </span>
                    <span className="scroll-word-rose mx-8">
                      <span className="text-2xl font-black">R</span>esilience
                    </span>
                    <span className="scroll-word-cyan mx-8">
                      <span className="text-2xl font-black">R</span>egeneration
                    </span>
                    <span className="scroll-word-orange mx-8">
                      <span className="text-2xl font-black">R</span>eadiness
                    </span>
                    <span className="scroll-word-purple mx-8 text-3xl">
                      ∞
                    </span>
                    <span className="scroll-word-lime mx-8">
                      <span className="text-2xl font-black">R</span>ehabilitation
                    </span>
                    <span className="scroll-word-pink mx-8">
                      <span className="text-2xl font-black">R</span>evitalization
                    </span>
                    <span className="scroll-word-violet mx-8">
                      <span className="text-2xl font-black">R</span>evolution
                    </span>
                    <span className="scroll-word-sky mx-8">
                      <span className="text-2xl font-black">R</span>escue
                    </span>
                    <span className="scroll-word-red mx-8">
                      <span className="text-2xl font-black">R</span>eclamation
                    </span>
                    <span className="scroll-word-emerald mx-8">
                      <span className="text-2xl font-black">R</span>ejuvenation
                    </span>
                    <span className="scroll-word-teal mx-8">
                      <span className="text-2xl font-black">R</span>eplenishment
                    </span>
                    <span className="scroll-word-amber mx-8">
                      <span className="text-2xl font-black">R</span>elief
                    </span>
                    <span className="scroll-word-cyan mx-8 text-3xl">
                      ∞
                    </span>
                    {/* Seamless duplicate for continuous scroll */}
                    <span className="scroll-word-purple mx-8">
                      <span className="text-2xl font-black">R</span>esponsibility
                    </span>
                    <span className="scroll-word-amber mx-8">
                      <span className="text-2xl font-black">R</span>esources
                    </span>
                    <span className="scroll-word-teal mx-8">
                      <span className="text-2xl font-black">R</span>ecovery
                    </span>
                    <span className="scroll-word-emerald mx-8">
                      <span className="text-2xl font-black">R</span>estoration
                    </span>
                    <span className="scroll-word-indigo mx-8">
                      <span className="text-2xl font-black">R</span>enewal
                    </span>
                    <span className="scroll-word-rose mx-8">
                      <span className="text-2xl font-black">R</span>esilience
                    </span>
                    <span className="scroll-word-cyan mx-8">
                      <span className="text-2xl font-black">R</span>egeneration
                    </span>
                    <span className="scroll-word-orange mx-8">
                      <span className="text-2xl font-black">R</span>eadiness
                    </span>
                    <span className="scroll-word-purple mx-8 text-3xl">
                      ∞
                    </span>
                  </div>
                </div>
              </div>

              {/* Coming Soon Notice */}
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
                <p className="text-yellow-200 text-lg font-medium">
                  🚧 Platform Coming Soon - Demo Access Available
                </p>
              </div>

              <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                Driving community transformation and ecological regeneration through integrated disaster response and ecosystem restoration.
              </p>
            </div>
          </div>
        </div>

        </div>

      {/* Features Preview Section */}
      <section className="py-20 bg-gradient-to-b from-stormy-dark/95 to-stormy-primary/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Everything You Need for Community Resilience
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Connecting mutual aid networks with disaster supply sites, coordinating volunteers across bioregional regeneration projects. R8 provides the tools communities need to respond, recover, and regenerate.
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Real-time Emergency Monitoring */}
            <Card className="bg-red-600/20 border-red-400/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-red-600 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Disaster Relief</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 mb-4">
                  Track active weather alerts, wildfire incidents, earthquakes, and disasters across all states. Providing supply distribution, delivery, and inventory logistics for community-led aid efforts.
                </p>
                <div className="space-y-2 text-sm text-white/80">
                  <div>• Emergency response coordination</div>
                  <div>• Supply chain management</div>
                  <div>• Resource allocation tracking</div>
                  <div>• Community network integration</div>
                </div>
              </CardContent>
            </Card>

            {/* Volunteer Networks */}
            <Card className="bg-blue-600/20 border-blue-400/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Volunteer Networks</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 mb-4">
                  Connect active volunteers across community partnerships for disaster relief and ecological restoration.
                </p>
                <div className="space-y-2 text-sm text-white/80">
                  <div>• Shift scheduling & availability</div>
                  <div>• Skills-based matching</div>
                  <div>• Impact tracking</div>
                  <div>• Community coordination</div>
                </div>
              </CardContent>
            </Card>

            {/* Bioregional Restoration */}
            <Card className="bg-emerald-600/20 border-emerald-400/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-emerald-600 rounded-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Bioregional Regeneration</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 mb-4">
                  Explore 846 global ecoregions with traditional knowledge systems, active restoration projects, and indigenous partnerships.
                </p>
                <div className="space-y-2 text-sm text-white/80">
                  <div>• Traditional ecological practices</div>
                  <div>• Watershed management</div>
                  <div>• Native species recovery</div>
                  <div>• Cultural preservation</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Access Form */}
          <Card className="max-w-md mx-auto bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Phone className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-white">Request Demo Access</CardTitle>
              <CardDescription className="text-white/80">
                Enter your phone number to check for demo access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="text-center text-xl py-3 bg-white/90 border-white/50 text-gray-900 placeholder-gray-600 font-medium tracking-wide focus:bg-white focus:border-blue-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={loading || !phoneNumber}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Check Access'
                  )}
                </Button>
              </form>

              {message && (
                <Alert className={`mt-4 ${message.includes('granted') 
                  ? 'border-green-500 bg-green-500/20 text-green-400' 
                  : 'border-red-500 bg-red-500/20 text-red-400'
                }`}>
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-6 pt-4 border-t border-white/20 text-center">
                <p className="text-sm text-white/70 mb-2">
                  Don't have access yet?
                </p>
                <p className="text-xs text-white/60">
                  Contact our team for demo access: <br />
                  <span className="font-medium text-blue-400">team@regenerative8.org</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stormy-dark border-t border-stormy-light/30 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={r8LogoWhite}
                alt="R8 Logo" 
                className="w-10 h-10 mr-3"
              />
              <span className="text-2xl font-bold text-white">R8</span>
            </div>
            <p className="text-white/80 text-lg mb-6">
              <span className="text-blue-400 font-semibold">Resilience</span> • <span className="text-red-400 font-semibold">Response</span> • <span className="text-green-400 font-semibold">Regeneration</span>
            </p>
            <div className="text-sm text-white/60">
              &copy; 2025 R8. Building resilient communities through data-driven response.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}