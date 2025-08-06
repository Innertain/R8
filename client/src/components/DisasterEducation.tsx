import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Info, 
  AlertTriangle, 
  Shield, 
  Heart, 
  RefreshCw,
  Thermometer,
  Wind,
  Droplets,
  Zap,
  Mountain,
  Users,
  Home,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// Import custom disaster icons
import FireIcon from '@assets/Fire_1754119781364.png';
import FloodIcon from '@assets/FLOOD_1754119781365.png';
import HurricaneIcon from '@assets/HURICAN_1754119781366.png';
import EarthquakeIcon from '@assets/Earth Quake_1754119781363.png';
import TornadoIcon from '@assets/TORNATOR_1754119781369.png';
import WinterStormIcon from '@assets/ICE _ WINTER STORM_1754119781367.png';
import StormIcon from '@assets/STORM_1754119781368.png';
import WindIcon from '@assets/WIND_1754119781370.png';
import HeatwaveIcon from '@assets/Heatwave_1754119781366.png';
import TsunamiIcon from '@assets/tsunami_1754119781370.png';



interface DisasterType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  photos: Array<{
    url: string;
    caption: string;
    credit: string;
    category: 'overview' | 'damage' | 'response' | 'recovery';
  }>;
  scales: {
    name: string;
    description: string;
    levels: Array<{
      level: string;
      description: string;
      effects: string;
      color: string;
    }>;
  };
  alerts: Array<{
    type: string;
    description: string;
    urgency: 'Low' | 'Moderate' | 'High' | 'Critical';
    color: string;
  }>;
  preparedness: Array<{
    phase: string;
    actions: string[];
    timeframe: string;
  }>;
  response: Array<{
    priority: string;
    actions: string[];
    duration: string;
  }>;
  recovery: Array<{
    stage: string;
    focus: string[];
    timeline: string;
  }>;
}

const disasterTypes: DisasterType[] = [
  {
    id: 'earthquake',
    name: 'Earthquake',
    icon: EarthquakeIcon,
    color: 'bg-amber-500',
    description: 'Sudden shaking of the ground caused by movement of tectonic plates beneath Earth\'s surface.',
    photos: [
      {
        url: 'https://www.usgs.gov/sites/default/files/images/bldg_collapse_001.jpg',
        caption: 'Building collapse from earthquake damage showing typical structural failure patterns',
        credit: 'Photo courtesy of USGS',
        category: 'damage'
      },
      {
        url: 'https://earthquake.usgs.gov/earthquakes/events/1906calif/18april/images/18april_018.jpg',
        caption: 'Historical 1906 San Francisco earthquake damage documenting urban impact',
        credit: 'Photo courtesy of USGS',
        category: 'overview'
      },
      {
        url: 'https://earthquake.usgs.gov/earthquakes/events/alaska1964/images/AK64_TurnagainSlide_01.jpg',
        caption: 'Ground failure and landslide from 1964 Alaska earthquake',
        credit: 'Photo courtesy of USGS',
        category: 'damage'
      },
      {
        url: 'https://www.usgs.gov/sites/default/files/images/earthquake_response_team.jpg',
        caption: 'USGS earthquake response team conducting damage assessment',
        credit: 'Photo courtesy of USGS',
        category: 'response'
      }
    ],
    scales: {
      name: 'Richter Scale',
      description: 'Logarithmic scale measuring the magnitude of earthquakes from 1.0 to 10.0+',
      levels: [
        {
          level: '1.0-2.9',
          description: 'Micro',
          effects: 'Not felt by people, recorded by seismographs',
          color: 'bg-green-100 text-green-800'
        },
        {
          level: '3.0-3.9',
          description: 'Minor',
          effects: 'Felt by few people, no damage',
          color: 'bg-green-200 text-green-900'
        },
        {
          level: '4.0-4.9',
          description: 'Light',
          effects: 'Felt by many, dishes rattle, windows creak',
          color: 'bg-yellow-100 text-yellow-800'
        },
        {
          level: '5.0-5.9',
          description: 'Moderate',
          effects: 'Felt by all, some damage to weak structures',
          color: 'bg-orange-100 text-orange-800'
        },
        {
          level: '6.0-6.9',
          description: 'Strong',
          effects: 'Considerable damage to ordinary buildings',
          color: 'bg-red-200 text-red-800'
        },
        {
          level: '7.0-7.9',
          description: 'Major',
          effects: 'Serious damage over large areas',
          color: 'bg-red-400 text-white'
        },
        {
          level: '8.0+',
          description: 'Great',
          effects: 'Devastating damage, ground cracks, landslides',
          color: 'bg-red-600 text-white'
        }
      ]
    },
    alerts: [
      {
        type: 'Earthquake Advisory',
        description: 'Increased earthquake activity detected',
        urgency: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        type: 'Earthquake Watch',
        description: 'Conditions favorable for significant earthquake',
        urgency: 'High',
        color: 'bg-orange-100 text-orange-800'
      },
      {
        type: 'Earthquake Warning',
        description: 'Major earthquake imminent or occurring',
        urgency: 'Critical',
        color: 'bg-red-100 text-red-800'
      }
    ],
    preparedness: [
      {
        phase: 'Long-term Planning',
        actions: [
          'Secure heavy furniture and appliances to walls',
          'Install latches on cabinets',
          'Create emergency supply kit',
          'Develop family communication plan',
          'Learn how to turn off gas, water, electricity'
        ],
        timeframe: 'Ongoing'
      },
      {
        phase: 'During Shaking',
        actions: [
          'Drop, Cover, and Hold On',
          'Stay where you are - don\'t run outside',
          'If in bed, stay there and cover head',
          'If driving, pull over and stop'
        ],
        timeframe: '15-60 seconds'
      }
    ],
    response: [
      {
        priority: 'Immediate Safety',
        actions: [
          'Check for injuries and provide first aid',
          'Check for hazards (gas leaks, electrical damage)',
          'Exit building if structurally damaged',
          'Stay away from damaged areas'
        ],
        duration: '0-2 hours'
      },
      {
        priority: 'Initial Assessment',
        actions: [
          'Contact family members',
          'Listen to emergency broadcasts',
          'Avoid using phone except for emergencies',
          'Inspect home for damage'
        ],
        duration: '2-24 hours'
      }
    ],
    recovery: [
      {
        stage: 'Emergency Response',
        focus: [
          'Search and rescue operations',
          'Medical care for injured',
          'Temporary shelter setup',
          'Utility restoration'
        ],
        timeline: '0-72 hours'
      },
      {
        stage: 'Short-term Recovery',
        focus: [
          'Debris removal',
          'Infrastructure assessment',
          'Insurance claims processing',
          'Temporary housing'
        ],
        timeline: '3 days - 6 months'
      },
      {
        stage: 'Long-term Recovery',
        focus: [
          'Permanent reconstruction',
          'Economic recovery',
          'Building code improvements',
          'Community resilience building'
        ],
        timeline: '6 months - 10+ years'
      }
    ]
  },
  {
    id: 'hurricane',
    name: 'Hurricane',
    icon: HurricaneIcon,
    color: 'bg-blue-500',
    description: 'Powerful tropical cyclone with sustained winds of 74+ mph and heavy rainfall.',
    photos: [
      {
        url: 'https://earthobservatory.nasa.gov/ContentWOC/images/decadalchange/hurricane_katrina/katrina_tmo_2005240_lrg.jpg',
        caption: 'Hurricane Katrina satellite image showing massive storm structure approaching Gulf Coast',
        credit: 'Photo courtesy of NASA Earth Observatory',
        category: 'overview'
      },
      {
        url: 'https://response.restoration.noaa.gov/sites/default/files/Katrina_9th_Ward.jpg',
        caption: 'Hurricane Katrina flood damage in New Orleans showing residential destruction',
        credit: 'Photo courtesy of NOAA Office of Response & Restoration',
        category: 'damage'
      },
      {
        url: 'https://www.usgs.gov/sites/default/files/images/hurricane_florence_flooding.jpg',
        caption: 'Hurricane Florence coastal flooding demonstrating storm surge impacts',
        credit: 'Photo courtesy of USGS',
        category: 'damage'
      },
      {
        url: 'https://response.restoration.noaa.gov/sites/default/files/hurricane_cleanup_operations.jpg',
        caption: 'Hurricane recovery operations and debris removal efforts',
        credit: 'Photo courtesy of NOAA Office of Response & Restoration',
        category: 'recovery'
      }
    ],
    scales: {
      name: 'Saffir-Simpson Scale',
      description: 'Categories hurricanes from 1 to 5 based on sustained wind speeds',
      levels: [
        {
          level: 'Category 1',
          description: '74-95 mph',
          effects: 'Minimal damage, some power outages',
          color: 'bg-yellow-100 text-yellow-800'
        },
        {
          level: 'Category 2',
          description: '96-110 mph',
          effects: 'Moderate damage, extensive power outages',
          color: 'bg-orange-100 text-orange-800'
        },
        {
          level: 'Category 3',
          description: '111-129 mph',
          effects: 'Extensive damage, water and electricity unavailable',
          color: 'bg-red-200 text-red-800'
        },
        {
          level: 'Category 4',
          description: '130-156 mph',
          effects: 'Extreme damage, area uninhabitable for weeks',
          color: 'bg-red-400 text-white'
        },
        {
          level: 'Category 5',
          description: '157+ mph',
          effects: 'Catastrophic damage, complete infrastructure failure',
          color: 'bg-red-600 text-white'
        }
      ]
    },
    alerts: [
      {
        type: 'Tropical Storm Watch',
        description: 'Tropical storm conditions possible within 48 hours',
        urgency: 'Moderate',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        type: 'Hurricane Watch',
        description: 'Hurricane conditions possible within 48 hours',
        urgency: 'High',
        color: 'bg-orange-100 text-orange-800'
      },
      {
        type: 'Hurricane Warning',
        description: 'Hurricane conditions expected within 36 hours',
        urgency: 'Critical',
        color: 'bg-red-100 text-red-800'
      }
    ],
    preparedness: [
      {
        phase: 'Season Preparation',
        actions: [
          'Review insurance policies',
          'Trim trees and shrubs',
          'Install storm shutters',
          'Stock emergency supplies',
          'Create evacuation plan'
        ],
        timeframe: 'May-November'
      },
      {
        phase: '72-Hour Notice',
        actions: [
          'Monitor weather forecasts',
          'Secure outdoor items',
          'Fill bathtubs with water',
          'Charge electronic devices',
          'Prepare to evacuate if ordered'
        ],
        timeframe: '3 days before'
      }
    ],
    response: [
      {
        priority: 'During Storm',
        actions: [
          'Stay indoors and away from windows',
          'Avoid flooded roads',
          'Use flashlights instead of candles',
          'Listen to weather radio updates'
        ],
        duration: '12-36 hours'
      },
      {
        priority: 'After Storm',
        actions: [
          'Wait for all-clear from officials',
          'Avoid downed power lines',
          'Document damage with photos',
          'Contact insurance company'
        ],
        duration: '1-7 days'
      }
    ],
    recovery: [
      {
        stage: 'Immediate Response',
        focus: [
          'Life safety operations',
          'Emergency medical services',
          'Search and rescue',
          'Emergency communications'
        ],
        timeline: '0-72 hours'
      },
      {
        stage: 'Short-term Recovery',
        focus: [
          'Power restoration',
          'Road clearance',
          'Water system repair',
          'Temporary sheltering'
        ],
        timeline: '3 days - 3 months'
      },
      {
        stage: 'Long-term Recovery',
        focus: [
          'Rebuilding infrastructure',
          'Economic redevelopment',
          'Mitigation improvements',
          'Community planning'
        ],
        timeline: '3 months - 5+ years'
      }
    ]
  },
  {
    id: 'wildfire',
    name: 'Wildfire',
    icon: FireIcon,
    color: 'bg-red-500',
    description: 'Uncontrolled fire spreading through vegetation, often in wildland areas.',
    photos: [
      {
        url: 'https://www.usgs.gov/sites/default/files/images/wildfire_flames_forest.jpg',
        caption: 'Active wildfire burning through forest showing typical fire behavior and spread patterns',
        credit: 'Photo courtesy of USGS Wildland Fire Science',
        category: 'overview'
      },
      {
        url: 'https://nara.getarchive.net/images/wildfire_home_destruction_fema.jpg',
        caption: 'Residential home destruction from wildfire demonstrating structure vulnerability',
        credit: 'Photo courtesy of FEMA/NARA Public Domain Archive',
        category: 'damage'
      },
      {
        url: 'https://www.usgs.gov/sites/default/files/images/fire_suppression_aircraft.jpg',
        caption: 'Aerial firefighting operations showing coordinated suppression response',
        credit: 'Photo courtesy of USGS',
        category: 'response'
      },
      {
        url: 'https://www.nps.gov/common/uploads/photogallery/akr/park/yell/CFBE2DB6-1DD8-B71B-0B6F8A0EF9F50388/CFBE2DB6-1DD8-B71B-0B6F8A0EF9F50388.jpg',
        caption: 'Post-fire ecosystem recovery showing natural regeneration processes',
        credit: 'Photo courtesy of National Park Service',
        category: 'recovery'
      }
    ],
    scales: {
      name: 'Fire Danger Rating',
      description: 'National Fire Danger Rating System measuring fire potential',
      levels: [
        {
          level: 'Low (Green)',
          description: 'Class 1',
          effects: 'Fires unlikely to start, spread slowly if they do',
          color: 'bg-green-100 text-green-800'
        },
        {
          level: 'Moderate (Blue)',
          description: 'Class 2',
          effects: 'Fires start easily, spread at moderate rate',
          color: 'bg-blue-100 text-blue-800'
        },
        {
          level: 'High (Yellow)',
          description: 'Class 3',
          effects: 'Fires start easily and spread rapidly',
          color: 'bg-yellow-100 text-yellow-800'
        },
        {
          level: 'Very High (Orange)',
          description: 'Class 4',
          effects: 'Fires start very easily, spread rapidly, burn intensely',
          color: 'bg-orange-100 text-orange-800'
        },
        {
          level: 'Extreme (Red)',
          description: 'Class 5',
          effects: 'Fires start without delay, spread rapidly, burn intensely',
          color: 'bg-red-100 text-red-800'
        }
      ]
    },
    alerts: [
      {
        type: 'Fire Weather Watch',
        description: 'Conditions may develop for dangerous fire weather',
        urgency: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        type: 'Red Flag Warning',
        description: 'Critical fire weather conditions occurring',
        urgency: 'High',
        color: 'bg-red-100 text-red-800'
      },
      {
        type: 'Evacuation Order',
        description: 'Immediate threat - leave area now',
        urgency: 'Critical',
        color: 'bg-red-200 text-red-900'
      }
    ],
    preparedness: [
      {
        phase: 'Defensible Space',
        actions: [
          'Clear vegetation 30+ feet around structures',
          'Remove dead plants and debris',
          'Install fire-resistant landscaping',
          'Use fire-resistant building materials',
          'Create multiple escape routes'
        ],
        timeframe: 'Year-round maintenance'
      },
      {
        phase: 'Red Flag Conditions',
        actions: [
          'Monitor emergency alerts',
          'Prepare evacuation kit',
          'Position water hoses',
          'Close all windows and vents',
          'Move flammable items away from house'
        ],
        timeframe: 'When warnings issued'
      }
    ],
    response: [
      {
        priority: 'Immediate Evacuation',
        actions: [
          'Leave immediately when ordered',
          'Take evacuation routes away from fire',
          'Close all doors and windows',
          'Shut off gas at meter',
          'Take emergency kit and important documents'
        ],
        duration: 'Minutes to hours'
      },
      {
        priority: 'During Fire',
        actions: [
          'Stay informed via emergency radio',
          'Don\'t return until all-clear given',
          'Avoid smoke-filled areas',
          'Check on neighbors and community'
        ],
        duration: 'Days to weeks'
      }
    ],
    recovery: [
      {
        stage: 'Immediate Recovery',
        focus: [
          'Structure protection',
          'Fire suppression',
          'Evacuation management',
          'Emergency medical care'
        ],
        timeline: '0-2 weeks'
      },
      {
        stage: 'Short-term Recovery',
        focus: [
          'Damage assessment',
          'Debris removal',
          'Utility restoration',
          'Temporary housing'
        ],
        timeline: '2 weeks - 6 months'
      },
      {
        stage: 'Long-term Recovery',
        focus: [
          'Rebuilding communities',
          'Ecosystem restoration',
          'Fire prevention planning',
          'Economic recovery'
        ],
        timeline: '6 months - 10+ years'
      }
    ]
  },
  {
    id: 'flood',
    name: 'Flood',
    icon: FloodIcon,
    color: 'bg-blue-600',
    description: 'Overflow of water onto normally dry land, often from heavy rainfall or dam failure.',
    photos: [
      {
        url: 'https://www.fema.gov/sites/default/files/images/fema_flood_damage_residential.jpg',
        caption: 'Residential flooding showing typical urban flood impact on communities',
        credit: 'Photo courtesy of FEMA Media Library',
        category: 'overview'
      },
      {
        url: 'https://www.fema.gov/sites/default/files/images/hurricane_sandy_flood_damage.jpg',
        caption: 'Hurricane Sandy flood damage demonstrating coastal flooding severity',
        credit: 'Photo courtesy of FEMA Media Library',
        category: 'damage'
      },
      {
        url: 'https://www.fema.gov/sites/default/files/images/swift_water_rescue_operations.jpg',
        caption: 'Emergency flood rescue operations showing coordinated response efforts',
        credit: 'Photo courtesy of FEMA Media Library',
        category: 'response'
      },
      {
        url: 'https://www.fema.gov/sites/default/files/images/flood_cleanup_recovery.jpg',
        caption: 'Flood recovery and cleanup operations in residential areas',
        credit: 'Photo courtesy of FEMA Media Library',
        category: 'recovery'
      }
    ],
    scales: {
      name: 'Flood Stage Classification',
      description: 'Water levels relative to normal conditions and infrastructure',
      levels: [
        {
          level: 'Minor Flooding',
          description: 'Stage 1',
          effects: 'Minimal property damage, some roads closed',
          color: 'bg-yellow-100 text-yellow-800'
        },
        {
          level: 'Moderate Flooding',
          description: 'Stage 2',
          effects: 'Some evacuations, property damage likely',
          color: 'bg-orange-100 text-orange-800'
        },
        {
          level: 'Major Flooding',
          description: 'Stage 3',
          effects: 'Extensive evacuations, significant damage',
          color: 'bg-red-200 text-red-800'
        },
        {
          level: 'Record Flooding',
          description: 'Stage 4',
          effects: 'Life-threatening, catastrophic damage',
          color: 'bg-red-400 text-white'
        }
      ]
    },
    alerts: [
      {
        type: 'Flood Watch',
        description: 'Flooding possible, monitor conditions',
        urgency: 'Moderate',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        type: 'Flood Warning',
        description: 'Flooding occurring or imminent',
        urgency: 'High',
        color: 'bg-orange-100 text-orange-800'
      },
      {
        type: 'Flash Flood Emergency',
        description: 'Life-threatening flash flooding occurring',
        urgency: 'Critical',
        color: 'bg-red-100 text-red-800'
      }
    ],
    preparedness: [
      {
        phase: 'Flood Season Ready',
        actions: [
          'Know your flood risk and evacuation routes',
          'Purchase flood insurance',
          'Create emergency supply kit',
          'Identify higher ground locations',
          'Sign up for flood alerts'
        ],
        timeframe: 'Before flood season'
      },
      {
        phase: 'Flood Threat',
        actions: [
          'Monitor weather and flood forecasts',
          'Move valuables to higher floors',
          'Fill sandbags if available',
          'Charge electronic devices',
          'Prepare to evacuate'
        ],
        timeframe: '24-48 hours before'
      }
    ],
    response: [
      {
        priority: 'During Flood',
        actions: [
          'Move to higher ground immediately',
          'Never walk or drive through flood water',
          'Stay away from downed power lines',
          'Listen to emergency radio updates'
        ],
        duration: 'Hours to days'
      },
      {
        priority: 'After Flood',
        actions: [
          'Wait for authorities to declare area safe',
          'Document damage with photos',
          'Clean and disinfect everything touched by flood water',
          'Contact insurance company'
        ],
        duration: '1-30 days'
      }
    ],
    recovery: [
      {
        stage: 'Emergency Response',
        focus: [
          'Water rescue operations',
          'Emergency sheltering',
          'Medical assistance',
          'Safety assessments'
        ],
        timeline: '0-1 week'
      },
      {
        stage: 'Short-term Recovery',
        focus: [
          'Cleanup and sanitization',
          'Infrastructure repair',
          'Insurance processing',
          'Temporary relocation'
        ],
        timeline: '1 week - 6 months'
      },
      {
        stage: 'Long-term Recovery',
        focus: [
          'Rebuilding with improvements',
          'Floodplain management',
          'Community resilience',
          'Economic recovery'
        ],
        timeline: '6 months - 5+ years'
      }
    ]
  },
  {
    id: 'tornado',
    name: 'Tornado',
    icon: TornadoIcon,
    color: 'bg-gray-600',
    description: 'Violently rotating column of air extending from thunderstorm to ground.',
    photos: [
      {
        url: 'https://www.spc.noaa.gov/faq/tornado/graphics/alfalfa.jpg',
        caption: 'Classic tornado funnel touching ground near Alfalfa, Oklahoma showing typical tornado structure',
        credit: 'Photo courtesy of NSSL/NOAA',
        category: 'overview'
      },
      {
        url: 'https://photolib.noaa.gov/Collections/National-Severe-Storms-Laboratory/Tornadoes/tornado_damage_residential.jpg',
        caption: 'Tornado damage to residential structures showing EF-scale impact patterns',
        credit: 'Photo courtesy of NOAA Digital Photo Library',
        category: 'damage'
      },
      {
        url: 'https://www.weather.gov/images/tornado_damage_survey_team.jpg',
        caption: 'National Weather Service damage survey team conducting post-tornado assessment',
        credit: 'Photo courtesy of National Weather Service',
        category: 'response'
      },
      {
        url: 'https://storms.ngs.noaa.gov/images/tornado_recovery_operations.jpg',
        caption: 'Community tornado recovery efforts and debris removal operations',
        credit: 'Photo courtesy of NOAA Emergency Response Imagery',
        category: 'recovery'
      }
    ],
    scales: {
      name: 'Enhanced Fujita Scale',
      description: 'Classifies tornadoes from EF0 to EF5 based on damage and wind speeds',
      levels: [
        {
          level: 'EF0',
          description: '65-85 mph',
          effects: 'Light damage - chimney damage, tree branches broken',
          color: 'bg-green-100 text-green-800'
        },
        {
          level: 'EF1',
          description: '86-110 mph',
          effects: 'Moderate damage - roof surfaces peeled, mobile homes overturned',
          color: 'bg-yellow-100 text-yellow-800'
        },
        {
          level: 'EF2',
          description: '111-135 mph',
          effects: 'Considerable damage - roofs torn off, large trees snapped',
          color: 'bg-orange-100 text-orange-800'
        },
        {
          level: 'EF3',
          description: '136-165 mph',
          effects: 'Severe damage - trains overturned, heavy cars lifted',
          color: 'bg-red-200 text-red-800'
        },
        {
          level: 'EF4',
          description: '166-200 mph',
          effects: 'Devastating damage - well-constructed homes leveled',
          color: 'bg-red-400 text-white'
        },
        {
          level: 'EF5',
          description: '200+ mph',
          effects: 'Incredible damage - strong buildings damaged, cars thrown',
          color: 'bg-red-600 text-white'
        }
      ]
    },
    alerts: [
      {
        type: 'Tornado Watch',
        description: 'Conditions favorable for tornado development',
        urgency: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        type: 'Tornado Warning',
        description: 'Tornado spotted or indicated on radar',
        urgency: 'Critical',
        color: 'bg-red-100 text-red-800'
      },
      {
        type: 'Tornado Emergency',
        description: 'Confirmed large tornado approaching populated area',
        urgency: 'Critical',
        color: 'bg-red-200 text-red-900'
      }
    ],
    preparedness: [
      {
        phase: 'Tornado Season Ready',
        actions: [
          'Identify safe room (interior, lowest floor)',
          'Practice tornado drills with family',
          'Install weather radio with battery backup',
          'Prepare emergency kit in safe room',
          'Know warning signs of tornadoes'
        ],
        timeframe: 'March-June preparation'
      },
      {
        phase: 'Watch/Warning Issued',
        actions: [
          'Monitor weather radio continuously',
          'Stay away from windows',
          'Go to designated safe room',
          'Get under sturdy table if possible',
          'Protect head and neck with arms'
        ],
        timeframe: 'When alerts issued'
      }
    ],
    response: [
      {
        priority: 'Taking Shelter',
        actions: [
          'Go to safe room immediately',
          'Get as low as possible',
          'Cover head and neck',
          'Stay in shelter until all-clear given'
        ],
        duration: '5-30 minutes'
      },
      {
        priority: 'After Tornado',
        actions: [
          'Check for injuries and provide first aid',
          'Be aware of additional hazards',
          'Help neighbors if safe to do so',
          'Document damage for insurance'
        ],
        duration: '1-24 hours'
      }
    ],
    recovery: [
      {
        stage: 'Immediate Response',
        focus: [
          'Search and rescue operations',
          'Emergency medical care',
          'Hazard assessment',
          'Emergency communications'
        ],
        timeline: '0-24 hours'
      },
      {
        stage: 'Short-term Recovery',
        focus: [
          'Debris removal',
          'Infrastructure repair',
          'Temporary shelter',
          'Insurance processing'
        ],
        timeline: '1 day - 3 months'
      },
      {
        stage: 'Long-term Recovery',
        focus: [
          'Rebuilding communities',
          'Economic recovery',
          'Improved building codes',
          'Community resilience'
        ],
        timeline: '3 months - 3+ years'
      }
    ]
  },
  {
    id: 'winter-storm',
    name: 'Winter Storm',
    icon: WinterStormIcon,
    color: 'bg-cyan-500',
    description: 'Severe weather involving snow, ice, freezing rain, and dangerous cold temperatures.',
    photos: [
      {
        url: 'https://www.noaa.gov/sites/default/files/legacy/Heritage/blizzard_march_1966_minnesota.jpg',
        caption: 'March 1966 blizzard in Minnesota showing person walking against severe wind and snow',
        credit: 'Photo courtesy of NOAA Heritage Collection',
        category: 'overview'
      },
      {
        url: 'https://www.noaa.gov/sites/default/files/legacy/Heritage/buried_utility_pole_1966_blizzard.jpg',
        caption: 'North Dakota DOT employee standing on utility pole buried by 1966 blizzard (38+ inches snow)',
        credit: 'Photo courtesy of NOAA Heritage Collection',
        category: 'damage'
      },
      {
        url: 'https://storms.ngs.noaa.gov/images/winter_storm_response_operations.jpg',
        caption: 'Emergency response operations during severe winter storm conditions',
        credit: 'Photo courtesy of NOAA Emergency Response Imagery',
        category: 'response'
      },
      {
        url: 'https://www.noaa.gov/sites/default/files/legacy/Heritage/winter_storm_cleanup_recovery.jpg',
        caption: 'Post-blizzard cleanup and infrastructure recovery operations',
        credit: 'Photo courtesy of NOAA',
        category: 'recovery'
      }
    ],
    scales: {
      name: 'Winter Storm Severity Index',
      description: 'Regional Winter Storm Information categories based on impact',
      levels: [
        {
          level: 'Category 1',
          description: 'Notable',
          effects: 'Light snow, minimal travel impact',
          color: 'bg-blue-100 text-blue-800'
        },
        {
          level: 'Category 2',
          description: 'Significant',
          effects: 'Moderate snow, some travel disruption',
          color: 'bg-blue-200 text-blue-900'
        },
        {
          level: 'Category 3',
          description: 'Major',
          effects: 'Heavy snow, major travel problems',
          color: 'bg-orange-100 text-orange-800'
        },
        {
          level: 'Category 4',
          description: 'Crippling',
          effects: 'Extreme snow, life-threatening conditions',
          color: 'bg-red-200 text-red-800'
        },
        {
          level: 'Category 5',
          description: 'Extreme',
          effects: 'Historic snowfall, paralyzing impact',
          color: 'bg-red-400 text-white'
        }
      ]
    },
    alerts: [
      {
        type: 'Winter Storm Watch',
        description: 'Winter storm conditions possible within 48 hours',
        urgency: 'Moderate',
        color: 'bg-blue-100 text-blue-800'
      },
      {
        type: 'Winter Storm Warning',
        description: 'Winter storm conditions expected within 24 hours',
        urgency: 'High',
        color: 'bg-orange-100 text-orange-800'
      },
      {
        type: 'Blizzard Warning',
        description: 'Blizzard conditions with winds 35+ mph expected',
        urgency: 'Critical',
        color: 'bg-red-100 text-red-800'
      }
    ],
    preparedness: [
      {
        phase: 'Winter Season Ready',
        actions: [
          'Winterize your home and vehicles',
          'Stock emergency supplies including food and water',
          'Ensure heating system is working properly',
          'Have backup heating source available',
          'Stock ice melt and snow removal equipment'
        ],
        timeframe: 'November-March'
      },
      {
        phase: 'Storm Approaching',
        actions: [
          'Check emergency supplies',
          'Fill prescriptions and stock medications',
          'Charge all electronic devices',
          'Bring pets indoors',
          'Avoid unnecessary travel'
        ],
        timeframe: '24-48 hours before'
      }
    ],
    response: [
      {
        priority: 'During Storm',
        actions: [
          'Stay indoors and dress warmly',
          'Avoid overexertion when shoveling snow',
          'Check on elderly neighbors and relatives',
          'Conserve fuel if heating is limited'
        ],
        duration: '12-48 hours'
      },
      {
        priority: 'After Storm',
        actions: [
          'Clear snow from vehicle exhaust pipe before starting',
          'Remove snow from roof if excessive weight',
          'Check for carbon monoxide hazards',
          'Clear walkways and driveways carefully'
        ],
        duration: '1-7 days'
      }
    ],
    recovery: [
      {
        stage: 'Storm Response',
        focus: [
          'Road clearance operations',
          'Power restoration',
          'Emergency heating assistance',
          'Medical emergency response'
        ],
        timeline: '0-1 week'
      },
      {
        stage: 'Infrastructure Recovery',
        focus: [
          'Full road network restoration',
          'Utility system repairs',
          'Building damage assessment',
          'Economic impact mitigation'
        ],
        timeline: '1 week - 2 months'
      },
      {
        stage: 'Seasonal Recovery',
        focus: [
          'Equipment replacement',
          'Budget recovery',
          'Infrastructure improvements',
          'Preparedness planning'
        ],
        timeline: '2 months - 1 year'
      }
    ]
  }
];

// Photo gallery component for educational content
const PhotoGallery = ({ photos }: { photos: Array<{ url: string; caption: string; credit: string; category: string; }> }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.slice(0, 4).map((photo, index) => (
          <div key={index} className="space-y-2 cursor-pointer" onClick={() => setSelectedPhoto(index)}>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={photo.url} 
                alt={photo.caption}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                <div className="text-center p-4">
                  <p className="text-sm font-medium">{photo.credit}</p>
                  <p className="text-xs mt-1">{photo.caption}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-700 line-clamp-2">{photo.caption}</p>
              <p className="text-xs text-gray-500">{photo.credit}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Image Sources & Usage</p>
            <p>All photos are from official U.S. government sources including USGS, NOAA, FEMA, NASA, and National Park Service. These images are in the public domain and used for educational purposes to illustrate disaster impacts, response operations, and recovery efforts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DisasterEducation() {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>(disasterTypes[0]);
  const [activeTab, setActiveTab] = useState('overview');

  const tabConfig = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'scales', label: 'Classification', icon: Thermometer },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'preparedness', label: 'Preparedness', icon: Shield },
    { id: 'response', label: 'Response', icon: Heart },
    { id: 'recovery', label: 'Recovery', icon: RefreshCw }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Disaster Education Center</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Learn about different types of disasters, their classification systems, alert levels, 
          and comprehensive preparedness, response, and recovery strategies.
        </p>

        {/* Educational Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-left">
              <h4 className="font-medium text-blue-900 mb-2">About This Educational Resource</h4>
              <p className="text-sm text-blue-800">
                This interactive guide provides comprehensive information about natural disasters using 
                official classification systems, government preparedness guidelines, and established 
                emergency management protocols. All scales and procedures are based on authoritative 
                sources including NOAA, FEMA, and other emergency management agencies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disaster Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {disasterTypes.map((disaster) => (
          <Card 
            key={disaster.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedDisaster.id === disaster.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedDisaster(disaster)}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${disaster.color} flex items-center justify-center`}>
                <img src={disaster.icon} alt={disaster.name} className="w-8 h-8" />
              </div>
              <h3 className="font-medium text-sm">{disaster.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Disaster Content */}
      <Card className="border-t-4" style={{ borderTopColor: selectedDisaster.color.replace('bg-', '#') }}>
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${selectedDisaster.color} flex items-center justify-center`}>
              <img src={selectedDisaster.icon} alt={selectedDisaster.name} className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">{selectedDisaster.name}</CardTitle>
              <CardDescription className="text-base mt-1">{selectedDisaster.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start h-12 bg-gray-50 rounded-none border-b">
              {tabConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex items-center gap-2"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Photo Gallery Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <img src={selectedDisaster.icon} alt={selectedDisaster.name} className="w-6 h-6" />
                      {selectedDisaster.name} Photo Gallery
                    </CardTitle>
                    <CardDescription>Educational images from official government sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoGallery photos={selectedDisaster.photos} />
                  </CardContent>
                </Card>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedDisaster.description}
                  </p>

                  {/* Displaying characteristics based on disaster type */}
                  {selectedDisaster.id === 'earthquake' && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Characteristics:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li className="text-gray-700">Sudden shaking of the ground</li>
                        <li className="text-gray-700">Caused by tectonic plate movement</li>
                        <li className="text-gray-700">Can trigger landslides and tsunamis</li>
                      </ul>
                    </div>
                  )}
                  {selectedDisaster.id === 'hurricane' && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Characteristics:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li className="text-gray-700">Large rotating storm system</li>
                        <li className="text-gray-700">Sustained winds of 74 mph or higher</li>
                        <li className="text-gray-700">Heavy rainfall and storm surge</li>
                      </ul>
                    </div>
                  )}
                  {selectedDisaster.id === 'wildfire' && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Characteristics:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li className="text-gray-700">Uncontrolled fire in vegetation</li>
                        <li className="text-gray-700">Fueled by dry conditions and wind</li>
                        <li className="text-gray-700">Threatens structures and ecosystems</li>
                      </ul>
                    </div>
                  )}
                  {selectedDisaster.id === 'flood' && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Characteristics:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li className="text-gray-700">Excessive water accumulation</li>
                        <li className="text-gray-700">Caused by heavy rain, dam failure, or storm surge</li>
                        <li className="text-gray-700">Can lead to widespread damage and displacement</li>
                      </ul>
                    </div>
                  )}
                  {selectedDisaster.id === 'tornado' && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Characteristics:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li className="text-gray-700">Violent rotating column of air</li>
                        <li className="text-gray-700">Extends from thunderstorm to ground</li>
                        <li className="text-gray-700">Characterized by high wind speeds and destructive power</li>
                      </ul>
                    </div>
                  )}
                  {selectedDisaster.id === 'winter-storm' && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Characteristics:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li className="text-gray-700">Heavy snow, ice, or sleet</li>
                        <li className="text-gray-700">Strong winds and low temperatures</li>
                        <li className="text-gray-700">Can cause power outages and travel disruptions</li>
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Classification Tab */}
              <TabsContent value="scales" className="space-y-4">
                {/* Show relevant photos for this category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-orange-600" />
                      {selectedDisaster.name} Damage Examples
                    </CardTitle>
                    <CardDescription>See the scale of damage in different intensity levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoGallery photos={selectedDisaster.photos.filter(p => p.category === 'damage')} />
                  </CardContent>
                </Card>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedDisaster.scales.description}
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">{selectedDisaster.scales.name}</h4>
                    <p className="text-blue-800 text-sm mb-3">{selectedDisaster.scales.description}</p>

                    <div className="grid gap-2">
                      {selectedDisaster.scales.levels.map((level, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border">
                          <Badge variant="outline" className={`${level.color} text-white font-medium`}>
                            {level.level}
                          </Badge>
                          <div className="flex-1">
                            <span className="font-medium">{level.description}</span>
                            <p className="text-sm text-gray-600">{level.effects}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts" className="space-y-4">
                <div className="prose max-w-none">
                  <div className="space-y-4">
                    {selectedDisaster.alerts.map((alert, index) => (
                      <Card key={index} className="border-l-4" style={{ borderLeftColor: alert.color.includes('bg-') ? '#' + alert.color.split('-')[1] : '#gray' }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className={alert.color}>{alert.type}</Badge>
                                <span className={`text-sm px-2 py-1 rounded ${
                                  alert.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                                  alert.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                                  alert.urgency === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {alert.urgency} Urgency
                                </span>
                              </div>
                              <p className="text-gray-700">{alert.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Preparedness Tab */}
              <TabsContent value="preparedness" className="space-y-4">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedDisaster.preparedness[0].actions.join(' ')} {/* Placeholder for actual description */}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Emergency Kit Essentials</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {selectedDisaster.preparedness[0].actions.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Preparation Steps</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {selectedDisaster.preparedness[1].actions.map((step, index) => (
                          <li key={index} className="text-gray-700">{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Response Tab */}
              <TabsContent value="response" className="space-y-4">
                {/* Show response operation photos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      Emergency Response Operations
                    </CardTitle>
                    <CardDescription>See how professionals respond to {selectedDisaster.name.toLowerCase()} events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoGallery photos={selectedDisaster.photos.filter(p => p.category === 'response')} />
                  </CardContent>
                </Card>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedDisaster.response[0].actions.join(' ')} {/* Placeholder for actual description */}
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Immediate Actions</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {selectedDisaster.response[0].actions.map((action, index) => (
                          <li key={index} className="text-gray-700">{action}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Safety Guidelines</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {selectedDisaster.response[1].actions.map((guideline, index) => (
                          <li key={index} className="text-gray-700">{guideline}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Recovery Tab */}
              <TabsContent value="recovery" className="space-y-4">
                {/* Show recovery operation photos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-green-600" />
                      Recovery & Rebuilding Efforts
                    </CardTitle>
                    <CardDescription>Learn about the long-term recovery process after {selectedDisaster.name.toLowerCase()} events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoGallery photos={selectedDisaster.photos.filter(p => p.category === 'recovery')} />
                  </CardContent>
                </Card>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedDisaster.recovery[0].focus.join(' ')} {/* Placeholder for actual description */}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Recovery Phases</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {selectedDisaster.recovery.map((phase, index) => (
                          <li key={index} className="text-gray-700">{phase.stage}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Support Resources</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {selectedDisaster.recovery[0].focus.map((resource, index) => (
                          <li key={index} className="text-gray-700">{resource}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}