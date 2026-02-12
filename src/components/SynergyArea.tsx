import React from 'react';
import { BaseCard } from './BaseCard';

interface SynergyAreaProps {
  isOpponent?: boolean;
  className?: string;
}

export const SynergyArea: React.FC<SynergyAreaProps> = ({ isOpponent = false, className = "" }) => {
  const commonRows = [
    { 
      color: 'bg-[#EF4444]', // Red
      stripIcon: '⚽', 
      leftIcons: ['✋'], 
      rightIcons: [],
      hasDefense: false,
      defenseIcon: ''
    },
    { 
      color: 'bg-[#22C55E]', // Green
      stripIcon: '⚽', 
      leftIcons: ['✋'], 
      rightIcons: ['✋', '📚'],
      hasDefense: true,
      defenseIcon: '🛡️'
    },
    { 
      color: 'bg-[#3B82F6]', // Blue
      stripIcon: '⚽', 
      leftIcons: ['📚'], 
      rightIcons: ['📚'],
      hasDefense: true,
      defenseIcon: '🛡️'
    },
  ];

  const rows = commonRows;

  return (
    <div className={`flex flex-col items-center w-full ${className} ${isOpponent ? 'rotate-180' : ''}`}>
      {rows.map((row, i) => (
        <React.Fragment key={i}>
          <div className={`relative flex items-center w-full justify-center gap-4 h-[100px] flex-row`}>
            {/* Left side: Color strip with icon */}
            <div className="flex-shrink-0 w-12 flex items-center justify-center relative h-full">
              <div className={`w-4 h-full ${row.color} border-x-[3px] border-white relative flex items-center justify-center ${i === 0 ? 'rounded-t-full border-t-[3px]' : ''} ${i === rows.length - 1 ? 'rounded-b-full border-b-[3px]' : ''}`}>
                <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center border-[3px] border-black/10 shadow-md absolute z-10`}>
                  <img src="/icons/attack_ball.svg" alt="Attack" className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Card Slot Area - Fixed Dimensions */}
            <div className="flex-shrink-0">
              <BaseCard size="synergy" className="border-[3px] border-white bg-stone-900/80 flex items-center overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-md">
                {/* Left slot (Attacker/Forward side for player) */}
                <div className={`flex-1 h-full flex items-center justify-center relative border-dashed border-white/40 border-r-2`}>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 p-1">
                    {row.leftIcons.map((icon, idx) => (
                      icon === '📚' ? (
                        <img
                          key={idx}
                          src="/icons/synergy_plus_ring.svg"
                          alt="Synergy"
                          className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        />
                      ) : icon === '✋' ? (
                        <img
                          key={idx}
                          src="/icons/defense_shield.svg"
                          alt="Defense"
                          className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        />
                      ) : (
                        <span key={idx} className="text-white text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter brightness-110">
                          {icon}
                        </span>
                      )
                    ))}
                  </div>
                </div>
                
                {/* Right slot */}
                <div className="flex-1 h-full flex items-center justify-center relative">
                  <div className="flex flex-wrap items-center justify-center gap-1.5 p-1">
                    {row.rightIcons.map((icon, idx) => (
                      icon === '📚' ? (
                        <img
                          key={idx}
                          src="/icons/synergy_plus_ring.svg"
                          alt="Synergy"
                          className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        />
                      ) : icon === '✋' ? (
                        <img
                          key={idx}
                          src="/icons/defense_shield.svg"
                          alt="Defense"
                          className="w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        />
                      ) : (
                        <span key={idx} className="text-white text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter brightness-110">
                          {icon}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </BaseCard>
            </div>

            {/* Right side: Defense Icon (for player) or placeholder to maintain symmetry */}
            <div className="flex-shrink-0 w-12 flex items-center justify-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] border-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all ${
                  row.hasDefense 
                    ? 'bg-[#3B82F6] opacity-100 scale-100' 
                    : 'bg-transparent border-transparent opacity-0 scale-75'
                }`}
              >
                {row.hasDefense && (
                  <img src="/icons/defense_shield.svg" alt="Defense" className="w-6 h-6" />
                )}
              </div>
            </div>
          </div>

          {/* Plus icon BETWEEN rows - Connecting them */}
          {i < rows.length - 1 && (
            <div className="z-30 -my-5 flex justify-center w-full relative">
              <div className="w-10 h-10 rounded-full bg-black text-white font-black flex items-center justify-center border-[3px] border-white text-xl shadow-xl transform transition-transform hover:scale-110">
                +
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
