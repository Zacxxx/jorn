
import React, { useEffect, useRef } from 'react';
import { CombatActionLog } from '../../../types';

interface CombatLogDisplayProps {
  logs: CombatActionLog[];
}

const CombatLogDisplay: React.FC<CombatLogDisplayProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (actor: CombatActionLog['actor'], type?: CombatActionLog['type']): string => {
    if (type === 'damage') return 'text-red-300';
    if (type === 'heal') return 'text-green-300';
    if (type === 'status') return 'text-yellow-300';
    if (type === 'resource') return 'text-amber-300';
    // Fix: Use 'speed' to align with the updated CombatActionLog type, resolving previous 'initiative' type issue.
    if (type === 'speed') return 'text-cyan-300';
    
    switch (actor) {
      case 'Player': return 'text-sky-300';
      case 'Enemy': return 'text-rose-400'; 
      case 'System': return 'text-slate-300';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/80 p-3 md:p-4 rounded-xl shadow-xl border-2 border-slate-700/70 h-48 md:h-64 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-slate-100 mb-2.5 border-b-2 border-slate-600/80 pb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Battle Chronicle</h3>
      <div ref={logContainerRef} className="h-[calc(100%-3.25rem)] overflow-y-auto space-y-1.5 pr-2 styled-scrollbar">
        {logs.length === 0 && <p className="text-slate-500 italic text-sm p-3 text-center">The battle has not begun...</p>}
        {logs.map((log) => (
          <p key={log.id} className={`text-sm leading-relaxed p-1 rounded ${getLogColor(log.actor, log.type)} ${log.type === 'damage' ? 'bg-red-900/20' : log.type === 'status' ? 'bg-yellow-900/20' : 'hover:bg-slate-700/40'}`}>
            <span className="font-mono text-xs mr-1.5 text-slate-500 select-none">T{log.turn}:</span>
            {log.actor !== 'System' && <span className="font-semibold">{log.actor} </span>}
            {log.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CombatLogDisplay;
