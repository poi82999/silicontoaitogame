import Phaser from 'phaser';
import { FACTORY, buildTileTimeline, totalCycles, TilePhase } from './config';
import { COLORS, WORLD, HUD } from './colors';
import { getEntityInfo, getTooltipData, EntityInfo } from './entities';

// ─── Building Definitions ──────────────────────────────────────

interface BuildingDef {
  id: string;
  entityType: string;
  entityId?: string | number;
  x: number; y: number; w: number; h: number;
  color: number;
  icon: string;
  label: string;
  canEnter?: boolean;
}

interface BuildingObj {
  def: BuildingDef;
  body: Phaser.GameObjects.Rectangle;
  border: Phaser.GameObjects.Rectangle;
  header: Phaser.GameObjects.Rectangle;
  iconText: Phaser.GameObjects.Text;
  labelText: Phaser.GameObjects.Text;
  glowing: boolean;
}

const BUILDINGS: BuildingDef[] = [
  // HQ Campus
  { id: 'tracer', entityType: 'hq', entityId: 'tracer', x: 100, y: 100, w: 240, h: 160, color: 0x2c3e50, icon: '📋', label: '주문접수부' },
  { id: 'lowering', entityType: 'hq', entityId: 'lowering', x: 420, y: 100, w: 240, h: 160, color: 0x2c3e50, icon: '✂️', label: '공정설계부' },
  { id: 'scheduler', entityType: 'hq', entityId: 'scheduler', x: 740, y: 100, w: 240, h: 160, color: 0x2c3e50, icon: '📅', label: '일정관리부' },
  { id: 'compiler', entityType: 'hq', entityId: 'compiler', x: 1060, y: 100, w: 240, h: 160, color: 0x2c3e50, icon: '🏗️', label: '설계총괄' },
  { id: 'emitter', entityType: 'hq', entityId: 'emitter', x: 1380, y: 100, w: 240, h: 160, color: 0x2c3e50, icon: '📦', label: '출하문서부' },
  // Gate / Logistics
  { id: 'fsm', entityType: 'fsm', x: 200, y: 420, w: 350, h: 150, color: 0x34495e, icon: '🚦', label: '경비실 (FSM)' },
  { id: 'dma', entityType: 'dma', x: 650, y: 420, w: 300, h: 150, color: 0x5a3a1e, icon: '🚛', label: 'DMA 지게차' },
  // SRAM Warehouses
  { id: 'sram0', entityType: 'sram', entityId: 0, x: 100, y: 740, w: 210, h: 170, color: 0x34495e, icon: '🏪', label: 'Bank 0 [A]' },
  { id: 'sram1', entityType: 'sram', entityId: 1, x: 370, y: 740, w: 210, h: 170, color: 0x34495e, icon: '🏪', label: 'Bank 1 [A]' },
  { id: 'sram2', entityType: 'sram', entityId: 2, x: 640, y: 740, w: 210, h: 170, color: 0x34495e, icon: '🏪', label: 'Bank 2 [B]' },
  { id: 'sram3', entityType: 'sram', entityId: 3, x: 910, y: 740, w: 210, h: 170, color: 0x34495e, icon: '🏪', label: 'Bank 3 [B]' },
  // Conveyor
  { id: 'conveyor', entityType: 'conveyor', x: 150, y: 1020, w: 850, h: 70, color: 0x555568, icon: '🔄', label: '정렬 컨베이어 (skew/deskew)' },
  // PE Grid (player can enter)
  { id: 'pe_grid', entityType: 'pe', x: 100, y: 1200, w: 700, h: 660, color: 0x1e272e, icon: '⚙️', label: '생산라인 (16×16 PE)', canEnter: true },
  // Accumulator
  { id: 'accum', entityType: 'accumulator', x: 150, y: 1970, w: 600, h: 150, color: 0x5a2a6a, icon: '📥', label: '완제품 창고 (Accumulator)' },
  // Verification Labs
  { id: 'core_replay', entityType: 'verify', entityId: 'core_replay', x: 1350, y: 420, w: 300, h: 160, color: 0x1a3a4a, icon: '🔬', label: '시제품 검사' },
  { id: 'system_replay', entityType: 'verify', entityId: 'system_replay', x: 1350, y: 650, w: 300, h: 160, color: 0x1a3a4a, icon: '🏭', label: '전체 가동 검사' },
  { id: 'uvm', entityType: 'verify', entityId: 'uvm', x: 1350, y: 880, w: 300, h: 160, color: 0x1a3a4a, icon: '🎲', label: '스트레스 검사' },
  { id: 'signoff', entityType: 'verify', entityId: 'signoff', x: 1350, y: 1110, w: 300, h: 160, color: 0x1a3a4a, icon: '✅', label: '검사 기준서' },
  { id: 'ci', entityType: 'verify', entityId: 'ci', x: 1350, y: 1340, w: 300, h: 160, color: 0x1a3a4a, icon: '🤖', label: '자동 검사 (CI)' },
];

// Road segments (x, y, w, h)
const ROADS: number[][] = [
  [80, 270, 1600, 50],   // HQ corridor
  [80, 580, 900, 40],    // gate corridor
  [80, 920, 1050, 40],   // SRAM corridor
  [480, 270, 50, 350],   // vert: HQ → gate
  [480, 580, 50, 380],   // vert: gate → SRAM
  [480, 960, 50, 300],   // vert: SRAM → PE
  [480, 1860, 50, 160],  // vert: PE → accum
  [750, 580, 650, 40],   // horiz: gate → verify
  [1300, 580, 50, 820],  // vert: verify corridor
  [480, 2130, 650, 40],  // horiz: accum → right
];

// ─── Scene ─────────────────────────────────────────────────────

export class FactoryScene extends Phaser.Scene {
  // Player
  private player!: Phaser.GameObjects.Container;
  private playerFacing: { x: number; y: number } = { x: 0, y: 1 };
  private dirIndicator!: Phaser.GameObjects.Triangle;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;

  // Buildings
  private buildingMap: Map<string, BuildingObj> = new Map();
  private nearbyBuilding: BuildingObj | null = null;

  // PE grid
  private peRects: Phaser.GameObjects.Rectangle[][] = [];
  private peGridOrigin = { x: 0, y: 0 };
  private readonly peCell = 38;

  // Animation
  private cycle = 0;
  private maxCycle = 0;
  private phases: TilePhase[] = [];
  private playing = false;
  private weightReuse = false;
  private cycleTimer = 0;
  private cyclesPerSecond = 10;

  // HUD
  private inspectorOpen = false;
  private inspectorBg!: Phaser.GameObjects.Graphics;
  private inspectorTexts: Phaser.GameObjects.Text[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private timelineBg!: Phaser.GameObjects.Graphics;
  private timelineCursor!: Phaser.GameObjects.Rectangle;
  private cycleText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private minimapGfx!: Phaser.GameObjects.Graphics;
  private controlHints!: Phaser.GameObjects.Text;

  // FSM visual
  private fsmRects: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private fsmLabel!: Phaser.GameObjects.Text;

  // SRAM visual
  private sramRects: Phaser.GameObjects.Rectangle[] = [];

  // Accum visual
  private accumBody!: Phaser.GameObjects.Rectangle;

  constructor() { super({ key: 'FactoryScene' }); }

  create() {
    this.phases = buildTileTimeline(this.weightReuse);
    this.maxCycle = totalCycles(this.phases);
    this.cycle = 0;
    this.buildingMap.clear();

    this.createGround();
    this.createRoads();
    this.createFlowArrows();
    this.createBuildings();
    this.createFSMDetail();
    this.createPEGrid();
    this.createPlayer();
    this.setupCamera();
    this.createHUD();
    this.setupInput();
  }

  // ── Ground with grid ──
  private createGround() {
    // Tile texture
    const g = this.make.graphics();
    g.fillStyle(COLORS.ground);
    g.fillRect(0, 0, WORLD.gridSize, WORLD.gridSize);
    g.lineStyle(1, COLORS.groundLine, 0.25);
    g.strokeRect(0, 0, WORLD.gridSize, WORLD.gridSize);
    // Industrial dots
    g.fillStyle(COLORS.groundLine, 0.3);
    g.fillCircle(WORLD.gridSize / 4, WORLD.gridSize / 4, 1);
    g.fillCircle(WORLD.gridSize * 3 / 4, WORLD.gridSize * 3 / 4, 1);
    g.generateTexture('ground_tile', WORLD.gridSize, WORLD.gridSize);
    g.destroy();

    const tile = this.add.tileSprite(0, 0, WORLD.w, WORLD.h, 'ground_tile');
    tile.setOrigin(0).setDepth(0);

    // Zone labels painted on ground
    const zoneStyle = { fontSize: '20px', color: '#3a3a50', fontFamily: 'monospace', fontStyle: 'bold' };
    this.add.text(100, 60, '🏢 본사 캠퍼스', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(200, 380, '🚪 정문 / 물류센터', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(100, 700, '📦 창고 (SRAM)', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(100, 1160, '⚙️ 생산동', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(150, 1940, '📥 출하동', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(1350, 380, '🔍 검증동', zoneStyle).setDepth(1).setAlpha(0.5);
  }

  // ── Roads ──
  private createRoads() {
    const g = this.add.graphics().setDepth(1);
    for (const [rx, ry, rw, rh] of ROADS) {
      // Road base
      g.fillStyle(COLORS.road, 0.85);
      g.fillRect(rx, ry, rw, rh);
      // Edge markings
      g.lineStyle(2, COLORS.roadMark, 0.3);
      if (rw > rh) {
        // Horizontal road — dashed center line
        for (let dx = 0; dx < rw; dx += 30) {
          g.lineBetween(rx + dx, ry + rh / 2, rx + dx + 16, ry + rh / 2);
        }
      } else {
        // Vertical road
        for (let dy = 0; dy < rh; dy += 30) {
          g.lineBetween(rx + rw / 2, ry + dy, rx + rw / 2, ry + dy + 16);
        }
      }
    }
  }

  // ── Flow arrows between areas ──
  private createFlowArrows() {
    const g = this.add.graphics().setDepth(2);
    const arrowColor = 0x4488aa;
    g.lineStyle(3, arrowColor, 0.5);

    const drawArrow = (x1: number, y1: number, x2: number, y2: number) => {
      g.lineBetween(x1, y1, x2, y2);
      // Arrowhead
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const sz = 10;
      g.fillStyle(arrowColor, 0.6);
      g.fillTriangle(
        x2, y2,
        x2 - sz * Math.cos(angle - 0.4), y2 - sz * Math.sin(angle - 0.4),
        x2 - sz * Math.cos(angle + 0.4), y2 - sz * Math.sin(angle + 0.4),
      );
    };

    // HQ flow: left → right
    for (let i = 0; i < 4; i++) {
      const b1 = BUILDINGS[i], b2 = BUILDINGS[i + 1];
      drawArrow(b1.x + b1.w + 10, b1.y + b1.h / 2, b2.x - 10, b2.y + b2.h / 2);
    }
    // HQ → Gate
    drawArrow(500, 270, 500, 410);
    // Gate → SRAM
    drawArrow(500, 600, 500, 730);
    // SRAM → Conveyor
    drawArrow(500, 920, 500, 1010);
    // Conveyor → PE
    drawArrow(500, 1100, 500, 1190);
    // PE → Accum
    drawArrow(500, 1870, 500, 1960);
  }

  // ── Buildings ──
  private createBuildings() {
    for (const def of BUILDINGS) {
      const cx = def.x + def.w / 2;
      const cy = def.y + def.h / 2;

      // Shadow
      this.add.rectangle(cx + 4, cy + 4, def.w, def.h, 0x000000, 0.25)
        .setDepth(2);

      // Body
      const body = this.add.rectangle(cx, cy, def.w, def.h, def.color, 0.88)
        .setDepth(3);

      // Border
      const border = this.add.rectangle(cx, cy, def.w + 4, def.h + 4)
        .setDepth(2).setFillStyle(0x000000, 0)
        .setStrokeStyle(2, COLORS.buildingBorder, 0.6);

      // Header bar
      const header = this.add.rectangle(cx, def.y + 14, def.w - 8, 24, COLORS.panel, 0.8)
        .setDepth(4);

      // Icon + Label
      const iconText = this.add.text(def.x + 8, def.y + 4, def.icon, { fontSize: '14px' })
        .setDepth(5);
      const labelText = this.add.text(def.x + 28, def.y + 5, def.label, {
        fontSize: '11px', color: '#e0e0e0', fontFamily: 'monospace', fontStyle: 'bold',
      }).setDepth(5);

      // Sub-info inside building
      if (def.entityType === 'sram') {
        const bankIdx = def.entityId as number;
        const groupLabel = bankIdx < 2 ? 'A' : 'B';
        this.add.text(def.x + 10, def.y + 40, `${FACTORY.SRAM_BANK_SIZE_KB}KB · ${groupLabel}조`, {
          fontSize: '10px', color: '#888', fontFamily: 'monospace',
        }).setDepth(5);
        this.add.text(def.x + 10, def.y + 58, `${FACTORY.SRAM_DEPTH}×${FACTORY.SRAM_WIDTH_BITS}b`, {
          fontSize: '9px', color: '#555', fontFamily: 'monospace',
        }).setDepth(5);
      }

      const bObj: BuildingObj = { def, body, border, header, iconText, labelText, glowing: false };
      this.buildingMap.set(def.id, bObj);

      // Track SRAM/accum for visual updates
      if (def.entityType === 'sram') this.sramRects.push(body);
      if (def.id === 'accum') this.accumBody = body;
    }
  }

  // ── FSM state indicators inside the FSM building ──
  private createFSMDetail() {
    const fsm = this.buildingMap.get('fsm');
    if (!fsm) return;
    const { x, y, w } = fsm.def;
    const states = FACTORY.FSM_STATES;
    const boxW = 42;
    const gap = 6;
    const startX = x + 10;
    const sy = y + 38;

    states.forEach((state, i) => {
      const sx = startX + i * (boxW + gap);
      const fsmC = COLORS.fsm[state] ?? 0x555555;
      const r = this.add.rectangle(sx + boxW / 2, sy + 12, boxW, 20, fsmC, 0.3)
        .setStrokeStyle(1, fsmC, 0.7).setDepth(5);
      this.fsmRects.set(state, r);

      this.add.text(sx + boxW / 2, sy + 12, state, {
        fontSize: '8px', color: '#ccc', fontFamily: 'monospace', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(5);
    });

    this.fsmLabel = this.add.text(x + 10, y + 70, 'State: IDLE', {
      fontSize: '10px', color: '#00d2ff', fontFamily: 'monospace',
    }).setDepth(5);

    // DMA info
    const dma = this.buildingMap.get('dma');
    if (dma) {
      this.add.text(dma.def.x + 10, dma.def.y + 40, `AXI4 ${FACTORY.AXI_DATA_WIDTH_DMA}bit`, {
        fontSize: '10px', color: '#e67e22', fontFamily: 'monospace',
      }).setDepth(5);
      this.add.text(dma.def.x + 10, dma.def.y + 58, `Outstanding: ${FACTORY.MAX_OUTSTANDING}`, {
        fontSize: '9px', color: '#888', fontFamily: 'monospace',
      }).setDepth(5);
    }
  }

  // ── PE Grid inside pe_grid building ──
  private createPEGrid() {
    const peDef = BUILDINGS.find(b => b.id === 'pe_grid')!;
    const startX = peDef.x + 50;
    const startY = peDef.y + 60;
    this.peGridOrigin = { x: startX, y: startY };

    // Labels inside PE building
    this.add.text(peDef.x + 10, peDef.y + 32, `${FACTORY.TILE_SIZE}×${FACTORY.TILE_SIZE} PE · ${FACTORY.PE_COUNT} units`, {
      fontSize: '10px', color: '#888', fontFamily: 'monospace',
    }).setDepth(5);

    this.add.text(startX - 40, startY + (FACTORY.TILE_SIZE * this.peCell) / 2 - 8, 'act→', {
      fontSize: '9px', color: '#e74c3c', fontFamily: 'monospace',
    }).setDepth(5);
    this.add.text(startX + (FACTORY.TILE_SIZE * this.peCell) / 2 - 14, startY - 16, 'weight↓', {
      fontSize: '9px', color: '#f39c12', fontFamily: 'monospace',
    }).setDepth(5);

    this.peRects = [];
    const size = this.peCell - 4;
    for (let r = 0; r < FACTORY.TILE_SIZE; r++) {
      this.peRects[r] = [];
      for (let c = 0; c < FACTORY.TILE_SIZE; c++) {
        const px = startX + c * this.peCell + this.peCell / 2;
        const py = startY + r * this.peCell + this.peCell / 2;
        const rect = this.add.rectangle(px, py, size, size, COLORS.pe, 0.85)
          .setStrokeStyle(1, COLORS.borderLight, 0.2).setDepth(5);
        this.peRects[r][c] = rect;
      }
    }

    // Psum arrow at bottom of PE grid
    this.add.text(startX + (FACTORY.TILE_SIZE * this.peCell) / 2 - 20,
      startY + FACTORY.TILE_SIZE * this.peCell + 4,
      'psum ▼', { fontSize: '9px', color: '#3498db', fontFamily: 'monospace' }).setDepth(5);

    // Accum detail
    const accum = this.buildingMap.get('accum');
    if (accum) {
      this.add.text(accum.def.x + 10, accum.def.y + 36,
        `${FACTORY.ACCUM_DEPTH}×${FACTORY.ACCUM_WIDTH_BITS}b = ${FACTORY.ACCUM_TOTAL_KB}KB`, {
          fontSize: '10px', color: '#888', fontFamily: 'monospace',
        }).setDepth(5);
    }
  }

  // ── Player ──
  private createPlayer() {
    const { x, y } = WORLD.playerSpawn;

    // Generate player texture
    const g = this.make.graphics();
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(16, 30, 22, 8);
    // Body (orange jumpsuit)
    g.fillStyle(COLORS.playerBody);
    g.fillRoundedRect(6, 10, 20, 18, 3);
    // Tool belt
    g.fillStyle(0x8B4513);
    g.fillRect(6, 22, 20, 3);
    // Hard hat
    g.fillStyle(COLORS.playerHat);
    g.fillRoundedRect(4, 1, 24, 12, 5);
    // Hat brim
    g.fillStyle(0xd4a017);
    g.fillRect(2, 10, 28, 3);
    // Visor
    g.fillStyle(0x2c3e50);
    g.fillRect(10, 5, 12, 5);
    // Visor shine
    g.fillStyle(0x5dade2, 0.6);
    g.fillRect(10, 5, 4, 3);
    g.generateTexture('player_char', 32, 36);
    g.destroy();

    const sprite = this.add.image(0, 0, 'player_char');

    // Direction indicator triangle
    this.dirIndicator = this.add.triangle(0, -22, 0, -6, -5, 2, 5, 2, COLORS.gold, 0.8);

    this.player = this.add.container(x, y, [sprite, this.dirIndicator]);
    this.player.setDepth(10);
    this.player.setSize(24, 30);

    // Player name tag
    const nameTag = this.add.text(0, 20, '엔지니어', {
      fontSize: '8px', color: '#ffd700', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.player.add(nameTag);
  }

  // ── Camera ──
  private setupCamera() {
    this.cameras.main.setBounds(0, 0, WORLD.w, WORLD.h);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
  }

  // ── Input ──
  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey('W');
    this.keyA = this.input.keyboard!.addKey('A');
    this.keyS = this.input.keyboard!.addKey('S');
    this.keyD = this.input.keyboard!.addKey('D');
    this.keyE = this.input.keyboard!.addKey('E');
    this.keyEsc = this.input.keyboard!.addKey('ESC');

    this.input.keyboard!.on('keydown-SPACE', () => this.togglePlay());
    this.input.keyboard!.on('keydown-R', () => this.toggleWeightReuse());
  }

  // ── HUD (all scrollFactor 0) ──
  private createHUD() {
    const depth = 100;

    // --- Minimap ---
    const mm = HUD.minimap;
    const mmBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    mmBg.fillStyle(COLORS.minimapBg, 0.85);
    mmBg.fillRoundedRect(mm.x, mm.y, mm.w, mm.h, 6);
    mmBg.lineStyle(1.5, COLORS.border, 0.8);
    mmBg.strokeRoundedRect(mm.x, mm.y, mm.w, mm.h, 6);

    this.minimapGfx = this.add.graphics().setScrollFactor(0).setDepth(depth + 1);

    // --- Status bar ---
    const stBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    stBg.fillStyle(COLORS.panel, 0.8);
    stBg.fillRoundedRect(HUD.status.x, HUD.status.y, 400, 30, 6);
    stBg.lineStyle(1, COLORS.border, 0.5);
    stBg.strokeRoundedRect(HUD.status.x, HUD.status.y, 400, 30, 6);

    this.statusText = this.add.text(HUD.status.x + 10, HUD.status.y + 6,
      `Cycle: 0/${this.maxCycle}  |  IDLE`, {
        fontSize: '12px', color: '#00d2ff', fontFamily: 'monospace', fontStyle: 'bold',
      }).setScrollFactor(0).setDepth(depth + 1);

    this.phaseText = this.add.text(HUD.status.x + 300, HUD.status.y + 6, '', {
      fontSize: '12px', color: '#e0e0e0', fontFamily: 'monospace',
    }).setScrollFactor(0).setDepth(depth + 1);

    // --- Timeline bar ---
    const tl = HUD.timeline;
    const tlBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    tlBg.fillStyle(COLORS.panel, 0.9);
    tlBg.fillRoundedRect(tl.x - 10, tl.y - 4, tl.w + 20, tl.h + 12, 6);
    tlBg.lineStyle(1, COLORS.border, 0.5);
    tlBg.strokeRoundedRect(tl.x - 10, tl.y - 4, tl.w + 20, tl.h + 12, 6);

    this.timelineBg = this.add.graphics().setScrollFactor(0).setDepth(depth + 1);
    this.drawTimelinePhases();

    this.timelineCursor = this.add.rectangle(tl.x, tl.y - 2, 3, tl.h + 4, 0xffffff)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(depth + 2);

    this.cycleText = this.add.text(tl.x, tl.y + tl.h + 4, `0/${this.maxCycle}`, {
      fontSize: '10px', color: '#00d2ff', fontFamily: 'monospace',
    }).setScrollFactor(0).setDepth(depth + 1);

    this.speedText = this.add.text(tl.x + tl.w - 100, tl.y + tl.h + 4,
      `${this.cyclesPerSecond} cyc/s`, {
        fontSize: '10px', color: '#888', fontFamily: 'monospace',
      }).setScrollFactor(0).setDepth(depth + 1);

    // --- Controls hint ---
    this.controlHints = this.add.text(HUD.controls.x, HUD.controls.y,
      'WASD=이동  E=조사  Space=▶  R=reuse  ↑↓=속도  Esc=닫기', {
        fontSize: '10px', color: '#555', fontFamily: 'monospace',
      }).setScrollFactor(0).setDepth(depth + 1);

    // --- Interaction prompt ---
    this.promptText = this.add.text(HUD.screenW / 2, HUD.screenH - 140, '', {
      fontSize: '14px', color: '#ffd700', fontFamily: 'monospace', fontStyle: 'bold',
      backgroundColor: '#0a0e1acc', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2).setVisible(false);

    // --- Inspector panel (right side) ---
    this.inspectorBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    this.inspectorBg.setVisible(false);

    for (let i = 0; i < 24; i++) {
      const t = this.add.text(0, 0, '', {
        fontSize: '10px', color: '#e0e0e0', fontFamily: 'monospace',
        wordWrap: { width: HUD.inspector.w - 30 },
      }).setScrollFactor(0).setDepth(depth + 1).setVisible(false);
      this.inspectorTexts.push(t);
    }
  }

  private drawTimelinePhases() {
    const tl = HUD.timeline;
    this.timelineBg.clear();

    this.phases.forEach(phase => {
      const px = tl.x + (phase.start / this.maxCycle) * tl.w;
      const pw = Math.max(1, (phase.duration / this.maxCycle) * tl.w);
      this.timelineBg.fillStyle(phase.color, 0.7);
      this.timelineBg.fillRect(px, tl.y, pw, tl.h);
      this.timelineBg.lineStyle(1, 0x000000, 0.25);
      this.timelineBg.strokeRect(px, tl.y, pw, tl.h);
    });
  }

  // ── Inspector display ──
  private showInspector(info: EntityInfo) {
    const { x, y, w, h } = HUD.inspector;

    this.inspectorBg.clear();
    this.inspectorBg.fillStyle(COLORS.panel, 0.95);
    this.inspectorBg.fillRoundedRect(x, y, w, h, 8);
    this.inspectorBg.lineStyle(2, COLORS.border, 1);
    this.inspectorBg.strokeRoundedRect(x, y, w, h, 8);
    this.inspectorBg.lineStyle(3, COLORS.gold, 0.8);
    this.inspectorBg.lineBetween(x + 4, y, x + w - 4, y);
    this.inspectorBg.setVisible(true);

    let line = 0;
    const set = (text: string, color = '#e0e0e0', size = '10px', bold = false) => {
      if (line < this.inspectorTexts.length) {
        const t = this.inspectorTexts[line];
        t.setText(text).setColor(color).setFontSize(parseInt(size));
        t.setFontStyle(bold ? 'bold' : 'normal');
        t.setPosition(x + 16, y + 16 + line * 18);
        t.setVisible(true);
        line++;
      }
    };

    set(`${info.icon}  ${info.title}`, '#ffd700', '13px', true);
    set(info.subtitle, '#888888', '10px');
    set(info.category, '#00d2ff', '9px');
    set('─'.repeat(40), '#333');

    for (const s of info.stats) {
      set(`${s.label.padEnd(18)} ${s.value}`, s.color ?? '#e0e0e0');
    }

    set('─'.repeat(40), '#333');
    for (const d of info.description) {
      set(d, '#aaaaaa');
    }

    set('', '#000');
    set('[E] 또는 [Esc] 닫기', '#555555', '9px');

    // Hide remaining lines
    for (let i = line; i < this.inspectorTexts.length; i++) {
      this.inspectorTexts[i].setVisible(false);
    }

    this.inspectorOpen = true;
  }

  private hideInspector() {
    this.inspectorBg.setVisible(false);
    for (const t of this.inspectorTexts) t.setVisible(false);
    this.inspectorOpen = false;
  }

  // ── Collision (simple AABB) ──
  private canMoveTo(nx: number, ny: number): boolean {
    const pw = 10, ph = 14;
    for (const bObj of this.buildingMap.values()) {
      if (bObj.def.canEnter) continue;
      const d = bObj.def;
      if (nx + pw > d.x && nx - pw < d.x + d.w &&
          ny + ph > d.y && ny - ph < d.y + d.h) {
        return false;
      }
    }
    // World bounds
    if (nx < pw || nx > WORLD.w - pw || ny < ph || ny > WORLD.h - ph) return false;
    return true;
  }

  // ── Movement ──
  private movePlayer(delta: number) {
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keyA.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown) dx += 1;
    if (this.cursors.up.isDown || this.keyW.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.keyS.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      // Normalize
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len; dy /= len;
      this.playerFacing = { x: dx, y: dy };

      const speed = WORLD.playerSpeed * (delta / 1000);
      const nx = this.player.x + dx * speed;
      const ny = this.player.y + dy * speed;

      // Try X and Y separately for sliding
      if (this.canMoveTo(nx, this.player.y)) this.player.x = nx;
      if (this.canMoveTo(this.player.x, ny)) this.player.y = ny;

      // Update direction indicator
      const angle = Math.atan2(this.playerFacing.y, this.playerFacing.x);
      this.dirIndicator.setRotation(angle + Math.PI / 2);
    }
  }

  // ── Proximity check ──
  private checkProximity() {
    let closest: BuildingObj | null = null;
    let closestDist = WORLD.interactDist;

    for (const bObj of this.buildingMap.values()) {
      const d = bObj.def;
      // Distance from player to building edge
      const cx = Math.max(d.x, Math.min(this.player.x, d.x + d.w));
      const cy = Math.max(d.y, Math.min(this.player.y, d.y + d.h));
      const dist = Math.sqrt((this.player.x - cx) ** 2 + (this.player.y - cy) ** 2);

      if (dist < closestDist) {
        closestDist = dist;
        closest = bObj;
      }
    }

    // Update glows
    if (this.nearbyBuilding && this.nearbyBuilding !== closest) {
      this.nearbyBuilding.border.setStrokeStyle(2, COLORS.buildingBorder, 0.6);
      this.nearbyBuilding.glowing = false;
    }

    this.nearbyBuilding = closest;

    if (closest && !this.inspectorOpen) {
      closest.border.setStrokeStyle(3, COLORS.buildingNear, 0.9);
      closest.glowing = true;
      this.promptText.setText(`[E] ${closest.def.label} 조사하기`);
      this.promptText.setVisible(true);
    } else if (!this.inspectorOpen) {
      this.promptText.setVisible(false);
    }

    // E key
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.inspectorOpen) {
        this.hideInspector();
        this.promptText.setVisible(!!this.nearbyBuilding);
      } else if (closest) {
        const def = closest.def;
        // For FSM, pass current state
        let entityId = def.entityId;
        if (def.entityType === 'fsm') {
          entityId = this.getCurrentFSMState();
        }
        const info = getEntityInfo(def.entityType, entityId);
        if (info) {
          this.showInspector(info);
          closest.border.setStrokeStyle(3, COLORS.buildingSelected, 1);
          this.promptText.setText(`[E] 닫기  |  ${closest.def.label}`);
        }
      }
    }

    // Esc
    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      if (this.inspectorOpen) {
        this.hideInspector();
      }
    }
  }

  // ── Animation update ──
  private updateAnimation(delta: number) {
    // Speed control
    if (this.cursors.up.isDown && !this.keyW.isDown) {
      // Already handled by cursors for movement, skip speed
    }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey('PLUS')) ||
        Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey('NUMPAD_ADD'))) {
      this.cyclesPerSecond = Math.min(60, this.cyclesPerSecond + 5);
    }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey('MINUS')) ||
        Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey('NUMPAD_SUBTRACT'))) {
      this.cyclesPerSecond = Math.max(1, this.cyclesPerSecond - 5);
    }

    if (this.playing) {
      this.cycleTimer += delta;
      const interval = 1000 / this.cyclesPerSecond;
      while (this.cycleTimer >= interval) {
        this.cycleTimer -= interval;
        this.cycle++;
        if (this.cycle >= this.maxCycle) {
          this.cycle = this.maxCycle;
          this.playing = false;
          break;
        }
      }
    }
  }

  // ── Visual updates for buildings ──
  private updateBuildingVisuals() {
    const phase = this.phases.find(p => this.cycle >= p.start && this.cycle < p.start + p.duration);
    const phaseName = phase?.name ?? 'done';
    const fsmState = this.getCurrentFSMState();

    // FSM
    FACTORY.FSM_STATES.forEach(state => {
      const r = this.fsmRects.get(state);
      if (!r) return;
      const c = COLORS.fsm[state] ?? 0x555555;
      const isActive = state === fsmState;
      r.setFillStyle(c, isActive ? 0.8 : 0.25);
      r.setStrokeStyle(isActive ? 2 : 1, c, isActive ? 1 : 0.5);
    });
    this.fsmLabel.setText(`State: ${fsmState}`);

    // SRAM
    this.sramRects.forEach((rect, i) => {
      const isDMA = phaseName === 'dma_weight' || phaseName === 'dma_act';
      const isGroupA = i < 2;
      if (isDMA && isGroupA) rect.setFillStyle(COLORS.dma, 0.7);
      else if (phaseName === 'execute' && !isGroupA) rect.setFillStyle(COLORS.sramActive, 0.7);
      else rect.setFillStyle(COLORS.sram, 0.7);
    });

    // Accumulator
    const accumActive = phaseName === 'execute' || phaseName === 'flush' || phaseName === 'drain';
    this.accumBody.setFillStyle(
      phaseName === 'drain' ? COLORS.accumulator : accumActive ? 0x6c3483 : COLORS.accumulator,
      accumActive ? 0.8 : 0.5,
    );
  }

  // ── PE grid visuals ──
  private updatePEVisuals() {
    const phase = this.phases.find(p => this.cycle >= p.start && this.cycle < p.start + p.duration);
    const phaseName = phase?.name ?? 'done';
    const size = FACTORY.TILE_SIZE;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let color = COLORS.pe;
        let alpha = 0.85;

        if (phaseName === 'preload') {
          const row = phase ? this.cycle - phase.start : 0;
          if (r <= row) { color = COLORS.peWeight; alpha = 0.9; }
        } else if (phaseName === 'execute') {
          const cyc = phase ? this.cycle - phase.start : 0;
          if (cyc >= r + c) { color = COLORS.peActive; alpha = 1.0; }
          else if (cyc >= r) { color = COLORS.peWeight; alpha = 0.7; }
        } else if (phaseName === 'flush') {
          const cyc = phase ? this.cycle - phase.start : 0;
          const pe_t = r + c;
          const since = (size - 1) + cyc - pe_t;
          if (since > 0) {
            color = 0x3498db;
            alpha = Math.max(0.3, 1 - since / FACTORY.FLUSH_CYCLES);
          } else { color = COLORS.peActive; alpha = 0.8; }
        } else if (phaseName === 'drain') {
          const row = phase ? this.cycle - phase.start : 0;
          if (r <= row) { color = 0x1abc9c; alpha = 0.6; }
        }

        this.peRects[r][c].setFillStyle(color, alpha);
      }
    }
  }

  // ── HUD update ──
  private updateHUD() {
    const phase = this.phases.find(p => this.cycle >= p.start && this.cycle < p.start + p.duration);
    const fsmState = this.getCurrentFSMState();

    // Status
    this.statusText.setText(`Cycle: ${this.cycle}/${this.maxCycle}  |  ${fsmState}  ${this.playing ? '▶' : '⏸'}`);
    this.phaseText.setText(phase?.label ?? 'Complete');

    // Timeline cursor
    const tl = HUD.timeline;
    this.timelineCursor.x = tl.x + (this.cycle / this.maxCycle) * tl.w;

    // Cycle text
    this.cycleText.setText(`${this.cycle}/${this.maxCycle}`);
    this.speedText.setText(`${this.cyclesPerSecond} cyc/s  ${this.weightReuse ? '[reuse ON]' : ''}`);

    // Minimap
    this.updateMinimap();
  }

  private updateMinimap() {
    const mm = HUD.minimap;
    const scaleX = (mm.w - 8) / WORLD.w;
    const scaleY = (mm.h - 8) / WORLD.h;
    const ox = mm.x + 4;
    const oy = mm.y + 4;

    this.minimapGfx.clear();

    // Buildings
    for (const bObj of this.buildingMap.values()) {
      const d = bObj.def;
      const isNear = bObj === this.nearbyBuilding;
      this.minimapGfx.fillStyle(isNear ? COLORS.buildingNear : 0x446688, 0.8);
      this.minimapGfx.fillRect(ox + d.x * scaleX, oy + d.y * scaleY, d.w * scaleX, d.h * scaleY);
    }

    // Player dot
    this.minimapGfx.fillStyle(COLORS.minimapPlayer, 1);
    this.minimapGfx.fillCircle(ox + this.player.x * scaleX, oy + this.player.y * scaleY, 3);

    // Camera viewport
    const cam = this.cameras.main;
    this.minimapGfx.lineStyle(1, 0xffffff, 0.6);
    this.minimapGfx.strokeRect(
      ox + cam.scrollX * scaleX, oy + cam.scrollY * scaleY,
      cam.width * scaleX, cam.height * scaleY,
    );
  }

  // ── Helpers ──
  private getCurrentFSMState(): string {
    const phase = this.phases.find(p => this.cycle >= p.start && this.cycle < p.start + p.duration);
    const name = phase?.name ?? 'done';
    switch (name) {
      case 'dma_weight': case 'dma_act': return 'DMA';
      case 'bank_swap': return 'SWAP';
      case 'preload': case 'execute': case 'flush': case 'drain': return 'EXEC';
      case 'done': return 'DONE';
      default: return 'IDLE';
    }
  }

  private togglePlay() {
    if (this.cycle >= this.maxCycle) this.cycle = 0;
    this.playing = !this.playing;
    this.cycleTimer = 0;
  }

  private toggleWeightReuse() {
    this.weightReuse = !this.weightReuse;
    this.scene.restart();
  }

  // ── Main Update ──
  update(_time: number, delta: number) {
    this.movePlayer(delta);
    this.checkProximity();
    this.updateAnimation(delta);
    this.updateBuildingVisuals();
    this.updatePEVisuals();
    this.updateHUD();
  }
}
