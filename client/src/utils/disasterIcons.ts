// Custom disaster icon mappings with user's professional icons
import FireIcon from "@assets/Fire_1754092576942.png";
import FloodIcon from "@assets/FLOOD_1754092576943.png";
import HurricaneIcon from "@assets/HURICAN_1754092576944.png";
import IceStormIcon from "@assets/ICE _ WINTER STORM_1754092576945.png";
import StormIcon from "@assets/STORM_1754092576946.png";
import TornadoIcon from "@assets/TORNATOR_1754092576946.png";
import WindIcon from "@assets/WIND_1754092576947.png";

export const disasterIconMap: Record<string, string> = {
  // Fire-related
  'fire': FireIcon,
  'wildfire': FireIcon,
  'fire management': FireIcon,
  'red flag': FireIcon,
  
  // Flood-related  
  'flood': FloodIcon,
  'flooding': FloodIcon,
  'flash flood': FloodIcon,
  'areal flood': FloodIcon,
  'urban flood': FloodIcon,
  
  // Hurricane-related
  'hurricane': HurricaneIcon,
  'typhoon': HurricaneIcon,
  'tropical storm': HurricaneIcon,
  'tropical cyclone': HurricaneIcon,
  'cyclone': HurricaneIcon,
  
  // Ice/Winter Storm
  'ice storm': IceStormIcon,
  'winter storm': IceStormIcon,
  'blizzard': IceStormIcon,
  'snow storm': IceStormIcon,
  'freezing rain': IceStormIcon,
  'winter weather': IceStormIcon,
  'snow': IceStormIcon,
  
  // General Storm
  'severe storm': StormIcon,
  'thunderstorm': StormIcon,
  'storm': StormIcon,
  'severe weather': StormIcon,
  'severe thunderstorm': StormIcon,
  
  // Tornado
  'tornado': TornadoIcon,
  'tornadoes': TornadoIcon,
  'tornado watch': TornadoIcon,
  'tornado warning': TornadoIcon,
  
  // Wind
  'high wind': WindIcon,
  'wind storm': WindIcon,
  'straight-line winds': WindIcon,
  'damaging winds': WindIcon,
  'wind': WindIcon,
  'gale': WindIcon,
};

export function getDisasterIcon(disasterType: string): string | null {
  const normalizedType = disasterType.toLowerCase();
  
  // Direct match
  if (disasterIconMap[normalizedType]) {
    return disasterIconMap[normalizedType];
  }
  
  // Partial match
  for (const [key, icon] of Object.entries(disasterIconMap)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return icon;
    }
  }
  
  return null;
}

export function getWeatherAlertIcon(alertType: string): string | null {
  const normalizedType = alertType.toLowerCase();
  
  // Weather alert specific mappings
  if (normalizedType.includes('tornado')) return TornadoIcon;
  if (normalizedType.includes('hurricane') || normalizedType.includes('tropical')) return HurricaneIcon;
  if (normalizedType.includes('flood') || normalizedType.includes('flash flood')) return FloodIcon;
  if (normalizedType.includes('winter') || normalizedType.includes('ice') || normalizedType.includes('blizzard') || normalizedType.includes('snow')) return IceStormIcon;
  if (normalizedType.includes('wind') || normalizedType.includes('gale')) return WindIcon;
  if (normalizedType.includes('storm') || normalizedType.includes('thunderstorm') || normalizedType.includes('severe')) return StormIcon;
  if (normalizedType.includes('fire') || normalizedType.includes('red flag')) return FireIcon;
  
  return null;
}

export function getNasaEonetIcon(eventCategory: string): string | null {
  const normalizedCategory = eventCategory.toLowerCase();
  
  // NASA EONET category mappings
  if (normalizedCategory.includes('wildfire') || normalizedCategory.includes('fire')) return FireIcon;
  if (normalizedCategory.includes('flood')) return FloodIcon;
  if (normalizedCategory.includes('storm') || normalizedCategory.includes('cyclone') || normalizedCategory.includes('hurricane')) return HurricaneIcon;
  if (normalizedCategory.includes('ice') || normalizedCategory.includes('snow')) return IceStormIcon;
  if (normalizedCategory.includes('tornado')) return TornadoIcon;
  if (normalizedCategory.includes('wind')) return WindIcon;
  
  return null;
}