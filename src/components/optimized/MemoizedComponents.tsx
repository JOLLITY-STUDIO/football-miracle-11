/**
 * Memoized versions of frequently re-rendered components
 * Use these instead of the original components for better performance
 */

import React from 'react';
import { AthleteCardComponent } from '../AthleteCard';
import { SynergyCardComponent } from '../SynergyCard';
import FieldIcons from '../FieldIcons';

// Memoized Athlete Card
export const MemoizedAthleteCard = React.memo(
  AthleteCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.card.id === nextProps.card.id &&
      prevProps.selected === nextProps.selected &&
      prevProps.faceDown === nextProps.faceDown &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.variant === nextProps.variant &&
      JSON.stringify(prevProps.usedShotIcons) === JSON.stringify(nextProps.usedShotIcons)
    );
  }
);

MemoizedAthleteCard.displayName = 'MemoizedAthleteCard';

// Memoized Synergy Card
export const MemoizedSynergyCard = React.memo(
  SynergyCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.card.id === nextProps.card.id &&
      prevProps.selected === nextProps.selected &&
      prevProps.faceDown === nextProps.faceDown &&
      prevProps.disabled === nextProps.disabled
    );
  }
);

MemoizedSynergyCard.displayName = 'MemoizedSynergyCard';

// Memoized Field Icons
export const MemoizedFieldIcons = React.memo(
  FieldIcons,
  (prevProps, nextProps) => {
    return (
      prevProps.playerField === nextProps.playerField &&
      prevProps.aiField === nextProps.aiField &&
      prevProps.isRotated === nextProps.isRotated
    );
  }
);

MemoizedFieldIcons.displayName = 'MemoizedFieldIcons';
