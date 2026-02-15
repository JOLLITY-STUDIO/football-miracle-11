const CARDS = require('../../utils/cards')
const gameLogic = require('../../utils/gameLogic')

Page({
  data: {
    gameState: null,
    allCards: [],
    selectedCards: [],
    starters: [],
    substitutes: [],
    message: ''
  },

  onLoad() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    const gameState = prevPage?.data?.gameState || gameLogic.createInitialState()
    
    const playerDraftHand = gameState.playerDraftHand || []
    const baseCards = CARDS.PLAYER_CARDS.filter(card => {
      return gameState.isHomeTeam ? card.id.startsWith('H') : card.id.startsWith('A')
    })
    
    const allCards = [...playerDraftHand, ...baseCards]
    
    this.setData({
      gameState,
      allCards,
      message: '请选择10名首发球员和3名替补球员'
    })
  },

  toggleCard(e) {
    const cardId = e.currentTarget.dataset.id
    const { selectedCards, starters, substitutes } = this.data
    const card = this.data.allCards.find(c => c.id === cardId)
    
    if (!card) return
    
    let newSelectedCards = [...selectedCards]
    const index = newSelectedCards.findIndex(c => c.id === cardId)
    
    if (index > -1) {
      newSelectedCards.splice(index, 1)
    } else {
      if (newSelectedCards.length >= 13) {
        wx.showToast({
          title: '最多选择13名球员',
          icon: 'none'
        })
        return
      }
      newSelectedCards.push(card)
    }
    
    const newStarters = newSelectedCards.slice(0, 10)
    const newSubstitutes = newSelectedCards.slice(10)
    
    this.setData({
      selectedCards: newSelectedCards,
      starters: newStarters,
      substitutes: newSubstitutes,
      message: `已选择 ${newSelectedCards.length}/13 名球员`
    })
  },

  confirmSelection() {
    const { selectedCards } = this.data
    
    if (selectedCards.length !== 13) {
      wx.showToast({
        title: '请选择13名球员',
        icon: 'none'
      })
      return
    }
    
    const starters = selectedCards.slice(0, 10)
    const substitutes = selectedCards.slice(10)
    
    const newState = gameLogic.finishSquadSelection(this.data.gameState, starters, substitutes)
    
    wx.setStorageSync('gameState', newState)
    
    wx.redirectTo({
      url: '/pages/game/game'
    })
  },

  onShareAppMessage() {
    return {
      title: '足球奇迹11 - 策略卡牌对战',
      path: '/pages/index/index'
    }
  }
})
