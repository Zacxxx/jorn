import React, { useState } from 'react';
import { Player, PlayerClass, PlayerSpecialization } from '../../../types';
import { PLAYER_CLASSES, getClassById, getSpecializationById } from '../../../data/classes';
import ActionButton from '../../../ui/ActionButton';
import { UserIcon, CheckmarkCircleIcon, GearIcon } from '../IconComponents';

interface ProgressTabProps {
  player: Player;
  onOpenCharacterCreation: () => void;
}

const ProgressTab: React.FC<ProgressTabProps> = ({
  player,
  onOpenCharacterCreation
}) => {
  const currentClass = player.classId ? getClassById(player.classId) : null;
  const currentSpecialization = player.classId && player.specializationId 
    ? getSpecializationById(player.classId, player.specializationId) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Character Progress</h3>
          <p className="text-sm text-slate-400">Manage your character's class and specialization</p>
        </div>
      </div>

      {/* Current Character Info */}
      <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-xl font-bold text-slate-100">
                {player.title ? `${player.title} ${player.name || 'Player'}` : (player.name || 'Player')}
              </h4>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded font-medium">
                Level {player.level}
              </span>
            </div>
            
            {currentClass && currentSpecialization ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="font-medium">{currentClass.name}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-purple-300">{currentSpecialization.name}</span>
                </div>
                <p className="text-sm text-slate-400">{currentSpecialization.description}</p>
                
                {/* Current Bonuses */}
                {currentSpecialization.bonuses && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(currentSpecialization.bonuses).map(([stat, value]) => (
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
            ) : (
              <div className="text-slate-400">
                <p>No class selected</p>
                <p className="text-sm">Choose a class to unlock specializations and bonuses</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Class Management Section */}
      <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-100">Class & Specialization</h4>
            <p className="text-sm text-slate-400">
              {currentClass ? 'Change your class and specialization' : 'Set up your character class'}
            </p>
          </div>
          <ActionButton
            onClick={onOpenCharacterCreation}
            variant="primary"
            size="sm"
            icon={<GearIcon className="w-4 h-4" />}
          >
            {currentClass ? 'Change Class' : 'Choose Class'}
          </ActionButton>
        </div>

        {/* Class Information Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Class</label>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
              {currentClass ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckmarkCircleIcon className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-slate-100">{currentClass.name}</span>
                  </div>
                  <p className="text-sm text-slate-400">{currentClass.description}</p>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-4">
                  <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No class selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Specialization Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Specialization</label>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
              {currentSpecialization ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckmarkCircleIcon className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold text-slate-100">{currentSpecialization.name}</span>
                  </div>
                  <p className="text-sm text-slate-400">{currentSpecialization.description}</p>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-4">
                  <GearIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No specialization selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Information Hub */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Information Hub</label>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30 h-full">
              {currentClass && currentSpecialization ? (
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-slate-200 mb-1">Active Bonuses</h5>
                    {currentSpecialization.bonuses ? (
                      <div className="space-y-1">
                        {Object.entries(currentSpecialization.bonuses).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between text-xs">
                            <span className="text-slate-400 capitalize">{stat}:</span>
                            <span className={value > 0 ? 'text-green-300' : 'text-red-300'}>
                              {value > 0 ? '+' : ''}{value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No bonuses</p>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-slate-200 mb-1">Class Features</h5>
                    <p className="text-xs text-slate-400">
                      Specialized abilities and traits will be unlocked as you progress.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-sm">Select a class and specialization to view detailed information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Available Classes Preview */}
      {!currentClass && (
        <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50">
          <h4 className="text-lg font-semibold text-slate-100 mb-4">Available Classes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLAYER_CLASSES.map((playerClass) => (
              <div
                key={playerClass.id}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30"
              >
                <h5 className="font-semibold text-slate-100 mb-2">{playerClass.name}</h5>
                <p className="text-sm text-slate-400 mb-3">{playerClass.description}</p>
                <div className="text-xs text-slate-500">
                  {playerClass.specializations.length} specializations available
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTab; 