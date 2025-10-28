import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, MapPin, Package, TruckIcon, AlertTriangle } from "lucide-react";
import JamaicaInfrastructureMap from "@/components/JamaicaInfrastructureMap";

export default function HurricaneMelissaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
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
              Strongest storm to hit the island since record-keeping began in 1851. 165,000+ people at risk across 8 parishes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Crisis Dashboard
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Infrastructure Map
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Commodity Inventory
            </TabsTrigger>
            <TabsTrigger value="logistics" className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4" />
              Transportation
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Damage Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Situational Overview</CardTitle>
                  <CardDescription>Real-time crisis information for Hurricane Melissa response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-700">165,000+</div>
                      <div className="text-sm text-red-600">People at Risk</div>
                      <div className="text-xs text-gray-600 mt-1">Across 8 parishes</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">Cat 5</div>
                      <div className="text-sm text-blue-600">Hurricane Category</div>
                      <div className="text-xs text-gray-600 mt-1">Strongest since 1851</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">48-72hrs</div>
                      <div className="text-sm text-green-600">WFP Hub Response Time</div>
                      <div className="text-xs text-gray-600 mt-1">Barbados to Jamaica</div>
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
            <Card>
              <CardHeader>
                <CardTitle>Commodity Inventory</CardTitle>
                <CardDescription>Track food, water, medical supplies, shelter kits, and equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium mb-2">Inventory System Loading...</p>
                  <p className="text-sm">WSS-style commodity tracking</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logistics">
            <Card>
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
            <Card>
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
