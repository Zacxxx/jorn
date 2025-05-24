
import React from 'react';
import ActionButton from './ActionButton';
import { SkullIcon } from './IconComponents';

interface HomeScreenViewProps {
  onFindEnemy: () => void;
  isLoading: boolean;
  // Add any other props needed for the home screen, e.g., pendingTraitUnlock message
  // For now, keeping it simple.
}

const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  onFindEnemy,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-sky-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Welcome, Hero!</h2>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto">Embark on your adventure: craft spells, forge items, define your traits, and challenge formidable foes!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 items-stretch max-w-lg mx-auto">
          <ActionButton 
            onClick={onFindEnemy} 
            variant="danger" 
            size="lg" 
            isLoading={isLoading} 
            icon={<SkullIcon />} 
            className="h-full !py-4 col-span-full"
          >
            Seek Battle
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default HomeScreenView;
