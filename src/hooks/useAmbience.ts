import { useCallback, useEffect, useRef } from 'react';
import { 
  playAmbient, 
  stopAmbient, 
  startMatchAmbience, 
  stopMatchAmbience, 
  triggerCrowdReaction,
  type AmbientType 
} from '../utils/audio';

/**
 * 环境音控�?Hook
 * 用于在组件中方便地控制环境音
 */
export const useAmbience = () => {
  /**
   * 播放指定类型的环境音
   */
  const startAmbient = useCallback((type: AmbientType) => {
    playAmbient(type);
  }, []);

  /**
   * 停止指定类型的环境音
   */
  const endAmbient = useCallback((type: AmbientType) => {
    stopAmbient(type);
  }, []);

  /**
   * 启动完整的比赛氛围（所有球场环境音�?
   */
  const startMatchAtmosphere = useCallback(() => {
    startMatchAmbience();
  }, []);

  /**
   * 停止比赛氛围
   */
  const endMatchAtmosphere = useCallback((fadeOut?: number) => {
    stopMatchAmbience(fadeOut);
  }, []);

  /**
   * 触发观众反应
   * @param reaction - 反应类型: 'ooh'(惊讶), 'applause'(掌声), 'boo'(嘘声), 'cheer'(欢呼)
   */
  const crowdReact = useCallback((reaction: 'ooh' | 'applause' | 'boo' | 'cheer') => {
    triggerCrowdReaction(reaction);
  }, []);

  return {
    // 基础控制
    startAmbient,
    endAmbient,
    
    // 比赛氛围控制
    startMatchAtmosphere,
    endMatchAtmosphere,
    
    // 观众反应
    crowdReact,
  };
};

/**
 * 自动管理比赛环境音的 Hook
 * 根据游戏阶段自动启动/停止环境�?
 */
export const useAutoAmbience = (phase: string) => {
  const prevPhaseRef = useRef<string>('');

  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    
    // 比赛开始时启动环境�?
    if ((phase === 'firstHalf' || phase === 'secondHalf') && 
        prevPhase !== 'firstHalf' && prevPhase !== 'secondHalf') {
      startMatchAmbience();
    }
    
    // 比赛结束时停止环境音
    if ((phase === 'fullTime' || phase === 'penaltyShootout') &&
        prevPhase !== 'fullTime' && prevPhase !== 'penaltyShootout') {
      stopMatchAmbience(3000);
    }
    
    prevPhaseRef.current = phase;
    
    return () => {
      if (phase === 'fullTime' || phase === 'penaltyShootout') {
        stopMatchAmbience(1000);
      }
    };
  }, [phase]);
};

export default useAmbience;

