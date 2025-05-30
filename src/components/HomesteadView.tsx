import React, { useState, useEffect } from 'react';
import { Player, Homestead, HomesteadProject, HomesteadProperty, ResourceCost } from '../types';
import ActionButton from '../../ui/ActionButton';
import Modal from '../../ui/Modal';
import { 
  HomeIcon, 
  GearIcon, 
  FlaskIcon, 
  MapIcon, 
  HeroBackIcon,
  PlusIcon,
  GoldCoinIcon,
  CheckmarkCircleIcon,
  BuildingIcon
} from './IconComponents';
import { GetSpellIcon } from './IconComponents';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';

interface HomesteadViewProps {
  player: Player;
  onReturnHome: () => void;
  onStartProject: (project: Omit<HomesteadProject, 'id' | 'startTime'>) => void;
  onCompleteProject: (projectId: string) => void;
  onUpgradeProperty: (propertyName: string, upgradeName: string) => void;
  onShowMessage: (title: string, message: string) => void;
}

const HomesteadView: React.FC<HomesteadViewProps> = ({
  player,
  onReturnHome,
  onStartProject,
  onCompleteProject,
  onUpgradeProperty,
  onShowMessage,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectType, setProjectType] = useState<'upgrade' | 'production' | 'research'>('production');

  // Calculate time remaining for projects
  const getTimeRemaining = (project: HomesteadProject): number => {
    const elapsed = (Date.now() - project.startTime) / (1000 * 60 * 60); // hours
    return Math.max(0, project.duration - elapsed);
  };

  const isProjectComplete = (project: HomesteadProject): boolean => {
    return getTimeRemaining(project) <= 0;
  };

  const formatTimeRemaining = (hours: number): string => {
    if (hours === 0) return 'Complete!';
    if (hours < 1) return `${Math.ceil(hours * 60)}m`;
    return `${Math.ceil(hours)}h`;
  };

  // Property upgrade costs
  const getUpgradeCost = (property: HomesteadProperty, upgrade: string): ResourceCost[] => {
    const baseCosts: Record<string, ResourceCost[]> = {
      'expanded_plots': [
        { type: 'Iron Ore', itemId: 'iron_ore', quantity: 10 },
        { type: 'Verdant Leaf', itemId: 'verdant_leaf', quantity: 5 }
      ],
      'greenhouse': [
        { type: 'Crystal Shard', itemId: 'crystal_shard', quantity: 3 },
        { type: 'Mystic Orb', itemId: 'mystic_orb', quantity: 2 }
      ],
      'magical_fertilizer': [
        { type: 'Arcane Dust', itemId: 'arcane_dust', quantity: 8 },
        { type: 'Emberbloom Petal', itemId: 'emberbloom_petal', quantity: 4 }
      ],
      'advanced_tools': [
        { type: 'Iron Ore', itemId: 'iron_ore', quantity: 15 },
        { type: 'Crystal Shard', itemId: 'crystal_shard', quantity: 2 }
      ],
      'enchanting_table': [
        { type: 'Mystic Orb', itemId: 'mystic_orb', quantity: 3 },
        { type: 'Arcane Dust', itemId: 'arcane_dust', quantity: 12 }
      ],
      'alchemy_station': [
        { type: 'Emberbloom Petal', itemId: 'emberbloom_petal', quantity: 6 },
        { type: 'Verdant Leaf', itemId: 'verdant_leaf', quantity: 8 }
      ],
      'expanded_storage': [
        { type: 'Iron Ore', itemId: 'iron_ore', quantity: 20 },
        { type: 'Ancient Bone', itemId: 'ancient_bone', quantity: 3 }
      ],
      'magical_vault': [
        { type: 'Mystic Orb', itemId: 'mystic_orb', quantity: 4 },
        { type: 'Crystal Shard', itemId: 'crystal_shard', quantity: 5 }
      ],
      'item_sorter': [
        { type: 'Arcane Dust', itemId: 'arcane_dust', quantity: 10 },
        { type: 'Shadowsilk Thread', itemId: 'shadowsilk_thread', quantity: 6 }
      ]
    };
    return baseCosts[upgrade] || [];
  };

  const canAffordUpgrade = (costs: ResourceCost[]): boolean => {
    return costs.every(cost => (player.inventory[cost.itemId] || 0) >= cost.quantity);
  };

  const handleStartProject = (type: 'upgrade' | 'production' | 'research', target: string) => {
    const projectTemplates: Record<string, Omit<HomesteadProject, 'id' | 'startTime'>> = {
      'herb_production': {
        name: 'Grow Medicinal Herbs',
        description: 'Cultivate valuable herbs in your garden.',
        type: 'production',
        targetProperty: 'garden',
        duration: 4,
        resourceCost: [{ type: 'Verdant Leaf', itemId: 'verdant_leaf', quantity: 2 }],
        rewards: [
          { type: 'resource', itemId: 'verdant_leaf', quantity: 6 },
          { type: 'item', itemId: 'health_potion_minor', quantity: 2 }
        ]
      },
      'craft_materials': {
        name: 'Craft Basic Materials',
        description: 'Use your workshop to create useful crafting materials.',
        type: 'production',
        targetProperty: 'workshop',
        duration: 6,
        resourceCost: [
          { type: 'Iron Ore', itemId: 'iron_ore', quantity: 5 },
          { type: 'Crystal Shard', itemId: 'crystal_shard', quantity: 2 }
        ],
        rewards: [
          { type: 'resource', itemId: 'arcane_dust', quantity: 4 },
          { type: 'resource', itemId: 'shadowsilk_thread', quantity: 3 }
        ]
      },
      'organize_storage': {
        name: 'Organize Storage',
        description: 'Sort and optimize your storage for better efficiency.',
        type: 'production',
        targetProperty: 'storage',
        duration: 2,
        resourceCost: [],
        rewards: [
          { type: 'resource', itemId: 'ancient_bone', quantity: 1 }
        ]
      }
    };

    const template = projectTemplates[target];
    if (template) {
      onStartProject(template);
      setShowProjectModal(false);
    }
  };

  const renderProperty = (name: string, property: HomesteadProperty) => {
    const propertyIcons: Record<string, React.ReactNode> = {
      garden: <FlaskIcon className="w-6 h-6 text-green-400" />,
      workshop: <GearIcon className="w-6 h-6 text-blue-400" />,
      storage: <BuildingIcon className="w-6 h-6 text-purple-400" />
    };

    const activeProjects = player.homestead.activeProjects.filter(p => p.targetProperty === name);

    return (
      <div key={name} className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {propertyIcons[name]}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 capitalize">{name}</h3>
              <p className="text-sm text-slate-400">Level {property.level}</p>
            </div>
          </div>
          <ActionButton
            onClick={() => setSelectedProperty(selectedProperty === name ? null : name)}
            variant="secondary"
            size="sm"
          >
            {selectedProperty === name ? 'Hide' : 'Manage'}
          </ActionButton>
        </div>

        <p className="text-sm text-slate-300 mb-3">{property.description}</p>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-slate-200 mb-2 flex items-center">
              <GearIcon className="w-4 h-4 mr-1" />
              Active Projects
            </h4>
            {activeProjects.map(project => (
              <div key={project.id} className="bg-slate-600/50 rounded p-2 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{project.name}</p>
                    <p className="text-xs text-slate-400">{formatTimeRemaining(getTimeRemaining(project))}</p>
                  </div>
                  {isProjectComplete(project) && (
                    <ActionButton
                      onClick={() => onCompleteProject(project.id)}
                      variant="success"
                      size="sm"
                      icon={<CheckmarkCircleIcon className="w-4 h-4" />}
                    >
                      Complete
                    </ActionButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expanded Property Management */}
        {selectedProperty === name && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available Upgrades */}
              <div>
                <h4 className="text-sm font-medium text-slate-200 mb-2">Available Upgrades</h4>
                {property.upgrades.filter(upgrade => upgrade !== property.currentUpgrade).map(upgrade => {
                  const costs = getUpgradeCost(property, upgrade);
                  const canAfford = canAffordUpgrade(costs);
                  
                  return (
                    <div key={upgrade} className="bg-slate-600/30 rounded p-3 mb-2">
                      <p className="text-sm font-medium text-slate-100 capitalize mb-1">
                        {upgrade.replace('_', ' ')}
                      </p>
                      <div className="text-xs text-slate-400 space-y-1">
                        {costs.map(cost => {
                          const item = MASTER_ITEM_DEFINITIONS[cost.itemId];
                          const playerHas = player.inventory[cost.itemId] || 0;
                          return (
                            <div key={cost.itemId} className="flex items-center justify-between">
                              <span>{cost.quantity}x {item?.name || cost.type}</span>
                              <span className={playerHas >= cost.quantity ? 'text-green-400' : 'text-red-400'}>
                                ({playerHas})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <ActionButton
                        onClick={() => onUpgradeProperty(name, upgrade)}
                        variant={canAfford ? "primary" : "secondary"}
                        size="sm"
                        disabled={!canAfford}
                        className="w-full mt-2"
                      >
                        {canAfford ? 'Upgrade' : 'Insufficient Resources'}
                      </ActionButton>
                    </div>
                  );
                })}
              </div>

              {/* Production Actions */}
              <div>
                <h4 className="text-sm font-medium text-slate-200 mb-2">Production Actions</h4>
                <div className="space-y-2">
                  {name === 'garden' && (
                    <ActionButton
                      onClick={() => handleStartProject('production', 'herb_production')}
                      variant="success"
                      size="sm"
                      className="w-full"
                      disabled={activeProjects.length > 0}
                      icon={<FlaskIcon className="w-4 h-4" />}
                    >
                      Grow Herbs (4h)
                    </ActionButton>
                  )}
                  {name === 'workshop' && (
                    <ActionButton
                      onClick={() => handleStartProject('production', 'craft_materials')}
                      variant="success"
                      size="sm"
                      className="w-full"
                      disabled={activeProjects.length > 0}
                      icon={<GearIcon className="w-4 h-4" />}
                    >
                      Craft Materials (6h)
                    </ActionButton>
                  )}
                  {name === 'storage' && (
                    <ActionButton
                      onClick={() => handleStartProject('production', 'organize_storage')}
                      variant="success"
                      size="sm"
                      className="w-full"
                      disabled={activeProjects.length > 0}
                      icon={<BuildingIcon className="w-4 h-4" />}
                    >
                      Organize (2h)
                    </ActionButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60">
        <h2 className="text-3xl font-bold text-amber-300 mb-2 flex items-center justify-center" style={{fontFamily: "'Inter Tight', sans-serif"}}>
          <HomeIcon className="w-8 h-8 mr-3 text-amber-400" />
          {player.homestead.name}
        </h2>
        <p className="text-slate-300 mb-4">{player.homestead.description}</p>
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <GoldCoinIcon className="w-4 h-4 mr-1 text-yellow-400" />
            <span className="text-slate-300">Investment: {player.homestead.totalInvestment}g</span>
          </div>
          <div className="flex items-center">
            <GearIcon className="w-4 h-4 mr-1 text-blue-400" />
            <span className="text-slate-300">Active Projects: {player.homestead.activeProjects.length}</span>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center">
          <BuildingIcon className="w-6 h-6 mr-2 text-purple-400" />
          Homestead Properties
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(player.homestead.properties).map(([name, property]) =>
            renderProperty(name, property)
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 p-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton
            onClick={() => onShowMessage('Coming Soon', 'Advanced homestead features are being developed!')}
            variant="info"
            size="lg"
            icon={<MapIcon className="w-5 h-5" />}
            className="h-full !py-4"
          >
            Expand Plot
          </ActionButton>
          <ActionButton
            onClick={() => onShowMessage('Coming Soon', 'Research projects will be available soon!')}
            variant="info"
            size="lg"
            icon={<FlaskIcon className="w-5 h-5" />}
            className="h-full !py-4"
          >
            Research
          </ActionButton>
          <ActionButton
            onClick={() => onShowMessage('Coming Soon', 'Hire workers to automate your homestead!')}
            variant="info"
            size="lg"
            icon={<GearIcon className="w-5 h-5" />}
            className="h-full !py-4"
          >
            Hire Workers
          </ActionButton>
          <ActionButton
            onClick={onReturnHome}
            variant="secondary"
            size="lg"
            icon={<HeroBackIcon className="w-5 h-5" />}
            className="h-full !py-4"
          >
            Return Home
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default HomesteadView; 