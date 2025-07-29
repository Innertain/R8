import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Calendar, Home as HomeIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import VolunteerPortal from "@/pages/volunteer-portal";
import AirtableTest from "@/pages/airtable-test";

function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Volunteer Management</h1>
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
              Shifts
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
          <Link href="/airtable-test">
            <Button 
              variant={location === "/airtable-test" ? "default" : "outline"} 
              size="sm"
              className="flex items-center gap-2"
            >
              🔍 Airtable Test
            </Button>
          </Link>
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
        <div className="sm:hidden border-t border-gray-200 mt-3 pt-3">
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="h-4 w-4" />
                Browse Shifts
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
            <Link href="/airtable-test">
              <Button 
                variant={location === "/airtable-test" ? "default" : "outline"} 
                size="sm"
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔍 Airtable Test
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/volunteer" component={VolunteerPortal} />
        <Route path="/airtable-test" component={AirtableTest} />
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
