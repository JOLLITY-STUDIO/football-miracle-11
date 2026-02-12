import React, { useState, useCallback, useRef, useEffect } from 'react';

interface Demo6Props {
  onCellClick?: (zone: number, col: number) => void;
}

interface PlayerCard {
  id: string;
  name: string;
  imageUrl: string;
  position: { zone: number; col: number };
}

interface Cube3D {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  rotation: { x: number; y: number; z: number };
}

export const Demo6_Interactive3D: React.FC<Demo6Props> = ({ onCellClick }) => {
  const [viewSettings, setViewSettings] = useState({ 
    pitch: 45, 
    rotation: 0, 
    zoom: 1,
    offsetX: 0,
    offsetY: 0
  });
  const [hoveredCell, setHoveredCell] = useState<{ zone: number; col: number } | null>(null);
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(null);
  const [placedCards, setPlacedCards] = useState<PlayerCard[]>([
    { id: '1', name: 'Player 1', imageUrl: '/images/player1.png', position: { zone: 0, col: 0 } },
    { id: '2', name: 'Player 2', imageUrl: '/images/player2.png', position: { zone: 1, col: 2 } },
    { id: '3', name: 'Player 3', imageUrl: '/images/player3.png', position: { zone: 2, col: 4 } },
  ]);
  const [cubes, setCubes] = useState<Cube3D[]>([
    { id: 'cube1', x: -200, y: -100, z: 0, size: 80, color: '#3b82f6', rotation: { x: 0, y: 0, z: 0 } },
    { id: 'cube2', x: 0, y: -100, z: 0, size: 100, color: '#22c55e', rotation: { x: 0, y: 0, z: 0 } },
    { id: 'cube3', x: 200, y: -100, z: 0, size: 80, color: '#f59e0b', rotation: { x: 0, y: 0, z: 0 } },
  ]);
  const [draggingCube, setDraggingCube] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        const hasCard = placedCards.find(c => c.position.zone === zone && c.position.col === col);
        const canPlace = selectedCard && !hasCard;

        cells.push(
          <g key={`${zone}-${col}`}>
            {/* 网格单元 */}
            <rect
              x={x - CELL_WIDTH / 2}
              y={y - CELL_HEIGHT / 2}
              width={CELL_WIDTH}
              height={CELL_HEIGHT}
              fill={canPlace ? 'rgba(34, 197, 94, 0.3)' : (hasCard ? 'rgba(59, 130, 246, 0.2)' : 'rgba(234, 179, 8, 0.2)')}
              stroke={isHovered ? '#22c55e' : (hasCard ? '#3b82f6' : '#eab308')}
              strokeWidth="2"
              rx="8"
              ry="8"
              onClick={() => {
                if (canPlace) {
                  onCellClick?.(zone, col);
                  setPlacedCards([...placedCards, {
                    ...selectedCard!,
                    position: { zone, col }
                  }]);
                  setSelectedCard(null);
                }
              }}
              onMouseEnter={() => setHoveredCell({ zone, col })}
              onMouseLeave={() => setHoveredCell(null)}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            />
            
            {/* 球员卡片 */}
            {hasCard && (
              <g>
                {/* 卡片背景 */}
                <rect
                  x={x - CELL_WIDTH * 0.4}
                  y={y - CELL_HEIGHT * 0.4}
                  width={CELL_WIDTH * 0.8}
                  height={CELL_HEIGHT * 0.8}
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  rx="4"
                  ry="4"
                />
                
                {/* 卡片内容 */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fill="#1e3a8a"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {hasCard.name}
                </text>
                
                {/* 卡片装饰 */}
                <circle
                  cx={x}
                  cy={y + 20}
                  r={15}
                  fill="#3b82f6"
                />
                <text
                  x={x}
                  y={y + 25}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {hasCard.id}
                </text>
              </g>
            )}
          </g>
        );
      }
    }
    
    return cells;
  }, [hoveredCell, selectedCard, placedCards, onCellClick]);

  const render3DCube = useCallback((cube: Cube3D) => {
    const size = cube.size;
    const halfSize = size / 2;
    const depth = size * 0.6;
    
    const faces = [
      // 顶面
      { points: [
        { x: -halfSize, y: -halfSize },
        { x: halfSize, y: -halfSize },
        { x: halfSize, y: halfSize },
        { x: -halfSize, y: halfSize }
      ], color: cube.color, opacity: 1 },
      // 前面
      { points: [
        { x: -halfSize, y: -halfSize },
        { x: halfSize, y: -halfSize },
        { x: halfSize, y: halfSize },
        { x: -halfSize, y: halfSize }
      ], color: adjustColor(cube.color, 0.8), opacity: 0.9 },
      // 右面
      { points: [
        { x: halfSize, y: -halfSize },
        { x: halfSize, y: halfSize },
        { x: halfSize + depth, y: halfSize },
        { x: halfSize + depth, y: -halfSize }
      ], color: adjustColor(cube.color, 0.7), opacity: 0.8 },
      // 左面
      { points: [
        { x: -halfSize, y: -halfSize },
        { x: -halfSize, y: halfSize },
        { x: -halfSize - depth, y: halfSize },
        { x: -halfSize - depth, y: -halfSize }
      ], color: adjustColor(cube.color, 0.6), opacity: 0.7 },
    ];

    return (
      <g 
        transform={`translate(${cube.x}, ${cube.y}) rotate(${cube.rotation.z})`}
        style={{ cursor: 'grab' }}
        onMouseDown={() => {
          setDraggingCube(cube.id);
          setIsDragging(true);
        }}
        onMouseUp={() => {
          setDraggingCube(null);
          setIsDragging(false);
        }}
        onMouseEnter={() => {
          if (!isDragging) {
            document.body.style.cursor = 'grab';
          }
        }}
        onMouseLeave={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {faces.map((face, index) => (
          <polygon
            key={index}
            points={face.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill={face.color}
            fillOpacity={face.opacity}
            stroke={adjustColor(cube.color, 0.5)}
            strokeWidth="1"
          />
        ))}
        
        {/* 顶部文字 */}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize="12"
          fontWeight="bold"
          pointerEvents="none"
        >
          {cube.id}
        </text>
      </g>
    );
  }, [isDragging]);

  const adjustColor = (color: string, factor: number) => {
    return color; // 简化处理，实际可以添加颜色调整逻辑
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(2, viewSettings.zoom + delta));
    setViewSettings({ ...viewSettings, zoom: newZoom });
  }, [viewSettings]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && draggingCube) {
      const cube = cubes.find(c => c.id === draggingCube);
      if (cube) {
        const newCubes = cubes.map(c => {
          if (c.id === draggingCube) {
            return {
              ...c,
              x: c.x + e.movementX,
              y: c.y + e.movementY,
              rotation: {
                x: c.rotation.x + e.movementY * 0.5,
                y: c.rotation.y + e.movementX * 0.5,
                z: c.rotation.z + e.movementX * 0.3
              }
            };
          }
          return c;
        });
        setCubes(newCubes);
      }
    }
  }, [isDragging, draggingCube, cubes]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel);
      container.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [handleWheel, handleMouseMove]);

  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '100vh', background: '#1a1a1a', overflow: 'hidden', userSelect: 'none' }}
    >
      <h2 style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        Demo 6: 交互式3D场景 (CSS 3D + SVG 3D)
      </h2>
      
      <div style={{ padding: '20px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
        
        <div style={{ color: 'white' }}>
          <label>Offset X: {viewSettings.offsetX}</label>
          <input
            type="range"
            min="-200"
            max="200"
            value={viewSettings.offsetX}
            onChange={(e) => setViewSettings({ ...viewSettings, offsetX: Number(e.target.value) })}
            style={{ marginLeft: '10px' }}
          />
        </div>
        
        <div style={{ color: 'white' }}>
          <label>Offset Y: {viewSettings.offsetY}</label>
          <input
            type="range"
            min="-200"
            max="200"
            value={viewSettings.offsetY}
            onChange={(e) => setViewSettings({ ...viewSettings, offsetY: Number(e.target.value) })}
            style={{ marginLeft: '10px' }}
          />
        </div>
      </div>
      
      <div style={{ 
        width: '100%', 
        height: 'calc(100vh - 250px)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        perspective: '1000px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `translateX(${viewSettings.offsetX}px) translateY(${viewSettings.offsetY}px) rotateX(${viewSettings.pitch}deg) rotateZ(${viewSettings.rotation}deg) scale(${viewSettings.zoom})`,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center',
            transition: 'transform 0.1s ease-out'
          }}
        >
          <svg
            viewBox="-960 -540 1920 1080"
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* 背景网格 */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect x="-960" y="-540" width="1920" height="1080" fill="url(#grid)" />
            
            {/* 3D立方体 */}
            {cubes.map(cube => render3DCube(cube))}
            
            {/* 球场网格 */}
            {renderField()}
          </svg>
        </div>
      </div>
      
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px 30px',
        borderRadius: '10px',
        color: 'white',
        textAlign: 'center'
      }}>
        <p>Hovered: {hoveredCell ? `Zone ${hoveredCell.zone}, Col ${hoveredCell.col}` : 'None'}</p>
        <p>Selected: {selectedCard ? selectedCard.name : 'None'}</p>
        <p>Dragging: {draggingCube || 'None'}</p>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          滚轮缩放 | 拖拽立方体 | 点击网格放置球员
        </p>
      </div>
      
      <div style={{ 
        position: 'fixed', 
        top: '80px', 
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '320px',
        color: 'white',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#60a5fa' }}>
          交互式3D场景
        </h3>
        <p style={{ margin: '0 0 10px 0', color: '#9ca3af' }}>
          CSS 3D + SVG 3D实现立体效果和丰富交互
        </p>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#f59e0b' }}>
            交互功能
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '12px' }}>
            <li>🖱️ 滚轮缩放场景</li>
            <li>🎚️ 拖拽3D立方体</li>
            <li>👆 点击网格放置球员</li>
            <li>🔄 旋转视角</li>
            <li>📍 平移场景</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#22c55e' }}>
            立体效果
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '12px' }}>
            <li>📦 多个3D立方体</li>
            <li>🎨 不同颜色和大小</li>
            <li>🔄 实时旋转效果</li>
            <li>🎯 精确的点击检测</li>
          </ul>
        </div>
      </div>
      
      <div style={{ 
        position: 'fixed', 
        top: '80px', 
        left: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setSelectedCard(null)}
          style={{
            padding: '10px 20px',
            background: selectedCard === null ? '#3b82f6' : '#4b5563',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          取消选择
        </button>
        
        <button
          onClick={() => setSelectedCard({
            id: 'new1',
            name: 'New Player',
            imageUrl: '/images/newplayer.png',
            position: { zone: -1, col: -1 }
          })}
          style={{
            padding: '10px 20px',
            background: selectedCard?.id === 'new1' ? '#3b82f6' : '#4b5563',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          选择新球员
        </button>
        
        <button
          onClick={() => setCubes([
            { id: 'cube1', x: -200, y: -100, z: 0, size: 80, color: '#3b82f6', rotation: { x: 0, y: 0, z: 0 } },
            { id: 'cube2', x: 0, y: -100, z: 0, size: 100, color: '#22c55e', rotation: { x: 0, y: 0, z: 0 } },
            { id: 'cube3', x: 200, y: -100, z: 0, size: 80, color: '#f59e0b', rotation: { x: 0, y: 0, z: 0 } },
          ])}
          style={{
            padding: '10px 20px',
            background: '#4b5563',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          重置立方体
        </button>
      </div>
    </div>
  );
};