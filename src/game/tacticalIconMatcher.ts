import type { FieldZone } from '../types/game';
import type { AthleteCard, TacticalIcon } from '../data/cards';
import { FIELD_CONFIG as FIELD_DIMENSIONS } from '../config/fieldDimensions';
import { RotationUtils } from '../utils/rotationUtils';



interface HalfIcon {
  type: TacticalIcon;
  zone: number;
  slot: number;
  position: string;
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

    // 定义不同zone中需要匹配的卡片图标位置
    const positionMap: Record<number, string[]> = {
      0: ['slot-topLeft', 'slot-topRight', 'slot-bottomLeft', 'slot-bottomRight'],    // AI半场顶部：卡片顶部和底部图标
      3: ['slot-bottomLeft', 'slot-bottomRight'], // AI半场底部：卡片底部图标
      4: ['slot-topLeft', 'slot-topRight', 'slot-bottomLeft', 'slot-bottomRight'],    // 玩家半场顶部：卡片顶部和底部图标
      7: ['slot-bottomLeft', 'slot-bottomRight']  // 玩家半场底部：卡片底部图标
    };

    const positions = positionMap[zoneNum];
    if (!positions) return;

    // 获取适合当前区域的战术图标结构（考虑旋转）
    const tactics = RotationUtils.getTacticsForZone(card.tactics, card.rotatedTactics, zoneNum);

    // 检查卡片是否有对应位置和类型的图标
    for (const position of positions) {
      // 从tactics中检查对应位置的图标
      let cardIcon = null;
      
      // 统一检查逻辑，不再区分AI和玩家半场
      if (position === 'slot-topLeft' && tactics.left?.top === fieldIcon.type) {
        cardIcon = { type: fieldIcon.type, position };
      } else if (position === 'slot-topRight' && tactics.right?.top === fieldIcon.type) {
        cardIcon = { type: fieldIcon.type, position };
      } else if (position === 'slot-middleLeft' && tactics.left?.left === fieldIcon.type) {
        cardIcon = { type: fieldIcon.type, position };
      } else if (position === 'slot-middleRight' && tactics.right?.right === fieldIcon.type) {
        cardIcon = { type: fieldIcon.type, position };
      } else if (position === 'slot-bottomLeft' && tactics.left?.down === fieldIcon.type) {
        cardIcon = { type: fieldIcon.type, position };
      } else if (position === 'slot-bottomRight' && tactics.right?.down === fieldIcon.type) {
        cardIcon = { type: fieldIcon.type, position };
      }

      if (cardIcon) {
        // 生成唯一的键，使用卡片ID和位置，确保每个卡片的每个位置只创建一个图标
        const pairKey = `f-${card.id}-${zoneNum}-${fieldIcon.type}-${cardIcon.position}`;
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        // 根据卡片图标的位置调整插槽索引
        // 对于右侧位置的图标，使用 slotIndex + 1
        let adjustedSlotIndex = slotIndex;
        if (cardIcon.position.includes('Right')) {
          adjustedSlotIndex = slotIndex + 1;
        }

        const completeIcon = this.createFieldIconCompleteIcon(
          {
            type: cardIcon.type,
            zone: zoneNum,
            slot: adjustedSlotIndex,
            position: cardIcon.position,
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

  private checkSameCardMatches(card: AthleteCard, zoneNum: number, slotIndex: number, processedPairs: Set<string>): void {
    // 检查同一卡片上的相对位置图标
    const sameCardPairs = [
      { leftPos: 'slot-bottomLeft', rightPos: 'slot-bottomRight' },
      { leftPos: 'slot-topLeft', rightPos: 'slot-topRight' },
      { leftPos: 'slot-middleLeft', rightPos: 'slot-middleRight' }
    ];

    for (const pair of sameCardPairs) {
      // 从tactics中检查对应位置的图标
      let leftIcon = null;
      let rightIcon = null;
      
      if (pair.leftPos === 'slot-middleLeft') {
        leftIcon = card.tactics.left?.left ? { type: card.tactics.left.left, position: pair.leftPos } : null;
      } else if (pair.leftPos === 'slot-topLeft') {
        leftIcon = card.tactics.left?.top ? { type: card.tactics.left.top, position: pair.leftPos } : null;
      } else if (pair.leftPos === 'slot-bottomLeft') {
        leftIcon = card.tactics.left?.down ? { type: card.tactics.left.down, position: pair.leftPos } : null;
      }
      
      if (pair.rightPos === 'slot-middleRight') {
        rightIcon = card.tactics.right?.right ? { type: card.tactics.right.right, position: pair.rightPos } : null;
      } else if (pair.rightPos === 'slot-topRight') {
        rightIcon = card.tactics.right?.top ? { type: card.tactics.right.top, position: pair.rightPos } : null;
      } else if (pair.rightPos === 'slot-bottomRight') {
        rightIcon = card.tactics.right?.down ? { type: card.tactics.right.down, position: pair.rightPos } : null;
      }
      
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
    // 检查是否在AI半场（zone < 4），因为AI卡片被旋转了180度
    const isAIZone = zoneNum < 4;
    
    // 检查相邻卡片，考虑每张卡片占据两个插槽
    // 对于玩家半场，检查右侧卡片（slotIndex + 2）
    // 对于AI半场，检查左侧卡片（slotIndex - 2）因为卡片旋转后左右互换
    const adjacentSlot = isAIZone ? slotIndex - 2 : slotIndex + 2;
    
    if (adjacentSlot < 0 || adjacentSlot >= 8) return;
    
    const zone = this.fieldZones.find(z => z.zone === zoneNum);
    if (!zone) return;
    
    // 检查相邻卡片是否存在
    const adjacentSlotData = zone.slots[adjacentSlot];
    if (!adjacentSlotData?.athleteCard) return;
    
    const adjacentCard = adjacentSlotData.athleteCard;
    
    // 获取适合当前区域的战术图标结构（考虑旋转）
    const currentCardTactics = RotationUtils.getTacticsForZone(card.tactics, card.rotatedTactics, zoneNum);
    const adjacentCardTactics = RotationUtils.getTacticsForZone(adjacentCard.tactics, adjacentCard.rotatedTactics, zoneNum);
    
    // 定义所有可能的水平匹配位置对
    const horizontalPositionPairs = [
      // 当前卡片右侧位置与相邻卡片左侧位置匹配
      { currentCardPos: 'slot-middleRight', adjacentCardPos: 'slot-middleLeft' },
      // 当前卡片左侧位置与相邻卡片右侧位置匹配
      { currentCardPos: 'slot-middleLeft', adjacentCardPos: 'slot-middleRight' }
    ];
    
    // 检查每个位置对的匹配
    for (const pair of horizontalPositionPairs) {
      // 从tactics中检查对应位置的图标
      let currentCardIcon = null;
      let adjacentCardIcon = null;
      
      // 统一检查逻辑，不再区分AI和玩家半场
      if (pair.currentCardPos === 'slot-middleRight') {
        currentCardIcon = currentCardTactics.right?.right ? { type: currentCardTactics.right.right, position: pair.currentCardPos } : null;
      } else if (pair.currentCardPos === 'slot-topRight') {
        currentCardIcon = currentCardTactics.right?.top ? { type: currentCardTactics.right.top, position: pair.currentCardPos } : null;
      } else if (pair.currentCardPos === 'slot-bottomRight') {
        currentCardIcon = currentCardTactics.right?.down ? { type: currentCardTactics.right.down, position: pair.currentCardPos } : null;
      } else if (pair.currentCardPos === 'slot-middleLeft') {
        currentCardIcon = currentCardTactics.left?.left ? { type: currentCardTactics.left.left, position: pair.currentCardPos } : null;
      } else if (pair.currentCardPos === 'slot-topLeft') {
        currentCardIcon = currentCardTactics.left?.top ? { type: currentCardTactics.left.top, position: pair.currentCardPos } : null;
      } else if (pair.currentCardPos === 'slot-bottomLeft') {
        currentCardIcon = currentCardTactics.left?.down ? { type: currentCardTactics.left.down, position: pair.currentCardPos } : null;
      }
      
      if (pair.adjacentCardPos === 'slot-middleLeft') {
        adjacentCardIcon = adjacentCardTactics.left?.left ? { type: adjacentCardTactics.left.left, position: pair.adjacentCardPos } : null;
      } else if (pair.adjacentCardPos === 'slot-topLeft') {
        adjacentCardIcon = adjacentCardTactics.left?.top ? { type: adjacentCardTactics.left.top, position: pair.adjacentCardPos } : null;
      } else if (pair.adjacentCardPos === 'slot-bottomLeft') {
        adjacentCardIcon = adjacentCardTactics.left?.down ? { type: adjacentCardTactics.left.down, position: pair.adjacentCardPos } : null;
      } else if (pair.adjacentCardPos === 'slot-middleRight') {
        adjacentCardIcon = adjacentCardTactics.right?.right ? { type: adjacentCardTactics.right.right, position: pair.adjacentCardPos } : null;
      } else if (pair.adjacentCardPos === 'slot-topRight') {
        adjacentCardIcon = adjacentCardTactics.right?.top ? { type: adjacentCardTactics.right.top, position: pair.adjacentCardPos } : null;
      } else if (pair.adjacentCardPos === 'slot-bottomRight') {
        adjacentCardIcon = adjacentCardTactics.right?.down ? { type: adjacentCardTactics.right.down, position: pair.adjacentCardPos } : null;
      }
      
      if (currentCardIcon && adjacentCardIcon && currentCardIcon.type === adjacentCardIcon.type) {
        const positionKey = 'middle';
        const pairKey = `h-${zoneNum}-${Math.min(slotIndex, adjacentSlot)}-${Math.max(slotIndex, adjacentSlot)}-${currentCardIcon.type}-${positionKey}`;
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);
        
        const completeIcon = this.createHorizontalCompleteIcon(
          {
            type: currentCardIcon.type,
            zone: zoneNum,
            slot: slotIndex,
            position: currentCardIcon.position,
            card
          },
          {
            type: adjacentCardIcon.type,
            zone: zoneNum,
            slot: adjacentSlot,
            position: adjacentCardIcon.position,
            card: adjacentCard
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
        // 检查当前列和右侧列的下方卡片（因为卡片占据2列）
        const checkSlots = [slotIndex, slotIndex + 1];
        
        for (const checkSlot of checkSlots) {
          if (checkSlot >= 0 && checkSlot < 8) {
            const bottomSlotData = bottomZoneData.slots[checkSlot];
            if (bottomSlotData?.athleteCard) {
              const bottomCard = bottomSlotData.athleteCard;
              
              // 只使用顶部和底部的图标位置进行垂直匹配
              // 上方卡片的底部图标与下方卡片的顶部图标匹配
              // 注意：上方卡片的右侧底部图标应匹配下方卡片的左侧顶部图标
              const verticalPositionPairs = [
                { topPos: 'slot-bottomLeft', bottomPos: 'slot-topLeft', topSlot: slotIndex, bottomSlot: slotIndex },
                { topPos: 'slot-bottomRight', bottomPos: 'slot-topLeft', topSlot: slotIndex, bottomSlot: slotIndex + 1 }
              ];
              
              // 获取适合当前区域的战术图标结构（考虑旋转）
              const topCardTactics = RotationUtils.getTacticsForZone(card.tactics, card.rotatedTactics, zoneNum);
              const bottomCardTactics = RotationUtils.getTacticsForZone(bottomCard.tactics, bottomCard.rotatedTactics, bottomZone);
              
              // 检查每个位置对的匹配
              for (const pair of verticalPositionPairs) {
                // 确保图标能正确匹配
                if ((pair.topPos === 'slot-bottomLeft' && checkSlot === pair.bottomSlot) ||
                    (pair.topPos === 'slot-bottomRight' && checkSlot === pair.bottomSlot)) {
                  // 从tactics中检查对应位置的图标
                  let currentBottomIcon = null;
                  let bottomTopIcon = null;
                  
                  // 统一检查逻辑，不再区分AI和玩家半场
                  if (pair.topPos === 'slot-bottomLeft') {
                    currentBottomIcon = topCardTactics.left?.down ? { type: topCardTactics.left.down, position: pair.topPos } : null;
                  } else if (pair.topPos === 'slot-bottomRight') {
                    currentBottomIcon = topCardTactics.right?.down ? { type: topCardTactics.right.down, position: pair.topPos } : null;
                  }
                  
                  if (pair.bottomPos === 'slot-topLeft') {
                    bottomTopIcon = bottomCardTactics.left?.top ? { type: bottomCardTactics.left.top, position: pair.bottomPos } : null;
                  }
                  
                  if (currentBottomIcon && bottomTopIcon && currentBottomIcon.type === bottomTopIcon.type) {
                    // 使用更精确的去重键，包含具体位置
                    const pairKey = `v-${zoneNum}-${bottomZone}-${checkSlot}-${currentBottomIcon.type}-${pair.topPos}-${pair.bottomPos}`;
                    if (!processedPairs.has(pairKey)) {
                      processedPairs.add(pairKey);
                      
                      // 计算图标应该显示的位置：在两卡之间的中心，水平位置在对应列的中心
                      const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
                      const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
                      const centerX = checkSlot * CELL_WIDTH + CELL_WIDTH / 2;
                      const centerY = (zoneNum * CELL_HEIGHT + bottomZone * CELL_HEIGHT) / 2;
                      
                      // 创建完整图标
                      const completeIcon = {
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
                            slot: checkSlot,
                            position: bottomTopIcon.position,
                            card: bottomCard
                          }
                        ],
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
      }
    }
    
    // 检查上方相邻卡片
    const topZone = zoneNum - 1;
    
    if (topZone >= 0) {
      const topZoneData = this.fieldZones.find(z => z.zone === topZone);
      if (topZoneData) {
        // 检查当前列和右侧列的上方卡片（因为卡片占据2列）
        const checkSlots = [slotIndex, slotIndex + 1];
        
        for (const checkSlot of checkSlots) {
          if (checkSlot >= 0 && checkSlot < 8) {
            const topSlotData = topZoneData.slots[checkSlot];
            if (topSlotData?.athleteCard) {
              const topCard = topSlotData.athleteCard;
              
              // 只使用顶部和底部的图标位置进行垂直匹配
              // 下方卡片的顶部图标与上方卡片的底部图标匹配
              // 注意：下方卡片的左侧顶部图标应匹配上方卡片的右侧底部图标
              const verticalPositionPairs = [
                { bottomPos: 'slot-topLeft', topPos: 'slot-bottomLeft', bottomSlot: slotIndex, topSlot: checkSlot },
                { bottomPos: 'slot-topLeft', topPos: 'slot-bottomRight', bottomSlot: slotIndex, topSlot: checkSlot }
              ];
              
              // 获取适合当前区域的战术图标结构（考虑旋转）
              const currentCardTactics = RotationUtils.getTacticsForZone(card.tactics, card.rotatedTactics, zoneNum);
              const topCardTactics = RotationUtils.getTacticsForZone(topCard.tactics, topCard.rotatedTactics, topZone);
              
              for (const pair of verticalPositionPairs) {
                // 确保图标能正确匹配：
                // 1. 左侧顶部图标匹配上方卡片的左侧底部图标
                // 2. 左侧顶部图标匹配上方卡片的右侧底部图标（跨列匹配）
                if ((pair.bottomPos === 'slot-topLeft' && pair.topSlot === slotIndex) ||
                    (pair.bottomPos === 'slot-topLeft' && pair.topSlot === slotIndex - 1)) {
                  // 从tactics中检查对应位置的图标
                  let currentIcon = null;
                  let topIcon = null;
                  
                  // 统一检查逻辑，不再区分AI和玩家半场
                  if (pair.bottomPos === 'slot-topLeft') {
                    currentIcon = currentCardTactics.left?.top ? { type: currentCardTactics.left.top, position: pair.bottomPos } : null;
                  }
                  
                  if (pair.topPos === 'slot-bottomLeft') {
                    topIcon = topCardTactics.left?.down ? { type: topCardTactics.left.down, position: pair.topPos } : null;
                  } else if (pair.topPos === 'slot-bottomRight') {
                    topIcon = topCardTactics.right?.down ? { type: topCardTactics.right.down, position: pair.topPos } : null;
                  }
                  
                  if (currentIcon && topIcon && currentIcon.type === topIcon.type) {
                    // 使用更精确的去重键，包含具体位置
                    const pairKey = `v-${topZone}-${zoneNum}-${checkSlot}-${currentIcon.type}-${pair.bottomPos}-${pair.topPos}`;
                    if (!processedPairs.has(pairKey)) {
                      processedPairs.add(pairKey);
                      
                      // 计算图标应该显示的位置：在两卡之间的中心
                      const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
                      const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
                      const centerX = checkSlot * CELL_WIDTH + CELL_WIDTH / 2;
                      const centerY = (topZone * CELL_HEIGHT + zoneNum * CELL_HEIGHT) / 2;
                      
                      // 创建完整图标
                      const completeIcon = {
                        type: topIcon.type,
                        centerX,
                        centerY,
                        halfIcons: [
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
                        ],
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
      }
    }
  }

  private createHorizontalCompleteIcon(leftHalf: HalfIcon, rightHalf: HalfIcon): CompleteIcon {
    const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    
    // 计算图标位置为左边卡右侧列的中心位置
    // 例如：LWF在5-6列，CMF在6-7列，图标在6列的中心位置
    const iconColumn = leftHalf.slot + 1; // 左边卡的右侧列
    const centerX = iconColumn * CELL_WIDTH + CELL_WIDTH / 2;
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
      const centerY = (topHalf.zone * CELL_HEIGHT + bottomHalf.zone * CELL_HEIGHT) / 2 + CELL_HEIGHT / 2;
      
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
    if (topHalf.position.includes('Right') || bottomHalf.position.includes('Right')) {
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
    let centerX;
    if (topHalf.position.includes('Right') || bottomHalf.position.includes('Right')) {
      // 右侧图标：放在目标列的中心
      centerX = targetSlot * CELL_WIDTH + CELL_WIDTH / 2;
    } else {
      // 左侧图标：放在目标列的中心
      centerX = targetSlot * CELL_WIDTH + CELL_WIDTH / 2;
    }
    
    // 计算垂直中间位置（两张卡之间的中间）
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
