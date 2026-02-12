import React from 'react';
import type { PlayerCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';

interface Props {
  card: PlayerCard;
}

export const CardPreview: React.FC<Props> = ({ card }) => {
  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 z-[100] pointer-events-none">
      <PlayerCardComponent card={card} size="medium" />
    </div>
  );
};
