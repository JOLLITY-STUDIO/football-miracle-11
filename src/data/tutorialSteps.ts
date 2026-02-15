export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: { x: number; y: number };
  highlight?: boolean;
  action?: () => void;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '欢迎来到神奇十一人！',
    description: '这是一个足球策略卡牌游戏。你将扮演教练，通过合理的战术安排和球员调度来赢得比赛。让我们开始学习基本操作。',
    action: () => {
      console.log('Welcome tutorial step');
    }
  },
  {
    id: 'card-selection',
    title: '选择你的第一张卡牌',
    description: '点击手牌区域中的卡片来选择它。被选中的卡片会有放大和阴影效果。',
    targetElement: 'hand-card',
    highlight: true,
    position: { x: 50, y: 80 }
  },
  {
    id: 'field-placement',
    title: '放置卡牌到场地',
    description: '选择卡片后，点击绿色高亮的有效位置来放置卡片。这些位置表示你可以放置卡牌的区域。',
    targetElement: 'game-field',
    highlight: true,
    position: { x: 50, y: 50 }
  },
  {
    id: 'team-actions',
    title: '执行战术动作',
    description: '在行动阶段，你可以选择"Pass"（传球）或"Press"（压迫）来执行团队战术。这些动作会影响比赛进程。',
    targetElement: 'team-action-buttons',
    highlight: true,
    position: { x: 80, y: 20 }
  },
  {
    id: 'attack-action',
    title: '进行射门',
    description: '拥有攻击图标的卡片可以进行射门。点击卡片下方的射门按钮来执行攻击动作。',
    targetElement: 'shoot-button',
    highlight: true,
    position: { x: 60, y: 90 }
  },
  {
    id: 'game-phases',
    title: '了解游戏阶段',
    description: '游戏分为多个阶段：设置阶段、行动阶段、战斗阶段和结束阶段。每个阶段有不同的操作和目标。',
    highlight: false,
    position: { x: 50, y: 50 }
  }
];