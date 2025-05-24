import { useState, useCallback } from 'react';
import { JornBattleConfig } from '../../types';

export const useLayoutHistory = () => {
  const [layoutHistory, setLayoutHistory] = useState<JornBattleConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const saveToHistory = useCallback((config: JornBattleConfig) => {
    setLayoutHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ ...config });
      return newHistory.slice(-50); // Keep last 50 changes
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback((setCurrentConfig: (config: JornBattleConfig) => void, layoutHistory: JornBattleConfig[]) => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setCurrentConfig({ ...layoutHistory[historyIndex - 1] });
    }
  }, [historyIndex, layoutHistory]);

  const redo = useCallback((setCurrentConfig: (config: JornBattleConfig) => void, layoutHistory: JornBattleConfig[]) => {
    if (historyIndex < layoutHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setCurrentConfig({ ...layoutHistory[historyIndex + 1] });
    }
  }, [historyIndex, layoutHistory]);
  
  return {
    layoutHistory,
    historyIndex,
    saveToHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < layoutHistory.length - 1,
  };
}; 