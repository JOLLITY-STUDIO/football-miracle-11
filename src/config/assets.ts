// 资源服务器配�?
// 基础配置
export const ASSETS_CONFIG = {
  // 资源基础 URL
  baseURL: import.meta.env.VITE_ASSETS_BASE_URL || 'https://your-domain.com/assets',
  
  // 图片路径
  images: {
    logo: '/images/logo.png',
    share: '/images/share.png',
    cards: {
      players: '/images/cards/players',
      synergy: '/images/cards/synergy',
      penalty: '/images/cards/penalty',
    },
    icons: {
      skills: '/images/icons/skills',
      synergy: '/images/icons/synergy',
    },
  },
  
  // 音频路径
  audio: {
    bgm: '/audio/bgm',
    sfx: '/audio/sfx',
  },
  
  // 其他资源
  fonts: '/fonts',
};

// 辅助函数：获取完�?URL
export function getAssetURL(path: string): string {
  return `${ASSETS_CONFIG.baseURL}${path}`;
}

// 辅助函数：获取图�?URL
export function getImageURL(path: string): string {
  return getAssetURL(`/images${path}`);
}

// 辅助函数：获取音�?URL
export function getAudioURL(path: string): string {
  return getAssetURL(`/audio${path}`);
}

// 辅助函数：获取卡牌图�?URL
export function getCardImageURL(type: 'player' | 'synergy' | 'penalty', filename: string): string {
  return getAssetURL(`/images/cards/${type}/${filename}`);
}

