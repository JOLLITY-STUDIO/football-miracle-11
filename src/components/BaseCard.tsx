import React from 'react';

interface Props {
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'synergy';
  children?: React.ReactNode;
  className?: string;
}

// 66x43mm ratio is approximately 1.535
// We will use pixels to ensure fixed sizes that don't scale with screen width
const SIZE_CONFIG: Record<NonNullable<Props['size']>, { width: number, height: number }> = {
  tiny: { width: 99, height: 65 },    // 1.5x (66x43mm)
  small: { width: 132, height: 86 },  // 2x
  medium: { width: 165, height: 108 }, // 2.5x
  large: { width: 198, height: 130 },  // 3x
  synergy: { width: 140, height: 92 }, // Legacy/Custom
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

