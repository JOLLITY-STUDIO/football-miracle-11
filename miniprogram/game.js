const gameLogic = require('./utils/gameLogic')
const { getControlState, getMaxSynergyCards, countIcons, calculateAttackPower, calculateDefensePower, validateCardPlacement } = require('./utils/gameUtils')

const GAME_WIDTH = 375
const GAME_HEIGHT = 667

class Game {
  constructor() {
    this.canvas = wx.createCanvas()
    this.ctx = this.canvas.getContext('2d')
    this.width = GAME_WIDTH
    this.height = GAME_HEIGHT
    
    this.gameState = null
    this.currentScene = 'menu'
    this.touchHandler = null
    
    this.init()
  }

  init() {
    this.resize()
    this.bindEvents()
    this.loadAssets()
    this.loop()
  }

  resize() {
    const systemInfo = wx.getSystemInfoSync()
    this.width = systemInfo.windowWidth
    this.height = systemInfo.windowHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  bindEvents() {
    wx.onTouchStart(this.handleTouchStart.bind(this))
    wx.onTouchMove(this.handleTouchMove.bind(this))
    wx.onTouchEnd(this.handleTouchEnd.bind(this))
  }

  handleTouchStart(e) {
    if (this.touchHandler) {
      this.touchHandler.onTouchStart(e)
    }
  }

  handleTouchMove(e) {
    if (this.touchHandler) {
      this.touchHandler.onTouchMove(e)
    }
  }

  handleTouchEnd(e) {
    if (this.touchHandler) {
      this.touchHandler.onTouchEnd(e)
    }
  }

  loadAssets() {
    this.assets = {
      images: {},
      sounds: {}
    }
  }

  switchScene(scene) {
    this.currentScene = scene
    
    switch (scene) {
      case 'menu':
        this.touchHandler = new MenuScene(this)
        break
      case 'draft':
        this.touchHandler = new DraftScene(this)
        break
      case 'squad':
        this.touchHandler = new SquadScene(this)
        break
      case 'game':
        this.touchHandler = new GameScene(this)
        break
      case 'result':
        this.touchHandler = new ResultScene(this)
        break
    }
  }

  update(dt) {
    if (this.touchHandler) {
      this.touchHandler.update(dt)
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    
    if (this.touchHandler) {
      this.touchHandler.render(this.ctx)
    }
  }

  loop() {
    let lastTime = Date.now()
    
    const frame = () => {
      const now = Date.now()
      const dt = (now - lastTime) / 1000
      lastTime = now
      
      this.update(dt)
      this.render()
      
      requestAnimationFrame(frame)
    }
    
    frame()
  }
}

class MenuScene {
  constructor(game) {
    this.game = game
    this.buttons = [
      { x: game.width / 2 - 100, y: game.height / 2 - 30, width: 200, height: 60, text: '开始游戏', action: () => this.startGame() }
    ]
  }

  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY
    const gameState = this.game.gameState
    
    this.buttons.forEach(btn => {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        btn.action()
      }
    })
    
    if (gameState.turnPhase === 'athleteAction' && gameState.currentTurn === 'player') {
      const handY = this.game.height - 170
      const cardWidth = 80
      const cardHeight = 50
      const padding = 10
      const startX = 80
      
      if (y >= handY && y <= handY + cardHeight) {
        const cardIndex = Math.floor((x - startX) / (cardWidth + padding))
        if (cardIndex >= 0 && cardIndex < gameState.playerHand.length) {
          this.selectedCardIndex = cardIndex
        }
      }
      
      const fieldY = 150
      const fieldHeight = this.game.height - 300
      const zoneHeight = fieldHeight / 4
      
      if (y >= fieldY && y <= fieldY + fieldHeight && this.selectedCardIndex !== null) {
        const card = gameState.playerHand[this.selectedCardIndex]
        if (card) {
          const zoneIndex = Math.floor((y - fieldY) / zoneHeight)
          const field = gameState.playerField
          const zone = field[zoneIndex]
          
          if (zone) {
            const slotWidth = 60
            const slotPadding = 10
            const zoneX = 20
            const relativeX = x - zoneX - slotPadding
            const slotIndex = Math.floor(relativeX / (slotWidth + slotPadding))
            
            const validation = gameUtils.validateCardPlacement(card, field, zone.zone, slotIndex, gameState.isFirstTurn)
            
            if (validation.valid) {
              const newState = gameLogic.placeCard(gameState, card, zone.zone, slotIndex)
              this.game.gameState = newState
              this.selectedCardIndex = null
            }
          }
        }
      }
    }
  }

  onTouchMove(e) {}

  onTouchEnd(e) {}

  update(dt) {}

  render(ctx) {
    const { width, height } = this.game
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)
    
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('足球奇迹11', width / 2, height / 3)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '24px Arial'
    ctx.fillText('策略卡牌对战', width / 2, height / 3 + 60)
    
    this.buttons.forEach(btn => {
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 8)
    })
  }

  startGame() {
    this.game.gameState = gameLogic.createInitialState()
    this.game.switchScene('draft')
  }
}

class DraftScene {
  constructor(game) {
    this.game = game
    this.availableCards = []
    this.draftRound = 1
    this.message = '第 1 轮选秀，请选择一张明星卡'
    this.buttons = []
    
    this.startDraftRound()
  }

  startDraftRound() {
    const newState = gameLogic.startDraftRound(this.game.gameState)
    this.game.gameState = newState
    this.availableCards = newState.availableDraftCards
    this.draftRound = newState.draftRound
    this.message = `第 ${this.draftRound} 轮选秀，请选择一张明星卡`
    this.createButtons()
  }

  createButtons() {
    const { width, height } = this.game
    const cardWidth = 300
    const cardHeight = 400
    const spacing = 30
    const startY = 150
    
    this.buttons = this.availableCards.map((card, index) => {
      const x = (width - cardWidth) / 2
      const y = startY + index * (cardHeight + spacing)
      return {
        x, y, width: cardWidth, height: cardHeight,
        card, index
      }
    })
  }

  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY
    
    this.buttons.forEach(btn => {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        this.selectCard(btn.index)
      }
    })
  }

  onTouchMove(e) {}

  onTouchEnd(e) {}

  update(dt) {}

  render(ctx) {
    const { width, height } = this.game
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)
    
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('明星球员选秀', width / 2, 80)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '24px Arial'
    ctx.fillText(`第 ${this.draftRound} / 3 轮`, width / 2, 120)
    
    ctx.fillStyle = '#a0aec0'
    ctx.font = '20px Arial'
    ctx.fillText(this.message, width / 2, height - 50)
    
    this.buttons.forEach(btn => {
      this.renderCard(ctx, btn.card, btn.x, btn.y, btn.width, btn.height)
    })
  }

  renderCard(ctx, card, x, y, width, height) {
    ctx.fillStyle = '#2d3748'
    ctx.fillRect(x, y, width, height)
    ctx.strokeStyle = '#4a5568'
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, width, height)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(card.name, x + width / 2, y + 50)
    
    ctx.fillStyle = '#a0aec0'
    ctx.font = '20px Arial'
    ctx.fillText(card.realName, x + width / 2, y + 80)
    
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(`进攻: ${card.attack}`, x + width / 2 - 60, y + 150)
    
    ctx.fillStyle = '#3b82f6'
    ctx.fillText(`防守: ${card.defense}`, x + width / 2 + 60, y + 150)
    
    ctx.fillStyle = '#ffd700'
    ctx.font = '20px Arial'
    ctx.fillText(card.positionLabel, x + width / 2, y + 200)
    
    if (card.isStar) {
      ctx.fillStyle = '#ffd700'
      ctx.font = 'bold 20px Arial'
      ctx.fillText('★ 明星卡', x + width / 2, y + 240)
    }
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    const icons = card.icons.join(' ')
    ctx.fillText(icons, x + width / 2, y + 300)
  }

  selectCard(index) {
    const newState = gameLogic.pickDraftCard(this.game.gameState, index)
    this.game.gameState = newState
    this.availableCards = newState.availableDraftCards
    this.draftRound = newState.draftRound
    
    if (newState.phase === 'squadSelection') {
      this.game.switchScene('squad')
    } else {
      this.startDraftRound()
    }
  }
}

class SquadScene {
  constructor(game) {
    this.game = game
    this.allCards = []
    this.selectedCards = []
    this.starters = []
    this.substitutes = []
    this.message = '请选择10名首发球员和3名替补球员'
    
    this.loadCards()
  }

  loadCards() {
    const CARDS = require('./utils/cards')
    const gameState = this.game.gameState
    
    const playerDraftHand = gameState.playerDraftHand || []
    const baseCards = CARDS.PLAYER_CARDS.filter(card => {
      return gameState.isHomeTeam ? card.id.startsWith('H') : card.id.startsWith('A')
    })
    
    this.allCards = [...playerDraftHand, ...baseCards]
    this.createButtons()
  }

  createButtons() {
    const { width, height } = this.game
    const cardHeight = 80
    const startY = 200
    
    this.buttons = this.allCards.map((card, index) => {
      const x = 50
      const y = startY + index * (cardHeight + 10)
      return { x, y, width: width - 100, height: cardHeight, card, index }
    })
  }

  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY
    
    this.buttons.forEach(btn => {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        this.toggleCard(btn.card)
      }
    })
    
    if (this.selectedCards.length === 13) {
      this.confirmSelection()
    }
  }

  onTouchMove(e) {}

  onTouchEnd(e) {}

  update(dt) {}

  render(ctx) {
    const { width, height } = this.game
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)
    
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('阵容选择', width / 2, 80)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '24px Arial'
    ctx.fillText(`已选择 ${this.selectedCards.length}/13 名球员`, width / 2, 130)
    
    ctx.fillStyle = '#a0aec0'
    ctx.font = '18px Arial'
    ctx.fillText(`首发: ${this.starters.length}/10  替补: ${this.substitutes.length}/3`, width / 2, 160)
    
    this.buttons.forEach(btn => {
      const isSelected = this.selectedCards.some(c => c.id === btn.card.id)
      this.renderCardItem(ctx, btn.card, btn.x, btn.y, btn.width, btn.height, isSelected)
    })
    
    if (this.selectedCards.length === 13) {
      ctx.fillStyle = '#10b981'
      ctx.fillRect(width / 2 - 100, height - 100, 200, 60)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('确认阵容', width / 2, height - 60)
    }
  }

  renderCardItem(ctx, card, x, y, width, height, isSelected) {
    ctx.fillStyle = isSelected ? '#4a5568' : '#2d3748'
    ctx.fillRect(x, y, width, height)
    ctx.strokeStyle = isSelected ? '#ffd700' : '#4a5568'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(card.name, x + 20, y + 35)
    
    ctx.fillStyle = '#a0aec0'
    ctx.font = '16px Arial'
    ctx.fillText(card.realName, x + 20, y + 60)
    
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 18px Arial'
    ctx.fillText(`${card.attack}`, x + width - 100, y + 35)
    
    ctx.fillStyle = '#3b82f6'
    ctx.fillText(`${card.defense}`, x + width - 60, y + 35)
    
    ctx.fillStyle = '#ffd700'
    ctx.font = '16px Arial'
    ctx.fillText(card.positionLabel, x + width - 100, y + 60)
  }

  toggleCard(card) {
    const index = this.selectedCards.findIndex(c => c.id === card.id)
    
    if (index > -1) {
      this.selectedCards.splice(index, 1)
    } else {
      if (this.selectedCards.length >= 13) return
      this.selectedCards.push(card)
    }
    
    this.starters = this.selectedCards.slice(0, 10)
    this.substitutes = this.selectedCards.slice(10)
  }

  confirmSelection() {
    const newState = gameLogic.finishSquadSelection(this.game.gameState, this.starters, this.substitutes)
    this.game.gameState = newState
    this.game.switchScene('game')
  }
}

class GameScene {
  constructor(game) {
    this.game = game
    this.selectedCardIndex = null
    this.buttons = []
    this.createButtons()
  }

  createButtons() {
    const { width, height } = this.game
    
    this.buttons = [
      { x: 20, y: height - 100, width: 150, height: 60, text: '传球', action: () => this.teamAction('pass') },
      { x: 190, y: height - 100, width: 150, height: 60, text: '逼抢', action: () => this.teamAction('press') },
      { x: width - 170, y: height - 100, width: 150, height: 60, text: '结束回合', action: () => this.endTurn() }
    ]
  }

  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY
    
    this.buttons.forEach(btn => {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        btn.action()
      }
    })
  }

  onTouchMove(e) {}

  onTouchEnd(e) {}

  update(dt) {
    const gameState = this.game.gameState
    if (gameState.currentTurn === 'ai') {
      this.processAiTurn()
    }
  }

  render(ctx) {
    const { width, height } = this.game
    const gameState = this.game.gameState
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)
    
    this.renderScoreboard(ctx, gameState)
    this.renderControlBar(ctx, gameState)
    this.renderField(ctx, gameState)
    this.renderHand(ctx, gameState)
    this.renderButtons(ctx, gameState)
  }

  renderScoreboard(ctx, gameState) {
    const { width } = this.game
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillRect(0, 0, width, 80)
    
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${gameState.playerScore}`, width / 4, 50)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '20px Arial'
    ctx.fillText('玩家', width / 4, 25)
    
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 32px Arial'
    ctx.fillText(`${gameState.aiScore}`, width * 3 / 4, 50)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '20px Arial'
    ctx.fillText('AI', width * 3 / 4, 25)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '20px Arial'
    ctx.fillText(gameState.phase === 'firstHalf' ? '上半场' : '下半场', width / 2, 35)
    ctx.fillText(`第 ${gameState.turnCount} 回合`, width / 2, 60)
  }

  renderControlBar(ctx, gameState) {
    const { width } = this.game
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillRect(0, 80, width, 60)
    
    const controlState = getControlState(gameState.controlPosition)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(20, 100, width - 40, 20)
    
    const markerX = 20 + (gameState.controlPosition / 10) * (width - 40)
    ctx.fillStyle = '#ffd700'
    ctx.beginPath()
    ctx.arc(markerX, 110, 10, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = controlState === 'attack' ? '#ef4444' : controlState === 'defense' ? '#3b82f6' : '#a0aec0'
    ctx.font = '18px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(controlState === 'attack' ? '进攻态' : controlState === 'defense' ? '防守态' : '常态', width / 2, 135)
  }

  renderField(ctx, gameState) {
    const { width, height } = this.game
    const fieldY = 150
    const fieldHeight = height - 300
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillRect(20, fieldY, width - 40, fieldHeight)
    
    const zoneHeight = fieldHeight / 4
    
    gameState.aiField.forEach((zone, index) => {
      const y = fieldY + index * zoneHeight
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
      ctx.fillRect(20, y, width - 40, zoneHeight - 2)
      
      ctx.fillStyle = '#a0aec0'
      ctx.font = '16px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`Zone ${zone.zone}`, 30, y + 25)
      
      this.renderZoneCards(ctx, zone, 20, y, width - 40, zoneHeight - 2)
    })
    
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(20, fieldY + fieldHeight / 2 - 2, width - 40, 4)
    
    gameState.playerField.forEach((zone, index) => {
      const y = fieldY + (index + 4) * zoneHeight
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.fillRect(20, y, width - 40, zoneHeight - 2)
      
      ctx.fillStyle = '#a0aec0'
      ctx.font = '16px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`Zone ${zone.zone}`, 30, y + 25)
      
      this.renderZoneCards(ctx, zone, 20, y, width - 40, zoneHeight - 2)
    })
  }

  renderZoneCards(ctx, zone, x, y, width, height) {
    const slotWidth = 60
    const slotHeight = 80
    const padding = 10
    
    zone.slots.forEach((slot, index) => {
      const slotX = x + padding + index * (slotWidth + padding)
      const slotY = y + padding
      
      if (slot.playerCard) {
        const card = slot.playerCard
        const isFirstSlot = index % 2 === 0
        
        if (isFirstSlot) {
          ctx.fillStyle = '#3b82f6'
          ctx.fillRect(slotX, slotY, slotWidth * 2 + padding, slotHeight)
          
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 14px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(card.name.substring(0, 6), slotX + slotWidth + padding / 2, slotY + 25)
          
          ctx.fillStyle = '#ef4444'
          ctx.font = 'bold 16px Arial'
          ctx.fillText(`${card.attack}`, slotX + 20, slotY + 50)
          
          ctx.fillStyle = '#3b82f6'
          ctx.fillText(`${card.defense}`, slotX + slotWidth * 2 - 20, slotY + 50)
          
          ctx.fillStyle = '#ffd700'
          ctx.font = '12px Arial'
          ctx.fillText(card.positionLabel, slotX + slotWidth + padding / 2, slotY + 70)
        }
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 2
        ctx.strokeRect(slotX, slotY, slotWidth, slotHeight)
      }
    })
  }

  renderHand(ctx, gameState) {
    const { width, height } = this.game
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillRect(0, height - 170, width, 70)
    
    ctx.fillStyle = '#a0aec0'
    ctx.font = '16px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('手牌', 20, height - 145)
    
    const cardWidth = 80
    const cardHeight = 50
    const padding = 10
    const startX = 80
    
    gameState.playerHand.forEach((card, index) => {
      const x = startX + index * (cardWidth + padding)
      const y = height - 165
      
      ctx.fillStyle = '#2d3748'
      ctx.fillRect(x, y, cardWidth, cardHeight)
      ctx.strokeStyle = '#4a5568'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, cardWidth, cardHeight)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(card.name.substring(0, 6), x + cardWidth / 2, y + 25)
      
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 12px Arial'
      ctx.fillText(`${card.attack}`, x + 20, y + 40)
      
      ctx.fillStyle = '#3b82f6'
      ctx.fillText(`${card.defense}`, x + 60, y + 40)
    })
  }

  renderButtons(ctx, gameState) {
    if (gameState.turnPhase === 'teamAction' && gameState.currentTurn === 'player') {
      this.buttons.slice(0, 2).forEach(btn => {
        ctx.fillStyle = btn.text === '传球' ? '#10b981' : '#f59e0b'
        ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 7)
      })
    } else if (gameState.turnPhase === 'athleteAction' && gameState.currentTurn === 'player') {
      this.buttons.slice(2).forEach(btn => {
        ctx.fillStyle = '#6366f1'
        ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 7)
      })
    }
  }

  teamAction(action) {
    const newState = gameLogic.performTeamAction(this.game.gameState, action)
    newState.turnPhase = 'athleteAction'
    this.game.gameState = newState
  }

  endTurn() {
    const newState = gameLogic.performEndTurn(this.game.gameState)
    this.game.gameState = newState
    
    if (newState.phase === 'fullTime') {
      this.game.switchScene('result')
    }
  }

  processAiTurn() {
    const gameState = this.game.gameState
    
    setTimeout(() => {
      this.teamAction('pass')
    }, 1000)
    
    setTimeout(() => {
      const aiCard = gameState.aiHand[0]
      if (aiCard) {
        const field = gameState.aiField
        let placed = false
        
        for (const zone of field) {
          if (!placed) {
            for (let col = 0; col <= 6; col++) {
              const validation = validateCardPlacement(aiCard, field, zone.zone, col, gameState.isFirstTurn)
              if (validation.valid) {
                const newState = gameLogic.placeCard(gameState, aiCard, zone.zone, col)
                this.game.gameState = newState
                placed = true
                break
              }
            }
          }
          if (placed) break
        }
      }
    }, 2000)
    
    setTimeout(() => {
      this.endTurn()
    }, 3000)
  }
}

class ResultScene {
  constructor(game) {
    this.game = game
    const gameState = game.gameState
    
    this.playerScore = gameState.playerScore
    this.aiScore = gameState.aiScore
    
    if (this.playerScore > this.aiScore) {
      this.result = '胜利！'
      this.message = '恭喜你赢得了比赛！'
    } else if (this.playerScore < this.aiScore) {
      this.result = '失败'
      this.message = '很遗憾，你输掉了比赛'
    } else {
      this.result = '平局'
      this.message = '比赛以平局结束'
    }
    
    this.buttons = [
      { x: game.width / 2 - 100, y: game.height - 150, width: 200, height: 60, text: '再来一局', action: () => this.restartGame() }
    ]
  }

  onTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY
    
    this.buttons.forEach(btn => {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        btn.action()
      }
    })
  }

  onTouchMove(e) {}

  onTouchEnd(e) {}

  update(dt) {}

  render(ctx) {
    const { width, height } = this.game
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)
    
    const resultColor = this.result === '胜利！' ? '#ffd700' : this.result === '失败' ? '#ef4444' : '#a0aec0'
    
    ctx.fillStyle = resultColor
    ctx.font = 'bold 64px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(this.result, width / 2, height / 3)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '28px Arial'
    ctx.fillText(this.message, width / 2, height / 3 + 80)
    
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(width / 2 - 150, height / 2 - 50, 120, 100)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.fillText(this.playerScore, width / 2 - 90, height / 2 + 20)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '20px Arial'
    ctx.fillText('玩家', width / 2 - 90, height / 2 - 20)
    
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(width / 2 + 30, height / 2 - 50, 120, 100)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.fillText(this.aiScore, width / 2 + 90, height / 2 + 20)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '20px Arial'
    ctx.fillText('AI', width / 2 + 90, height / 2 - 20)
    
    this.buttons.forEach(btn => {
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
      
      ctx.fillStyle = '#1a1a2e'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 8)
    })
  }

  restartGame() {
    this.game.gameState = gameLogic.createInitialState()
    this.game.switchScene('menu')
  }
}

const game = new Game()
