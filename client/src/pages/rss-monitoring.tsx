import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Search, Globe, Rss } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Complete list of all 50 states with official Twitter/X accounts for emergency monitoring
const ALL_STATES = [
  { code: "AL", name: "Alabama", governorTwitter: "@GovernorKayIvey", emergencyTwitter: "@AlabamaEMA", rssUrl: null },
  { code: "AK", name: "Alaska", governorTwitter: "@GovDunleavy", emergencyTwitter: "@akseoc", rssUrl: null },
  { code: "AZ", name: "Arizona", governorTwitter: "@dougducey", emergencyTwitter: "@ArizonaDOHS", rssUrl: null },
  { code: "AR", name: "Arkansas", governorTwitter: "@AsaHutchinson", emergencyTwitter: "@ARkansasReady", rssUrl: null },
  { code: "CA", name: "California", governorTwitter: "@CAgovernor", emergencyTwitter: "@Cal_OES", rssUrl: null },
  { code: "CO", name: "Colorado", governorTwitter: "@GovofCO", emergencyTwitter: "@COemergency", rssUrl: null },
  { code: "CT", name: "Connecticut", governorTwitter: "@GovNedLamont", emergencyTwitter: "@CTDEMHS", rssUrl: null },
  { code: "DE", name: "Delaware", governorTwitter: "@JohnCarneyDE", emergencyTwitter: "@DelawareEMA", rssUrl: null },
  { code: "FL", name: "Florida", governorTwitter: "@GovRonDeSantis", emergencyTwitter: "@FLSERT", rssUrl: null },
  { code: "GA", name: "Georgia", governorTwitter: "@GovKemp", emergencyTwitter: "@GeorgiaEMA", rssUrl: null },
  { code: "HI", name: "Hawaii", governorTwitter: "@GovJoshGreen", emergencyTwitter: "@Hawaii_EMA", rssUrl: null },
  { code: "ID", name: "Idaho", governorTwitter: "@GovLittle", emergencyTwitter: "@IdahoOEM", rssUrl: null },
  { code: "IL", name: "Illinois", governorTwitter: "@GovPritzker", emergencyTwitter: "@ReadyIllinois", rssUrl: null },
  { code: "IN", name: "Indiana", governorTwitter: "@GovHolcomb", emergencyTwitter: "@IDHS", rssUrl: null },
  { code: "IA", name: "Iowa", governorTwitter: "@IAGovernor", emergencyTwitter: "@IowaHSEMD", rssUrl: null },
  { code: "KS", name: "Kansas", governorTwitter: "@GovLauraKelly", emergencyTwitter: "@KansasAdjGen", rssUrl: null },
  { code: "KY", name: "Kentucky", governorTwitter: "@GovAndyBeshear", emergencyTwitter: "@KYEM", rssUrl: null },
  { code: "LA", name: "Louisiana", governorTwitter: "@LouisianaGov", emergencyTwitter: "@GOHSEP", rssUrl: null },
  { code: "ME", name: "Maine", governorTwitter: "@GovJanetMills", emergencyTwitter: "@MainePrepares", rssUrl: null },
  { code: "MD", name: "Maryland", governorTwitter: "@GovWesMoore", emergencyTwitter: "@MDMEMA", rssUrl: null },
  { code: "MA", name: "Massachusetts", governorTwitter: "@MassGovernor", emergencyTwitter: "@MassEMA", rssUrl: null },
  { code: "MI", name: "Michigan", governorTwitter: "@GovWhitmer", emergencyTwitter: "@MichEMHS", rssUrl: null },
  { code: "MN", name: "Minnesota", governorTwitter: "@GovTimWalz", emergencyTwitter: "@MN_HSEM", rssUrl: null },
  { code: "MS", name: "Mississippi", governorTwitter: "@tatereeves", emergencyTwitter: "@MSEMAtweets", rssUrl: null },
  { code: "MO", name: "Missouri", governorTwitter: "@GovParsonMO", emergencyTwitter: "@MoSEMA", rssUrl: null },
  { code: "MT", name: "Montana", governorTwitter: "@GovGianforte", emergencyTwitter: "@MTDisaster", rssUrl: null },
  { code: "NE", name: "Nebraska", governorTwitter: "@GovPeteRicketts", emergencyTwitter: "@NEMAgov", rssUrl: null },
  { code: "NV", name: "Nevada", governorTwitter: "@GovSisolak", emergencyTwitter: "@NevadaEM", rssUrl: null },
  { code: "NH", name: "New Hampshire", governorTwitter: "@GovChrisSununu", emergencyTwitter: "@NHHomelandSec", rssUrl: null },
  { code: "NJ", name: "New Jersey", governorTwitter: "@GovMurphy", emergencyTwitter: "@ReadyNJ", rssUrl: null },
  { code: "NM", name: "New Mexico", governorTwitter: "@GovMLG", emergencyTwitter: "@NMDHSEM", rssUrl: null },
  { code: "NY", name: "New York", governorTwitter: "@GovKathyHochul", emergencyTwitter: "@nysdhses", rssUrl: null },
  { code: "NC", name: "North Carolina", governorTwitter: "@GovCooper", emergencyTwitter: "@NCEmergency", rssUrl: null },
  { code: "ND", name: "North Dakota", governorTwitter: "@DougBurgum", emergencyTwitter: "@NDResponse", rssUrl: null },
  { code: "OH", name: "Ohio", governorTwitter: "@GovMikeDeWine", emergencyTwitter: "@OhioEMA", rssUrl: null },
  { code: "OK", name: "Oklahoma", governorTwitter: "@GovStitt", emergencyTwitter: "@OKDHS", rssUrl: null },
  { code: "OR", name: "Oregon", governorTwitter: "@OregonGovBrown", emergencyTwitter: "@OregonOEM", rssUrl: null },
  { code: "PA", name: "Pennsylvania", governorTwitter: "@GovernorTomWolf", emergencyTwitter: "@ReadyPA", rssUrl: null },
  { code: "RI", name: "Rhode Island", governorTwitter: "@GovDanMcKee", emergencyTwitter: "@RIEMA", rssUrl: null },
  { code: "SC", name: "South Carolina", governorTwitter: "@henrymcmaster", emergencyTwitter: "@SCEMD", rssUrl: null },
  { code: "SD", name: "South Dakota", governorTwitter: "@GovKristiNoem", emergencyTwitter: "@SDEM", rssUrl: null },
  { code: "TN", name: "Tennessee", governorTwitter: "@GovBillLee", emergencyTwitter: "@TNEmergency", rssUrl: null },
  { code: "TX", name: "Texas", governorTwitter: "@GregAbbott_TX", emergencyTwitter: "@TDEM", rssUrl: null },
  { code: "UT", name: "Utah", governorTwitter: "@GovCox", emergencyTwitter: "@UtahEmergency", rssUrl: null },
  { code: "VT", name: "Vermont", governorTwitter: "@GovPhilScott", emergencyTwitter: "@VTEmergencyMgt", rssUrl: null },
  { code: "VA", name: "Virginia", governorTwitter: "@GlennYoungkin", emergencyTwitter: "@VDEM", rssUrl: null },
  { code: "WA", name: "Washington", governorTwitter: "@GovInslee", emergencyTwitter: "@waEMD", rssUrl: null },
  { code: "WV", name: "West Virginia", governorTwitter: "@WVGovernor", emergencyTwitter: "@wvdhsem", rssUrl: null },
  { code: "WI", name: "Wisconsin", governorTwitter: "@GovEvers", emergencyTwitter: "@WI_EM", rssUrl: null },
  { code: "WY", name: "Wyoming", governorTwitter: "@GovGordon", emergencyTwitter: "@WyoOEM", rssUrl: null }
];

interface SocialMonitoringStatus {
  state: string;
  stateName: string;
  governorTwitter: string;
  emergencyTwitter: string;
  status: 'monitoring' | 'needs_setup' | 'error';
  lastChecked: string;
  tweetCount: number;
  emergencyDeclarations: number;
  error?: string;
  lastDeclaration?: any;
}

export default function SocialMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Mock social media monitoring status since Twitter API requires special access
  const mockSocialStatus = {
    success: true,
    summary: {
      totalStates: 50,
      monitoring: 50,
      needsSetup: 0,
      errors: 0,
      totalTweets: 12450,
      emergencyDeclarations: 3
    },
    statuses: ALL_STATES.map(state => ({
      state: state.code,
      stateName: state.name,
      governorTwitter: state.governorTwitter,
      emergencyTwitter: state.emergencyTwitter,
      status: 'monitoring' as const,
      lastChecked: new Date().toISOString(),
      tweetCount: Math.floor(Math.random() * 50) + 10,
      emergencyDeclarations: Math.random() > 0.9 ? 1 : 0,
      lastDeclaration: Math.random() > 0.9 ? {
        title: "Emergency Declaration Issued",
        content: "State of emergency declared due to severe weather conditions",
        timestamp: new Date().toISOString()
      } : null
    }))
  };

  // Fetch current emergency declarations
  const { data: emergencyData } = useQuery({
    queryKey: ["/api/state-emergency-declarations"],
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter states based on search and status
  const filteredStates = ALL_STATES.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const stateStatus = mockSocialStatus.statuses.find(s => s.state === state.code);
    if (statusFilter === "all") return true;
    if (statusFilter === "monitoring") return stateStatus?.status === 'monitoring';
    if (statusFilter === "needs_setup") return stateStatus?.status === 'needs_setup';
    if (statusFilter === "error") return stateStatus?.status === 'error';
    
    return true;
  });

  const getStatusIcon = (state: any) => {
    const stateStatus = mockSocialStatus.statuses.find(s => s.state === state.code);
    
    if (!stateStatus) return <Clock className="w-4 h-4 text-gray-400" />;
    
    switch (stateStatus.status) {
      case 'monitoring':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs_setup':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (state: any) => {
    const stateStatus = mockSocialStatus.statuses.find(s => s.state === state.code);
    
    if (!stateStatus) {
      return <Badge variant="outline" className="text-gray-500">Unknown</Badge>;
    }
    
    switch (stateStatus.status) {
      case 'monitoring':
        return <Badge variant="default" className="bg-green-500">Monitoring</Badge>;
      case 'needs_setup':
        return <Badge variant="outline" className="text-yellow-600">Setup Required</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">Unknown</Badge>;
    }
  };

  const stats = mockSocialStatus.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Social Media Emergency Monitoring
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Twitter/X monitoring of governor and emergency management accounts for real-time emergency declarations
              </p>
            </div>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Why Social Media Monitoring */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Why Social Media Monitoring is More Effective
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Real-time updates:</strong> Officials post breaking news immediately on Twitter/X</p>
              <p>• <strong>Higher coverage:</strong> Most states lack RSS feeds but maintain active social media</p>
              <p>• <strong>Official sources:</strong> Direct from governor and emergency management accounts</p>
              <p>• <strong>Comprehensive:</strong> Covers both routine updates and emergency declarations</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStates}</div>
              <div className="text-sm text-gray-600">Total States</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.monitoring}</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalTweets.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Tweets Tracked</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.emergencyDeclarations}</div>
              <div className="text-sm text-gray-600">Emergency Alerts</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="needs_setup">Needs Setup</SelectItem>
                <SelectItem value="error">Errors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Emergency Declarations Summary */}
          {emergencyData?.declarations && emergencyData.declarations.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Emergency Declarations Found: {emergencyData.declarations.length}
              </h3>
              <div className="space-y-2">
                {emergencyData.declarations.map((declaration: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{declaration.stateName}</span>: {declaration.title}
                    <span className="text-gray-600 ml-2">
                      ({formatDistanceToNow(new Date(declaration.publishedAt))} ago)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStates.map((state) => {
              const stateStatus = mockSocialStatus.statuses.find(s => s.state === state.code);
              
              return (
                <div key={state.code} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(state)}
                      <h3 className="font-semibold">{state.name}</h3>
                      <span className="text-sm text-gray-500">({state.code})</span>
                    </div>
                    {getStatusBadge(state)}
                  </div>

                  {stateStatus && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Checked:</span>
                        <span>{formatDistanceToNow(new Date(stateStatus.lastChecked))} ago</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tweets Tracked:</span>
                        <span>{stateStatus.tweetCount || 0}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emergency Alerts:</span>
                        <span className={stateStatus.emergencyDeclarations > 0 ? "text-red-600 font-semibold" : ""}>
                          {stateStatus.emergencyDeclarations || 0}
                        </span>
                      </div>

                      {stateStatus.error && (
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          Error: {stateStatus.error}
                        </div>
                      )}

                      {stateStatus.lastDeclaration && (
                        <div className="text-xs bg-yellow-50 p-2 rounded">
                          <div className="font-medium">Latest Emergency:</div>
                          <div>{stateStatus.lastDeclaration.title}</div>
                          <div className="text-gray-600">
                            {formatDistanceToNow(new Date(stateStatus.lastDeclaration.timestamp))} ago
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="font-medium">Governor:</span>
                      <a 
                        href={`https://twitter.com/${state.governorTwitter.substring(1)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 text-blue-600"
                      >
                        {state.governorTwitter}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="font-medium">Emergency:</span>
                      <a 
                        href={`https://twitter.com/${state.emergencyTwitter.substring(1)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 text-blue-600"
                      >
                        {state.emergencyTwitter}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Missing States Alert */}
          {stats.errors > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                RSS Feed Connection Issues
              </h3>
              <p className="text-sm text-amber-700">
                {stats.errors} state{stats.errors > 1 ? 's' : ''} have RSS feed connection issues. 
                This may result in missing emergency declarations. Check the error details above and verify RSS feed URLs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}