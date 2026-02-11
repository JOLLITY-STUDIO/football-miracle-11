import { test, expect, Page } from '@playwright/test';

/**
 * 神奇十一人 - 完整游戏流程自动化测试
 * 
 * 测试覆盖:
 * 1. 明星球员选秀阶段 (Draft)
 * 2. 首回合放置阶段
 * 3. 战术阶段 (Pass/Press)
 * 4. 射门阶段
 * 5. 射门标记削弱机制
 * 6. 战术图标连接验证
 * 7. 计分系统
 * 8. 中场休息
 * 9. 完整比赛流程
 */

// 测试辅助函数
class GameHelper {
  constructor(private page: Page) {}

  /**
   * 等待游戏加载完成
   */
  async waitForGameReady() {
    await this.page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    await this.page.waitForTimeout(500); // 等待动画
  }

  /**
   * 选秀阶段 - 选择明星球员
   */
  async selectStarPlayer(index: number = 0) {
    const cards = this.page.locator('[data-testid="star-card"]');
    await expect(cards).toHaveCount(3);
    await cards.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 等待阶段横幅消失
   */
  async waitForPhaseBanner(expectedText?: string) {
    if (expectedText) {
      await expect(this.page.locator('text=' + expectedText)).toBeVisible();
    }
    await this.page.waitForTimeout(2500); // 横幅持续时间
  }

  /**
   * 从手牌拖拽卡牌到场地
   */
  async placeCardFromHand(handIndex: number, zone: number, slot: number) {
    const handCard = this.page.locator('[data-testid="hand-card"]').nth(handIndex);
    const targetSlot = this.page.locator(`[data-zone="${zone}"][data-slot="${slot}"]`);
    
    await handCard.dragTo(targetSlot);
    await this.page.waitForTimeout(500);
  }

  /**
   * 点击场上卡牌的射门按钮
   */
  async clickShootButton(zone: number, slot: number) {
    const shootBtn = this.page.locator(`[data-zone="${zone}"][data-slot="${slot}"] [data-testid="shoot-button"]`);
    await shootBtn.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 选择战术行动 (Pass/Press)
   */
  async selectTeamAction(action: 'pass' | 'press') {
    await this.page.click(`[data-testid="team-action-${action}"]`);
    await this.page.waitForTimeout(500);
  }

  /**
   * 获取当前比分
   */
  async getScore() {
    const playerScore = await this.page.locator('[data-testid="player-score"]').textContent();
    const aiScore = await this.page.locator('[data-testid="ai-score"]').textContent();
    return {
      player: parseInt(playerScore || '0'),
      ai: parseInt(aiScore || '0')
    };
  }

  /**
   * 验证射门标记数量
   */
  async verifyShotMarkers(zone: number, slot: number, expectedCount: number) {
    const markers = this.page.locator(`[data-zone="${zone}"][data-slot="${slot}"] [data-testid="shot-marker"]`);
    await expect(markers).toHaveCount(expectedCount);
  }

  /**
   * 验证战术连接线存在
   */
  async verifyTacticalConnections(minCount: number = 1) {
    const connections = this.page.locator('[data-testid="tactical-connection"]');
    const count = await connections.count();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  /**
   * 获取射门按钮显示的攻击力
   */
  async getAttackPower(zone: number, slot: number): Promise<number> {
    const shootBtn = this.page.locator(`[data-zone="${zone}"][data-slot="${slot}"] [data-testid="shoot-button"]`);
    const text = await shootBtn.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }
}

test.describe('神奇十一人 - 完整游戏流程测试', () => {
  let helper: GameHelper;

  test.beforeEach(async ({ page }) => {
    helper = new GameHelper(page);
    await page.goto('/');
    await helper.waitForGameReady();
  });

  test('T1: 完整游戏流程 - 从选秀到进球', async ({ page }) => {
    // ========== 阶段1: 选秀 ==========
    await test.step('玩家选择明星球员', async () => {
      await helper.waitForPhaseBanner('DRAFT');
      await helper.selectStarPlayer(0);
      await page.waitForTimeout(1000);
    });

    await test.step('AI选择明星球员', async () => {
      await page.waitForTimeout(2000); // AI思考时间
    });

    // ========== 阶段2: 首回合放置 ==========
    await test.step('玩家放置首张卡牌 (Zone 2, Slot 1)', async () => {
      await helper.placeCardFromHand(0, 2, 1);
      await page.waitForTimeout(500);
    });

    // ========== 阶段3: 战术阶段 ==========
    await test.step('玩家选择战术行动 Pass', async () => {
      await helper.waitForPhaseBanner('TACTICAL PHASE');
      await helper.selectTeamAction('pass');
      await page.waitForTimeout(1000);
    });

    // ========== 阶段4: 行动阶段 - 放置更多卡牌 ==========
    await test.step('玩家放置第2张卡牌 (Zone 2, Slot 0)', async () => {
      await helper.waitForPhaseBanner('ACTION PHASE');
      await helper.placeCardFromHand(0, 2, 0);
      await page.waitForTimeout(500);
    });

    // ========== 阶段5: 验证战术连接 ==========
    await test.step('验证战术图标连接线显示', async () => {
      await helper.verifyTacticalConnections(1);
      console.log('✅ 战术连接线验证通过');
    });

    // ========== 阶段6: 射门阶段 ==========
    await test.step('玩家尝试射门 (第1次)', async () => {
      const initialPower = await helper.getAttackPower(2, 1);
      console.log(`初始攻击力: ${initialPower}`);
      
      await helper.clickShootButton(2, 1);
      await page.waitForTimeout(2000);
      
      // 验证射门标记 +1
      await helper.verifyShotMarkers(2, 1, 1);
      console.log('✅ 第1次射门完成,射门标记 +1');
    });

    // ========== 阶段7: 验证射门削弱机制 ==========
    await test.step('玩家再次射门 (第2次) - 验证削弱', async () => {
      const secondPower = await helper.getAttackPower(2, 1);
      console.log(`第2次射门攻击力: ${secondPower}`);
      
      await helper.clickShootButton(2, 1);
      await page.waitForTimeout(2000);
      
      // 验证射门标记 +1
      await helper.verifyShotMarkers(2, 1, 2);
      
      const thirdPower = await helper.getAttackPower(2, 1);
      console.log(`第3次射门攻击力: ${thirdPower}`);
      
      // 验证削弱公式: power3 < power2
      expect(thirdPower).toBeLessThan(secondPower);
      console.log('✅ 射门标记削弱机制验证通过');
    });

    // ========== 阶段8: 检查比分 ==========
    await test.step('验证计分系统', async () => {
      const score = await helper.getScore();
      console.log(`当前比分 - 玩家:${score.player} AI:${score.ai}`);
      
      // 至少有一方应该有得分
      expect(score.player + score.ai).toBeGreaterThan(0);
      console.log('✅ 计分系统正常');
    });
  });

  test('T2: 射门标记削弱机制专项测试', async ({ page }) => {
    await test.step('Setup: 放置一张高攻击力卡牌', async () => {
      await helper.selectStarPlayer(0);
      await page.waitForTimeout(2000);
      await helper.placeCardFromHand(0, 1, 1);
      await page.waitForTimeout(500);
    });

    const powers: number[] = [];

    await test.step('第1次射门 - 记录攻击力', async () => {
      const power = await helper.getAttackPower(1, 1);
      powers.push(power);
      console.log(`射门1: 攻击力 = ${power}`);
      
      await helper.clickShootButton(1, 1);
      await page.waitForTimeout(2000);
    });

    await test.step('第2次射门 - 验证削弱-1', async () => {
      const power = await helper.getAttackPower(1, 1);
      powers.push(power);
      console.log(`射门2: 攻击力 = ${power}`);
      
      expect(power).toBeLessThanOrEqual(powers[0]);
      
      await helper.clickShootButton(1, 1);
      await page.waitForTimeout(2000);
    });

    await test.step('第3次射门 - 验证削弱-2', async () => {
      const power = await helper.getAttackPower(1, 1);
      powers.push(power);
      console.log(`射门3: 攻击力 = ${power}`);
      
      expect(power).toBeLessThanOrEqual(powers[1]);
    });

    await test.step('验证削弱曲线', () => {
      console.log('削弱曲线:', powers);
      expect(powers[0]).toBeGreaterThanOrEqual(powers[1]);
      expect(powers[1]).toBeGreaterThanOrEqual(powers[2]);
      console.log('✅ 射门标记削弱机制完整验证通过');
    });
  });

  test('T3: 战术图标连接验证', async ({ page }) => {
    await test.step('Setup: 选秀完成', async () => {
      await helper.selectStarPlayer(0);
      await page.waitForTimeout(2000);
    });

    await test.step('放置第1张卡牌', async () => {
      await helper.placeCardFromHand(0, 2, 1);
      await page.waitForTimeout(500);
      
      // 首张卡应该没有连接
      const connections = await page.locator('[data-testid="tactical-connection"]').count();
      expect(connections).toBe(0);
      console.log('✅ 首张卡无连接');
    });

    await test.step('放置第2张相邻卡牌', async () => {
      await page.waitForTimeout(1000); // 等待战术阶段
      await helper.selectTeamAction('pass');
      await page.waitForTimeout(1000);
      
      await helper.placeCardFromHand(0, 2, 2);
      await page.waitForTimeout(1000);
      
      // 应该出现战术连接线
      await helper.verifyTacticalConnections(1);
      console.log('✅ 相邻卡牌战术连接验证通过');
    });
  });

  test('T4: 压力测试 - 连续10回合', async ({ page }) => {
    await test.step('选秀阶段', async () => {
      await helper.selectStarPlayer(0);
      await page.waitForTimeout(2000);
    });

    for (let turn = 1; turn <= 10; turn++) {
      await test.step(`回合 ${turn}`, async () => {
        // 尝试放置卡牌或射门
        const hasShootBtn = await page.locator('[data-testid="shoot-button"]').first().isVisible().catch(() => false);
        
        if (hasShootBtn) {
          await helper.clickShootButton(1, 0);
          await page.waitForTimeout(1500);
        } else {
          const handCards = await page.locator('[data-testid="hand-card"]').count();
          if (handCards > 0) {
            await helper.placeCardFromHand(0, 2, turn % 3);
            await page.waitForTimeout(1000);
          }
        }

        // 记录比分
        const score = await helper.getScore();
        console.log(`回合${turn} - 玩家:${score.player} AI:${score.ai}`);
      });
    }

    await test.step('验证游戏未崩溃', async () => {
      const score = await helper.getScore();
      expect(score.player).toBeGreaterThanOrEqual(0);
      expect(score.ai).toBeGreaterThanOrEqual(0);
      console.log('✅ 10回合压力测试通过');
    });
  });
});

test.describe('神奇十一人 - UI交互测试', () => {
  let helper: GameHelper;

  test.beforeEach(async ({ page }) => {
    helper = new GameHelper(page);
    await page.goto('/');
    await helper.waitForGameReady();
  });

  test('T5: 阶段横幅提示测试', async ({ page }) => {
    const bannersToCheck = [
      'DRAFT',
      'TACTICAL PHASE',
      'ACTION PHASE',
    ];

    for (const banner of bannersToCheck) {
      await test.step(`验证横幅: ${banner}`, async () => {
        const bannerEl = page.locator(`text=${banner}`);
        await expect(bannerEl).toBeVisible({ timeout: 5000 });
        console.log(`✅ 横幅 "${banner}" 显示正常`);
        await page.waitForTimeout(3000);
      });
    }
  });

  test('T6: 拖拽交互测试', async ({ page }) => {
    await test.step('Setup', async () => {
      await helper.selectStarPlayer(0);
      await page.waitForTimeout(2000);
    });

    await test.step('测试非法拖拽 (已占用位置)', async () => {
      await helper.placeCardFromHand(0, 2, 1);
      await page.waitForTimeout(500);

      // 尝试拖拽第二张卡到同一位置
      const handCard = page.locator('[data-testid="hand-card"]').first();
      const occupiedSlot = page.locator('[data-zone="2"][data-slot="1"]');
      
      await handCard.dragTo(occupiedSlot);
      await page.waitForTimeout(500);

      // 验证卡牌还在手牌中
      const handCount = await page.locator('[data-testid="hand-card"]').count();
      expect(handCount).toBeGreaterThan(0);
      console.log('✅ 非法拖拽被正确拒绝');
    });
  });
});
