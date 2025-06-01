import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NPCsView from './NPCsView';
import { Player, NPC, Location, Settlement } from '../types'; // Assuming types are accessible
import { getLocation as mockGetLocation } from '../services/locationService';

// Mock the locationService
jest.mock('../services/locationService');

// Mock IconComponents to prevent rendering issues if they are complex
jest.mock('./IconComponents', () => ({
  UserIcon: () => <svg data-testid="user-icon" />,
  HeroBackIcon: () => <svg data-testid="hero-back-icon" />,
  MapIcon: () => <svg data-testid="map-icon" />,
  GetSpellIcon: ({ iconName }: { iconName: string }) => <svg data-testid={`spell-icon-${iconName}`} />,
}));

const mockPlayer: Player = {
  id: 'player1',
  name: 'Test Player',
  level: 5,
  currentLocationId: 'loc1',
  // Add other necessary Player fields if NPCsView depends on them
  gold: 100,
  essence: 50,
  discoveredRecipes: [],
  inventory: {},
  spells: [],
  items: [],
  equippedItems: {},
  characterClass: 'Warrior',
  attributes: { strength: 10, dexterity: 10, intelligence: 10, constitution: 10, wisdom: 10, charisma: 10 },
  skills: {},
  experience: 0,
  maxHealth: 100,
  currentHealth: 80,
  maxMana: 50,
  currentMana: 40,
  armor: 0,
  damage: 0,
  resistances: {},
  activeEffects: [],
  completedQuests: [],
  activeQuests: [],
  discoveredMapAreas: ['loc1'],
  discoveredComponents: [],
};

const mockLocation: Location = {
  id: 'loc1',
  name: 'Test Town',
  description: 'A bustling town square.',
  type: 'settlement',
  settlement: {
    id: 'settlement1',
    name: 'Test Town Center',
    type: 'town',
    population: 100,
    economy: 'stable',
    factionAffiliation: 'neutral',
    npcs: [], // Will be populated in tests
    buildings: [],
    events: [],
  },
  monsters: [],
  resources: [],
  pointsOfInterest: [],
  lore: [],
  mapPosition: { x: 0, y: 0 },
  icon: 'town-icon',
  ambientSound: 'town_sounds.mp3',
};

const mockNPC1: NPC = {
  id: 'npc1',
  name: 'Old Man Willow',
  description: 'A wise old man who has seen many seasons.',
  iconName: 'old_man_icon',
  occupation: 'Storyteller',
  relationship: 50,
  personality: 'Wise, calm, a bit forgetful.',
  dialogue: { greeting: 'Well hello there, youngster!' },
  quests: [{ id: 'quest1', name: 'Find the Lost Spectacles', description: 'His glasses are missing!', status: 'available', objectives: [], rewards: [] }],
  services: [],
  inventory: [],
  schedules: [],
  faction: 'villagers',
  currentLocationId: 'loc1',
  homeLocationId: 'loc1',
};

const mockNPC2: NPC = {
  id: 'npc2',
  name: 'Sally the Smith',
  description: 'A strong and capable blacksmith.',
  iconName: 'smith_icon',
  occupation: 'Blacksmith',
  relationship: 20,
  personality: 'Gruff but fair.',
  dialogue: { greeting: 'What d\'ya need?' },
  quests: [],
  services: [{ id: 'service1', name: 'Repair Items', description: 'Repairs damaged gear.', type: 'repair', cost: 10 }],
  inventory: [],
  schedules: [],
  faction: 'merchants',
  currentLocationId: 'loc1',
  homeLocationId: 'loc1',
};


describe('NPCsView Component', () => {
  let mockOnReturnHome: jest.Mock;
  let mockOnTalkToNPC: jest.Mock;
  let mockOnShowMessage: jest.Mock;
  let mockedGetLocationFn: jest.MockedFunction<typeof mockGetLocation>;

  beforeEach(() => {
    mockOnReturnHome = jest.fn();
    mockOnTalkToNPC = jest.fn(); // This will be overridden by setSelectedNPC logic, but good to have
    mockOnShowMessage = jest.fn();

    mockedGetLocationFn = mockGetLocation as jest.MockedFunction<typeof mockGetLocation>;
  });

  const renderComponent = (playerOverride?: Partial<Player>, npcsInLocation?: NPC[]) => {
    const currentPlayer = { ...mockPlayer, ...playerOverride };
    const currentLocationData = {
      ...mockLocation,
      settlement: {
        ...(mockLocation.settlement as Settlement),
        npcs: npcsInLocation || [],
      }
    };
    mockedGetLocationFn.mockReturnValue(currentLocationData);

    return render(
      <NPCsView
        player={currentPlayer}
        onReturnHome={mockOnReturnHome}
        onTalkToNPC={mockOnTalkToNPC}
        onShowMessage={mockOnShowMessage}
      />
    );
  };

  test('renders without crashing and displays correct initial header', () => {
    renderComponent();
    expect(screen.getByText(`NPCs in ${mockLocation.name}`)).toBeInTheDocument();
    // Check for the specific elements from the header redesign
    expect(screen.getByText('Home')).toBeInTheDocument(); // Small screen text for Return Home
    expect(screen.getByText('Return Home')).toBeInTheDocument(); // Large screen text for Return Home
    expect(screen.getByTestId('hero-back-icon')).toBeInTheDocument();
  });

  test('displays location and NPC count in the header', () => {
    renderComponent([], [mockNPC1, mockNPC2]); // Pass two NPCs
    expect(screen.getByText(`Location: ${mockLocation.name}`)).toBeInTheDocument();
    expect(screen.getByText(`NPCs Found: 2`)).toBeInTheDocument();
  });

  test('Return Home button calls onReturnHome when clicked', () => {
    renderComponent();
    const returnHomeButton = screen.getByText('Return Home'); // Or get by role
    fireEvent.click(returnHomeButton);
    expect(mockOnReturnHome).toHaveBeenCalledTimes(1);
  });

  describe('NPC List Rendering', () => {
    test('renders NPC cards when NPCs are available', () => {
      renderComponent(undefined, [mockNPC1, mockNPC2]);
      expect(screen.getByText(mockNPC1.name)).toBeInTheDocument();
      expect(screen.getByText(mockNPC1.description)).toBeInTheDocument();
      expect(screen.getByText(mockNPC2.name)).toBeInTheDocument();
      expect(screen.getByText(mockNPC2.description)).toBeInTheDocument();
      // Check for talk buttons
      expect(screen.getAllByRole('button', { name: /Talk to .+?/i })).toHaveLength(2);
    });

    test('displays "No NPCs Available" message when no NPCs are present', () => {
      renderComponent(undefined, []);
      expect(screen.getByText('No NPCs Available')).toBeInTheDocument();
      expect(screen.queryByText(mockNPC1.name)).not.toBeInTheDocument();
    });

    test('displays "Get Travel Suggestions" button for wilderness with no NPCs', () => {
      const wildernessLocation = {
        ...mockLocation,
        type: 'wilderness' as Location['type'],
        settlement: undefined
      };
      mockedGetLocationFn.mockReturnValue(wildernessLocation); // getLocation now returns a wilderness area

      render( // Use direct render to bypass helper's settlement assumption for this specific case
        <NPCsView
          player={mockPlayer}
          onReturnHome={mockOnReturnHome}
          onTalkToNPC={mockOnTalkToNPC}
          onShowMessage={mockOnShowMessage}
        />
      );
      expect(screen.getByText('No NPCs Available')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Get Travel Suggestions' })).toBeInTheDocument();
    });
  });

  describe('Filtering UI', () => {
    test('renders filter buttons', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Services' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Quests' })).toBeInTheDocument();
    });

    test('filter buttons change appearance when clicked (simulating active state)', () => {
      renderComponent();
      const allButton = screen.getByRole('button', { name: 'All' });
      const servicesButton = screen.getByRole('button', { name: 'Services' });
      const questsButton = screen.getByRole('button', { name: 'Quests' });

      // Initial state: 'All' should be primary
      // The ActionButton component uses 'variant' prop to change style.
      // We can't directly check the variant prop, but we assume primary/secondary variants have distinct visual differences.
      // For this test, we'll just ensure clicking them doesn't crash.
      // A more robust test would involve checking for specific class names if the variants apply them.
      expect(allButton).toHaveClass('bg-green-500'); // Assuming primary has green-500

      fireEvent.click(servicesButton);
      // Now 'Services' should be primary. The actual filtering logic is not tested here.
      // We'd need to check for a class that indicates 'primary' for the servicesButton
      // and 'secondary' for others. This depends on ActionButton's implementation details.
      // For now, we'll assume clicking changes state and doesn't break.
      expect(servicesButton).toHaveClass('bg-green-500'); // Assuming primary has green-500
      expect(allButton).not.toHaveClass('bg-green-500'); // Assuming secondary does not

      fireEvent.click(questsButton);
      expect(questsButton).toHaveClass('bg-green-500');
      expect(servicesButton).not.toHaveClass('bg-green-500');

      fireEvent.click(allButton);
      expect(allButton).toHaveClass('bg-green-500');
      expect(questsButton).not.toHaveClass('bg-green-500');
    });
  });

  describe('NPC Selection and Detail Display', () => {
    test('initially shows placeholder in the right column', () => {
      renderComponent();
      expect(screen.getByText('Select an NPC from the list to see more details.')).toBeInTheDocument();
    });

    test('clicking "Talk to NPC" button selects the NPC and displays their details', () => {
      renderComponent(undefined, [mockNPC1, mockNPC2]);

      // Find the "Talk to Old Man Willow" button specifically
      const talkButtonNPC1 = screen.getByRole('button', { name: `Talk to ${mockNPC1.name}` });
      fireEvent.click(talkButtonNPC1);

      // Verify right panel now shows NPC1's details
      expect(screen.getByText(mockNPC1.name, { selector: 'h2' })).toBeInTheDocument(); // Name is in h2 in detail view
      expect(screen.getByText(mockNPC1.occupation, { selector: 'p' })).toBeInTheDocument(); // Occupation is in p
      expect(screen.getByText(mockNPC1.description, { selector: 'p.leading-relaxed' })).toBeInTheDocument(); // Full description
      expect(screen.getByText(`"${mockNPC1.personality}"`)).toBeInTheDocument();

      // Check for quest details
      expect(screen.getByText('Quests')).toBeInTheDocument();
      expect(screen.getByText(mockNPC1.quests[0].name)).toBeInTheDocument();

      // Check for interaction buttons in detail view
      expect(screen.getByRole('button', { name: 'View Services' })).toBeInTheDocument(); // Placeholder, no services for NPC1
      expect(screen.getByRole('button', { name: 'Discuss Quests' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Chat' })).toBeInTheDocument();

      // Ensure the original onTalkToNPC prop was NOT called
      expect(mockOnTalkToNPC).not.toHaveBeenCalled();
    });

    test('displays services for NPC with services when selected', () => {
      renderComponent(undefined, [mockNPC2]);
      const talkButtonNPC2 = screen.getByRole('button', { name: `Talk to ${mockNPC2.name}` });
      fireEvent.click(talkButtonNPC2);

      expect(screen.getByText(mockNPC2.name, { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText(mockNPC2.services[0].name, { exact: false })).toBeInTheDocument(); // part of 'Service Name - Description'
      expect(screen.getByText(mockNPC2.services[0].description, { exact: false })).toBeInTheDocument();
    });
  });

  describe('Help Section', () => {
    test('renders the help section with its title', () => {
      renderComponent();
      expect(screen.getByText('About NPCs')).toBeInTheDocument();
      // Check for some content from the help section
      expect(screen.getByText('NPCs with services can provide shops, repairs, or special abilities.')).toBeInTheDocument();
    });
  });
});
