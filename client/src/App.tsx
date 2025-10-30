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
import { Calendar, Home as HomeIcon, Menu, X, MapPin, BarChart3, Bell, Leaf, Mountain, ChevronDown, Shield, Wind, TreePine, BookOpen, CloudRain, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
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
import DisasterMapPage from "@/pages/disaster-map";
import SupplySitesPage from "@/pages/supply-sites";
import SupplySitesMapPage from "@/pages/supply-sites-map";
import HurricaneMelissaPage from "@/pages/hurricane-melissa";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import TermsOfServicePage from "@/pages/terms-of-service";
import { StateSVGDefs } from "@/components/StateIcon";
import { Footer } from "@/components/Footer";
import { GlobalFilterIndicator } from "@/components/GlobalFilterIndicator";
import ComingSoonPage from "@/pages/coming-soon";
import AirtableTestPage from "@/pages/airtable-test";
import r8Logo from "@/assets/r8-logo.png";

function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            // Clear access and force redirect to coming soon page
            sessionStorage.removeItem('platformAccess');
            sessionStorage.removeItem('accessUser');
            window.location.href = '/';
          }}
        >
          <img
            src={r8Logo}
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

          <Link href="/disaster-map">
            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              location === "/disaster-map"
                ? "bg-purple-500 text-white shadow-md"
                : "text-white hover:bg-purple-500/20 hover:text-white"
            }`}>
              <MapPin className="h-4 w-4" />
              Disaster Map
            </button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                ['/map', '/stats', '/alerts', '/disaster-map', '/air-quality', '/noaa-climate', '/disaster-education', '/supply-sites', '/hurricane-melissa'].includes(location)
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
                  <Link href="/hurricane-melissa" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-red-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-red-700 group-hover:shadow-md group-hover:scale-110">
                      <CloudRain className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-red-700 transition-colors duration-200">🚨 Hurricane Melissa</div>
                      <div className="text-sm text-gray-600 group-hover:text-red-600 transition-colors duration-200">Jamaica Crisis Response</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/map" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-red-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-red-600 group-hover:shadow-md group-hover:scale-110">
                      <MapPin className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-red-700 transition-colors duration-200">Disaster Watch Center</div>
                      <div className="text-sm text-gray-600 group-hover:text-red-600 transition-colors duration-200">Real-time monitoring</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/stats" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-red-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-red-600 group-hover:shadow-md group-hover:scale-110">
                      <BarChart3 className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-red-700 transition-colors duration-200">Impact Statistics</div>
                      <div className="text-sm text-gray-600 group-hover:text-red-600 transition-colors duration-200">Analytics & metrics</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/alerts" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-red-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-red-600 group-hover:shadow-md group-hover:scale-110">
                      <Bell className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-red-700 transition-colors duration-200">Custom Alerts</div>
                      <div className="text-sm text-gray-600 group-hover:text-red-600 transition-colors duration-200">Personalized notifications</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/air-quality" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-blue-600 group-hover:shadow-md group-hover:scale-110">
                      <Wind className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Air Quality Monitor</div>
                      <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-200">Environmental health alerts</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/noaa-climate" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-cyan-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-cyan-600 group-hover:shadow-md group-hover:scale-110">
                      <Wind className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-cyan-700 transition-colors duration-200">NOAA Climate Reports</div>
                      <div className="text-sm text-gray-600 group-hover:text-cyan-600 transition-colors duration-200">Monthly climate monitoring</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/disaster-map" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-purple-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-purple-600 group-hover:shadow-md group-hover:scale-110">
                      <MapPin className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-200">Disaster Response Map</div>
                      <div className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors duration-200">Interactive mapping platform</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/disaster-education" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-orange-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-orange-600 group-hover:shadow-md group-hover:scale-110">
                      <Shield className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors duration-200">Disaster Education</div>
                      <div className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors duration-200">Interactive learning center</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/supply-sites" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-indigo-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-indigo-600 group-hover:shadow-md group-hover:scale-110">
                      <Package className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">Supply Site Network</div>
                      <div className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors duration-200">Aid distribution sites</div>
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
                  <Link href="/bioregions" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-green-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-green-600 group-hover:shadow-md group-hover:scale-110">
                      <Leaf className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors duration-200">Bioregion Explorer</div>
                      <div className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-200">Global ecosystems</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/hawaii" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-blue-600 group-hover:shadow-md group-hover:scale-110">
                      <Mountain className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Hawaiʻi Regeneration</div>
                      <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-200">Island restoration</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/appalachian" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-emerald-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-emerald-600 group-hover:shadow-md group-hover:scale-110">
                      <Mountain className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">Appalachian Regeneration</div>
                      <div className="text-sm text-gray-600 group-hover:text-emerald-600 transition-colors duration-200">Mountain heritage</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cascadia" className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-teal-50 hover:shadow-lg hover:scale-[1.02] group">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-teal-600 group-hover:shadow-md group-hover:scale-110">
                      <TreePine className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <div className="transition-colors duration-200">
                      <div className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors duration-200">Cascadia Bioregion</div>
                      <div className="text-sm text-gray-600 group-hover:text-teal-600 transition-colors duration-200">Temperate rainforest</div>
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
                variant={['/map', '/stats', '/alerts', '/supply-sites', '/hurricane-melissa'].includes(location) ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Response
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-0 bg-white/95 backdrop-blur-md">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider border-b border-gray-100 mb-1">
                Emergency Response
              </div>
              <DropdownMenuItem asChild>
                <Link href="/hurricane-melissa" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-red-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                    <CloudRain className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-red-700">🚨 Hurricane Melissa</div>
                    <div className="text-xs text-gray-500 group-hover:text-red-600">Jamaica Crisis Response</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/map" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-red-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                    <MapPin className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-red-700">Disaster Watch Center</div>
                    <div className="text-xs text-gray-500 group-hover:text-red-600">Real-time monitoring</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stats" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-700">Impact Statistics</div>
                    <div className="text-xs text-gray-500 group-hover:text-blue-600">Analytics & metrics</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/alerts" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-orange-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-200">
                    <Bell className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-orange-700">Custom Alerts</div>
                    <div className="text-xs text-gray-500 group-hover:text-orange-600">Personalized notifications</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/air-quality" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-cyan-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors duration-200">
                    <Wind className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-cyan-700">Air Quality Monitor</div>
                    <div className="text-xs text-gray-500 group-hover:text-cyan-600">Environmental health alerts</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/noaa-climate" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-teal-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors duration-200">
                    <CloudRain className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-teal-700">NOAA Climate Reports</div>
                    <div className="text-xs text-gray-500 group-hover:text-teal-600">Monthly climate monitoring</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/disaster-education" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-purple-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-purple-700">Disaster Education</div>
                    <div className="text-xs text-gray-500 group-hover:text-purple-600">Interactive learning center</div>
                  </div>
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
            <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-0 bg-white/95 backdrop-blur-md">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider border-b border-gray-100 mb-1">
                Ecosystem Regeneration
              </div>
              <DropdownMenuItem asChild>
                <Link href="/bioregions" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-green-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                    <Leaf className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-green-700">Bioregion Explorer</div>
                    <div className="text-xs text-gray-500 group-hover:text-green-600">Discover local ecosystems</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/hawaii" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-emerald-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors duration-200">
                    <Mountain className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-emerald-700">Hawaiʻi Regeneration</div>
                    <div className="text-xs text-gray-500 group-hover:text-emerald-600">Island restoration projects</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/appalachian" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-lime-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-lime-100 rounded-lg group-hover:bg-lime-200 transition-colors duration-200">
                    <Mountain className="h-4 w-4 text-lime-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-lime-700">Appalachian Regeneration</div>
                    <div className="text-xs text-gray-500 group-hover:text-lime-600">Mountain ecosystem restoration</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cascadia" className="flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 hover:bg-teal-50 hover:shadow-md hover:scale-[1.02] group">
                  <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors duration-200">
                    <Mountain className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-teal-700">Cascadia Regeneration</div>
                    <div className="text-xs text-gray-500 group-hover:text-teal-600">Pacific Northwest forests</div>
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
            <Link href="/hurricane-melissa">
              <Button
                variant={location === "/hurricane-melissa" ? "default" : "outline"}
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CloudRain className="h-4 w-4" />
                🚨 Hurricane Melissa
              </Button>
            </Link>
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
            <Link href="/supply-sites">
              <Button
                variant={location === "/supply-sites" ? "default" : "outline"}
                size="sm"
                className="w-full flex items-center gap-2 justify-start ml-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="h-4 w-4" />
                Supply Site Network
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
  // Track page views when routes change
  useAnalytics();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    const checkAccess = () => {
      const accessGranted = sessionStorage.getItem('platformAccess');
      setHasAccess(accessGranted === 'granted');
    };

    checkAccess();

    window.addEventListener('storage', checkAccess);
    return () => window.removeEventListener('storage', checkAccess);
  }, []);

  const isPublicRoute = ['/privacy-policy', '/terms-of-service', '/hurricane-melissa', '/supply-sites-map'].includes(location);
  const showNavigation = hasAccess && !isPublicRoute;

  // Show loading while checking access
  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showNavigation && (
        <>
          <StateSVGDefs />
          <Navigation />
        </>
      )}
      
      <div className="flex-1">
        <Switch>
          {/* Public routes */}
          <Route path="/privacy-policy" component={PrivacyPolicyPage} />
          <Route path="/terms-of-service" component={TermsOfServicePage} />
          <Route path="/hurricane-melissa" component={HurricaneMelissaPage} />
          <Route path="/supply-sites-map" component={SupplySitesMapPage} />

          {/* Protected routes */}
          {hasAccess ? (
            <>
              <Route path="/" component={Home} />
              <Route path="/volunteer" component={VolunteerPortal} />
              <Route path="/volunteer-portal" component={VolunteerPortal} />
              <Route path="/map" component={InteractiveMap} />
              <Route path="/stats" component={StatsDashboard} />
              <Route path="/alerts" component={AlertsPage} />
              <Route path="/disaster-map" component={DisasterMapPage} />
              <Route path="/air-quality" component={AirQualityPage} />
              <Route path="/noaa-climate" component={NoaaClimatePage} />
              <Route path="/disaster-education" component={DisasterEducationPage} />
              <Route path="/supply-sites" component={SupplySitesPage} />
              <Route path="/bioregions" component={BioregionExplorerPage} />
              <Route path="/hawaii" component={HawaiiRegenerationPage} />
              <Route path="/appalachian" component={AppalachianRegenerationPage} />
              <Route path="/cascadia" component={CascadiaRegenerationPage} />
              <Route path="/airtable-test" component={AirtableTestPage} />
              <Route component={NotFound} />
            </>
          ) : (
            // Redirect to Coming Soon if no access
            <Route path="*" component={ComingSoonPage} />
          )}
        </Switch>
      </div>
      
      {showNavigation && <Footer />}
    </>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  // Always render the Router - it handles access checks internally
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-stormy-dark via-stormy-medium to-stormy-dark">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;