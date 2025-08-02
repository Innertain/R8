import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
  Globe
} from "lucide-react";

export default function Home() {
  const modules = [
    {
      title: "Volunteer Portal",
      description: "Manage your volunteer shifts and availability",
      icon: <Calendar className="w-8 h-8" />,
      href: "/volunteer",
      color: "bg-stormy-primary/80 border-stormy-light/40 hover:bg-stormy-primary/90 shadow-lg",
      iconColor: "text-white"
    },
    {
      title: "Disaster Watch Center", 
      description: "Real-time emergency monitoring and response coordination",
      icon: <Shield className="w-8 h-8" />,
      href: "/map",
      color: "bg-red-600/90 border-red-400/60 hover:bg-red-600 shadow-lg",
      iconColor: "text-white"
    },
    {
      title: "Impact Statistics",
      description: "Track volunteer impact and community metrics",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/stats", 
      color: "bg-blue-600/90 border-blue-400/60 hover:bg-blue-600 shadow-lg",
      iconColor: "text-white"
    },
    {
      title: "Custom Alerts",
      description: "Set up personalized emergency and volunteer alerts",
      icon: <Bell className="w-8 h-8" />,
      href: "/alerts",
      color: "bg-amber-600/90 border-amber-400/60 hover:bg-amber-600 shadow-lg", 
      iconColor: "text-white"
    },
    {
      title: "Bioregion Explorer",
      description: "Explore global ecosystems and conservation efforts",
      icon: <Globe className="w-8 h-8" />,
      href: "/bioregions",
      color: "bg-green-600/90 border-green-400/60 hover:bg-green-600 shadow-lg",
      iconColor: "text-white"
    },
    {
      title: "Hawaiʻi Regeneration",
      description: "Traditional practices and restoration projects in Hawaii",
      icon: <Mountain className="w-8 h-8" />,
      href: "/hawaii",
      color: "bg-teal-600/90 border-teal-400/60 hover:bg-teal-600 shadow-lg",
      iconColor: "text-white"
    },
    {
      title: "Appalachian Regeneration", 
      description: "Mountain heritage and forest restoration initiatives",
      icon: <Mountain className="w-8 h-8" />,
      href: "/appalachian",
      color: "bg-emerald-600/90 border-emerald-400/60 hover:bg-emerald-600 shadow-lg",
      iconColor: "text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stormy-dark to-stormy-primary/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-stormy-dark via-stormy-primary to-stormy-accent/40 border-b border-stormy-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/src/assets/r8-logo.png"
                alt="R8 Logo" 
                className="w-16 h-16 mr-4"
              />
              <h1 className="text-5xl font-bold text-white">R8</h1>
            </div>
            <p className="text-2xl text-stormy-light mb-4">Disaster Relief • Community Resiliency • Regeneration</p>
            <p className="text-lg text-stormy-light/80 max-w-3xl mx-auto">
              Connecting communities to respond to disasters, build resilience, and support regenerative practices 
              that strengthen local ecosystems and community well-being.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Platform Modules</h2>
          <p className="text-lg text-stormy-light/90">
            Choose a module to access R8's disaster relief, community resiliency, and regeneration tools
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link key={index} href={module.href}>
              <Card className={`${module.color} border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer h-full`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`p-3 rounded-lg bg-white/20 backdrop-blur-sm ${module.iconColor}`}>
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {module.title}
                      </h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/70" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white/90 leading-relaxed">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-stormy-dark/80 backdrop-blur-sm rounded-lg border border-stormy-light/30 p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Platform Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">7</div>
              <div className="text-sm text-stormy-light/80">Active Modules</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
              <div className="text-sm text-stormy-light/80">Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500 mb-1">350+</div>
              <div className="text-sm text-stormy-light/80">Active Alerts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-500 mb-1">97K+</div>
              <div className="text-sm text-stormy-light/80">Food Boxes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">8+</div>
              <div className="text-sm text-stormy-light/80">Data Sources</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-1">422</div>
              <div className="text-sm text-stormy-light/80">Supply Sites</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-500 mb-1">208</div>
              <div className="text-sm text-stormy-light/80">Drivers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-1">🌍</div>
              <div className="text-sm text-stormy-light/80">Global Coverage</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stormy-dark border-t border-stormy-light/30 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/src/assets/r8-logo.png"
                alt="R8 Logo" 
                className="w-8 h-8 mr-2"
              />
              <span className="text-lg font-semibold text-white">R8</span>
            </div>
            <p className="text-stormy-light/80">
              Disaster Relief • Community Resiliency • Regeneration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}