import type { SynergyCard } from './cards';
import { synergyCards } from './cards';

export function getSynergyDeckFixed(): SynergyCard[] {
  // 使用cards.ts中定义的所有协同卡
  return [...synergyCards].sort(() => Math.random() - 0.5);
}

