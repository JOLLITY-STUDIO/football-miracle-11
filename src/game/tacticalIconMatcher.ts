import type { FieldZone } from '../types/game';
import type { AthleteCard, TacticalIcon, IconPosition, IconWithPosition } from '../data/cards';
import { FIELD_CONFIG as FIELD_DIMENSIONS } from '../config/fieldDimensions';

interface HalfIcon {
  type: TacticalIcon;
  zone: number;
  slot: number;
  position: IconPosition;
  card: AthleteCard;
}

interface CompleteIcon {
  type: TacticalIcon;
  centerX: number;
  centerY: number;
  halfIcons: [HalfIcon, HalfIcon];
  isHorizontal: boolean;
}

export class TacticalIconMatcher {
  private fieldZones: FieldZone[];
  private completeIcons: CompleteIcon[] = [];

  constructor(fieldZones: FieldZone[]) {
    this.fieldZones = fieldZones;
    this.analyzeField();
  }

  private analyzeField(): void {
    this.completeIcons = [];
    const processedPairs = new Set<string>();
    const processedCards = new Set<string>();
    
    for (let zoneIndex = 0; zoneIndex < this.fieldZones.length; zoneIndex++) {
      const zone = this.fieldZones[zoneIndex];
      if (!zone) continue;
      
      for (let slotIndex = 0; slotIndex < zone.slots.length; slotIndex++) {
        const slot = zone.slots[slotIndex];
        if (!slot) continue;
        
        if (slot.athleteCard) {
          const cardId = slot.athleteCard.id;
          // 确保每个卡片只被检查一次，避免因为卡片占据两个slot而重复检查
          if (!processedCards.has(cardId)) {
            this.checkCardForMatches(slot.athleteCard, zone.zone, slotIndex, processedPairs);
            this.checkFieldIconMatches(slot.athleteCard, zone.zone, slotIndex, processedPairs);
            processedCards.add(cardId);
          }
        }
      }
    }
    
    this.deduplicateCompleteIcons();
  }

  private checkFieldIconMatches(card: AthleteCard, zoneNum: number, slotIndex: number, processedPairs: Set<string>): void {
    // 定义球场初始图标位置和类型
    const fieldIcons = [
      { zone: 0, type: 'defense' as TacticalIcon }, // AI半场顶部：防守图标
      { zone: 3, type: 'attack' as TacticalIcon },  // AI半场底部：进攻图标
      { zone: 4, type: 'attack' as TacticalIcon },  // 玩家半场顶部：进攻图标
      { zone: 7, type: 'defense' as TacticalIcon }  // 玩家半场底部：防守图标
    ];

    // 检查当前卡片所在zone是否有球场初始图标
    const fieldIcon = fieldIcons.find(icon => icon.zone === zoneNum);
    if (!fieldIcon) return;

    // 定义卡片图标位置与slot位置的对应关系
    // slot-topLeft 对应卡片左侧slot位置
    // slot-topRight 对应卡片右侧slot位置
    const iconSlotMap: Record<string, number> = {
      'slot-topLeft': slotIndex,      // 左侧图标对应左侧slot
      'slot-topRight': slotIndex + 1, // 右侧图标对应右侧slot
      'slot-bottomLeft': slotIndex,   // 底部左侧图标对应左侧slot
      'slot-bottomRight': slotIndex + 1 // 底部右侧图标对应右侧slot
    };

    // 定义不同zone中需要匹配的卡片图标位置
    const positionMap: Record<number, string[]> = {
      0: ['slot-topLeft', 'slot-topRight'],    // AI半场顶部：卡片顶部图标
      3: ['slot-bottomLeft', 'slot-bottomRight'], // AI半场底部：卡片底部图标
      4: ['slot-topLeft', 'slot-topRight'],    // 玩家半场顶部：卡片顶部图标
      7: ['slot-bottomLeft', 'slot-bottomRight']  // 玩家半场底部：卡片底部图标
    };

    const positions = positionMap[zoneNum];
    if (!positions) return;

    // 检查卡片是否有对应位置和类型的图标
    for (const position of positions) {
      const cardIcon = card.iconPositions.find(
        (icon: IconWithPosition) => icon.position === position && icon.type === fieldIcon.type
      );

      if (cardIcon) {
        // 获取该图标对应的slot位置
        const cardSlot = iconSlotMap[position];
        
        // 确保slot位置在有效范围内
        if (cardSlot !== undefined && cardSlot >= 0 && cardSlot < 8) {
          const pairKey = `f-${zoneNum}-${cardSlot}-${fieldIcon.type}-${position}`;
          if (processedPairs.has(pairKey)) continue;
          processedPairs.add(pairKey);

          // 创建与球场初始图标匹配的完整图标
          const completeIcon = this.createFieldIconCompleteIcon(
            {
              type: cardIcon.type,
              zone: zoneNum,
              slot: cardSlot,
              position: cardIcon.position,
              card
            },
            fieldIcon.type,
            zoneNum,
            cardSlot
          );

          this.completeIcons.push(completeIcon);
        }
      }
    }
  }

  private createFieldIconCompleteIcon(cardHalf: HalfIcon, fieldIconType: TacticalIcon, zoneNum: number, slotIndex: number): CompleteIcon & { isFieldIconMatch?: boolean } {
    const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    
    const centerX = slotIndex * CELL_WIDTH + CELL_WIDTH / 2;
    const centerY = zoneNum * CELL_HEIGHT + CELL_HEIGHT / 2;

    // 创建一个虚拟的半场图标代表球场初始图标
    const fieldHalf: HalfIcon = {
      type: fieldIconType,
      zone: zoneNum,
      slot: slotIndex,
      position: cardHalf.position,
      card: cardHalf.card // 使用相同卡片作为占位符
    };

    return {
      type: fieldIconType,
      centerX,
      centerY,
      halfIcons: [cardHalf, fieldHalf],
      isHorizontal: false,
      isFieldIconMatch: true // 添加特殊标记
    };
  }

  private deduplicateCompleteIcons(): void {
    const uniqueIcons = new Map<string, CompleteIcon>();
    
    this.completeIcons.forEach(icon => {
      const { halfIcons, type, isHorizontal } = icon;
      const half1 = halfIcons[0];
      const half2 = halfIcons[1];
      
      // 检查是否是与球场初始图标的匹配（通过特殊标记判断）
      const isFieldIconMatch = (icon as any).isFieldIconMatch === true;
      
      // 对于与球场初始图标的匹配，允许使用相同卡片作为占位符
      if (!isFieldIconMatch && half1.card.id === half2.card.id) {
        // 只过滤掉非球场图标匹配的同一卡片上的图标
        return;
      }
      
      // 为球场图标匹配生成特殊键
      if (isFieldIconMatch) {
        const keyParts = [
          'field',
          type,
          half1.zone,
          half1.slot,
          half1.position
        ];
        const uniqueKey = keyParts.join('-');
        uniqueIcons.set(uniqueKey, icon);
      } else {
        // For cross-card matches, use the existing key structure
        const keyParts = [
          type,
          Math.min(half1.zone, half2.zone),
          Math.max(half1.zone, half2.zone),
          Math.min(half1.slot, half2.slot),
          Math.max(half1.slot, half2.slot),
          isHorizontal
        ];
        const uniqueKey = keyParts.join('-');
        uniqueIcons.set(uniqueKey, icon);
      }
    });
    
    this.completeIcons = Array.from(uniqueIcons.values());
  }

  private checkCardForMatches(card: AthleteCard, zoneNum: number, slotIndex: number, processedPairs: Set<string>): void {
    // 移除同一卡片上的图标匹配检查，因为同一卡片上的半圆图标不能自己组合成完整图标
    // 只有当两个半圆图标在相邻的卡片上，并且位置相对时，才能组合成一个完整图标
    this.checkHorizontalMatch(card, zoneNum, slotIndex, processedPairs);
    this.checkVerticalMatch(card, zoneNum, slotIndex, processedPairs);
  }

  private checkSameCardMatches(card: AthleteCard, zoneNum: number, slotIndex: number, processedPairs: Set<string>): void {
    // 检查同一卡片上的相对位置图标
    const sameCardPairs = [
      { leftPos: 'slot-bottomLeft', rightPos: 'slot-bottomRight' },
      { leftPos: 'slot-topLeft', rightPos: 'slot-topRight' },
      { leftPos: 'slot-middleLeft', rightPos: 'slot-middleRight' }
    ];

    for (const pair of sameCardPairs) {
      const leftIcon = card.iconPositions.find(
        (icon: IconWithPosition) => icon.position === pair.leftPos
      );
      
      const rightIcon = card.iconPositions.find(
        (icon: IconWithPosition) => icon.position === pair.rightPos
      );
      
      if (leftIcon && rightIcon && leftIcon.type === rightIcon.type) {
        const pairKey = `s-${zoneNum}-${slotIndex}-${leftIcon.type}-${pair.leftPos}`;
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);
        
        const completeIcon = this.createSameCardCompleteIcon(
          {
            type: leftIcon.type,
            zone: zoneNum,
            slot: slotIndex,
            position: leftIcon.position,
            card
          },
          {
            type: rightIcon.type,
            zone: zoneNum,
            slot: slotIndex,
            position: rightIcon.position,
            card
          }
        );
        
        this.completeIcons.push(completeIcon);
      }
    }
  }

  private createSameCardCompleteIcon(leftHalf: HalfIcon, rightHalf: HalfIcon): CompleteIcon {
    const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    
    const centerX = leftHalf.slot * CELL_WIDTH + CELL_WIDTH / 2;
    const centerY = leftHalf.zone * CELL_HEIGHT + CELL_HEIGHT / 2;

    return {
      type: leftHalf.type,
      centerX,
      centerY,
      halfIcons: [leftHalf, rightHalf],
      isHorizontal: true
    };
  }

  private checkHorizontalMatch(card: AthleteCard, zoneNum: number, slotIndex: number, processedPairs: Set<string>): void {
    const rightSlot = slotIndex + 1;
    
    if (rightSlot >= 8) return;
    
    const zone = this.fieldZones.find(z => z.zone === zoneNum);
    if (!zone) return;
    
    const rightSlotData = zone.slots[rightSlot];
    if (!rightSlotData?.athleteCard) return;
    
    const rightCard = rightSlotData.athleteCard;
    
    // 检查是否在AI半场（zone < 4），因为AI卡片被旋转了180度
    const isAIZone = zoneNum < 4;
    
    // 定义所有可能的水平匹配位置对
    let horizontalPositionPairs;
    
    if (isAIZone) {
      // AI半场：卡片被旋转180度，所以位置对需要调整
      horizontalPositionPairs = [
        // 左侧卡片右侧位置与右侧卡片左侧位置匹配（因为旋转后左右互换）
        { leftCardPos: 'slot-middleRight', rightCardPos: 'slot-middleLeft' },
        { leftCardPos: 'slot-bottomRight', rightCardPos: 'slot-bottomLeft' },
        // 左侧卡片左侧位置与右侧卡片右侧位置匹配（因为旋转后左右互换）
        { leftCardPos: 'slot-middleLeft', rightCardPos: 'slot-middleRight' },
        { leftCardPos: 'slot-bottomLeft', rightCardPos: 'slot-bottomRight' }
      ];
    } else {
      // 玩家半场：正常位置对
      horizontalPositionPairs = [
        // 左侧卡片右侧位置与右侧卡片左侧位置匹配
        { leftCardPos: 'slot-middleRight', rightCardPos: 'slot-middleLeft' },
        { leftCardPos: 'slot-bottomRight', rightCardPos: 'slot-bottomLeft' },
        // 左侧卡片左侧位置与右侧卡片右侧位置匹配
        { leftCardPos: 'slot-middleLeft', rightCardPos: 'slot-middleRight' },
        { leftCardPos: 'slot-bottomLeft', rightCardPos: 'slot-bottomRight' }
      ];
    }
    
    // 检查每个位置对的匹配
    for (const pair of horizontalPositionPairs) {
      const leftCardIcon = card.iconPositions.find(
        (icon: IconWithPosition) => icon.position === pair.leftCardPos
      );
      
      const rightCardIcon = rightCard.iconPositions.find(
        (icon: IconWithPosition) => icon.position === pair.rightCardPos
      );
      
      if (leftCardIcon && rightCardIcon && leftCardIcon.type === rightCardIcon.type) {
        const positionKey = pair.leftCardPos.includes('middle') ? 'middle' : 'bottom';
        const pairKey = `h-${zoneNum}-${slotIndex}-${rightSlot}-${leftCardIcon.type}-${positionKey}`;
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);
        
        const completeIcon = this.createHorizontalCompleteIcon(
          {
            type: leftCardIcon.type,
            zone: zoneNum,
            slot: slotIndex,
            position: leftCardIcon.position,
            card
          },
          {
            type: rightCardIcon.type,
            zone: zoneNum,
            slot: rightSlot,
            position: rightCardIcon.position,
            card: rightCard
          }
        );
        
        this.completeIcons.push(completeIcon);
      }
    }
  }

  private checkVerticalMatch(card: AthleteCard, zoneNum: number, slotIndex: number, processedPairs: Set<string>): void {
    // 检查下方相邻卡片
    const bottomZone = zoneNum + 1;
    
    if (bottomZone < 8) {
      const bottomZoneData = this.fieldZones.find(z => z.zone === bottomZone);
      if (bottomZoneData) {
        const bottomSlotData = bottomZoneData.slots[slotIndex];
        if (bottomSlotData?.athleteCard) {
          const bottomCard = bottomSlotData.athleteCard;
          
          const verticalPositionPairs = [
            // 上方卡片底部与下方卡片顶部匹配
            { topPos: 'slot-bottomLeft', bottomPos: 'slot-topLeft' },
            { topPos: 'slot-bottomRight', bottomPos: 'slot-topRight' },
            // 上方卡片底部与下方卡片底部匹配
            { topPos: 'slot-bottomLeft', bottomPos: 'slot-bottomLeft' },
            { topPos: 'slot-bottomRight', bottomPos: 'slot-bottomRight' },
            // 交叉匹配组合
            { topPos: 'slot-bottomLeft', bottomPos: 'slot-topRight' },
            { topPos: 'slot-bottomRight', bottomPos: 'slot-topLeft' },
            { topPos: 'slot-bottomLeft', bottomPos: 'slot-bottomRight' },
            { topPos: 'slot-bottomRight', bottomPos: 'slot-bottomLeft' }
          ];
          
          for (const pair of verticalPositionPairs) {
            const currentBottomIcon = card.iconPositions.find(
              (icon: IconWithPosition) => icon.position === pair.topPos
            );
            
            const bottomTopIcon = bottomCard.iconPositions.find(
              (icon: IconWithPosition) => icon.position === pair.bottomPos
            );
            
            if (currentBottomIcon && bottomTopIcon && currentBottomIcon.type === bottomTopIcon.type) {
              const positionKey = pair.topPos.includes('Left') ? 'Left' : 'Right';
              const pairKey = `v-${zoneNum}-${bottomZone}-${slotIndex}-${currentBottomIcon.type}-${positionKey}`;
              if (!processedPairs.has(pairKey)) {
                processedPairs.add(pairKey);
                
                const completeIcon = this.createVerticalCompleteIcon(
                  {
                    type: currentBottomIcon.type,
                    zone: zoneNum,
                    slot: slotIndex,
                    position: currentBottomIcon.position,
                    card
                  },
                  {
                    type: bottomTopIcon.type,
                    zone: bottomZone,
                    slot: slotIndex,
                    position: bottomTopIcon.position,
                    card: bottomCard
                  }
                );
                
                this.completeIcons.push(completeIcon);
              }
            }
          }
        }
      }
    }
    
    // 检查上方相邻卡片 - 特殊处理zone7的防守图标
    const topZone = zoneNum - 1;
    
    if (topZone >= 0) {
      const topZoneData = this.fieldZones.find(z => z.zone === topZone);
      if (topZoneData) {
        // 检查当前列和相邻列的上方卡片
        const checkSlots = [slotIndex, slotIndex - 1, slotIndex + 1];
        
        for (const checkSlot of checkSlots) {
          if (checkSlot >= 0 && checkSlot < 8) {
            const topSlotData = topZoneData.slots[checkSlot];
            if (topSlotData?.athleteCard) {
              const topCard = topSlotData.athleteCard;
              
              // 对于所有zone，检查所有可能的垂直匹配组合
              const verticalPositionPairs = [
                // 下方卡片顶部与上方卡片底部匹配
                { bottomPos: 'slot-topLeft', topPos: 'slot-bottomLeft' },
                { bottomPos: 'slot-topRight', topPos: 'slot-bottomRight' },
                // 下方卡片底部与上方卡片顶部匹配
                { bottomPos: 'slot-bottomLeft', topPos: 'slot-topLeft' },
                { bottomPos: 'slot-bottomRight', topPos: 'slot-topRight' },
                // 下方卡片顶部与上方卡片顶部匹配
                { bottomPos: 'slot-topLeft', topPos: 'slot-topLeft' },
                { bottomPos: 'slot-topRight', topPos: 'slot-topRight' },
                // 下方卡片底部与上方卡片底部匹配
                { bottomPos: 'slot-bottomLeft', topPos: 'slot-bottomLeft' },
                { bottomPos: 'slot-bottomRight', topPos: 'slot-bottomRight' },
                // 交叉匹配组合
                { bottomPos: 'slot-topRight', topPos: 'slot-bottomLeft' },
                { bottomPos: 'slot-topLeft', topPos: 'slot-bottomRight' },
                { bottomPos: 'slot-bottomRight', topPos: 'slot-topLeft' },
                { bottomPos: 'slot-bottomLeft', topPos: 'slot-topRight' }
              ];
              
              for (const pair of verticalPositionPairs) {
                const currentIcon = card.iconPositions.find(
                  (icon: IconWithPosition) => icon.position === pair.bottomPos
                );
                
                const topIcon = topCard.iconPositions.find(
                  (icon: IconWithPosition) => icon.position === pair.topPos
                );
                
                if (currentIcon && topIcon && currentIcon.type === topIcon.type) {
                  const positionKey = pair.bottomPos.includes('Left') ? 'Left' : 'Right';
                  const pairKey = `v-${topZone}-${zoneNum}-${checkSlot}-${currentIcon.type}-${positionKey}`;
                  if (!processedPairs.has(pairKey)) {
                    processedPairs.add(pairKey);
                    
                    const completeIcon = this.createVerticalCompleteIcon(
                      {
                        type: topIcon.type,
                        zone: topZone,
                        slot: checkSlot,
                        position: topIcon.position,
                        card: topCard
                      },
                      {
                        type: currentIcon.type,
                        zone: zoneNum,
                        slot: slotIndex,
                        position: currentIcon.position,
                        card
                      }
                    );
                    
                    this.completeIcons.push(completeIcon);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  private createHorizontalCompleteIcon(leftHalf: HalfIcon, rightHalf: HalfIcon): CompleteIcon {
    const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    
    const centerX = (leftHalf.slot * CELL_WIDTH + rightHalf.slot * CELL_WIDTH) / 2 + CELL_WIDTH / 2;
    const centerY = leftHalf.zone * CELL_HEIGHT + CELL_HEIGHT / 2;

    return {
      type: leftHalf.type,
      centerX,
      centerY,
      halfIcons: [leftHalf, rightHalf],
      isHorizontal: true
    };
  }

  private createVerticalCompleteIcon(topHalf: HalfIcon, bottomHalf: HalfIcon): CompleteIcon {
    const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    
    const centerX = topHalf.slot * CELL_WIDTH + CELL_WIDTH / 2;
    const centerY = (topHalf.zone * CELL_HEIGHT + bottomHalf.zone * CELL_HEIGHT) / 2 + CELL_HEIGHT / 2;

    return {
      type: topHalf.type,
      centerX,
      centerY,
      halfIcons: [topHalf, bottomHalf],
      isHorizontal: false
    };
  }

  public getCompleteIcons(): CompleteIcon[] {
    return this.completeIcons;
  }

  public getIconCounts(): Record<TacticalIcon, number> {
    const counts: Record<TacticalIcon, number> = {
      attack: 0,
      defense: 0,
      pass: 0,
      press: 0,
      breakthrough: 0,
      breakthroughAll: 0
    };

    this.completeIcons.forEach(icon => {
      counts[icon.type]++;
    });

    return counts;
  }

  public getPlayerIconCounts(): Record<TacticalIcon, number> {
    const counts: Record<TacticalIcon, number> = {
      attack: 0,
      defense: 0,
      pass: 0,
      press: 0,
      breakthrough: 0,
      breakthroughAll: 0
    };

    this.completeIcons.forEach(icon => {
      const isInPlayerHalf = icon.halfIcons.some(half => half.zone >= 4);
      if (isInPlayerHalf) {
        counts[icon.type]++;
      }
    });

    return counts;
  }

  public getAIIconCounts(): Record<TacticalIcon, number> {
    const counts: Record<TacticalIcon, number> = {
      attack: 0,
      defense: 0,
      pass: 0,
      press: 0,
      breakthrough: 0,
      breakthroughAll: 0
    };

    this.completeIcons.forEach(icon => {
      const isInAIHalf = icon.halfIcons.some(half => half.zone < 4);
      if (isInAIHalf) {
        counts[icon.type]++;
      }
    });

    return counts;
  }

  public getIconsByType(type: TacticalIcon): CompleteIcon[] {
    return this.completeIcons.filter(icon => icon.type === type);
  }
}
