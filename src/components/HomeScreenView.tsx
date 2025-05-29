
import React from 'react';
import ActionButton from '../ui/ActionButton';
import { SkullIcon, MapIcon, FlaskIcon, BookIcon } from './IconComponents'; 

interface HomeScreenViewProps {
  onFindEnemy: () => void;
  isLoading: boolean;
  onExploreMap: () => void;
  onOpenResearchArchives: () => void; 
}

const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  onFindEnemy,
  isLoading,
  onExploreMap,
  onOpenResearchArchives,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-sky-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Welcome, Hero!</h2>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto">Embark on your adventure: craft spells, forge items, define your traits, and challenge formidable foes or explore the world!</p>
        <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
          <ActionButton 
            onClick={onFindEnemy} 
            variant="danger" 
            size="lg" 
            isLoading={isLoading} 
            icon={<SkullIcon />} 
            className="h-full !py-4"
          >
            Seek Battle
          </ActionButton>
          <ActionButton 
            onClick={onExploreMap} 
            variant="success"
            size="lg" 
            isLoading={isLoading} 
            icon={<MapIcon />} 
            className="h-full !py-4"
          >
            Explore World
          </ActionButton>
          <ActionButton 
            onClick={onOpenResearchArchives} 
            variant="info" 
            size="lg" 
            isLoading={isLoading} 
            icon={<BookIcon />} 
            className="h-full !py-4"
          >
            Research
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default HomeScreenView;
