import React, { useRef, useState, useCallback } from 'react';

interface Demo3Props {
  onCellClick?: (zone: number, col: number) => void;
}

export const Demo3_SVG3D: React.FC<Demo3Props> = ({ onCellClick }) => {
  const [viewSettings, setViewSettings] = useState({ pitch: 45, rotation: 0, zoom: 1 });
  const [hoveredCell, setHoveredCell] = useState<{ zone: number; col: number } | null>(null);

  const CELL_WIDTH = 100;
  const CELL_HEIGHT = 120;
  const COLS = 8;
  const ROWS = 4;

  const renderField = useCallback(() => {
    const cells = [];
    
    for (let zone = 0; zone < ROWS; zone++) {
      for (let col = 0; col < COLS; col++) {
        const x = (col - COLS / 2 + 0.5) * CELL_WIDTH;
        const y = (zone - ROWS / 2 + 0.5) * CELL_HEIGHT;
        const isHovered = hoveredCell?.zone === zone && hoveredCell?.col === col;
        
        cells.push(
          <rect
            key={`${zone}-${col}`}
            x={x - CELL_WIDTH / 2}
            y={y - CELL_HEIGHT / 2}
            width={CELL_WIDTH}
            height={CELL_HEIGHT}
            fill={isHovered ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.2)'}
            stroke={isHovered ? '#22c55e' : '#eab308'}
            strokeWidth="2"
            rx="8"
            ry="8"
            onClick={() => onCellClick?.(zone, col)}
            onMouseEnter={() => setHoveredCell({ zone, col })}
            onMouseLeave={() => setHoveredCell(null)}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          />
        );
      }
    }
    
    return cells;
  }, [hoveredCell, onCellClick]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a', overflow: 'hidden' }}>
      <h2 style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        Demo 3: SVG 3D (推荐方案)
      </h2>
      
      <div style={{ padding: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div style={{ color: 'white' }}>
          <label>Pitch: {viewSettings.pitch}°</label>
          <input
            type="range"
            min="0"
            max="90"
            value={viewSettings.pitch}
            onChange={(e) => setViewSettings({ ...viewSettings, pitch: Number(e.target.value) })}
            style={{ marginLeft: '10px' }}
          />
        </div>
        
        <div style={{ color: 'white' }}>
          <label>Rotation: {viewSettings.rotation}°</label>
          <input
            type="range"
            min="0"
            max="360"
            value={viewSettings.rotation}
            onChange={(e) => setViewSettings({ ...viewSettings, rotation: Number(e.target.value) })}
            style={{ marginLeft: '10px' }}
          />
        </div>
        
        <div style={{ color: 'white' }}>
          <label>Zoom: {viewSettings.zoom}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={viewSettings.zoom}
            onChange={(e) => setViewSettings({ ...viewSettings, zoom: Number(e.target.value) })}
            style={{ marginLeft: '10px' }}
          />
        </div>
      </div>
      
      <div style={{ 
        width: '100%', 
        height: 'calc(100vh - 200px)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        perspective: '1000px'
      }}>
        <svg
          viewBox="-960 -540 1920 1080"
          style={{
            width: '100%',
            height: '100%',
            transform: `rotateX(${viewSettings.pitch}deg) rotateZ(${viewSettings.rotation}deg) scale(${viewSettings.zoom})`,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center'
          }}
        >
          {/* 背景网格 */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect x="-960" y="-540" width="1920" height="1080" fill="url(#grid)" />
          
          {renderField()}
        </svg>
      </div>
      
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <p>点击网格单元查看效果</p>
        <p>Hovered: {hoveredCell ? `Zone ${hoveredCell.zone}, Col ${hoveredCell.col}` : 'None'}</p>
      </div>
    </div>
  );
};
