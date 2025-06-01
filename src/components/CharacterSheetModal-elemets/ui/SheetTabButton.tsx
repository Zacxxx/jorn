import React from 'react';

const SheetTabButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 flex flex-col sm:flex-row items-center justify-center p-1.5 xs:p-2 sm:p-2 md:p-2.5 rounded-t-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-inset focus:ring-sky-400/70 min-w-[45px] sm:min-w-[80px]
                ${isActive
                    ? 'bg-slate-700 text-sky-300 border-b-2 border-sky-500 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-b-2 border-transparent hover:bg-slate-750 hover:text-sky-400 hover:border-slate-600'}`}
    aria-pressed={isActive}
    style={{fontFamily: "'Inter Tight', sans-serif"}}
    title={label}
  >
    <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-4 sm:h-4 mb-0.5 sm:mb-0 sm:mr-1.5">{icon}</div>
    <span className={`text-[0.55rem] xs:text-[0.6rem] sm:text-xs font-medium sm:font-semibold tracking-tight uppercase hidden sm:inline`}>{label}</span>
  </button>
);

export default SheetTabButton;
