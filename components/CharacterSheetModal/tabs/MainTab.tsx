import React from 'react';
import { Player, PlayerEffectiveStats, SpellIconName, Talent } from '../../types'; // Corrected path, Added Talent
import ActionButton from '../../ui/ActionButton'; // Corrected path for global UI
import { GetSpellIcon } from '../IconComponents'; // Corrected path
import VitalStatisticsDisplay from '../ui/VitalStatisticsDisplay';
import AttributesDisplay from '../ui/AttributesDisplay';
import TalentTree from './main/talents/TalentTree';
import TalentDetailView from './main/talents/TalentDetailView';
// CreateTalentModal and ResearchUnlocksModal are not directly used or rendered by MainTab

// Local Talent and ResearchUnlock interfaces removed, Talent should be imported from global types.

interface MainTabSectionItemProps {
    icon: SpellIconName;
    name: string;
    colorClass?: string;
}
const MainTabSummaryItem: React.FC<MainTabSectionItemProps> = ({ icon, name, colorClass = "text-slate-200" }) => (
    <div className={`flex items-center p-0.5 xs:p-1 bg-slate-800/70 rounded-md shadow-sm border border-slate-600/70 max-w-[60px] xs:max-w-[80px] sm:max-w-[100px] min-w-[45px] xs:min-w-[55px] sm:min-w-[65px] transition-all hover:border-current ${colorClass}`} title={name}>
        <GetSpellIcon iconName={icon} className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 mr-0.5 xs:mr-1 flex-shrink-0`} />
        <span className="text-[0.4rem] xs:text-[0.45rem] sm:text-[0.55rem] truncate">{name}</span>
    </div>
);

interface MainTabSectionProps {
    title: string;
    items: MainTabSectionItemProps[]; // Using the more specific item props type
    onManageClick: () => void;
    manageLabel: string;
    maxVisible?: number;
    emptyText?: string;
    iconColorClass?: string;
}
const MainTabSection: React.FC<MainTabSectionProps> = ({ title, items, onManageClick, manageLabel, maxVisible = 3, emptyText = "None.", iconColorClass }) => {
    const visibleItems = items.slice(0, maxVisible);
    const hiddenItemCount = items.length - visibleItems.length;

    return (
        <div className="p-1 xs:p-1.5 sm:p-2 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
            <div className="flex justify-between items-center mb-0.5 xs:mb-1">
                <h4 className="text-[0.65rem] xs:text-[0.7rem] sm:text-xs font-semibold text-sky-200" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{title}</h4>
                <ActionButton onClick={onManageClick} variant="secondary" size="sm" className="!px-0.5 xs:!px-1 !py-0 text-[0.45rem] xs:text-[0.5rem] sm:text-[0.6rem]">
                    {manageLabel}
                </ActionButton>
            </div>
            {items.length === 0 ? (
                <p className="text-[0.55rem] xs:text-[0.6rem] sm:text-xs text-slate-400 italic">{emptyText}</p>
            ) : (
                <div className="flex flex-wrap gap-0.5">
                    {visibleItems.map(item => <MainTabSummaryItem key={item.name} {...item} colorClass={iconColorClass || item.colorClass} />)}
                    {hiddenItemCount > 0 && (
                        <div className="flex items-center justify-center p-0.5 bg-slate-800/70 rounded-md shadow-sm border border-slate-600/70 text-[0.5rem] xs:text-[0.55rem] sm:text-[0.65rem] text-slate-300 min-w-[20px] xs:min-w-[25px]">
                            +{hiddenItemCount}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


interface MainTabProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  treeData: any; // TODO: Replace with actual TalentTree data type
  currentTreeCategory: string;
  setCurrentTreeCategory: (category: string) => void;
  selectedTalentDetails: Talent | null; // Use Talent type
  updateTalentDetailsPanel: (talentData: Talent) => void; // Use Talent type
  setCreateTalentModalOpen: (isOpen: boolean) => void;
  setResearchUnlocksModalOpen: (isOpen: boolean) => void;

  // Props for summary sections
  preparedSpellsSummary: MainTabSectionItemProps[];
  preparedAbilitiesSummary: MainTabSectionItemProps[];
  activeEffectsSummary: MainTabSectionItemProps[];
  onManageSpells: () => void;
  onManageAbilities: () => void;
  onManageEffects: () => void; // Assuming a way to "manage" effects, or this could be view-only
}

const MainTab: React.FC<MainTabProps> = ({
  player,
  effectiveStats,
  treeData,
  currentTreeCategory,
  setCurrentTreeCategory,
  selectedTalentDetails,
  updateTalentDetailsPanel,
  setCreateTalentModalOpen,
  setResearchUnlocksModalOpen,
  preparedSpellsSummary,
  preparedAbilitiesSummary,
  activeEffectsSummary,
  onManageSpells,
  onManageAbilities,
  onManageEffects,
}) => {
  // createTalentModalOpen and researchUnlocksModalOpen state will be managed by the parent (CharacterSheetModal)
  // and passed down to MainTab, which then passes it to CreateTalentModal / ResearchUnlocksModal

  return (
    <div className="h-full flex flex-col text-slate-100 p-0.5 xs:p-1">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 xs:gap-2 flex-grow">
        {/* Left Column: Character Stats & Summaries (md:col-span-4) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1.5 xs:space-y-2">
          <VitalStatisticsDisplay player={player} stats={effectiveStats} />
          <AttributesDisplay player={player} stats={effectiveStats} />
          <MainTabSection
            title="Prepared Spells"
            items={preparedSpellsSummary}
            onManageClick={onManageSpells}
            manageLabel="Manage"
            iconColorClass="text-sky-300"
          />
           <MainTabSection
            title="Prepared Abilities"
            items={preparedAbilitiesSummary}
            onManageClick={onManageAbilities}
            manageLabel="Manage"
            iconColorClass="text-lime-300"
          />
          <MainTabSection
            title="Active Effects"
            items={activeEffectsSummary}
            onManageClick={onManageEffects} // Or a different handler if it's view-only or different action
            manageLabel="View" // Or "Manage" if applicable
            iconColorClass="text-purple-300"
          />
        </div>

        {/* Right Column: Talent Trees & Details (md:col-span-8) */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-1.5 xs:gap-2">
          {/* Top part of right column: Talent Trees */}
          <div className="flex-grow-[3] bg-slate-800/50 p-1.5 xs:p-2 sm:p-3 rounded-lg shadow-lg border border-slate-700/60 flex flex-col overflow-hidden">
            <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-sky-300 mb-1.5 xs:mb-2 border-b border-slate-700 pb-1.5 xs:pb-2">Talents & Specializations</h3>
            <div className="mb-2 xs:mb-3 flex space-x-1 border-b border-slate-700 flex-wrap">
              {Object.keys(treeData).map(category => (
                <button
                  key={category}
                  onClick={() => setCurrentTreeCategory(category)}
                  className={`px-2 py-1 xs:px-3 xs:py-1.5 text-[0.6rem] xs:text-xs font-medium rounded-t-md transition-colors focus:outline-none
                              ${currentTreeCategory === category ? 'bg-slate-700 text-sky-300 border-slate-700' : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-sky-400'}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto styled-scrollbar flex-grow min-h-[120px] xs:min-h-[150px]">
              <TalentTree
                treeData={treeData}
                category={currentTreeCategory}
                selectedTalentDetails={selectedTalentDetails}
                updateTalentDetailsPanel={updateTalentDetailsPanel}
              />
            </div>
            <div className="mt-2 xs:mt-3 pt-2 xs:pt-3 border-t border-slate-700 flex gap-2">
                <ActionButton onClick={() => setCreateTalentModalOpen(true)} variant='success' size="sm" className="text-[0.6rem] xs:text-xs">
                    Create Talent
                </ActionButton>
                <ActionButton onClick={() => setResearchUnlocksModalOpen(true)} variant='info' size="sm" className="text-[0.6rem] xs:text-xs">
                    Research Unlocks
                </ActionButton>
            </div>
          </div>

          {/* Bottom part of right column: Talent Details */}
          <div className="flex-grow-[2] bg-slate-800/50 p-1.5 xs:p-2 sm:p-3 rounded-lg shadow-lg border border-slate-700/60 overflow-y-auto styled-scrollbar min-h-[100px] xs:min-h-[120px]">
            <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-sky-300 mb-1.5 xs:mb-2 border-b border-slate-700 pb-1.5 xs:pb-2">Details</h3>
            <TalentDetailView selectedTalentDetails={selectedTalentDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainTab;
