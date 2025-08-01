import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Database, ExternalLink } from "lucide-react";

export function FemaDataInsights() {
  return (
    <Card className="hover:shadow-lg transition-shadow border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="w-5 h-5 text-blue-600" />
          FEMA Data Limitations & Insights
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
            Data Analysis
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Limited Storm Naming</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                FEMA's disaster declarations use generic titles like "Major Disaster: 4834" rather than named storms. 
                Hurricane Helene, Ian, Milton, etc. are not explicitly named in the dataset - they're just labeled as "Hurricane" incidents.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              What We Have
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 389 total disaster records</li>
              <li>• Incident types (Hurricane, Fire, Flood, etc.)</li>
              <li>• Declaration dates vs incident dates</li>
              <li>• Affected counties and areas</li>
              <li>• FIPS codes for precise locations</li>
              <li>• Disaster classification (Major/Emergency/Fire)</li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              What's Missing
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Named storm identifiers (Helene, Ian, etc.)</li>
              <li>• Storm intensity/category ratings</li>
              <li>• Wind speeds or precipitation data</li>
              <li>• Damage assessments or costs</li>
              <li>• Detailed event descriptions</li>
              <li>• Cross-references to weather services</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Recent Hurricane Examples Found</h4>
          <div className="text-sm text-green-700 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-semibold">October 2024 (Hurricane Milton?)</div>
                <div>FL Disaster #4834, #4844, Emergency #3622, #3623</div>
                <div className="text-xs">Incident: Oct 5, 2024 | Declared: Oct 7-11, 2024</div>
              </div>
              <div>
                <div className="font-semibold">August 2023 (Hurricane Idalia?)</div>
                <div>FL Major Disaster #4734</div>
                <div className="text-xs">Incident: Aug 27, 2023 | Declared: Aug 31, 2023</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Enhanced Data Sources Needed
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            For richer storm data with named hurricanes, we would need to integrate:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• National Hurricane Center (HURDAT2) database</li>
            <li>• NOAA Storm Events Database</li>
            <li>• IBTrACS (International Best Track Archive)</li>
            <li>• Weather.gov storm summaries</li>
          </ul>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            FEMA focuses on administrative disaster response rather than meteorological details
          </p>
        </div>
      </CardContent>
    </Card>
  );
}