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
import { Calendar, Home as HomeIcon, Menu, X, MapPin, BarChart3, Bell, Leaf, Mountain, ChevronDown, Shield } from "lucide-react";
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
import { StateSVGDefs } from "@/components/StateIcon";


function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-stormy-light border-b border-stormy-primary/20 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-stormy-dark">R8</h1>
          <img 
            src="/src/assets/r8-logo.png"
            alt="R8 Logo" 
            className="w-8 h-8"
          />
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex gap-2">
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
              Volunteer Portal
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
                Disaster Response
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem asChild>
                <Link href="/map" className="flex items-center gap-3 w-full p-3 hover:bg-red-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                    <MapPin className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Disaster Watch Center</div>
                    <div className="text-xs text-gray-500">Real-time monitoring</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stats" className="flex items-center gap-3 w-full p-3 hover:bg-blue-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Impact Stats</div>
                    <div className="text-xs text-gray-500">Analytics & metrics</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/alerts" className="flex items-center gap-3 w-full p-3 hover:bg-yellow-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100">
                    <Bell className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Custom Alerts</div>
                    <div className="text-xs text-gray-500">Personalized notifications</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={['/bioregions', '/hawaii', '/appalachian'].includes(location) ? "default" : "outline"} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Leaf className="h-4 w-4" />
                Regeneration
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem asChild>
                <Link href="/bioregions" className="flex items-center gap-3 w-full p-3 hover:bg-green-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Bioregion Explorer</div>
                    <div className="text-xs text-gray-500">Global ecosystems</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hawaii" className="flex items-center gap-3 w-full p-3 hover:bg-blue-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                    <Mountain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Hawaiʻi Regeneration</div>
                    <div className="text-xs text-gray-500">Island restoration</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/appalachian" className="flex items-center gap-3 w-full p-3 hover:bg-emerald-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
                    <Mountain className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Appalachian Regeneration</div>
                    <div className="text-xs text-gray-500">Mountain heritage</div>
                  </div>
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
        <div className="sm:hidden border-t border-stormy-primary/20 mt-3 pt-3">
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
            <div className="text-xs font-medium text-stormy-dark px-2 py-1 uppercase tracking-wide">
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

            {/* Regeneration Section */}
            <div className="text-xs font-medium text-stormy-dark px-2 py-1 uppercase tracking-wide">
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

          </div>
        </div>
      )}
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stormy-light to-white">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/volunteer" component={VolunteerPortal} />
        <Route path="/map" component={InteractiveMap} />
        <Route path="/stats" component={StatsDashboard} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/bioregions" component={BioregionExplorerPage} />
        <Route path="/hawaii" component={HawaiiRegenerationPage} />
        <Route path="/appalachian" component={AppalachianRegenerationPage} />

        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <StateSVGDefs />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
