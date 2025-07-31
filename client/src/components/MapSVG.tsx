import { useState } from "react";

interface MapSVGProps {
  mapView: "bioregions" | "states" | "counties" | "fema";
  onRegionClick?: (regionId: string, regionName: string) => void;
  showDisasters?: boolean;
  showActivities?: boolean;
}

// Simplified SVG map of North America with basic state/province outlines
export default function MapSVG({ mapView, onRegionClick, showDisasters, showActivities }: MapSVGProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleRegionClick = (regionId: string, regionName: string) => {
    onRegionClick?.(regionId, regionName);
  };

  // Sample disaster and activity locations (would come from props in real implementation)
  const disasters = [
    { id: 1, x: 150, y: 200, severity: "high", type: "Wildfire" },
    { id: 2, x: 400, y: 350, severity: "medium", type: "Flooding" },
    { id: 3, x: 600, y: 400, severity: "high", type: "Hurricane" },
  ];

  const activities = [
    { id: 1, x: 200, y: 150, type: "Food Distribution" },
    { id: 2, x: 100, y: 300, type: "Community Garden" },
    { id: 3, x: 500, y: 250, type: "Disaster Preparedness" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#6b7280";
    }
  };

  return (
    <div className="w-full h-full">
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full"
        style={{ maxHeight: "500px" }}
      >
        {/* Background */}
        <rect width="800" height="500" fill="#f8fafc" />
        
        {/* Detailed North America with bioregional approach */}
        <g id="north-america">
          {/* Base country outlines */}
          <path
            d="M50 200 L50 380 L200 380 L200 350 L350 350 L350 320 L500 320 L500 300 L600 300 L600 280 L700 280 L700 200 L650 200 L650 150 L500 150 L500 180 L350 180 L350 200 Z"
            fill={mapView === "bioregions" ? "none" : "#f8fafc"}
            stroke="#64748b"
            strokeWidth="2"
            className="cursor-pointer transition-colors"
          />
          
          <path
            d="M50 50 L50 200 L350 200 L350 180 L500 180 L500 150 L650 150 L650 100 L700 100 L700 50 Z"
            fill={mapView === "bioregions" ? "none" : "#f8fafc"}
            stroke="#64748b"
            strokeWidth="2"
            className="cursor-pointer transition-colors"
          />

          {/* Sample state divisions when states view is selected */}
          {mapView === "states" && (
            <>
              {/* California */}
              <path
                d="M50 200 L50 300 L100 300 L100 200 Z"
                fill="#f1f5f9"
                stroke="#64748b"
                strokeWidth="0.5"
                className="cursor-pointer hover:fill-blue-200 transition-colors"
                onClick={() => handleRegionClick("ca-state", "California")}
              />
              
              {/* Texas */}
              <path
                d="M200 300 L200 380 L350 380 L350 300 Z"
                fill="#f1f5f9"
                stroke="#64748b"
                strokeWidth="0.5"
                className="cursor-pointer hover:fill-blue-200 transition-colors"
                onClick={() => handleRegionClick("tx", "Texas")}
              />
              
              {/* Florida */}
              <path
                d="M500 320 L500 380 L600 380 L600 350 L600 320 Z"
                fill="#f1f5f9"
                stroke="#64748b"
                strokeWidth="0.5"
                className="cursor-pointer hover:fill-blue-200 transition-colors"
                onClick={() => handleRegionClick("fl", "Florida")}
              />
            </>
          )}

          {/* FEMA Regions overlay */}
          {mapView === "fema" && (
            <>
              <rect
                x="50" y="150" width="200" height="100"
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="cursor-pointer"
                onClick={() => handleRegionClick("fema-9", "FEMA Region IX")}
              />
              <text x="150" y="200" textAnchor="middle" className="text-xs font-medium fill-blue-700">
                FEMA IX
              </text>
              
              <rect
                x="300" y="200" width="200" height="120"
                fill="rgba(16, 185, 129, 0.2)"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="cursor-pointer"
                onClick={() => handleRegionClick("fema-6", "FEMA Region VI")}
              />
              <text x="400" y="260" textAnchor="middle" className="text-xs font-medium fill-green-700">
                FEMA VI
              </text>
            </>
          )}

          {/* Bioregions - inspired by OneEarth Navigator */}
          {mapView === "bioregions" && (
            <>
              {/* Pacific Northwest Coastal */}
              <path
                d="M50 150 L50 250 L120 250 L120 200 L150 180 L150 150 Z"
                fill="#8FBC8F"
                stroke="#228B22"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleRegionClick("pacific-northwest-coastal", "Pacific Northwest Coastal")}
              />
              
              {/* Pacific Northwest Mountains */}
              <path
                d="M120 150 L120 200 L180 180 L200 160 L180 140 L150 150 Z"
                fill="#DEB887"
                stroke="#D2691E"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleRegionClick("pacific-northwest-mountains", "Cascade-Sierra Mountains")}
              />
              
              {/* Great Basin */}
              <path
                d="M150 200 L150 280 L250 280 L250 220 L200 200 Z"
                fill="#F4A460"
                stroke="#CD853F"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleRegionClick("great-basin", "Great Basin")}
              />
              
              {/* Great Plains */}
              <path
                d="M300 180 L300 350 L450 350 L450 200 L380 180 Z"
                fill="#F0E68C"
                stroke="#DAA520"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleRegionClick("great-plains", "Great Plains")}
              />
              
              {/* Eastern Deciduous Forests */}
              <path
                d="M450 200 L450 320 L600 320 L600 220 L550 200 Z"
                fill="#90EE90"
                stroke="#32CD32"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleRegionClick("eastern-deciduous", "Eastern Deciduous Forests")}
              />
              
              {/* Southeastern Coastal Plain */}
              <path
                d="M500 320 L500 380 L650 380 L650 340 L600 320 Z"
                fill="#98FB98"
                stroke="#00FF7F"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleRegionClick("southeastern-coastal", "Southeastern Coastal Plain")}
              />
              
              {/* Boreal Shield (Canada) */}
              <path
                d="M200 50 L200 150 L500 150 L500 100 L400 50 Z"
                fill="#DDA0DD"
                stroke="#9370DB"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleRegionClick("boreal-shield", "Boreal Shield")}
              />
              
              {/* Arctic Tundra */}
              <path
                d="M150 50 L150 120 L550 120 L550 50 Z"
                fill="#E6E6FA"
                stroke="#9400D3"
                strokeWidth="1.5"
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleRegionClick("arctic-tundra", "Arctic Tundra")}
              />
              
              {/* Region Labels */}
              <text x="85" y="200" textAnchor="middle" className="text-xs font-medium fill-green-800 pointer-events-none">
                Pacific NW
              </text>
              <text x="200" y="240" textAnchor="middle" className="text-xs font-medium fill-orange-800 pointer-events-none">
                Great Basin
              </text>
              <text x="375" y="270" textAnchor="middle" className="text-xs font-medium fill-yellow-800 pointer-events-none">
                Great Plains
              </text>
              <text x="525" y="260" textAnchor="middle" className="text-xs font-medium fill-green-800 pointer-events-none">
                Eastern Forests
              </text>
              <text x="350" y="100" textAnchor="middle" className="text-xs font-medium fill-purple-800 pointer-events-none">
                Boreal Shield
              </text>
              <text x="350" y="80" textAnchor="middle" className="text-xs font-medium fill-purple-600 pointer-events-none">
                Arctic Tundra
              </text>
            </>
          )}
        </g>

        {/* Disaster markers */}
        {showDisasters && disasters.map((disaster) => (
          <g key={disaster.id}>
            <circle
              cx={disaster.x}
              cy={disaster.y}
              r="8"
              fill={getSeverityColor(disaster.severity)}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer animate-pulse"
            />
            <circle
              cx={disaster.x}
              cy={disaster.y}
              r="12"
              fill="none"
              stroke={getSeverityColor(disaster.severity)}
              strokeWidth="1"
              opacity="0.5"
            />
          </g>
        ))}

        {/* Activity markers */}
        {showActivities && activities.map((activity) => (
          <g key={activity.id}>
            <rect
              x={activity.x - 6}
              y={activity.y - 6}
              width="12"
              height="12"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer"
            />
          </g>
        ))}

        {/* Hover tooltip */}
        {hoveredRegion && (
          <g>
            <rect
              x="10" y="10"
              width="120" height="30"
              fill="rgba(0, 0, 0, 0.8)"
              rx="4"
            />
            <text
              x="70" y="28"
              textAnchor="middle"
              className="text-sm fill-white"
            >
              {hoveredRegion === "us" ? "United States" : 
               hoveredRegion === "ca" ? "Canada" : hoveredRegion}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}