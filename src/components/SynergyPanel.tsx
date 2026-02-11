import React from 'react';

interface Props {
  variant: 'player' | 'opponent';
  deckCount: number;
  discardCount?: number;
  handCount?: number;
  onOpenPile?: (pile: 'deck' | 'discard') => void;
}

export const SynergyPanel: React.FC<Props> = ({
  variant,
  deckCount,
  discardCount = 0,
  handCount = 0,
  onOpenPile,
}) => {
  const isOpponent = variant === 'opponent';
  const bubblePosClass = isOpponent ? '-left-3' : '-right-3';
  return (
    <div className="relative flex flex-row gap-4 justify-center items-center px-4">
      {/* Deck */}
      <div
        className={`group relative w-32 h-20 ${onOpenPile ? 'cursor-pointer' : ''} transition-all duration-300 ease-out hover:scale-105 hover:translate-y-1`}
        style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
        onClick={() => onOpenPile && onOpenPile('deck')}
      >
        <div className="absolute top-[2px] left-[2px] w-full h-full bg-stone-900 rounded border border-white/10 shadow-xl" style={{ transform: 'translateZ(-2px)' }} />
        <div className="absolute top-[4px] left-[4px] w-full h-full bg-stone-900 rounded border border-white/10 shadow-xl" style={{ transform: 'translateZ(-4px)' }} />
        <div className="absolute top-[6px] left-[6px] w-full h-full bg-stone-950 rounded border border-white/5 shadow-xl" style={{ transform: 'translateZ(-6px)' }} />
        <div className={`absolute top-0 left-0 w-full h-full ${isOpponent ? 'bg-gradient-to-br from-indigo-900 via-slate-800 to-stone-950' : 'bg-gradient-to-br from-green-900 via-emerald-800 to-teal-950'} rounded border border-white/40 shadow-2xl flex flex-col items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 opacity-40 bg-[url('/images/pattern_dot.png')] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="relative w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center mb-2 bg-white/5 backdrop-blur-sm">
            <span className="text-2xl filter drop-shadow-md">⚽</span>
          </div>
          <span className="relative text-[10px] text-white/90 font-black uppercase tracking-[0.2em]">{isOpponent ? 'OPPONENT' : 'SYNERGY'}</span>
          <span className="relative text-[8px] text-white/50 font-bold uppercase tracking-widest mt-0.5">DECK</span>
        </div>
        <div className={`absolute -top-3 ${bubblePosClass} w-7 h-7 bg-white text-stone-900 border-stone-900 font-black text-xs rounded-full flex items-center justify-center border-2 shadow-xl z-10 group-hover:scale-110 transition-transform`}>
          {deckCount}
        </div>
      </div>

      {/* Discard for player, stylized card back for opponent */}
      <div
        className="group relative w-32 h-20 transition-all duration-300 ease-out hover:scale-105 hover:translate-y-1"
        style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}
        onClick={() => onOpenPile && onOpenPile('discard')}
      >
        <div className="absolute top-[1px] left-[1px] w-full h-full bg-stone-900/80 rounded border border-white/5 shadow-lg rotate-[-2deg]" style={{ transform: 'translateZ(-1px)' }} />
        <div className="absolute top-[2px] left-[-1px] w-full h-full bg-stone-950/80 rounded border border-white/5 shadow-lg rotate-[1deg]" style={{ transform: 'translateZ(-2px)' }} />
        {isOpponent ? (
          <>
            <div className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(1px)' }}>
              <div className="w-full h-full bg-stone-800 rounded border border-white/10 flex flex-col items-center justify-center overflow-hidden -rotate-3 shadow-2xl">
                <div className="absolute inset-0 bg-red-900/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="relative text-2xl opacity-20 mb-2 filter grayscale">♻️</span>
                <span className="relative text-[8px] text-white/20 font-bold uppercase tracking-widest">DISCARD</span>
              </div>
            </div>
            <div className={`absolute -top-3 ${bubblePosClass} w-7 h-7 bg-stone-800 text-white/60 font-bold text-xs rounded-full flex items-center justify-center border-2 border-stone-700 shadow-lg z-10 group-hover:scale-110 transition-transform`}>
              {discardCount}
            </div>
          </>
        ) : (
          <>
            {discardCount > 0 ? (
              <div className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(1px)' }}>
                <div className="w-full h-full bg-stone-800 rounded border border-white/20 flex flex-col items-center justify-center overflow-hidden rotate-3 shadow-2xl">
                  <div className="absolute inset-0 bg-green-900/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="relative text-2xl opacity-40 mb-2 filter grayscale">♻️</span>
                  <span className="relative text-[8px] text-white/40 font-bold uppercase tracking-widest">DISCARD</span>
                </div>
                <div className="absolute inset-0 hover:bg-white/5 transition-colors rounded rotate-3" />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded border-2 border-dashed border-white/10 bg-white/5">
                <span className="text-2xl mb-2 opacity-10">♻️</span>
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-10">EMPTY</span>
              </div>
            )}
            <div className={`absolute -top-3 ${bubblePosClass} w-7 h-7 bg-stone-800 text-white/60 font-bold text-xs rounded-full flex items-center justify-center border-2 border-stone-700 shadow-lg z-10 group-hover:scale-110 transition-transform`}>
              {discardCount}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
