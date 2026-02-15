import React from 'react';
import type { AthleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';

interface Props {
  card: AthleteCard;
}

export const CardPreview: React.FC<Props> = ({ card }) => {
  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 z-[100] pointer-events-none">
      <AthleteCardComponent card={card} size="medium" />
    </div>
  );
};

