/**
 * Turn Phase Management Service
 * 
 * This service provides unified management for turn phases,
 * ensuring consistent behavior across the entire application.
 * 
 * Turn Phases:
 * - 'start': Match start, initial setup
 * - 'teamAction': Team action phase (pass, press)
 * - 'playerAction': Player action phase (place cards, shoot)
 * - 'shooting': Shooting phase (duel resolution)
 * - 'end': End turn phase
 * 
 * Key responsibilities:
 * - Manage turn phase transitions
 * - Validate actions based on current phase
 * - Handle automatic phase transitions
 * - Ensure consistent phase behavior
 */

import type { GameState } from './gameLogic';
import type { TurnPhase } from '../types/game';

/**
 * Turn phase configuration
 */
export const TURN_PHASE_CONFIG = {
  start: {
    name: 'Start',
    description: 'Match start, initial setup',
    allowPlaceCard: true,
    allowTeamAction: false,
    allowShooting: false,
    autoTransition: 'teamAction',
  },
  teamAction: {
    name: 'Team Action',
    description: 'Team action phase (pass, press)',
    allowPlaceCard: true,
    allowTeamAction: true,
    allowShooting: false,
    autoTransition: 'playerAction',
  },
  playerAction: {
    name: 'Player Action',
    description: 'Player action phase (place cards, shoot)',
    allowPlaceCard: true,
    allowTeamAction: false,
    allowShooting: true,
    autoTransition: null,
  },
  shooting: {
    name: 'Shooting',
    description: 'Shooting phase (duel resolution)',
    allowPlaceCard: false,
    allowTeamAction: false,
    allowShooting: false,
    autoTransition: null,
  },
  end: {
    name: 'End Turn',
    description: 'End turn phase',
    allowPlaceCard: false,
    allowTeamAction: false,
    allowShooting: false,
    autoTransition: null,
  },
} as const;

/**
 * Turn phase management service
 */
export class TurnPhaseService {
  /**
   * Check if an action is allowed in current phase
   * 
   * @param currentPhase - Current turn phase
   * @param actionType - Type of action to check
   * @returns True if action is allowed
   */
  static isActionAllowed(currentPhase: TurnPhase, actionType: 'placeCard' | 'teamAction' | 'shooting'): boolean {
    const phaseConfig = TURN_PHASE_CONFIG[currentPhase];
    
    switch (actionType) {
      case 'placeCard':
        return phaseConfig.allowPlaceCard;
      case 'teamAction':
        return phaseConfig.allowTeamAction;
      case 'shooting':
        return phaseConfig.allowShooting;
      default:
        return false;
    }
  }

  /**
   * Get the next phase after current phase
   * 
   * @param currentPhase - Current turn phase
   * @param state - Current game state
   * @returns Next phase or null if no automatic transition
   */
  static getNextPhase(currentPhase: TurnPhase, state: GameState): TurnPhase | null {
    const phaseConfig = TURN_PHASE_CONFIG[currentPhase];
    
    // Check if there's an automatic transition
    if (phaseConfig.autoTransition) {
      return phaseConfig.autoTransition;
    }
    
    // Special case: teamAction automatically transitions to playerAction
    if (currentPhase === 'teamAction') {
      return 'playerAction';
    }
    
    return null;
  }

  /**
   * Check if team action phase should be skipped
   * 
   * @param state - Current game state
   * @returns True if team action should be skipped
   */
  static shouldSkipTeamAction(state: GameState): boolean {
    // Skip team action on first turn if no pass/press icons
    if (state.isFirstTurn) {
      const field = state.currentTurn === 'player' ? state.playerField : state.aiField;
      let hasPassOrPressIcons = false;
      
      field.forEach((zone) => {
        zone.slots.forEach((slot) => {
          if (slot.athleteCard) {
            const hasPass = slot.athleteCard.icons.includes('pass');
            const hasPress = slot.athleteCard.icons.includes('press');
            if (hasPass || hasPress) {
              hasPassOrPressIcons = true;
            }
          }
        });
      });
      
      // If no pass/press icons, skip team action
      return !hasPassOrPressIcons;
    }
    
    return false;
  }

  /**
   * Get initial phase for a new turn
   * 
   * @param state - Current game state
   * @returns Initial phase for the turn
   */
  static getInitialPhase(state: GameState): TurnPhase {
    // Check if team action should be skipped
    if (this.shouldSkipTeamAction(state)) {
      return 'playerAction';
    }
    
    return 'teamAction';
  }

  /**
   * Transition to next phase
   * 
   * @param state - Current game state
   * @returns New game state with updated phase
   */
  static transitionToNextPhase(state: GameState): GameState {
    const currentPhase = state.turnPhase as TurnPhase;
    const nextPhase = this.getNextPhase(currentPhase, state);
    
    if (nextPhase) {
      return {
        ...state,
        turnPhase: nextPhase,
      };
    }
    
    return state;
  }

  /**
   * Check if current phase allows card placement
   * 
   * @param currentPhase - Current turn phase
   * @returns True if card placement is allowed
   */
  static canPlaceCard(currentPhase: TurnPhase): boolean {
    return TURN_PHASE_CONFIG[currentPhase].allowPlaceCard;
  }

  /**
   * Check if current phase allows team action
   * 
   * @param currentPhase - Current turn phase
   * @returns True if team action is allowed
   */
  static canPerformTeamAction(currentPhase: TurnPhase): boolean {
    return TURN_PHASE_CONFIG[currentPhase].allowTeamAction;
  }

  /**
   * Check if current phase allows shooting
   * 
   * @param currentPhase - Current turn phase
   * @returns True if shooting is allowed
   */
  static canShoot(currentPhase: TurnPhase): boolean {
    return TURN_PHASE_CONFIG[currentPhase].allowShooting;
  }
}