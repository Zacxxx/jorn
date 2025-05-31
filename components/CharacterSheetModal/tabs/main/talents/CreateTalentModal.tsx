import React from 'react';
import Modal from '../../../../../ui/Modal'; // Corrected path for global UI
import ActionButton from '../../../../../ui/ActionButton'; // Corrected path for global UI
// import { Talent } from '../../../../../types'; // Corrected path if Talent type is needed

interface CreateTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTreeCategory: string; // To default the category selector
  treeData: any; // For populating category selector, TODO: type this
  // TODO: Add an onSave/onCreate prop if the modal handles submission
  // onCreateTalent: (talentData: Partial<Talent>) => void;
}

const CreateTalentModal: React.FC<CreateTalentModalProps> = ({
  isOpen,
  onClose,
  currentTreeCategory,
  treeData,
}) => {
  // Internal state for form fields can be added here if needed

  const generateCreateTalentContent = (): React.ReactNode => {
    return (
      <>
        <p className="text-sm text-slate-300 mb-2">Define a new talent for the player.</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="talentName" className="block text-xs font-medium text-slate-200 mb-0.5">Talent Name</label>
            <input type="text" id="talentName" placeholder="Enter talent name" className="p-2 w-full bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 text-sm"/>
          </div>
          <div>
            <label htmlFor="talentCategory" className="block text-xs font-medium text-slate-200 mb-0.5">Category</label>
            <select id="talentCategory" defaultValue={currentTreeCategory} className="p-2 w-full bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm">
              {Object.keys(treeData).map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              {/* TODO: Allow creating new category? */}
            </select>
          </div>
          <div>
            <label htmlFor="talentTier" className="block text-xs font-medium text-slate-200 mb-0.5">Tier</label>
            <input type="number" id="talentTier" placeholder="1" min="1" defaultValue="1" className="p-2 w-full bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 text-sm"/>
          </div>
          <div>
            <label htmlFor="talentDescription" className="block text-xs font-medium text-slate-200 mb-0.5">Description</label>
            <textarea id="talentDescription" placeholder="Describe the talent's effects" className="p-2 w-full h-20 bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 text-sm"></textarea>
          </div>
           {/* TODO: Add more fields: type (passive/active), effects, requirements, icon, etc. */}
        </div>
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Talent">
      <div className="p-4 bg-slate-700 rounded-b-lg text-slate-100"> {/* Ensure consistent padding and bg with other modals if necessary */}
        {generateCreateTalentContent()}
        <div className="mt-4 text-right space-x-2">
          <ActionButton onClick={onClose} variant="secondary">Cancel</ActionButton>
          <ActionButton onClick={() => { console.log('Create talent logic here - TBD'); onClose(); }} variant="success">
            Create (TBD)
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTalentModal;
