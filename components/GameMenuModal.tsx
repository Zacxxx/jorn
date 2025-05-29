
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import ActionButton from '../ui/ActionButton';
import { GearIcon, UserIcon, BookIcon, Bars3Icon, UploadIcon, DownloadIcon } from './IconComponents'; // Added UploadIcon, DownloadIcon

interface GameMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCharacterSheet: () => void;
  onOpenHelpWiki: () => void;
  onShowMessage: (title: string, message: string) => void;
  onExportSave: () => void; 
  onImportSave: () => void; 
}

const GameMenuModal: React.FC<GameMenuModalProps> = ({ 
    isOpen, 
    onClose, 
    onOpenCharacterSheet, 
    onOpenHelpWiki,
    onShowMessage,
    onExportSave,
    onImportSave
}) => {
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  const handleParameters = () => {
    onShowMessage("Parameters", "Game parameters and settings would be configured here. (Not yet implemented)");
    setShowSaveOptions(false);
    // onClose(); // Keep modal open if parameters are part of it
  }
  
  const handleUser = () => {
    onOpenCharacterSheet();
    setShowSaveOptions(false);
    onClose();
  }

  const handleHelp = () => {
    onOpenHelpWiki();
    setShowSaveOptions(false);
    // onClose(); // Keep help open on top
  }

  const handleCommunity = () => {
    onShowMessage("Community", "Links to community forums, Discord, etc. would be here. (Not yet implemented)");
    setShowSaveOptions(false);
    onClose();
  }
  
  const handleManageSavesToggle = () => {
    setShowSaveOptions(prev => !prev);
  }

  const handleExport = () => {
    onExportSave();
    setShowSaveOptions(false);
    // onClose(); // Potentially close after action, or let user close manually
  }

  const handleImport = () => {
    onImportSave();
    // Import might trigger a reload, so modal closure might be handled by that.
    // setShowSaveOptions(false); // Reset UI state
    // onClose(); 
  }
  
  const handleLogout = () => {
    onShowMessage("Log Out / Reset", "To reset your game, use the 'Import Save' feature with a fresh save file or clear your browser's local storage for this site and refresh the page.");
    setShowSaveOptions(false);
    // onClose(); // Keep modal open to show message
  }

  const handleCloseAndReset = () => {
    setShowSaveOptions(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndReset} title="Game Options" size="md">
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
        
        {/* Manage Saves Section */}
        <ActionButton 
            onClick={handleManageSavesToggle} 
            variant="secondary" 
            icon={<GearIcon className="w-5 h-5"/>} 
            className="w-full justify-start text-base"
            aria-expanded={showSaveOptions}
        >
          Manage Saves
        </ActionButton>
        {showSaveOptions && (
            <div className="pl-6 pr-2 py-2 space-y-2 bg-slate-700/50 rounded-md border border-slate-600">
                 <ActionButton 
                    onClick={handleExport} 
                    variant="info" 
                    icon={<DownloadIcon className="w-5 h-5"/>} 
                    className="w-full justify-start text-sm"
                >
                    Export Current Save
                </ActionButton>
                <ActionButton 
                    onClick={handleImport} 
                    variant="info" 
                    icon={<UploadIcon className="w-5 h-5"/>} 
                    className="w-full justify-start text-sm"
                >
                    Import Save from File
                </ActionButton>
            </div>
        )}

        <ActionButton onClick={handleCommunity} variant="secondary" icon={<UserIcon className="w-5 h-5"/>} className="w-full justify-start text-base"> 
          Community
        </ActionButton>
        <ActionButton onClick={handleLogout} variant="danger" icon={<Bars3Icon className="w-5 h-5"/>} className="w-full justify-start text-base mt-4">
          Log Out / Reset Help
        </ActionButton>
      </div>
       <div className="mt-6 text-right">
        <ActionButton onClick={handleCloseAndReset} variant="primary">
          Close Options
        </ActionButton>
      </div>
    </Modal>
  );
};

export default GameMenuModal;
