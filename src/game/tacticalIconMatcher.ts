import type { FieldZone } from '../types/game';
import type { AthleteCard, TacticalIcon } from '../data/cards';
import { FIELD_CONFIG as FIELD_DIMENSIONS } from '../config/fieldDimensions';
import { RotationUtils } from '../utils/rotationUtils';



// 图标位置枚举
enum IconPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  MIDDLE_LEFT = 'middle-left',
  MIDDLE_RIGHT = 'middle-right'
}

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
    // 保留所有zone，包括AI半场和玩家半场
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

    // 获取适合当前区域的战术图标结构（考虑旋转）
    const tactics = zoneNum < 4 ? card.rotatedTactics : card.tactics;

    // 根据球场图标类型和位置，检查对应的卡片图标位置
    if (zoneNum < 4) {
      // AI 半场
      if (zoneNum === 3) {
        // zone 3：AI 半场底部，球场进攻图标，检查卡片底部图标位置
        if (tactics.left?.down === fieldIcon.type) {
          const adjustedSlotIndex = slotIndex - 1;
          if (adjustedSlotIndex > 0 && adjustedSlotIndex < 7) {
            const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-left-down-${adjustedSlotIndex}`;
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              const completeIcon = this.createFieldIconCompleteIcon(
                {
                  type: fieldIcon.type,
                  zone: zoneNum,
                  slot: adjustedSlotIndex,
                  position: IconPosition.BOTTOM_LEFT,
                  card
                },
                fieldIcon.type,
                zoneNum,
                adjustedSlotIndex
              );

              this.completeIcons.push(completeIcon);
            }
          }
        }

        if (tactics.right?.down === fieldIcon.type) {
          const adjustedSlotIndex = slotIndex;
          if (adjustedSlotIndex > 0 && adjustedSlotIndex < 7) {
            const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-right-down-${adjustedSlotIndex}`;
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              const completeIcon = this.createFieldIconCompleteIcon(
                {
                  type: fieldIcon.type,
                  zone: zoneNum,
                  slot: adjustedSlotIndex,
                  position: IconPosition.BOTTOM_RIGHT,
                  card
                },
                fieldIcon.type,
                zoneNum,
                adjustedSlotIndex
              );

              this.completeIcons.push(completeIcon);
            }
          }
        }
      } else {
        // 其他 AI 半场区域：检查底部图标位置（因为旋转后顶部和底部互换）
        if (tactics.left?.down === fieldIcon.type) {
          const adjustedSlotIndex = slotIndex - 1;
          if (adjustedSlotIndex > 0 && adjustedSlotIndex < 7) {
            const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-left-down-${adjustedSlotIndex}`;
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              const completeIcon = this.createFieldIconCompleteIcon(
                {
                  type: fieldIcon.type,
                  zone: zoneNum,
                  slot: adjustedSlotIndex,
                  position: IconPosition.BOTTOM_LEFT,
                  card
                },
                fieldIcon.type,
                zoneNum,
                adjustedSlotIndex
              );

              this.completeIcons.push(completeIcon);
            }
          }
        }

        if (tactics.right?.down === fieldIcon.type) {
          const adjustedSlotIndex = slotIndex;
          if (adjustedSlotIndex > 0 && adjustedSlotIndex < 7) {
            const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-right-down-${adjustedSlotIndex}`;
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              const completeIcon = this.createFieldIconCompleteIcon(
                {
                  type: fieldIcon.type,
                  zone: zoneNum,
                  slot: adjustedSlotIndex,
                  position: IconPosition.BOTTOM_RIGHT,
                  card
                },
                fieldIcon.type,
                zoneNum,
                adjustedSlotIndex
              );

              this.completeIcons.push(completeIcon);
            }
          }
        }
      }
    } else {
      // 玩家半场
      if (zoneNum === 4) {
        // zone 4：玩家半场顶部，球场进攻图标，检查卡片顶部图标位置
        if (tactics.left?.top === fieldIcon.type) {
          const adjustedSlotIndex = slotIndex;
          if (adjustedSlotIndex > 0 && adjustedSlotIndex < 7) {
            const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-left-top-${adjustedSlotIndex}`;
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              const completeIcon = this.createFieldIconCompleteIcon(
                {
                  type: fieldIcon.type,
                  zone: zoneNum,
                  slot: adjustedSlotIndex,
                  position: IconPosition.TOP_LEFT,
                  card
                },
                fieldIcon.type,
                zoneNum,
                adjustedSlotIndex
              );

              this.completeIcons.push(completeIcon);
            }
          }
        }

        if (tactics.right?.top === fieldIcon.type) {
          const adjustedSlotIndex = slotIndex + 1;
          if (adjustedSlotIndex > 0 && adjustedSlotIndex < 7) {
            const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-right-top-${adjustedSlotIndex}`;
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              const completeIcon = this.createFieldIconCompleteIcon(
                {
                  type: fieldIcon.type,
                  zone: zoneNum,
                  slot: adjustedSlotIndex,
                  position: IconPosition.TOP_RIGHT,
                  card
                },
                fieldIcon.type,
                zoneNum,
                adjustedSlotIndex
              );

              this.completeIcons.push(completeIcon);
            }
          }
        }
      } else {
        // 其他玩家半场区域：检查底部图标位置
        if (tactics.left?.down === fieldIcon.type) {
          const adjustedSlotIndex = slotIndex;
          if (adjustedSlotIndex > 0 && adjustedSlotIndex < 7) {
            const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-left-down-${adjustedSlotIndex}`;
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              const completeIcon = this.createFieldIconCompleteIcon(
                {
                  type: fieldIcon.type,
                  zone: zoneNum,
                  slot: adjustedSlotIndex,
                  position: IconPosition.BOTTOM_LEFT,
                  card
                },
                fieldIcon.type,
                zoneNum,
                adjustedSlotIndex
              );

              this.completeIcons.push(completeIcon);
            }
          }
        }

        if (tactics.right?.down === fieldIcon.type) {
          const adjustedSlotIndex = slotIndex + 1;
          if (adjustedSlotIndex > 0 && adjustedSlotIndex < 7) {
            const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-right-down-${adjustedSlotIndex}`;
            if (!processedPairs.has(pairKey)) {
              processedPairs.add(pairKey);
              
              const completeIcon = this.createFieldIconCompleteIcon(
                {
                  type: fieldIcon.type,
                  zone: zoneNum,
                  slot: adjustedSlotIndex,
                  position: IconPosition.BOTTOM_RIGHT,
                  card
                },
                fieldIcon.type,
                zoneNum,
                adjustedSlotIndex
              );

              this.completeIcons.push(completeIcon);
            }
          }
        }
      }
    }
  }

  private createFieldIconCompleteIcon(cardHalf: HalfIcon, fieldIconType: TacticalIcon, zoneNum: number, slotIndex: number): CompleteIcon & { isFieldIconMatch?: boolean } {
    const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    
    // 直接使用传入的slotIndex，因为已经在调用前调整过了
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
    const zone = this.fieldZones.find(z => z.zone === zoneNum);
    if (!zone) return;
    
    // 获取适合当前区域的战术图标结构（考虑旋转）
    const currentCardTactics = RotationUtils.getTacticsForZone(card.tactics, card.rotatedTactics, zoneNum);
    
    // 检查右侧相邻卡片
    const rightAdjacentSlot = slotIndex + 2;
    if (rightAdjacentSlot < 8) {
      const rightAdjacentSlotData = zone.slots[rightAdjacentSlot];
      if (rightAdjacentSlotData?.athleteCard) {
        const rightAdjacentCard = rightAdjacentSlotData.athleteCard;
        const rightAdjacentCardTactics = RotationUtils.getTacticsForZone(rightAdjacentCard.tactics, rightAdjacentCard.rotatedTactics, zoneNum);
        
        // 获取当前卡片右侧中间位置的图标
        const currentCardRightIcon = currentCardTactics.right?.right;
        // 获取相邻卡片左侧中间位置的图标
        const adjacentCardLeftIcon = rightAdjacentCardTactics.left?.left;
        
        // 检查两个图标是否一致
        if (currentCardRightIcon && adjacentCardLeftIcon && currentCardRightIcon === adjacentCardLeftIcon) {
          const pairKey = `h-${zoneNum}-${slotIndex}-${rightAdjacentSlot}-${currentCardRightIcon}`;
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey);
            
            // 创建左侧和右侧卡片对象
            const leftHalf = {
              type: currentCardRightIcon,
              zone: zoneNum,
              slot: slotIndex,
              position: IconPosition.MIDDLE_RIGHT,
              card
            };
            const rightHalf = {
              type: adjacentCardLeftIcon,
              zone: zoneNum,
              slot: rightAdjacentSlot,
              position: IconPosition.MIDDLE_LEFT,
              card: rightAdjacentCard
            };
            
            const completeIcon = this.createHorizontalCompleteIcon(leftHalf, rightHalf);
            if (completeIcon) {
              this.completeIcons.push(completeIcon);
            }
          }
        }
      }
    }
    
    // 检查左侧相邻卡片
    const leftAdjacentSlot = slotIndex - 2;
    if (leftAdjacentSlot >= 0) {
      const leftAdjacentSlotData = zone.slots[leftAdjacentSlot];
      if (leftAdjacentSlotData?.athleteCard) {
        const leftAdjacentCard = leftAdjacentSlotData.athleteCard;
        const leftAdjacentCardTactics = RotationUtils.getTacticsForZone(leftAdjacentCard.tactics, leftAdjacentCard.rotatedTactics, zoneNum);
        
        // 获取当前卡片左侧中间位置的图标
        const currentCardLeftIcon = currentCardTactics.left?.left;
        // 获取相邻卡片右侧中间位置的图标
        const adjacentCardRightIcon = leftAdjacentCardTactics.right?.right;
        
        // 检查两个图标是否一致
        if (currentCardLeftIcon && adjacentCardRightIcon && currentCardLeftIcon === adjacentCardRightIcon) {
          const pairKey = `h-${zoneNum}-${leftAdjacentSlot}-${slotIndex}-${currentCardLeftIcon}`;
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey);
            
            // 创建左侧和右侧卡片对象
            const leftHalf = {
              type: adjacentCardRightIcon,
              zone: zoneNum,
              slot: leftAdjacentSlot,
              position: IconPosition.MIDDLE_RIGHT,
              card: leftAdjacentCard
            };
            const rightHalf = {
              type: currentCardLeftIcon,
              zone: zoneNum,
              slot: slotIndex,
              position: IconPosition.MIDDLE_LEFT,
              card
            };
            
            const completeIcon = this.createHorizontalCompleteIcon(leftHalf, rightHalf);
            if (completeIcon) {
              this.completeIcons.push(completeIcon);
            }
          }
        }
      }
    }
  }

  private checkVerticalMatch(card: AthleteCard, zoneNum: number, slotIndex: number, processedPairs: Set<string>): void {
    // 检查下方相邻卡片
    const bottomZone = zoneNum + 1;
    
    if (bottomZone < 8) {
      const bottomZoneData = this.fieldZones.find(z => z.zone === bottomZone);
      if (bottomZoneData) {
        // 只使用顶部和底部的图标位置进行垂直匹配
        // 上方卡片的底部图标与下方卡片的顶部图标匹配
        // 注意：上方卡片的右侧底部图标应匹配下方卡片的左侧顶部图标
        // 定义统一的垂直位置对组合，无论是 AI 还是玩家，都使用相同的逻辑
        // 因为 AI 的 rotatedTactics 已经处理了旋转问题
        const verticalPositionPairs = [
          // 左侧匹配：上方卡片左侧底部与下方卡片左侧顶部
          { topPos: IconPosition.BOTTOM_LEFT, bottomPos: IconPosition.TOP_LEFT, bottomSlotOffset: 0 },
          // 右侧匹配：上方卡片右侧底部与下方卡片左侧顶部
          { topPos: IconPosition.BOTTOM_RIGHT, bottomPos: IconPosition.TOP_LEFT, bottomSlotOffset: 1 },
          // 左侧匹配：上方卡片左侧底部与下方卡片右侧顶部
          { topPos: IconPosition.BOTTOM_LEFT, bottomPos: IconPosition.TOP_RIGHT, bottomSlotOffset: 0 },
          // 右侧匹配：上方卡片右侧底部与下方卡片右侧顶部
          { topPos: IconPosition.BOTTOM_RIGHT, bottomPos: IconPosition.TOP_RIGHT, bottomSlotOffset: 1 }
        ];
        
        // 获取适合当前区域的战术图标结构（考虑旋转）
        const topCardTactics = RotationUtils.getTacticsForZone(card.tactics, card.rotatedTactics, zoneNum);
        
        // 检查每个位置对的匹配
        for (const pair of verticalPositionPairs) {
          const bottomSlot = slotIndex + pair.bottomSlotOffset;
          if (bottomSlot >= 0 && bottomSlot < 8) {
            const bottomSlotData = bottomZoneData.slots[bottomSlot];
            if (bottomSlotData?.athleteCard) {
              const bottomCard = bottomSlotData.athleteCard;
              const bottomCardTactics = RotationUtils.getTacticsForZone(bottomCard.tactics, bottomCard.rotatedTactics, bottomZone);
              
              // 从tactics中检查对应位置的图标
              let currentBottomIcon = null;
              let bottomTopIcon = null;
              
              // 统一检查逻辑，不再区分AI和玩家半场
              if (pair.topPos === IconPosition.BOTTOM_LEFT) {
                currentBottomIcon = topCardTactics.left?.down ? { type: topCardTactics.left.down, position: IconPosition.BOTTOM_LEFT } : null;
              } else if (pair.topPos === IconPosition.BOTTOM_RIGHT) {
                currentBottomIcon = topCardTactics.right?.down ? { type: topCardTactics.right.down, position: IconPosition.BOTTOM_RIGHT } : null;
              }
              
              if (pair.bottomPos === IconPosition.TOP_LEFT) {
                bottomTopIcon = bottomCardTactics.left?.top ? { type: bottomCardTactics.left.top, position: IconPosition.TOP_LEFT } : null;
              } else if (pair.bottomPos === IconPosition.TOP_RIGHT) {
                bottomTopIcon = bottomCardTactics.right?.top ? { type: bottomCardTactics.right.top, position: IconPosition.TOP_RIGHT } : null;
              }
              
              if (currentBottomIcon && bottomTopIcon && currentBottomIcon.type === bottomTopIcon.type) {
                // 使用更精确的去重键，包含具体位置
                const pairKey = `v-${zoneNum}-${bottomZone}-${bottomSlot}-${currentBottomIcon.type}-${pair.topPos}-${pair.bottomPos}`;
                if (!processedPairs.has(pairKey)) {
                  processedPairs.add(pairKey);
                  
                  // 计算图标应该显示的位置：在下方卡片区域的顶部位置，水平位置在对应列的中心
                  const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
                  const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
                  const centerX = bottomSlot * CELL_WIDTH + CELL_WIDTH / 2;
                  const centerY = bottomZone * CELL_HEIGHT;
                    
                  // 创建完整图标
                  const completeIcon: CompleteIcon = {
                    type: currentBottomIcon.type,
                    centerX,
                    centerY,
                    halfIcons: [
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
                        slot: bottomSlot,
                        position: bottomTopIcon.position,
                        card: bottomCard
                      }
                    ] as [HalfIcon, HalfIcon],
                    isHorizontal: false
                  };
                    
                  this.completeIcons.push(completeIcon);
                }
              }
            }
          }
        }
      }
    }
    
    // 移除检查上方相邻卡片的逻辑，避免重复创建图标
    // 当检查下方相邻卡片时，已经处理了上方卡片底部与下方卡片顶部的匹配情况
    // 重复检查会导致创建重复的图标
  }

  private createHorizontalCompleteIcon(leftHalf: HalfIcon, rightHalf: HalfIcon): CompleteIcon | null {
    const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    
    // 使用leftHalf的slot作为左边球员的起始位置
    // 确保leftHalf始终是左侧的卡片
    const leftSlot = leftHalf.slot;
    const rightSlot = rightHalf.slot;
    
    // 检查卡片是否真正相邻
    if (rightSlot - leftSlot !== 2) {
      // 卡片不相邻，不生成图标
      return null;
    }
    
    // 计算中间列：左边卡片的结束位置，也是右边卡片的开始位置
    // 左边卡片占据 leftSlot 和 leftSlot + 1 列
    // 右边卡片占据 rightSlot 和 rightSlot + 1 列
    // 中间位置在 leftSlot + 1 列的中心，即右边卡片的左边列
    const iconColumn = leftSlot + 1;
    
    // 确保图标列在有效范围内（0-6），因为7列是最右边的列，不应该有图标
    if (iconColumn < 0 || iconColumn > 6) {
      // 图标列超出范围，不生成图标
      return null;
    }
    
    // 计算图标位置：在两张卡片之间的中心位置
    // 对于占据列 1-2 和 3-4 的卡片，中间位置应该在列 2-3 之间
    // 正确的计算方式是：(左边卡片的结束x坐标 + 右边卡片的开始x坐标) / 2
    const leftCardEndX = (leftSlot + 2) * CELL_WIDTH;
    const rightCardStartX = rightSlot * CELL_WIDTH;
    const centerX = (leftCardEndX + rightCardStartX) / 2;
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
    
    // 记录两张卡片所在的起始列
    const topStartSlot = topHalf.slot;
    const bottomStartSlot = bottomHalf.slot;
    
    // 计算卡片占据的两列
    // 每张卡片占据两个相邻的列：起始列和起始列+1
    const topLeftSlot = topStartSlot;
    const topRightSlot = topStartSlot + 1;
    const bottomLeftSlot = bottomStartSlot;
    const bottomRightSlot = bottomStartSlot + 1;
    
    // 检查卡片是否真正相邻（垂直方向）
    // 只有当两张卡片在垂直方向相邻，并且水平方向的slot也相邻时，才生成图标
    const isVerticallyAdjacent = Math.abs(topHalf.zone - bottomHalf.zone) === 1;
    const isHorizontallyOverlapping = 
      (topLeftSlot === bottomLeftSlot) || 
      (topLeftSlot === bottomRightSlot - 1) || 
      (topRightSlot === bottomLeftSlot) || 
      (topRightSlot === bottomRightSlot);
    
    if (!isVerticallyAdjacent || !isHorizontallyOverlapping) {
      // 卡片不相邻，返回一个默认位置的图标
      const defaultSlot = Math.min(topStartSlot, bottomStartSlot);
      const centerX = defaultSlot * CELL_WIDTH + CELL_WIDTH / 2;
      const centerY = (topHalf.zone * CELL_HEIGHT + bottomHalf.zone * CELL_HEIGHT) / 2;
      
      return {
        type: topHalf.type,
        centerX,
        centerY,
        halfIcons: [topHalf, bottomHalf],
        isHorizontal: false
      };
    }
    
    // 确定拼合图标应该在哪一列
    let targetSlot;
    // 根据位置类型判断是左侧还是右侧图标
    const isRightSide = 
      topHalf.position === IconPosition.BOTTOM_RIGHT || 
      topHalf.position === IconPosition.TOP_RIGHT || 
      bottomHalf.position === IconPosition.TOP_RIGHT || 
      bottomHalf.position === IconPosition.BOTTOM_RIGHT;
    
    if (isRightSide) {
      // 右侧图标：使用卡片占据的右侧列
      // 对于上方卡片，右侧图标在topRightSlot
      // 对于下方卡片，右侧图标在bottomRightSlot
      // 选择重叠的列作为目标列（如果有重叠）
      if (topRightSlot === bottomLeftSlot) {
        // 卡片在相邻列，图标在重叠列
        targetSlot = topRightSlot;
      } else if (bottomRightSlot === topLeftSlot) {
        // 卡片在相邻列（反向），图标在重叠列
        targetSlot = bottomRightSlot;
      } else if (topLeftSlot === bottomLeftSlot) {
        // 卡片在同一列，使用右侧列
        targetSlot = Math.max(topRightSlot, bottomRightSlot);
      } else {
        // 卡片不重叠，使用左侧卡片的右侧列
        targetSlot = topRightSlot;
      }
    } else {
      // 左侧图标：使用卡片占据的左侧列
      // 对于上方卡片，左侧图标在topLeftSlot
      // 对于下方卡片，左侧图标在bottomLeftSlot
      // 选择较小的左侧列作为目标列
      targetSlot = Math.min(topLeftSlot, bottomLeftSlot);
    }
    
    // 计算水平中心位置
    const centerX = targetSlot * CELL_WIDTH + CELL_WIDTH / 2;
    
    // 计算垂直位置为下方卡片区域的顶部位置
    const centerY = bottomHalf.zone * CELL_HEIGHT;

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
      press: 0
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
      press: 0
    };

    this.completeIcons.forEach(icon => {
      // 确保完整图标的两个半图标都在玩家半场（zone >= 4）
      const allInPlayerHalf = icon.halfIcons.every(half => half.zone >= 4);
      if (allInPlayerHalf) {
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
      press: 0
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
