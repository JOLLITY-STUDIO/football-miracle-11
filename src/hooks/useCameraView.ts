import { useState, useCallback, useEffect } from 'react';

export interface ViewSettings {
  pitch: number;
  rotation: number;
  zoom: number;
  height: number;
  positionX: number;
  positionY: number;
}

export const useCameraView = (isHomeTeam: boolean) => {
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    pitch: 0,
    rotation: 0,
    zoom: 1,
    height: 0,
    positionX: 0,
    positionY: 0
  });

  const [autoScale, setAutoScale] = useState(1);
  const [showViewControls, setShowViewControls] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const baseScale = Math.min(vw / 1920, vh / 1080) * 1.1;
      setAutoScale(baseScale);
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      const moveSpeed = 10;
      setViewSettings(prev => {
        switch (event.key) {
          case 'ArrowUp':
            return { ...prev, positionY: prev.positionY + moveSpeed };
          case 'ArrowDown':
            return { ...prev, positionY: prev.positionY - moveSpeed };
          case 'ArrowLeft':
            return { ...prev, positionX: prev.positionX - moveSpeed };
          case 'ArrowRight':
            return { ...prev, positionX: prev.positionX + moveSpeed };
          default:
            return prev;
        }
      });
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleCameraView = useCallback(() => {
    setViewSettings(prev => {
      if (prev.pitch === 0) {
        return { pitch: 45, rotation: 0, zoom: 0.8, height: -100, positionX: 0, positionY: 0 };
      } else if (prev.pitch === 45) {
        return { pitch: 65, rotation: isHomeTeam ? 0 : 180, zoom: 0.6, height: -250, positionX: 0, positionY: 0 };
      } else {
        return { pitch: 0, rotation: isHomeTeam ? 0 : 180, zoom: 1, height: 0, positionX: 0, positionY: 0 };
      }
    });
  }, [isHomeTeam]);

  const setRotation = useCallback((rotation: number) => {
    setViewSettings(prev => ({ ...prev, rotation }));
  }, []);

  return {
    viewSettings,
    autoScale,
    setAutoScale,
    showViewControls,
    setShowViewControls,
    toggleCameraView,
    setRotation,
    setViewSettings
  };
};

