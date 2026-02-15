const GAME_CONFIG = require('./gameConfig')

function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function getControlState(controlPosition) {
  if (controlPosition <= GAME_CONFIG.CONTROL.ATTACK_ZONE[1]) {
    return 'attack'
  } else if (controlPosition >= GAME_CONFIG.CONTROL.DEFENSE_ZONE[0]) {
    return 'defense'
  }
  return 'normal'
}

function getMaxSynergyCards(controlState) {
  switch (controlState) {
    case 'attack':
      return GAME_CONFIG.MATCH.MAX_SYNERGY_ATTACK
    case 'normal':
      return GAME_CONFIG.MATCH.MAX_SYNERGY_NORMAL
    case 'defense':
      return GAME_CONFIG.MATCH.MAX_SYNERGY_DEFENSE
    default:
      return 0
  }
}

function countIcons(card, iconType) {
  return card.icons.filter(icon => icon === iconType).length
}

function calculateAttackPower(card, synergyCards = []) {
  let power = card.attack
  synergyCards.forEach(synergy => {
    if (synergy.type === 'attack') {
      power += synergy.value
    }
  })
  return power
}

function calculateDefensePower(card, synergyCards = []) {
  let power = card.defense
  synergyCards.forEach(synergy => {
    if (synergy.type === 'defense') {
      power += synergy.value
    }
  })
  return power
}

function canPlaceCard(card, zone, field) {
  return card.zones.includes(zone)
}

function getValidZones(card) {
  return card.zones
}

function isHalfTime(phase, turnCount) {
  return phase === 'firstHalf' && turnCount >= 10
}

function isFullTime(phase, turnCount) {
  return phase === 'secondHalf' && turnCount >= 10
}

function validateCardPlacement(card, field, zone, startCol, isFirstTurn) {
  const targetZone = field.find(z => z.zone === zone)
  if (!targetZone) {
    return { valid: false, reason: 'Zone not found' }
  }
  
  if (startCol < 0 || startCol > 6) {
    return { valid: false, reason: 'Invalid column position' }
  }
  
  if (!card.zones.includes(zone)) {
    return { valid: false, reason: 'Card cannot be placed in this zone' }
  }
  
  const slot1 = targetZone.slots.find(s => s.position === startCol)
  const slot2 = targetZone.slots.find(s => s.position === startCol + 1)
  
  if (!slot1 || !slot2) {
    return { valid: false, reason: 'Slot not found' }
  }
  
  if (slot1.playerCard || slot2.playerCard) {
    return { valid: false, reason: 'Slot already occupied' }
  }
  
  const hasAnyCard = field.some(z => z.slots.some(s => s.playerCard))
  
  if (zone === 1) {
    if (!hasAnyCard) {
      return { valid: false, reason: 'First card cannot be placed in Zone 1 (Front)' }
    }
    
    const zone1 = field.find(z => z.zone === 1)
    const zone2 = field.find(z => z.zone === 2)
    
    const hasAdjacentInZone1 = zone1?.slots.some(s => 
      s.playerCard && Math.abs(s.position - startCol) <= 1
    )
    const hasBehindInZone2 = zone2?.slots.some(s => 
      s.playerCard && Math.abs(s.position - startCol) <= 1
    )
    
    if (!hasAdjacentInZone1 && !hasBehindInZone2) {
      return { valid: false, reason: 'Zone 1 requires adjacent card in Zone 1 or Zone 2' }
    }
  }
  
  return { valid: true }
}

function getValidPlacements(cards, field, isFirstTurn) {
  const placements = []
  
  cards.forEach(card => {
    field.forEach(zone => {
      for (let col = 0; col <= 6; col++) {
        const result = validateCardPlacement(card, field, zone.zone, col, isFirstTurn)
        if (result.valid) {
          placements.push({ card, zone: zone.zone, startCol: col })
        }
      }
    })
  })
  
  return placements
}

function canShoot(card, field, zone, slot, gameState, isPlayer) {
  if (!card.icons.includes('attack')) {
    return { valid: false, reason: 'Card does not have attack icon' }
  }
  
  const targetField = isPlayer ? gameState.playerField : gameState.aiField
  const targetZone = targetField.find(z => z.zone === zone)
  const targetSlot = targetZone?.slots.find(s => s.position === slot)
  
  if (!targetSlot || !targetSlot.playerCard) {
    return { valid: false, reason: 'Card not found on field' }
  }
  
  if (targetSlot.playerCard.id !== card.id) {
    return { valid: false, reason: 'Card mismatch' }
  }
  
  if (gameState.turnPhase !== 'playerAction') {
    return { valid: false, reason: 'Cannot shoot during this phase' }
  }
  
  if (gameState.phase !== 'firstHalf' && gameState.phase !== 'secondHalf') {
    return { valid: false, reason: 'Cannot shoot during this phase' }
  }
  
  return { valid: true }
}

function getValidAttackers(field, gameState, isPlayer) {
  const attackers = []
  
  field.forEach(zone => {
    zone.slots.forEach(slot => {
      if (slot.playerCard) {
        const result = canShoot(slot.playerCard, field, zone.zone, slot.position, gameState, isPlayer)
        if (result.valid) {
          attackers.push({ zone: zone.zone, slot: slot.position, card: slot.playerCard })
        }
      }
    })
  })
  
  return attackers
}

module.exports = {
  shuffleArray,
  getControlState,
  getMaxSynergyCards,
  countIcons,
  calculateAttackPower,
  calculateDefensePower,
  canPlaceCard,
  getValidZones,
  isHalfTime,
  isFullTime,
  validateCardPlacement,
  getValidPlacements,
  canShoot,
  getValidAttackers
}
