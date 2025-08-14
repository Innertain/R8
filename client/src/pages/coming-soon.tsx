import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Phone, Shield, Users, Globe, ArrowRight, Leaf, Mountain, Waves, Eye, Heart, TrendingUp, Zap, Search, Database, Satellite, Network, TreePine, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
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
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                R8
              </h1>
              <h2 className="text-2xl md:text-4xl font-semibold text-white">
                Resilience • Response • Regeneration
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
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

              <div className="mt-8 pt-6 border-t border-slate-600">
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

            {/* Mission Statement */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 mt-8 w-full">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">Our Mission</h3>
              <p className="text-gray-300 text-lg leading-relaxed text-center max-w-4xl mx-auto">
                R8 represents a paradigm shift in how communities prepare for, respond to, and recover from disasters. 
                By connecting mutual aid networks, coordinating volunteer efforts, and facilitating bioregional regeneration projects, 
                we're building the infrastructure for truly resilient communities that can thrive in the face of climate change and other challenges.
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
                  <Heart className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Bioregional Projects</h3>
                <p className="text-gray-400">Coordinate long-term regeneration projects across bioregional boundaries.</p>
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
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Network className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Network Coordination</h3>
                <p className="text-gray-400">Seamlessly coordinate between multiple organizations and response teams.</p>
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
          <div className="max-w-4xl mx-auto">
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