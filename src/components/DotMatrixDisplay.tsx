import React from 'react';

interface Props {
  value: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

// 7x11点阵数字表示
const digitPatterns: number[][] = [
  // 0
  [
    0, 0, 1, 1, 1, 0, 0,
    0, 1, 0, 0, 0, 1, 0,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 1, 0,
    0, 0, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ],
  // 1
  [
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 1, 1, 0, 0, 0,
    0, 1, 0, 1, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    1, 1, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ],
  // 2
  [
    0, 0, 1, 1, 1, 0, 0,
    0, 1, 0, 0, 0, 1, 0,
    1, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0
  ],
  // 3
  [
    0, 0, 1, 1, 1, 0, 0,
    0, 1, 0, 0, 0, 1, 0,
    1, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 1, 0,
    0, 0, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ],
  // 4
  [
    0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 1, 1, 0, 0,
    0, 0, 1, 0, 1, 0, 0,
    0, 1, 0, 0, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ],
  // 5
  [
    1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0,
    0, 1, 0, 0, 1, 0, 0,
    0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ],
  // 6
  [
    0, 0, 1, 1, 1, 0, 0,
    0, 1, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0,
    1, 0, 0, 0, 1, 0, 0,
    0, 1, 0, 0, 1, 0, 0,
    0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ],
  // 7
  [
    1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ],
  // 8
  [
    0, 0, 1, 1, 1, 0, 0,
    0, 1, 0, 0, 0, 1, 0,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 1, 0, 1, 0,
    0, 0, 1, 1, 1, 0, 0,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 1, 0,
    0, 0, 1, 1, 1, 0, 0
  ],
  // 9
  [
    0, 0, 1, 1, 1, 0, 0,
    0, 1, 0, 0, 0, 1, 0,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0
  ]
];

export const DotMatrixDisplay: React.FC<Props> = ({ 
  value, 
  size = 'medium', 
  color = '#f59e0b' 
}) => {
  // 确保值在0-9之间
  const digit = Math.max(0, Math.min(9, Math.floor(value)));
  const pattern = digitPatterns[digit];
  
  // 根据size设置点的大小和间距
  const dotSize = {
    small: '2px',
    medium: '3px',
    large: '4px'
  }[size];
  
  const gapSize = {
    small: '1px',
    medium: '2px',
    large: '3px'
  }[size];

  return (
    <div className="flex flex-col gap-[${gapSize}]">
      {Array.from({ length: 11 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-[${gapSize}]">
          {Array.from({ length: 7 }).map((_, colIndex) => {
            const index = rowIndex * 7 + colIndex;
            const isOn = pattern[index] === 1;
            
            return (
              <div
                key={colIndex}
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
  // 将数字转换为字符串，并填充前导零
  const valueStr = value.toString().padStart(digits, '0');
  
  return (
    <div className="flex gap-2 items-center">
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
