import React from 'react';
import { FIELD_CONFIG } from '../config/fieldDimensions';

const { COLS, BASE_CELL_WIDTH, BASE_CELL_HEIGHT } = FIELD_CONFIG;
const CELL_WIDTH = BASE_CELL_WIDTH;
const CELL_HEIGHT = BASE_CELL_HEIGHT;

interface FieldIconsProps {
}

const FieldIcons: React.FC<FieldIconsProps> = ({}) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {/* AI半场图标 (zones 0-3) */}
      {/* AI defense icons (top row, zones 0) - First row except first and last columns */}
      {Array.from({ length: COLS }).map((_, colIdx) => {
        if (colIdx > 0 && colIdx < 7) {
          const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
          const y = 0 * CELL_HEIGHT + CELL_HEIGHT / 2;
          return (
            <g key={`ai-defense-0-${colIdx}`}>
              <foreignObject
                x={x - 20}
                y={y - 20}
                width={40}
                height={40}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7,
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <img
                    src="/icons/defense_shield.svg"
                    alt="AI Defense"
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
                      opacity: 0.7,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </foreignObject>
            </g>
          );
        }
        return null;
      })}
      
      {/* AI attack icons (bottom of AI half, zones 3) - Last row except first and last columns */}
      {Array.from({ length: COLS }).map((_, colIdx) => {
        if (colIdx > 0 && colIdx < 7) {
          const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
          const y = 3 * CELL_HEIGHT + CELL_HEIGHT / 2;
          return (
            <g key={`ai-attack-3-${colIdx}`}>
              <foreignObject
                x={x - 20}
                y={y - 20}
                width={40}
                height={40}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7,
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <img
                    src="/icons/attack_ball.svg"
                    alt="AI Attack"
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
                      opacity: 0.7,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </foreignObject>
            </g>
          );
        }
        return null;
      })}
      
      {/* 玩家半场图标 (zones 4-7) */}
      {/* Player attack icons (top of player half, zones 4) - First row except first and last columns */}
      {Array.from({ length: COLS }).map((_, colIdx) => {
        if (colIdx > 0 && colIdx < 7) {
          const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
          const y = 4 * CELL_HEIGHT + CELL_HEIGHT / 2;
          return (
            <g key={`player-attack-4-${colIdx}`}>
              <foreignObject
                x={x - 20}
                y={y - 20}
                width={40}
                height={40}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <img
                    src="/icons/attack_ball.svg"
                    alt="Player Attack"
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
                      opacity: 0.7,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </foreignObject>
            </g>
          );
        }
        return null;
      })}
      
      {/* Player defense icons (bottom of player half, zones 7) - Last row except first and last columns */}
      {Array.from({ length: COLS }).map((_, colIdx) => {
        if (colIdx > 0 && colIdx < 7) {
          const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
          const y = 7 * CELL_HEIGHT + CELL_HEIGHT / 2;
          return (
            <g key={`player-defense-7-${colIdx}`}>
              <foreignObject
                x={x - 20}
                y={y - 20}
                width={40}
                height={40}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <img
                    src="/icons/defense_shield.svg"
                    alt="Player Defense"
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
                      opacity: 0.7,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </foreignObject>
            </g>
          );
        }
        return null;
      })}

    </svg>
  );
};

export default FieldIcons;


