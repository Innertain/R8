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

  // US States SVG paths (simplified for key states)
  const statePaths = {
    CA: "M158,310 L120,220 L110,180 L140,120 L180,140 L200,180 L190,240 L170,280 L158,310 Z",
    TX: "M380,400 L320,380 L300,320 L340,280 L420,290 L460,340 L440,380 L400,420 L380,400 Z",
    FL: "M620,450 L580,420 L570,380 L590,360 L630,370 L660,400 L650,440 L620,450 Z",
    NY: "M680,180 L640,160 L630,120 L660,100 L700,110 L720,140 L710,170 L680,180 Z",
    PA: "M650,200 L610,180 L600,140 L630,120 L670,130 L690,160 L680,190 L650,200 Z",
    IL: "M520,240 L480,220 L470,180 L500,160 L540,170 L560,200 L550,230 L520,240 Z",
    OH: "M580,220 L540,200 L530,160 L560,140 L600,150 L620,180 L610,210 L580,220 Z",
    GA: "M600,350 L560,330 L550,290 L580,270 L620,280 L640,310 L630,340 L600,350 Z",
    NC: "M640,280 L600,260 L590,220 L620,200 L660,210 L680,240 L670,270 L640,280 Z",
    MI: "M540,180 L500,160 L490,120 L520,100 L560,110 L580,140 L570,170 L540,180 Z",
    WA: "M180,80 L140,60 L130,20 L160,0 L200,10 L220,40 L210,70 L180,80 Z",
    OR: "M160,120 L120,100 L110,60 L140,40 L180,50 L200,80 L190,110 L160,120 Z",
    CO: "M340,220 L300,200 L290,160 L320,140 L360,150 L380,180 L370,210 L340,220 Z",
    AZ: "M220,320 L180,300 L170,260 L200,240 L240,250 L260,280 L250,310 L220,320 Z",
    NV: "M200,240 L160,220 L150,180 L180,160 L220,170 L240,200 L230,230 L200,240 Z",
    UT: "M260,200 L220,180 L210,140 L240,120 L280,130 L300,160 L290,190 L260,200 Z",
    NM: "M300,320 L260,300 L250,260 L280,240 L320,250 L340,280 L330,310 L300,320 Z",
    ID: "M240,120 L200,100 L190,60 L220,40 L260,50 L280,80 L270,110 L240,120 Z",
    MT: "M280,80 L240,60 L230,20 L260,0 L300,10 L320,40 L310,70 L280,80 Z",
    WY: "M300,160 L260,140 L250,100 L280,80 L320,90 L340,120 L330,150 L300,160 Z",
    ND: "M380,80 L340,60 L330,20 L360,0 L400,10 L420,40 L410,70 L380,80 Z",
    SD: "M380,120 L340,100 L330,60 L360,40 L400,50 L420,80 L410,110 L380,120 Z",
    NE: "M380,160 L340,140 L330,100 L360,80 L400,90 L420,120 L410,150 L380,160 Z",
    KS: "M380,200 L340,180 L330,140 L360,120 L400,130 L420,160 L410,190 L380,200 Z",
    OK: "M380,240 L340,220 L330,180 L360,160 L400,170 L420,200 L410,230 L380,240 Z",
    AR: "M460,280 L420,260 L410,220 L440,200 L480,210 L500,240 L490,270 L460,280 Z",
    LA: "M460,360 L420,340 L410,300 L440,280 L480,290 L500,320 L490,350 L460,360 Z",
    MS: "M520,320 L480,300 L470,260 L500,240 L540,250 L560,280 L550,310 L520,320 Z",
    AL: "M560,320 L520,300 L510,260 L540,240 L580,250 L600,280 L590,310 L560,320 Z",
    TN: "M520,260 L480,240 L470,200 L500,180 L540,190 L560,220 L550,250 L520,260 Z",
    KY: "M540,240 L500,220 L490,180 L520,160 L560,170 L580,200 L570,230 L540,240 Z",
    IN: "M560,220 L520,200 L510,160 L540,140 L580,150 L600,180 L590,210 L560,220 Z",
    WV: "M620,240 L580,220 L570,180 L600,160 L640,170 L660,200 L650,230 L620,240 Z",
    VA: "M660,260 L620,240 L610,200 L640,180 L680,190 L700,220 L690,250 L660,260 Z",
    MD: "M680,220 L640,200 L630,160 L660,140 L700,150 L720,180 L710,210 L680,220 Z",
    DE: "M700,200 L660,180 L650,140 L680,120 L720,130 L740,160 L730,190 L700,200 Z",
    NJ: "M720,200 L680,180 L670,140 L700,120 L740,130 L760,160 L750,190 L720,200 Z",
    CT: "M740,160 L700,140 L690,100 L720,80 L760,90 L780,120 L770,150 L740,160 Z",
    RI: "M760,140 L720,120 L710,80 L740,60 L780,70 L800,100 L790,130 L760,140 Z",
    MA: "M780,120 L740,100 L730,60 L760,40 L800,50 L820,80 L810,110 L780,120 Z",
    VT: "M720,120 L680,100 L670,60 L700,40 L740,50 L760,80 L750,110 L720,120 Z",
    NH: "M740,100 L700,80 L690,40 L720,20 L760,30 L780,60 L770,90 L740,100 Z",
    ME: "M780,80 L740,60 L730,20 L760,0 L800,10 L820,40 L810,70 L780,80 Z",
    WI: "M500,180 L460,160 L450,120 L480,100 L520,110 L540,140 L530,170 L500,180 Z",
    MN: "M460,140 L420,120 L410,80 L440,60 L480,70 L500,100 L490,130 L460,140 Z",
    IA: "M420,180 L380,160 L370,120 L400,100 L440,110 L460,140 L450,170 L420,180 Z",
    MO: "M420,220 L380,200 L370,160 L400,140 L440,150 L460,180 L450,210 L420,220 Z",
    SC: "M620,320 L580,300 L570,260 L600,240 L640,250 L660,280 L650,310 L620,320 Z",
    AK: "M100,400 L60,380 L50,340 L80,320 L120,330 L140,360 L130,390 L100,400 Z",
    HI: "M200,450 L180,440 L175,430 L185,420 L205,425 L210,435 L200,450 Z"
  };

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
          
          {/* Interactive SVG Map */}
          <div className="relative bg-gray-900 rounded-lg p-4">
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-auto"
              style={{ maxHeight: '400px' }}
            >
              {Object.entries(statePaths).map(([stateCode, path]) => (
                <path
                  key={stateCode}
                  d={path}
                  fill={getStateColor(stateCode)}
                  stroke="#1f2937"
                  strokeWidth="1"
                  className="cursor-pointer transition-all duration-200 hover:brightness-110"
                  onMouseEnter={(e) => handleStateHover(stateCode, e)}
                  onMouseLeave={handleStateLeave}
                  onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                />
              ))}
            </svg>
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