import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Eye,
  Binoculars,
  Zap,
  TrendingUp,
  Users
} from 'lucide-react';

interface WildlifeActivityProps {
  bioregionName: string;
}

export default function WildlifeActivityFeed({ bioregionName }: WildlifeActivityProps) {
  // This would be real data from GBIF, iNaturalist, eBird APIs
  const recentActivity = [
    {
      type: 'sighting',
      species: 'California Scrub-Jay',
      location: 'Griffith Park, Los Angeles',
      time: '2 hours ago',
      observer: 'NatureLover23',
      photo: '/api/placeholder/wildlife-jay.jpg',
      rarity: 'common',
      action: 'View observation'
    },
    {
      type: 'migration',
      species: 'Anna\'s Hummingbird',
      location: 'Santa Monica Mountains',
      time: '5 hours ago',
      observer: 'eBird Network',
      trend: 'Peak migration - 347% above normal',
      rarity: 'seasonal',
      action: 'Track migration'
    },
    {
      type: 'rare',
      species: 'California Condor',
      location: 'Los Padres National Forest',
      time: '1 day ago',
      observer: 'ConservationTeam',
      photo: '/api/placeholder/wildlife-condor.jpg',
      rarity: 'critically_endangered',
      action: 'Report sighting'
    },
    {
      type: 'bloom',
      species: 'California Poppies',
      location: 'Antelope Valley',
      time: '3 days ago',
      observer: 'iNaturalist Community',
      trend: 'Super bloom in progress',
      rarity: 'seasonal',
      action: 'Visit location'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'critically_endangered': return 'bg-red-100 text-red-800 border-red-200';
      case 'rare': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'seasonal': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'sighting': return <Camera className="w-5 h-5 text-green-600" />;
      case 'migration': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'rare': return <Zap className="w-5 h-5 text-red-600" />;
      case 'bloom': return <Eye className="w-5 h-5 text-purple-600" />;
      default: return <MapPin className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binoculars className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Live Wildlife Activity</h3>
          </div>
          <Badge variant="outline" className="text-green-600">
            {bioregionName}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          Real-time wildlife observations, migrations, and rare sightings in your area
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{activity.species}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRarityColor(activity.rarity)}>
                          {activity.rarity.replace('_', ' ')}
                        </Badge>
                        {activity.trend && (
                          <span className="text-sm font-medium text-blue-600">
                            {activity.trend}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {activity.action}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>by {activity.observer}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">23</div>
            <div className="text-sm text-green-700">New sightings today</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-sm text-blue-700">Species migrating now</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">2</div>
            <div className="text-sm text-purple-700">Rare alerts this week</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>🎯 What you can do:</strong> Click actions to view detailed observations, track migrations in real-time, 
            report your own sightings, or visit peak activity locations. Data from GBIF, iNaturalist, and eBird.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}