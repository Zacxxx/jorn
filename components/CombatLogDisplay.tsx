
import React, { useEffect, useRef } from 'react';
import { CombatActionLog } from '../types';

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
    if (type === 'speed') return 'text-cyan-300';
    
    switch (actor) {
      case 'Player': return 'text-sky-300';
      case 'Enemy': return 'text-rose-400'; 
      case 'System': return 'text-slate-300';
      default: return 'text-slate-400';
    }
  };

  return (
    // Adjusted padding and heading for mobile context
    <div className="bg-transparent p-1 sm:p-2 md:p-4 h-full flex flex-col"> 
      <h3 className="hidden sm:block text-sm sm:text-lg font-semibold text-slate-100 mb-1 sm:mb-2.5 border-b-2 border-slate-600/80 pb-1 sm:pb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Battle Chronicle</h3>
      <div ref={logContainerRef} className="flex-grow overflow-y-auto space-y-1 pr-1 styled-scrollbar">
        {logs.length === 0 && <p className="text-slate-500 italic text-xs sm:text-sm p-2 sm:p-3 text-center">The battle has not begun...</p>}
        {logs.map((log) => (
          <p key={log.id} className={`battle-log-text leading-snug p-0.5 sm:p-1 rounded ${getLogColor(log.actor, log.type)} ${log.type === 'damage' ? 'bg-red-900/10' : log.type === 'status' ? 'bg-yellow-900/10' : 'hover:bg-slate-700/20'}`}>
            <span className="font-mono text-[0.6rem] sm:text-xs mr-1 text-slate-500 select-none">T{log.turn}:</span>
            {log.actor !== 'System' && <span className="font-semibold">{log.actor} </span>}
            {log.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CombatLogDisplay;
