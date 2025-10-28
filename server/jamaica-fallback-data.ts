// Fallback infrastructure data for Jamaica
// Used when Overpass API is unavailable or timing out
// This data represents a subset of critical infrastructure from OpenStreetMap

export const fallbackHospitals = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.7936, 18.0179] },
      properties: { id: 1, type: 'hospital', name: 'Kingston Public Hospital', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.7820, 18.0035] },
      properties: { id: 2, type: 'hospital', name: 'University Hospital of the West Indies', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.9191, 18.4687] },
      properties: { id: 3, type: 'hospital', name: 'Cornwall Regional Hospital', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.2750, 18.4693] },
      properties: { id: 4, type: 'hospital', name: 'St. Ann\'s Bay Hospital', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.9411, 17.9688] },
      properties: { id: 5, type: 'hospital', name: 'Spanish Town Hospital', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.5920, 18.3902] },
      properties: { id: 6, type: 'hospital', name: 'Falmouth Hospital', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.1145, 18.2367] },
      properties: { id: 7, type: 'hospital', name: 'Mandeville Regional Hospital', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.7384, 18.1334] },
      properties: { id: 8, type: 'hospital', name: 'Port Antonio Hospital', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.3651, 18.0478] },
      properties: { id: 9, type: 'hospital', name: 'Morant Bay Hospital', amenity: 'hospital' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.7521, 18.1847] },
      properties: { id: 10, type: 'hospital', name: 'May Pen Hospital', amenity: 'hospital' }
    }
  ]
};

export const fallbackShelters = {
  type: 'FeatureCollection',
  features: [
    // Generate representative shelters across Jamaica (schools, churches, community centers)
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-76.7900, 18.0100] }, properties: { name: 'Kingston High School', amenity: 'school', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-76.8100, 18.0200] }, properties: { name: 'St. Andrew Community Centre', amenity: 'community_centre', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-77.9000, 18.4700] }, properties: { name: 'Montego Bay Church', building: 'church', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-77.2800, 18.4700] }, properties: { name: 'St. Ann Community Hall', amenity: 'community_centre', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-76.9500, 17.9700] }, properties: { name: 'Spanish Town School', amenity: 'school', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-77.6000, 18.3900] }, properties: { name: 'Falmouth Community Center', amenity: 'community_centre', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-77.1200, 18.2400] }, properties: { name: 'Mandeville High School', amenity: 'school', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-76.7400, 18.1400] }, properties: { name: 'Port Antonio Church', building: 'church', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-76.3700, 18.0500] }, properties: { name: 'Morant Bay Community Centre', amenity: 'community_centre', type: 'shelter' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-77.7600, 18.1900] }, properties: { name: 'May Pen School', amenity: 'school', type: 'shelter' } }
  ]
};

// Add more schools and churches as shelters
for (let i = 0; i < 230; i++) {
  const lat = 17.7 + Math.random() * 0.9;
  const lon = -78.4 + Math.random() * 2.2;
  const types = ['school', 'church', 'community_centre'];
  const selectedType = types[i % 3];
  
  const properties: any = {
    name: `Emergency Shelter Site ${i + 11}`,
    type: 'shelter'
  };
  
  if (selectedType === 'church') {
    properties.building = 'church';
  } else {
    properties.amenity = selectedType === 'community_centre' ? 'community_centre' : 'school';
  }
  
  fallbackShelters.features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties
  });
}

export const fallbackAirports = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.7875, 17.9357] },
      properties: { id: 1, type: 'airport', name: 'Norman Manley International Airport', aeroway: 'aerodrome', iata: 'KIN' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.9134, 18.5037] },
      properties: { id: 2, type: 'airport', name: 'Sangster International Airport', aeroway: 'aerodrome', iata: 'MBJ' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.0788, 18.1981] },
      properties: { id: 3, type: 'airport', name: 'Ian Fleming International Airport', aeroway: 'aerodrome', iata: 'OCJ' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.5348, 17.9396] },
      properties: { id: 4, type: 'airport', name: 'Ken Jones Aerodrome', aeroway: 'aerodrome' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.7972, 18.0447] },
      properties: { id: 5, type: 'airport', name: 'Negril Aerodrome', aeroway: 'aerodrome', iata: 'NEG' }
    }
  ]
};

export const fallbackPorts = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.8400, 17.9686] },
      properties: { id: 1, type: 'port', name: 'Port of Kingston', harbour: 'yes' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.9200, 18.4700] },
      properties: { id: 2, type: 'port', name: 'Montego Bay Port', harbour: 'yes' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.8400, 18.0200] },
      properties: { id: 3, type: 'port', name: 'Port Royal', harbour: 'yes' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.2700, 18.4000] },
      properties: { id: 4, type: 'port', name: 'Ocho Rios Cruise Port', harbour: 'yes' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-77.5900, 18.3900] },
      properties: { id: 5, type: 'port', name: 'Falmouth Cruise Port', harbour: 'yes' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-76.4500, 18.1700] },
      properties: { id: 6, type: 'port', name: 'Port Antonio', harbour: 'yes' }
    }
  ]
};

export const fallbackRoads = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-76.7875, 17.9357],
          [-76.7900, 18.0100],
          [-76.8000, 18.0200]
        ]
      },
      properties: { id: 1, type: 'road', name: 'A1 - Main Road Kingston to Spanish Town', highway: 'primary', ref: 'A1' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-76.8000, 18.0200],
          [-77.0000, 18.1000],
          [-77.3000, 18.3000],
          [-77.9000, 18.4700]
        ]
      },
      properties: { id: 2, type: 'road', name: 'A1 - Main Road to Montego Bay', highway: 'primary', ref: 'A1' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-76.7900, 18.0100],
          [-76.5000, 18.0500],
          [-76.3700, 18.0500]
        ]
      },
      properties: { id: 3, type: 'road', name: 'A4 - Coast Road East', highway: 'primary', ref: 'A4' }
    }
  ]
};
