import React, { useState } from 'react';
import { Modal } from './Modal';
import { ActionButton } from './ActionButton';
import { Player } from '../types'; // Assuming Player type is needed for context or future use
import { GameState } from '../types'; // Assuming GameState type might be relevant

interface RestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestConfirm: (duration: number, prompt: string) => void;
  player: Player; // Pass player for context if needed, e.g. max HP/MP display
}

export const RestModal: React.FC<RestModalProps> = ({ isOpen, onClose, onRestConfirm, player }) => {
  const [duration, setDuration] = useState<number>(1); // Default rest duration 1 hour
  const [prompt, setPrompt] = useState<string>('');

  const handleConfirm = () => {
    onRestConfirm(duration, prompt);
    onClose(); // Close modal after confirmation
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rest & Recover">
      <div className="p-4 bg-gray-800 text-white rounded-lg shadow-xl">
        <p className="mb-4">Resting fully restores your HP and MP.</p>
        
        <div className="mb-4">
          <label htmlFor="rest-duration" className="block text-sm font-medium text-gray-300 mb-1">
            Duration (hours):
          </label>
          <input
            type="number"
            id="rest-duration"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min="1"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="rest-prompt" className="block text-sm font-medium text-gray-300 mb-1">
            Describe your rest (optional):
          </label>
          <textarea
            id="rest-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g., Set up a campfire and read a book..."
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <ActionButton
            onClick={onClose}
            label="Cancel"
            className="bg-gray-600 hover:bg-gray-500"
          />
          <ActionButton
            onClick={handleConfirm}
            label="Rest"
            className="bg-green-600 hover:bg-green-500"
          />
        </div>
      </div>
    </Modal>
  );
}; 