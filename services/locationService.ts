import { Location, Settlement, NPC, Shop, Tavern, PointOfInterest } from '../types';
import locationData from '../src/data/locations.json';

export interface LocationData {
  locations: Record<string, Location>;
  homestead: {
    id: string;
    name: string;
    description: string;
    properties: Record<string, any>;
  };
}

let loadedLocationData: LocationData | null = null;

export const loadLocationData = (): LocationData => {
  if (!loadedLocationData) {
    loadedLocationData = locationData as LocationData;
  }
  return loadedLocationData;
};

export const getLocation = (locationId: string): Location | null => {
  const data = loadLocationData();
  return data.locations[locationId] || null;
};

export const getAllLocations = (): Location[] => {
  const data = loadLocationData();
  return Object.values(data.locations);
};

export const getDiscoveredLocations = (): Location[] => {
  return getAllLocations().filter(location => location.discovered);
};

export const getSettlements = (): Location[] => {
  return getAllLocations().filter(location => location.type === 'settlement');
};

export const getDiscoveredSettlements = (): Location[] => {
  return getSettlements().filter(location => location.discovered);
};

export const getNPCById = (npcId: string): NPC | null => {
  const locations = getAllLocations();
  for (const location of locations) {
    if (location.settlement) {
      const npc = location.settlement.npcs.find(n => n.id === npcId);
      if (npc) return npc;
    }
  }
  return null;
};

export const getShopById = (shopId: string): Shop | null => {
  const locations = getAllLocations();
  for (const location of locations) {
    if (location.settlement) {
      const shop = location.settlement.shops.find(s => s.id === shopId);
      if (shop) return shop;
    }
  }
  return null;
};

export const getTavernById = (tavernId: string): Tavern | null => {
  const locations = getAllLocations();
  for (const location of locations) {
    if (location.settlement) {
      const tavern = location.settlement.taverns.find(t => t.id === tavernId);
      if (tavern) return tavern;
    }
  }
  return null;
};

export const getTravelTime = (fromLocationId: string, toLocationId: string): number => {
  const fromLocation = getLocation(fromLocationId);
  if (!fromLocation) return -1;
  
  return fromLocation.connectedLocations[toLocationId] || -1;
};

export const getHomesteadData = () => {
  const data = loadLocationData();
  return data.homestead;
};

export const updateLocationDiscovery = (locationId: string, discovered: boolean): void => {
  const data = loadLocationData();
  if (data.locations[locationId]) {
    data.locations[locationId].discovered = discovered;
  }
};

// Helper function to check if a location is accessible from current location
export const isLocationAccessible = (currentLocationId: string, targetLocationId: string): boolean => {
  const currentLocation = getLocation(currentLocationId);
  if (!currentLocation) return false;
  
  return Object.keys(currentLocation.connectedLocations).includes(targetLocationId);
};

// Get all locations accessible from current location
export const getAccessibleLocations = (currentLocationId: string): Location[] => {
  const currentLocation = getLocation(currentLocationId);
  if (!currentLocation) return [];
  
  const accessibleLocationIds = Object.keys(currentLocation.connectedLocations);
  return accessibleLocationIds
    .map(id => getLocation(id))
    .filter((location): location is Location => location !== null);
}; 