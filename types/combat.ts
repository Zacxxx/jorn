import { Spell, Ability, Consumable, Player, Enemy, CombatActionLog, GameState, PlayerEffectiveStats } from '../types';
import { JornBattleConfig, Position } from './layout';

export type DynamicAreaView = 'actions' | 'spells' | 'abilities' | 'items' | 'log';
export type CombatActionItemType = Spell | Ability | Consumable;

export interface CombatViewProps {
  player: Player;
  effectivePlayerStats: PlayerEffectiveStats;
  currentEnemies: Enemy[];
  targetEnemyId: string | null;
  onSetTargetEnemy: (enemyId: string) => void;
  preparedSpells: Spell[];
  onPlayerAttack: (spell: Spell, targetId: string) => void;
  onPlayerBasicAttack: (targetId: string) => void;
  onPlayerDefend: () => void;
  onPlayerFlee: () => void;
  onPlayerFreestyleAction: (actionText: string, targetId: string | null) => void;
  combatLog: CombatActionLog[];
  isPlayerTurn: boolean;
  playerActionSkippedByStun: boolean;
  onSetGameState: (state: GameState) => void; 
  onUseConsumable: (consumableId: string, targetId: string | null) => void;
  onUseAbility: (abilityId: string, targetId: string | null) => void;
  consumables: Consumable[];
  abilities: Ability[];
  config?: Partial<JornBattleConfig>;
}

// Extended types for positioning
export interface PositionedPlayer extends Player {
  battlePosition?: Position;
}

export interface PositionedEnemy extends Enemy {
  battlePosition?: Position;
} 