import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EmergencyDeclaration {
  id: string;
  state: string;
  stateName: string;
  title: string;
  description: string;
  emergencyType: string;
  publishedAt: string;
  source: string;
  url: string;
}

interface InteractiveStateMapProps {
  declarations: EmergencyDeclaration[];
}

export function InteractiveStateMap({ declarations }: InteractiveStateMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Group declarations by state
  const declarationsByState = declarations.reduce((acc, declaration) => {
    if (!acc[declaration.state]) {
      acc[declaration.state] = [];
    }
    acc[declaration.state].push(declaration);
    return acc;
  }, {} as Record<string, EmergencyDeclaration[]>);

  const getStateColor = (stateCode: string) => {
    const stateDeclarations = declarationsByState[stateCode];
    if (!stateDeclarations || stateDeclarations.length === 0) {
      return "#3b82f6"; // Blue for no emergencies
    }
    
    // Color based on emergency severity/count
    if (stateDeclarations.length >= 3) return "#dc2626"; // Red for multiple emergencies
    if (stateDeclarations.length >= 2) return "#ea580c"; // Orange for 2 emergencies
    return "#f59e0b"; // Amber for 1 emergency
  };

  const handleStateHover = (stateCode: string, event: React.MouseEvent) => {
    setHoveredState(stateCode);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleStateLeave = () => {
    setHoveredState(null);
  };

  // Create a simplified grid-based map instead of complex SVG paths
  const stateGrid = [
    { code: "AK", x: 0, y: 6, name: "Alaska" },
    { code: "HI", x: 1, y: 7, name: "Hawaii" },
    { code: "WA", x: 0, y: 1, name: "Washington" },
    { code: "OR", x: 0, y: 2, name: "Oregon" },
    { code: "CA", x: 0, y: 3, name: "California" },
    { code: "NV", x: 1, y: 3, name: "Nevada" },
    { code: "ID", x: 1, y: 1, name: "Idaho" },
    { code: "UT", x: 1, y: 2, name: "Utah" },
    { code: "AZ", x: 1, y: 4, name: "Arizona" },
    { code: "MT", x: 2, y: 1, name: "Montana" },
    { code: "WY", x: 2, y: 2, name: "Wyoming" },
    { code: "CO", x: 2, y: 3, name: "Colorado" },
    { code: "NM", x: 2, y: 4, name: "New Mexico" },
    { code: "ND", x: 3, y: 1, name: "North Dakota" },
    { code: "SD", x: 3, y: 2, name: "South Dakota" },
    { code: "NE", x: 3, y: 3, name: "Nebraska" },
    { code: "KS", x: 3, y: 4, name: "Kansas" },
    { code: "OK", x: 3, y: 5, name: "Oklahoma" },
    { code: "TX", x: 3, y: 6, name: "Texas" },
    { code: "MN", x: 4, y: 1, name: "Minnesota" },
    { code: "IA", x: 4, y: 2, name: "Iowa" },
    { code: "MO", x: 4, y: 3, name: "Missouri" },
    { code: "AR", x: 4, y: 4, name: "Arkansas" },
    { code: "LA", x: 4, y: 5, name: "Louisiana" },
    { code: "WI", x: 5, y: 1, name: "Wisconsin" },
    { code: "IL", x: 5, y: 2, name: "Illinois" },
    { code: "MS", x: 5, y: 4, name: "Mississippi" },
    { code: "AL", x: 5, y: 5, name: "Alabama" },
    { code: "MI", x: 6, y: 1, name: "Michigan" },
    { code: "IN", x: 6, y: 2, name: "Indiana" },
    { code: "KY", x: 6, y: 3, name: "Kentucky" },
    { code: "TN", x: 6, y: 4, name: "Tennessee" },
    { code: "GA", x: 6, y: 5, name: "Georgia" },
    { code: "FL", x: 7, y: 6, name: "Florida" },
    { code: "OH", x: 7, y: 2, name: "Ohio" },
    { code: "WV", x: 7, y: 3, name: "West Virginia" },
    { code: "VA", x: 7, y: 4, name: "Virginia" },
    { code: "NC", x: 7, y: 5, name: "North Carolina" },
    { code: "SC", x: 8, y: 5, name: "South Carolina" },
    { code: "PA", x: 8, y: 2, name: "Pennsylvania" },
    { code: "MD", x: 8, y: 3, name: "Maryland" },
    { code: "DE", x: 9, y: 3, name: "Delaware" },
    { code: "NJ", x: 9, y: 2, name: "New Jersey" },
    { code: "NY", x: 9, y: 1, name: "New York" },
    { code: "CT", x: 10, y: 2, name: "Connecticut" },
    { code: "RI", x: 10, y: 3, name: "Rhode Island" },
    { code: "MA", x: 10, y: 1, name: "Massachusetts" },
    { code: "VT", x: 11, y: 1, name: "Vermont" },
    { code: "NH", x: 11, y: 2, name: "New Hampshire" },
    { code: "ME", x: 12, y: 1, name: "Maine" }
  ];

  return (
    <div className="relative">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Emergency Declarations by State</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>No Emergencies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span>1 Emergency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>2 Emergencies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>3+ Emergencies</span>
              </div>
            </div>
          </div>
          
          {/* Interactive Grid-Based Map */}
          <div className="relative bg-gray-900 rounded-lg p-4">
            <div className="grid gap-1 max-w-4xl mx-auto" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
              {Array.from({ length: 8 }, (_, rowIndex) => (
                Array.from({ length: 13 }, (_, colIndex) => {
                  const state = stateGrid.find(s => s.x === colIndex && s.y === rowIndex);
                  
                  if (!state) {
                    return (
                      <div 
                        key={`empty-${rowIndex}-${colIndex}`} 
                        className="aspect-square"
                      />
                    );
                  }
                  
                  return (
                    <div
                      key={state.code}
                      className="aspect-square border border-gray-700 rounded cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: getStateColor(state.code) }}
                      onMouseEnter={(e) => handleStateHover(state.code, e)}
                      onMouseLeave={handleStateLeave}
                      onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                    >
                      {state.code}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {hoveredState && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <h4 className="font-semibold">{hoveredState}</h4>
            </div>
            
            {declarationsByState[hoveredState] && declarationsByState[hoveredState].length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600 font-medium">
                  {declarationsByState[hoveredState].length} Active Emergency Declaration{declarationsByState[hoveredState].length > 1 ? 's' : ''}
                </p>
                {declarationsByState[hoveredState].slice(0, 2).map((declaration) => (
                  <div key={declaration.id} className="border-l-2 border-red-500 pl-3">
                    <p className="text-sm font-medium line-clamp-2">{declaration.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {declaration.emergencyType}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(declaration.publishedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
                {declarationsByState[hoveredState].length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{declarationsByState[hoveredState].length - 2} more declarations
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">No Active Emergencies</span>
                </div>
                <p className="text-xs text-gray-500">Currently monitoring official government sources</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}