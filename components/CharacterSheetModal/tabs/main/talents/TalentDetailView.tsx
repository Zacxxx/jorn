import React from 'react';
import { Talent } from '../../../../types'; // Adjusted path
import ActionButton from '../../../../ui/ActionButton'; // Adjusted path

interface TalentDetailViewProps {
  selectedTalentDetails: Talent | null;
  // Add any other props needed, e.g., for upgrade logic if handled here
  // onUpgradeTalent: (talentId: string) => void;
}

const TalentDetailView: React.FC<TalentDetailViewProps> = ({ selectedTalentDetails }) => {
  if (!selectedTalentDetails) {
    return (
      <div className="text-slate-400 italic text-center py-2 xs:py-4 text-xs sm:text-sm">
        Select a talent to see details.
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-xs xs:text-sm sm:text-base font-bold text-green-300">{selectedTalentDetails.name}</h4>
      <p className="text-[0.6rem] xs:text-xs text-slate-300 mb-1">Type: {selectedTalentDetails.type}</p>
      <p className="text-[0.65rem] xs:text-sm text-slate-200 mb-1.5 xs:mb-2 leading-snug">{selectedTalentDetails.description}</p>
      {selectedTalentDetails.effects && selectedTalentDetails.effects.length > 0 && (
          <div className="mb-1 xs:mb-1.5">
              <p className="text-[0.6rem] xs:text-xs text-slate-400">Effects:</p>
              <ul className="list-disc list-inside pl-2 text-[0.6rem] xs:text-xs text-slate-300">
                  {selectedTalentDetails.effects.map((effect, idx) => <li key={idx}>{effect}</li>)}
              </ul>
          </div>
      )}
      {selectedTalentDetails.requirements && Object.keys(selectedTalentDetails.requirements).length > 0 && (
        // TODO: Format requirements in a more readable way if they are complex objects
        <p className="text-[0.6rem] xs:text-xs text-amber-400">Req: {JSON.stringify(selectedTalentDetails.requirements)}</p>
      )}
       <ActionButton
          onClick={() => console.log("Upgrade talent:", selectedTalentDetails.id)} // Placeholder
          variant="primary" size="sm" className="mt-2 xs:mt-3 text-[0.6rem] xs:text-xs"
       >
        Upgrade (Placeholder)
       </ActionButton>
    </div>
  );
};

export default TalentDetailView;
