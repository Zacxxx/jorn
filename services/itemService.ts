
import { MasterItemDefinition, MasterResourceItem, MasterConsumableItem } from '../types';

export let MASTER_ITEM_DEFINITIONS: Record<string, MasterItemDefinition> = {};

export async function loadMasterItems(): Promise<void> {
  try {
    const [resourcesResponse, consumablesResponse] = await Promise.all([
      fetch('/lists/items/resources.json'),
      fetch('/lists/items/consumables.json')
    ]);

    if (!resourcesResponse.ok) {
      throw new Error(`Failed to load resources.json: ${resourcesResponse.statusText}`);
    }
    if (!consumablesResponse.ok) {
      throw new Error(`Failed to load consumables.json: ${consumablesResponse.statusText}`);
    }

    const resourcesData: MasterResourceItem[] = await resourcesResponse.json();
    const consumablesData: MasterConsumableItem[] = await consumablesResponse.json();
    
    const allItems: MasterItemDefinition[] = [...resourcesData, ...consumablesData];

    MASTER_ITEM_DEFINITIONS = allItems.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, MasterItemDefinition>);

    console.log("Master Item Definitions loaded successfully:", MASTER_ITEM_DEFINITIONS);

  } catch (error) {
    console.error("Error loading master item definitions:", error);
    // In a real app, you might want to set a default empty object or handle this more gracefully
    MASTER_ITEM_DEFINITIONS = {};
  }
}
