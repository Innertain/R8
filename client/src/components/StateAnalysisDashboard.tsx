import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { StateIcon } from '@/components/StateIcon';

interface StateAnalysisDashboardProps {
  disasters: any[];
}

// All 50 US States
const ALL_US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const STATE_NAMES: { [key: string]: string } = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

export function StateAnalysisDashboard({ disasters }: StateAnalysisDashboardProps) {
  // Get states that have had disasters
  const statesWithDisasters = Array.from(new Set(disasters.map(d => d.state))).sort();
  
  // Find states without disasters
  const statesWithoutDisasters = ALL_US_STATES.filter(state => !statesWithDisasters.includes(state));
  
  // Calculate disaster counts per state
  const disasterCounts = disasters.reduce((acc, disaster) => {
    acc[disaster.state] = (acc[disaster.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort states by disaster count
  const sortedStatesWithDisasters = statesWithDisasters.sort((a, b) => 
    (disasterCounts[b] || 0) - (disasterCounts[a] || 0)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            State Disaster Analysis: 50 US States
          </CardTitle>
          <p className="text-sm text-gray-600">
            Complete breakdown of FEMA disaster declarations across all US states
          </p>
        </CardHeader>
        <CardContent>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{statesWithDisasters.length}</div>
                <div className="text-sm text-gray-600">States with Disasters</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{statesWithoutDisasters.length}</div>
                <div className="text-sm text-gray-600">States without Disasters</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">50</div>
                <div className="text-sm text-gray-600">Total US States</div>
              </CardContent>
            </Card>
          </div>

          {/* States with Disasters */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              States with FEMA Disasters ({statesWithDisasters.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedStatesWithDisasters.map((state) => (
                <div
                  key={state}
                  className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <StateIcon state={state} size={24} className="drop-shadow-sm" />
                    <div>
                      <div className="font-semibold text-orange-900">{state}</div>
                      <div className="text-sm text-orange-700">{STATE_NAMES[state]}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {disasterCounts[state]} disaster{disasterCounts[state] !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* States without Disasters */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              States without FEMA Disasters ({statesWithoutDisasters.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {statesWithoutDisasters.map((state) => (
                <div
                  key={state}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <StateIcon state={state} size={24} className="drop-shadow-sm" />
                    <div>
                      <div className="font-semibold text-green-900">{state}</div>
                      <div className="text-sm text-green-700">{STATE_NAMES[state]}</div>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
            {statesWithoutDisasters.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>All 50 states have experienced FEMA disasters in this dataset</p>
              </div>
            )}
          </div>

          {/* Analysis Summary */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Analysis Summary</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {statesWithDisasters.length} out of 50 US states have recorded FEMA disaster declarations</li>
              <li>• {statesWithoutDisasters.length} states have no disasters in the current dataset timeframe</li>
              <li>• Total disasters recorded: {disasters.length} across {statesWithDisasters.length} states</li>
              <li>• Most affected state: {sortedStatesWithDisasters[0]} ({STATE_NAMES[sortedStatesWithDisasters[0]]}) with {disasterCounts[sortedStatesWithDisasters[0]]} disasters</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StateAnalysisDashboard;