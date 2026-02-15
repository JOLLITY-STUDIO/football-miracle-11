const { validateCardPlacement, getValidPlacements } = require('./utils/gameUtils')
const CARDS = require('./utils/cards')

function testCardPlacement() {
  console.log('开始测试卡牌放置规则...\n')
  
  const testField = [
    { zone: 0, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
    { zone: 1, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
    { zone: 2, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
    { zone: 3, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) }
  ]
  
  const testCard = CARDS.PLAYER_CARDS[0]
  console.log('测试卡牌:', testCard.name)
  console.log('可用区域:', testCard.zones)
  console.log('位置:', testCard.positionLabel)
  console.log('攻击力:', testCard.attack, '防守力:', testCard.defense)
  console.log('图标:', testCard.icons)
  console.log()
  
  console.log('测试1: 空场上放置第一张卡牌')
  console.log('预期: Zone 1 不应该允许放置（第一张卡牌不能放在Zone 1）')
  const result1 = validateCardPlacement(testCard, testField, 1, 0, true)
  console.log('结果:', result1.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result1.reason || '无')
  console.log()
  
  console.log('测试2: 在允许的区域放置第一张卡牌')
  console.log('预期: Zone 2 应该允许放置')
  const result2 = validateCardPlacement(testCard, testField, 2, 0, true)
  console.log('结果:', result2.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result2.reason || '无')
  console.log()
  
  console.log('测试3: 在不允许的区域放置')
  console.log('预期: Zone 0 不应该允许放置（卡牌不在允许的区域列表中）')
  const result3 = validateCardPlacement(testCard, testField, 0, 0, true)
  console.log('结果:', !result3.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result3.reason || '无')
  console.log()
  
  console.log('测试4: 放置在已有卡牌的Zone 1相邻位置')
  const fieldWithCard = JSON.parse(JSON.stringify(testField))
  fieldWithCard[1].slots[0].playerCard = testCard
  
  const result4 = validateCardPlacement(testCard, fieldWithCard, 1, 1, false)
  console.log('预期: Zone 1 应该允许放置（与已有卡牌相邻）')
  console.log('结果:', result4.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result4.reason || '无')
  console.log()
  
  console.log('测试5: 放置在已有卡牌的Zone 2后方')
  const result5 = validateCardPlacement(testCard, fieldWithCard, 1, 0, false)
  console.log('预期: Zone 1 应该允许放置（Zone 2有卡牌在后方）')
  console.log('结果:', result5.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result5.reason || '无')
  console.log()
  
  console.log('测试6: 放置在已有卡牌的Zone 1不相邻位置')
  const result6 = validateCardPlacement(testCard, fieldWithCard, 1, 3, false)
  console.log('预期: Zone 1 不应该允许放置（与已有卡牌不相邻）')
  console.log('结果:', !result6.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result6.reason || '无')
  console.log()
  
  console.log('测试7: 放置在已占用的位置')
  const result7 = validateCardPlacement(testCard, fieldWithCard, 1, 0, false)
  console.log('预期: 不应该允许放置（位置已被占用）')
  console.log('结果:', !result7.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result7.reason || '无')
  console.log()
  
  console.log('测试8: 获取所有有效放置位置')
  const validPlacements = getValidPlacements([testCard], testField, true)
  console.log('有效放置位置数量:', validPlacements.length)
  console.log('有效放置位置:')
  validPlacements.forEach(p => {
    console.log(`  - Zone ${p.zone}, 起始列 ${p.startCol}`)
  })
  console.log()
  
  console.log('测试9: 无效的列位置')
  const result9 = validateCardPlacement(testCard, testField, 2, 10, true)
  console.log('预期: 不应该允许放置（列位置超出范围）')
  console.log('结果:', !result9.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result9.reason || '无')
  console.log()
  
  console.log('测试10: 负数的列位置')
  const result10 = validateCardPlacement(testCard, testField, 2, -1, true)
  console.log('预期: 不应该允许放置（列位置为负数）')
  console.log('结果:', !result10.valid ? '✓ 通过' : '✗ 失败')
  console.log('原因:', result10.reason || '无')
  console.log()
  
  console.log('测试完成！')
}

function runTests() {
  try {
    testCardPlacement()
    console.log('\n✓ 所有测试执行完成')
  } catch (error) {
    console.error('\n✗ 测试执行失败:', error)
  }
}

runTests()
