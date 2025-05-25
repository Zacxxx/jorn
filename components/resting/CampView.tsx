import React from 'react';
import ActionButton from '../ActionButton';
import { SunIcon, MoonIcon, ArrowUturnLeftIcon, UserGroupIcon, BookOpenIcon, ArchiveBoxIcon } from '../IconComponents'; // Assuming you have these or similar icons

interface CampViewProps {
  playerName?: string;
  onSleep: () => void;
  onReturnToMap: () => void;
  // Add other handlers as needed, e.g., onManageParty, onOpenInventory, onOpenJournal
  isLoading: boolean;
}

const CampView: React.FC<CampViewProps> = ({
  playerName = 'Hero',
  onSleep,
  onReturnToMap,
  isLoading,
}) => {
  return (
    <div className="p-4 md:p-8 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 text-center mx-auto max-w-3xl">
      <h2 className="text-4xl font-bold text-amber-300 mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
        <MoonIcon className="inline-block w-10 h-10 mr-2 mb-1" /> Rest & Recuperate
      </h2>
      <p className="text-slate-300 mb-8 text-lg">
        Welcome to your camp, {playerName}. Take a moment to rest and prepare for your next adventure.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <ActionButton
          onClick={onSleep}
          variant="success"
          size="lg"
          icon={<SunIcon />} // Or a bed icon if you have one
          className="h-full !py-5 text-lg col-span-full"
          isLoading={isLoading}
          loadingText="Resting..."
        >
          Sleep (Restore HP/MP)
        </ActionButton>
        
        {/* Placeholder buttons for other camp activities */}
        <ActionButton
          onClick={() => alert('Manage Party: Not yet implemented')}
          variant="info"
          size="md"
          icon={<UserGroupIcon />}
          className="h-full !py-3"
          disabled // Remove disabled when implemented
        >
          Manage Party
        </ActionButton>
        <ActionButton
          onClick={() => alert('Camp Inventory: Not yet implemented')}
          variant="secondary"
          size="md"
          icon={<ArchiveBoxIcon />}
          className="h-full !py-3"
          disabled // Remove disabled when implemented
        >
          Camp Stash
        </ActionButton>
         <ActionButton
          onClick={() => alert('Journal: Not yet implemented')}
          variant="primary"
          size="md"
          icon={<BookOpenIcon />}
          className="h-full !py-3 col-span-full"
          disabled // Remove disabled when implemented
        >
          View Journal / Lore
        </ActionButton>
      </div>

      <ActionButton
        onClick={onReturnToMap}
        variant="primary"
        size="lg"
        icon={<ArrowUturnLeftIcon />}
        className="w-full max-w-xs mx-auto !py-3"
      >
        Return to Map
      </ActionButton>
    </div>
  );
};

export default CampView; 