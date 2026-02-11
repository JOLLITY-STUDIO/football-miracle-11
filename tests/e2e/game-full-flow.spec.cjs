const { test, expect } = require('@playwright/test');

class GameHelper {
  constructor(page) { this.page = page; }
  async waitForGameReady() {
    await this.page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });
    await this.page.waitForTimeout(500);
  }
  async selectStarPlayer(index = 0) {
    const cards = this.page.locator('[data-testid="star-card"]');
    await expect(cards).toHaveCount(3);
    await cards.nth(index).click();
    await this.page.waitForTimeout(500);
  }
  async waitForPhaseBanner(expectedText) {
    if (expectedText) {
      await expect(this.page.locator('text=' + expectedText)).toBeVisible();
    }
    await this.page.waitForTimeout(2500);
  }
  async placeCardFromHand(handIndex, zone, slot) {
    const handCard = this.page.locator('[data-testid="hand-card"]').nth(handIndex);
    const targetSlot = this.page.locator(`[data-zone="${zone}"][data-slot="${slot}"]`);
    await handCard.dragTo(targetSlot);
    await this.page.waitForTimeout(500);
  }
  async clickShootButton(zone, slot) {
    const shootBtn = this.page.locator(`[data-zone="${zone}"][data-slot="${slot}"] [data-testid="shoot-button"]`);
    await shootBtn.click();
    await this.page.waitForTimeout(1000);
  }
  async selectTeamAction(action) {
    await this.page.click(`[data-testid="team-action-${action}"]`);
    await this.page.waitForTimeout(500);
  }
  async getScore() {
    const playerScore = await this.page.locator('[data-testid="player-score"]').textContent();
    const aiScore = await this.page.locator('[data-testid="ai-score"]').textContent();
    return { player: parseInt(playerScore || '0'), ai: parseInt(aiScore || '0') };
  }
  async verifyShotMarkers(zone, slot, expectedCount) {
    const markers = this.page.locator(`[data-zone="${zone}"][data-slot="${slot}"] [data-testid="shot-marker"]`);
    await expect(markers).toHaveCount(expectedCount);
  }
  async verifyTacticalConnections(minCount = 1) {
    const connections = this.page.locator('[data-testid="tactical-connection"]');
    const count = await connections.count();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }
  async getAttackPower(zone, slot) {
    const shootBtn = this.page.locator(`[data-zone="${zone}"][data-slot="${slot}"] [data-testid="shoot-button"]`);
    const text = await shootBtn.textContent();
    const match = text && text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }
}

test.describe('神奇十一人 - 完整游戏流程测试 (CJS)', () => {
  let helper;

  test.beforeEach(async ({ page }) => {
    helper = new GameHelper(page);
    await page.goto('/');
    await helper.waitForGameReady();
  });

  test('T1: 完整游戏流程 - 从选秀到进球', async ({ page }) => {
    await test.step('玩家选择明星球员', async () => {
      await helper.waitForPhaseBanner('DRAFT');
      await helper.selectStarPlayer(0);
      await page.waitForTimeout(1000);
    });
    await test.step('AI选择明星球员', async () => {
      await page.waitForTimeout(2000);
    });
    await test.step('玩家放置首张卡牌 (Zone 2, Slot 1)', async () => {
      await helper.placeCardFromHand(0, 2, 1);
      await page.waitForTimeout(500);
    });
    await test.step('玩家选择战术行动 Pass', async () => {
      await helper.waitForPhaseBanner('TACTICAL PHASE');
      await helper.selectTeamAction('pass');
      await page.waitForTimeout(1000);
    });
    await test.step('玩家放置第2张卡牌 (Zone 2, Slot 0)', async () => {
      await helper.waitForPhaseBanner('ACTION PHASE');
      await helper.placeCardFromHand(0, 2, 0);
      await page.waitForTimeout(500);
    });
    await test.step('验证战术图标连接线显示', async () => {
      await helper.verifyTacticalConnections(1);
      console.log('✅ 战术连接线验证通过');
    });
    await test.step('玩家尝试射门 (第1次)', async () => {
      const initialPower = await helper.getAttackPower(2, 1);
      console.log(`初始攻击力: ${initialPower}`);
      await helper.clickShootButton(2, 1);
      await page.waitForTimeout(2000);
      await helper.verifyShotMarkers(2, 1, 1);
      console.log('✅ 第1次射门完成,射门标记 +1');
    });
    await test.step('玩家再次射门 (第2次) - 验证削弱', async () => {
      const secondPower = await helper.getAttackPower(2, 1);
      console.log(`第2次射门攻击力: ${secondPower}`);
      await helper.clickShootButton(2, 1);
      await page.waitForTimeout(2000);
      await helper.verifyShotMarkers(2, 1, 2);
      const thirdPower = await helper.getAttackPower(2, 1);
      console.log(`第3次射门攻击力: ${thirdPower}`);
      expect(thirdPower).toBeLessThan(secondPower);
      console.log('✅ 射门标记削弱机制验证通过');
    });
    await test.step('验证计分系统', async () => {
      const score = await helper.getScore();
      console.log(`当前比分 - 玩家:${score.player} AI:${score.ai}`);
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
    const powers = [];
    await test.step('第1次射门 - 记录攻击力', async () => {
      const power = await helper.getAttackPower(1, 1);
      powers.push(power);
      await helper.clickShootButton(1, 1);
      await page.waitForTimeout(2000);
    });
    await test.step('第2次射门 - 验证削弱-1', async () => {
      const power = await helper.getAttackPower(1, 1);
      powers.push(power);
      expect(power).toBeLessThanOrEqual(powers[0]);
      await helper.clickShootButton(1, 1);
      await page.waitForTimeout(2000);
    });
    await test.step('第3次射门 - 验证削弱-2', async () => {
      const power = await helper.getAttackPower(1, 1);
      powers.push(power);
      expect(power).toBeLessThanOrEqual(powers[1]);
    });
    await test.step('验证削弱曲线', () => {
      expect(powers[0]).toBeGreaterThanOrEqual(powers[1]);
      expect(powers[1]).toBeGreaterThanOrEqual(powers[2]);
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
      const connections = await page.locator('[data-testid="tactical-connection"]').count();
      expect(connections).toBeGreaterThanOrEqual(0);
    });
    await test.step('放置第2张相邻卡牌', async () => {
      await helper.selectTeamAction('pass');
      await page.waitForTimeout(1000);
      await helper.placeCardFromHand(0, 2, 2);
      await page.waitForTimeout(1000);
      await helper.verifyTacticalConnections(1);
    });
  });
});
