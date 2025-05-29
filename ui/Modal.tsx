
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  // Use CSS variables for modal max-width
  const sizeVarMap = {
    sm: 'var(--ui-modal-max-w-sm)',
    md: 'var(--ui-modal-max-w-md)',
    lg: 'var(--ui-modal-max-w-lg)',
    xl: 'var(--ui-modal-max-w-xl)',
    '2xl': 'var(--ui-modal-max-w-2xl)',
    '3xl': 'var(--ui-modal-max-w-3xl)',
    '4xl': 'var(--ui-modal-max-w-4xl)',
    '5xl': 'var(--ui-modal-max-w-5xl)',
    '6xl': 'var(--ui-modal-max-w-6xl)',
    '7xl': 'var(--ui-modal-max-w-7xl)',
  };

  return (
    <div 
        className="fixed inset-0 z-[1001] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-md transition-opacity duration-300 ease-out"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
    >
      <div 
        className={`bg-slate-800/95 rounded-xl shadow-2xl w-full border-2 border-sky-600/70 transform transition-all duration-300 ease-out 
                    ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ maxWidth: sizeVarMap[size] }} // Apply max-width using CSS variable
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
       >
        <div className="flex justify-between items-center p-4 md:p-5 border-b-2 border-slate-700/80">
          <h3 id="modal-title" className="text-xl md:text-2xl font-bold text-sky-300" style={{fontFamily: "'Inter Tight', sans-serif"}}>{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-sky-300 transition-colors p-1.5 rounded-full hover:bg-slate-700/70 active:bg-slate-600"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 md:p-5 text-slate-200 max-h-[calc(90vh-120px)] overflow-y-auto styled-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
