import { X, Filter, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalFilterIndicatorProps {
  stateFilter: string | undefined;
  onClearFilter: () => void;
}

const stateNames: Record<string, string> = {
  // US States
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  // US Territories
  'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam', 'AS': 'American Samoa', 'MP': 'Northern Mariana Islands',
  // Canadian Provinces
  'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick', 'NL': 'Newfoundland and Labrador',
  'NS': 'Nova Scotia', 'NT': 'Northwest Territories', 'NU': 'Nunavut', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
  'QC': 'Quebec', 'SK': 'Saskatchewan', 'YT': 'Yukon',
  // International Countries
  'RU': 'Russia', 'JP': 'Japan', 'CL': 'Chile', 'PERU': 'Peru', 'IND': 'Indonesia', 'PH': 'Philippines',
  'TR': 'Turkey', 'GR': 'Greece', 'IR': 'Iran', 'MX': 'Mexico', 'GT': 'Guatemala', 'NZ': 'New Zealand',
  'OCEAN': 'Ocean', 'INTL': 'International'
};

export function GlobalFilterIndicator({ stateFilter, onClearFilter }: GlobalFilterIndicatorProps) {
  if (!stateFilter || stateFilter === 'all') {
    return null;
  }

  const stateName = stateNames[stateFilter.toUpperCase()] || stateFilter;

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg border-b-2 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-semibold text-sm">
                Global Filter Active: {stateName}
              </span>
            </div>
            <div className="hidden sm:block text-xs opacity-90">
              All sections are filtered to show only {stateName} data
            </div>
          </div>
          
          <Button
            onClick={onClearFilter}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filter
          </Button>
        </div>
        
        <div className="text-xs opacity-75 mt-1 sm:hidden">
          All sections filtered to show only {stateName} data
        </div>
      </div>
    </div>
  );
}