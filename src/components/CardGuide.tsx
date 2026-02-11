import React, { useState } from 'react';
import { playerCards, synergyCards, penaltyCards } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';
import { SynergyCardComponent } from './SynergyCard';

interface Props {
  onBack: () => void;
}

type TabType = 'overview' | 'cards' | 'icons' | 'effects' | 'rules';

export const CardGuide: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const baseCards = playerCards.filter(c => !c.isStar);
  const starCards = playerCards.filter(c => c.isStar);

  const attackCards = synergyCards.filter(c => c.type === 'attack');
  const defenseCards = synergyCards.filter(c => c.type === 'defense');
  const specialCards = synergyCards.filter(c => c.type === 'special');
  const tackleCards = synergyCards.filter(c => c.type === 'tackle');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📖' },
    { id: 'cards' as TabType, label: 'Card Collection', icon: '🎴' },
    { id: 'icons' as TabType, label: 'Tactical Icons', icon: '⚡' },
    { id: 'effects' as TabType, label: 'Immediate Effects', icon: '✨' },
    { id: 'rules' as TabType, label: 'Game Rules', icon: '📋' },
    { id: 'manual_cn' as TabType, label: 'Rulebook (CN)', icon: '🇨🇳' },
    { id: 'manual_jp' as TabType, label: 'Rulebook (JP)', icon: '🇯🇵' },
    { id: 'expansions' as TabType, label: 'Expansions', icon: '📦' },
  ];

  const rulePagesCN = Array.from({ length: 9 }, (_, i) => `images/rules/page_${i + 1}.webp`);
  const rulePagesJP = Array.from({ length: 16 }, (_, i) => `images/rules_jp/page_${i + 1}.png`);
  const gkExpansionImages = ['images/gk_expansion_1.webp', 'images/gk_expansion_2.webp'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">📚 Game Guide</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
          >
            ← Back to Menu
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-stone-900 font-bold'
                  : 'bg-stone-700 hover:bg-stone-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">🎮 Introduction</h2>
              <div className="text-stone-300 space-y-3">
                <p>Magic Eleven is a football card battle game where players compete by placing player cards and using synergy cards for offensive and defensive plays.</p>
                <p>The core gameplay revolves around "Control" - the control state determines how many synergy cards you can use to enhance your attacks.</p>
              </div>
            </section>

            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">📊 Card Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-stone-700/50 rounded-lg p-4 text-center">
                  <div className="text-4xl font-bold text-green-400">{playerCards.length}</div>
                  <div className="text-stone-400">Player Cards</div>
                </div>
                <div className="bg-stone-700/50 rounded-lg p-4 text-center">
                  <div className="text-4xl font-bold text-blue-400">{synergyCards.length}</div>
                  <div className="text-stone-400">Synergy Cards</div>
                </div>
                <div className="bg-stone-700/50 rounded-lg p-4 text-center">
                  <div className="text-4xl font-bold text-orange-400">{penaltyCards.length}</div>
                  <div className="text-stone-400">Penalty Cards</div>
                </div>
                <div className="bg-stone-700/50 rounded-lg p-4 text-center">
                  <div className="text-4xl font-bold text-purple-400">{starCards.length}</div>
                  <div className="text-stone-400">Star Players</div>
                </div>
              </div>
            </section>

            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">🎯 Game Objective</h2>
              <div className="text-stone-300 space-y-2">
                <p>• Score more goals than your opponent by shooting</p>
                <p>• Place players strategically to create synergy effects</p>
                <p>• Use synergy cards to enhance attack and defense</p>
                <p>• Control the field, seize attack opportunities</p>
              </div>
            </section>

            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">⚡ Quick Start</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-stone-900">1</div>
                  <div>
                    <h3 className="font-semibold text-yellow-300">Place Players</h3>
                    <p className="text-sm text-stone-400">Select players from hand to place on field, mind position limits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-stone-900">2</div>
                  <div>
                    <h3 className="font-semibold text-yellow-300">Organize Attack</h3>
                    <p className="text-sm text-stone-400">Draw synergy cards via team actions to prepare for attacks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-stone-900">3</div>
                  <div>
                    <h3 className="font-semibold text-yellow-300">Launch Attack</h3>
                    <p className="text-sm text-stone-400">Select players with attack icons to shoot</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-stone-900">4</div>
                  <div>
                    <h3 className="font-semibold text-yellow-300">Score Determination</h3>
                    <p className="text-sm text-stone-400">Compare attack vs defense - score if attack &gt; defense and &lt;= 11</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="space-y-8">
            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">⚽ Player Cards</h2>
              
              <div className="mb-6 bg-stone-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">Card Description</h3>
                <ul className="text-sm text-stone-300 space-y-1">
                  <li>• <span className="text-red-400">Forwards</span>: Main scorers, place on Front and Second lines</li>
                  <li>• <span className="text-green-400">Midfielders</span>: Playmakers, place on Second and Third lines</li>
                  <li>• <span className="text-blue-400">Defenders</span>: Main defenders, place on Third and Last lines</li>
                  <li>• Each card takes 2 slots, 6 half-icons to combine with neighbors</li>
                  <li>• Some players have Immediate Effects that trigger when placed</li>
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">Basic Player Cards ({baseCards.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {baseCards.map((card, i) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <PlayerCardComponent card={card} />
                      <span className="text-xs text-stone-400 mt-1">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">Star Player Cards ({starCards.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {starCards.map((card, i) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <PlayerCardComponent card={card} />
                      <span className="text-xs text-yellow-400 mt-1">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">🤝 Synergy Cards</h2>
              
              <div className="mb-6 bg-stone-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">Card Description</h3>
                <ul className="text-sm text-stone-300 space-y-1">
                  <li>• <span className="text-red-400">Attack Cards</span>: Increase attack power</li>
                  <li>• <span className="text-blue-400">Defense Cards</span>: Increase defense power</li>
                  <li>• <span className="text-yellow-400">Control Cards</span>: Move control marker</li>
                  <li>• <span className="text-purple-400">Tackle Cards</span>: Cancel attack, win penalty (defense only)</li>
                  <li>• Higher stars = bigger bonuses</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">Attack Synergy Cards ({attackCards.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {attackCards.map((card, i) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <SynergyCardComponent card={card} />
                      <span className="text-xs text-stone-400 mt-1">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Defense Synergy Cards ({defenseCards.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {defenseCards.map((card, i) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <SynergyCardComponent card={card} />
                      <span className="text-xs text-stone-400 mt-1">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Control Synergy Cards ({specialCards.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {specialCards.map((card, i) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <SynergyCardComponent card={card} />
                      <span className="text-xs text-stone-400 mt-1">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Tackle Cards ({tackleCards.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {tackleCards.map((card, i) => (
                    <div key={card.id} className="flex flex-col items-center">
                      <SynergyCardComponent card={card} />
                      <span className="text-xs text-stone-400 mt-1">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">🎯 Penalty Cards</h2>
              
              <div className="mb-4 bg-stone-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">Card Description</h3>
                <ul className="text-sm text-stone-300 space-y-1">
                  <li>• Penalty cards determine if a penalty is scored</li>
                  <li>• Higher points = higher success rate</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {penaltyCards.map((card, i) => (
                  <div key={card.id} className="bg-stone-700/50 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2"></div>
                    <div className="font-bold text-yellow-400">{card.name}</div>
                    <div className="text-sm text-stone-400">+{card.points} pts</div>
                    <span className="text-xs text-stone-500">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'icons' && (
          <div className="space-y-6">
            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-orange-400 mb-4"> Tactical Icons</h2>
              <p className="text-stone-400 mb-6">Tactical icons are core player abilities. Combine half-icons with adjacent players to create synergy effects.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-stone-700/50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl"></div>
                    <div>
                      <h3 className="text-xl font-bold text-red-400">Attack</h3>
                    </div>
                  </div>
                  <p className="text-stone-300">Increases attack power when shooting, key to scoring goals</p>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl"></div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-400">Defense</h3>
                    </div>
                  </div>
                  <p className="text-stone-300">Increases base defense power, prevents opponent from scoring</p>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl"></div>
                    <div>
                      <h3 className="text-xl font-bold text-green-400">Pass</h3>
                    </div>
                  </div>
                  <p className="text-stone-300">Combines with adjacent players to create synergy, enhancing teamwork</p>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl"></div>
                    <div>
                      <h3 className="text-xl font-bold text-orange-400">Press</h3>
                    </div>
                  </div>
                  <p className="text-stone-300">Enhances team pressing ability, limits opponent's play</p>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl"></div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-400">Breakthrough</h3>
                    </div>
                  </div>
                  <p className="text-stone-300">Reduces opponent's base defense when shooting, easier to break through</p>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl"></div>
                    <div>
                      <h3 className="text-xl font-bold text-pink-400">Breakthrough All</h3>
                    </div>
                  </div>
                  <p className="text-stone-300">Ignores all opponent defense when shooting, face goalkeeper directly</p>
                </div>
              </div>
            </section>

            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4"> Synergy System</h2>
              <div className="text-stone-300 space-y-4">
                <p>Each player card is divided into left and right halves, with 3 half-icon positions per half:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><span className="text-yellow-400">Top Left/Right</span>: Combines with player above</li>
                  <li><span className="text-yellow-400">Middle Left/Right</span>: Combines with adjacent player on same line</li>
                  <li><span className="text-yellow-400">Bottom Left/Right</span>: Combines with player below</li>
                </ul>
                <p>Complete icons formed by 2 adjacent players take effect!</p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-6">
            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-4"> Immediate Effects</h2>
              <p className="text-stone-400 mb-6">Some player cards have Immediate Effects that trigger once when placed.</p>
              
              <div className="space-y-4">
                <div className="bg-stone-700/50 rounded-lg p-4 flex items-start gap-4">
                  <div className="text-3xl"></div>
                  <div>
                    <h3 className="font-bold text-yellow-400">Control +1</h3>
                    <p className="text-stone-300">Move control marker 1 towards opponent</p>
                    <p className="text-sm text-stone-500">Good for controlling game tempo</p>
                  </div>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-4 flex items-start gap-4">
                  <div className="text-3xl"></div>
                  <div>
                    <h3 className="font-bold text-yellow-400">Control +2</h3>
                    <p className="text-stone-300">Move control marker 2 towards opponent</p>
                    <p className="text-sm text-stone-500">Powerful effect to quickly change field state</p>
                  </div>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-4 flex items-start gap-4">
                  <div className="text-3xl"></div>
                  <div>
                    <h3 className="font-bold text-yellow-400">Draw Synergy +1</h3>
                    <p className="text-stone-300">Draw 1 synergy card</p>
                    <p className="text-sm text-stone-500">Replenish hand resources</p>
                  </div>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-4 flex items-start gap-4">
                  <div className="text-3xl"></div>
                  <div>
                    <h3 className="font-bold text-yellow-400">Draw 2 Choose 1</h3>
                    <p className="text-stone-300">Draw 2 synergy cards, keep 1, discard 1</p>
                    <p className="text-sm text-stone-500">Selectively acquire needed synergy cards</p>
                  </div>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-4 flex items-start gap-4">
                  <div className="text-3xl"></div>
                  <div>
                    <h3 className="font-bold text-yellow-400">Steal Synergy</h3>
                    <p className="text-stone-300">Draw 1 synergy card from opponent and discard it</p>
                    <p className="text-sm text-stone-500">Disrupt opponent's tactics</p>
                  </div>
                </div>

                <div className="bg-stone-700/50 rounded-lg p-4 flex items-start gap-4">
                  <div className="text-3xl"></div>
                  <div>
                    <h3 className="font-bold text-yellow-400">Instant Shot</h3>
                    <p className="text-stone-300">Use this card to attempt a shot, ignoring base defense</p>
                    <p className="text-sm text-stone-500">Surprise attack method</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-stone-700/50 rounded-lg p-4">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4"> Tips</h2>
                <div className="text-stone-300 space-y-2">
                  <p>• Immediate Effects can be triggered or skipped</p>
                  <p>• Use "Steal Synergy" to disrupt opponent</p>
                  <p>• "Instant Shot" is effective when opponent defense is solid</p>
                  <p>• "Control +2" quickly changes offense/defense status</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6">
            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">📜 游戏规则 (Game Rules)</h2>
              
              <div className="space-y-8 text-stone-300">
                {/* 1. Basic Info */}
                <div className="bg-stone-700/30 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-white mb-2">一、游戏基本信息</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><span className="text-yellow-400">玩家人数</span>：2人</li>
                    <li><span className="text-yellow-400">游戏时长</span>：约30分钟</li>
                    <li><span className="text-yellow-400">类型</span>：抽象足球战术卡牌桌游</li>
                  </ul>
                </div>

                {/* 3. Setup */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">二、游戏设置</h3>
                  <div className="space-y-4">
                    <div className="bg-stone-700/30 rounded-lg p-4">
                      <h4 className="font-bold text-green-400 mb-1">1. 签约明星球员</h4>
                      <p className="text-sm">每位玩家轮流从随机翻出的明星球员中挑选，直到每队拥有3名明星球员。</p>
                    </div>
                    <div className="bg-stone-700/30 rounded-lg p-4">
                      <h4 className="font-bold text-green-400 mb-1">2. 阵容设置</h4>
                      <p className="text-sm">每队13名球员（含3名明星），挑选10名首发，3名替补。</p>
                    </div>
                  </div>
                </div>

                {/* 5. Game Flow */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">三、游戏流程</h3>
                  <p className="mb-4 text-sm">游戏分上下半场。每回合包含两个阶段：<span className="text-yellow-400 font-bold">球队行动</span> → <span className="text-yellow-400 font-bold">球员行动</span>。</p>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4 bg-stone-700/20 p-2 rounded-r">
                      <h4 className="font-bold text-blue-400 mb-2">阶段1：球队行动 (Team Action)</h4>
                      <p className="text-sm mb-2">计算场上完整的图标，选择一项执行：</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><span className="text-white font-bold">传球 (➕)</span>：抽取协同卡（数量 = 场上 ➕ 图标数，手牌上限5张）。</li>
                        <li><span className="text-white font-bold">压迫 (⬆️)</span>：移动控制标记（步数 = 场上 ⬆️ 图标数）。</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 pl-4 bg-stone-700/20 p-2 rounded-r">
                      <h4 className="font-bold text-red-400 mb-2">阶段2：球员行动 (Player Action)</h4>
                      <p className="text-sm mb-2">必须选择一项执行：</p>
                      
                      <div className="space-y-3 mt-2">
                        <div>
                          <span className="font-bold text-white block">A. 组织进攻 (Place Player)</span>
                          <span className="text-xs text-stone-400">打出一张球员卡到场上。</span>
                          <ul className="list-decimal list-inside text-xs mt-1 text-stone-400 pl-2">
                            <li>放置卡牌：必须符合位置线要求（前锋/中场/后卫）。</li>
                            <li>即时效果：若卡牌有 ⚡ 符号，立即结算一次效果。</li>
                            <li>尝试射门：若卡牌有 ⚽ 图标，可立即尝试射门。</li>
                          </ul>
                        </div>
                        
                        <div>
                          <span className="font-bold text-white block">B. 直接进攻 (Direct Attack)</span>
                          <span className="text-xs text-stone-400">选择场上已有的一张带 ⚽ 图标的卡牌进行射门。</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shooting & Scoring */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">四、射门与进球判定</h3>
                  <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-bold text-red-400 mb-1">进攻方 (Attack)</h4>
                        <p className="text-sm">总攻击力 = 基础攻击(⚽) + 协同卡加成(⭐)</p>
                        <p className="text-xs text-stone-500 mt-1">*最多使用3张协同卡（受控制状态限制）</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-400 mb-1">防守方 (Defense)</h4>
                        <p className="text-sm">总防御力 = 基础防御(🛡️) + 协同卡加成(⭐)</p>
                        <p className="text-xs text-stone-500 mt-1">*最多使用2张协同卡</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-stone-700">
                      <h4 className="font-bold text-yellow-400 mb-2 text-center">进球判定公式</h4>
                      <div className="text-center bg-black/30 p-2 rounded text-sm font-mono">
                        (攻击力 &gt; 防御力) AND (攻击力 ≤ 11) = ⚽ 进球！
                      </div>
                      <div className="mt-2 text-xs text-center text-stone-400">
                        <span className="text-purple-400 font-bold">Magic Number 11</span>: 必定进球！<br/>
                        <span className="text-red-400 font-bold">12+</span>: 出界球 (Miss)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Rules */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">五、特殊规则</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-stone-700/30 p-3 rounded">
                      <span className="font-bold text-yellow-200 block mb-1">🔄 换人</span>
                      <span className="text-xs">每场最多3次。可在任意时刻进行。换下的球员不可再上场。</span>
                    </div>
                    <div className="bg-stone-700/30 p-3 rounded">
                      <span className="font-bold text-yellow-200 block mb-1">⏱️ 伤停补时</span>
                      <span className="text-xs">当协同卡牌堆耗尽重洗后，进入补时。补时阶段不进行球队行动。</span>
                    </div>
                    <div className="bg-stone-700/30 p-3 rounded">
                      <span className="font-bold text-yellow-200 block mb-1">🥅 点球大战</span>
                      <span className="text-xs">平局时进行。双方同时出牌比拼心理博弈。</span>
                    </div>
                    <div className="bg-stone-700/30 p-3 rounded">
                      <span className="font-bold text-yellow-200 block mb-1">⚖️ 控制系统</span>
                      <span className="text-xs">控制条位置决定进攻方能打出多少张协同卡（0, 1, 或任意）。</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}
        {activeTab === 'manual_cn' && (
          <div className="space-y-6">
            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">🇨🇳 Official Rulebook (Chinese)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rulePagesCN.map((src, index) => (
                  <div key={index} className="flex flex-col items-center bg-stone-900/50 p-2 rounded-lg">
                    <img 
                      src={src} 
                      alt={`Rule Page ${index + 1}`} 
                      className="w-full h-auto rounded shadow-lg hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                      onClick={() => window.open(src, '_blank')}
                    />
                    <span className="text-stone-500 text-sm mt-2">Page {index + 1}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'manual_jp' && (
          <div className="space-y-6">
            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">🇯🇵 Official Rulebook (Japanese)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rulePagesJP.map((src, index) => (
                  <div key={index} className="flex flex-col items-center bg-stone-900/50 p-2 rounded-lg">
                    <img 
                      src={src} 
                      alt={`Rule Page ${index + 1}`} 
                      className="w-full h-auto rounded shadow-lg hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                      onClick={() => window.open(src, '_blank')}
                    />
                    <span className="text-stone-500 text-sm mt-2">Page {index + 1}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'expansions' && (
          <div className="space-y-6">
            <section className="bg-stone-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">📦 扩展与周边 (Expansions & Extras)</h2>
              
              {/* GK Expansion */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-green-400 mb-2">🧤 守门员扩展 (Goalkeeper Expansion)</h3>
                <p className="text-stone-300 mb-4 text-sm">
                  本作额外赠送3张守门员扩充卡。守门员技能整局游戏只能发动一次，可在危急时刻进行精彩扑救，帮助玩家反败为胜。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gkExpansionImages.map((src, index) => (
                    <div key={index} className="flex flex-col items-center bg-stone-900/50 p-2 rounded-lg">
                      <img 
                        src={src} 
                        alt={`GK Expansion ${index + 1}`} 
                        className="w-full h-auto rounded shadow-lg hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                        onClick={() => window.open(src, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Playmat */}
                <div className="bg-stone-700/30 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-blue-400 mb-2">🗺️ 绸缎牌垫 (Playmat)</h3>
                  <p className="text-sm text-stone-300">
                    为有需求的玩家提供更高性价比的选择。它将3块拼接版图整合为一块，使用更方便，且可额外收纳到游戏盒子中。
                  </p>
                </div>

                {/* Sleeves */}
                <div className="bg-stone-700/30 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-purple-400 mb-2">🃏 牌套信息 (Sleeves)</h3>
                  <p className="text-sm text-stone-300">
                    游戏内卡牌尺寸为 <span className="text-white font-bold">66x43mm</span>，玩家可根据自身需求自行购买合适牌套。
                  </p>
                </div>

                {/* Tournament */}
                <div className="bg-stone-700/30 p-4 rounded-lg md:col-span-2">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">🏆 盒拍杯梦幻十一人大赛 (Tournament)</h3>
                  <p className="text-sm text-stone-300 mb-2">
                    2025年将举办官方赛事。比赛分为小组赛和淘汰赛。每个小组前两名出线进入淘汰赛，最终分出冠、亚、季军。
                  </p>
                  <p className="text-xs text-stone-500">
                    *参与众筹的玩家会随游戏额外获得一张参赛门票，可免除报名费。
                  </p>
                </div>
              </div>

            </section>
          </div>
        )}
      </div>
    </div>
  );
};
