const gameLogic = require('../../utils/gameLogic')
const { getControlState, getMaxSynergyCards, countIcons, calculateAttackPower, calculateDefensePower } = require('../../utils/gameUtils')

Page({
  data: {
    gameState: null,
    controlState: 'normal',
    maxSynergy: 0,
    message: '',
    showActionMenu: false
  },

  onLoad() {
    let gameState = wx.getStorageSync('gameState')
    if (!gameState) {
      gameState = gameLogic.createInitialState()
    }
    
    const controlState = getControlState(gameState.controlPosition)
    const maxSynergy = getMaxSynergyCards(controlState)
    
    this.setData({
      gameState,
      controlState,
      maxSynergy,
      message: gameState.message
    })
  },

  onShow() {
    this.updateGameState()
  },

  updateGameState() {
    const { gameState } = this.data
    const controlState = getControlState(gameState.controlPosition)
    const maxSynergy = getMaxSynergyCards(controlState)
    
    this.setData({
      controlState,
      maxSynergy
    })
  },

  teamAction(e) {
    const action = e.currentTarget.dataset.action
    let newState = gameLogic.performTeamAction(this.data.gameState, action)
    
    newState.turnPhase = 'playerAction'
    
    this.setData({
      gameState: newState,
      message: newState.message
    })
    
    this.updateGameState()
  },

  selectCard(e) {
    const card = e.currentTarget.dataset.card
    const { gameState } = this.data
    
    if (gameState.currentTurn !== 'player') {
      wx.showToast({
        title: '不是你的回合',
        icon: 'none'
      })
      return
    }
    
    if (gameState.turnPhase !== 'playerAction') {
      wx.showToast({
        title: '现在不能放置卡牌',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showActionMenu: true,
      selectedCard: card
    })
  },

  placeCard(e) {
    const { card, zone, slot } = e.currentTarget.dataset
    let newState = gameLogic.placeCard(this.data.gameState, card, zone, slot)
    
    if (newState !== this.data.gameState) {
      this.setData({
        gameState: newState,
        showActionMenu: false,
        message: '卡牌已放置，选择下一步操作'
      })
    }
  },

  performShot(e) {
    const { card, slot, zone } = e.currentTarget.dataset
    let newState = gameLogic.performShot(this.data.gameState, card, slot, zone)
    
    if (newState.pendingShot) {
      this.setData({
        gameState: newState,
        message: '选择协同卡来增强射门'
      })
      
      this.resolveShot()
    }
  },

  resolveShot() {
    const { gameState } = this.data
    if (!gameState.pendingShot) return
    
    const { pendingShot } = gameState
    const attackPower = calculateAttackPower(pendingShot.attacker.card, gameState.selectedSynergyCards)
    
    let defenderPower = 0
    let result = 'saved'
    
    if (attackPower > defenderPower) {
      result = 'goal'
      if (gameState.currentTurn === 'player') {
        gameState.playerScore++
      } else {
        gameState.aiScore++
      }
    }
    
    pendingShot.result = result
    pendingShot.attackerPower = attackPower
    pendingShot.defenderPower = defenderPower
    
    const newState = {
      ...gameState,
      pendingShot: null,
      message: result === 'goal' ? '进球！' : '射门被扑出'
    }
    
    this.setData({
      gameState: newState,
      message: newState.message
    })
  },

  endTurn() {
    const newState = gameLogic.performEndTurn(this.data.gameState)
    
    this.setData({
      gameState: newState,
      message: newState.message
    })
    
    this.updateGameState()
    
    if (newState.phase === 'fullTime') {
      wx.setStorageSync('gameState', newState)
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/result/result'
        })
      }, 1500)
      return
    }
    
    if (newState.currentTurn === 'ai') {
      this.processAiTurn()
    }
  },

  processAiTurn() {
    const { gameState } = this.data
    
    setTimeout(() => {
      this.teamAction({ currentTarget: { dataset: { action: 'pass' } } })
    }, 1000)
    
    setTimeout(() => {
      const aiCard = gameState.aiHand[0]
      if (aiCard) {
        const validZone = aiCard.zones[0]
        const newState = gameLogic.placeCard(gameState, aiCard, validZone, 0)
        this.setData({ gameState: newState })
      }
    }, 2000)
    
    setTimeout(() => {
      this.endTurn()
    }, 3000)
  },

  hideActionMenu() {
    this.setData({
      showActionMenu: false
    })
  },

  onShareAppMessage() {
    return {
      title: '足球奇迹11 - 策略卡牌对战',
      path: '/pages/index/index'
    }
  }
})
