/**
 * Unified logging system for the game
 * Only logs in development mode
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
  
  game: (action: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[GAME:${action}]`, ...args);
    }
  }
};
