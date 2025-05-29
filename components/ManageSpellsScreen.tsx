
import React from 'react';
import { Player, Spell } from '../types';
import ActionButton from '../ui/ActionButton';
import SpellbookDisplay from './SpellbookDisplay';
import { BookIcon } from './IconComponents';

interface ManageSpellsScreenProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  maxPreparedSpells: number;
  onReturnHome: () => void;
  onEditSpell: (spell: Spell) => void; // Add onEditSpell prop
}

const ManageSpellsScreen: React.FC<ManageSpellsScreenProps> = ({ player, setPlayer, maxPreparedSpells, onReturnHome, onEditSpell }) => {
  const { spells: allSpells, preparedSpellIds, mp: playerMana } = player;

  const preparedSpells = allSpells.filter(spell => preparedSpellIds.includes(spell.id));
  const availableSpells = allSpells.filter(spell => !preparedSpellIds.includes(spell.id));

  const handlePrepareSpell = (spellToPrepare: Spell) => {
    if (preparedSpellIds.length < maxPreparedSpells) {
      setPlayer(prev => ({
        ...prev,
        preparedSpellIds: [...prev.preparedSpellIds, spellToPrepare.id],
      }));
    }
  };

  const handleUnprepareSpell = (spellToUnprepare: Spell) => {
    setPlayer(prev => ({
      ...prev,
      preparedSpellIds: prev.preparedSpellIds.filter(id => id !== spellToUnprepare.id),
    }));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-sky-400 flex items-center">
          <BookIcon className="w-7 h-7 mr-2 text-sky-400" />
          Manage Prepared Spells
        </h2>
        <p className="text-lg font-semibold text-slate-300">
          Prepared: <span className={preparedSpells.length >= maxPreparedSpells ? "text-red-400" : "text-green-400"}>{preparedSpells.length}</span> / {maxPreparedSpells}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <SpellbookDisplay
            spells={availableSpells}
            playerMana={playerMana}
            title="Available (Collection)"
            onPrepareSpell={handlePrepareSpell}
            onEditSpell={onEditSpell} // Pass onEditSpell
            canPrepareMore={preparedSpells.length < maxPreparedSpells}
            preparedSpellIds={preparedSpellIds}
            emptyStateMessage="No other spells in your collection to prepare."
          />
        </div>
        <div>
          <SpellbookDisplay
            spells={preparedSpells}
            playerMana={playerMana}
            title="Prepared for Combat"
            onUnprepareSpell={handleUnprepareSpell}
            onEditSpell={onEditSpell} // Pass onEditSpell
            preparedSpellIds={preparedSpellIds}
            emptyStateMessage="No spells currently prepared."
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <ActionButton onClick={onReturnHome} variant="primary" size="lg">
          Confirm & Return to Home
        </ActionButton>
      </div>
       <p className="text-xs text-slate-400 text-center mt-4">
        Spells in 'Prepared for Combat' will be available during battles. You can prepare up to {maxPreparedSpells} spells at your current level.
      </p>
    </div>
  );
};

export default ManageSpellsScreen;
