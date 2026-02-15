import React from 'react';
import { getPitchWidth, getPitchHeight, FIELD_CONFIG } from '../config/fieldDimensions';

interface FieldVisualsProps {
  shootMode?: boolean;
  onCloseShootMode?: (() => void) | undefined;
}

export const FieldVisuals: React.FC<FieldVisualsProps> = ({
  shootMode = false,
  onCloseShootMode
}) => {
  // Pitch dimensions matching GameField's fixed cells
  const PITCH_WIDTH = getPitchWidth();
  const PITCH_HEIGHT = getPitchHeight();
  const BORDER_THICKNESS = FIELD_CONFIG.BORDER_THICKNESS;
  
  // Penalty area dimensions (1 row x 4 columns)
  const PENALTY_AREA_WIDTH = FIELD_CONFIG.PENALTY_AREA_COLS * FIELD_CONFIG.BASE_CELL_WIDTH; // 4 * 99 = 396px
  const PENALTY_AREA_HEIGHT = FIELD_CONFIG.PENALTY_AREA_ROWS * FIELD_CONFIG.BASE_CELL_HEIGHT; // 1 * 130 = 130px
  const GOAL_AREA_WIDTH = FIELD_CONFIG.GOAL_AREA_COLS * FIELD_CONFIG.BASE_CELL_WIDTH; // 2 * 99 = 198px
  const GOAL_AREA_HEIGHT = FIELD_CONFIG.GOAL_AREA_ROWS * FIELD_CONFIG.BASE_CELL_HEIGHT; // 0.5 * 130 = 65px
  
  // Relative dimensions for field elements
  const CENTER_CIRCLE_RADIUS = Math.min(PITCH_WIDTH, PITCH_HEIGHT) * 0.2; // 20% of smallest dimension
  const PENALTY_ARC_RADIUS = Math.min(PITCH_WIDTH, PITCH_HEIGHT) * 0.15; // 15% of smallest dimension
  const CORNER_SIZE = Math.min(PITCH_WIDTH, PITCH_HEIGHT) * 0.05; // 5% of smallest dimension
  const PENALTY_SPOT_POSITION = GOAL_AREA_HEIGHT + (PENALTY_AREA_HEIGHT * 0.5);

  return (
    <div 
      className="relative border-[6px] border-white/80 overflow-hidden shadow-2xl"
      style={{
        width: `${PITCH_WIDTH + BORDER_THICKNESS * 2}px`,
        height: `${PITCH_HEIGHT + BORDER_THICKNESS * 2}px`,
        backgroundColor: '#2d5a27' // Natural dark grass base
      }}
    >
      {/* Grass Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,
              #356b2d 0px,
              #356b2d 130px,
              #2d5a27 130px,
              #2d5a27 260px
            )
          `,
          backgroundSize: '100% 260px'
        }}
      />
      
      {/* Field Lines & Overlays */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* Outer Boundary Glow */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]" />
      </div>
      
      {/* Center Line and Circle */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/80 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.3)] z-30" />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[4px] border-white/80 rounded-full pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.3)] z-30"
        style={{ width: `${CENTER_CIRCLE_RADIUS * 2}px`, height: `${CENTER_CIRCLE_RADIUS * 2}px` }} 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.6)] z-30" />
      
      {/* Goals and Areas (Proportional to cells) */}
      {/* Opponent Area */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30">
        {/* Goal Area */}
        <div 
          className="absolute top-0 border-b-[4px] border-x-[4px] border-white/80 bg-white/5"
          style={{ width: `${GOAL_AREA_WIDTH}px`, height: `${GOAL_AREA_HEIGHT}px` }}
        />
        {/* Penalty Area */}
        <div 
          className="border-b-[4px] border-x-[4px] border-white/80 bg-white/5 shadow-[inset_0_-20px_50px_rgba(255,255,255,0.05)]"
          style={{ width: `${PENALTY_AREA_WIDTH}px`, height: `${PENALTY_AREA_HEIGHT}px` }}
        />
        {/* Penalty Spot */}
        <div className="absolute top-[${PENALTY_SPOT_POSITION}px] w-2.5 h-2.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
        {/* Penalty Arc */}
        <div 
          className="absolute top-[${GOAL_AREA_HEIGHT + PENALTY_AREA_HEIGHT}px] left-1/2 -translate-x-1/2 border-b-[4px] border-white/80 rounded-b-full bg-transparent"
          style={{ 
            width: `${PENALTY_ARC_RADIUS * 2}px`, 
            height: `${PENALTY_ARC_RADIUS}px`, 
            borderRadius: `${PENALTY_ARC_RADIUS}px ${PENALTY_ARC_RADIUS}px 0 0`,
            clipPath: 'inset(0 0 -100% 0)'
          }}
        />
      </div>

      {/* Player Area */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30">
        {/* Goal Area */}
        <div 
          className="absolute bottom-0 border-t-[4px] border-x-[4px] border-white/80 bg-white/5"
          style={{ width: `${GOAL_AREA_WIDTH}px`, height: `${GOAL_AREA_HEIGHT}px` }}
        />
        {/* Penalty Area */}
        <div 
          className="border-t-[4px] border-x-[4px] border-white/80 bg-white/5 shadow-[inset_0_20px_50px_rgba(255,255,255,0.05)]"
          style={{ width: `${PENALTY_AREA_WIDTH}px`, height: `${PENALTY_AREA_HEIGHT}px` }}
        />
        {/* Penalty Spot */}
        <div className="absolute bottom-[${PENALTY_SPOT_POSITION}px] w-2.5 h-2.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
        {/* Penalty Arc */}
        <div 
          className="absolute bottom-[${GOAL_AREA_HEIGHT + PENALTY_AREA_HEIGHT}px] left-1/2 -translate-x-1/2 border-t-[4px] border-white/80 rounded-t-full bg-transparent"
          style={{ 
            width: `${PENALTY_ARC_RADIUS * 2}px`, 
            height: `${PENALTY_ARC_RADIUS}px`, 
            borderRadius: `0 0 ${PENALTY_ARC_RADIUS}px ${PENALTY_ARC_RADIUS}px`
          }}
        />
      </div>
      
      {/* Corners */}
      <div className="absolute top-0 left-0 border-r-[4px] border-b-[4px] border-white/70 rounded-br-full pointer-events-none z-30" style={{ width: `${CORNER_SIZE}px`, height: `${CORNER_SIZE}px` }} />
      <div className="absolute top-0 right-0 border-l-[4px] border-b-[4px] border-white/70 rounded-bl-full pointer-events-none z-30" style={{ width: `${CORNER_SIZE}px`, height: `${CORNER_SIZE}px` }} />
      <div className="absolute bottom-0 left-0 border-r-[4px] border-t-[4px] border-white/70 rounded-tr-full pointer-events-none z-30" style={{ width: `${CORNER_SIZE}px`, height: `${CORNER_SIZE}px` }} />
      <div className="absolute bottom-0 right-0 border-l-[4px] border-t-[4px] border-white/70 rounded-tl-full pointer-events-none z-30" style={{ width: `${CORNER_SIZE}px`, height: `${CORNER_SIZE}px` }} />
      
      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-4 top-4 w-20 h-14 rotate-[8deg] opacity-[0.08] bg-[radial-gradient(circle_at_40%_60%,_rgba(255,255,255,0.8),_transparent_60%)]" />
        <div className="absolute right-6 bottom-4 w-24 h-16 -rotate-[6deg] opacity-[0.08] bg-[radial-gradient(circle_at_60%_40%,_rgba(255,255,255,0.8),_transparent_60%)]" />
      </div>

      {/* Shoot Mode Instructions */}
      {shootMode && (
        <div 
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onCloseShootMode}
        >
          <div 
            className="text-white text-2xl font-bold mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            SELECT SHOOTER
          </div>
          <div 
            className="text-white text-sm mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            Click on a player with âš?icon to shoot
          </div>
          <button
            onClick={onCloseShootMode}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
          >
            CANCEL
          </button>
        </div>
      )}
    </div>
  );
};

