import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  BarChart3, 
  Bell, 
  Leaf, 
  Mountain,
  Users,
  ArrowRight,
  Shield,
  Globe,
  Camera,
  AlertTriangle,
  TreePine,
  Waves,
  Eye,
  Heart,
  TrendingUp,
  Zap,
  Search,
  Database,
  Satellite
} from "lucide-react";
import r8LogoWhite from "@assets/R8 LOGO_white400px_1753778033506.png";
import hawaiiLandscape from "@assets/Hawaii_1754183003386.png";
import appalachianLandscape from "@assets/Appalachian _1754183249913.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stormy-dark to-stormy-primary/20">
      <HeroSection />
      <FeaturesShowcase />
      <ModulesSection />
      <StatsSection />
      <Footer />
    </div>
  );
}

// Hero Section with stunning visuals
function HeroSection() {
  return (
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
            <h1 className="text-6xl font-bold text-white tracking-wide">R8</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight">
              <span className="text-red-400">R</span>esponse • <span className="text-blue-400">R</span>esilience • <span className="text-green-400">R</span>egeneration
            </h2>

            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Three R's for community transformation: Emergency <span className="text-red-400 font-semibold">Response</span>, Community <span className="text-blue-400 font-semibold">Resilience</span>, and Ecological <span className="text-green-400 font-semibold">Regeneration</span>.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Link href="/map">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4">
                  <Shield className="w-5 h-5 mr-2" />
                  Emergency Response
                </Button>
              </Link>
              <Link href="/bioregions">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4">
                  <Globe className="w-5 h-5 mr-2" />
                  Explore Bioregions
                </Button>
              </Link>
              <Link href="/volunteer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-stormy-dark text-lg px-8 py-4">
                  <Users className="w-5 h-5 mr-2" />
                  Get Involved
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
        <div className="text-center">
          <div className="text-sm mb-2">Discover Features Below</div>
          <ArrowRight className="w-6 h-6 mx-auto rotate-90" />
        </div>
      </div>
    </div>
  );
}

// Features Showcase with actual previews
function FeaturesShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-stormy-dark/95 to-stormy-primary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-600 text-white px-4 py-2 text-base">
            Platform Capabilities
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-6">
            Everything You Need for Community Resilience
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            From real-time emergency monitoring to endangered species conservation, 
            R8 provides the tools communities need to respond, recover, and regenerate.
          </p>
        </div>



        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Real-time Emergency Monitoring */}
          <Card className="bg-red-600/20 border-red-400/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-red-600 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Emergency Monitoring</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-4">
                Track 350+ active weather alerts, wildfire incidents, earthquakes, and disasters across all 50 states using 8 official government data sources.
              </p>
              <div className="space-y-2 text-sm text-white/80">
                <div>• FEMA disaster declarations</div>
                <div>• National Weather Service alerts</div>
                <div>• USGS earthquake monitoring</div>
                <div>• NASA satellite imagery</div>
              </div>
            </CardContent>
          </Card>

          {/* Endangered Species Conservation */}
          <Card className="bg-green-600/20 border-green-400/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Species Conservation</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-4">
                Discover 1,800+ threatened and endangered species with live photos, IUCN Red List status, and conservation action opportunities.
              </p>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Live wildlife photography</div>
                <div>• Conservation status tracking</div>
                <div>• Species recovery programs</div>
                <div>• Habitat restoration projects</div>
              </div>
            </CardContent>
          </Card>

          {/* Community Networks */}
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
                Connect 2,340+ active volunteers across 156 community partnerships for disaster relief and ecological restoration.
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
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Ecosystem Restoration</h3>
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

          {/* Real-time Data Integration */}
          <Card className="bg-purple-600/20 border-purple-400/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Data Integration</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-4">
                Aggregate data from 8+ official sources including FEMA, IUCN, NASA, USGS, and iNaturalist for comprehensive situational awareness.
              </p>
              <div className="space-y-2 text-sm text-white/80">
                <div>• 24/7 automated monitoring</div>
                <div>• Government API integration</div>
                <div>• Real-time notifications</div>
                <div>• Historical trend analysis</div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Alerting */}
          <Card className="bg-amber-600/20 border-amber-400/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-amber-600 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Smart Alerts</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-4">
                Set up personalized alerts for weather, disasters, volunteer opportunities, and conservation activities with multi-channel delivery.
              </p>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Geographic filtering</div>
                <div>• Severity thresholds</div>
                <div>• Email/SMS/webhook delivery</div>
                <div>• Cooldown controls</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  const modules = [
    {
      title: "Volunteer Portal",
      description: "Manage shifts, availability, and volunteer coordination",
      icon: <Calendar className="w-6 h-6" />,
      href: "/volunteer",
      color: "bg-stormy-primary/80 border-stormy-light/40 hover:bg-stormy-primary/90",
      stats: "2,340 active volunteers"
    },
    {
      title: "Disaster Watch Center", 
      description: "Real-time emergency monitoring and response",
      icon: <Shield className="w-6 h-6" />,
      href: "/map",
      color: "bg-red-600/80 border-red-400/40 hover:bg-red-600/90",
      stats: "350+ active alerts"
    },
    {
      title: "Impact Statistics",
      description: "Track community metrics and volunteer impact",
      icon: <BarChart3 className="w-6 h-6" />,
      href: "/stats", 
      color: "bg-blue-600/80 border-blue-400/40 hover:bg-blue-600/90",
      stats: "97K+ food boxes delivered"
    },
    {
      title: "Custom Alerts",
      description: "Personalized emergency and volunteer notifications",
      icon: <Bell className="w-6 h-6" />,
      href: "/alerts",
      color: "bg-amber-600/80 border-amber-400/40 hover:bg-amber-600/90",
      stats: "Multi-channel delivery"
    },
    {
      title: "Bioregion Explorer",
      description: "Interactive ecosystem and conservation mapping",
      icon: <Globe className="w-6 h-6" />,
      href: "/bioregions",
      color: "bg-green-600/80 border-green-400/40 hover:bg-green-600/90",
      stats: "846 global ecoregions"
    },
    {
      title: "Hawaiʻi Regeneration",
      description: "Traditional ahupua'a and restoration projects",
      icon: <Waves className="w-6 h-6" />,
      href: "/hawaii",
      color: "bg-teal-600/80 border-teal-400/40 hover:bg-teal-600/90",
      stats: "12,850 acres restored"
    },
    {
      title: "Appalachian Regeneration", 
      description: "Mountain heritage and forest restoration",
      icon: <Mountain className="w-6 h-6" />,
      href: "/appalachian",
      color: "bg-emerald-600/80 border-emerald-400/40 hover:bg-emerald-600/90",
      stats: "89,450 acres restored"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-stormy-primary/30 to-stormy-dark/95">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-stormy-primary text-white px-4 py-2 text-base">
            Platform Modules
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4">Comprehensive Tools for Every Need</h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Access specialized modules designed for emergency response, community coordination, and ecological restoration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link key={index} href={module.href}>
              <Card className={`${module.color} border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer h-full backdrop-blur-sm group`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm text-white group-hover:bg-white/30 transition-colors">
                        {module.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {module.title}
                        </h3>
                        <div className="text-xs text-white/70 font-medium">
                          {module.stats}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white/90 text-sm leading-relaxed">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-16 bg-stormy-dark/95">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Platform Impact</h2>
          <p className="text-lg text-white/80">
            Real numbers from communities using R8 for resilience and regeneration
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          <div className="text-center p-4 bg-stormy-primary/20 rounded-lg border border-stormy-light/20">
            <div className="text-3xl font-bold text-blue-500 mb-2">7</div>
            <div className="text-sm text-white/80">Active Modules</div>
          </div>
          <div className="text-center p-4 bg-stormy-primary/20 rounded-lg border border-stormy-light/20">
            <div className="text-3xl font-bold text-green-500 mb-2">24/7</div>
            <div className="text-sm text-white/80">Monitoring</div>
          </div>
          <div className="text-center p-4 bg-stormy-primary/20 rounded-lg border border-stormy-light/20">
            <div className="text-3xl font-bold text-red-500 mb-2">350+</div>
            <div className="text-sm text-white/80">Active Alerts</div>
          </div>
          <div className="text-center p-4 bg-stormy-primary/20 rounded-lg border border-stormy-light/20">
            <div className="text-3xl font-bold text-teal-500 mb-2">97K+</div>
            <div className="text-sm text-white/80">Food Boxes</div>
          </div>
          <div className="text-center p-4 bg-stormy-primary/20 rounded-lg border border-stormy-light/20">
            <div className="text-3xl font-bold text-purple-500 mb-2">8+</div>
            <div className="text-sm text-white/80">Data Sources</div>
          </div>
          <div className="text-center p-4 bg-stormy-primary/20 rounded-lg border border-stormy-light/20">
            <div className="text-3xl font-bold text-orange-500 mb-2">2.3K+</div>
            <div className="text-sm text-white/80">Volunteers</div>
          </div>
          <div className="text-center p-4 bg-stormy-primary/20 rounded-lg border border-stormy-light/20">
            <div className="text-3xl font-bold text-indigo-500 mb-2">102K+</div>
            <div className="text-sm text-white/80">Acres Restored</div>
          </div>
          <div className="text-center p-4 bg-stormy-primary/20 rounded-lg border border-stormy-light/20">
            <div className="text-3xl font-bold text-amber-500 mb-2">🌍</div>
            <div className="text-sm text-white/80">Global</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
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
            <span className="text-red-400 font-semibold">Response</span> • <span className="text-blue-400 font-semibold">Resilience</span> • <span className="text-green-400 font-semibold">Regeneration</span>
          </p>
          <div className="flex justify-center gap-8 text-sm text-white/60">
            <Link href="/volunteer" className="hover:text-white transition-colors">Get Involved</Link>
            <Link href="/map" className="hover:text-white transition-colors">Emergency Response</Link>
            <Link href="/bioregions" className="hover:text-white transition-colors">Explore Bioregions</Link>
            <Link href="/hawaii" className="hover:text-white transition-colors">Regeneration Projects</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}