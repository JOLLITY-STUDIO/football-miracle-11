import React, { useState, useEffect } from 'react';

interface Props {
  value: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  animateOnMount?: boolean;
}

// 5x7数字模式，将居中放置到7x11网格中
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

// 7x11网格的旋转路径（顺时针）
const rotationPath = [
  // 顶部行
  { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 }, { col: 5, row: 0 }, { col: 6, row: 0 },
  // 右侧列
  { col: 6, row: 1 }, { col: 6, row: 2 }, { col: 6, row: 3 }, { col: 6, row: 4 }, { col: 6, row: 5 }, { col: 6, row: 6 }, { col: 6, row: 7 }, { col: 6, row: 8 }, { col: 6, row: 9 }, { col: 6, row: 10 },
  // 底部行
  { col: 5, row: 10 }, { col: 4, row: 10 }, { col: 3, row: 10 }, { col: 2, row: 10 }, { col: 1, row: 10 }, { col: 0, row: 10 },
  // 左侧列
  { col: 0, row: 9 }, { col: 0, row: 8 }, { col: 0, row: 7 }, { col: 0, row: 6 }, { col: 0, row: 5 }, { col: 0, row: 4 }, { col: 0, row: 3 }, { col: 0, row: 2 }, { col: 0, row: 1 }
];

export const DotMatrixDisplay: React.FC<Props> = ({ 
  value, 
  size = 'medium', 
  color = '#f59e0b',
  animateOnMount = true
}) => {
  // 确保值在0-9之间
  const digit = Math.max(0, Math.min(9, Math.floor(value)));
  const pattern = digitPatterns[digit] || Array(7 * 11).fill(0);
  
  // 动画状态
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  
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

  // 挂载时执行动画
  useEffect(() => {
    if (animateOnMount) {
      setIsAnimating(true);
      const startTime = Date.now();
      const duration = 1500; // 1.5秒完成一圈

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setAnimationProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [animateOnMount]);

  // 检查点是否在当前动画路径上
  const isDotAnimating = (colIndex: number, rowIndex: number) => {
    if (!isAnimating) return false;
    
    const totalDots = rotationPath.length;
    const currentDotIndex = Math.floor(animationProgress * totalDots);
    const nextDotIndex = Math.min(currentDotIndex + 1, totalDots - 1);
    
    // 检查当前点是否是动画路径上的当前点或下一个点
    const currentDot = rotationPath[currentDotIndex];
    const nextDot = rotationPath[nextDotIndex];
    
    return (currentDot?.col === colIndex && currentDot?.row === rowIndex) ||
           (nextDot?.col === colIndex && nextDot?.row === rowIndex);
  };

  return (
    <div className="flex flex-row" style={{ gap: gapSize }}>
      {Array.from({ length: 7 }).map((_, colIndex) => (
        <div key={colIndex} className="flex flex-col" style={{ gap: gapSize }}>
          {Array.from({ length: 11 }).map((_, rowIndex) => {
            const index = rowIndex * 7 + colIndex;
            const isOn = pattern[index] === 1;
            const animating = isDotAnimating(colIndex, rowIndex);
            
            return (
              <div
                key={rowIndex}
                className={`rounded-full transition-all duration-100 ${isOn || animating ? 'opacity-100' : 'opacity-10'}`}
                style={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: color,
                  boxShadow: (isOn || animating) ? `0 0 ${gapSize} ${color}` : 'none',
                  transform: animating ? 'scale(1.2)' : 'scale(1)',
                  animation: animating ? 'pulse 0.5s infinite' : 'none'
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
  animateOnMount?: boolean;
}

export const MultiDigitDotMatrix: React.FC<MultiDigitProps> = ({ 
  value, 
  digits = 2, 
  size = 'medium', 
  color = '#f59e0b',
  animateOnMount = true 
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
          animateOnMount={animateOnMount}
        />
      ))}
    </div>
  );
};

