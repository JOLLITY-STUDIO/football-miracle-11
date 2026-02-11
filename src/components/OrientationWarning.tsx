import React, { useState, useEffect } from 'react';

export const OrientationWarning: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if it's a mobile device and in portrait mode
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isMobile && isPortraitMode);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-stone-900 flex flex-col items-center justify-center p-8 text-center lg:hidden">
      <div className="w-24 h-24 mb-8 relative">
        <div className="absolute inset-0 border-4 border-white/20 rounded-2xl animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center animate-bounce">
          <span className="text-6xl">📱</span>
        </div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-4xl animate-[spin_2s_linear_infinite]">
          🔄
        </div>
      </div>
      
      <h2 className="text-2xl font-black text-white mb-4 tracking-wider uppercase">
        Please Rotate Your Device
      </h2>
      
      <p className="text-stone-400 max-w-xs leading-relaxed">
        Football Miracle 11 is optimized for <span className="text-yellow-500 font-bold">Landscape</span> mode to provide the best tactical experience.
      </p>

      <div className="mt-12 flex gap-4">
        <div className="w-12 h-8 border-2 border-white/20 rounded-sm rotate-90"></div>
        <div className="text-white/20 text-2xl">➔</div>
        <div className="w-12 h-8 border-2 border-yellow-500/50 rounded-sm"></div>
      </div>
    </div>
  );
}; 
