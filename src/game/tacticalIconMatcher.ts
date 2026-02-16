import type { FieldZone } from '../types/game';
import type { AthleteCard, TacticalIcon, IconPosition, IconWithPosition } from '../data/cards';

/**
 * 表示一个半圆图标的位置和类型
 */
interface HalfIcon {
  type: TacticalIcon;
  zone: number;
  slot: number;
  position: IconPosition;
  card: AthleteCard;
}

/**
 * 表示一个完整的拼合图标
 */
interface CompleteIcon {
  type: TacticalIcon;
  centerX: number;
  centerY: number;
  leftHalf: HalfIcon;
  rightHalf: HalfIcon;
}

/**
 * 战术图标拼合器
 * 负责检测相邻卡片的半圆图标是否能拼合成完整图标
 */
export class TacticalIconMatcher {
  private fieldZones: FieldZone[];
  private completeIcons: CompleteIcon[] = [];

  constructor(fieldZones: FieldZone[]) {
    this.fieldZones = fieldZones;
    this.analyzeField();
  }

  /**
   * 分析整个场地，找出所有可以拼合的完整图标
   */
  private analyzeField(): void {
    this.completeIcons = [];
    
    // 确定用户半场的区域范围
    // 检查fieldZones中是否包含zone 4-7（主场队）或 zone 0-3（客场队）
    const hasUpperHalf = this.fieldZones.some(z => z.zone >= 4);
    const hasLowerHalf = this.fieldZones.some(z => z.zone < 4);
    
    // 遍历所有区域和位置
    for (let zoneIndex = 0; zoneIndex < this.fieldZones.length; zoneIndex++) {
      const zone = this.fieldZones[zoneIndex];
      if (!zone) continue;
      
      // 只分析用户自己的半场
      // 如果有zone 4-7，则只分析zone 4-7（主场队）
      // 如果有zone 0-3，则只分析zone 0-3（客场队）
      if (hasUpperHalf && zone.zone < 4) continue;
      if (hasLowerHalf && zone.zone >= 4) continue;
      
      for (let slotIndex = 0; slotIndex < zone.slots.length; slotIndex++) {
        const slot = zone.slots[slotIndex];
        if (!slot) continue;
        
        if (slot.athleteCard) {
          // 检查这张卡的所有图标位置
          this.checkCardForMatches(slot.athleteCard, zone.zone, slotIndex);
        }
      }
    }
  }

  /**
   * 检查一张卡片的图标是否能与相邻卡片拼合
   */
  private checkCardForMatches(card: AthleteCard, zoneNum: number, slotIndex: number): void {
    card.iconPositions.forEach((iconPos: IconWithPosition) => {
      // 检查右侧的半圆图标，寻找左半圆匹配
      if (this.isRightHalfIcon(iconPos.position)) {
        const adjacentLeftHalf = this.findAdjacentLeftHalf(
          iconPos.type,
          iconPos.position,
          zoneNum,
          slotIndex
        );

        if (adjacentLeftHalf) {
          // 找到匹配的左半圆，创建完整图标
          const completeIcon = this.createCompleteIcon(
            adjacentLeftHalf,
            {
              type: iconPos.type,
              zone: zoneNum,
              slot: slotIndex,
              position: iconPos.position,
              card
            }
          );

          this.completeIcons.push(completeIcon);
        }
      }
      
      // 检查下方的半圆图标，寻找上半圆匹配
      if (this.isBottomHalfIcon(iconPos.position)) {
        const adjacentTopHalf = this.findAdjacentTopHalf(
          iconPos.type,
          iconPos.position,
          zoneNum,
          slotIndex
        );

        if (adjacentTopHalf) {
          // 找到匹配的上半圆，创建完整图标
          const completeIcon = this.createVerticalCompleteIcon(
            adjacentTopHalf,
            {
              type: iconPos.type,
              zone: zoneNum,
              slot: slotIndex,
              position: iconPos.position,
              card
            }
          );

          this.completeIcons.push(completeIcon);
        }
      }
    });
  }

  /**
   * 判断是否为右侧半圆图标
   */
  private isRightHalfIcon(position: IconPosition): boolean {
    return position.includes('Right');
  }

  /**
   * 判断是否为左侧半圆图标
   */
  private isLeftHalfIcon(position: IconPosition): boolean {
    return position.includes('Left');
  }

  /**
   * 判断是否为下方半圆图标
   */
  private isBottomHalfIcon(position: IconPosition): boolean {
    return position.includes('bottom');
  }

  /**
   * 判断是否为上方半圆图标
   */
  private isTopHalfIcon(position: IconPosition): boolean {
    return position.includes('top');
  }

  /**
   * 获取对应的左侧位置
   */
  private getCorrespondingLeftPosition(rightPosition: IconPosition): IconPosition {
    switch (rightPosition) {
      case 'slot-topRight':
        return 'slot-topLeft';
      case 'slot-middleRight':
        return 'slot-middleLeft';
      case 'slot-bottomRight':
        return 'slot-bottomLeft';
      default:
        throw new Error(`Invalid right position: ${rightPosition}`);
    }
  }

  /**
   * 获取对应的上方位置
   */
  private getCorrespondingTopPosition(bottomPosition: IconPosition): IconPosition {
    switch (bottomPosition) {
      case 'slot-bottomLeft':
        return 'slot-topLeft';
      case 'slot-bottomRight':
        return 'slot-topRight';
      default:
        throw new Error(`Invalid bottom position: ${bottomPosition}`);
    }
  }

  /**
   * 查找相邻的左半圆图标
   */
  private findAdjacentLeftHalf(
    iconType: TacticalIcon,
    rightPosition: IconPosition,
    zoneNum: number,
    slotIndex: number
  ): HalfIcon | null {
    const correspondingLeftPosition = this.getCorrespondingLeftPosition(rightPosition);
    
    // 确定用户半场的区域范围
    const hasUpperHalf = this.fieldZones.some(z => z.zone >= 4);
    const hasLowerHalf = this.fieldZones.some(z => z.zone < 4);
    
    // 检查相邻位置（左侧、上方、下方）
    const adjacentPositions = this.getAdjacentPositions(zoneNum, slotIndex);
    
    for (const { zone: adjZone, slot: adjSlot } of adjacentPositions) {
      // 只在用户自己的半场内查找
      if (hasUpperHalf && adjZone < 4) continue;
      if (hasLowerHalf && adjZone >= 4) continue;
      
      const adjacentZone = this.fieldZones.find(z => z.zone === adjZone);
      if (!adjacentZone) continue;

      const adjacentSlotData = adjacentZone.slots[adjSlot];
      if (!adjacentSlotData?.athleteCard) continue;

      const card = adjacentSlotData.athleteCard;
      
      // 检查这张卡是否有对应的左半圆图标
      const matchingIcon = card.iconPositions.find(
        (iconPos: IconWithPosition) => iconPos.type === iconType && iconPos.position === correspondingLeftPosition
      );

      if (matchingIcon) {
        return {
          type: iconType,
          zone: adjZone,
          slot: adjSlot,
          position: correspondingLeftPosition,
          card
        };
      }
    }

    return null;
  }

  /**
   * 查找相邻的上半圆图标
   */
  private findAdjacentTopHalf(
    iconType: TacticalIcon,
    bottomPosition: IconPosition,
    zoneNum: number,
    slotIndex: number
  ): HalfIcon | null {
    const correspondingTopPosition = this.getCorrespondingTopPosition(bottomPosition);
    
    // 确定用户半场的区域范围
    const hasUpperHalf = this.fieldZones.some(z => z.zone >= 4);
    const hasLowerHalf = this.fieldZones.some(z => z.zone < 4);
    
    // 检查相邻位置（上方）
    const adjacentPositions = this.getAdjacentPositions(zoneNum, slotIndex);
    
    for (const { zone: adjZone, slot: adjSlot } of adjacentPositions) {
      // 只检查上方位置
      if (adjZone >= zoneNum) continue;
      
      // 只在用户自己的半场内查找
      if (hasUpperHalf && adjZone < 4) continue;
      if (hasLowerHalf && adjZone >= 4) continue;
      
      const adjacentZone = this.fieldZones.find(z => z.zone === adjZone);
      if (!adjacentZone) continue;

      const adjacentSlotData = adjacentZone.slots[adjSlot];
      if (!adjacentSlotData?.athleteCard) continue;

      const card = adjacentSlotData.athleteCard;
      
      // 检查这张卡是否有对应的上半圆图标
      const matchingIcon = card.iconPositions.find(
        (iconPos: IconWithPosition) => iconPos.type === iconType && iconPos.position === correspondingTopPosition
      );

      if (matchingIcon) {
        return {
          type: iconType,
          zone: adjZone,
          slot: adjSlot,
          position: correspondingTopPosition,
          card
        };
      }
    }

    return null;
  }

  /**
   * 获取相邻位置
   */
  private getAdjacentPositions(zoneNum: number, slotIndex: number): Array<{zone: number, slot: number}> {
    const adjacent = [];
    
    // 左侧位置
    if (slotIndex > 0) {
      adjacent.push({ zone: zoneNum, slot: slotIndex - 1 });
    }
    
    // 上方位置
    if (zoneNum > 0) {
      adjacent.push({ zone: zoneNum - 1, slot: slotIndex });
    }
    
    // 下方位置
    if (zoneNum < 7) { // 假设最大区域是7
      adjacent.push({ zone: zoneNum + 1, slot: slotIndex });
    }
    
    return adjacent;
  }

  /**
   * 创建水平方向的完整图标（左右半圆拼合）
   */
  private createCompleteIcon(leftHalf: HalfIcon, rightHalf: HalfIcon): CompleteIcon {
    // 计算两个半圆图标之间的中心位置
    const centerX = this.calculateCenterX(leftHalf, rightHalf);
    const centerY = this.calculateCenterY(leftHalf, rightHalf);

    return {
      type: leftHalf.type,
      centerX,
      centerY,
      leftHalf,
      rightHalf
    };
  }

  /**
   * 创建垂直方向的完整图标（上下半圆拼合）
   */
  private createVerticalCompleteIcon(topHalf: HalfIcon, bottomHalf: HalfIcon): CompleteIcon {
    // 计算两个半圆图标之间的中心位置
    const centerX = this.calculateVerticalCenterX(topHalf, bottomHalf);
    const centerY = this.calculateVerticalCenterY(topHalf, bottomHalf);

    return {
      type: topHalf.type,
      centerX,
      centerY,
      leftHalf: topHalf, // 使用leftHalf和rightHalf字段来存储上下半圆
      rightHalf: bottomHalf
    };
  }

  /**
   * 计算水平方向完整图标的中心X坐标
   */
  private calculateCenterX(leftHalf: HalfIcon, rightHalf: HalfIcon): number {
    const CELL_WIDTH = 99;
    
    // 根据左右半圆的实际位置计算中心点
    // 左半圆在卡片左侧，右半圆在卡片右侧
    const leftX = leftHalf.slot * CELL_WIDTH + CELL_WIDTH * 0.75; // 左半圆在卡片右侧边缘
    const rightX = rightHalf.slot * CELL_WIDTH + CELL_WIDTH * 0.25; // 右半圆在卡片左侧边缘
    
    return (leftX + rightX) / 2;
  }

  /**
   * 计算水平方向完整图标的中心Y坐标
   */
  private calculateCenterY(leftHalf: HalfIcon, rightHalf: HalfIcon): number {
    const CELL_HEIGHT = 130;
    
    // 根据图标在卡片中的垂直位置计算Y坐标
    const getVerticalOffset = (position: IconPosition): number => {
      if (position.includes('top')) return CELL_HEIGHT * 0.25;
      if (position.includes('middle')) return CELL_HEIGHT * 0.5;
      if (position.includes('bottom')) return CELL_HEIGHT * 0.75;
      return CELL_HEIGHT * 0.5;
    };

    // 使用左半圆或右半圆的垂直位置作为完整图标的垂直位置
    // 因为两个半圆应该在同一垂直位置
    const verticalOffset = getVerticalOffset(leftHalf.position);
    const centerY = leftHalf.zone * CELL_HEIGHT + verticalOffset;
    
    return centerY;
  }

  /**
   * 计算垂直方向完整图标的中心X坐标
   */
  private calculateVerticalCenterX(topHalf: HalfIcon, bottomHalf: HalfIcon): number {
    const CELL_WIDTH = 99;
    
    // 上下半圆在同一列，使用相同的X坐标
    // 根据半圆在卡片中的水平位置计算X坐标
    const getHorizontalOffset = (position: IconPosition): number => {
      if (position.includes('Left')) return CELL_WIDTH * 0.25;
      if (position.includes('Right')) return CELL_WIDTH * 0.75;
      return CELL_WIDTH * 0.5;
    };

    const horizontalOffset = getHorizontalOffset(topHalf.position);
    const centerX = topHalf.slot * CELL_WIDTH + horizontalOffset;
    
    return centerX;
  }

  /**
   * 计算垂直方向完整图标的中心Y坐标
   */
  private calculateVerticalCenterY(topHalf: HalfIcon, bottomHalf: HalfIcon): number {
    const CELL_HEIGHT = 130;
    
    // 根据上下半圆的实际位置计算中心点
    // 上半圆在卡片顶部，下半圆在卡片底部
    const topY = topHalf.zone * CELL_HEIGHT + CELL_HEIGHT * 0.75; // 上半圆在卡片底部边缘
    const bottomY = bottomHalf.zone * CELL_HEIGHT + CELL_HEIGHT * 0.25; // 下半圆在卡片顶部边缘
    
    return (topY + bottomY) / 2;
  }

  /**
   * 获取所有完整图标
   */
  public getCompleteIcons(): CompleteIcon[] {
    return this.completeIcons;
  }

  /**
   * 按类型统计完整图标数量
   */
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

  /**
   * 获取特定类型的完整图标
   */
  public getIconsByType(type: TacticalIcon): CompleteIcon[] {
    return this.completeIcons.filter(icon => icon.type === type);
  }
}