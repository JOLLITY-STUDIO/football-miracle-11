const gameLogic = require('../../utils/gameLogic')

Page({
  data: {
    gameState: null,
    availableCards: [],
    draftRound: 1,
    message: ''
  },

  onLoad() {
    const initialState = gameLogic.createInitialState()
    this.setData({
      gameState: initialState,
      draftRound: initialState.draftRound,
      message: initialState.message
    })
    this.startDraftRound()
  },

  startDraftRound() {
    const newState = gameLogic.startDraftRound(this.data.gameState)
    this.setData({
      gameState: newState,
      availableCards: newState.availableDraftCards,
      message: `第 ${newState.draftRound} 轮选秀，请选择一张明星卡`
    })
  },

  selectCard(e) {
    const index = e.currentTarget.dataset.index
    const newState = gameLogic.pickDraftCard(this.data.gameState, index)
    
    this.setData({
      gameState: newState,
      availableCards: newState.availableDraftCards,
      draftRound: newState.draftRound,
      message: newState.message
    })

    if (newState.phase === 'squadSelection') {
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/squad/squad'
        })
      }, 1000)
    } else {
      setTimeout(() => {
        this.startDraftRound()
      }, 1000)
    }
  },

  onShareAppMessage() {
    return {
      title: '足球奇迹11 - 策略卡牌对战',
      path: '/pages/index/index'
    }
  }
})
