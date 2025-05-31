import React from 'react';
import Modal from '../../../../../../ui/Modal'; // Corrected path for global UI
import ActionButton from '../../../../../../ui/ActionButton'; // Corrected path for global UI
// import { ResearchUnlock } from '../../../../../types'; // Corrected path if ResearchUnlock type is needed

interface ResearchUnlock { // Using local definition as per MainTab.tsx for now
    id: string;
    name: string;
    description: string;
    cost: { points: number; gold: number };
}

interface ResearchUnlocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  // TODO: Pass researchable items, player resources, and onUnlock function
  // researchableUnlocks: ResearchUnlock[];
  // onUnlockResearch: (researchId: string) => void;
}

const ResearchUnlocksModal: React.FC<ResearchUnlocksModalProps> = ({
  isOpen,
  onClose,
}) => {

  // Placeholder for actual research unlocks content generation
  const generateResearchUnlocksContent = (): React.ReactNode => {
    // This would typically map over `researchableUnlocks`
    return (
      <>
        <p className="text-sm text-slate-300 mb-2">Unlock new abilities, talent trees, or bonuses through research.</p>
        {/* Example Research Item - Replace with dynamic rendering */}
        <div className="mt-2 p-2 bg-slate-600/70 rounded-md border border-slate-500/50">
          <h5 className="text-sm font-semibold text-teal-300">Unlock: Advanced Combat Maneuvers</h5>
          <p className="text-xs text-slate-400 mb-1">Unlocks a new tier of combat talents.</p>
          <p className="text-xs text-amber-400">Cost: 10 Research Points, 500 Gold</p>
          <ActionButton
            onClick={() => console.log("Start research: Advanced Combat Maneuvers - TBD")}
            variant="primary"
            size="sm"
            className="mt-1.5 text-xs"
            disabled={true} // Example: player lacks resources
          >
            Start Research (Insufficient Points)
          </ActionButton>
        </div>
        {/* Add more research options dynamically based on props */}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Research Unlocks">
      <div className="p-4 bg-slate-700 rounded-b-lg text-slate-100">
        {generateResearchUnlocksContent()}
        <div className="mt-4 text-right">
          <ActionButton onClick={onClose} variant="secondary">Close</ActionButton>
        </div>
      </div>
    </Modal>
  );
};

export default ResearchUnlocksModal;
