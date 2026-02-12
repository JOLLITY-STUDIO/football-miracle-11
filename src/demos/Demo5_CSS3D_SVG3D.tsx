import React, { useState, useCallback } from 'react';

interface Demo5Props {
  onCellClick?: (zone: number, col: number) => void;
}

interface PlayerCard {
  id: string;
  name: string;
  imageUrl: string;
  position: { zone: number; col: number };
}

export const Demo5_CSS3D_SVG3D: React.FC<Demo5Props> = ({ onCellClick }) => {
  const [viewSettings, setViewSettings] = useState({ pitch: 45, rotation: 0, zoom: 1 });
  const [hoveredCell, setHoveredCell] = useState<{ zone: number; col: number } | null>(null);
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(null);
  const [placedCards, setPlacedCards] = useState<PlayerCard[]>([
    { id: '1', name: 'Player 1', imageUrl: '/images/player1.png', position: { zone: 0, col: 0 } },
    { id: '2', name: 'Player 2', imageUrl: '/images/player2.png', position: { zone: 1, col: 2 } },
    { id: '3', name: 'Player 3', imageUrl: '/images/player3.png', position: { zone: 2, col: 4 } },
  ]);

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

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a', overflow: 'hidden' }}>
      <h2 style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        Demo 5: CSS 3D + SVG 3D (推荐方案)
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
      </div>
      
      <div style={{ 
        width: '100%', 
        height: 'calc(100vh - 200px)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        perspective: '1000px'
      }}>
        {/* CSS 3D容器 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `rotateX(${viewSettings.pitch}deg) rotateZ(${viewSettings.rotation}deg) scale(${viewSettings.zoom})`,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center'
          }}
        >
          {/* SVG 3D渲染 */}
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
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          点击网格单元放置球员，选择"选择新球员"后点击绿色网格放置
        </p>
      </div>
      
      <div style={{ 
        position: 'fixed', 
        top: '80px', 
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '300px',
        color: 'white',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#60a5fa' }}>
          CSS 3D + SVG 3D
        </h3>
        <p style={{ margin: '0 0 10px 0', color: '#9ca3af' }}>
          结合CSS 3D的视角控制和SVG 3D的精确点击检测
        </p>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#f59e0b' }}>
            优势
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '12px' }}>
            <li>CSS 3D提供灵活的视角控制</li>
            <li>SVG提供精确的点击检测</li>
            <li>可以在SVG中嵌入图片和文本</li>
            <li>不需要Three.js的复杂性</li>
            <li>性能优秀，浏览器原生优化</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#ef4444' }}>
            限制
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '12px' }}>
            <li>3D效果有限（简单的变换）</li>
            <li>不能实现复杂的光照和阴影</li>
            <li>卡片效果不如Three.js立体</li>
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
      </div>
    </div>
  );
};