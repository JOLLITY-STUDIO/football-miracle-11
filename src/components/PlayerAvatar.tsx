import React, { useMemo } from 'react';
import clsx from 'clsx';

interface Props {
  seed: string;
  imageUrl?: string;
  className?: string;
}

const PlayerAvatar: React.FC<Props> = ({ seed = 'default', imageUrl, className }) => {
  if (imageUrl) {
    return (
      <div className={clsx("w-full h-full bg-stone-200 flex items-center justify-center overflow-hidden", className)}>
        <img 
          src={imageUrl} 
          alt="Player" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }
  
  // Deterministic random number generator based on seed string
  const getRandom = (str: string = 'default') => {
    let hash = 0;
    const safeStr = str || 'default';
    for (let i = 0; i < safeStr.length; i++) {
      hash = safeStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (max: number) => Math.abs(hash % max);
  };

  const rng = useMemo(() => getRandom(seed), [seed]);

  // Visual Parameters
  const skinColor = '#F5CBA7'; // Softer skin tone
  const jerseyColor = '#E74C3C'; // Default Red
  const stripeColor = '#2C3E50'; // Default Dark
  const shortsColor = '#FFFFFF';

  // Hair Options - More minimalist, no strokes
  const hairStyles = [
    // Short
    <path d="M30 35 C 30 15, 70 15, 70 35 L 70 45 L 30 45 Z" fill="#2C3E50" />,
    // Side Part
    <path d="M28 38 C 25 10, 75 10, 72 38 L 72 45 L 28 45 Z" fill="#5D4037" />,
    // Long with headband (like reference)
    <g>
      <path d="M25 40 C 25 10, 75 10, 75 40 L 75 70 C 75 75, 70 75, 70 70 L 70 40 C 70 20, 30 20, 30 40 L 30 70 C 30 75, 25 75, 25 70 Z" fill="#5D4037" />
      <path d="M30 35 Q 50 30 70 35 L 70 38 Q 50 33 30 38 Z" fill="#111111" />
    </g>,
    // Afro
    <circle cx="50" cy="35" r="22" fill="#212121" />,
    // Buzz
    <path d="M32 35 C 32 20, 68 20, 68 35 L 68 45 L 32 45 Z" fill="#34495E" />,
  ];

  const selectedHair = hairStyles[rng(hairStyles.length)];
  
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Neck */}
      <rect x="42" y="55" width="16" height="10" fill={skinColor} />

      {/* Body / Jersey */}
      <path 
        d="M20 70 Q 50 60 80 70 L 85 100 L 15 100 Z" 
        fill={jerseyColor} 
      />
      
      {/* Jersey Stripes (like reference) */}
      <mask id="jerseyMask">
        <path d="M20 70 Q 50 60 80 70 L 85 100 L 15 100 Z" fill="white" />
      </mask>
      <g mask="url(#jerseyMask)">
        <rect x="30" y="60" width="8" height="50" fill={stripeColor} />
        <rect x="46" y="60" width="8" height="50" fill={stripeColor} />
        <rect x="62" y="60" width="8" height="50" fill={stripeColor} />
      </g>

      {/* Sleeves */}
      <path d="M20 70 L 5 85 L 12 92 L 25 80" fill={jerseyColor} />
      <path d="M80 70 L 95 85 L 88 92 L 75 80" fill={jerseyColor} />

      {/* Head */}
      <path 
        d="M32 40 C 32 20, 68 20, 68 40 L 68 55 Q 68 72 50 72 Q 32 72 32 55 Z" 
        fill={skinColor} 
      />

      {/* Hair */}
      {selectedHair}
    </svg>
  );
};

export default PlayerAvatar;

