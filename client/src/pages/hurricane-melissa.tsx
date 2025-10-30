import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, MapPin, Package, TruckIcon, AlertTriangle, PlusCircle, Building2, FileText, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import JamaicaInfrastructureMap from "@/components/JamaicaInfrastructureMap";
import r8Logo from "@/assets/r8-logo.png";

export default function HurricaneMelissaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Top Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 gap-2"
              data-testid="button-back-to-r8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to R8
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={r8Logo}
              alt="R8 Logo"
              className="w-8 h-8"
            />
            <span className="text-white font-semibold text-sm">R8 Disaster Relief Platform</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <CloudRain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Hurricane Melissa</h1>
              <p className="text-red-100 text-lg">Category 5 • Jamaica Response & Recovery Operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-red-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              <span className="font-bold">ACTIVE DISASTER:</span> Category 5 hurricane making landfall in Jamaica (Oct 27-28, 2025). 
              Strongest storm to hit the island since record-keeping began in 1851. Entire country at risk - all 14 parishes under hurricane warnings.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="overflow-x-auto mb-8">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 whitespace-nowrap">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Crisis Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="infrastructure" className="flex items-center gap-2 whitespace-nowrap">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Infrastructure Map</span>
                <span className="sm:hidden">Map</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2 whitespace-nowrap">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Aid Distribution</span>
                <span className="sm:hidden">Aid</span>
              </TabsTrigger>
              <TabsTrigger value="logistics" className="flex items-center gap-2 whitespace-nowrap">
                <TruckIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Transportation</span>
                <span className="sm:hidden">Transport</span>
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2 whitespace-nowrap">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Damage Reports</span>
                <span className="sm:hidden">Damage</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Situational Overview</CardTitle>
                  <CardDescription>Real-time crisis information for Hurricane Melissa response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-700">2.8M+</div>
                      <div className="text-sm text-red-600">People Affected</div>
                      <div className="text-xs text-gray-600 mt-1">Entire country impacted</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">Cat 5</div>
                      <div className="text-sm text-blue-600">Hurricane Category</div>
                      <div className="text-xs text-gray-600 mt-1">Strongest since 1851</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Affected Parishes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {['Saint Elizabeth', 'Manchester', 'Clarendon', 'Saint Catherine', 
                        'Saint Andrew', 'Kingston', 'Saint Thomas', 'Portland'].map(parish => (
                        <div key={parish} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-gray-700">{parish}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Key Response Partners</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• <span className="font-medium">ODPEM</span> - Office of Disaster Preparedness & Emergency Management (Jamaica)</div>
                      <div>• <span className="font-medium">CDEMA</span> - Caribbean Disaster Emergency Management Agency</div>
                      <div>• <span className="font-medium">Jamaica Red Cross</span> - 250 shelter kits pre-positioned</div>
                      <div>• <span className="font-medium">WFP Caribbean Hub</span> - Regional logistics support (Barbados)</div>
                      <div>• <span className="font-medium">JDF DART</span> - Jamaica Defence Force Disaster Assistance Response Team</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="infrastructure">
            <div className="h-[calc(100vh-280px)]">
              <JamaicaInfrastructureMap />
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="space-y-6">
              {/* Supply Site Onboarding Call-to-Action */}
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-orange-900">Register New Supply Distribution Site</CardTitle>
                      <CardDescription className="text-orange-700">
                        Emergency responders: Add your POD, warehouse, or community distribution center to the network
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/60 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Why Register Your Site?</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-gray-700"><strong>Coordinate Aid:</strong> Connect with WFP, CDEMA, and local partners for resource distribution</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-gray-700"><strong>Track Inventory:</strong> Real-time aid distribution tracking (food, water, medical supplies)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-gray-700"><strong>Request Support:</strong> Signal needs and receive targeted deliveries</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-gray-700"><strong>Privacy Controls:</strong> Choose what information to share publicly vs. authenticated partners</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/supply-sites?onboard=true">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg"
                        data-testid="button-onboard-supply-site"
                      >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Register Supply Site for Hurricane Response
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      data-testid="button-learn-more"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Learn About WSS Network
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Fast-Track Registration:</strong> During this emergency, supply sites can join the R8 network immediately. 
                      Our onboarding wizard takes 5-10 minutes and matches the WSS (WNC Supply Sites) database schema for seamless coordination.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Inventory System */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Supply Sites - Hurricane Melissa Response</CardTitle>
                  <CardDescription>Real-time aid distribution tracking across Jamaica network</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-medium mb-2">Aid Distribution System Loading...</p>
                    <p className="text-sm">WSS-style aid tracking for registered sites</p>
                    <p className="text-xs text-gray-400 mt-4">Register your site above to access this system</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logistics">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-white/50 z-10 flex items-center justify-center">
                <div className="text-center p-8 bg-white/90 rounded-lg shadow-lg border-2 border-blue-200">
                  <TruckIcon className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <p className="text-2xl font-bold text-blue-900 mb-2">In Development - Available Upon Request</p>
                  <p className="text-sm text-blue-700">Transportation & logistics module coming soon</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle>Transportation & Logistics</CardTitle>
                <CardDescription>Vehicle dispatch, route planning, convoy status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <TruckIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium mb-2">Logistics Module Loading...</p>
                  <p className="text-sm">Transportation coordination system</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-white/50 z-10 flex items-center justify-center">
                <div className="text-center p-8 bg-white/90 rounded-lg shadow-lg border-2 border-amber-200">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-amber-400" />
                  <p className="text-2xl font-bold text-amber-900 mb-2">In Development - Available Upon Request</p>
                  <p className="text-sm text-amber-700">Damage assessment module coming soon</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle>Damage Assessment</CardTitle>
                <CardDescription>Geotagged photos and reports from field teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium mb-2">Assessment Interface Loading...</p>
                  <p className="text-sm">Field reporting system</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
