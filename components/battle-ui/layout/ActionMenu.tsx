import React from 'react';
import ActionButton from './ActionButton';
import { DynamicAreaView, JornBattleConfig } from '../../../types';
import { SwordsIcon, WandIcon, BookIcon, PotionGenericIcon, SkullIcon } from '../../books/IconComponents';

interface ActionMenuProps {
  activeDynamicView: DynamicAreaView;
  onCategoryChange: (view: DynamicAreaView) => void;
  canPlayerAct: boolean;
  config: JornBattleConfig; // Pass config to potentially style buttons based on menuStyle
  isEditMode: boolean;
  selectedElement: string | null;
  onElementSelect: (element: string) => void;
  onMouseDown: (e: React.MouseEvent, element: string) => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  activeDynamicView,
  onCategoryChange,
  canPlayerAct,
  config,
  isEditMode,
  selectedElement,
  onElementSelect,
  onMouseDown,
}) => {
  const buttonBaseClass = `w-full !justify-start !text-xs sm:!text-sm !py-2 sm:!py-2.5 ${config.menuStyle?.buttonColor || 'bg-slate-700'} ${config.menuStyle?.textColor || 'text-slate-200'} ${config.menuStyle?.hoverColor || 'hover:bg-slate-600'}`;
  const activeClass = `ring-2 ring-offset-2 ring-offset-slate-800 ${config.menuStyle?.activeColor ? config.menuStyle.activeColor.replace('bg', 'ring') : 'ring-sky-500'}`;

  return (
    <div
      className={`absolute rounded-lg shadow-md overflow-hidden transition-all duration-200 ${isEditMode ? 'border-2 border-teal-400' : 'border border-slate-700/60'} ${isEditMode && selectedElement === 'actionMenu' ? 'ring-2 ring-teal-500/50 ring-offset-2 ring-offset-slate-900' : ''}`}
      style={{
        left: `${config.layout.actionMenu.position.x}%`,
        top: `${config.layout.actionMenu.position.y}%`,
        width: `${config.layout.actionMenu.size.width}%`,
        height: `${config.layout.actionMenu.size.height}%`,
        backgroundColor: config.menuStyle?.backgroundColor || 'bg-slate-800/70',
        zIndex: config.layout.actionMenu.zIndex,
      }}
       onClick={() => isEditMode && onElementSelect('actionMenu')}
       onMouseDown={(e) => isEditMode && onMouseDown(e, 'actionMenu')}
    >
      <div className="p-2 flex flex-row flex-wrap justify-around items-center space-y-0 space-x-0 sm:flex-col sm:space-y-2 sm:space-x-0 h-full">
        <ActionButton
          label="Actions"
          icon={<SwordsIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          view="actions"
          isActive={activeDynamicView === 'actions'}
          onClick={() => onCategoryChange('actions')}
          disabled={!canPlayerAct}
          className={`${buttonBaseClass} ${activeDynamicView === 'actions' ? activeClass : ''}`}
        >
          Actions
        </ActionButton>
        <ActionButton
          label="Spells"
          icon={<WandIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          view="spells"
          isActive={activeDynamicView === 'spells'}
          onClick={() => onCategoryChange('spells')}
          disabled={!canPlayerAct}
           className={`${buttonBaseClass} ${activeDynamicView === 'spells' ? activeClass : ''}`}
        >
          Spells
        </ActionButton>
        <ActionButton
          label="Abilities"
          icon={<SkullIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          view="abilities"
          isActive={activeDynamicView === 'abilities'}
          onClick={() => onCategoryChange('abilities')}
          disabled={!canPlayerAct}
           className={`${buttonBaseClass} ${activeDynamicView === 'abilities' ? activeClass : ''}`}
        >
          Abilities
        </ActionButton>
        <ActionButton
          label="Items"
          icon={<PotionGenericIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          view="items"
          isActive={activeDynamicView === 'items'}
          onClick={() => onCategoryChange('items')}
          disabled={!canPlayerAct}
           className={`${buttonBaseClass} ${activeDynamicView === 'items' ? activeClass : ''}`}
        >
          Items
        </ActionButton>
        <ActionButton
          label="Log"
          icon={<BookIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          view="log"
          isActive={activeDynamicView === 'log'}
          onClick={() => onCategoryChange('log')}
          disabled={false} // Log is always viewable
           className={`${buttonBaseClass} ${activeDynamicView === 'log' ? activeClass : ''}`}
        >
          Log
        </ActionButton>
      </div>
       {isEditMode && selectedElement === 'actionMenu' && (
        <div className="absolute inset-0 border-2 border-teal-500 bg-teal-500/10 pointer-events-none">
          <div className="absolute -top-6 left-0 bg-teal-500 text-white text-xs px-2 py-1 rounded">Action Menu ({config.layout.actionMenu.size.width.toFixed(1)}% × {config.layout.actionMenu.size.height.toFixed(1)}%)</div>
        </div>
      )}
    </div>
  );
}; 