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
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Disaster Watch Center", 
      description: "Real-time emergency monitoring and response coordination",
      icon: <Shield className="w-8 h-8" />,
      href: "/map",
      color: "bg-red-50 border-red-200 hover:bg-red-100",
      iconColor: "text-red-600"
    },
    {
      title: "Impact Statistics",
      description: "Track volunteer impact and community metrics",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/stats", 
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Custom Alerts",
      description: "Set up personalized emergency and volunteer alerts",
      icon: <Bell className="w-8 h-8" />,
      href: "/alerts",
      color: "bg-amber-50 border-amber-200 hover:bg-amber-100", 
      iconColor: "text-amber-600"
    },
    {
      title: "Bioregion Explorer",
      description: "Explore global ecosystems and conservation efforts",
      icon: <Globe className="w-8 h-8" />,
      href: "/bioregions",
      color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      title: "Hawaiʻi Regeneration",
      description: "Traditional practices and restoration projects in Hawaii",
      icon: <Mountain className="w-8 h-8" />,
      href: "/hawaii",
      color: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
      iconColor: "text-cyan-600"
    },
    {
      title: "Appalachian Regeneration", 
      description: "Mountain heritage and forest restoration initiatives",
      icon: <Mountain className="w-8 h-8" />,
      href: "/appalachian",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/src/assets/r8-logo.png"
                alt="R8 Logo" 
                className="w-16 h-16 mr-4"
              />
              <h1 className="text-5xl font-bold text-gray-900">R8</h1>
            </div>
            <p className="text-2xl text-gray-600 mb-4">Emergency Response Platform</p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Comprehensive emergency management, volunteer coordination, and regeneration initiatives 
              connecting communities to respond effectively to disasters and build resilience.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Modules</h2>
          <p className="text-lg text-gray-600">
            Choose a module to access R8's comprehensive emergency response and regeneration tools
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link key={index} href={module.href}>
              <Card className={`${module.color} border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer h-full`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`p-3 rounded-lg bg-white ${module.iconColor}`}>
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {module.title}
                      </h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">7</div>
              <div className="text-sm text-gray-600">Active Modules</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">∞</div>
              <div className="text-sm text-gray-600">Data Sources</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-1">🌍</div>
              <div className="text-sm text-gray-600">Global Coverage</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/src/assets/r8-logo.png"
                alt="R8 Logo" 
                className="w-8 h-8 mr-2"
              />
              <span className="text-lg font-semibold text-gray-900">R8 Emergency Response Platform</span>
            </div>
            <p className="text-gray-600">
              Connecting communities • Coordinating response • Building resilience
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}