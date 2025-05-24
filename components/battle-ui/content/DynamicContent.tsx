import React from 'react';
import { DynamicAreaView, CombatActionItemType, Player, Spell, Ability, Consumable, CombatActionLog } from '../../../types';
import { CombatActionGrid } from '../actions/CombatActionGrid';
import CombatLogDisplay from '../../CombatLogDisplay';
import ActionButton from '../../ActionButton';
import { SwordsIcon, ShieldIcon, FleeIcon } from '../../IconComponents';

interface DynamicContentProps {
  activeDynamicView: DynamicAreaView;
  // Props needed for the different views
  preparedSpells: Spell[];
  abilities: Ability[];
  consumables: Consumable[];
  combatLog: CombatActionLog[];
  player: Player;
  canPlayerAct: boolean;
  targetEnemyId: string | null;
  onPlayerBasicAttack: (targetId: string) => void;
  onPlayerDefend: () => void;
  onPlayerFlee: () => void;
  onPlayerFreestyleAction: (actionText: string, targetId: string | null) => void;
  onActionSelect: (action: CombatActionItemType, type: 'spell' | 'ability' | 'consumable') => void;
  onMouseEnterAction: (event: React.MouseEvent, item: CombatActionItemType) => void; // Renamed to avoid conflict
  onMouseLeaveAction: () => void; // Renamed to avoid conflict
  freestyleActionText: string;
  setFreestyleActionText: (text: string) => void;
  handleCategoryChange: (view: DynamicAreaView) => void; // To switch back to actions after performing action
}

export const DynamicContent: React.FC<DynamicContentProps> = ({
  activeDynamicView,
  preparedSpells,
  abilities,
  consumables,
  combatLog,
  player,
  canPlayerAct,
  targetEnemyId,
  onPlayerBasicAttack,
  onPlayerDefend,
  onPlayerFlee,
  onPlayerFreestyleAction,
  onActionSelect,
  onMouseEnterAction,
  onMouseLeaveAction,
  freestyleActionText,
  setFreestyleActionText,
  handleCategoryChange,
}) => {
  const handleFreestyleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freestyleActionText.trim() || !canPlayerAct) return; // Removed targetEnemyId check as freestyle can be self-targeted or untargeted
    onPlayerFreestyleAction(freestyleActionText, targetEnemyId); // Still pass target for clarity if needed by action logic
    setFreestyleActionText('');
    handleCategoryChange('actions');
  };

  switch (activeDynamicView) {
    case 'actions':
      return (
        <div className="p-2 sm:p-3 flex flex-col h-full">
          <form onSubmit={handleFreestyleSubmit} className="mb-2 flex-grow">
            <textarea
              value={freestyleActionText}
              onChange={(e) => setFreestyleActionText(e.target.value)}
              placeholder="Describe a custom action..."
              rows={3}
              className="w-full p-2 bg-slate-800/70 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 text-sm styled-scrollbar shadow-inner"
              disabled={!canPlayerAct}
            />
          </form>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ActionButton
              onClick={() => {
                if (targetEnemyId) {
                  onPlayerBasicAttack(targetEnemyId);
                  handleCategoryChange('actions');
                } else alert("Select a target first!");
              }}
              variant="danger"
              size="md"
              icon={<SwordsIcon className="w-4 h-4" />}
              disabled={!targetEnemyId || !canPlayerAct}
              className="!py-2 text-sm"
            >
              Attack
            </ActionButton>
            <ActionButton
              onClick={() => {
                onPlayerDefend();
                handleCategoryChange('actions');
              }}
              variant="info"
              size="md"
              icon={<ShieldIcon className="w-4 h-4" />}
              disabled={!canPlayerAct}
              className="!py-2 text-sm"
            >
              Defend
            </ActionButton>
            <ActionButton
              onClick={() => {
                onPlayerFlee();
                handleCategoryChange('actions');
              }}
              variant="warning"
              size="md"
              icon={<FleeIcon className="w-4 h-4" />}
              disabled={!canPlayerAct}
              className="!py-2 text-sm"
            >
              Flee
            </ActionButton>
            <ActionButton
              type="submit"
              variant="secondary"
              size="md"
              className="!py-2 text-sm"
              disabled={!canPlayerAct || !freestyleActionText.trim()}
              onClick={handleFreestyleSubmit}
            >
              Perform
            </ActionButton>
          </div>
        </div>
      );
    case 'spells':
      return (
        <CombatActionGrid
          items={preparedSpells}
          type="spell"
          player={player}
          canPlayerAct={canPlayerAct}
          targetEnemyId={targetEnemyId}
          onActionSelect={onActionSelect}
          onMouseEnter={onMouseEnterAction}
          onMouseLeave={onMouseLeaveAction}
        />
      );
    case 'abilities':
      return (
        <CombatActionGrid
          items={abilities}
          type="ability"
          player={player}
          canPlayerAct={canPlayerAct}
          targetEnemyId={targetEnemyId}
          onActionSelect={onActionSelect}
          onMouseEnter={onMouseEnterAction}
          onMouseLeave={onMouseLeaveAction}
        />
      );
    case 'items':
      return (
        <CombatActionGrid
          items={consumables}
          type="consumable"
          player={player}
          canPlayerAct={canPlayerAct}
          targetEnemyId={targetEnemyId}
          onActionSelect={onActionSelect}
          onMouseEnter={onMouseEnterAction}
          onMouseLeave={onMouseLeaveAction}
        />
      );
    case 'log':
      return <CombatLogDisplay logs={combatLog} />;
    default:
      return (
        <p className="text-sm p-4 text-center text-slate-400">
          Select an action category.
        </p>
      );
  }
}; 