import { Player, HomesteadProject, ResourceCost } from '../../types';
import { 
  canAffordResourceCost, 
  consumeResources, 
  addProjectRewards, 
  getUpgradeCosts, 
  applyPropertyUpgrade,
  generateProjectId 
} from '../../src/services/homesteadService';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';

/**
 * Homestead Management Module
 * Handles homestead projects, upgrades, and property management
 */

export interface HomesteadProjectResult {
  success: boolean;
  updatedPlayer?: Player;
  error?: string;
  message?: string;
}

export interface HomesteadUpgradeResult {
  success: boolean;
  updatedPlayer?: Player;
  error?: string;
  message?: string;
}

/**
 * Start a new homestead project
 * @param player - Current player state
 * @param project - Project data (without id and startTime)
 * @returns Result with updated player and message
 */
export const startHomesteadProject = (
  player: Player,
  project: Omit<HomesteadProject, 'id' | 'startTime'>
): HomesteadProjectResult => {
  if (!canAffordResourceCost(player.inventory, project.resourceCost)) {
    return {
      success: false,
      error: "You don't have the required resources for this project."
    };
  }

  const newProject: HomesteadProject = {
    ...project,
    id: generateProjectId(),
    startTime: Date.now()
  };

  const updatedPlayer = {
    ...player,
    inventory: consumeResources(player.inventory, project.resourceCost),
    homestead: {
      ...player.homestead,
      activeProjects: [...player.homestead.activeProjects, newProject]
    }
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer,
    message: `${project.name} has begun! It will take ${project.duration} hours to complete.`
  };
};

/**
 * Complete a homestead project and collect rewards
 * @param player - Current player state
 * @param projectId - ID of project to complete
 * @returns Result with updated player and message
 */
export const completeHomesteadProject = (
  player: Player,
  projectId: string
): HomesteadProjectResult => {
  const project = player.homestead.activeProjects.find(p => p.id === projectId);
  if (!project) {
    return {
      success: false,
      error: "Project not found."
    };
  }

  const updatedPlayer = {
    ...player,
    inventory: addProjectRewards(player.inventory, project.rewards),
    homestead: {
      ...player.homestead,
      activeProjects: player.homestead.activeProjects.filter(p => p.id !== projectId)
    }
  };

  const rewardMessages = project.rewards?.map(reward => {
    if (reward.type === 'resource' || reward.type === 'item') {
      const item = MASTER_ITEM_DEFINITIONS[reward.itemId!];
      return `${reward.quantity}x ${item?.name || reward.itemId}`;
    }
    return reward.type;
  }) || [];

  const message = `${project.name} finished! ${rewardMessages.length > 0 ? `Received: ${rewardMessages.join(', ')}` : ''}`;

  return {
    success: true,
    updatedPlayer: updatedPlayer,
    message: message
  };
};

/**
 * Upgrade a homestead property
 * @param player - Current player state
 * @param propertyName - Name of property to upgrade
 * @param upgradeName - Name of upgrade to apply
 * @returns Result with updated player and message
 */
export const upgradeHomesteadProperty = (
  player: Player,
  propertyName: string,
  upgradeName: string
): HomesteadUpgradeResult => {
  const property = player.homestead.properties[propertyName];
  if (!property) {
    return {
      success: false,
      error: "Property not found."
    };
  }

  const costs = getUpgradeCosts(upgradeName);
  if (!canAffordResourceCost(player.inventory, costs)) {
    return {
      success: false,
      error: "Insufficient resources for this upgrade."
    };
  }

  const updatedPlayer = {
    ...player,
    inventory: consumeResources(player.inventory, costs),
    homestead: {
      ...player.homestead,
      properties: {
        ...player.homestead.properties,
        [propertyName]: applyPropertyUpgrade(property, upgradeName)
      }
    }
  };

  return {
    success: true,
    updatedPlayer: updatedPlayer,
    message: `${propertyName} has been upgraded with ${upgradeName.replace('_', ' ')}!`
  };
};

/**
 * Check if a project can be started
 * @param player - Current player state
 * @param project - Project to check
 * @returns True if project can be started
 */
export const canStartProject = (
  player: Player,
  project: Omit<HomesteadProject, 'id' | 'startTime'>
): boolean => {
  return canAffordResourceCost(player.inventory, project.resourceCost);
};

/**
 * Check if a property can be upgraded
 * @param player - Current player state
 * @param propertyName - Name of property to check
 * @param upgradeName - Name of upgrade to check
 * @returns True if upgrade can be applied
 */
export const canUpgradeProperty = (
  player: Player,
  propertyName: string,
  upgradeName: string
): boolean => {
  const property = player.homestead.properties[propertyName];
  if (!property) return false;
  
  const costs = getUpgradeCosts(upgradeName);
  return canAffordResourceCost(player.inventory, costs);
};

/**
 * Get all active projects for a player
 * @param player - Current player state
 * @returns Array of active projects
 */
export const getActiveProjects = (player: Player): HomesteadProject[] => {
  return player.homestead.activeProjects;
};

/**
 * Get all completed projects that can be collected
 * @param player - Current player state
 * @returns Array of completed project IDs
 */
export const getCompletedProjects = (player: Player): string[] => {
  const currentTime = Date.now();
  return player.homestead.activeProjects
    .filter(project => {
      const completionTime = project.startTime + (project.duration * 60 * 60 * 1000); // Convert hours to milliseconds
      return currentTime >= completionTime;
    })
    .map(project => project.id);
};

/**
 * Get time remaining for a project in milliseconds
 * @param project - Project to check
 * @returns Time remaining in milliseconds, 0 if completed
 */
export const getProjectTimeRemaining = (project: HomesteadProject): number => {
  const currentTime = Date.now();
  const completionTime = project.startTime + (project.duration * 60 * 60 * 1000);
  return Math.max(0, completionTime - currentTime);
};

/**
 * Check if a project is completed
 * @param project - Project to check
 * @returns True if project is completed
 */
export const isProjectCompleted = (project: HomesteadProject): boolean => {
  return getProjectTimeRemaining(project) === 0;
};

/**
 * Homestead Manager utility functions
 */
export const HomesteadManagerUtils = {
  startHomesteadProject,
  completeHomesteadProject,
  upgradeHomesteadProperty,
  canStartProject,
  canUpgradeProperty,
  getActiveProjects,
  getCompletedProjects,
  getProjectTimeRemaining,
  isProjectCompleted,
}; 