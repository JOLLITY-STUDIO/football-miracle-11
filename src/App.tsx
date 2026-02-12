import { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { PreGame } from './components/PreGame';
import { GameBoard } from './components/GameBoard';
import { GameRecordList, ReplayViewer } from './components/GameRecordList';
import { CardGuide } from './components/CardGuide';
import { BackgroundMusic } from './components/BackgroundMusic';
import { OrientationWarning } from './components/OrientationWarning';
import type { GameRecord } from './game/gameRecorder';
import type { PlayerCard } from './data/cards';

type GameView = 'menu' | 'preGame' | 'game' | 'records' | 'replay' | 'cardGuide';
type RenderMode = '2d' | '3d';

function App() {
  const [currentView, setCurrentView] = useState<GameView>('menu');
  const [selectedRecord, setSelectedRecord] = useState<GameRecord | null>(null);
  const [playerTeam, setPlayerTeam] = useState<{ starters: PlayerCard[]; substitutes: PlayerCard[]; initialField?: any[] } | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>('2d');

  const handleQuickStart = () => {
    setPlayerTeam(null);
    setRenderMode('2d');
    setCurrentView('game');
  };

  const handleQuickStart3D = () => {
    setPlayerTeam(null);
    setRenderMode('3d');
    setCurrentView('game');
  };

  const handleStartAI = () => {
    setCurrentView('preGame');
  };

  const handleTeamComplete = (starters: PlayerCard[], substitutes: PlayerCard[], initialField: any[]) => {
    setPlayerTeam({ starters, substitutes, initialField });
    setRenderMode('2d');
    setCurrentView('game');
  };

  const handleTeamComplete3D = (starters: PlayerCard[], substitutes: PlayerCard[], initialField: any[]) => {
    setPlayerTeam({ starters, substitutes, initialField });
    setRenderMode('3d');
    setCurrentView('game');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setSelectedRecord(null);
  };

  const handleViewRecords = () => {
    setCurrentView('records');
  };

  const handleCardGuide = () => {
    setCurrentView('cardGuide');
  };

  const handleSelectRecord = (record: GameRecord) => {
    setSelectedRecord(record);
    setCurrentView('replay');
  };

  return (
    <div className="min-h-screen">
      {currentView !== 'game' && <BackgroundMusic />}
      <OrientationWarning />
      {currentView === 'menu' && (
        <MainMenu
          onStartGame={handleQuickStart}
          onStartGame3D={handleQuickStart3D}
          onStartAI={handleStartAI}
          onViewRecords={handleViewRecords}
          onCardGuide={handleCardGuide}
        />
      )}
      {currentView === 'preGame' && (
        <PreGame onComplete={handleTeamComplete} onComplete3D={handleTeamComplete3D} onBack={handleBackToMenu} />
      )}
      {currentView === 'game' && (
        <GameBoard onBack={handleBackToMenu} playerTeam={playerTeam} renderMode={renderMode} />
      )}
      {currentView === 'records' && (
        <GameRecordList
          onBack={handleBackToMenu}
          onSelectRecord={handleSelectRecord}
        />
      )}
      {currentView === 'replay' && selectedRecord && (
        <ReplayViewer
          record={selectedRecord}
          onBack={() => setCurrentView('records')}
        />
      )}
      {currentView === 'cardGuide' && (
        <CardGuide onBack={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;
