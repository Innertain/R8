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