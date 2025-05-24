"use client"

import type React from "react"

import { useState, useEffect, useRef, type ReactNode, useCallback } from "react"
import Image from "next/image"

/**
 * PokemonBattle - A comprehensive, highly configurable battle system component
 *
 * Features:
 * - Single file implementation for easy integration
 * - Extensive configuration options through props
 * - Support for different battle types (single, double, triple, horde)
 * - Background image or gradient support
 * - Weather and field effects
 * - Status conditions
 * - Battle animations and effects
 * - Sound effect integration
 * - Customizable UI positioning and styling
 * - Drag-and-drop UI customization
 * - Responsive design
 *
 * @version 2.1.0
 */

// ======== TYPE DEFINITIONS ========

type Gender = "male" | "female" | "unknown"
type BattleType = "single" | "double" | "triple" | "horde"

type ElementType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy"

type StatusCondition =
  | "none"
  | "poison"
  | "toxic"
  | "paralysis"
  | "burn"
  | "freeze"
  | "sleep"
  | "confusion"
  | "infatuation"
  | "flinch"

type WeatherEffect = "none" | "rain" | "heavyRain" | "sun" | "harshSun" | "sandstorm" | "hail" | "fog"

type FieldEffect =
  | "none"
  | "electricTerrain"
  | "grassyTerrain"
  | "mistyTerrain"
  | "psychicTerrain"
  | "trickRoom"
  | "magicRoom"
  | "wonderRoom"
  | "gravity"
  | "mudsport"
  | "watersport"

type MoveCategory = "physical" | "special" | "status"

type Move = {
  id: string
  name: string
  type: ElementType
  category?: MoveCategory
  pp: number
  maxPp: number
  power?: number
  accuracy?: number
  description?: string
  priority?: number
  effectChance?: number
  target?: "single" | "all" | "self" | "allAllies" | "allEnemies"
  animation?: MoveAnimationConfig
  sound?: string
}

type Stat = {
  base: number
  current: number
  stage: number // -6 to +6 for stat modifications
}

type Stats = {
  hp: number
  attack: Stat
  defense: Stat
  spAttack: Stat
  spDefense: Stat
  speed: Stat
  accuracy: Stat
  evasion: Stat
}

type MonsterAbility = {
  id: string
  name: string
  description: string
  trigger?: "onEntry" | "onExit" | "onDamage" | "onStatusInflict" | "onStatChange" | "onWeatherChange"
}

type Item = {
  id: string
  name: string
  description: string
  sprite?: string
  effect?: "heal" | "revive" | "statBoost" | "statusHeal" | "evolution" | "other"
  power?: number
  target?: "single" | "all" | "self"
}

type Position = {
  x: number
  y: number
}

type Monster = {
  id: number
  name: string
  level: number
  hp: number
  maxHp: number
  position: Position
  image: string
  backImage?: string
  types: ElementType[]
  gender?: Gender
  isActive?: boolean
  scale?: number
  moves?: Move[]
  stats?: Partial<Stats>
  status?: StatusCondition
  ability?: MonsterAbility
  heldItem?: Item
  isFainted?: boolean
  isWild?: boolean
  cry?: string
  entryAnimation?: MonsterAnimationConfig
  exitAnimation?: MonsterAnimationConfig
  idleAnimation?: MonsterAnimationConfig
  damageAnimation?: MonsterAnimationConfig
  faintAnimation?: MonsterAnimationConfig
  victoryAnimation?: MonsterAnimationConfig
  customPosition?: Position // For drag-and-drop positioning
}

type MoveAnimationConfig = {
  type: "projectile" | "contact" | "self" | "field" | "custom"
  duration: number
  color?: string
  particleCount?: number
  particleSize?: number
  particleSpeed?: number
  particleLifetime?: number
  particleSpread?: number
  particleGravity?: number
  particleOpacity?: number
  particleColor?: string
  particleImage?: string
  particleBlendMode?: string
  particleShape?: "circle" | "square" | "triangle" | "star" | "custom"
  sound?: string
  customElement?: ReactNode
  customAnimation?: (
    progress: number,
    sourcePosition: { x: number; y: number },
    targetPosition: { x: number; y: number },
  ) => React.CSSProperties
}

type MonsterAnimationConfig = {
  duration: number
  keyframes: {
    [key: string]: React.CSSProperties
  }
  easing?: string
  loop?: boolean
  alternate?: boolean
  delay?: number
}

type StatusBarPosition = {
  x: number
  y: number
  width: number
}

type PlatformPosition = {
  x: number
  y: number
  width: number
  height: number
}

type BattleSceneConfig = {
  // Layout configuration
  battleAreaHeight: number
  playerStatusPosition: StatusBarPosition
  enemyStatusPosition: StatusBarPosition
  playerPlatform?: PlatformPosition
  enemyPlatform?: PlatformPosition

  // Background configuration
  backgroundImage?: string
  backgroundImageOptions?: {
    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
    opacity?: number
    blur?: number
    parallax?: boolean
    parallaxSpeed?: number
  }
  backgroundGradient?: { from: string; to: string }
  backgroundPattern?: boolean
  backgroundPatternOptions?: {
    color?: string
    size?: number
    opacity?: number
    type?: "grid" | "dots" | "diagonal" | "zigzag" | "custom"
    customPattern?: string
  }

  // UI style configuration
  messageBoxStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    fontFamily?: string
    fontSize?: string
    padding?: string
    borderRadius?: string
    borderWidth?: string
    boxShadow?: string
  }
  menuStyle?: {
    backgroundColor: string
    buttonColor: string
    textColor: string
    hoverColor: string
    activeColor: string
    fontFamily?: string
    fontSize?: string
    padding?: string
    borderRadius?: string
    borderWidth?: string
    boxShadow?: string
  }
  statusBarStyle?: {
    backgroundColor: string
    borderColor: string
    textColor: string
    hpColors?: {
      high: string
      medium: string
      low: string
    }
    fontFamily?: string
    fontSize?: string
    padding?: string
    borderRadius?: string
    borderWidth?: string
    boxShadow?: string
  }

  // Battle configuration
  battleType?: BattleType
  animationSpeed?: number

  // Effect configuration
  weatherEffect?: WeatherEffect
  weatherIntensity?: number
  fieldEffect?: FieldEffect

  // Sound configuration
  backgroundMusic?: string
  soundEffectsVolume?: number
  musicVolume?: number

  // Advanced options
  showDamageNumbers?: boolean
  showTypeEffectiveness?: boolean
  showStatChanges?: boolean
  showAbilityActivation?: boolean
  showItemEffects?: boolean
  showCriticalHits?: boolean

  // Accessibility options
  highContrastMode?: boolean
  reducedMotion?: boolean
  largeText?: boolean
  screenReaderSupport?: boolean

  // Developer options
  debugMode?: boolean
  logBattleEvents?: boolean
  performanceMode?: boolean

  // Drag-and-drop options
  enableDragAndDrop?: boolean
  showDragHandles?: boolean
  snapToGrid?: boolean
  gridSize?: number
  lockAspectRatio?: boolean
}

type BattleAction = "FIGHT" | "BAG" | "POKEMON" | "RUN"

type BattleEvent = {
  type: "move" | "switch" | "item" | "run" | "faint" | "status" | "weather" | "field" | "ability" | "statChange"
  sourceId?: number
  targetId?: number
  moveId?: string
  itemId?: string
  statusId?: StatusCondition
  weatherId?: WeatherEffect
  fieldId?: FieldEffect
  abilityId?: string
  statId?: keyof Stats
  statChange?: number
  damage?: number
  isCritical?: boolean
  effectiveness?: number
  timestamp: number
}

type AnimationState = {
  type: "attack" | "damage" | "heal" | "faint" | "appear" | "message" | "status" | "statChange" | "weather" | "field"
  targetId?: number
  sourceId?: number
  moveId?: string
  statusId?: StatusCondition
  weatherId?: WeatherEffect
  fieldId?: FieldEffect
  statId?: keyof Stats
  statChange?: number
  text?: string
  duration: number
  progress: number
  complete: boolean
  particles?: {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    color: string
    life: number
    maxLife: number
  }[]
}

type DraggableElement = {
  id: string
  type: "monster" | "statusBar" | "platform"
  monsterId?: number
  isPlayer?: boolean
  position: Position
  originalPosition: Position
  width?: number
  height?: number
}

interface PokemonBattleProps {
  playerMonsters?: Monster[]
  enemyMonsters?: Monster[]
  config?: Partial<BattleSceneConfig>
  onBattleEnd?: (result: "win" | "lose" | "flee") => void
  onMoveSelect?: (moveId: string, sourceId: number, targetId: number) => void
  onMonsterSwitch?: (newActiveId: number) => void
  onItemUse?: (itemId: string, targetId: number) => void
  onBattleEvent?: (event: BattleEvent) => void
  customMenuContent?: ReactNode
  initialMessage?: string
  items?: Item[]
  onTurnEnd?: () => void
  onTurnStart?: () => void
  onStatusEffect?: (monsterId: number, status: StatusCondition) => void
  onWeatherChange?: (weather: WeatherEffect) => void
  onFieldEffectChange?: (effect: FieldEffect) => void
  onStatChange?: (monsterId: number, stat: keyof Stats, change: number) => void
  onAbilityTrigger?: (monsterId: number, abilityId: string) => void
  onCriticalHit?: (sourceId: number, targetId: number) => void
  onEffectivenessMessage?: (effectiveness: number) => void
  onLayoutChange?: (layout: {
    playerMonsters: Monster[]
    enemyMonsters: Monster[]
    playerStatusPosition: StatusBarPosition
    enemyStatusPosition: StatusBarPosition
    playerPlatform?: PlatformPosition
    enemyPlatform?: PlatformPosition
  }) => void
}

// ======== DEFAULT VALUES ========

const defaultConfig: BattleSceneConfig = {
  playerStatusPosition: { x: 60, y: 65, width: 340 },
  enemyStatusPosition: { x: 3, y: 3, width: 340 },
  playerPlatform: { x: 20, y: 75, width: 250, height: 50 },
  enemyPlatform: { x: 60, y: 25, width: 250, height: 50 },
  battleAreaHeight: 500,
  backgroundGradient: { from: "from-green-200", to: "to-green-300" },
  backgroundPattern: true,
  backgroundPatternOptions: {
    color: "rgba(0,150,0,0.1)",
    size: 8,
    opacity: 0.5,
    type: "grid",
  },
  messageBoxStyle: {
    backgroundColor: "rgb(220, 38, 38)", // red-700
    textColor: "rgb(0, 0, 0)",
    borderColor: "rgb(31, 41, 55)", // gray-800
    borderRadius: "0.5rem",
    padding: "1rem",
  },
  menuStyle: {
    backgroundColor: "rgb(126, 34, 206)", // purple-800
    buttonColor: "rgb(255, 255, 255)",
    textColor: "rgb(0, 0, 0)",
    hoverColor: "rgb(243, 244, 246)", // gray-100
    activeColor: "rgb(229, 231, 235)", // gray-200
    borderRadius: "0.5rem",
    padding: "1rem",
  },
  statusBarStyle: {
    backgroundColor: "#f8f0dc", // cream-100
    borderColor: "rgb(31, 41, 55)", // gray-800
    textColor: "rgb(0, 0, 0)",
    hpColors: {
      high: "rgb(34, 197, 94)", // green-500
      medium: "rgb(234, 179, 8)", // yellow-500
      low: "rgb(239, 68, 68)", // red-500
    },
    borderRadius: "0.5rem",
    padding: "0.5rem",
  },
  battleType: "single",
  animationSpeed: 1,
  weatherEffect: "none",
  weatherIntensity: 1,
  fieldEffect: "none",
  soundEffectsVolume: 0.5,
  musicVolume: 0.3,
  showDamageNumbers: true,
  showTypeEffectiveness: true,
  showStatChanges: true,
  showAbilityActivation: true,
  showItemEffects: true,
  showCriticalHits: true,
  highContrastMode: false,
  reducedMotion: false,
  largeText: false,
  screenReaderSupport: true,
  debugMode: false,
  logBattleEvents: false,
  performanceMode: false,
  enableDragAndDrop: false,
  showDragHandles: true,
  snapToGrid: true,
  gridSize: 5,
  lockAspectRatio: false,
}

const defaultPlayerMonsters: Monster[] = [
  {
    id: 1,
    name: "TORCHIC",
    level: 10,
    hp: 45,
    maxHp: 50,
    position: { x: 20, y: 55 },
    image: "/images/torchic.png",
    types: ["fire"],
    gender: "male",
    isActive: true,
    scale: 1.3,
    moves: [
      { id: "ember", name: "EMBER", type: "fire", category: "special", pp: 25, maxPp: 25, power: 40, accuracy: 100 },
      {
        id: "scratch",
        name: "SCRATCH",
        type: "normal",
        category: "physical",
        pp: 35,
        maxPp: 35,
        power: 40,
        accuracy: 100,
      },
      { id: "growl", name: "GROWL", type: "normal", category: "status", pp: 40, maxPp: 40, accuracy: 100 },
      {
        id: "focus-energy",
        name: "FOCUS ENERGY",
        type: "normal",
        category: "status",
        pp: 30,
        maxPp: 30,
        accuracy: 100,
      },
    ],
    stats: {
      hp: 45,
      attack: { base: 45, current: 45, stage: 0 },
      defense: { base: 35, current: 35, stage: 0 },
      spAttack: { base: 60, current: 60, stage: 0 },
      spDefense: { base: 40, current: 40, stage: 0 },
      speed: { base: 45, current: 45, stage: 0 },
      accuracy: { base: 100, current: 100, stage: 0 },
      evasion: { base: 100, current: 100, stage: 0 },
    },
    status: "none",
    ability: {
      id: "blaze",
      name: "BLAZE",
      description: "Powers up Fire-type moves when HP is low.",
    },
    cry: "/sounds/torchic-cry.mp3",
  },
  {
    id: 2,
    name: "LOTAD",
    level: 7,
    hp: 30,
    maxHp: 35,
    position: { x: 10, y: 70 },
    image: "/images/lotad-player.png",
    types: ["water", "grass"],
    gender: "female",
    scale: 1,
    moves: [
      {
        id: "water-gun",
        name: "WATER GUN",
        type: "water",
        category: "special",
        pp: 25,
        maxPp: 25,
        power: 40,
        accuracy: 100,
      },
      { id: "absorb", name: "ABSORB", type: "grass", category: "special", pp: 25, maxPp: 25, power: 20, accuracy: 100 },
    ],
    stats: {
      hp: 40,
      attack: { base: 30, current: 30, stage: 0 },
      defense: { base: 30, current: 30, stage: 0 },
      spAttack: { base: 40, current: 40, stage: 0 },
      spDefense: { base: 50, current: 50, stage: 0 },
      speed: { base: 30, current: 30, stage: 0 },
      accuracy: { base: 100, current: 100, stage: 0 },
      evasion: { base: 100, current: 100, stage: 0 },
    },
    status: "none",
    ability: {
      id: "swift-swim",
      name: "SWIFT SWIM",
      description: "Boosts Speed in rain.",
    },
    cry: "/sounds/lotad-cry.mp3",
  },
]

const defaultEnemyMonsters: Monster[] = [
  {
    id: 3,
    name: "LOTAD",
    level: 7,
    hp: 28,
    maxHp: 35,
    position: { x: 65, y: 15 },
    image: "/images/lotad.png",
    types: ["water", "grass"],
    gender: "male",
    scale: 1,
    moves: [
      {
        id: "water-gun",
        name: "WATER GUN",
        type: "water",
        category: "special",
        pp: 25,
        maxPp: 25,
        power: 40,
        accuracy: 100,
      },
      { id: "absorb", name: "ABSORB", type: "grass", category: "special", pp: 25, maxPp: 25, power: 20, accuracy: 100 },
    ],
    isWild: true,
  },
  {
    id: 4,
    name: "ZIGZAGOON",
    level: 7,
    hp: 32,
    maxHp: 40,
    position: { x: 75, y: 25 },
    image: "/images/zigzagoon.png",
    types: ["normal"],
    gender: "male",
    isActive: true,
    scale: 1.2,
    moves: [
      {
        id: "tackle",
        name: "TACKLE",
        type: "normal",
        category: "physical",
        pp: 35,
        maxPp: 35,
        power: 40,
        accuracy: 100,
      },
      { id: "growl", name: "GROWL", type: "normal", category: "status", pp: 40, maxPp: 40, accuracy: 100 },
    ],
    isWild: true,
  },
  {
    id: 5,
    name: "GASTLY",
    level: 8,
    hp: 25,
    maxHp: 30,
    position: { x: 85, y: 10 },
    image: "/images/gastly.png",
    types: ["ghost", "poison"],
    gender: "unknown",
    scale: 1,
    moves: [
      { id: "lick", name: "LICK", type: "ghost", category: "physical", pp: 30, maxPp: 30, power: 30, accuracy: 100 },
      { id: "hypnosis", name: "HYPNOSIS", type: "psychic", category: "status", pp: 20, maxPp: 20, accuracy: 60 },
    ],
    isWild: true,
  },
]

// ======== UTILITY FUNCTIONS ========

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function getTypeColor(type: ElementType): string {
  const typeColors: Record<ElementType, string> = {
    normal: "bg-gray-400",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-400",
    grass: "bg-green-500",
    ice: "bg-cyan-300",
    fighting: "bg-red-700",
    poison: "bg-purple-600",
    ground: "bg-amber-600",
    flying: "bg-indigo-300",
    psychic: "bg-pink-500",
    bug: "bg-lime-500",
    rock: "bg-yellow-700",
    ghost: "bg-purple-800",
    dragon: "bg-indigo-600",
    dark: "bg-gray-800",
    steel: "bg-gray-500",
    fairy: "bg-pink-300",
  }
  return typeColors[type] || "bg-gray-400"
}

function getGenderSymbol(gender: Gender): string {
  switch (gender) {
    case "male":
      return "♂"
    case "female":
      return "♀"
    default:
      return ""
  }
}

function getGenderColor(gender: Gender): string {
  switch (gender) {
    case "male":
      return "text-blue-500"
    case "female":
      return "text-pink-500"
    default:
      return "text-gray-500"
  }
}

function getStatusColor(status: StatusCondition): string {
  switch (status) {
    case "poison":
    case "toxic":
      return "bg-purple-500"
    case "paralysis":
      return "bg-yellow-500"
    case "burn":
      return "bg-red-500"
    case "freeze":
      return "bg-cyan-500"
    case "sleep":
      return "bg-gray-500"
    case "confusion":
      return "bg-pink-400"
    case "infatuation":
      return "bg-pink-300"
    case "flinch":
      return "bg-gray-400"
    default:
      return ""
  }
}

function getStatusAbbreviation(status: StatusCondition): string {
  switch (status) {
    case "poison":
      return "PSN"
    case "toxic":
      return "TOX"
    case "paralysis":
      return "PAR"
    case "burn":
      return "BRN"
    case "freeze":
      return "FRZ"
    case "sleep":
      return "SLP"
    case "confusion":
      return "CNF"
    case "infatuation":
      return "INF"
    case "flinch":
      return "FLN"
    default:
      return ""
  }
}

function getWeatherEffect(weather: WeatherEffect, intensity = 1): React.CSSProperties {
  switch (weather) {
    case "rain":
    case "heavyRain":
      return {
        backgroundImage: `linear-gradient(0deg, rgba(0, 0, 255, ${0.05 * intensity}) 0%, rgba(0, 0, 255, 0) 100%)`,
        boxShadow: `inset 0 0 ${50 * intensity}px rgba(0, 0, 255, ${0.2 * intensity})`,
      }
    case "sun":
    case "harshSun":
      return {
        backgroundImage: `linear-gradient(0deg, rgba(255, 165, 0, ${0.05 * intensity}) 0%, rgba(255, 165, 0, 0) 100%)`,
        boxShadow: `inset 0 0 ${50 * intensity}px rgba(255, 165, 0, ${0.2 * intensity})`,
      }
    case "sandstorm":
      return {
        backgroundImage: `linear-gradient(0deg, rgba(194, 178, 128, ${0.05 * intensity}) 0%, rgba(194, 178, 128, 0) 100%)`,
        boxShadow: `inset 0 0 ${50 * intensity}px rgba(194, 178, 128, ${0.2 * intensity})`,
      }
    case "hail":
      return {
        backgroundImage: `linear-gradient(0deg, rgba(200, 255, 255, ${0.05 * intensity}) 0%, rgba(200, 255, 255, 0) 100%)`,
        boxShadow: `inset 0 0 ${50 * intensity}px rgba(200, 255, 255, ${0.2 * intensity})`,
      }
    case "fog":
      return {
        backgroundImage: `linear-gradient(0deg, rgba(200, 200, 200, ${0.05 * intensity}) 0%, rgba(200, 200, 200, 0) 100%)`,
        boxShadow: `inset 0 0 ${50 * intensity}px rgba(200, 200, 200, ${0.2 * intensity})`,
        filter: `blur(${2 * intensity}px)`,
      }
    default:
      return {}
  }
}

function getFieldEffectStyle(effect: FieldEffect): React.CSSProperties {
  switch (effect) {
    case "electricTerrain":
      return {
        backgroundImage: "linear-gradient(0deg, rgba(255, 255, 0, 0.1) 0%, rgba(255, 255, 0, 0) 100%)",
        boxShadow: "inset 0 0 50px rgba(255, 255, 0, 0.2)",
      }
    case "grassyTerrain":
      return {
        backgroundImage: "linear-gradient(0deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0) 100%)",
        boxShadow: "inset 0 0 50px rgba(0, 255, 0, 0.2)",
      }
    case "mistyTerrain":
      return {
        backgroundImage: "linear-gradient(0deg, rgba(255, 192, 203, 0.1) 0%, rgba(255, 192, 203, 0) 100%)",
        boxShadow: "inset 0 0 50px rgba(255, 192, 203, 0.2)",
      }
    case "psychicTerrain":
      return {
        backgroundImage: "linear-gradient(0deg, rgba(255, 0, 255, 0.1) 0%, rgba(255, 0, 255, 0) 100%)",
        boxShadow: "inset 0 0 50px rgba(255, 0, 255, 0.2)",
      }
    case "trickRoom":
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(128, 0, 128, 0.1) 0px, rgba(128, 0, 128, 0.1) 10px, rgba(0, 0, 0, 0) 10px, rgba(0, 0, 0, 0) 20px)",
      }
    case "gravity":
      return {
        filter: "saturate(1.2) brightness(0.9)",
      }
    default:
      return {}
  }
}

function generateParticles(
  count: number,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  color: string,
  spread = 20,
  size = 5,
  speed = 2,
) {
  const particles = []
  const directionX = targetX - sourceX
  const directionY = targetY - sourceY
  const distance = Math.sqrt(directionX * directionX + directionY * directionY)
  const normalizedDirX = directionX / distance
  const normalizedDirY = directionY / distance

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const spreadX = Math.cos(angle) * spread
    const spreadY = Math.sin(angle) * spread

    const vx = normalizedDirX * speed + (Math.random() - 0.5) * 2
    const vy = normalizedDirY * speed + (Math.random() - 0.5) * 2

    particles.push({
      x: sourceX + spreadX,
      y: sourceY + spreadY,
      vx,
      vy,
      size: size * (0.5 + Math.random()),
      color,
      life: 1,
      maxLife: 1 + Math.random(),
    })
  }

  return particles
}

// Snap position to grid
function snapToGrid(position: Position, gridSize: number): Position {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  }
}

// ======== COMPONENT IMPLEMENTATION ========

export default function PokemonBattle({
  playerMonsters = defaultPlayerMonsters,
  enemyMonsters = defaultEnemyMonsters,
  config = {},
  onBattleEnd,
  onMoveSelect,
  onMonsterSwitch,
  onItemUse,
  onBattleEvent,
  customMenuContent,
  initialMessage = "What will you do?",
  items = [],
  onTurnEnd,
  onTurnStart,
  onStatusEffect,
  onWeatherChange,
  onFieldEffectChange,
  onStatChange,
  onAbilityTrigger,
  onCriticalHit,
  onEffectivenessMessage,
  onLayoutChange,
}: PokemonBattleProps) {
  // Merge provided config with default config
  const mergedConfig: BattleSceneConfig = { ...defaultConfig, ...config }

  // State
  const [message, setMessage] = useState(initialMessage)
  const [selectedAction, setSelectedAction] = useState<BattleAction | null>(null)
  const [selectedMonster, setSelectedMonster] = useState<number | null>(null)
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [showItemMenu, setShowItemMenu] = useState(false)
  const [showMonsterMenu, setShowMonsterMenu] = useState(false)
  const [selectedMove, setSelectedMove] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [animation, setAnimation] = useState<AnimationState | null>(null)
  const [battleEnded, setBattleEnded] = useState(false)
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([])
  const [weather, setWeather] = useState<WeatherEffect>(mergedConfig.weatherEffect || "none")
  const [fieldEffect, setFieldEffect] = useState<FieldEffect>(mergedConfig.fieldEffect || "none")
  const [turn, setTurn] = useState(1)
  const [particles, setParticles] = useState<AnimationState["particles"]>([])

  // Drag and drop state
  const [editMode, setEditMode] = useState(false)
  const [draggingElement, setDraggingElement] = useState<DraggableElement | null>(null)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [playerStatusPos, setPlayerStatusPos] = useState<StatusBarPosition>(mergedConfig.playerStatusPosition)
  const [enemyStatusPos, setEnemyStatusPos] = useState<StatusBarPosition>(mergedConfig.enemyStatusPosition)
  const [playerPlatformPos, setPlayerPlatformPos] = useState<PlatformPosition | undefined>(mergedConfig.playerPlatform)
  const [enemyPlatformPos, setEnemyPlatformPos] = useState<PlatformPosition | undefined>(mergedConfig.enemyPlatform)
  const [updatedPlayerMonsters, setUpdatedPlayerMonsters] = useState<Monster[]>(playerMonsters)
  const [updatedEnemyMonsters, setUpdatedEnemyMonsters] = useState<Monster[]>(enemyMonsters)

  // Refs
  const battleAreaRef = useRef<HTMLDivElement>(null)

  // Get active player monster
  const activePlayerMonster = updatedPlayerMonsters.find((m) => m.isActive)
  const activeEnemyMonster = updatedEnemyMonsters.find((m) => m.isActive)

  // Animation frame ref for cleanup
  const animationRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Log battle events in debug mode
  useEffect(() => {
    if (mergedConfig.debugMode && mergedConfig.logBattleEvents && battleEvents.length > 0) {
      console.log("Battle Events:", battleEvents)
    }
  }, [battleEvents, mergedConfig.debugMode, mergedConfig.logBattleEvents])

  // Play sound effect
  const playSound = useCallback(
    (soundUrl: string | undefined, volume: number = mergedConfig.soundEffectsVolume || 0.5) => {
      if (!soundUrl) return

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const audio = new Audio(soundUrl)
      audio.volume = volume
      audio.play().catch((e) => console.error("Error playing sound:", e))
      audioRef.current = audio

      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
      }
    },
    [mergedConfig.soundEffectsVolume],
  )

  // Animation loop
  useEffect(() => {
    if (animation && !animation.complete) {
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / animation.duration, 1)

        setAnimation((prev) => {
          if (!prev) return null

          if (progress >= 1) {
            return { ...prev, progress: 1, complete: true }
          }

          return { ...prev, progress }
        })

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        }
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [animation])

  // Clean up animation when complete
  useEffect(() => {
    if (animation?.complete) {
      const timer = setTimeout(() => {
        setAnimation(null)

        // If it was an attack animation, return to the main menu
        if (animation.type === "attack") {
          setShowMoveMenu(false)
          setSelectedAction(null)
          setMessage(`What will ${activePlayerMonster?.name || "you"} do?`)
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [animation?.complete, activePlayerMonster?.name])

  // Update battle events
  const addBattleEvent = useCallback(
    (event: Omit<BattleEvent, "timestamp">) => {
      const newEvent = { ...event, timestamp: Date.now() }
      setBattleEvents((prev) => [...prev, newEvent])
      onBattleEvent?.(newEvent)
    },
    [onBattleEvent],
  )

  // Handle action selection
  const handleActionSelect = useCallback(
    (action: BattleAction) => {
      setSelectedAction(action)

      if (action === "FIGHT") {
        setMessage("Choose a move!")
        setShowMoveMenu(true)
        setShowItemMenu(false)
        setShowMonsterMenu(false)
      } else if (action === "BAG") {
        setMessage("Choose an item!")
        setShowMoveMenu(false)
        setShowItemMenu(true)
        setShowMonsterMenu(false)
      } else if (action === "POKEMON") {
        setMessage("Choose a POKEMON!")
        setShowMoveMenu(false)
        setShowItemMenu(false)
        setShowMonsterMenu(true)
      } else if (action === "RUN") {
        setMessage("Got away safely!")
        setAnimation({
          type: "message",
          text: "Got away safely!",
          duration: 1000,
          progress: 0,
          complete: false,
        })

        // Add battle event
        addBattleEvent({ type: "run" })

        // Play run sound
        playSound("/sounds/run.mp3")

        // Notify parent component of battle end
        setTimeout(() => {
          setBattleEnded(true)
          onBattleEnd?.("flee")
        }, 1500)
      }
    },
    [addBattleEvent, onBattleEnd, playSound],
  )

  // Handle move selection
  const handleMoveSelect = useCallback(
    (moveId: string) => {
      if (!activePlayerMonster || !activeEnemyMonster) return

      setSelectedMove(moveId)
      const move = activePlayerMonster.moves?.find((m) => m.id === moveId)

      if (move) {
        // Start attack animation
        setAnimation({
          type: "attack",
          sourceId: activePlayerMonster.id,
          targetId: activeEnemyMonster.id,
          moveId: move.id,
          duration: 1000 / (mergedConfig.animationSpeed || 1),
          progress: 0,
          complete: false,
        })

        setMessage(`${activePlayerMonster.name} used ${move.name}!`)

        // Play move sound
        playSound(move.sound || `/sounds/moves/${move.type}.mp3`)

        // Add battle event
        addBattleEvent({
          type: "move",
          sourceId: activePlayerMonster.id,
          targetId: activeEnemyMonster.id,
          moveId: move.id,
        })

        // Call the onMoveSelect callback if provided
        onMoveSelect?.(moveId, activePlayerMonster.id, activeEnemyMonster.id)
      }
    },
    [activePlayerMonster, activeEnemyMonster, mergedConfig.animationSpeed, onMoveSelect, addBattleEvent, playSound],
  )

  // Handle item selection
  const handleItemSelect = useCallback(
    (itemId: string) => {
      setSelectedItem(itemId)
      const item = items.find((i) => i.id === itemId)

      if (item) {
        setMessage(`Used ${item.name}!`)

        // Play item sound
        playSound(`/sounds/items/${item.effect}.mp3`)

        // Add battle event
        addBattleEvent({
          type: "item",
          sourceId: activePlayerMonster?.id,
          itemId: item.id,
        })

        // Call the onItemUse callback if provided
        if (activePlayerMonster) {
          onItemUse?.(itemId, activePlayerMonster.id)
        }

        // Return to main menu after a delay
        setTimeout(() => {
          setShowItemMenu(false)
          setSelectedAction(null)
          setMessage(`What will ${activePlayerMonster?.name || "you"} do?`)
        }, 1500)
      }
    },
    [items, activePlayerMonster, onItemUse, addBattleEvent, playSound],
  )

  // Handle back button from moves menu
  const handleBackFromMoves = useCallback(() => {
    setShowMoveMenu(false)
    setSelectedAction(null)
    setMessage(`What will ${activePlayerMonster?.name || "you"} do?`)
  }, [activePlayerMonster?.name])

  // Handle back button from items menu
  const handleBackFromItems = useCallback(() => {
    setShowItemMenu(false)
    setSelectedAction(null)
    setMessage(`What will ${activePlayerMonster?.name || "you"} do?`)
  }, [activePlayerMonster?.name])

  // Handle back button from monster menu
  const handleBackFromMonsters = useCallback(() => {
    setShowMonsterMenu(false)
    setSelectedAction(null)
    setMessage(`What will ${activePlayerMonster?.name || "you"} do?`)
  }, [activePlayerMonster?.name])

  // Handle monster selection
  const handleMonsterSelect = useCallback(
    (id: number) => {
      setSelectedMonster(id)
      const monster = [...updatedPlayerMonsters, ...updatedEnemyMonsters].find((m) => m.id === id)

      if (monster) {
        setMessage(`${monster.name} is selected!`)

        // If we're in the POKEMON menu, this would switch the active monster
        if (selectedAction === "POKEMON" && showMonsterMenu) {
          // Play switch sound
          playSound("/sounds/switch.mp3")

          // Add battle event
          addBattleEvent({
            type: "switch",
            sourceId: activePlayerMonster?.id,
            targetId: id,
          })

          onMonsterSwitch?.(id)

          // Return to main menu after a delay
          setTimeout(() => {
            setShowMonsterMenu(false)
            setSelectedAction(null)
            setMessage(`What will ${monster.name} do?`)
          }, 1000)
        }
      }
    },
    [
      updatedPlayerMonsters,
      updatedEnemyMonsters,
      selectedAction,
      showMonsterMenu,
      activePlayerMonster?.id,
      onMonsterSwitch,
      addBattleEvent,
      playSound,
    ],
  )

  // Handle weather change
  const handleWeatherChange = useCallback(
    (newWeather: WeatherEffect) => {
      setWeather(newWeather)

      // Add battle event
      addBattleEvent({
        type: "weather",
        weatherId: newWeather,
      })

      // Call the onWeatherChange callback if provided
      onWeatherChange?.(newWeather)

      // Set appropriate message
      let weatherMessage = ""
      switch (newWeather) {
        case "rain":
          weatherMessage = "It started to rain!"
          break
        case "heavyRain":
          weatherMessage = "A heavy rain began to fall!"
          break
        case "sun":
          weatherMessage = "The sunlight got bright!"
          break
        case "harshSun":
          weatherMessage = "The sunlight turned extremely harsh!"
          break
        case "sandstorm":
          weatherMessage = "A sandstorm kicked up!"
          break
        case "hail":
          weatherMessage = "It started to hail!"
          break
        case "fog":
          weatherMessage = "The battlefield got foggy!"
          break
        case "none":
          weatherMessage = "The weather cleared up!"
          break
      }

      if (weatherMessage) {
        setMessage(weatherMessage)
      }

      // Play weather sound
      playSound(`/sounds/weather/${newWeather}.mp3`)
    },
    [addBattleEvent, onWeatherChange, playSound],
  )

  // Handle field effect change
  const handleFieldEffectChange = useCallback(
    (newEffect: FieldEffect) => {
      setFieldEffect(newEffect)

      // Add battle event
      addBattleEvent({
        type: "field",
        fieldId: newEffect,
      })

      // Call the onFieldEffectChange callback if provided
      onFieldEffectChange?.(newEffect)

      // Set appropriate message
      let effectMessage = ""
      switch (newEffect) {
        case "electricTerrain":
          effectMessage = "An electric current ran across the field!"
          break
        case "grassyTerrain":
          effectMessage = "Grass grew to cover the battlefield!"
          break
        case "mistyTerrain":
          effectMessage = "Mist swirled around the battlefield!"
          break
        case "psychicTerrain":
          effectMessage = "The battlefield got weird!"
          break
        case "trickRoom":
          effectMessage = "The dimensions were twisted!"
          break
        case "magicRoom":
          effectMessage = "Items lost their effects!"
          break
        case "wonderRoom":
          effectMessage = "Defense and Sp. Def stats were swapped!"
          break
        case "gravity":
          effectMessage = "Gravity intensified!"
          break
        case "none":
          effectMessage = "The battlefield returned to normal!"
          break
      }

      if (effectMessage) {
        setMessage(effectMessage)
      }

      // Play field effect sound
      playSound(`/sounds/field/${newEffect}.mp3`)
    },
    [addBattleEvent, onFieldEffectChange, playSound],
  )

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev)
    if (editMode) {
      // Save the layout when exiting edit mode
      onLayoutChange?.({
        playerMonsters: updatedPlayerMonsters,
        enemyMonsters: updatedEnemyMonsters,
        playerStatusPosition: playerStatusPos,
        enemyStatusPosition: enemyStatusPos,
        playerPlatform: playerPlatformPos,
        enemyPlatform: enemyPlatformPos,
      })
    }
  }, [
    editMode,
    onLayoutChange,
    updatedPlayerMonsters,
    updatedEnemyMonsters,
    playerStatusPos,
    enemyStatusPos,
    playerPlatformPos,
    enemyPlatformPos,
  ])

  // Reset layout to defaults
  const resetLayout = useCallback(() => {
    setPlayerStatusPos(mergedConfig.playerStatusPosition)
    setEnemyStatusPos(mergedConfig.enemyStatusPosition)
    setPlayerPlatformPos(mergedConfig.playerPlatform)
    setEnemyPlatformPos(mergedConfig.enemyPlatform)

    // Reset monster positions to defaults
    setUpdatedPlayerMonsters(
      playerMonsters.map((monster) => ({
        ...monster,
        customPosition: undefined,
      })),
    )

    setUpdatedEnemyMonsters(
      enemyMonsters.map((monster) => ({
        ...monster,
        customPosition: undefined,
      })),
    )
  }, [
    mergedConfig.playerStatusPosition,
    mergedConfig.enemyStatusPosition,
    mergedConfig.playerPlatform,
    mergedConfig.enemyPlatform,
    playerMonsters,
    enemyMonsters,
  ])

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      elementType: "monster" | "statusBar" | "platform",
      id: string,
      position: Position,
      monsterId?: number,
      isPlayer?: boolean,
      width?: number,
      height?: number,
    ) => {
      if (!editMode || !mergedConfig.enableDragAndDrop) return

      e.preventDefault()
      e.stopPropagation()

      const battleArea = battleAreaRef.current
      if (!battleArea) return

      const rect = battleArea.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      // Calculate drag offset from the element's position
      const elementX = (position.x / 100) * rect.width
      const elementY = (position.y / 100) * rect.height

      setDragOffset({
        x: offsetX - elementX,
        y: offsetY - elementY,
      })

      setDraggingElement({
        id,
        type: elementType,
        monsterId,
        isPlayer,
        position,
        originalPosition: position,
        width,
        height,
      })
    },
    [editMode, mergedConfig.enableDragAndDrop],
  )

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingElement || !editMode || !mergedConfig.enableDragAndDrop) return

      const battleArea = battleAreaRef.current
      if (!battleArea) return

      const rect = battleArea.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      // Calculate new position as percentage of battle area
      let newX = ((offsetX - dragOffset.x) / rect.width) * 100
      let newY = ((offsetY - dragOffset.y) / rect.height) * 100

      // Constrain to battle area
      newX = Math.max(0, Math.min(100, newX))
      newY = Math.max(0, Math.min(100, newY))

      // Snap to grid if enabled
      if (mergedConfig.snapToGrid) {
        const snappedPos = snapToGrid({ x: newX, y: newY }, mergedConfig.gridSize || 5)
        newX = snappedPos.x
        newY = snappedPos.y
      }

      // Update position based on element type
      if (draggingElement.type === "monster") {
        if (draggingElement.isPlayer) {
          setUpdatedPlayerMonsters((prev) =>
            prev.map((monster) =>
              monster.id === draggingElement.monsterId ? { ...monster, customPosition: { x: newX, y: newY } } : monster,
            ),
          )
        } else {
          setUpdatedEnemyMonsters((prev) =>
            prev.map((monster) =>
              monster.id === draggingElement.monsterId ? { ...monster, customPosition: { x: newX, y: newY } } : monster,
            ),
          )
        }
      } else if (draggingElement.type === "statusBar") {
        if (draggingElement.isPlayer) {
          setPlayerStatusPos((prev) => ({ ...prev, x: newX, y: newY }))
        } else {
          setEnemyStatusPos((prev) => ({ ...prev, x: newX, y: newY }))
        }
      } else if (draggingElement.type === "platform") {
        if (draggingElement.isPlayer && playerPlatformPos) {
          setPlayerPlatformPos((prev) => (prev ? { ...prev, x: newX, y: newY } : undefined))
        } else if (!draggingElement.isPlayer && enemyPlatformPos) {
          setEnemyPlatformPos((prev) => (prev ? { ...prev, x: newX, y: newY } : undefined))
        }
      }
    },
    [
      draggingElement,
      editMode,
      mergedConfig.enableDragAndDrop,
      mergedConfig.snapToGrid,
      mergedConfig.gridSize,
      dragOffset,
      playerPlatformPos,
      enemyPlatformPos,
    ],
  )

  // Handle mouse up for dragging
  const handleMouseUp = useCallback(() => {
    setDraggingElement(null)
  }, [])

  // Handle resize for status bars
  const handleStatusBarResize = useCallback(
    (e: React.MouseEvent, isPlayer: boolean, direction: "left" | "right") => {
      if (!editMode || !mergedConfig.enableDragAndDrop) return

      e.preventDefault()
      e.stopPropagation()

      const battleArea = battleAreaRef.current
      if (!battleArea) return

      const rect = battleArea.getBoundingClientRect()
      const startX = e.clientX

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX
        const deltaPercent = (deltaX / rect.width) * 100

        if (isPlayer) {
          setPlayerStatusPos((prev) => {
            let newWidth = prev.width
            if (direction === "right") {
              newWidth = Math.max(100, prev.width + deltaPercent)
            } else {
              newWidth = Math.max(100, prev.width - deltaPercent)
            }
            return { ...prev, width: newWidth }
          })
        } else {
          setEnemyStatusPos((prev) => {
            let newWidth = prev.width
            if (direction === "right") {
              newWidth = Math.max(100, prev.width + deltaPercent)
            } else {
              newWidth = Math.max(100, prev.width - deltaPercent)
            }
            return { ...prev, width: newWidth }
          })
        }
      }

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    },
    [editMode, mergedConfig.enableDragAndDrop],
  )

  // Handle resize for platforms
  const handlePlatformResize = useCallback(
    (e: React.MouseEvent, isPlayer: boolean, direction: "width" | "height") => {
      if (!editMode || !mergedConfig.enableDragAndDrop) return

      e.preventDefault()
      e.stopPropagation()

      const battleArea = battleAreaRef.current
      if (!battleArea) return

      const rect = battleArea.getBoundingClientRect()
      const startX = e.clientX
      const startY = e.clientY

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX
        const deltaY = moveEvent.clientY - startY
        const deltaXPercent = (deltaX / rect.width) * 100
        const deltaYPercent = (deltaY / rect.height) * 100

        if (isPlayer && playerPlatformPos) {
          setPlayerPlatformPos((prev) => {
            if (!prev) return undefined

            if (direction === "width") {
              return { ...prev, width: Math.max(50, prev.width + deltaXPercent) }
            } else {
              return { ...prev, height: Math.max(20, prev.height + deltaYPercent) }
            }
          })
        } else if (!isPlayer && enemyPlatformPos) {
          setEnemyPlatformPos((prev) => {
            if (!prev) return undefined

            if (direction === "width") {
              return { ...prev, width: Math.max(50, prev.width + deltaXPercent) }
            } else {
              return { ...prev, height: Math.max(20, prev.height + deltaYPercent) }
            }
          })
        }
      }

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    },
    [editMode, mergedConfig.enableDragAndDrop, playerPlatformPos, enemyPlatformPos],
  )

  // ======== RENDER FUNCTIONS ========

  // Render status bar
  const renderStatusBar = (monster: Monster, isEnemy: boolean) => {
    const hpPercentage = (monster.hp / monster.maxHp) * 100
    let hpColor = mergedConfig.statusBarStyle?.hpColors?.high || "bg-green-500"

    if (hpPercentage < 50) {
      hpColor = mergedConfig.statusBarStyle?.hpColors?.medium || "bg-yellow-500"
    }
    if (hpPercentage < 25) {
      hpColor = mergedConfig.statusBarStyle?.hpColors?.low || "bg-red-500"
    }

    return (
      <div
        key={monster.id}
        className={cn(
          "rounded-lg border-2 p-2 font-mono text-black shadow-md transition-all duration-200 cursor-pointer hover:border-yellow-400",
          monster.isActive ? "border-yellow-500" : "border-gray-800",
          editMode && mergedConfig.enableDragAndDrop ? "cursor-move" : "",
        )}
        style={{
          backgroundColor: mergedConfig.statusBarStyle?.backgroundColor,
          color: mergedConfig.statusBarStyle?.textColor,
          borderColor: monster.isActive
            ? "rgb(234, 179, 8)" // yellow-500
            : mergedConfig.statusBarStyle?.borderColor,
          borderRadius: mergedConfig.statusBarStyle?.borderRadius,
          padding: mergedConfig.statusBarStyle?.padding,
          boxShadow: mergedConfig.statusBarStyle?.boxShadow,
          fontSize: mergedConfig.largeText ? "1.25rem" : mergedConfig.statusBarStyle?.fontSize,
        }}
        onClick={() => handleMonsterSelect(monster.id)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-bold">{monster.name}</span>
            {monster.gender && (
              <span className={getGenderColor(monster.gender)}>{getGenderSymbol(monster.gender)}</span>
            )}
          </div>
          <div className="text-right">Lv{monster.level}</div>
        </div>
        <div className="mt-1">
          <div className="flex items-center">
            <span className="text-xs mr-1 font-bold">HP</span>
            <div className="h-4 bg-gray-200 rounded-full flex-1 overflow-hidden border border-gray-400">
              <div
                className={`h-full ${hpColor} transition-all duration-500`}
                style={{ width: `${hpPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-1">
          {monster.types && monster.types.length > 0 && (
            <div className="flex space-x-1">
              {monster.types.map((type) => (
                <span key={type} className={`text-xs text-white px-1 py-0.5 rounded ${getTypeColor(type)}`}>
                  {type.toUpperCase().substring(0, 3)}
                </span>
              ))}
            </div>
          )}
          {monster.status && monster.status !== "none" && (
            <span className={`text-xs text-white px-1 py-0.5 rounded ${getStatusColor(monster.status)}`}>
              {getStatusAbbreviation(monster.status)}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Render battle menu
  const renderBattleMenu = () => {
    const actions: { id: BattleAction; label: string; icon: string }[] = [
      { id: "FIGHT", label: "FIGHT", icon: "⚔️" },
      { id: "BAG", label: "BAG", icon: "🎒" },
      { id: "POKEMON", label: "POKEMON", icon: "🔄" },
      { id: "RUN", label: "RUN", icon: "🏃" },
    ]

    return (
      <div className="grid grid-cols-2 gap-3 p-4 h-full">
        {actions.map((action) => (
          <button
            key={action.id}
            className={cn(
              "rounded-lg font-mono text-lg flex items-center justify-between px-4 transition-colors shadow-md border border-gray-300",
              selectedAction === action.id ? "ring-2 ring-yellow-400" : "",
            )}
            style={{
              backgroundColor:
                selectedAction === action.id
                  ? mergedConfig.menuStyle?.activeColor
                  : mergedConfig.menuStyle?.buttonColor,
              color: mergedConfig.menuStyle?.textColor,
              borderRadius: mergedConfig.menuStyle?.borderRadius,
              padding: mergedConfig.menuStyle?.padding,
              boxShadow: mergedConfig.menuStyle?.boxShadow,
              fontSize: mergedConfig.largeText ? "1.5rem" : mergedConfig.menuStyle?.fontSize,
            }}
            onClick={() => handleActionSelect(action.id)}
          >
            <span className="flex items-center">
              {action.id === "FIGHT" && (
                <svg width="16" height="16" viewBox="0 0 24 24" className="mr-1">
                  <path
                    d="M9 18l6-6-6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {action.label}
            </span>
            <span className="text-sm opacity-80">{action.icon}</span>
          </button>
        ))}
      </div>
    )
  }

  // Render move menu
  const renderMoveMenu = () => {
    const moves = activePlayerMonster?.moves || []

    return (
      <div className="grid grid-cols-2 gap-3 p-4 h-full">
        {moves.map((move) => (
          <button
            key={move.id}
            className={cn(
              "rounded-lg font-mono text-base flex flex-col items-start justify-between p-2 transition-colors shadow-md border border-gray-300",
              selectedMove === move.id ? "ring-2 ring-yellow-400" : "",
            )}
            style={{
              backgroundColor:
                selectedMove === move.id ? mergedConfig.menuStyle?.activeColor : mergedConfig.menuStyle?.buttonColor,
              color: mergedConfig.menuStyle?.textColor,
              borderRadius: mergedConfig.menuStyle?.borderRadius,
              padding: mergedConfig.menuStyle?.padding,
              boxShadow: mergedConfig.menuStyle?.boxShadow,
              fontSize: mergedConfig.largeText ? "1.25rem" : mergedConfig.menuStyle?.fontSize,
            }}
            onClick={() => handleMoveSelect(move.id)}
          >
            <span className="font-bold">{move.name}</span>
            <div className="flex justify-between w-full items-center mt-1">
              <span className={`text-xs text-white px-2 py-0.5 rounded ${getTypeColor(move.type)}`}>
                {move.type.toUpperCase()}
              </span>
              <span className="text-xs">
                PP {move.pp}/{move.maxPp}
              </span>
            </div>
            {move.category && (
              <div className="mt-1">
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{move.category.toUpperCase()}</span>
              </div>
            )}
          </button>
        ))}
        <button
          className="rounded-lg font-mono text-base flex items-center justify-center p-2 transition-colors shadow-md border border-gray-300 col-span-2"
          style={{
            backgroundColor: mergedConfig.menuStyle?.buttonColor,
            color: mergedConfig.menuStyle?.textColor,
            borderRadius: mergedConfig.menuStyle?.borderRadius,
            padding: mergedConfig.menuStyle?.padding,
            boxShadow: mergedConfig.menuStyle?.boxShadow,
            fontSize: mergedConfig.largeText ? "1.25rem" : mergedConfig.menuStyle?.fontSize,
          }}
          onClick={handleBackFromMoves}
        >
          BACK
        </button>
      </div>
    )
  }

  // Render item menu
  const renderItemMenu = () => {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 h-full overflow-y-auto">
        {items.length > 0 ? (
          <>
            {items.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "rounded-lg font-mono text-base flex items-center justify-between p-2 transition-colors shadow-md border border-gray-300",
                  selectedItem === item.id ? "ring-2 ring-yellow-400" : "",
                )}
                style={{
                  backgroundColor:
                    selectedItem === item.id
                      ? mergedConfig.menuStyle?.activeColor
                      : mergedConfig.menuStyle?.buttonColor,
                  color: mergedConfig.menuStyle?.textColor,
                }}
                onClick={() => handleItemSelect(item.id)}
              >
                <div className="flex items-center">
                  {item.sprite && (
                    <div className="w-6 h-6 mr-2">
                      <Image
                        src={item.sprite || "/placeholder.svg"}
                        alt={item.name}
                        width={24}
                        height={24}
                        className="pixelated"
                      />
                    </div>
                  )}
                  <span>{item.name}</span>
                </div>
              </button>
            ))}
            <button
              className="rounded-lg font-mono text-base flex items-center justify-center p-2 transition-colors shadow-md border border-gray-300 col-span-2"
              style={{
                backgroundColor: mergedConfig.menuStyle?.buttonColor,
                color: mergedConfig.menuStyle?.textColor,
              }}
              onClick={handleBackFromItems}
            >
              BACK
            </button>
          </>
        ) : (
          <>
            <div className="col-span-2 text-center p-4">No items in bag</div>
            <button
              className="rounded-lg font-mono text-base flex items-center justify-center p-2 transition-colors shadow-md border border-gray-300 col-span-2"
              style={{
                backgroundColor: mergedConfig.menuStyle?.buttonColor,
                color: mergedConfig.menuStyle?.textColor,
              }}
              onClick={handleBackFromItems}
            >
              BACK
            </button>
          </>
        )}
      </div>
    )
  }

  // Render monster menu
  const renderMonsterMenu = () => {
    return (
      <div className="grid grid-cols-1 gap-3 p-4 h-full overflow-y-auto">
        {updatedPlayerMonsters.map((monster) => (
          <button
            key={monster.id}
            className={cn(
              "rounded-lg font-mono text-base flex items-center justify-between p-2 transition-colors shadow-md border border-gray-300",
              selectedMonster === monster.id ? "ring-2 ring-yellow-400" : "",
              monster.hp <= 0 ? "opacity-50 cursor-not-allowed" : "",
            )}
            style={{
              backgroundColor:
                selectedMonster === monster.id
                  ? mergedConfig.menuStyle?.activeColor
                  : mergedConfig.menuStyle?.buttonColor,
              color: mergedConfig.menuStyle?.textColor,
            }}
            onClick={() => monster.hp > 0 && handleMonsterSelect(monster.id)}
            disabled={monster.hp <= 0}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2">
                <Image
                  src={monster.image || "/placeholder.svg"}
                  alt={monster.name}
                  width={32}
                  height={32}
                  className="pixelated"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-bold">{monster.name}</span>
                  {monster.gender && (
                    <span className={getGenderColor(monster.gender)}>{getGenderSymbol(monster.gender)}</span>
                  )}
                  <span className="ml-2">Lv{monster.level}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs mr-1">HP:</span>
                  <div className="h-2 bg-gray-200 w-24 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        monster.hp / monster.maxHp > 0.5
                          ? "bg-green-500"
                          : monster.hp / monster.maxHp > 0.25
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs ml-1">
                    {monster.hp}/{monster.maxHp}
                  </span>
                </div>
              </div>
            </div>
            {monster.isActive && <span className="text-yellow-500">●</span>}
          </button>
        ))}
        <button
          className="rounded-lg font-mono text-base flex items-center justify-center p-2 transition-colors shadow-md border border-gray-300"
          style={{
            backgroundColor: mergedConfig.menuStyle?.buttonColor,
            color: mergedConfig.menuStyle?.textColor,
          }}
          onClick={handleBackFromMonsters}
        >
          BACK
        </button>
      </div>
    )
  }

  // Render monster sprite with animations
  const renderMonsterSprite = (monster: Monster, isPlayer: boolean) => {
    if (monster.hp <= 0 && monster.isFainted) return null

    // Calculate animation effects
    let animationStyles: React.CSSProperties = {}
    let overlayElement = null

    if (animation) {
      // Attack animation
      if (animation.type === "attack" && animation.sourceId === monster.id) {
        const progress = animation.progress
        if (progress < 0.25) {
          // Wind up
          animationStyles = {
            transform: `scale(${monster.scale || 1}) translateX(${isPlayer ? -5 : 5}px) translateY(${5}px)`,
          }
        } else if (progress < 0.5) {
          // Lunge forward
          animationStyles = {
            transform: `scale(${monster.scale || 1}) translateX(${isPlayer ? 20 : -20}px) translateY(${-10}px)`,
          }
        } else if (progress < 0.75) {
          // Hold
          animationStyles = {
            transform: `scale(${monster.scale || 1}) translateX(${isPlayer ? 15 : -15}px) translateY(${-5}px)`,
          }
        } else {
          // Return
          const returnProgress = (progress - 0.75) * 4 // 0 to 1
          animationStyles = {
            transform: `scale(${monster.scale || 1}) translateX(${
              isPlayer ? 15 * (1 - returnProgress) : -15 * (1 - returnProgress)
            }px) translateY(${-5 * (1 - returnProgress)}px)`,
          }
        }
      }

      // Damage animation
      if (animation.type === "damage" && animation.targetId === monster.id) {
        animationStyles = {
          transform: `scale(${monster.scale || 1})`,
          filter: `brightness(${1 + Math.sin(animation.progress * Math.PI * 8) * 0.5})`,
        }

        overlayElement = (
          <div
            className="absolute inset-0 bg-red-500 mix-blend-overlay"
            style={{ opacity: Math.sin(animation.progress * Math.PI * 4) * 0.7 }}
          />
        )
      }

      // Faint animation
      if (animation.type === "faint" && animation.targetId === monster.id) {
        animationStyles = {
          transform: `scale(${monster.scale || 1}) translateY(${animation.progress * 50}px)`,
          opacity: 1 - animation.progress,
        }
      }

      // Status animation
      if (animation.type === "status" && animation.targetId === monster.id) {
        const statusColor = getStatusColor(animation.statusId as StatusCondition)
        overlayElement = (
          <div
            className={`absolute inset-0 ${statusColor} mix-blend-overlay`}
            style={{ opacity: Math.sin(animation.progress * Math.PI * 4) * 0.7 }}
          />
        )
      }
    }

    // Status condition visual effect
    if (monster.status && monster.status !== "none") {
      const statusColor = getStatusColor(monster.status)
      const existingTransform = animationStyles.transform || `scale(${monster.scale || 1})`

      switch (monster.status) {
        case "paralysis":
          // Add occasional jitter
          if (Math.random() < 0.1) {
            animationStyles.transform = `${existingTransform} translateX(${(Math.random() - 0.5) * 4}px)`
          }
          break
        case "poison":
        case "toxic":
          // Add purple tint
          overlayElement = (
            <div
              className="absolute inset-0 bg-purple-500 mix-blend-overlay"
              style={{ opacity: 0.2 + Math.sin(Date.now() / 1000) * 0.1 }}
            />
          )
          break
        case "burn":
          // Add red tint and occasional flicker
          overlayElement = (
            <div
              className="absolute inset-0 bg-red-500 mix-blend-overlay"
              style={{ opacity: 0.2 + Math.sin(Date.now() / 500) * 0.1 }}
            />
          )
          break
        case "sleep":
          // Add "z" particles
          overlayElement = (
            <div className="absolute -top-4 right-0">
              <span className="text-lg font-bold">
                {Math.floor(Date.now() / 1000) % 3 === 0 ? "z" : Math.floor(Date.now() / 1000) % 3 === 1 ? "Z" : "zZ"}
              </span>
            </div>
          )
          break
        case "freeze":
          // Add ice overlay
          overlayElement = (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-cyan-200 mix-blend-overlay" style={{ opacity: 0.3 }}></div>
              <div
                className="absolute inset-0 bg-white"
                style={{
                  opacity: 0.2,
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 10%, transparent 10%)",
                  backgroundSize: "8px 8px",
                }}
              ></div>
            </div>
          )
          break
        case "confusion":
          // Add spinning effect
          animationStyles.transform = `${existingTransform} rotate(${Math.sin(Date.now() / 500) * 5}deg)`
          break
      }
    }

    // Get the effective position (custom position if in edit mode, or default position)
    const position = monster.customPosition || monster.position

    // Render drag handles if in edit mode
    const dragHandles =
      editMode && mergedConfig.enableDragAndDrop && mergedConfig.showDragHandles ? (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-6 h-6 bg-blue-500 rounded-full opacity-50 pointer-events-auto cursor-move"
            onMouseDown={(e) => handleMouseDown(e, "monster", `monster-${monster.id}`, position, monster.id, isPlayer)}
          />
        </div>
      ) : null

    return (
      <div
        key={monster.id}
        className={cn(
          "absolute transition-all duration-300",
          selectedMonster === monster.id && "scale-110",
          editMode && mergedConfig.enableDragAndDrop ? "cursor-move" : "cursor-pointer hover:scale-105",
          draggingElement?.id === `monster-${monster.id}` ? "z-50" : "",
        )}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `scale(${monster.scale || 1})`,
          ...animationStyles,
        }}
        onClick={() => !editMode && handleMonsterSelect(monster.id)}
        onMouseDown={(e) =>
          editMode &&
          mergedConfig.enableDragAndDrop &&
          handleMouseDown(e, "monster", `monster-${monster.id}`, position, monster.id, isPlayer)
        }
      >
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          <Image
            src={monster.image || "/placeholder.svg"}
            alt={monster.name}
            width={128}
            height={128}
            className="pixelated drop-shadow-lg object-contain"
            priority
          />
          {overlayElement}
          {dragHandles}
        </div>
        {monster.isActive && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-green-200/40 rounded-full blur-sm"></div>
        )}
      </div>
    )
  }

  // Render weather effects
  const renderWeatherEffects = () => {
    if (weather === "none") return null

    switch (weather) {
      case "rain":
      case "heavyRain":
        const intensity = weather === "heavyRain" ? 2 : 1
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 * intensity }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-blue-400 rounded-full"
                style={{
                  width: `${1 + Math.random()}px`,
                  height: `${7 + Math.random() * 15}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.6,
                  transform: "rotate(15deg)",
                  animation: `fall ${0.5 + Math.random() * 0.5}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              ></div>
            ))}
            <style jsx>{`
              @keyframes fall {
                0% {
                  transform: translateY(-10px) rotate(15deg);
                  opacity: 0;
                }
                10% {
                  opacity: 0.6;
                }
                100% {
                  transform: translateY(${mergedConfig.battleAreaHeight}px) rotate(15deg);
                  opacity: 0.6;
                }
              }
            `}</style>
          </div>
        )
      case "sandstorm":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-amber-300 rounded-full"
                style={{
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.4 + Math.random() * 0.3,
                  animation: `sandstorm ${1 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              ></div>
            ))}
            <div className="absolute inset-0 bg-amber-500/10"></div>
            <style jsx>{`
              @keyframes sandstorm {
                0% {
                  transform: translate(-10px, 0);
                  opacity: 0;
                }
                10% {
                  opacity: 0.4;
                }
                100% {
                  transform: translate(${mergedConfig.battleAreaHeight}px, 0);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        )
      case "hail":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-cyan-100 rounded-full"
                style={{
                  width: `${3 + Math.random() * 3}px`,
                  height: `${3 + Math.random() * 3}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.7,
                  animation: `hail ${0.7 + Math.random() * 0.5}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              ></div>
            ))}
            <div className="absolute inset-0 bg-cyan-100/10"></div>
            <style jsx>{`
              @keyframes hail {
                0% {
                  transform: translateY(-10px);
                  opacity: 0;
                }
                10% {
                  opacity: 0.7;
                }
                100% {
                  transform: translateY(${mergedConfig.battleAreaHeight}px);
                  opacity: 0.7;
                }
              }
            `}</style>
          </div>
        )
      case "sun":
      case "harshSun":
        const sunIntensity = weather === "harshSun" ? 2 : 1
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-yellow-500" style={{ opacity: 0.1 * sunIntensity }}></div>
            <div
              className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-yellow-300 rounded-full"
              style={{
                width: `${50 + 20 * sunIntensity}px`,
                height: `${50 + 20 * sunIntensity}px`,
                boxShadow: `0 0 ${30 * sunIntensity}px ${15 * sunIntensity}px rgba(255, 200, 0, 0.7)`,
                opacity: 0.7,
              }}
            ></div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-yellow-300"
                style={{
                  width: `${3 * sunIntensity}px`,
                  height: `${30 * sunIntensity}px`,
                  left: `calc(50% - ${1.5 * sunIntensity}px)`,
                  top: `10px`,
                  opacity: 0.5,
                  transformOrigin: `center ${25 + 10 * sunIntensity}px`,
                  transform: `rotate(${i * 45}deg)`,
                }}
              ></div>
            ))}
          </div>
        )
      case "fog":
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-gray-300"
              style={{
                opacity: 0.4,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(200,200,200,0.1) 100%)",
              }}
            ></div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full blur-xl"
                style={{
                  width: `${50 + Math.random() * 100}px`,
                  height: `${30 + Math.random() * 50}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.2 + Math.random() * 0.3,
                  animation: `fog ${10 + Math.random() * 20}s linear infinite`,
                  animationDelay: `${Math.random() * 10}s`,
                }}
              ></div>
            ))}
            <style jsx>{`
              @keyframes fog {
                0% {
                  transform: translateX(-100px);
                }
                100% {
                  transform: translateX(${mergedConfig.battleAreaHeight}px);
                }
              }
            `}</style>
          </div>
        )
      default:
        return null
    }
  }

  // Render edit mode controls
  const renderEditControls = () => {
    if (!editMode) return null

    return (
      <div className="absolute top-2 right-2 z-50 bg-white/80 p-2 rounded-lg shadow-md flex flex-col gap-2">
        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm" onClick={resetLayout}>
          Reset Layout
        </button>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          onClick={() => {
            onLayoutChange?.({
              playerMonsters: updatedPlayerMonsters,
              enemyMonsters: updatedEnemyMonsters,
              playerStatusPosition: playerStatusPos,
              enemyStatusPosition: enemyStatusPos,
              playerPlatform: playerPlatformPos,
              enemyPlatform: enemyPlatformPos,
            })
            setMessage("Layout saved!")
          }}
        >
          Save Layout
        </button>
        <div className="text-xs text-gray-700 mt-1">
          <p>• Drag sprites and UI elements</p>
          <p>• Click resize handles to adjust</p>
        </div>
      </div>
    )
  }

  // ======== MAIN RENDER ========

  return (
    <div className="flex flex-col w-full max-w-7xl overflow-hidden rounded-lg border-4 border-gray-800 shadow-2xl">
      {/* Battle scene area */}
      <div
        ref={battleAreaRef}
        className="relative w-full overflow-hidden"
        style={{ height: `${mergedConfig.battleAreaHeight}px` }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background */}
        <div
          className={cn(
            "absolute inset-0",
            !mergedConfig.backgroundImage && mergedConfig.backgroundGradient?.from,
            !mergedConfig.backgroundImage && mergedConfig.backgroundGradient?.to,
          )}
          style={{
            backgroundImage: mergedConfig.backgroundImage
              ? "none"
              : `linear-gradient(to bottom, var(--tw-gradient-stops))`,
          }}
        >
          {/* Background pattern */}
          {mergedConfig.backgroundPattern && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  mergedConfig.backgroundPatternOptions?.customPattern ||
                  (mergedConfig.backgroundPatternOptions?.type === "grid"
                    ? `repeating-linear-gradient(0deg, ${mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"} 0px, ${
                        mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"
                      } ${mergedConfig.backgroundPatternOptions?.size || 4}px, transparent ${
                        mergedConfig.backgroundPatternOptions?.size || 4
                      }px, transparent ${(mergedConfig.backgroundPatternOptions?.size || 4) * 2}px), 
                      repeating-linear-gradient(90deg, ${mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"} 0px, ${
                        mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"
                      } ${mergedConfig.backgroundPatternOptions?.size || 4}px, transparent ${
                        mergedConfig.backgroundPatternOptions?.size || 4
                      }px, transparent ${(mergedConfig.backgroundPatternOptions?.size || 4) * 2}px)`
                    : mergedConfig.backgroundPatternOptions?.type === "dots"
                      ? `radial-gradient(${mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"} ${
                          mergedConfig.backgroundPatternOptions?.size || 4
                        }px, transparent ${(mergedConfig.backgroundPatternOptions?.size || 4) * 2}px)`
                      : mergedConfig.backgroundPatternOptions?.type === "diagonal"
                        ? `repeating-linear-gradient(45deg, ${mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"} 0px, ${
                            mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"
                          } ${mergedConfig.backgroundPatternOptions?.size || 4}px, transparent ${
                            mergedConfig.backgroundPatternOptions?.size || 4
                          }px, transparent ${(mergedConfig.backgroundPatternOptions?.size || 4) * 2}px)`
                        : mergedConfig.backgroundPatternOptions?.type === "zigzag"
                          ? `linear-gradient(135deg, ${mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"} 25%, transparent 25%) 0 0,
                       linear-gradient(225deg, ${mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"} 25%, transparent 25%) 0 0,
                       linear-gradient(315deg, ${mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"} 25%, transparent 25%) 0 0,
                       linear-gradient(45deg, ${mergedConfig.backgroundPatternOptions?.color || "rgba(0,150,0,0.1)"} 25%, transparent 25%) 0 0`
                          : ""),
                backgroundSize:
                  mergedConfig.backgroundPatternOptions?.type === "zigzag"
                    ? `${(mergedConfig.backgroundPatternOptions?.size || 4) * 2}px ${(mergedConfig.backgroundPatternOptions?.size || 4) * 2}px`
                    : mergedConfig.backgroundPatternOptions?.type === "dots"
                      ? `${(mergedConfig.backgroundPatternOptions?.size || 4) * 4}px ${(mergedConfig.backgroundPatternOptions?.size || 4) * 4}px`
                      : "auto",
                opacity: mergedConfig.backgroundPatternOptions?.opacity,
              }}
            ></div>
          )}

          {/* Background image */}
          {mergedConfig.backgroundImage && (
            <Image
              src={mergedConfig.backgroundImage || "/placeholder.svg"}
              alt="Battle background"
              fill
              className="object-cover"
              style={{
                objectFit: mergedConfig.backgroundImageOptions?.objectFit || "cover",
                opacity: mergedConfig.backgroundImageOptions?.opacity || 0.8,
                filter: mergedConfig.backgroundImageOptions?.blur
                  ? `blur(${mergedConfig.backgroundImageOptions.blur}px)`
                  : undefined,
                transform: mergedConfig.backgroundImageOptions?.parallax
                  ? `translateY(${Math.sin(Date.now() / 10000) * 10 * (mergedConfig.backgroundImageOptions?.parallaxSpeed || 1)}px)`
                  : undefined,
                transition: "transform 0.5s ease-out",
              }}
              priority
            />
          )}
        </div>

        {/* Weather effects */}
        {renderWeatherEffects()}

        {/* Field effect overlay */}
        {fieldEffect !== "none" && (
          <div className="absolute inset-0 pointer-events-none" style={getFieldEffectStyle(fieldEffect)}></div>
        )}

        {/* Battle platforms */}
        {playerPlatformPos && (
          <div
            className={cn(
              "absolute bg-green-400/30 rounded-full blur-sm",
              editMode && mergedConfig.enableDragAndDrop ? "cursor-move" : "",
            )}
            style={{
              left: `${playerPlatformPos.x}%`,
              top: `${playerPlatformPos.y}%`,
              width: `${playerPlatformPos.width}px`,
              height: `${playerPlatformPos.height}px`,
            }}
            onMouseDown={(e) =>
              editMode &&
              mergedConfig.enableDragAndDrop &&
              handleMouseDown(
                e,
                "platform",
                "player-platform",
                { x: playerPlatformPos.x, y: playerPlatformPos.y },
                undefined,
                true,
                playerPlatformPos.width,
                playerPlatformPos.height,
              )
            }
          >
            {editMode && mergedConfig.enableDragAndDrop && mergedConfig.showDragHandles && (
              <>
                {/* Resize handles */}
                <div
                  className="absolute -right-2 top-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-70 cursor-ew-resize transform -translate-y-1/2"
                  onMouseDown={(e) => handlePlatformResize(e, true, "width")}
                />
                <div
                  className="absolute left-1/2 -bottom-2 w-4 h-4 bg-blue-500 rounded-full opacity-70 cursor-ns-resize transform -translate-x-1/2"
                  onMouseDown={(e) => handlePlatformResize(e, true, "height")}
                />
              </>
            )}
          </div>
        )}
        {enemyPlatformPos && (
          <div
            className={cn(
              "absolute bg-green-400/30 rounded-full blur-sm",
              editMode && mergedConfig.enableDragAndDrop ? "cursor-move" : "",
            )}
            style={{
              left: `${enemyPlatformPos.x}%`,
              top: `${enemyPlatformPos.y}%`,
              width: `${enemyPlatformPos.width}px`,
              height: `${enemyPlatformPos.height}px`,
            }}
            onMouseDown={(e) =>
              editMode &&
              mergedConfig.enableDragAndDrop &&
              handleMouseDown(
                e,
                "platform",
                "enemy-platform",
                { x: enemyPlatformPos.x, y: enemyPlatformPos.y },
                undefined,
                false,
                enemyPlatformPos.width,
                enemyPlatformPos.height,
              )
            }
          >
            {editMode && mergedConfig.enableDragAndDrop && mergedConfig.showDragHandles && (
              <>
                {/* Resize handles */}
                <div
                  className="absolute -right-2 top-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-70 cursor-ew-resize transform -translate-y-1/2"
                  onMouseDown={(e) => handlePlatformResize(e, false, "width")}
                />
                <div
                  className="absolute left-1/2 -bottom-2 w-4 h-4 bg-blue-500 rounded-full opacity-70 cursor-ns-resize transform -translate-x-1/2"
                  onMouseDown={(e) => handlePlatformResize(e, false, "height")}
                />
              </>
            )}
          </div>
        )}

        {/* Enemy status bars */}
        <div
          className={cn("absolute z-10 space-y-2", editMode && mergedConfig.enableDragAndDrop ? "cursor-move" : "")}
          style={{
            left: `${enemyStatusPos.x}%`,
            top: `${enemyStatusPos.y}%`,
            width: `${enemyStatusPos.width}px`,
          }}
          onMouseDown={(e) =>
            editMode &&
            mergedConfig.enableDragAndDrop &&
            handleMouseDown(
              e,
              "statusBar",
              "enemy-status",
              { x: enemyStatusPos.x, y: enemyStatusPos.y },
              undefined,
              false,
              enemyStatusPos.width,
            )
          }
        >
          {updatedEnemyMonsters.map((monster) => renderStatusBar(monster, true))}

          {editMode && mergedConfig.enableDragAndDrop && mergedConfig.showDragHandles && (
            <>
              {/* Resize handles */}
              <div
                className="absolute -right-2 top-0 w-4 h-4 bg-blue-500 rounded-full opacity-70 cursor-ew-resize"
                onMouseDown={(e) => handleStatusBarResize(e, false, "right")}
              />
              <div
                className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full opacity-70 cursor-ew-resize"
                onMouseDown={(e) => handleStatusBarResize(e, false, "left")}
              />
            </>
          )}
        </div>

        {/* Player status bars */}
        <div
          className={cn("absolute z-10 space-y-2", editMode && mergedConfig.enableDragAndDrop ? "cursor-move" : "")}
          style={{
            left: `${playerStatusPos.x}%`,
            top: `${playerStatusPos.y}%`,
            width: `${playerStatusPos.width}px`,
          }}
          onMouseDown={(e) =>
            editMode &&
            mergedConfig.enableDragAndDrop &&
            handleMouseDown(
              e,
              "statusBar",
              "player-status",
              { x: playerStatusPos.x, y: playerStatusPos.y },
              undefined,
              true,
              playerStatusPos.width,
            )
          }
        >
          {updatedPlayerMonsters.map((monster) => renderStatusBar(monster, false))}

          {editMode && mergedConfig.enableDragAndDrop && mergedConfig.showDragHandles && (
            <>
              {/* Resize handles */}
              <div
                className="absolute -right-2 top-0 w-4 h-4 bg-blue-500 rounded-full opacity-70 cursor-ew-resize"
                onMouseDown={(e) => handleStatusBarResize(e, true, "right")}
              />
              <div
                className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full opacity-70 cursor-ew-resize"
                onMouseDown={(e) => handleStatusBarResize(e, true, "left")}
              />
            </>
          )}
        </div>

        {/* Enemy monsters */}
        <div className="absolute inset-0">
          {updatedEnemyMonsters.map((monster) => renderMonsterSprite(monster, false))}
        </div>

        {/* Player monsters */}
        <div className="absolute inset-0">
          {updatedPlayerMonsters.map((monster) => renderMonsterSprite(monster, true))}
        </div>

        {/* Animation effects */}
        {animation && animation.type === "attack" && (
          <div
            className="absolute bg-yellow-400 rounded-full blur-md"
            style={{
              left: `${
                animation.progress < 0.5
                  ? updatedPlayerMonsters.find((m) => m.id === animation.sourceId)?.position.x || 0
                  : updatedEnemyMonsters.find((m) => m.id === animation.targetId)?.position.x || 0
              }%`,
              top: `${
                animation.progress < 0.5
                  ? updatedPlayerMonsters.find((m) => m.id === animation.sourceId)?.position.y || 0
                  : updatedEnemyMonsters.find((m) => m.id === animation.targetId)?.position.y || 0
              }%`,
              width: `${50 - Math.abs(animation.progress - 0.5) * 80}px`,
              height: `${50 - Math.abs(animation.progress - 0.5) * 80}px`,
              opacity: 1 - Math.abs(animation.progress - 0.5) * 2,
            }}
          />
        )}

        {/* Damage numbers */}
        {mergedConfig.showDamageNumbers && animation && animation.type === "damage" && (
          <div
            className="absolute text-2xl font-bold text-red-600 drop-shadow-lg"
            style={{
              left: `${updatedEnemyMonsters.find((m) => m.id === animation.targetId)?.position.x || 0}%`,
              top: `${updatedEnemyMonsters.find((m) => m.id === animation.targetId)?.position.y || 0}%`,
              transform: `translateY(${-20 - animation.progress * 30}px)`,
              opacity: 1 - animation.progress,
            }}
          >
            -{Math.floor(Math.random() * 20) + 10}
          </div>
        )}

        {/* Edit mode controls */}
        {renderEditControls()}

        {/* Edit mode toggle button */}
        {mergedConfig.enableDragAndDrop && (
          <button
            className={cn(
              "absolute bottom-2 right-2 z-50 px-3 py-1 rounded text-white text-sm",
              editMode ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600",
            )}
            onClick={toggleEditMode}
          >
            {editMode ? "Exit Edit Mode" : "Edit Layout"}
          </button>
        )}

        {/* Debug info */}
        {mergedConfig.debugMode && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white p-2 text-xs rounded">
            <div>Turn: {turn}</div>
            <div>Weather: {weather}</div>
            <div>Field: {fieldEffect}</div>
            <div>Selected: {selectedMonster}</div>
            <div>Action: {selectedAction}</div>
            <div>Edit Mode: {editMode ? "ON" : "OFF"}</div>
            {draggingElement && (
              <div>
                Dragging: {draggingElement.type} ({draggingElement.id})
                <br />
                Pos: {Math.round(draggingElement.position.x)}, {Math.round(draggingElement.position.y)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual separator */}
      <div className="h-1 w-full bg-gray-800"></div>

      {/* Battle interface */}
      <div className="flex h-32">
        {/* Message box */}
        <div
          className="w-2/3 border-t-2 border-r-2 p-4 flex items-center"
          style={{
            backgroundColor: mergedConfig.messageBoxStyle?.backgroundColor,
            borderColor: mergedConfig.messageBoxStyle?.borderColor,
          }}
        >
          <div
            className="bg-white w-full h-full rounded-lg p-4 font-mono text-xl shadow-inner"
            style={{
              color: mergedConfig.messageBoxStyle?.textColor,
              fontFamily: mergedConfig.messageBoxStyle?.fontFamily,
              fontSize: mergedConfig.largeText ? "1.5rem" : mergedConfig.messageBoxStyle?.fontSize,
              padding: mergedConfig.messageBoxStyle?.padding,
              borderRadius: mergedConfig.messageBoxStyle?.borderRadius,
            }}
          >
            {message}
          </div>
        </div>

        {/* Battle menu */}
        <div
          className="w-1/3 border-t-2"
          style={{
            backgroundColor: mergedConfig.menuStyle?.backgroundColor,
            borderColor: mergedConfig.messageBoxStyle?.borderColor,
          }}
        >
          {customMenuContent
            ? customMenuContent
            : showMoveMenu
              ? renderMoveMenu()
              : showItemMenu
                ? renderItemMenu()
                : showMonsterMenu
                  ? renderMonsterMenu()
                  : renderBattleMenu()}
        </div>
      </div>
    </div>
  )
}

// ======== EXAMPLE USAGE ========

/*
// Basic usage
<PokemonBattle />

// Custom configuration with drag-and-drop enabled
<PokemonBattle 
  config={{
    // Background configuration
    backgroundImage: "/images/forest-background.jpg",
    backgroundImageOptions: {
      opacity: 0.8,
      blur: 2,
      parallax: true
    },
    
    // Battle effects
    weatherEffect: "rain",
    weatherIntensity: 1.5,
    fieldEffect: "electricTerrain",
    
    // UI customization
    messageBoxStyle: {
      backgroundColor: "rgb(220, 38, 38)",
      textColor: "rgb(0, 0, 0)",
    },
    
    // Drag and drop configuration
    enableDragAndDrop: true,
    showDragHandles: true,
    snapToGrid: true,
    gridSize: 5,
  }}
  
  // Layout change callback
  onLayoutChange={(layout) => {
    console.log("Layout changed:", layout);
    // Save layout to database or local storage
  }}
/>
*/
