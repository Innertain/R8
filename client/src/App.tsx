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
    <nav className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl px-8 py-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg"></div>
            <img 
              src="/src/assets/r8-logo.png"
              alt="R8 Logo" 
              className="relative w-12 h-12 drop-shadow-lg"
            />
          </div>
          <div className="relative">
            <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text tracking-tight">R8</h1>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent rounded-full"></div>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="flex gap-1">
            <NavigationMenuItem>
              <Link href="/">
                <NavigationMenuLink className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden ${
                  location === "/" 
                    ? "bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg shadow-white/10 border border-white/20" 
                    : "text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:shadow-lg hover:shadow-white/5 hover:border hover:border-white/10"
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <HomeIcon className="h-4 w-4" />
                    <span>Home</span>
                  </div>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link href="/volunteer">
                <NavigationMenuLink className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden ${
                  location === "/volunteer" 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30" 
                    : "text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-600/20 hover:shadow-lg hover:shadow-blue-500/20 hover:border hover:border-blue-400/30"
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Volunteer Portal</span>
                  </div>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden border-0 ${
                ['/map', '/stats', '/alerts'].includes(location) 
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 border border-red-400/30" 
                  : "text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 hover:shadow-lg hover:shadow-red-500/20 hover:border hover:border-red-400/30"
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Disaster Response</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-96 p-6 bg-gradient-to-br from-white/95 via-white/98 to-red-50/90 backdrop-blur-xl border border-red-200/50 shadow-2xl rounded-2xl">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900">Emergency Response</div>
                      <div className="text-xs text-red-600 font-medium">Real-time disaster management tools</div>
                    </div>
                  </div>
                  <Link href="/map" className="group">
                    <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-red-200/60 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div className="relative flex-1">
                        <div className="font-bold text-gray-900 group-hover:text-red-700 transition-colors mb-1">Disaster Watch Center</div>
                        <div className="text-sm text-gray-600 group-hover:text-gray-700">Real-time emergency monitoring and alerts</div>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-1 h-1 rounded-full bg-red-500"></div>
                          <div className="text-xs text-red-600 font-medium">Live monitoring active</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/stats" className="group">
                    <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-red-200/60 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div className="relative flex-1">
                        <div className="font-bold text-gray-900 group-hover:text-red-700 transition-colors mb-1">Impact Statistics</div>
                        <div className="text-sm text-gray-600 group-hover:text-gray-700">Analytics, metrics, and impact tracking</div>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-1 h-1 rounded-full bg-red-500"></div>
                          <div className="text-xs text-red-600 font-medium">Real-time data</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/alerts" className="group">
                    <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-red-200/60 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <div className="relative flex-1">
                        <div className="font-bold text-gray-900 group-hover:text-red-700 transition-colors mb-1">Custom Alerts</div>
                        <div className="text-sm text-gray-600 group-hover:text-gray-700">Personalized emergency notifications</div>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-1 h-1 rounded-full bg-red-500"></div>
                          <div className="text-xs text-red-600 font-medium">Smart filtering</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden border-0 ${
                ['/bioregions', '/hawaii', '/appalachian'].includes(location) 
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400/30" 
                  : "text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-green-600/20 hover:shadow-lg hover:shadow-emerald-500/20 hover:border hover:border-emerald-400/30"
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  <span>Regeneration</span>
                </div>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-96 p-6 bg-gradient-to-br from-white/95 via-white/98 to-emerald-50/90 backdrop-blur-xl border border-emerald-200/50 shadow-2xl rounded-2xl">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900">Regenerative Solutions</div>
                      <div className="text-xs text-emerald-600 font-medium">Ecosystem restoration & conservation</div>
                    </div>
                  </div>
                  <Link href="/bioregions" className="group">
                    <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-50/50 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-emerald-200/60 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <Leaf className="h-6 w-6 text-white" />
                      </div>
                      <div className="relative flex-1">
                        <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-1">Bioregion Explorer</div>
                        <div className="text-sm text-gray-600 group-hover:text-gray-700">Global ecosystems and conservation</div>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                          <div className="text-xs text-emerald-600 font-medium">846 ecoregions</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/hawaii" className="group">
                    <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50/50 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-blue-200/60 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <Mountain className="h-6 w-6 text-white" />
                      </div>
                      <div className="relative flex-1">
                        <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">Hawaiʻi Regeneration</div>
                        <div className="text-sm text-gray-600 group-hover:text-gray-700">Island restoration and traditional practices</div>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                          <div className="text-xs text-blue-600 font-medium">Ahupua'a systems</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/appalachian" className="group">
                    <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-50/50 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-emerald-200/60 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <Mountain className="h-6 w-6 text-white" />
                      </div>
                      <div className="relative flex-1">
                        <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-1">Appalachian Regeneration</div>
                        <div className="text-sm text-gray-600 group-hover:text-gray-700">Mountain heritage and forest restoration</div>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                          <div className="text-xs text-emerald-600 font-medium">Forest ecology</div>
                        </div>
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
