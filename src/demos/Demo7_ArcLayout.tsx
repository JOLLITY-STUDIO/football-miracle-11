import React, { useState, useRef } from 'react';

interface Demo7Props {
  onCellClick?: (row: number, col: number) => void;
}

export const Demo7_ArcLayout: React.FC<Demo7Props> = ({ onCellClick }) => {
  const [settings, setSettings] = useState({
    rows: 3,
    cols: 8,
    arcAngle: 140,
    arcHeight: 60,
    cardWidth: 80,
    cardHeight: 120,
    spacing: 10,
    startAngle: -70
  });
  
  const [hoveredCard, setHoveredCard] = useState<{ row: number; col: number } | null>(null);
  const [selectedCard, setSelectedCard] = useState<{ row: number; col: number } | null>(null);

  const calculateCardPosition = (row: number, col: number) => {
    const { rows, cols, arcAngle, arcHeight, cardWidth, cardHeight, spacing, startAngle } = settings;
    
    // 计算该卡片在弧形上的角度
    const anglePerCard = arcAngle / (cols - 1);
    const currentAngle = startAngle + (col * anglePerCard);
    
    // 计算半径（每行不同，形成多层弧形）
    const radius = arcHeight + (row * (cardHeight + spacing));
    
    // 使用三角函数计算位置
    const radian = (currentAngle * Math.PI) / 180;
    const x = Math.sin(radian) * radius;
    const y = -Math.cos(radian) * radius;
    
    // 计算旋转角度
    const rotation = currentAngle;
    
    return { x, y, rotation };
  };

  const handleCardClick = (row: number, col: number) => {
    setSelectedCard({ row, col });
    onCellClick?.(row, col);  };

  const handleCardHover = (row: number, col: number) => {
    setHoveredCard({ row, col });
  };

  const cards: Array<{ row: number; col: number; x: number; y: number; rotation: number }> = [];
  
  for (let row = 0; row < settings.rows; row++) {
    for (let col = 0; col < settings.cols; col++) {
      const { x, y, rotation } = calculateCardPosition(row, col);
      cards.push({ row, col, x, y, rotation });
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: 'white', textAlign: 'center', padding: '20px', margin: 0 }}>
        Demo 7: Arc Layout - 归路矩阵排列
      </h2>
      
      {/* 控制面板 */}
      <div style={{ padding: '15px', background: 'rgba(0, 0, 0, 0.3)', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Rows:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={settings.rows}
            onChange={(e) => setSettings({ ...settings, rows: Number(e.target.value) })}
            style={{ width: '60px', padding: '4px' }}
          />
        </div>
        
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Cols:</label>
          <input
            type="number"
            min="2"
            max="15"
            value={settings.cols}
            onChange={(e) => setSettings({ ...settings, cols: Number(e.target.value) })}
            style={{ width: '60px', padding: '4px' }}
          />
        </div>
        
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Arc Angle: {settings.arcAngle}°</label>
          <input
            type="range"
            min="60"
            max="180"
            value={settings.arcAngle}
            onChange={(e) => setSettings({ ...settings, arcAngle: Number(e.target.value) })}
            style={{ width: '100px' }}
          />
        </div>
        
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Arc Height: {settings.arcHeight}px</label>
          <input
            type="range"
            min="30"
            max="150"
            value={settings.arcHeight}
            onChange={(e) => setSettings({ ...settings, arcHeight: Number(e.target.value) })}
            style={{ width: '100px' }}
          />
        </div>
        
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Card Width: {settings.cardWidth}px</label>
          <input
            type="range"
            min="40"
            max="120"
            value={settings.cardWidth}
            onChange={(e) => setSettings({ ...settings, cardWidth: Number(e.target.value) })}
            style={{ width: '100px' }}
          />
        </div>
        
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Card Height: {settings.cardHeight}px</label>
          <input
            type="range"
            min="60"
            max="180"
            value={settings.cardHeight}
            onChange={(e) => setSettings({ ...settings, cardHeight: Number(e.target.value) })}
            style={{ width: '100px' }}
          />
        </div>
        
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Spacing: {settings.spacing}px</label>
          <input
            type="range"
            min="0"
            max="30"
            value={settings.spacing}
            onChange={(e) => setSettings({ ...settings, spacing: Number(e.target.value) })}
            style={{ width: '100px' }}
          />
        </div>
      </div>
      
      {/* 弧形展示区域 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '100px' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {cards.map((card) => {
            const isHovered = hoveredCard?.row === card.row && hoveredCard?.col === card.col;
            const isSelected = selectedCard?.row === card.row && selectedCard?.col === card.col;
            
            return (
              <div
                key={`${card.row}-${card.col}`}
                onClick={() => handleCardClick(card.row, card.col)}
                onMouseEnter={() => handleCardHover(card.row, card.col)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${settings.cardWidth}px`,
                  height: `${settings.cardHeight}px`,
                  transform: `translate(-50%, -50%) translate(${card.x}px, ${card.y}px) rotate(${card.rotation}deg)`,
                  border: `3px solid ${isSelected ? '#3b82f6' : isHovered ? '#22c55e' : '#eab308'}`,
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.4)' : isHovered ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: isHovered || isSelected ? '0 10px 30px rgba(0, 0, 0, 0.5)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
                  zIndex: isSelected ? 100 : isHovered ? 50 : card.row * 10 + card.col
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>
                  {card.row + 1}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.8 }}>
                  {card.col + 1}
                </div>
                <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.6 }}>
                  {card.rotation.toFixed(1)}°
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 状态信息 */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '20px', 
        background: 'rgba(0, 0, 0, 0.8)', 
        padding: '15px', 
        borderRadius: '8px', 
        color: 'white',
        fontSize: '13px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Hovered:</strong> {hoveredCard ? `Row ${hoveredCard.row + 1}, Col ${hoveredCard.col + 1}` : 'None'}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Selected:</strong> {selectedCard ? `Row ${selectedCard.row + 1}, Col ${selectedCard.col + 1}` : 'None'}
        </div>
        <div>
          <strong>Total Cards:</strong> {settings.rows * settings.cols}
        </div>
      </div>
      
      {/* 说明信息 */}
      <div style={{ 
        position: 'absolute', 
        top: '100px', 
        right: '20px', 
        background: 'rgba(0, 0, 0, 0.8)', 
        padding: '15px', 
        borderRadius: '8px', 
        color: 'white',
        fontSize: '12px',
        maxWidth: '250px',
        lineHeight: '1.6'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#60a5fa' }}>
          弧形归路矩阵排列
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>多层弧形排列，形成归路效果</li>
          <li>每行卡片沿不同半径的弧形分布</li>
          <li>卡片角度随位置自动调整</li>
          <li>支持悬停和点击交互</li>
          <li>可调节行列数、弧形角度等参数</li>
        </ul>
      </div>
    </div>
  );
};