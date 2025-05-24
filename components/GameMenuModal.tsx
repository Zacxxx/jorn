
import React from 'react';
import Modal from './Modal';
import ActionButton from './ActionButton';
import { GearIcon, UserIcon, BookIcon, Bars3Icon } // Reusing icons
from './IconComponents'; 

interface GameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCharacterSheet: () => void;
  onOpenHelpWiki: () => void;
  // Add more handlers as needed for other actions
  onShowMessage: (title: string, message: string) => void;
}

const GameMenuModal: React.FC<GameMenuModalProps> = ({ 
    isOpen, 
    onClose, 
    onOpenCharacterSheet, 
    onOpenHelpWiki,
    onShowMessage
}) => {

  const handleParameters = () => {
    onShowMessage("Parameters", "Game parameters and settings would be configured here. (Not yet implemented)");
    onClose();
  }
  
  const handleUser = () => {
    onOpenCharacterSheet();
    onClose();
  }

  const handleHelp = () => {
    onOpenHelpWiki();
    // onClose(); // Keep menu open if help opens on top, or close if help replaces it.
  }

  const handleCommunity = () => {
    onShowMessage("Community", "Links to community forums, Discord, etc. would be here. (Not yet implemented)");
    onClose();
  }
  
  const handleSwitchCharacters = () => {
    onShowMessage("Switch Characters", "Character switching functionality is not yet implemented.");
    onClose();
  }

  const handleLogout = () => {
    onShowMessage("Log Out", "Logging out (or resetting game) is not yet fully implemented. You can refresh the page to restart if needed.");
    // Potentially clear localStorage and reset app state here in a real scenario
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Game Menu" size="md">
      <div className="space-y-3">
        <ActionButton onClick={handleParameters} variant="secondary" icon={<GearIcon className="w-5 h-5"/>} className="w-full justify-start text-base">
          Parameters
        </ActionButton>
        <ActionButton onClick={handleUser} variant="secondary" icon={<UserIcon className="w-5 h-5"/>} className="w-full justify-start text-base">
          User / Character
        </ActionButton>
        <ActionButton onClick={handleHelp} variant="secondary" icon={<BookIcon className="w-5 h-5"/>} className="w-full justify-start text-base">
          Help / Wiki
        </ActionButton>
        <ActionButton onClick={handleCommunity} variant="secondary" icon={<UserIcon className="w-5 h-5"/>} className="w-full justify-start text-base"> {/* Placeholder icon */}
          Community
        </ActionButton>
        <ActionButton onClick={handleSwitchCharacters} variant="secondary" icon={<UserIcon className="w-5 h-5"/>} className="w-full justify-start text-base"> {/* Placeholder icon */}
          Switch Characters
        </ActionButton>
        <ActionButton onClick={handleLogout} variant="danger" icon={<Bars3Icon className="w-5 h-5"/>} className="w-full justify-start text-base mt-4"> {/* Placeholder icon */}
          Log Out
        </ActionButton>
      </div>
       <div className="mt-6 text-right">
        <ActionButton onClick={onClose} variant="primary">
          Close Menu
        </ActionButton>
      </div>
    </Modal>
  );
};

export default GameMenuModal;