import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface athleteCard {
  id: string;
  name: string;
  imageUrl: string;
  position: { zone: number; col: number };
}

interface Demo4Props {
  onCellClick?: (zone: number, col: number) => void;
}

export const Demo4_ThreeJSWithImages: React.FC<Demo4Props> = ({ onCellClick }) => {
  const CELL_WIDTH = 1.0;
  const CELL_HEIGHT = 1.2;
  const COLS = 8;
  const ROWS = 4;

  const [hoveredCell, setHoveredCell] = useState<{ zone: number; col: number } | null>(null);
  const [selectedCard, setSelectedCard] = useState<athleteCard | null>(null);
  const [placedCards, setPlacedCards] = useState<athleteCard[]>([
    { id: '1', name: 'Player 1', imageUrl: '/images/player1.png', position: { zone: 0, col: 0 } },
    { id: '2', name: 'Player 2', imageUrl: '/images/player2.png', position: { zone: 1, col: 2 } },
    { id: '3', name: 'Player 3', imageUrl: '/images/player3.png', position: { zone: 2, col: 4 } },
  ]);

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
          <group key={`${zone}-${col}`}>
            {/* 网格单元 */}
            <mesh
              position={[x, y, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (canPlace) {
                  onCellClick?.(zone, col);
                  setPlacedCards([...placedCards, {
                    ...selectedCard!,
                    position: { zone, col }
                  }]);
                  setSelectedCard(null);
                }
              }}
              onPointerOver={() => setHoveredCell({ zone, col })}
              onPointerOut={() => setHoveredCell(null)}
            >
              <planeGeometry args={[CELL_WIDTH, CELL_HEIGHT]} />
              <meshStandardMaterial
                color={canPlace ? 0x22c55e : (hasCard ? 0x3b82f6 : 0xeab308)}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* 球员图片 */}
            {hasCard && (
              <mesh position={[x, y, 0.01]}>
                <planeGeometry args={[CELL_WIDTH * 0.8, CELL_HEIGHT * 0.8]} />
                <meshStandardMaterial
                  color={0xffffff}
                  transparent
                  opacity={1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      }
    }
    
    return cells;
  }, [hoveredCell, selectedCard, placedCards, onCellClick]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a', overflow: 'hidden' }}>
      <h2 style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        Demo 4: Three.js 3D Grid with Player Images
      </h2>
      
      <div style={{ padding: '20px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ color: 'white', display: 'flex', gap: '10px' }}>
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
            选择新球�?          </button>
        </div>
      </div>
      
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: '100%', height: 'calc(100vh - 150px)' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <directionalLight position={[-5, 10, -5]} intensity={0.5} />
        
        <group>
          {renderField()}
        </group>
        
        <CameraController />
      </Canvas>
      
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
          点击网格单元放置球员，选择"选择新球�?后点击绿色网格放�?        </p>
      </div>
    </div>
  );
};

const CameraController = () => {
  useFrame(({ camera }) => {
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};
