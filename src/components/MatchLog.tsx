import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchLogProps {
  logs: string[];
}

export const MatchLog: React.FC<MatchLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

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
          {logs.map((log, index) => {
            const isDuel = log.startsWith('[Duel]');
            const isSystem = log.startsWith('Game') || log.includes('Turn');
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-[11px] leading-relaxed p-2 rounded-lg border ${
                  isDuel 
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' 
                    : isSystem
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200 font-bold'
                    : 'bg-white/5 border-white/5 text-white/80'
                }`}
              >
                <div className="flex gap-2">
                  <span className="opacity-30 font-mono text-[9px] mt-0.5">{(index + 1).toString().padStart(2, '0')}</span>
                  <span>{log}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      <div className="px-4 py-1 border-t border-white/5 bg-black/20">
        <div className="text-[8px] text-white/20 uppercase tracking-widest text-right">
          Live Tracking Active
        </div>
      </div>
    </div>
  );
};
