import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import WildlifeActivityFeed from './WildlifeActivityFeed';

interface WildlifeFeedDemoProps {
  bioregionName?: string;
  bioregionId?: string;
  regionTitle?: string;
}

export default function WildlifeFeedDemo({
  bioregionName = "Hawaiian Tropical Dry Forests",
  bioregionId = "hawaiian_tropical_dry_forests",
  regionTitle = "Hawaii"
}: WildlifeFeedDemoProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">🆕 Live Wildlife Activity Feed</h3>
          </div>
          <Link href="/bioregions">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <MapPin className="w-4 h-4 mr-2" />
              Explore Full Map
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-600">
          Real wildlife photos and observations from iNaturalist. Click "Explore Full Map" to see the interactive bioregion explorer!
        </p>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>🎯 How to see wildlife photos:</strong> Click "Explore Full Map" above, then click on <strong>Hawaii</strong> (islands in Pacific) or <strong>Southeastern US</strong> regions on the interactive map to see live wildlife activity with real photos!
          </p>
        </div>
        
        {/* Demo with region-specific data */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">Preview: {regionTitle} Wildlife Activity</h4>
          <WildlifeActivityFeed 
            bioregionName={bioregionName} 
            bioregionId={bioregionId} 
          />
        </div>
      </CardContent>
    </Card>
  );
}