import React from 'react';

interface Props {
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'synergy';
  children?: React.ReactNode;
  className?: string;
}

// 66x43mm ratio is approximately 1.535
// We will use pixels to ensure fixed sizes that don't scale with screen width
const SIZE_CONFIG: Record<NonNullable<Props['size']>, { width: number, height: number }> = {
  tiny: { width: 96, height: 62 },    // 1.5x scale
  small: { width: 132, height: 86 },  // 2x scale
  medium: { width: 165, height: 108 }, // 2.5x scale
  large: { width: 198, height: 130 },  // 3x scale
  synergy: { width: 140, height: 92 }, // Increased size for synergy slots
};

export const BaseCard: React.FC<Props> = ({ size = 'medium', children, className }) => {
  const config = SIZE_CONFIG[size];
  
  return (
    <div 
      style={{ width: `${config.width}px`, height: `${config.height}px`, minWidth: `${config.width}px`, minHeight: `${config.height}px` }}
      className={`rounded-xl flex-shrink-0 relative overflow-hidden ${className ?? ''}`}
    >
      {children}
    </div>
  );
};
