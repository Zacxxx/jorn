export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface UIElement {
  position: Position;
  size: Size;
  visible: boolean;
  zIndex?: number;
}

export interface GridLayout {
  battleArea: UIElement;
  actionMenu: UIElement;
  contentArea: UIElement;
  playerSprite: UIElement & { scale: number };
  enemySprites: Array<UIElement & { scale: number }>;
}

export interface JornBattleConfig {
  // Layout configuration
  battleAreaHeight: number;
  useFullHeight: boolean;
  gridColumns: number;
  gridRows: number;
  layout: GridLayout;
  
  // Canvas configuration
  canvasWidth: number; // Can exceed 100% for ultra-wide layouts
  canvasHeight: string; // Can be vh, px, or %
  canvasMinWidth: number;
  canvasMinHeight: number;
  
  // Classic positioning (fallback)
  playerPosition: Position;
  enemyPositions: Position[];
  playerStatusPosition: Position;
  enemyStatusPosition: Position;
  
  // Background configuration
  backgroundGradient?: { from: string; to: string };
  
  // Typography configuration
  fontSizes?: {
    base: number;       // Base font size in rem
    small: number;      // Small text
    large: number;      // Large text
    heading: number;    // Heading text
    ui: number;         // UI elements
  };
  
  // UI style configuration
  messageBoxStyle?: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  };
  menuStyle?: {
    backgroundColor: string;
    buttonColor: string;
    textColor: string;
    hoverColor: string;
    activeColor: string;
  };
  
  // Animation configuration
  animationSpeed?: number;
  showDamageNumbers?: boolean;
  
  // Edit mode configuration
  editMode?: {
    enabled: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
  };
} 