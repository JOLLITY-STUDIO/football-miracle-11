import type { Tactics } from '../data/cards';

export class RotationUtils {
  /**
   * 生成旋转180度后的战术图标结构
   * 用于AI卡片，因为AI卡片在场上是水平旋转180度的
   */
  public static generateRotatedTactics(tactics: Tactics): Tactics {
    return {
      left: {
        left: tactics.right?.right,
        top: tactics.right?.down,
        down: tactics.right?.top
      },
      right: {
        top: tactics.left?.down,
        down: tactics.left?.top,
        right: tactics.left?.left
      }
    };
  }

  /**
   * 根据区域获取正确的战术图标结构
   * AI半场（zone < 4）使用旋转后的战术图标
   * 玩家半场（zone >= 4）使用原始战术图标
   */
  public static getTacticsForZone(tactics: Tactics, rotatedTactics: Tactics, zoneNum: number): Tactics {
    return zoneNum < 4 ? rotatedTactics : tactics;
  }
}
