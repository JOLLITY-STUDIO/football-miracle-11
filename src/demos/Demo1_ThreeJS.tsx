import React, { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Demo1Props {
  onCellClick?: (zone: number, col: number) => void;
}

export const Demo1_ThreeJS: React.FC<Demo1Props> = ({ onCellClick }) => {
  const CELL_WIDTH = 1.0;
  const CELL_HEIGHT = 1.2;
  const COLS = 8;
  const ROWS = 4;

  const [hoveredCell, setHoveredCell] = useState<{ zone: number; col: number } | null>(null);

  const renderField = useCallback(() => {
    const cells = [];
    
    for (let zone = 0; zone < ROWS; zone++) {
      for (let col = 0; col < COLS; col++) {
        const x = (col - COLS / 2 + 0.5) * CELL_WIDTH;
        const y = (zone - ROWS / 2 + 0.5) * CELL_HEIGHT;
        const isHovered = hoveredCell?.zone === zone && hoveredCell?.col === col;

        cells.push(
          <mesh
            key={`${zone}-${col}`}
            position={[x, y, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onCellClick?.(zone, col);
            }}
            onPointerOver={() => setHoveredCell({ zone, col })}
            onPointerOut={() => setHoveredCell(null)}
          >
            <planeGeometry args={[CELL_WIDTH, CELL_HEIGHT]} />
            <meshStandardMaterial
              color={isHovered ? 0x22c55e : 0xeab308}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      }
    }
    
    return cells;
  }, [hoveredCell, onCellClick]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a' }}>
      <h2 style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
        Demo 1: Three.js 3D Grid - 优化版
      </h2>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ width: '100%', height: 'calc(100vh - 80px)' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        
        <group>
          {renderField()}
        </group>
        
        <CameraController />
      </Canvas>
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