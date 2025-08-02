import React from 'react';

// Import state PNG images
import IndianaImg from '@assets/Indiana_1754172085108.png';
import AlaskaImg from '@assets/Alaska_1754172085109.png';
import ArizonaImg from '@assets/Arizona_1754172085110.png';
import ArkansasImg from '@assets/Arkansas_1754172085111.png';
import CaliforniaImg from '@assets/California_1754172085112.png';
import ColoradoImg from '@assets/Colorado_1754172085113.png';
import ConnecticutImg from '@assets/Connecticut Map Silhouette_1754172085114.png';
import DelawareImg from '@assets/Delaware_1754172085115.png';
import DCImg from '@assets/District of Columbia_1754172085116.png';
import FloridaImg from '@assets/Florida_1754172085117.png';
import GeorgiaImg from '@assets/Georgia_1754172085118.png';
import HawaiiImg from '@assets/Hawaii_1754172085119.png';
import IowaImg from '@assets/Iowa_1754172506887.png';
import KansasImg from '@assets/Kansas_1754172506887.png';
import KentuckyImg from '@assets/Kentucky_1754172506888.png';
import LouisianaImg from '@assets/Lousiana_1754172506888.png';
import MaineImg from '@assets/Maine_1754172506889.png';
import MarylandImg from '@assets/Maryland_1754172506889.png';
import MassachusettsImg from '@assets/Massachusetts_1754172506890.png';
import MichiganImg from '@assets/Michigan_1754172506890.png';
import MinnesotaImg from '@assets/Minnesota_1754172506891.png';
import MissouriImg from '@assets/Misouri_1754172506891.png';
import MississippiImg from '@assets/Mississippi_1754172506892.png';
import NebraskaImg from '@assets/Nebraska_1754172506886.png';
import SouthDakotaImg from '@assets/South Dakota_1754172607630.png';
import TennesseeImg from '@assets/Tennessee_1754172607631.png';
import TexasImg from '@assets/TEXAS_1754172607632.png';
import UtahImg from '@assets/Utah_1754172607633.png';
import VermontImg from '@assets/Vermont_1754172607635.png';
import VirginiaImg from '@assets/Virginia_1754172607636.png';
import WashingtonImg from '@assets/Washington_1754172607637.png';
import WestVirginiaImg from '@assets/West Virginia_1754172607637.png';
import WisconsinImg from '@assets/Wisconsin_1754172607638.png';
import WyomingImg from '@assets/Wyoming_1754172607638.png';

interface StateIconProps {
  state: string;
  size?: number;
  className?: string;
  color?: string;
}

// Mapping of state codes to their PNG images
const stateImages: Record<string, string> = {
  'IN': IndianaImg,
  'AK': AlaskaImg,
  'AZ': ArizonaImg,
  'AR': ArkansasImg,
  'CA': CaliforniaImg,
  'CO': ColoradoImg,
  'CT': ConnecticutImg,
  'DE': DelawareImg,
  'DC': DCImg,
  'FL': FloridaImg,
  'GA': GeorgiaImg,
  'HI': HawaiiImg,
  'IA': IowaImg,
  'KS': KansasImg,
  'KY': KentuckyImg,
  'LA': LouisianaImg,
  'ME': MaineImg,
  'MD': MarylandImg,
  'MA': MassachusettsImg,
  'MI': MichiganImg,
  'MN': MinnesotaImg,
  'MO': MissouriImg,
  'MS': MississippiImg,
  'NE': NebraskaImg,
  'SD': SouthDakotaImg,
  'TN': TennesseeImg,
  'TX': TexasImg,
  'UT': UtahImg,
  'VT': VermontImg,
  'VA': VirginiaImg,
  'WA': WashingtonImg,
  'WV': WestVirginiaImg,
  'WI': WisconsinImg,
  'WY': WyomingImg,
};

export function StateIcon({ state, size = 24, className = "", color = "currentColor" }: StateIconProps) {
  const stateCode = state.toUpperCase();
  
  // Check if we have a PNG image for this state
  const stateImage = stateImages[stateCode];
  
  if (!stateImage) {
    // If no PNG available, return null or a placeholder
    return null;
  }

  return (
    <img 
      src={stateImage}
      alt={`${stateCode} state outline`}
      width={size} 
      height={size} 
      className={`state-icon ${className}`}
      style={{ 
        filter: color !== 'currentColor' ? `brightness(0) saturate(100%) invert(${color === '#dc2626' ? '20%' : color === '#ea580c' ? '40%' : color === '#ca8a04' ? '60%' : '80%'})` : undefined,
        objectFit: 'contain'
      }}
    />
  );
}

// Since we're now using PNG images, we no longer need the StateSVGDefs component
// This function is kept for backward compatibility but does nothing
export function StateSVGDefs() {
  return null;
}

// CSS styles for state icons (now using PNG images)
export const stateIconStyles = `
.state-icon {
  display: inline-block;
  vertical-align: middle;
}
`;