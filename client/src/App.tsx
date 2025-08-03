import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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
    <nav className="bg-stormy-dark/95 backdrop-blur-md border-b border-stormy-light/20 shadow-xl px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/src/assets/r8-logo.png"
            alt="R8 Logo" 
            className="w-10 h-10"
          />
          <h1 className="text-2xl font-bold text-white tracking-tight">R8</h1>
        </div>
        
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="flex gap-1">
            <NavigationMenuItem>
              <Link href="/">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} ${
                  location === "/" 
                    ? "bg-white/20 text-white shadow-lg" 
                    : "text-white/90 hover:text-white hover:bg-white/10"
                } transition-all duration-200 font-medium`}>
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link href="/volunteer">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} ${
                  location === "/volunteer" 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "text-white/90 hover:text-white hover:bg-blue-500/20"
                } transition-all duration-200 font-medium`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Volunteer Portal
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={`${navigationMenuTriggerStyle()} ${
                ['/map', '/stats', '/alerts'].includes(location) 
                  ? "bg-red-500 text-white shadow-lg" 
                  : "text-white/90 hover:text-white hover:bg-red-500/20"
              } transition-all duration-200 font-medium`}>
                <Shield className="h-4 w-4 mr-2" />
                Disaster Response
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-80 p-4 bg-white/95 backdrop-blur-lg border border-red-100 shadow-2xl rounded-xl">
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-red-800 mb-2 px-2">Emergency Response Tools</div>
                  <Link href="/map" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-red-50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-shadow">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">Disaster Watch Center</div>
                        <div className="text-sm text-gray-600">Real-time emergency monitoring and alerts</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/stats" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-red-50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-shadow">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">Impact Statistics</div>
                        <div className="text-sm text-gray-600">Analytics, metrics, and impact tracking</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/alerts" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-red-50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl transition-shadow">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">Custom Alerts</div>
                        <div className="text-sm text-gray-600">Personalized emergency notifications</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={`${navigationMenuTriggerStyle()} ${
                ['/bioregions', '/hawaii', '/appalachian'].includes(location) 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "text-white/90 hover:text-white hover:bg-green-500/20"
              } transition-all duration-200 font-medium`}>
                <Leaf className="h-4 w-4 mr-2" />
                Regeneration
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-80 p-4 bg-white/95 backdrop-blur-lg border border-green-100 shadow-2xl rounded-xl">
                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-green-800 mb-2 px-2">Regenerative Solutions</div>
                  <Link href="/bioregions" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-green-50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-green-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-xl transition-shadow">
                        <Leaf className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Bioregion Explorer</div>
                        <div className="text-sm text-gray-600">Global ecosystems and conservation</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/hawaii" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-blue-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-shadow">
                        <Mountain className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Hawaiʻi Regeneration</div>
                        <div className="text-sm text-gray-600">Island restoration and traditional practices</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/appalachian" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-emerald-50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-emerald-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:shadow-xl transition-shadow">
                        <Mountain className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Appalachian Regeneration</div>
                        <div className="text-sm text-gray-600">Mountain heritage and forest restoration</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
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

          </div>
        </div>
      )}
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stormy-dark via-stormy-primary/30 to-stormy-dark/80">
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
