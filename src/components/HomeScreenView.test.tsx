import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomeScreenView from './HomeScreenView';
import { Player, PlayerEffectiveStats, Quest } from '../types'; // Assuming Quest is needed for player.quests

// Mock PlayerStatsDisplay
jest.mock('./PlayerStatsDisplay', () => () => <div>Mocked PlayerStatsDisplay</div>);

// Mock locationService
jest.mock('../services/locationService', () => ({
  getLocation: jest.fn((id) => ({
    id,
    name: 'Mocked Location',
    description: 'A mocked description',
    type: 'wilderness',
    dangerLevel: 1,
    resources: [],
    enemies: [],
    uniqueFeatures: [],
    settlement: undefined,
  })),
}));

const mockPlayer: Player = {
  id: 'player1',
  name: 'Test Player',
  hp: 100,
  mp: 50,
  ep: 75,
  level: 5,
  body: 10,
  mind: 10,
  reflex: 10,
  spirit: 10,
  social: 10,
  gold: 1000,
  essence: 500,
  inventory: [],
  equipment: {},
  abilities: [],
  spellbook: [],
  traits: [],
  currentLocationId: 'loc1',
  discoveredLocationIds: ['loc1'],
  completedQuestIds: [],
  activeQuestIds: [],
  quests: [] as Quest[], // Initialize as empty array or with mock Quests
  researchPoints: 0,
  researchTrees: [],
  completedResearchNodeIds: [],
  availableResearchNodeIds: [],
  spriteName: 'jorn-default',
  characterClass: 'adventurer',
  experience: 0,
  experienceToNextLevel: 100,
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockEffectiveStats: PlayerEffectiveStats = {
  maxHp: 100,
  maxMp: 50,
  maxEp: 75,
  attack: 10,
  defense: 10,
  magicAttack: 10,
  magicDefense: 10,
  speed: 10,
  critChance: 0.05,
  critDamage: 1.5,
  elementalResistances: {},
  statusResistances: {},
};

const mockProps = {
  player: mockPlayer,
  effectiveStats: mockEffectiveStats,
  onFindEnemy: jest.fn(),
  isLoading: false,
  onExploreMap: jest.fn(),
  onOpenResearchArchives: jest.fn(),
  onOpenCamp: jest.fn(),
  onRestComplete: jest.fn(),
  onAccessSettlement: jest.fn(),
  onOpenCraftingHub: jest.fn(),
  onOpenHomestead: jest.fn(),
  onOpenNPCs: jest.fn(),
  onOpenQuestBook: jest.fn(),
  onNavigateToMultiplayer: jest.fn(),
};

describe('HomeScreenView', () => {
  it('renders the video background with correct attributes and styles', () => {
    render(<HomeScreenView {...mockProps} />);

    const videoBackground = screen.getByRole('video');

    expect(videoBackground).toBeInTheDocument();
    expect(videoBackground).toHaveAttribute('autoPlay');
    expect(videoBackground).toHaveAttribute('muted');
    expect(videoBackground).toHaveAttribute('loop');
    expect(videoBackground).toHaveAttribute('playsInline');

    // Check for inline styles
    expect(videoBackground).toHaveStyle('position: fixed');
    expect(videoBackground).toHaveStyle('z-index: -20');
    expect(videoBackground).toHaveStyle('object-fit: cover');
    expect(videoBackground).toHaveStyle('width: 100vw');
    expect(videoBackground).toHaveStyle('height: 100vh');
    expect(videoBackground).toHaveStyle('filter: blur(2px) brightness(0.4) contrast(1.1) saturate(0.8)');

    // Check for video source
    const videoSource = videoBackground.querySelector('source');
    expect(videoSource).toHaveAttribute('src', '/assets/background/jorn-background.webm');
    expect(videoSource).toHaveAttribute('type', 'video/webm');
  });

  it('renders fallback background and overlay elements', () => {
    render(<HomeScreenView {...mockProps} />);

    // Check for fallback background (should be present even if video loads)
    const fallbackBackground = document.querySelector('[style*="z-index: -25"]');
    expect(fallbackBackground).toBeInTheDocument();
    expect(fallbackBackground).toHaveClass('bg-gradient-to-br', 'from-slate-950', 'via-slate-900', 'to-slate-950');
    expect(fallbackBackground).toHaveStyle('filter: brightness(0.6)');

    // Check for dark overlay
    const darkOverlay = document.querySelector('[style*="z-index: -15"]');
    expect(darkOverlay).toBeInTheDocument();
    expect(darkOverlay).toHaveClass('bg-black/10');
  });

  // Add a placeholder test to ensure the file is picked up by the test runner
  it('should always pass', () => {
    expect(true).toBe(true);
  });
});
