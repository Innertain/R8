import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Home as HomeIcon, Menu, X, MapPin, BarChart3, Bell, Leaf, Mountain, ChevronDown, Shield, Wind, TreePine } from "lucide-react";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import VolunteerPortal from "@/pages/volunteer-portal";
import InteractiveMap from "@/pages/interactive-map-new";
import StatsDashboard from "@/pages/stats-dashboard";
import AlertsPage from "@/pages/alerts";
import BioregionExplorerPage from "@/pages/bioregion-explorer";
import HawaiiRegenerationPage from "@/pages/hawaii-regeneration";
import AppalachianRegenerationPage from "@/pages/appalachian-regeneration";
import CascadiaRegenerationPage from "@/pages/cascadia-regeneration";
import AirQualityPage from "@/pages/air-quality";
import NoaaClimatePage from "@/pages/noaa-climate";
import DisasterEducationPage from "@/pages/disaster-education";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import TermsOfServicePage from "@/pages/terms-of-service";
import { StateSVGDefs } from "@/components/StateIcon";
import { Footer } from "@/components/Footer";
import { GlobalFilterIndicator } from "@/components/GlobalFilterIndicator";


function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/src/assets/r8-logo.png"
            alt="R8 Logo" 
            className="w-10 h-10"
          />
          <h1 className="text-2xl font-bold text-white">R8</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              location === "/" 
                ? "bg-white text-slate-900 shadow-md" 
                : "text-white hover:bg-white/10 hover:text-white"
            }`}>
              <HomeIcon className="h-4 w-4" />
              Home
            </button>
          </Link>

          <Link href="/volunteer">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              location === "/volunteer" 
                ? "bg-blue-500 text-white shadow-md" 
                : "text-white hover:bg-blue-500/20 hover:text-white"
            }`}>
              <Calendar className="h-4 w-4" />
              Volunteer Portal
            </button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                ['/map', '/stats', '/alerts', '/air-quality', '/noaa-climate', '/disaster-education'].includes(location) 
                  ? "bg-red-500 text-white shadow-md" 
                  : "text-white hover:bg-red-500/20 hover:text-white"
              }`}>
                <Shield className="h-4 w-4" />
                Disaster Response
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl p-2">
              <div className="p-2">
                <div className="text-sm font-semibold text-gray-900 mb-3 px-2">Emergency Response</div>
                <DropdownMenuItem asChild>
                  <Link href="/map" className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Disaster Watch Center</div>
                      <div className="text-sm text-gray-600">Real-time monitoring</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/stats" className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Impact Statistics</div>
                      <div className="text-sm text-gray-600">Analytics & metrics</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/alerts" className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Custom Alerts</div>
                      <div className="text-sm text-gray-600">Personalized notifications</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/air-quality" className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Wind className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Air Quality Monitor</div>
                      <div className="text-sm text-gray-600">Environmental health alerts</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/noaa-climate" className="flex items-center gap-3 p-3 hover:bg-cyan-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                      <Wind className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">NOAA Climate Reports</div>
                      <div className="text-sm text-gray-600">Monthly climate monitoring</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/disaster-education" className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Disaster Education</div>
                      <div className="text-sm text-gray-600">Interactive learning center</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                ['/bioregions', '/hawaii', '/appalachian', '/cascadia'].includes(location) 
                  ? "bg-green-500 text-white shadow-md" 
                  : "text-white hover:bg-green-500/20 hover:text-white"
              }`}>
                <Leaf className="h-4 w-4" />
                Regeneration
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl p-2">
              <div className="p-2">
                <div className="text-sm font-semibold text-gray-900 mb-3 px-2">Regenerative Solutions</div>
                <DropdownMenuItem asChild>
                  <Link href="/bioregions" className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Bioregion Explorer</div>
                      <div className="text-sm text-gray-600">Global ecosystems</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/hawaii" className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Mountain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Hawaiʻi Regeneration</div>
                      <div className="text-sm text-gray-600">Island restoration</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/appalachian" className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Mountain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Appalachian Regeneration</div>
                      <div className="text-sm text-gray-600">Mountain heritage</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cascadia" className="flex items-center gap-3 p-3 hover:bg-teal-50 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                      <TreePine className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Cascadia Bioregion</div>
                      <div className="text-sm text-gray-600">Temperate rainforest</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Fallback for smaller screens - simplified buttons */}
        <div className="hidden md:flex lg:hidden gap-2">
          <Link href="/">
            <Button 
              variant={location === "/" ? "default" : "outline"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/volunteer">
            <Button 
              variant={location === "/volunteer" ? "default" : "outline"} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Volunteer
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={['/map', '/stats', '/alerts'].includes(location) ? "default" : "outline"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Response
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/map" className="flex items-center gap-2 w-full p-2">
                  <MapPin className="h-4 w-4" />
                  Disaster Watch
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stats" className="flex items-center gap-2 w-full p-2">
                  <BarChart3 className="h-4 w-4" />
                  Impact Stats
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/alerts" className="flex items-center gap-2 w-full p-2">
                  <Bell className="h-4 w-4" />
                  Alerts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/air-quality" className="flex items-center gap-2 w-full p-2">
                  <Wind className="h-4 w-4" />
                  Air Quality
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={['/bioregions', '/hawaii', '/appalachian', '/cascadia'].includes(location) ? "default" : "outline"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Leaf className="h-4 w-4" />
                Regeneration
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/bioregions" className="flex items-center gap-2 w-full p-2">
                  <Leaf className="h-4 w-4" />
                  Bioregions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hawaii" className="flex items-center gap-2 w-full p-2">
                  <Mountain className="h-4 w-4" />
                  Hawaiʻi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/appalachian" className="flex items-center gap-2 w-full p-2">
                  <Mountain className="h-4 w-4" />
                  Appalachian
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cascadia" className="flex items-center gap-2 w-full p-2">
                  <TreePine className="h-4 w-4" />
                  Cascadia
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-stormy-light/30 mt-3 pt-3">
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button 
                variant={location === "/volunteer" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                Volunteer Portal
              </Button>
            </Link>

            {/* Disaster Response Section */}
            <div className="text-xs font-medium text-stormy-light px-2 py-1 uppercase tracking-wide">
              Disaster Response
            </div>
            <Link href="/map">
              <Button 
                variant={location === "/map" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapPin className="h-4 w-4" />
                Disaster Watch Center
              </Button>
            </Link>
            <Link href="/stats">
              <Button 
                variant={location === "/stats" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                Impact Stats
              </Button>
            </Link>
            <Link href="/alerts">
              <Button 
                variant={location === "/alerts" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell className="h-4 w-4" />
                Custom Alerts
              </Button>
            </Link>
            <Link href="/air-quality">
              <Button 
                variant={location === "/air-quality" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wind className="h-4 w-4" />
                Air Quality Monitor
              </Button>
            </Link>
            <Link href="/noaa-climate">
              <Button 
                variant={location === "/noaa-climate" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wind className="h-4 w-4" />
                NOAA Climate Reports
              </Button>
            </Link>
            <Link href="/disaster-education">
              <Button 
                variant={location === "/disaster-education" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Disaster Education
              </Button>
            </Link>

            {/* Regeneration Section */}
            <div className="text-xs font-medium text-stormy-light px-2 py-1 uppercase tracking-wide">
              Regeneration
            </div>
            <Link href="/bioregions">
              <Button 
                variant={location === "/bioregions" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Leaf className="h-4 w-4" />
                Bioregion Explorer
              </Button>
            </Link>
            <Link href="/hawaii">
              <Button 
                variant={location === "/hawaii" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mountain className="h-4 w-4" />
                Hawaiʻi Regeneration
              </Button>
            </Link>
            <Link href="/appalachian">
              <Button 
                variant={location === "/appalachian" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mountain className="h-4 w-4" />
                Appalachian Regeneration
              </Button>
            </Link>
            <Link href="/cascadia">
              <Button 
                variant={location === "/cascadia" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TreePine className="h-4 w-4" />
                Cascadia Bioregion
              </Button>
            </Link>

          </div>
        </div>
      )}
    </nav>
  );
}

function Router() {
  return (
    <div className="flex-1">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/volunteer" component={VolunteerPortal} />
        <Route path="/map" component={InteractiveMap} />
        <Route path="/stats" component={StatsDashboard} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/air-quality" component={AirQualityPage} />
        <Route path="/noaa-climate" component={NoaaClimatePage} />
        <Route path="/disaster-education" component={DisasterEducationPage} />
        <Route path="/bioregions" component={BioregionExplorerPage} />
        <Route path="/hawaii" component={HawaiiRegenerationPage} />
        <Route path="/appalachian" component={AppalachianRegenerationPage} />
        <Route path="/cascadia" component={CascadiaRegenerationPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms-of-service" component={TermsOfServicePage} />

        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  const [globalStateFilter, setGlobalStateFilter] = useState<string | null>(null);

  const clearGlobalFilter = () => {
    setGlobalStateFilter(null);
    // Clear any URL parameters or other filter state
    if (window.location.search.includes('state=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('state');
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-stormy-dark via-stormy-medium to-stormy-dark">
          <StateSVGDefs />
          <Navigation />
          {globalStateFilter && (
            <GlobalFilterIndicator 
              stateFilter={globalStateFilter}
              onClearFilter={clearGlobalFilter}
            />
          )}
          <Router />
          <Footer />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>  
  );
}

export default App;