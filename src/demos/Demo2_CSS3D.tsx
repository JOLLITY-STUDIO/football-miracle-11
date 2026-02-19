import React, { useRef, useState, useCallback, useEffect } from 'react';

interface Demo2Props {
  onCellClick?: (zone: number, col: number) => void;
}

export const Demo2_CSS3D: React.FC<Demo2Props> = ({ onCellClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSettings, setViewSettings] = useState({ pitch: 45, rotation: 0, zoom: 1 });
  const [hoveredCell, setHoveredCell] = useState<{ zone: number; col: number } | null>(null);
  const [coordinateMapping, setCoordinateMapping] = useState<Array<{ zone: number; col: number; screenX: number; screenY: number }>>([]);

  const CELL_WIDTH = 100;
  const CELL_HEIGHT = 120;
  const COLS = 8;
  const ROWS = 4;

  const project3DTo2D = useCallback((x: number, y: number, z: number, settings: typeof viewSettings) => {
    const pitchRad = (settings.pitch * Math.PI) / 180;
    const rotationRad = (settings.rotation * Math.PI) / 180;
    
    // 应用3D变换
    const cosR = Math.cos(rotationRad);
    const sinR = Math.sin(rotationRad);
    const cosP = Math.cos(pitchRad);
    const sinP = Math.sin(pitchRad);
    
    // 旋转
    const x1 = x * cosR - y * sinR;
    const y1 = x * sinR + y * cosR;
    
    // 俯仰
    const y2 = y1 * cosP - z * sinP;
    const z2 = y1 * sinP + z * cosP;
    
    // 缩放
    const x3 = x1 * settings.zoom;
    const y3 = y2 * settings.zoom;
    
    // 透视投影
    const perspective = 1000;
    const scale = perspective / (perspective + z2);
    
    return {
      x: x3 * scale + 960, // 居中 (1920 / 2)
      y: y3 * scale + 540  // 居中 (1080 / 2)
    };
  }, []);

  const precomputeCoordinateMapping = useCallback(() => {
    const mapping: Array<{ zone: number; col: number; screenX: number; screenY: number }> = [];
    
    for (let zone = 0; zone < ROWS; zone++) {
      for (let col = 0; col < COLS; col++) {
        const point3D = {
          x: (col - COLS / 2 + 0.5) * CELL_WIDTH,
          y: (zone - ROWS / 2 + 0.5) * CELL_HEIGHT,
          z: 0
        };
        
        const point2D = project3DTo2D(point3D.x, point3D.y, point3D.z, viewSettings);
        
        mapping.push({
          zone,
          col,
          screenX: point2D.x,
          screenY: point2D.y
        });
      }
    }
    
    setCoordinateMapping(mapping);
  }, [viewSettings, project3DTo2D]);

  const findNearestCell = useCallback((x: number, y: number) => {
    let minDistance = Infinity;
    let nearest: { zone: number; col: number } | null = null;
    
    coordinateMapping.forEach(cell => {
      const distance = Math.sqrt(
        Math.pow(x - cell.screenX, 2) + 
        Math.pow(y - cell.screenY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { zone: cell.zone, col: cell.col };
      }
    });
    
    return nearest;
  }, [coordinateMapping]);

  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const nearestCell = findNearestCell(x, y);
    
    if (nearestCell && typeof nearestCell === 'object' && 'zone' in nearestCell && 'col' in nearestCell) {
      onCellClick?.(nearestCell.zone, nearestCell.col);
    }
  }, [findNearestCell, onCellClick]);

  const handleContainerMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const nearestCell = findNearestCell(x, y);
    setHoveredCell(nearestCell);
  }, [findNearestCell]);

  useEffect(() => {
    precomputeCoordinateMapping();
  }, [precomputeCoordinateMapping]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a', overflow: 'hidden' }}>
      <h2 style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        Demo 2: CSS 3D + 事件委托 + 坐标映射
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
      
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseMove={handleContainerMouseMove}
        style={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          position: 'relative',
          perspective: '1000px',
          overflow: 'hidden',
          cursor: 'crosshair'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotateX(${viewSettings.pitch}deg) rotateZ(${viewSettings.rotation}deg) scale(${viewSettings.zoom})`,
            transformStyle: 'preserve-3d'
          }}
        >
          {coordinateMapping.map((cell) => {
            const x = (cell.col - COLS / 2 + 0.5) * CELL_WIDTH;
            const y = (cell.zone - ROWS / 2 + 0.5) * CELL_HEIGHT;
            const isHovered = hoveredCell?.zone === cell.zone && hoveredCell?.col === cell.col;
            
            return (
              <div
                key={`${cell.zone}-${cell.col}`}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${CELL_WIDTH}px`,
                  height: `${CELL_HEIGHT}px`,
                  border: `2px solid ${isHovered ? '#22c55e' : '#eab308'}`,
                  backgroundColor: isHovered ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.2)',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.2s ease'
                }}
              />
            );
          })}
        </div>
      </div>
      
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <p>点击网格单元查看效果</p>
        <p>Hovered: {hoveredCell ? `Zone ${hoveredCell.zone}, Col ${hoveredCell.col}` : 'None'}</p>
      </div>
    </div>
  );
};
