const GAME_CONFIG = {
  FIELD: {
    ZONES: 4,
    ROWS: 8,
    COLS: 4
  },
  PLAYERS: {
    STARTING: 10,
    SUBSTITUTES: 3,
    TOTAL: 13
  },
  DRAFT: {
    ROUNDS: 3,
    CARDS_PER_ROUND: 3
  },
  MATCH: {
    HALVES: 2,
    MAX_SYNERGY_ATTACK: 3,
    MAX_SYNERGY_NORMAL: 2,
    MAX_SYNERGY_DEFENSE: 0
  },
  CONTROL: {
    MIN: 0,
    MAX: 10,
    ATTACK_ZONE: [0, 2],
    NORMAL_ZONE: [3, 7],
    DEFENSE_ZONE: [8, 10]
  },
  HAND: {
    MAX_CARDS: 5
  }
}

module.exports = GAME_CONFIG
