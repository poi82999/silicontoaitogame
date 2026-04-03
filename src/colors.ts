/** Pixel font family — DotGothic16 for cute pixel look with Korean support */
export const FONT = '"DotGothic16", monospace';

/** Factorio-style exploration color palette */
export const COLORS = {
  // Environment
  ground: 0x262638,
  groundLine: 0x2e2e42,
  road: 0x333348,
  roadMark: 0x4a4a5e,

  // UI
  bg: 0x1a1a2e,
  panel: 0x16213e,
  panelBorder: 0x533483,
  border: 0x533483,
  borderLight: 0x7c5cbf,
  text: 0xe0e0e0,
  textDim: 0x888888,
  textMuted: 0x555555,
  accent: 0x00d2ff,
  gold: 0xffd700,

  // Player
  playerBody: 0xe67e22,
  playerHat: 0xf1c40f,

  // Buildings
  hq: 0x2c3e50,
  factory: 0x1e272e,
  verify: 0x1a3a4a,
  sram: 0x34495e,
  sramActive: 0x2ecc71,
  pe: 0x2c3e50,
  peActive: 0x27ae60,
  peWeight: 0xf39c12,
  accumulator: 0x8e44ad,
  dma: 0x5a3a1e,
  conveyor: 0x555568,

  // Building interaction
  buildingBorder: 0x555577,
  buildingNear: 0x00d2ff,
  buildingSelected: 0xffd700,
  hoverGlow: 0x00d2ff,
  selectGlow: 0xffd700,
  tooltipBg: 0x0a0e1a,
  tooltipBorder: 0x00d2ff,

  // FSM
  fsm: {
    IDLE: 0x95a5a6,
    DMA: 0xe67e22,
    SWAP: 0x9b59b6,
    EXEC: 0x2ecc71,
    DONE: 0x3498db,
    ACK: 0x1abc9c,
  } as Record<string, number>,

  // Minimap
  minimapBg: 0x0a0e1a,
  minimapPlayer: 0xff4444,
};

/** World dimensions */
export const WORLD = {
  w: 6400,
  h: 5600,
  gridSize: 64,
  playerSpeed: 560,
  interactDist: 240,
  playerSpawn: { x: 1070, y: 400 },
  /** Scale factor applied to building/road coordinates */
  S: 2,
};

/** Screen-fixed HUD layout (native 1600×900, no zoom) */
export const HUD = {
  gameW: 1600,
  gameH: 900,
  screenW: 1600,
  screenH: 900,
  minimap: { x: 16, y: 16, w: 220, h: 176 },
  status: { x: 520, y: 12 },
  timeline: { x: 120, y: 820, w: 1360, h: 40 },
  controls: { x: 120, y: 866 },
  inspector: { x: 440, y: 60, w: 720, h: 760 },
};
