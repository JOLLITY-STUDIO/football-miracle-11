import React from 'react';

interface Props {
  value: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

// 5x7数字模式，将居中放置在7x11网格中
const digitPatterns5x7: number[][] = [
  // 0
  [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0
  ],
  // 1
  [
    0, 0, 1, 0, 0,
    0, 1, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 1, 0, 0,
    0, 1, 1, 1, 0
  ],
  // 2
  [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    0, 0, 0, 0, 1,
    0, 0, 0, 1, 0,
    0, 0, 1, 0, 0,
    0, 1, 0, 0, 0,
    1, 1, 1, 1, 1
  ],
  // 3
  [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    0, 0, 0, 0, 1,
    0, 0, 1, 1, 0,
    0, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0
  ],
  // 4
  [
    0, 0, 0, 1, 0,
    0, 0, 1, 1, 0,
    0, 1, 0, 1, 0,
    1, 0, 0, 1, 0,
    1, 1, 1, 1, 1,
    0, 0, 0, 1, 0,
    0, 0, 0, 1, 0
  ],
  // 5
  [
    1, 1, 1, 1, 1,
    1, 0, 0, 0, 0,
    1, 1, 1, 1, 0,
    0, 0, 0, 0, 1,
    0, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0
  ],
  // 6
  [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 0,
    1, 0, 0, 0, 0,
    1, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0
  ],
  // 7
  [
    1, 1, 1, 1, 1,
    0, 0, 0, 0, 1,
    0, 0, 0, 1, 0,
    0, 0, 1, 0, 0,
    0, 1, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 1, 0, 0, 0
  ],
  // 8
  [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0
  ],
  // 9
  [
    0, 1, 1, 1, 0,
    1, 0, 0, 0, 1,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 1,
    0, 0, 0, 0, 1,
    0, 0, 0, 0, 1,
    0, 1, 1, 1, 0
  ]
];

// 将5x7模式居中放置到7x11网格中
const getCenteredPattern = (pattern5x7: number[]): number[] => {
  const result = Array(7 * 11).fill(0);
  const startCol = 1;
  const startRow = 2;
  
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      const sourceIndex = row * 5 + col;
      const targetIndex = (startRow + row) * 7 + (startCol + col);
      result[targetIndex] = pattern5x7[sourceIndex];
    }
  }
  
  return result;
};

const digitPatterns: number[][] = digitPatterns5x7.map(getCenteredPattern);

export const DotMatrixDisplay: React.FC<Props> = ({ 
  value, 
  size = 'medium', 
  color = '#f59e0b' 
}) => {
  // 确保值在0-9之间
  const digit = Math.max(0, Math.min(9, Math.floor(value)));
  const pattern = digitPatterns[digit] || Array(7 * 11).fill(0);
  
  // 根据size设置点的大小和间距
  const dotSize = {
    small: '6px',
    medium: '9px',
    large: '12px'
  }[size];
  
  const gapSize = {
    small: '3px',
    medium: '4px',
    large: '5px'
  }[size];

  return (
    <div className="flex flex-row" style={{ gap: gapSize }}>
      {Array.from({ length: 7 }).map((_, colIndex) => (
        <div key={colIndex} className="flex flex-col" style={{ gap: gapSize }}>
          {Array.from({ length: 11 }).map((_, rowIndex) => {
            const index = rowIndex * 7 + colIndex;
            const isOn = pattern[index] === 1;
            
            return (
              <div
                key={rowIndex}
                className={`rounded-full transition-all duration-200 ${isOn ? 'opacity-100' : 'opacity-10'}`}
                style={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: color,
                  boxShadow: isOn ? `0 0 ${gapSize} ${color}` : 'none'
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// 用于显示多位数的组件
interface MultiDigitProps {
  value: number;
  digits?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const MultiDigitDotMatrix: React.FC<MultiDigitProps> = ({ 
  value, 
  digits = 2, 
  size = 'medium', 
  color = '#f59e0b' 
}) => {
  const valueStr = value.toString().padStart(digits, '0');
  
  return (
    <div className="flex flex-row gap-2 items-center justify-center">
      {valueStr.split('').map((char, index) => (
        <DotMatrixDisplay 
          key={index} 
          value={parseInt(char, 10)} 
          size={size} 
          color={color} 
        />
      ))}
    </div>
  );
};
