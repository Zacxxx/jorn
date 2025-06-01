import React, { useState } from 'react';
import { Player, PlayerClass, PlayerSpecialization } from '../../types';
import { PLAYER_CLASSES } from '../../data/classes';
import ActionButton from '../../ui/ActionButton';
import { UserIcon, CheckmarkCircleIcon } from './IconComponents';

interface CharacterCreationModalProps {
  isOpen: boolean;
  player: Player;
  onCreateCharacter: (name: string, classId: string, specializationId: string, title?: string) => void;
  onClose: () => void;
  isRecreation?: boolean; // If true, this is recreating an existing character
}

const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({
  isOpen,
  player,
  onCreateCharacter,
  onClose,
  isRecreation = false
}) => {
  const [name, setName] = useState(player.name || '');
  const [title, setTitle] = useState(player.title || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(player.classId || '');
  const [selectedSpecializationId, setSelectedSpecializationId] = useState<string>(player.specializationId || '');

  const selectedClass = PLAYER_CLASSES.find(cls => cls.id === selectedClassId);
  const selectedSpecialization = selectedClass?.specializations.find(spec => spec.id === selectedSpecializationId);

  const handleSubmit = () => {
    if (name.trim() && selectedClassId && selectedSpecializationId) {
      onCreateCharacter(name.trim(), selectedClassId, selectedSpecializationId, title.trim() || undefined);
    }
  };

  const isValid = name.trim() && selectedClassId && selectedSpecializationId;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {isRecreation ? 'Recreate Your Character' : 'Create Your Character'}
              </h2>
              <p className="text-sm text-slate-400">
                {isRecreation 
                  ? 'Redefine your character while keeping your current progression'
                  : 'Choose your name, class, and specialization to begin your journey'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Character Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Character Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your character's name"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={30}
              />
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Brave, Shadowbane, etc."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
              />
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Choose Your Class *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PLAYER_CLASSES.map((playerClass) => (
                <button
                  key={playerClass.id}
                  onClick={() => {
                    setSelectedClassId(playerClass.id);
                    setSelectedSpecializationId(''); // Reset specialization when class changes
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedClassId === playerClass.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{playerClass.name}</h3>
                    {selectedClassId === playerClass.id && (
                      <CheckmarkCircleIcon className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <p className="text-sm opacity-80">{playerClass.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Specialization Selection */}
          {selectedClass && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Choose Your Specialization *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {selectedClass.specializations.map((specialization) => (
                  <button
                    key={specialization.id}
                    onClick={() => setSelectedSpecializationId(specialization.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedSpecializationId === specialization.id
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{specialization.name}</h4>
                          {selectedSpecializationId === specialization.id && (
                            <CheckmarkCircleIcon className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                        <p className="text-sm opacity-80 mb-3">{specialization.description}</p>
                        
                        {/* Bonuses */}
                        {specialization.bonuses && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(specialization.bonuses).map(([stat, value]) => (
                              <span
                                key={stat}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  value > 0 
                                    ? 'bg-green-500/20 text-green-300' 
                                    : 'bg-red-500/20 text-red-300'
                                }`}
                              >
                                {stat}: {value > 0 ? '+' : ''}{value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {isValid && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Character Preview</h3>
              <div className="text-slate-100">
                <span className="font-semibold">
                  {title ? `${title} ${name}` : name}
                </span>
                <span className="text-slate-400 ml-2">
                  • {selectedClass?.name} ({selectedSpecialization?.name})
                </span>
              </div>
              {selectedSpecialization?.bonuses && (
                <div className="mt-2 text-sm text-slate-400">
                  Starting bonuses: {Object.entries(selectedSpecialization.bonuses)
                    .map(([stat, value]) => `${stat} ${value > 0 ? '+' : ''}${value}`)
                    .join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <ActionButton
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            Cancel
          </ActionButton>
          <ActionButton
            onClick={handleSubmit}
            variant="primary"
            size="md"
            disabled={!isValid}
          >
            {isRecreation ? 'Recreate Character' : 'Create Character'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationModal; 