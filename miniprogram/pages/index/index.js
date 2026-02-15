Page({
  data: {
    motto: '足球奇迹11',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName')
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  startGame() {
    wx.navigateTo({
      url: '/pages/draft/draft'
    })
  },

  onShareAppMessage() {
    return {
      title: '足球奇迹11 - 策略卡牌对战',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  }
})
