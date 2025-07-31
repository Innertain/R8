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
        
        {/* Simplified North America outline */}
        <g id="north-america">
          {/* United States (simplified) */}
          <path
            d="M50 200 L50 380 L200 380 L200 350 L350 350 L350 320 L500 320 L500 300 L600 300 L600 280 L700 280 L700 200 L650 200 L650 150 L500 150 L500 180 L350 180 L350 200 Z"
            fill={mapView === "states" ? "#e2e8f0" : "#cbd5e1"}
            stroke="#94a3b8"
            strokeWidth="1"
            className="cursor-pointer hover:fill-blue-100 transition-colors"
            onClick={() => handleRegionClick("us", "United States")}
            onMouseEnter={() => setHoveredRegion("us")}
            onMouseLeave={() => setHoveredRegion(null)}
          />
          
          {/* Canada (simplified) */}
          <path
            d="M50 50 L50 200 L350 200 L350 180 L500 180 L500 150 L650 150 L650 100 L700 100 L700 50 Z"
            fill={mapView === "states" ? "#e2e8f0" : "#cbd5e1"}
            stroke="#94a3b8"
            strokeWidth="1"
            className="cursor-pointer hover:fill-blue-100 transition-colors"
            onClick={() => handleRegionClick("ca", "Canada")}
            onMouseEnter={() => setHoveredRegion("ca")}
            onMouseLeave={() => setHoveredRegion(null)}
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

          {/* Bioregions overlay */}
          {mapView === "bioregions" && (
            <>
              <ellipse
                cx="150" cy="200" rx="80" ry="60"
                fill="rgba(168, 85, 247, 0.2)"
                stroke="#a855f7"
                strokeWidth="2"
                className="cursor-pointer"
                onClick={() => handleRegionClick("pacific-northwest", "Pacific Northwest")}
              />
              <text x="150" y="200" textAnchor="middle" className="text-xs font-medium fill-purple-700">
                Pacific Northwest
              </text>
              
              <ellipse
                cx="400" cy="280" rx="100" ry="80"
                fill="rgba(245, 158, 11, 0.2)"
                stroke="#f59e0b"
                strokeWidth="2"
                className="cursor-pointer"
                onClick={() => handleRegionClick("great-plains", "Great Plains")}
              />
              <text x="400" y="280" textAnchor="middle" className="text-xs font-medium fill-amber-700">
                Great Plains
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