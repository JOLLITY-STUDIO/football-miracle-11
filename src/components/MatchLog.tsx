import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchLogEntry {
  id: string;
  timestamp: Date;
  type: 'duel' | 'system' | 'action' | 'skill' | 'synergy' | 'result';
  phase?: string;
  step?: string;
  attacker?: string;
  defender?: string;
  attackPower?: number;
  defensePower?: number;
  synergyCards?: number;
  skills?: string[];
  result?: 'goal' | 'save' | 'miss';
  message: string;
}

interface MatchLogProps {
  logs: MatchLogEntry[];
}

export const MatchLog: React.FC<MatchLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyles = (type: MatchLogEntry['type']) => {
    switch (type) {
      case 'duel':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-200';
      case 'system':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200 font-bold';
      case 'action':
        return 'bg-green-500/10 border-green-500/20 text-green-200';
      case 'skill':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-200';
      case 'synergy':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200';
      case 'result':
        return 'bg-red-500/10 border-red-500/20 text-red-200 font-bold';
      default:
        return 'bg-white/5 border-white/5 text-white/80';
    }
  };

  const getLogIcon = (type: MatchLogEntry['type']) => {
    switch (type) {
      case 'duel':
        return '⚔️';
      case 'system':
        return '⚙️';
      case 'action':
        return '⚡';
      case 'skill':
        return '✨';
      case 'synergy':
        return '🔄';
      case 'result':
        return '🎯';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 1 
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="px-4 py-2 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Match Log</h3>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {logs.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`text-[11px] leading-relaxed p-2 rounded-lg border ${getLogStyles(entry.type)}`}
            >
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs">{getLogIcon(entry.type)}</span>
                  <span className="opacity-30 font-mono text-[8px]">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {entry.phase && (
                      <span className="text-[9px] px-2 py-0.5 bg-white/10 rounded-full border border-white/20">
                        {entry.phase}
                      </span>
                    )}
                    {entry.step && (
                      <span className="text-[9px] px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
                        {entry.step}
                      </span>
                    )}
                  </div>
                  <div className="text-white/90">{entry.message}</div>
                  
                  {/* Detailed breakdown for duel entries */}
                  {entry.type === 'duel' && (entry.attackPower !== undefined || entry.defensePower !== undefined) && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]">
                      {entry.attackPower !== undefined && (
                        <div className="bg-blue-500/10 rounded p-1 border border-blue-500/20">
                          <div className="text-blue-300 font-semibold">Attack Power</div>
                          <div className="text-white">{entry.attackPower}</div>
                        </div>
                      )}
                      {entry.defensePower !== undefined && (
                        <div className="bg-red-500/10 rounded p-1 border border-red-500/20">
                          <div className="text-red-300 font-semibold">Defense Power</div>
                          <div className="text-white">{entry.defensePower}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Synergy cards breakdown */}
                  {entry.type === 'synergy' && entry.synergyCards && (
                    <div className="mt-2 text-[9px] text-white/70">
                      Synergy Cards: {entry.synergyCards} revealed
                    </div>
                  )}
                  
                  {/* Skills breakdown */}
                  {entry.type === 'skill' && entry.skills && entry.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.skills.map((skill, i) => (
                        <span key={i} className="text-[8px] px-2 py-0.5 bg-purple-500/20 rounded-full border border-purple-400/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Result indicator */}
                  {entry.type === 'result' && entry.result && (
                    <div className={`mt-2 px-2 py-1 rounded text-[9px] font-bold ${
                      entry.result === 'goal' ? 'bg-green-500/20 text-green-300' :
                      entry.result === 'save' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      Result: {entry.result.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="px-4 py-1 border-t border-white/5 bg-black/20">
        <div className="flex justify-between items-center">
          <div className="text-[8px] text-white/20 uppercase tracking-widest">
            {logs.length} entries
          </div>
          <div className="text-[8px] text-white/20 uppercase tracking-widest">
            Live Tracking Active
          </div>
        </div>
      </div>
    </div>
  );
};
