import React from 'react';
import type { GameRecord } from '../game/gameRecorder';
import { loadAllGameRecords, deleteGameRecord, clearAllGameRecords } from '../game/gameRecorder';
import { athleteCards, synergyCards } from '../data/cards';

interface Props {
  onBack: () => void;
  onSelectRecord: (record: GameRecord) => void;
}

export const GameRecordList: React.FC<Props> = ({ onBack, onSelectRecord }) => {
  const [records, setRecords] = React.useState<GameRecord[]>([]);

  React.useEffect(() => {
    setRecords(loadAllGameRecords());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Delete this record£¿')) {
      deleteGameRecord(id);
      setRecords(loadAllGameRecords());
    }
  };

  const handleClearAll = () => {
    if (confirm('Delete all records£¿')) {
      clearAllGameRecords();
      setRecords([]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getWinnerText = (winner?: 'player' | 'ai' | 'draw') => {
    switch (winner) {
      case 'player': return 'Win';
      case 'ai': return 'Lose';
      case 'draw': return 'Draw';
      default: return 'In Progress';
    }
  };

  const getWinnerColor = (winner?: 'player' | 'ai' | 'draw') => {
    switch (winner) {
      case 'player': return 'text-green-600';
      case 'ai': return 'text-red-600';
      case 'draw': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-green-500 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-white hover:text-gray-200">
            ¡û Back
          </button>
          <h1 className="text-xl font-bold text-white">Match History</h1>
          {records.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-200 hover:text-red-400 text-sm"
            >
              Clear All
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="bg-white/90 rounded-lg p-8 text-center text-gray-500">
            No match records
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white/90 rounded-lg p-3 shadow cursor-pointer hover:bg-white transition-all"
                onClick={() => onSelectRecord(record)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`font-bold ${getWinnerColor(record.winner)}`}>
                      {getWinnerText(record.winner)}
                    </span>
                    {record.finalScore && (
                      <span className="text-gray-600 ml-2">
                        {record.finalScore.player} - {record.finalScore.ai}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record.id);
                    }}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(record.startTime)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Total {record.actions.length} actions
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ReplayViewerProps {
  record: GameRecord;
  onBack: () => void;
}

export const ReplayViewer: React.FC<ReplayViewerProps> = ({ record, onBack }) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const formatAction = (action: typeof record.actions[0]) => {
    const actor = action.actor === 'player' ? 'You' : 'AI';
    const cardById = (id: string) => athleteCards.find(c => c.id === id)?.name || id;
    const synergyById = (id: string) => synergyCards.find(c => c.id === id)?.name || id;

    switch (action.type) {
      case 'place_card':
        return `${actor} ${cardById(action.details.cardId as string)} placed at ${action.details.zone}line`;
      case 'attack':
        const result = action.details.success ? 'Success' : 'Lose';
        return `${actor}Attacked£¬${result}£¡(Attack:${action.details.attackPower} vs Defense:${action.details.defensePower})`;
      case 'select_synergy':
        return `${actor} selected synergy card: ${synergyById(action.details.cardId as string)}`;
      case 'end_turn':
        return `${actor}Ended turn`;
      case 'switch_control':
        return `${actor}Changed control to: ${action.details.state}`;
      case 'penalty_result':
        const penaltyResult = action.details.result === 'win' ? 'Scored' : action.details.result === 'lose' ? 'Missed' : 'Retake';
        return `${actor}Penalty${penaltyResult}`;
      case 'ai_action':
        return `AI took action`;
      default:
        return `${actor}Executed ${action.type}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-green-500 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-white hover:text-gray-200">
            ¡û Back to List
          </button>
          <h1 className="text-xl font-bold text-white">Match Replay</h1>
          <div className="text-white text-sm">
            {record.finalScore?.player} - {record.finalScore?.ai}
          </div>
        </div>

        <div className="bg-white/90 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} / {record.actions.length}</span>
            <span>Turn {Math.floor(currentStep / 4) + 1}</span>
          </div>
          <input
            type="range"
            min={0}
            max={record.actions.length - 1}
            value={currentStep}
            onChange={(e) => setCurrentStep(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(record.actions.length - 1, currentStep + 1))}
              disabled={currentStep === record.actions.length - 1}
              className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="bg-white/90 rounded-lg p-3">
          <h3 className="font-bold text-gray-700 mb-2">Current Action</h3>
          <div className="text-gray-800">
            {record.actions[currentStep] && formatAction(record.actions[currentStep])}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-white font-bold mb-2">Full Log</h3>
          <div className="bg-white/90 rounded-lg p-3 max-h-64 overflow-y-auto space-y-1">
            {record.actions.map((action, index) => (
              <div
                key={index}
                className={`text-sm p-2 rounded cursor-pointer transition-all ${
                  index === currentStep
                    ? 'bg-green-100 border-l-4 border-green-500'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <span className="text-gray-400 mr-2">#{index + 1}</span>
                <span className={action.actor === 'player' ? 'text-blue-600' : 'text-red-600'}>
                  {formatAction(action)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};




