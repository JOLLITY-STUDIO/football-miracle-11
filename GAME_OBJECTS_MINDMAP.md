# Football Miracle 11 - Game Objects Mind Map

## Game Architecture Overview

```mermaid
graph TD
    subgraph Game_Core
        GameState["GameState"] --> GameAction["GameAction"]
        GameState --> TurnPhase["TurnPhase"]
        GameState --> GamePhase["GamePhase"]
        GameState --> ControlPosition["ControlPosition"]
        GameState --> PlayerScore["PlayerScore"]
        GameState --> AIScore["AIScore"]
    end

    subgraph Player_System
        PlayerField["PlayerField"] --> FieldZones["FieldZones"]
        PlayerHand["PlayerAthleteHand"] --> AthleteCards["AthleteCards"]
        PlayerBench["PlayerBench"] --> SubstituteCards["SubstituteCards"]
        PlayerSynergy["PlayerSynergyHand"] --> SynergyCards["SynergyCards"]
    end

    subgraph AI_System
        AIField["AIField"] --> AIZones["AIZones"]
        AIHand["AIAthleteHand"] --> AIAthleteCards["AIAthleteCards"]
        AIBench["AIBench"] --> AISubstituteCards["AISubstituteCards"]
        AISynergy["AISynergyHand"] --> AISynergyCards["AISynergyCards"]
    end

    subgraph Card_System
        AthleteCard["AthleteCard"] --> Icons["Icons"]
        AthleteCard --> Power["Power"]
        AthleteCard --> Skills["Skills"]
        AthleteCard --> Position["Position"]
        SynergyCard["SynergyCard"] --> Value["Value"]
        SynergyCard --> Effect["Effect"]
    end

    subgraph Field_System
        FieldZone["FieldZone"] --> Slots["Slots"]
        FieldSlot["FieldSlot"] --> AthleteCardRef["AthleteCardRef"]
        FieldIcons["FieldIcons"] --> TacticalIcons["TacticalIcons"]
        FieldVisuals["FieldVisuals"] --> Pitch["Pitch"]
    end

    subgraph Game_Flow
        TeamAction["TeamAction"] --> Pass["Pass"]
        TeamAction --> Press["Press"]
        PlayerAction["PlayerAction"] --> PlaceCard["PlaceCard"]
        PlayerAction --> Shoot["Shoot"]
        ShootingPhase["ShootingPhase"] --> Duel["Duel"]
        Duel --> AttackPower["AttackPower"]
        Duel --> DefensePower["DefensePower"]
    end

    subgraph Services
        TurnPhaseService["TurnPhaseService"] --> PhaseValidation["PhaseValidation"]
        CardPlacementService["CardPlacementService"] --> PlacementRules["PlacementRules"]
        GameLogic["GameLogic"] --> StateManagement["StateManagement"]
        AILogic["AILogic"] --> AIDecision["AIDecision"]
    end

    subgraph UI_Components
        GameBoard["GameBoard"] --> CenterField["CenterField"]
        CenterField --> GameFieldComp["GameField"]
        GameBoard --> ActionButtons["ActionButtons"]
        GameBoard --> AthleteCardComponent["AthleteCardComponent"]
        GameBoard --> SynergyCardComponent["SynergyCardComponent"]
        GameBoard --> TurnInfo["TurnInfo"]
    end

    Game_Core --> Player_System
    Game_Core --> AI_System
    Game_Core --> Card_System
    Game_Core --> Field_System
    Game_Core --> Game_Flow
    Game_Core --> Services
    Services --> UI_Components
    Field_System --> UI_Components
    Card_System --> UI_Components
    Game_Flow --> UI_Components
```

## Detailed Object Relationships

### 1. Game State Management

```mermaid
graph LR
    GameState --> TurnPhaseService
    GameState --> CardPlacementService
    GameState --> GameLogic
    GameState --> AILogic
    GameState --> TurnInfo
    TurnPhaseService --> TurnPhase
    TurnPhaseService --> GamePhase
    TurnPhaseService --> TeamAction
    TurnPhaseService --> PlayerAction
```

### 2. Field and Card System

```mermaid
graph LR
    FieldZone --> FieldSlot
    FieldSlot --> AthleteCard
    AthleteCard --> Icons
    AthleteCard --> Skills
    AthleteCard --> Power
    FieldIcons --> Icons
    FieldIcons --> TacticalIcons
    FieldIcons --> CompleteIcons
    CompleteIcons --> TeamAction
```

### 3. Game Flow Control

```mermaid
graph TD
    Start["Start Game"] --> CoinToss["Coin Toss"]
    CoinToss --> SquadSelection["Squad Selection"]
    SquadSelection --> FirstHalf["First Half"]
    FirstHalf --> TeamActionPhase["Team Action Phase"]
    TeamActionPhase --> AthleteActionPhase["Athlete Action Phase"]
    AthleteActionPhase --> ShootingPhase["Shooting Phase"]
    ShootingPhase --> EndTurn["End Turn"]
    EndTurn --> CheckHalfTime["Check Half Time"]
    CheckHalfTime --> |Not Half Time| TeamActionPhase
    CheckHalfTime --> |Half Time| HalfTimeBreak["Half Time Break"]
    HalfTimeBreak --> SecondHalf["Second Half"]
    SecondHalf --> TeamActionPhase2["Team Action Phase"]
    TeamActionPhase2 --> AthleteActionPhase2["Athlete Action Phase"]
    AthleteActionPhase2 --> ShootingPhase2["Shooting Phase"]
    ShootingPhase2 --> EndTurn2["End Turn"]
    EndTurn2 --> CheckFullTime["Check Full Time"]
    CheckFullTime --> |Not Full Time| TeamActionPhase2
    CheckFullTime --> |Full Time| GameEnd["Game End"]
    GameEnd --> FinalScore["Final Score"]
```

### 4. UI Component Hierarchy

```mermaid
graph TD
    GameBoard --> Header["Header"]
    GameBoard --> CenterField["CenterField"]
    GameBoard --> ActionPanel["ActionPanel"]
    GameBoard --> Footer["Footer"]
    
    CenterField --> FieldVisuals["FieldVisuals"]
    CenterField --> GameField["GameField"]
    CenterField --> FieldIcons["FieldIcons"]
    
    GameField --> AIField["AIField"]
    GameField --> PlayerField["PlayerField"]
    
    ActionPanel --> TeamActionButtons["TeamActionButtons"]
    ActionPanel --> PlayerActionButtons["PlayerActionButtons"]
    ActionPanel --> ShootButton["ShootButton"]
    
    TeamActionButtons --> PassButton["PassButton"]
    TeamActionButtons --> PressButton["PressButton"]
    
    PlayerActionButtons --> PlaceCardButton["PlaceCardButton"]
    PlayerActionButtons --> EndTurnButton["EndTurnButton"]
```

### 5. Icon System Architecture

```mermaid
graph TD
    IconLayer["IconLayer"] --> TacticalIcons["TacticalIcons"]
    IconLayer --> CompleteIcons["CompleteIcons"]
    IconLayer --> ActivatedIcons["ActivatedIcons"]
    
    TacticalIcons --> AttackIcons["AttackIcons"]
    TacticalIcons --> DefenseIcons["DefenseIcons"]
    TacticalIcons --> PassIcons["PassIcons"]
    TacticalIcons --> PressIcons["PressIcons"]
    
    CompleteIcons --> PassFormations["PassFormations"]
    CompleteIcons --> PressFormations["PressFormations"]
    
    ActivatedIcons --> AttackPower["AttackPower"]
    ActivatedIcons --> DefensePower["DefensePower"]
    
    CompleteIcons --> TeamActionButtons["TeamActionButtons"]
    ActivatedIcons --> DuelSystem["DuelSystem"]
```

### 6. AI Decision System

```mermaid
graph TD
    AILogic["AILogic"] --> AITurnManager["AITurnManager"]
    AITurnManager --> AIActionSelector["AIActionSelector"]
    AIActionSelector --> TeamActionDecision["TeamActionDecision"]
    AIActionSelector --> CardPlacementDecision["CardPlacementDecision"]
    AIActionSelector --> ShootingDecision["ShootingDecision"]
    
    TeamActionDecision --> PassEvaluation["PassEvaluation"]
    TeamActionDecision --> PressEvaluation["PressEvaluation"]
    
    CardPlacementDecision --> ZoneAnalysis["ZoneAnalysis"]
    CardPlacementDecision --> AdjacencyCheck["AdjacencyCheck"]
    CardPlacementDecision --> FormationOptimization["FormationOptimization"]
    
    ShootingDecision --> AttackPowerAnalysis["AttackPowerAnalysis"]
    ShootingDecision --> DefensePowerAnalysis["DefensePowerAnalysis"]
    ShootingDecision --> SynergyCardSelection["SynergyCardSelection"]
```

## Object Relationships Summary

### Core Relationships

1. **GameState** is the central object that manages all game data
2. **TurnPhaseService** controls the flow between game phases
3. **FieldIcons** acts as intermediary between player cards and team actions
4. **CardPlacementService** validates card placement rules
5. **AILogic** handles AI decision making
6. **GameBoard** coordinates all UI components

### Data Flow

1. **Player Actions** → **GameState Updates** → **UI Updates**
2. **Card Placement** → **FieldIcons Calculation** → **Team Action Options**
3. **Turn End** → **TurnPhaseService** → **Next Phase**
4. **Shooting** → **DuelSystem** → **GameState Updates**

### Key Dependencies

1. **FieldIcons** depends on **PlayerField** for icon calculations
2. **TeamActionButtons** depends on **FieldIcons** for complete icon counts
3. **GameLogic** depends on **GameState** for state management
4. **UI Components** depend on **GameState** for data display
5. **AILogic** depends on **GameState** for decision making

## System Architecture Principles

1. **State-Driven**: All game logic is driven by GameState
2. **Separation of Concerns**: UI, game logic, and services are separate
3. **Modular Design**: Components and services are modular and reusable
4. **Clear Data Flow**: Unidirectional data flow from actions to state to UI
5. **Intermediary Layers**: Use of intermediary layers like FieldIcons for complex calculations

This architecture provides a solid foundation for the game, allowing for easy extension and maintenance as new features are added.