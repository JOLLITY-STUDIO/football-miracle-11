import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { FieldZone } from '../game/gameLogic';
import type { PlayerCard } from '../data/cards';
import { canPlaceCardAtSlot } from '../data/cards';

interface FieldCellProps {
  position: [number, number, number];
  width: number;
  height: number;
  color: string;
  onClick?: () => void;
  isHighlighted?: boolean;
  isValidPlacement?: boolean;
}

const FieldCell: React.FC<FieldCellProps> = ({
  position,
  width,
  height,
  color,
  onClick,
  isHighlighted = false,
  isValidPlacement = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const materialColor = useMemo(() => {
    if (isValidPlacement) return new THREE.Color(0x22c55e);
    if (isHighlighted) return new THREE.Color(0xef4444);
    return new THREE.Color(color);
  }, [color, isHighlighted, isValidPlacement]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color={materialColor}
        transparent
        opacity={isValidPlacement ? 0.7 : 0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

interface CardMeshProps {
  position: [number, number, number];
  card: PlayerCard;
  isRotated?: boolean;
  onMouseEnter?: (() => void) | undefined;
  onMouseLeave?: (() => void) | undefined;
}

const CardMesh: React.FC<CardMeshProps> = ({ position, card, isRotated = false, onMouseEnter, onMouseLeave }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  useFrame(() => {
    if (groupRef.current && hovered) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1] + 0.5, 0.1);
    }
  });

  const getCardColor = (type: string) => {
    switch (type) {
      case 'forward': return '#dc2626';
      case 'midfielder': return '#10b981';
      case 'defender': return '#2563eb';
      default: return '#6b7280';
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={isRotated ? [0, 0, Math.PI] : [0, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onMouseEnter?.();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        onMouseLeave?.();
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Card Background */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshStandardMaterial color={getCardColor(card.type)} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Card Border */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.85, 1.25]} />
        <meshStandardMaterial color="#1f2937" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>

      {/* Player Name */}
      <Text
        position={[0, 0, 0.05]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        {card.name}
      </Text>

      {/* Position Label */}
      <Text
        position={[0, 0.35, 0.05]}
        fontSize={0.2}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
      >
        {card.positionLabel}
      </Text>

      {/* Attack/Stats */}
      <Text
        position={[-0.6, 0.35, 0.05]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {card.isStar ? '★' : card.attack}
      </Text>
    </group>
  );
};

interface GameField3DProps {
  playerField: FieldZone[];
  aiField: FieldZone[];
  selectedCard: PlayerCard | null;
  onSlotClick: (zone: number, startCol: number) => void;
  onAttackClick?: (zone: number, slot: number) => void;
  onCardMouseEnter?: (card: PlayerCard) => void;
  onCardMouseLeave?: () => void;
  currentTurn: 'player' | 'ai';
  turnPhase: string;
  isFirstTurn: boolean;
  currentAction?: string | null;
  viewSettings?: { pitch: number; rotation: number; zoom: number; height: number };
  isHomeTeam?: boolean;
}

const GameFieldContent: React.FC<GameField3DProps> = ({
  playerField,
  aiField,
  selectedCard,
  onSlotClick,
  onCardMouseEnter,
  onCardMouseLeave,
  currentTurn,
  turnPhase,
  isFirstTurn,
  currentAction,
}) => {
  const CELL_WIDTH = 1.2;
  const CELL_HEIGHT = 1.6;
  const COLS = 8;
  const ROWS = 4;

  const canPlaceCards = (turnPhase === 'playerAction' || isFirstTurn) && currentTurn === 'player' && !currentAction;

  const renderField = (isAi: boolean) => {
    const field = isAi ? aiField : playerField;
    const yOffset = isAi ? (CELL_HEIGHT * ROWS) / 2 + 1 : -(CELL_HEIGHT * ROWS) / 2 - 1;

    return (
      <group position={[0, yOffset, 0]}>
        {field.map((zone, zIdx) => {
          const zoneY = (zIdx - 1.5) * CELL_HEIGHT;
          
          return zone.slots.map((slot, sIdx) => {
            const col = sIdx * 2;
            const cells = [];
            
            for (let c = 0; c < 2; c++) {
              const cellX = (col + c - 3.5) * CELL_WIDTH;
              const hasCard = slot.playerCard && c === 0;
              const isValidPlacement = selectedCard && 
                canPlaceCards && 
                !slot.playerCard && 
                c === 0 &&
                canPlaceCardAtSlot(selectedCard, playerField, zone.zone, sIdx + 1, isFirstTurn);

              cells.push(
                <FieldCell
                  key={`${zIdx}-${sIdx}-${c}`}
                  position={[cellX, zoneY, 0]}
                  width={CELL_WIDTH}
                  height={CELL_HEIGHT}
                  color={(zIdx + sIdx + c) % 2 === 0 ? '#2e7d32' : '#1b5e20'}
                  onClick={() => !isAi && onSlotClick(zone.zone, col)}
                  isValidPlacement={!isAi && !!isValidPlacement}
                />
              );

              if (hasCard && slot.playerCard) {
                cells.push(
                  <CardMesh
                    key={`card-${zIdx}-${sIdx}`}
                    position={[cellX + CELL_WIDTH / 2, zoneY, 0.1]}
                    card={slot.playerCard}
                    isRotated={isAi}
                    onMouseEnter={() => onCardMouseEnter?.(slot.playerCard!)}
                    onMouseLeave={onCardMouseLeave}
                  />
                );
              }
            }
            
            return cells;
          });
        })}
      </group>
    );
  };

  return (
    <group>
      {/* Background */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Pitch Background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[COLS * CELL_WIDTH + 2, ROWS * CELL_HEIGHT * 2 + 4]} />
        <meshStandardMaterial color="#C62B1D" />
      </mesh>

      {/* Green Field Area */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[COLS * CELL_WIDTH, ROWS * CELL_HEIGHT * 2 + 2]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      {/* Player Field */}
      {renderField(false)}

      {/* AI Field */}
      {renderField(true)}

      {/* Center Line */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[COLS * CELL_WIDTH, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
};

const CameraController: React.FC<{ viewSettings: { pitch: number; rotation: number; zoom: number; height: number }; isHomeTeam: boolean }> = ({ viewSettings, isHomeTeam }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    const pitchRad = (viewSettings.pitch * Math.PI) / 180;
    const rotationRad = ((isHomeTeam ? 0 : 180) + viewSettings.rotation) * Math.PI / 180;
    
    const distance = 15 / viewSettings.zoom;
    const height = distance * Math.sin(pitchRad);
    const horizontalDist = distance * Math.cos(pitchRad);
    
    const x = horizontalDist * Math.sin(rotationRad);
    const z = horizontalDist * Math.cos(rotationRad);
    
    camera.position.set(x, -z, height + viewSettings.height / 100);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });
  
  return null;
};

export const GameScene3D: React.FC<GameField3DProps> = ({ 
  viewSettings = { pitch: 0, rotation: 0, zoom: 1, height: 0 },
  isHomeTeam = true,
  ...props
}) => {
  return (
    <Canvas
      camera={{ position: [0, -15, 8], fov: 50 }}
      style={{ background: '#1a1a1a', width: '100%', height: '100%' }}
      gl={{ antialias: true }}
    >
      <CameraController viewSettings={viewSettings} isHomeTeam={isHomeTeam} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 10]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.5} />
      
      <GameFieldContent {...props} />
    </Canvas>
  );
};
