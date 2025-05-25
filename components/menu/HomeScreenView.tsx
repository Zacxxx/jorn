import React from 'react';
import ActionButton from '../battle-ui/layout/ActionButton';
import { SkullIcon } from '../books/IconComponents';

interface HomeScreenViewProps {
  onFindEnemy: () => void;
  isLoading: boolean;
  onRest: () => void;
  onExplore: () => void;
  onGuild: () => void;
  onCommunity: () => void;
  onResearch: () => void;
  onBoutique: () => void;
  // Add any other props needed for the home screen, e.g., pendingTraitUnlock message
  // For now, keeping it simple.
}

const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  onFindEnemy,
  isLoading,
  onRest,
  onExplore,
  onGuild,
  onCommunity,
  onResearch,
  onBoutique,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-sky-300 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Welcome, Hero!</h2>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto">Embark on your adventure: craft spells, forge items, define your traits, and challenge formidable foes!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch max-w-3xl mx-auto">
          <ActionButton
            onClick={onFindEnemy}
            variant="danger"
            size="lg"
            isLoading={isLoading}
            icon={<SkullIcon />}
            className="h-full !py-4 sm:col-span-1 md:col-span-3"
          >
            Seek Battle
          </ActionButton>
          <ActionButton
            onClick={onRest}
            variant="success"
            size="lg"
            className="h-full !py-4"
          >
            Rest
          </ActionButton>
          <ActionButton
            onClick={onExplore}
            variant="info"
            size="lg"
            className="h-full !py-4"
          >
            Explore
          </ActionButton>
          <ActionButton
            onClick={onGuild}
            variant="primary"
            size="lg"
            className="h-full !py-4"
          >
            Guild
          </ActionButton>
          <ActionButton
            onClick={onCommunity}
            variant="secondary"
            size="lg"
            className="h-full !py-4"
          >
            Community
          </ActionButton>
          <ActionButton
            onClick={onResearch}
            variant="info"
            size="lg"
            className="h-full !py-4"
          >
            Research
          </ActionButton>
          <ActionButton
            onClick={onBoutique}
            variant="warning"
            size="lg"
            className="h-full !py-4"
          >
            Boutique
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default HomeScreenView;
