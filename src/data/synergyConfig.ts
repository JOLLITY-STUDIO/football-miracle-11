import type { SynergyCard } from './cards';

interface AssetWeight {
  stars: 1 | 2 | 3 | 4 | 5;
  type: 'tackle' | 'special';
  weight: number;
  imageUrl: string;
  name: string;
}

const SYNERGY_ASSETS: AssetWeight[] = [
  { stars: 1, type: 'tackle',  weight: 2, imageUrl: 'cards/synergy/synergy-card-1-trackle.png', name: 'Tackle +1' },
  { stars: 1, type: 'special', weight: 1, imageUrl: 'cards/synergy/synergy-card-1.png',          name: 'Power +1' },
  { stars: 2, type: 'special', weight: 5, imageUrl: 'cards/synergy/synergy-card-2.png',          name: 'Power +2' },
  { stars: 3, type: 'special', weight: 10, imageUrl: 'cards/synergy/synergy-card-3.png',         name: 'Power +3' },
  { stars: 4, type: 'special', weight: 5, imageUrl: 'cards/synergy/synergy-card-4.png',          name: 'Power +4' },
  { stars: 5, type: 'special', weight: 2, imageUrl: 'cards/synergy/synergy-card-5.png',          name: 'Power +5' },
];

export function getSynergyDeckFixed(): SynergyCard[] {
  const deck: SynergyCard[] = [];
  let idCounter = 1;
  for (const asset of SYNERGY_ASSETS) {
    for (let i = 0; i < asset.weight; i++) {
      deck.push({
        id: `S${String(idCounter).padStart(3, '0')}`,
        name: asset.name,
        type: asset.type,
        value: asset.stars,
        stars: asset.stars,
        unlocked: true,
        unlockCondition: 'Physical card deck',
        imageUrl: asset.imageUrl,
      });
      idCounter += 1;
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}
