import React from 'react';
import type { SynergyCard } from '../data/cards';
import { SynergyCardComponent } from './SynergyCard';
import { AthleteCardComponent } from './AthleteCard';
 
interface Props {
  playerSynergyHand: SynergyCard[];
  selectedSynergyCards: SynergyCard[];
  onSynergySelect: (card: SynergyCard) => void;
  showFaceDownAthletes?: boolean;
  faceDownAthleteCount?: number;
}
 
export const DrawArea: React.FC<Props> = ({
  playerSynergyHand,
  selectedSynergyCards,
  onSynergySelect,
  showFaceDownAthletes = false,
  faceDownAthleteCount = 3,
}) => {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-between items-center gap-2 px-1">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">SYNERGY</span>
      </div>
      <div className="flex gap-2">
        {/* 显示盖放的选手卡 */}
        {showFaceDownAthletes && Array.from({ length: faceDownAthleteCount }, (_, index) => (
          <div key={`face-down-athlete-${index}`} className="relative transform hover:-translate-y-4 transition-transform">
            <AthleteCardComponent
              card={{ id: `temp_${index}`, nickname: '', realName: '', type: 'fw', positionLabel: '', isStar: false, unlocked: true, unlockCondition: '', icons: [], iconPositions: [], immediateEffect: 'none' }}
              size="small"
              faceDown={true}
              variant="home"
              disabled={true}
            />
          </div>
        ))}
        
        {/* 显示协同卡 */}
        {playerSynergyHand.map((card) => (
          <div key={card.id} className="relative transform hover:-translate-y-4 transition-transform cursor-pointer">
            <SynergyCardComponent
              card={card}
              size="small"
              onClick={() => onSynergySelect(card)}
              selected={selectedSynergyCards.some(c => c.id === card.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

