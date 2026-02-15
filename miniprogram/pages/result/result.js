Page({
  data: {
    playerScore: 0,
    aiScore: 0,
    result: '',
    message: ''
  },

  onLoad() {
    const gameState = wx.getStorageSync('gameState')
    
    if (gameState) {
      const playerScore = gameState.playerScore
      const aiScore = gameState.aiScore
      let result = ''
      let message = ''
      
      if (playerScore > aiScore) {
        result = '胜利！'
        message = '恭喜你赢得了比赛！'
      } else if (playerScore < aiScore) {
        result = '失败'
        message = '很遗憾，你输掉了比赛'
      } else {
        result = '平局'
        message = '比赛以平局结束'
      }
      
      this.setData({
        playerScore,
        aiScore,
        result,
        message
      })
    }
  },

  restartGame() {
    wx.removeStorageSync('gameState')
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },

  onShareAppMessage() {
    const { playerScore, aiScore, result } = this.data
    return {
      title: `足球奇迹11 - ${result} ${playerScore}:${aiScore}`,
      path: '/pages/index/index'
    }
  }
})
