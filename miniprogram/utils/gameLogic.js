const CARDS = require('./cards')
const { shuffleArray, getControlState, getMaxSynergyCards, countIcons, validateCardPlacement } = require('./gameUtils')

function createInitialState() {
  return {
    phase: 'coinToss',
    turnPhase: 'teamAction',
    currentTurn: 'player',
    controlPosition: 5,
    playerScore: 0,
    aiScore: 0,
    playerSubstitutionsLeft: 3,
    aiSubstitutionsLeft: 3,
    playerHand: [],
    playerBench: [],
    playerSynergyHand: [],
    playerField: [
      { zone: 0, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 1, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 2, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 3, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) }
    ],
    aiField: [
      { zone: 0, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 1, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 2, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 3, cards: [], synergyCards: [], slots: Array.from({ length: 7 }, (_, i) => ({ position: i, playerCard: null, usedShotIcons: [], shotMarkers: 0 })) }
    ],
    aiHand: [],
    aiBench: [],
    aiSynergyHand: [],
    synergyDeck: shuffleArray([...CARDS.SYNERGY_CARDS]),
    synergyDiscard: [],
    selectedCard: null,
    isHomeTeam: true,
    selectedSynergyCards: [],
    currentAction: 'none',
    message: '开始游戏',
    turnCount: 0,
    isFirstTurn: true,
    skipTeamAction: true,
    isFirstMatchTurn: true,
    isStoppageTime: false,
    pendingShot: null,
    draftRound: 1,
    draftStep: 0,
    availableDraftCards: [],
    discardedDraftCards: [],
    starCardDeck: shuffleArray([...CARDS.STAR_CARDS]),
    pendingPenalty: false,
    pendingImmediateEffect: null,
    synergyChoice: null,
    substitutionMode: null,
    instantShotMode: null,
    playerActiveSynergy: [],
    aiActiveSynergy: [],
    isDealing: false,
    matchLogs: [],
    playerUsedShotIcons: {},
    aiUsedShotIcons: {},
    draftTurn: 'player',
    aiDraftHand: []
  }
}

function performCoinToss(state) {
  const isHomeTeam = Math.random() < 0.5
  return {
    ...state,
    isHomeTeam,
    phase: 'draft',
    message: isHomeTeam ? '你是主队，先开始选秀' : '你是客队，后开始选秀'
  }
}

function startDraftRound(state) {
  const availableCards = shuffleArray(state.starCardDeck).slice(0, 3)
  return {
    ...state,
    availableDraftCards: availableCards,
    draftStep: 0,
    message: `第 ${state.draftRound} 轮选秀，请选择一张明星卡`
  }
}

function pickDraftCard(state, cardIndex) {
  const card = state.availableDraftCards[cardIndex]
  const newPlayerDraftHand = [...state.playerDraftHand || [], card]
  const remainingCards = state.availableDraftCards.filter((_, i) => i !== cardIndex)
  
  let newState = {
    ...state,
    playerDraftHand: newPlayerDraftHand,
    availableDraftCards: remainingCards,
    discardedDraftCards: [...state.discardedDraftCards, ...remainingCards],
    message: 'AI正在选择...'
  }
  
  if (state.draftRound < 3) {
    newState.draftRound++
    newState = startDraftRound(newState)
  } else {
    newState.phase = 'squadSelection'
    newState.message = '请选择10名首发球员和3名替补球员'
  }
  
  return newState
}

function finishSquadSelection(state, starters, subs) {
  const aiBaseCards = CARDS.PLAYER_CARDS.filter(card => {
    if (!state.isHomeTeam) {
      return card.id.startsWith('H')
    } else {
      return card.id.startsWith('A')
    }
  })
  
  const allAiCards = shuffleArray([...state.aiDraftHand || [], ...aiBaseCards])
  const aiStarters = allAiCards.slice(0, 10)
  const aiSubs = allAiCards.slice(10)
  
  return {
    ...state,
    phase: 'firstHalf',
    turnPhase: 'playerAction',
    turnCount: state.isHomeTeam ? 1 : 2,
    isFirstTurn: true,
    skipTeamAction: true,
    isFirstMatchTurn: true,
    currentAction: 'none',
    playerHand: starters,
    playerBench: subs,
    aiHand: aiStarters,
    aiBench: aiSubs,
    currentTurn: state.isHomeTeam ? 'player' : 'ai',
    message: state.isHomeTeam ? '你的回合！放置一张卡牌。' : 'AI正在思考...'
  }
}

function performTeamAction(state, action) {
  const controlState = getControlState(state.controlPosition)
  
  if (action === 'pass') {
    const passCount = state.currentTurn === 'player' 
      ? state.playerField.reduce((sum, zone) => sum + countIcons(zone.cards, 'pass'), 0)
      : state.aiField.reduce((sum, zone) => sum + countIcons(zone.cards, 'pass'), 0)
    
    const drawCount = Math.min(passCount, 5)
    const drawnCards = state.synergyDeck.splice(0, drawCount)
    
    if (state.currentTurn === 'player') {
      state.playerSynergyHand = [...state.playerSynergyHand, ...drawnCards]
    } else {
      state.aiSynergyHand = [...state.aiSynergyHand, ...drawnCards]
    }
    
    return {
      ...state,
      synergyDeck: [...state.synergyDeck],
      message: `抽了 ${drawCount} 张协同卡`
    }
  } else if (action === 'press') {
    const pressCount = state.currentTurn === 'player'
      ? state.playerField.reduce((sum, zone) => sum + countIcons(zone.cards, 'press'), 0)
      : state.aiField.reduce((sum, zone) => sum + countIcons(zone.cards, 'press'), 0)
    
    const newControlPosition = Math.min(state.controlPosition + pressCount, 10)
    
    return {
      ...state,
      controlPosition: newControlPosition,
      message: `控球权移动到 ${newControlPosition}`
    }
  }
  
  return state
}

function placeCard(state, card, zone, startCol) {
  const field = state.currentTurn === 'player' ? state.playerField : state.aiField
  const hand = state.currentTurn === 'player' ? state.playerHand : state.aiHand
  
  const validation = validateCardPlacement(card, field, zone, startCol, state.isFirstTurn)
  
  if (!validation.valid) {
    return {
      ...state,
      message: validation.reason || '无法放置卡牌'
    }
  }
  
  const targetZone = field.find(z => z.zone === zone)
  if (!targetZone) {
    return state
  }
  
  const newZone = {
    ...targetZone,
    cards: [...targetZone.cards, card],
    slots: targetZone.slots.map((s) => {
      if (s.position === startCol || s.position === startCol + 1) {
        return { ...s, playerCard: card }
      }
      return s
    })
  }
  
  const newField = field.map(z => z.zone === zone ? newZone : z)
  const newHand = hand.filter(c => c.id !== card.id)
  
  return {
    ...state,
    [state.currentTurn === 'player' ? 'playerField' : 'aiField']: newField,
    [state.currentTurn === 'player' ? 'playerHand' : 'aiHand']: newHand,
    selectedCard: card,
    message: `${card.name} 已放置到 Zone ${zone}`
  }
}

function performShot(state, card, slot, zone) {
  const attackPower = card.attack
  const controlState = getControlState(state.controlPosition)
  const maxSynergy = getMaxSynergyCards(controlState)
  
  const pendingShot = {
    attacker: {
      card,
      zone,
      slot,
      usedShotIcons: []
    },
    defender: null,
    phase: 'init',
    attackerPower: attackPower,
    defenderPower: 0,
    attackSynergy: [],
    defenseSynergy: [],
    activatedSkills: {
      attackerSkills: [],
      defenderSkills: []
    },
    result: null
  }
  
  return {
    ...state,
    pendingShot,
    message: '选择协同卡来增强射门'
  }
}

function performSubstitution(state, incomingCard, outgoingCard, zone, slot) {
  const hand = state.currentTurn === 'player' ? state.playerHand : state.aiHand
  const bench = state.currentTurn === 'player' ? state.playerBench : state.aiBench
  const field = state.currentTurn === 'player' ? state.playerField : state.aiField
  const subsLeft = state.currentTurn === 'player' ? state.playerSubstitutionsLeft : state.aiSubstitutionsLeft
  
  if (subsLeft <= 0) {
    return { ...state, message: '换人次数已用完' }
  }
  
  const newHand = hand.filter(c => c.id !== incomingCard.id)
  const newBench = [...bench.filter(c => c.id !== incomingCard.id), outgoingCard]
  
  const targetZone = field.find(z => z.zone === zone)
  const newZone = {
    ...targetZone,
    cards: targetZone.cards.map(c => c.id === outgoingCard.id ? incomingCard : c),
    slots: targetZone.slots.map((s, i) => 
      i === slot && s.playerCard?.id === outgoingCard.id ? { ...s, playerCard: incomingCard } : s
    )
  }
  
  const newField = field.map(z => z.zone === zone ? newZone : z)
  
  return {
    ...state,
    [state.currentTurn === 'player' ? 'playerHand' : 'aiHand']: newHand,
    [state.currentTurn === 'player' ? 'playerBench' : 'aiBench']: newBench,
    [state.currentTurn === 'player' ? 'playerField' : 'aiField']: newField,
    [state.currentTurn === 'player' ? 'playerSubstitutionsLeft' : 'aiSubstitutionsLeft']: subsLeft - 1,
    message: `${incomingCard.name} 替换 ${outgoingCard.name}`
  }
}

function performEndTurn(state) {
  const isHalfTime = state.phase === 'firstHalf' && state.turnCount >= 10
  const isFullTime = state.phase === 'secondHalf' && state.turnCount >= 10
  
  if (isHalfTime) {
    return {
      ...state,
      phase: 'halfTime',
      message: '中场休息'
    }
  }
  
  if (isFullTime) {
    return {
      ...state,
      phase: 'fullTime',
      message: '比赛结束'
    }
  }
  
  const newTurn = state.currentTurn === 'player' ? 'ai' : 'player'
  const newTurnCount = newTurn === 'player' ? state.turnCount + 1 : state.turnCount
  
  return {
    ...state,
    currentTurn: newTurn,
    turnCount: newTurnCount,
    turnPhase: 'teamAction',
    selectedCard: null,
    selectedSynergyCards: [],
    currentAction: 'none',
    message: newTurn === 'player' ? '你的回合！' : 'AI正在思考...'
  }
}

module.exports = {
  createInitialState,
  performCoinToss,
  startDraftRound,
  pickDraftCard,
  finishSquadSelection,
  performTeamAction,
  placeCard,
  performShot,
  performSubstitution,
  performEndTurn
}
