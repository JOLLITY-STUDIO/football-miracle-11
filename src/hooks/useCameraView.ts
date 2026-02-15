import { useState, useCallback, useEffect } from 'react';

export interface ViewSettings {
  pitch: number;
  rotation: number;
  zoom: number;
  height: number;
}

export const useCameraView = (isHomeTeam: boolean) => {
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    pitch: 0,
    rotation: 0,
    zoom: 1,
    height: 0
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
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const toggleCameraView = useCallback(() => {
    setViewSettings(prev => {
      if (prev.pitch === 0) {
        return { pitch: 45, rotation: 0, zoom: 0.8, height: -100 };
      } else if (prev.pitch === 45) {
        return { pitch: 65, rotation: isHomeTeam ? 0 : 180, zoom: 0.6, height: -250 };
      } else {
        return { pitch: 0, rotation: isHomeTeam ? 0 : 180, zoom: 1, height: 0 };
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
