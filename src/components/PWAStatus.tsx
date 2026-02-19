import React, { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { logger } from '../utils/logger';

export function PWAStatus() {
  const [swReady, setSWReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
      onRegistered(registration) {
        logger.info('Service Worker registered:', registration);
        setSWReady(true);
      },
      onRegisterError(error: any) {
        console.error('Service Worker registration error:', error);
      },
    });

    return () => {
      updateSW.then((unregister: (() => void) | undefined) => unregister?.());
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!swReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {needRefresh && (
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <span>🔄</span>
          <span>New content available, click to refresh</span>
        </button>
      )}
      {offlineReady && (
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <span>✅</span>
          <span>App ready to work offline</span>
        </div>
      )}
    </div>
  );
}
