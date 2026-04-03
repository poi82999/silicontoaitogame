import Phaser from 'phaser';
import { FACTORY, buildTileTimeline, totalCycles, TilePhase } from './config';
import { COLORS, WORLD, HUD, FONT } from './colors';
import { getEntityInfo, getTooltipData, EntityInfo } from './entities';
import { WORKERS, WorkerDef, getWorkerInfo } from './workers';
import { getSpriteType, generateWorkerTexture, generatePlayerTexture, generateMaterialTexture } from './sprites';
import { MATERIALS, FLOW_ROUTES, FACTORY_ZONES, WALL_SEGMENTS, ENTRANCES, interpolateRoute, MaterialParticle } from './flow';

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

interface WorkerObj {
  def: WorkerDef;
  container: Phaser.GameObjects.Container;
  homeX: number;
  homeY: number;
  patrolAngle: number;
  patrolSpeed: number;
  nameTag: Phaser.GameObjects.Text;
  badge: Phaser.GameObjects.Text;
}

const BUILDINGS: BuildingDef[] = [
  // ── 사무동 1행 ──   gap at x=510..560 for vertical spine
  { id: 'compiler', entityType: 'hq', entityId: 'compiler', x: 90, y: 65, w: 200, h: 120, color: 0x2c3e50, icon: '🏭', label: '0F 공장장실' },
  { id: 'tracer', entityType: 'hq', entityId: 'tracer', x: 310, y: 65, w: 200, h: 120, color: 0x2c3e50, icon: '📋', label: '1F 영업부' },
  { id: 'ir', entityType: 'hq', entityId: 'ir', x: 560, y: 65, w: 200, h: 120, color: 0x2c3e50, icon: '📐', label: '2A 공정변환실' },
  { id: 'lowering', entityType: 'hq', entityId: 'lowering', x: 780, y: 65, w: 200, h: 120, color: 0x2c3e50, icon: '✂️', label: '2B 절단실' },
  // ── 사무동 2행 ──
  { id: 'scheduler', entityType: 'hq', entityId: 'scheduler', x: 200, y: 260, w: 200, h: 120, color: 0x2c3e50, icon: '📅', label: '3F 생산관리부' },
  { id: 'emitter', entityType: 'hq', entityId: 'emitter', x: 430, y: 260, w: 200, h: 120, color: 0x2c3e50, icon: '📦', label: '4F 포장부' },
  { id: 'replay_bridge', entityType: 'hq', entityId: 'replay_bridge', x: 660, y: 260, w: 200, h: 120, color: 0x2c3e50, icon: '🚚', label: '5F 물류부' },
  // ── 공장: 관제/물류 ──   spine gap x=440..570
  { id: 'fsm', entityType: 'fsm', x: 70, y: 565, w: 370, h: 130, color: 0x34495e, icon: '🏗️', label: '관제탑 (FSM)' },
  { id: 'dma', entityType: 'dma', x: 570, y: 565, w: 280, h: 130, color: 0x5a3a1e, icon: '🚛', label: '하역장 (DMA)' },
  // ── 공장: 핑퐁 냉장고 ──  spine gap x=490..570
  { id: 'sram0', entityType: 'sram', entityId: 0, x: 70, y: 770, w: 200, h: 140, color: 0x34495e, icon: '🧊', label: '양념냉장고 A' },
  { id: 'sram1', entityType: 'sram', entityId: 1, x: 290, y: 770, w: 200, h: 140, color: 0x34495e, icon: '🧊', label: '양념냉장고 B' },
  { id: 'sram2', entityType: 'sram', entityId: 2, x: 570, y: 770, w: 200, h: 140, color: 0x34495e, icon: '🧊', label: '재료냉장고 A' },
  { id: 'sram3', entityType: 'sram', entityId: 3, x: 790, y: 770, w: 200, h: 140, color: 0x34495e, icon: '🧊', label: '재료냉장고 B' },
  // ── 공장: 조리장 ──
  { id: 'conveyor', entityType: 'conveyor', x: 100, y: 985, w: 850, h: 50, color: 0x555568, icon: '🥘', label: '전처리대 (skew/deskew)' },
  { id: 'pe_grid', entityType: 'pe', x: 80, y: 1100, w: 700, h: 700, color: 0x1e272e, icon: '🔥', label: '오븐 (16×16 PE)', canEnter: true },
  // ── 공장: 출하 ──
  { id: 'accum', entityType: 'accumulator', x: 120, y: 1860, w: 560, h: 130, color: 0x5a2a6a, icon: '🗃️', label: '결과 보관소' },
  // ── 품질검사동 ──  gap=28px between buildings
  { id: 'core_replay', entityType: 'verify', entityId: 'core_replay', x: 1280, y: 565, w: 280, h: 100, color: 0x1a3a4a, icon: '🔬', label: '시식 검사' },
  { id: 'system_replay', entityType: 'verify', entityId: 'system_replay', x: 1280, y: 693, w: 280, h: 100, color: 0x1a3a4a, icon: '🏭', label: '라인 검사' },
  { id: 'validator', entityType: 'verify', entityId: 'validator', x: 1280, y: 821, w: 280, h: 100, color: 0x1a3a4a, icon: '📋', label: '포장 검사' },
  { id: 'drift', entityType: 'verify', entityId: 'drift', x: 1280, y: 949, w: 280, h: 100, color: 0x1a3a4a, icon: '🔄', label: '드리프트 감시' },
  { id: 'uvm', entityType: 'verify', entityId: 'uvm', x: 1280, y: 1077, w: 280, h: 100, color: 0x1a3a4a, icon: '🎲', label: '스트레스 검사' },
  { id: 'signoff', entityType: 'verify', entityId: 'signoff', x: 1280, y: 1205, w: 280, h: 100, color: 0x1a3a4a, icon: '✅', label: '검사 기준서' },
  { id: 'ci', entityType: 'verify', entityId: 'ci', x: 1280, y: 1333, w: 280, h: 100, color: 0x1a3a4a, icon: '🤖', label: '자동 검사 (CI)' },
  // ── 외부: DRAM / Host ──
  { id: 'dram', entityType: 'dram', x: 200, y: 2160, w: 340, h: 160, color: 0x2a4a2a, icon: '🏚️', label: 'DRAM 외부창고' },
  { id: 'host', entityType: 'host', x: 1200, y: 65, w: 280, h: 170, color: 0x4a2a50, icon: '🖥️', label: '호스트 PC' },
];

// Road segments (x, y, w, h) — unscaled
const ROADS: number[][] = [
  // ── Office corridors ──
  [90,  195, 900, 20],    // H: below row 1 (row ends y=185, +10 gap)
  [190, 390, 680, 20],    // H: below row 2 (row ends y=380, +10 gap)
  [850, 195, 20,  195],   // V: row connector right side (lowering→scheduler flow)
  [990, 140, 220, 20],    // H: office → host

  // ── Gate (office → factory) ──
  [525, 410, 20, 125],    // V: through entrance gap (y=410→535)

  // ── Factory vertical spine at x=525 ──
  [525, 535, 20, 180],    // V: entrance → control corridor (y=535→715)
  [525, 730, 20, 215],    // V: control → below SRAMs (y=730→945, thru gaps)
  [525, 945, 20, 155],    // V: SRAMs → PE entrance (y=945→1100, thru conveyor)
  [525, 1800, 20, 80],    // V: PE exit → accum area (y=1800→1880)
  [525, 1995, 20, 85],    // V: below accum → factory exit (y=1995→2080)

  // ── Factory horizontal corridors ──
  [60,  710, 1000, 20],   // H: below FSM/DMA (y=710, spans factory width)
  [60,  930, 910, 20],    // H: below SRAMs (y=930)

  // ── Factory → QC connector ──
  [860, 695, 350, 20],    // H: DMA area → QC entrance (thru wall gaps)
  [1230, 580, 20, 920],   // V: QC internal corridor

  // ── External roads ──
  [525, 2080, 20, 85],    // V: factory exit → DRAM road
  [200, 2140, 370, 20],   // H: DRAM connecting road
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

  // Mobile touch controls
  private isMobile = false;
  private touchDirX = 0;
  private touchDirY = 0;
  private touchEPressed = false;
  private joyBase!: Phaser.GameObjects.Arc;
  private joyThumb!: Phaser.GameObjects.Arc;
  private joyActive = false;
  private joyPointerId = -1;

  // Buildings
  private buildingMap: Map<string, BuildingObj> = new Map();
  private nearbyBuilding: BuildingObj | null = null;

  // Workers
  private workerObjs: WorkerObj[] = [];
  private nearbyWorker: WorkerObj | null = null;

  // PE grid
  private peRects: Phaser.GameObjects.Rectangle[][] = [];
  private peGridOrigin = { x: 0, y: 0 };
  private readonly peCell = 76;

  // Factory structure
  private wallColliders: { x: number; y: number; w: number; h: number }[] = [];

  // Material flow system
  private flowParticles: MaterialParticle[] = [];
  private flowSprites: Map<number, Phaser.GameObjects.Container> = new Map();
  private flowNextId = 0;

  // Animation
  private cycle = 0;
  private maxCycle = 0;
  private phases: TilePhase[] = [];
  private playing = false;
  private weightReuse = false;
  private cycleTimer = 0;
  private cyclesPerSecond = 10;
  private prevPhaseName = '';
  private officeFlowSpawned = false;

  // Building flash
  private buildingFlashTimers: Map<string, number> = new Map();

  // SRAM fill gauges
  private sramGauges: Phaser.GameObjects.Rectangle[] = [];

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
    this.workerObjs = [];
    this.wallColliders = [];
    this.flowParticles = [];
    this.flowSprites.clear();
    this.flowNextId = 0;
    this.prevPhaseName = '';
    this.officeFlowSpawned = false;
    this.buildingFlashTimers.clear();
    this.sramGauges = [];

    this.createGround();
    this.createFactoryBuilding();
    this.createRoads();
    this.createFlowArrows();
    this.createFlowPaths();
    this.createBuildings();
    this.createSRAMGauges();
    this.createFSMDetail();
    this.createPEGrid();
    this.createWorkers();
    this.createPlayer();
    this.setupCamera();
    this.createHUD();
    this.setupInput();
    this.initFlowSystem();
    this.setupMobileControls();
  }

  // ── Ground with grid ──
  private createGround() {
    // Tile texture — pixel art grid
    const g = this.make.graphics();
    g.fillStyle(COLORS.ground);
    g.fillRect(0, 0, WORLD.gridSize, WORLD.gridSize);
    g.lineStyle(1, COLORS.groundLine, 0.25);
    g.strokeRect(0, 0, WORLD.gridSize, WORLD.gridSize);
    // Industrial pixel dots (squares, not circles)
    g.fillStyle(COLORS.groundLine, 0.35);
    g.fillRect(WORLD.gridSize / 4 - 1, WORLD.gridSize / 4 - 1, 2, 2);
    g.fillRect(WORLD.gridSize * 3 / 4 - 1, WORLD.gridSize * 3 / 4 - 1, 2, 2);
    // Corner rivets
    g.fillStyle(COLORS.groundLine, 0.2);
    g.fillRect(2, 2, 3, 3);
    g.fillRect(WORLD.gridSize - 5, WORLD.gridSize - 5, 3, 3);
    g.generateTexture('ground_tile', WORLD.gridSize, WORLD.gridSize);
    g.destroy();
    this.textures.get('ground_tile').setFilter(Phaser.Textures.FilterMode.NEAREST);

    const tile = this.add.tileSprite(0, 0, WORLD.w, WORLD.h, 'ground_tile');
    tile.setOrigin(0).setDepth(0);

    // Zone labels painted on ground
    const S = WORLD.S;
    const zoneStyle = { fontSize: '48px', color: '#3a3a50', fontFamily: FONT, fontStyle: 'bold' };
    this.add.text(80 * S, 45 * S, '🏢 실리콘 도시락 공장 · 사무동', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(80 * S, 535 * S, '⚙️ 관제실 / 하역장', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(60 * S, 740 * S, '🧊 핑퐁 냉장고 (SRAM)', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(60 * S, 955 * S, '🔥 조리장', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(120 * S, 1830 * S, '🗃️ 출하장', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(1210 * S, 535 * S, '🔍 품질검사동', zoneStyle).setDepth(1).setAlpha(0.5);
    this.add.text(210 * S, 2120 * S, '🏚️ DRAM 외부', zoneStyle).setDepth(1).setAlpha(0.4);
    this.add.text(1210 * S, 45 * S, '🖥️ 호스트', zoneStyle).setDepth(1).setAlpha(0.4);
  }

  // ── Factory Building (walls, floors, entrances) ──
  private createFactoryBuilding() {
    const S = WORLD.S;
    const gFloor = this.add.graphics().setDepth(0.5);
    const gWall = this.add.graphics().setDepth(2);
    const gEntrance = this.add.graphics().setDepth(1.5);

    // ── Zone floor fills ──
    for (const zone of FACTORY_ZONES) {
      gFloor.fillStyle(zone.floorColor, 0.7);
      gFloor.fillRect(zone.x * S, zone.y * S, zone.w * S, zone.h * S);
      // Subtle inner border
      gFloor.lineStyle(2, zone.wallColor, 0.15);
      gFloor.strokeRect((zone.x + 4) * S, (zone.y + 4) * S,
        (zone.w - 8) * S, (zone.h - 8) * S);
    }

    // ── Wall segments ──
    for (const [wx, wy, ww, wh] of WALL_SEGMENTS) {
      const sx = wx * S, sy = wy * S, sw = ww * S, sh = wh * S;
      // Wall body
      gWall.fillStyle(0x4a4a65, 0.85);
      gWall.fillRect(sx, sy, sw, sh);
      // Wall top highlight
      gWall.fillStyle(0x5a5a78, 0.5);
      if (ww > wh) { // horizontal wall
        gWall.fillRect(sx, sy, sw, 3);
      } else { // vertical wall
        gWall.fillRect(sx, sy, 3, sh);
      }
      // Wall shadow
      gWall.fillStyle(0x000000, 0.2);
      if (ww > wh) {
        gWall.fillRect(sx, sy + sh, sw, 4);
      } else {
        gWall.fillRect(sx + sw, sy, 4, sh);
      }
      // Store scaled rect for collision
      this.wallColliders.push({ x: sx, y: sy, w: sw, h: sh });
    }

    // ── Entrance decorations ──
    for (const ent of ENTRANCES) {
      // Entrance floor (lighter tile)
      gEntrance.fillStyle(0x333350, 0.8);
      gEntrance.fillRect(ent.x * S, ent.y * S, ent.w * S, ent.h * S);

      // Gate pillars
      for (const p of ent.pillars) {
        gEntrance.fillStyle(0x5a5a78, 0.9);
        gEntrance.fillRect(p.x * S, p.y * S, p.w * S, p.h * S);
        // Pillar highlight
        gEntrance.fillStyle(0x7a7a98, 0.4);
        gEntrance.fillRect(p.x * S + 2, p.y * S + 2, 4, 4);
      }

      // Entrance sign
      this.add.text(ent.labelX * S, ent.labelY * S, ent.label, {
        fontSize: '28px', color: '#8888aa', fontFamily: FONT, fontStyle: 'bold',
      }).setDepth(3).setAlpha(0.7);
    }

    // ── Factory main sign ──
    const factoryZone = FACTORY_ZONES.find(z => z.id === 'factory')!;
    const signX = (factoryZone.x + factoryZone.w / 2) * S;
    const signY = (factoryZone.y - 2) * S;
    this.add.text(signX, signY, '🏭 실리콘 도시락 공장', {
      fontSize: '32px', color: '#6a6a88', fontFamily: FONT, fontStyle: 'bold',
    }).setOrigin(0.5, 1).setDepth(3).setAlpha(0.6);

    // ── QC sign ──
    const qcZone = FACTORY_ZONES.find(z => z.id === 'qc')!;
    const qcSignX = (qcZone.x + qcZone.w / 2) * S;
    const qcSignY = (qcZone.y - 2) * S;
    this.add.text(qcSignX, qcSignY, '🔍 품질검사동', {
      fontSize: '28px', color: '#4a7a8a', fontFamily: FONT, fontStyle: 'bold',
    }).setOrigin(0.5, 1).setDepth(3).setAlpha(0.6);
  }

  // ── Roads ──
  private createRoads() {
    const g = this.add.graphics().setDepth(1);
    const S = WORLD.S;
    for (const [rx, ry, rw, rh] of ROADS) {
      // Road base
      g.fillStyle(COLORS.road, 0.85);
      g.fillRect(rx * S, ry * S, rw * S, rh * S);
      // Edge markings
      g.lineStyle(3, COLORS.roadMark, 0.3);
      if (rw > rh) {
        for (let dx = 0; dx < rw * S; dx += 60) {
          g.lineBetween(rx * S + dx, ry * S + rh * S / 2, rx * S + dx + 32, ry * S + rh * S / 2);
        }
      } else {
        for (let dy = 0; dy < rh * S; dy += 60) {
          g.lineBetween(rx * S + rw * S / 2, ry * S + dy, rx * S + rw * S / 2, ry * S + dy + 32);
        }
      }
    }
  }

  // ── Flow arrows between areas ──
  private createFlowArrows() {
    const g = this.add.graphics().setDepth(2);
    const arrowColor = 0x4488aa;
    const S = WORLD.S;
    g.lineStyle(5, arrowColor, 0.5);

    const drawArrow = (x1: number, y1: number, x2: number, y2: number) => {
      g.lineBetween(x1 * S, y1 * S, x2 * S, y2 * S);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const sz = 18;
      g.fillStyle(arrowColor, 0.6);
      g.fillTriangle(
        x2 * S, y2 * S,
        x2 * S - sz * Math.cos(angle - 0.4), y2 * S - sz * Math.sin(angle - 0.4),
        x2 * S - sz * Math.cos(angle + 0.4), y2 * S - sz * Math.sin(angle + 0.4),
      );
    };

    // Row 1 office flow: compiler → tracer → ir → lowering
    for (let i = 0; i < 3; i++) {
      const b1 = BUILDINGS[i], b2 = BUILDINGS[i + 1];
      drawArrow(b1.x + b1.w + 10, b1.y + b1.h / 2, b2.x - 10, b2.y + b2.h / 2);
    }
    // Row 2 office flow: scheduler → emitter → replay_bridge
    for (let i = 4; i < 6; i++) {
      const b1 = BUILDINGS[i], b2 = BUILDINGS[i + 1];
      drawArrow(b1.x + b1.w + 10, b1.y + b1.h / 2, b2.x - 10, b2.y + b2.h / 2);
    }
    // Row 1 → Row 2 (lowering → scheduler)
    drawArrow(880, 195, 300, 250);
    // Row 2 → Gate (replay_bridge → fsm)
    drawArrow(535, 400, 535, 560);
    // Control → SRAM
    drawArrow(535, 720, 535, 760);
    // SRAM → Conveyor
    drawArrow(535, 940, 535, 980);
    // Conveyor → Oven
    drawArrow(535, 1040, 535, 1095);
    // Oven → Accum
    drawArrow(535, 1810, 535, 1855);
    // Host → Office (external)
    drawArrow(1200, 150, 1012, 130);
    // DRAM → Factory bottom entrance
    drawArrow(370, 2160, 535, 2080);
  }

  // ── Flow path indicators (dashed material routes on ground) ──
  private createFlowPaths() {
    const S = WORLD.S;
    const g = this.add.graphics().setDepth(1.5);

    for (const route of FLOW_ROUTES) {
      const mat = MATERIALS[route.material];
      if (!mat) continue;

      g.lineStyle(3, mat.color, 0.12);
      const wp = route.waypoints;
      for (let i = 0; i < wp.length - 1; i++) {
        const x1 = wp[i].x * S, y1 = wp[i].y * S;
        const x2 = wp[i + 1].x * S, y2 = wp[i + 1].y * S;
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) continue;
        const nx = dx / len, ny = dy / len;
        const dashLen = 14, gapLen = 10;
        let d = 0;
        while (d < len) {
          const endD = Math.min(d + dashLen, len);
          g.lineBetween(x1 + nx * d, y1 + ny * d, x1 + nx * endD, y1 + ny * endD);
          d = endD + gapLen;
        }
      }

      // Small arrow at route end
      if (wp.length >= 2) {
        const last = wp[wp.length - 1];
        const prev = wp[wp.length - 2];
        const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
        const sz = 10;
        g.fillStyle(mat.color, 0.2);
        g.fillTriangle(
          last.x * S, last.y * S,
          last.x * S - sz * Math.cos(angle - 0.4), last.y * S - sz * Math.sin(angle - 0.4),
          last.x * S - sz * Math.cos(angle + 0.4), last.y * S - sz * Math.sin(angle + 0.4),
        );
      }
    }
  }

  // ── Buildings ──
  private createBuildings() {
    const S = WORLD.S;
    for (const def of BUILDINGS) {
      const sx = def.x * S, sy = def.y * S, sw = def.w * S, sh = def.h * S;
      const cx = sx + sw / 2;
      const cy = sy + sh / 2;

      // Pixel shadow (offset 6px)
      this.add.rectangle(cx + 6, cy + 6, sw, sh, 0x000000, 0.3)
        .setDepth(2);

      // Body
      const body = this.add.rectangle(cx, cy, sw, sh, def.color, 0.9)
        .setDepth(3);

      // Pixel art double border
      const border = this.add.rectangle(cx, cy, sw + 8, sh + 8)
        .setDepth(2).setFillStyle(0x000000, 0)
        .setStrokeStyle(3, COLORS.buildingBorder, 0.6);
      // Inner border accent
      this.add.rectangle(cx, cy, sw - 4, sh - 4)
        .setDepth(4).setFillStyle(0x000000, 0)
        .setStrokeStyle(2, COLORS.borderLight, 0.2);

      // Header bar
      const header = this.add.rectangle(cx, sy + 30, sw - 12, 50, COLORS.panel, 0.85)
        .setDepth(4);
      // Header bottom line
      this.add.rectangle(cx, sy + 56, sw - 16, 3, COLORS.borderLight, 0.3)
        .setDepth(4);

      // Icon + Label
      const iconText = this.add.text(sx + 14, sy + 8, def.icon, { fontSize: '28px' })
        .setDepth(5);
      const labelText = this.add.text(sx + 52, sy + 10, def.label, {
        fontSize: '22px', color: '#e0e0e0', fontFamily: FONT, fontStyle: 'bold',
      }).setDepth(5);

      // Sub-info inside building
      if (def.entityType === 'sram') {
        const bankIdx = def.entityId as number;
        const typeLabel = bankIdx < 2 ? '양념(weight)' : '재료(act)';
        this.add.text(sx + 20, sy + 84, `${FACTORY.SRAM_BANK_SIZE_KB}KB · ${typeLabel}`, {
          fontSize: '20px', color: '#888', fontFamily: FONT,
        }).setDepth(5);
        this.add.text(sx + 20, sy + 116, `${FACTORY.SRAM_DEPTH}×${FACTORY.SRAM_WIDTH_BITS}b`, {
          fontSize: '18px', color: '#555', fontFamily: FONT,
        }).setDepth(5);
      }

      // Store with scaled coordinates in def-like object for collision
      const scaledDef = { ...def, x: sx, y: sy, w: sw, h: sh };
      const bObj: BuildingObj = { def: scaledDef, body, border, header, iconText, labelText, glowing: false };
      this.buildingMap.set(def.id, bObj);

      // Track SRAM/accum for visual updates
      if (def.entityType === 'sram') this.sramRects.push(body);
      if (def.id === 'accum') this.accumBody = body;
    }
  }

  // ── SRAM fill gauges ──
  private createSRAMGauges() {
    const sramIds = ['sram0', 'sram1', 'sram2', 'sram3'];
    for (const sid of sramIds) {
      const bObj = this.buildingMap.get(sid);
      if (!bObj) continue;
      const d = bObj.def;
      // Gauge bar at bottom of SRAM building (inside)
      const gaugeW = d.w - 40;
      const gaugeH = 16;
      const gx = d.x + 20 + gaugeW / 2;
      const gy = d.y + d.h - 28;
      // Background bar
      this.add.rectangle(gx, gy, gaugeW, gaugeH, 0x111122, 0.6)
        .setStrokeStyle(1, 0x444466, 0.5).setDepth(5);
      // Fill bar (starts at 0 width)
      const fill = this.add.rectangle(d.x + 20, gy, 0, gaugeH - 4, 0xf39c12, 0.8)
        .setOrigin(0, 0.5).setDepth(5.1);
      this.sramGauges.push(fill);
    }
  }

  // ── FSM state indicators inside the FSM building ──
  private createFSMDetail() {
    const fsm = this.buildingMap.get('fsm');
    if (!fsm) return;
    const { x, y } = fsm.def;
    const states = FACTORY.FSM_STATES;
    const boxW = 80;
    const gap = 12;
    const startX = x + 20;
    const sy = y + 76;

    states.forEach((state, i) => {
      const sx = startX + i * (boxW + gap);
      const fsmC = COLORS.fsm[state] ?? 0x555555;
      const r = this.add.rectangle(sx + boxW / 2, sy + 22, boxW, 40, fsmC, 0.3)
        .setStrokeStyle(3, fsmC, 0.7).setDepth(5);
      this.fsmRects.set(state, r);

      this.add.text(sx + boxW / 2, sy + 22, state, {
        fontSize: '18px', color: '#ccc', fontFamily: FONT, fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(5);
    });

    this.fsmLabel = this.add.text(x + 20, y + 140, '관제: IDLE', {
      fontSize: '22px', color: '#00d2ff', fontFamily: FONT,
    }).setDepth(5);

    // DMA info
    const dma = this.buildingMap.get('dma');
    if (dma) {
      this.add.text(dma.def.x + 20, dma.def.y + 84, `AXI4 ${FACTORY.AXI_DATA_WIDTH_DMA}bit`, {
        fontSize: '20px', color: '#e67e22', fontFamily: FONT,
      }).setDepth(5);
      this.add.text(dma.def.x + 20, dma.def.y + 120, `Outstanding: ${FACTORY.MAX_OUTSTANDING}`, {
        fontSize: '18px', color: '#888', fontFamily: FONT,
      }).setDepth(5);
    }
  }

  // ── PE Grid inside pe_grid building ──
  private createPEGrid() {
    const peDef = this.buildingMap.get('pe_grid')!.def;
    const startX = peDef.x + 100;
    const startY = peDef.y + 120;
    this.peGridOrigin = { x: startX, y: startY };

    // Labels inside PE building
    this.add.text(peDef.x + 20, peDef.y + 68, `${FACTORY.TILE_SIZE}×${FACTORY.TILE_SIZE} PE · ${FACTORY.PE_COUNT} units`, {
      fontSize: '20px', color: '#888', fontFamily: FONT,
    }).setDepth(5);

    this.add.text(startX - 80, startY + (FACTORY.TILE_SIZE * this.peCell) / 2 - 14, 'act→', {
      fontSize: '20px', color: '#e74c3c', fontFamily: FONT,
    }).setDepth(5);
    this.add.text(startX + (FACTORY.TILE_SIZE * this.peCell) / 2 - 32, startY - 36, 'weight↓', {
      fontSize: '20px', color: '#f39c12', fontFamily: FONT,
    }).setDepth(5);

    this.peRects = [];
    const size = this.peCell - 6;
    for (let r = 0; r < FACTORY.TILE_SIZE; r++) {
      this.peRects[r] = [];
      for (let c = 0; c < FACTORY.TILE_SIZE; c++) {
        const px = startX + c * this.peCell + this.peCell / 2;
        const py = startY + r * this.peCell + this.peCell / 2;
        const rect = this.add.rectangle(px, py, size, size, COLORS.pe, 0.85)
          .setStrokeStyle(2, COLORS.borderLight, 0.2).setDepth(5);
        this.peRects[r][c] = rect;
      }
    }

    // Psum arrow at bottom of PE grid
    this.add.text(startX + (FACTORY.TILE_SIZE * this.peCell) / 2 - 40,
      startY + FACTORY.TILE_SIZE * this.peCell + 8,
      'psum ▼', { fontSize: '20px', color: '#3498db', fontFamily: FONT }).setDepth(5);

    // Accum detail
    const accum = this.buildingMap.get('accum');
    if (accum) {
      this.add.text(accum.def.x + 20, accum.def.y + 80,
        `${FACTORY.ACCUM_DEPTH}×${FACTORY.ACCUM_WIDTH_BITS}b = ${FACTORY.ACCUM_TOTAL_KB}KB`, {
          fontSize: '20px', color: '#888', fontFamily: FONT,
        }).setDepth(5);
    }
  }

  // ── Workers (NPC) ──
  private createWorkers() {
    const S = WORLD.S;

    for (const wDef of WORKERS) {
      const building = this.buildingMap.get(wDef.buildingId);
      if (!building) continue;

      const bx = building.def.x;
      const by = building.def.y;
      const wx = bx + wDef.offsetX * S;
      const wy = by + wDef.offsetY * S;

      // Generate themed pixel art texture based on building zone
      const spriteType = getSpriteType(wDef.buildingId);
      const texKey = generateWorkerTexture(this, spriteType, wDef.color, wDef.hatColor);

      const sprite = this.add.image(0, 0, texKey);
      const badge = this.add.text(0, -40, wDef.badge, { fontSize: '28px' }).setOrigin(0.5);
      const nameTag = this.add.text(0, 32, wDef.name, {
        fontSize: '20px', color: '#cccccc', fontFamily: FONT,
      }).setOrigin(0.5);
      const roleTag = this.add.text(0, 56, wDef.role, {
        fontSize: '18px', color: '#888888', fontFamily: FONT,
      }).setOrigin(0.5);

      const container = this.add.container(wx, wy, [sprite, badge, nameTag, roleTag]);
      container.setDepth(8);
      container.setSize(32, 40);

      const wObj: WorkerObj = {
        def: wDef,
        container,
        homeX: wx,
        homeY: wy,
        patrolAngle: Math.random() * Math.PI * 2,
        patrolSpeed: 0.3 + Math.random() * 0.4,
        nameTag,
        badge,
      };
      this.workerObjs.push(wObj);
    }
  }

  private updateWorkers(delta: number) {
    const S = WORLD.S;
    for (const w of this.workerObjs) {
      if (w.def.patrol > 0) {
        w.patrolAngle += w.patrolSpeed * delta / 1000;
        const nx = w.homeX + Math.cos(w.patrolAngle) * w.def.patrol * S;
        const ny = w.homeY + Math.sin(w.patrolAngle * 0.7) * w.def.patrol * S * 0.6;
        w.container.setPosition(nx, ny);
      }
    }
  }

  // ── Player ──
  private createPlayer() {
    const { x, y } = WORLD.playerSpawn;

    // Generate themed player texture (factory inspector)
    generatePlayerTexture(this);

    const sprite = this.add.image(0, 0, 'player_char');

    // Direction indicator triangle (scaled)
    this.dirIndicator = this.add.triangle(0, -44, 0, -12, -10, 4, 10, 4, COLORS.gold, 0.8);

    this.player = this.add.container(x, y, [sprite, this.dirIndicator]);
    this.player.setDepth(10);
    this.player.setSize(48, 60);

    // Player name tag
    const nameTag = this.add.text(0, 48, '엔지니어', {
      fontSize: '22px', color: '#ffd700', fontFamily: FONT,
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

  // ── Mobile Touch Controls ──
  private setupMobileControls() {
    this.isMobile = this.sys.game.device.input.touch;
    if (!this.isMobile) return;

    const depth = 200;
    const S = HUD.screenH / 900; // scale factor for different screen sizes

    // ── Virtual Joystick (bottom-left) ──
    const joyX = 160 * S;
    const joyY = (HUD.screenH - 160 * S);
    const baseR = 80;
    const thumbR = 36;

    this.joyBase = this.add.circle(joyX, joyY, baseR, 0x333355, 0.4)
      .setStrokeStyle(3, 0x6666aa, 0.6)
      .setScrollFactor(0).setDepth(depth);
    this.joyThumb = this.add.circle(joyX, joyY, thumbR, 0x6688cc, 0.7)
      .setStrokeStyle(2, 0x88aaee, 0.8)
      .setScrollFactor(0).setDepth(depth + 1);

    // ── Action Buttons (bottom-right) ──
    const btnSize = 56;
    const btnGap = 16;
    const rightBase = HUD.screenW - 100 * S;
    const bottomBase = HUD.screenH - 130 * S;

    const makeBtn = (x: number, y: number, label: string, color: number, cb: () => void) => {
      const bg = this.add.circle(x, y, btnSize / 2, color, 0.5)
        .setStrokeStyle(3, 0xaaaacc, 0.6)
        .setScrollFactor(0).setDepth(depth)
        .setInteractive();
      const txt = this.add.text(x, y, label, {
        fontSize: '24px', color: '#ffffff', fontFamily: FONT, fontStyle: 'bold',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
      bg.on('pointerdown', () => {
        bg.setFillStyle(color, 0.9);
        cb();
      });
      bg.on('pointerup', () => bg.setFillStyle(color, 0.5));
      bg.on('pointerout', () => bg.setFillStyle(color, 0.5));
      return { bg, txt };
    };

    // E button (interact)
    makeBtn(rightBase, bottomBase - (btnSize + btnGap), '🔍', 0x2288aa, () => {
      this.touchEPressed = true;
    });

    // Play/Pause button
    makeBtn(rightBase - (btnSize + btnGap), bottomBase, '⏯', 0x228844, () => {
      this.togglePlay();
    });

    // Speed + button
    makeBtn(rightBase, bottomBase, '⏩', 0x886622, () => {
      this.cyclesPerSecond = Math.min(60, this.cyclesPerSecond + 5);
    });

    // Speed - button
    makeBtn(rightBase - 2 * (btnSize + btnGap), bottomBase, '⏪', 0x886622, () => {
      this.cyclesPerSecond = Math.max(1, this.cyclesPerSecond - 5);
    });

    // Close/Esc button (top-right of action area)
    makeBtn(rightBase, bottomBase - 2 * (btnSize + btnGap), '✖', 0x883333, () => {
      if (this.inspectorOpen) this.hideInspector();
    });

    // ── Joystick touch handling ──
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only capture touches on left half for joystick
      if (pointer.x < HUD.screenW / 2 && !this.joyActive) {
        this.joyActive = true;
        this.joyPointerId = pointer.id;
        this.joyBase.setPosition(pointer.x, pointer.y);
        this.joyThumb.setPosition(pointer.x, pointer.y);
        this.joyBase.setAlpha(0.6);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.joyActive || pointer.id !== this.joyPointerId) return;
      const dx = pointer.x - this.joyBase.x;
      const dy = pointer.y - this.joyBase.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 70;

      if (dist > 0) {
        const clampDist = Math.min(dist, maxDist);
        const nx = (dx / dist) * clampDist;
        const ny = (dy / dist) * clampDist;
        this.joyThumb.setPosition(this.joyBase.x + nx, this.joyBase.y + ny);
        // Normalize to -1..1
        this.touchDirX = nx / maxDist;
        this.touchDirY = ny / maxDist;
      }
    });

    const resetJoy = (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.joyPointerId) return;
      this.joyActive = false;
      this.joyPointerId = -1;
      this.touchDirX = 0;
      this.touchDirY = 0;
      this.joyThumb.setPosition(this.joyBase.x, this.joyBase.y);
      this.joyBase.setAlpha(0.4);
    };

    this.input.on('pointerup', resetJoy);
    this.input.on('pointerout', resetJoy);

    // Enable multi-touch
    this.input.addPointer(2);
  }

  // ── HUD (all scrollFactor 0, native 1600×900) ──
  private createHUD() {
    const depth = 100;

    // --- Minimap (pixel art border) ---
    const mm = HUD.minimap;
    const mmBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    mmBg.fillStyle(COLORS.minimapBg, 0.9);
    mmBg.fillRect(mm.x, mm.y, mm.w, mm.h);
    mmBg.lineStyle(3, COLORS.border, 0.9);
    mmBg.strokeRect(mm.x, mm.y, mm.w, mm.h);
    mmBg.lineStyle(2, COLORS.borderLight, 0.3);
    mmBg.strokeRect(mm.x + 3, mm.y + 3, mm.w - 6, mm.h - 6);

    this.minimapGfx = this.add.graphics().setScrollFactor(0).setDepth(depth + 1);

    // --- Status bar (pixel border) ---
    const stBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    stBg.fillStyle(COLORS.panel, 0.85);
    stBg.fillRect(HUD.status.x, HUD.status.y, 480, 44);
    stBg.lineStyle(3, COLORS.border, 0.7);
    stBg.strokeRect(HUD.status.x, HUD.status.y, 480, 44);

    this.statusText = this.add.text(HUD.status.x + 12, HUD.status.y + 8,
      `Cycle: 0/${this.maxCycle}  |  IDLE`, {
        fontSize: '16px', color: '#00d2ff', fontFamily: FONT, fontStyle: 'bold',
      }).setScrollFactor(0).setDepth(depth + 1);

    this.phaseText = this.add.text(HUD.status.x + 360, HUD.status.y + 8, '', {
      fontSize: '16px', color: '#e0e0e0', fontFamily: FONT,
    }).setScrollFactor(0).setDepth(depth + 1);

    // --- Timeline bar (pixel border) ---
    const tl = HUD.timeline;
    const tlBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    tlBg.fillStyle(COLORS.panel, 0.9);
    tlBg.fillRect(tl.x - 12, tl.y - 6, tl.w + 24, tl.h + 16);
    tlBg.lineStyle(3, COLORS.border, 0.6);
    tlBg.strokeRect(tl.x - 12, tl.y - 6, tl.w + 24, tl.h + 16);

    this.timelineBg = this.add.graphics().setScrollFactor(0).setDepth(depth + 1);
    this.drawTimelinePhases();

    this.timelineCursor = this.add.rectangle(tl.x, tl.y - 2, 3, tl.h + 4, 0xffffff)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(depth + 2);

    this.cycleText = this.add.text(tl.x, tl.y + tl.h + 4, `0/${this.maxCycle}`, {
      fontSize: '14px', color: '#00d2ff', fontFamily: FONT,
    }).setScrollFactor(0).setDepth(depth + 1);

    this.speedText = this.add.text(tl.x + tl.w - 200, tl.y + tl.h + 4,
      `${this.cyclesPerSecond} cyc/s`, {
        fontSize: '14px', color: '#888', fontFamily: FONT,
      }).setScrollFactor(0).setDepth(depth + 1);

    // --- Controls hint ---
    this.controlHints = this.add.text(HUD.controls.x, HUD.controls.y,
      'WASD=이동  E=조사  Space=▶  R=reuse  +/-=속도  Esc=닫기', {
        fontSize: '14px', color: '#555', fontFamily: FONT,
      }).setScrollFactor(0).setDepth(depth + 1);

    // --- Interaction prompt (centered bottom) ---
    this.promptText = this.add.text(HUD.screenW / 2, HUD.screenH - 100, '', {
      fontSize: '22px', color: '#ffd700', fontFamily: FONT, fontStyle: 'bold',
      backgroundColor: '#0a0e1acc', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2).setVisible(false);

    // --- Inspector panel (centered overlay) ---
    this.inspectorBg = this.add.graphics().setScrollFactor(0).setDepth(depth);
    this.inspectorBg.setVisible(false);

    for (let i = 0; i < 24; i++) {
      const t = this.add.text(0, 0, '', {
        fontSize: '18px', color: '#e0e0e0', fontFamily: FONT,
        wordWrap: { width: HUD.inspector.w - 64 },
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
    // Dim overlay behind panel
    this.inspectorBg.fillStyle(0x000000, 0.4);
    this.inspectorBg.fillRect(0, 0, HUD.screenW, HUD.screenH);
    // Pixel art panel: sharp corners, double border
    this.inspectorBg.fillStyle(COLORS.panel, 0.97);
    this.inspectorBg.fillRect(x, y, w, h);
    this.inspectorBg.lineStyle(4, COLORS.border, 1);
    this.inspectorBg.strokeRect(x, y, w, h);
    this.inspectorBg.lineStyle(2, COLORS.borderLight, 0.4);
    this.inspectorBg.strokeRect(x + 4, y + 4, w - 8, h - 8);
    // Gold top accent
    this.inspectorBg.fillStyle(COLORS.gold, 0.9);
    this.inspectorBg.fillRect(x + 6, y + 2, w - 12, 4);
    this.inspectorBg.setVisible(true);

    let line = 0;
    const lineH = 34;
    const set = (text: string, color = '#e0e0e0', size = '20px', bold = false) => {
      if (line < this.inspectorTexts.length) {
        const t = this.inspectorTexts[line];
        t.setText(text).setColor(color).setFontSize(parseInt(size));
        t.setFontStyle(bold ? 'bold' : 'normal');
        t.setPosition(x + 32, y + 36 + line * lineH);
        t.setVisible(true);
        line++;
      }
    };

    set(`${info.icon}  ${info.title}`, '#ffd700', '28px', true);
    set(info.subtitle, '#888888', '20px');
    set(info.category, '#00d2ff', '18px');
    set('─'.repeat(24), '#444');

    for (const s of info.stats) {
      set(`${s.label.padEnd(18)} ${s.value}`, s.color ?? '#e0e0e0');
    }

    set('─'.repeat(24), '#444');
    for (const d of info.description) {
      set(d, '#aaaaaa', '18px');
    }

    set('', '#000');
    set('[E] 또는 [Esc] 닫기', '#666666', '18px');

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
    const pw = 20, ph = 28;
    // Building collision
    for (const bObj of this.buildingMap.values()) {
      if (bObj.def.canEnter) continue;
      const d = bObj.def;
      if (nx + pw > d.x && nx - pw < d.x + d.w &&
          ny + ph > d.y && ny - ph < d.y + d.h) {
        return false;
      }
    }
    // Wall collision
    for (const wall of this.wallColliders) {
      if (nx + pw > wall.x && nx - pw < wall.x + wall.w &&
          ny + ph > wall.y && ny - ph < wall.y + wall.h) {
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

    // Mobile joystick input
    if (this.isMobile && (Math.abs(this.touchDirX) > 0.15 || Math.abs(this.touchDirY) > 0.15)) {
      dx += this.touchDirX;
      dy += this.touchDirY;
    }

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
    let closestBuilding: BuildingObj | null = null;
    let closestBDist = WORLD.interactDist;
    let closestWorker: WorkerObj | null = null;
    let closestWDist = WORLD.interactDist * 0.7; // Workers have tighter range

    // Check buildings
    for (const bObj of this.buildingMap.values()) {
      const d = bObj.def;
      const cx = Math.max(d.x, Math.min(this.player.x, d.x + d.w));
      const cy = Math.max(d.y, Math.min(this.player.y, d.y + d.h));
      const dist = Math.sqrt((this.player.x - cx) ** 2 + (this.player.y - cy) ** 2);
      if (dist < closestBDist) { closestBDist = dist; closestBuilding = bObj; }
    }

    // Check workers (prioritize over buildings)
    for (const wObj of this.workerObjs) {
      const dx = this.player.x - wObj.container.x;
      const dy = this.player.y - wObj.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestWDist) { closestWDist = dist; closestWorker = wObj; }
    }

    // Update building glows
    if (this.nearbyBuilding && this.nearbyBuilding !== closestBuilding) {
      this.nearbyBuilding.border.setStrokeStyle(3, COLORS.buildingBorder, 0.6);
      this.nearbyBuilding.glowing = false;
    }
    this.nearbyBuilding = closestBuilding;

    // Update worker glow
    if (this.nearbyWorker && this.nearbyWorker !== closestWorker) {
      this.nearbyWorker.nameTag.setColor('#cccccc');
    }
    this.nearbyWorker = closestWorker;

    // Prompt display: prefer worker if close
    if (!this.inspectorOpen) {
      if (closestWorker) {
        closestWorker.nameTag.setColor('#ffd700');
        this.promptText.setText(`[E] ${closestWorker.def.name} (${closestWorker.def.role})`);
        this.promptText.setVisible(true);
        // Still glow building
        if (closestBuilding) {
          closestBuilding.border.setStrokeStyle(3, COLORS.buildingNear, 0.9);
          closestBuilding.glowing = true;
        }
      } else if (closestBuilding) {
        closestBuilding.border.setStrokeStyle(3, COLORS.buildingNear, 0.9);
        closestBuilding.glowing = true;
        this.promptText.setText(`[E] ${closestBuilding.def.label} 조사하기`);
        this.promptText.setVisible(true);
      } else {
        this.promptText.setVisible(false);
      }
    }

    // E key interaction (keyboard or touch)
    const ePressed = Phaser.Input.Keyboard.JustDown(this.keyE) || this.touchEPressed;
    this.touchEPressed = false;
    if (ePressed) {
      if (this.inspectorOpen) {
        this.hideInspector();
        this.promptText.setVisible(!!(this.nearbyBuilding || this.nearbyWorker));
      } else if (closestWorker) {
        // Worker interaction — show worker detail
        const info = getWorkerInfo(closestWorker.def.id);
        if (info) {
          this.showInspector(info);
          this.promptText.setText(`[E] 닫기  |  ${closestWorker.def.name}`);
        }
      } else if (closestBuilding) {
        const def = closestBuilding.def;
        let entityId = def.entityId;
        if (def.entityType === 'fsm') entityId = this.getCurrentFSMState();
        const info = getEntityInfo(def.entityType, entityId);
        if (info) {
          this.showInspector(info);
          closestBuilding.border.setStrokeStyle(3, COLORS.buildingSelected, 1);
          this.promptText.setText(`[E] 닫기  |  ${closestBuilding.def.label}`);
        }
      }
    }

    // Esc
    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      if (this.inspectorOpen) this.hideInspector();
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

      // Phase-triggered material flow spawning
      const phase = this.phases.find(p => this.cycle >= p.start && this.cycle < p.start + p.duration);
      const phaseName = phase?.name ?? 'done';

      if (phaseName !== this.prevPhaseName) {
        this.onPhaseChange(phaseName);
        this.prevPhaseName = phaseName;
      }

      // Spawn office flow once when play starts
      if (!this.officeFlowSpawned) {
        this.officeFlowSpawned = true;
        this.spawnFlowWithEffects('host_to_compiler', 0.12);
        this.time.delayedCall(1500, () => this.spawnFlowWithEffects('trace_to_ir', 0.15));
        this.time.delayedCall(3000, () => this.spawnFlowWithEffects('ir_to_lower', 0.15));
        this.time.delayedCall(4500, () => this.spawnFlowWithEffects('lower_to_sched', 0.12));
        this.time.delayedCall(6000, () => this.spawnFlowWithEffects('sched_to_emit', 0.15));
        this.time.delayedCall(7500, () => this.spawnFlowWithEffects('emit_to_bridge', 0.15));
        this.time.delayedCall(9000, () => this.spawnFlowWithEffects('bridge_to_fsm', 0.10));
      }
    }

    // Update building flash timers
    for (const [bid, timer] of this.buildingFlashTimers) {
      const remaining = timer - delta;
      if (remaining <= 0) {
        this.buildingFlashTimers.delete(bid);
        const bObj = this.buildingMap.get(bid);
        if (bObj) bObj.border.setStrokeStyle(3, COLORS.buildingBorder, 0.6);
      } else {
        this.buildingFlashTimers.set(bid, remaining);
      }
    }
  }

  // ── Phase change handler — spawn material particles ──
  private onPhaseChange(phaseName: string) {
    const spd = 0.18;
    switch (phaseName) {
      case 'dma_weight':
        this.spawnFlowWithEffects('fsm_to_dma', spd);
        this.spawnFlowWithEffects('dram_to_dma', 0.10);
        this.time.delayedCall(800, () => this.spawnFlowWithEffects('dma_to_wt', spd));
        break;
      case 'dma_act':
        this.spawnFlowWithEffects('dma_to_act', spd);
        break;
      case 'preload':
        this.spawnFlowWithEffects('wt_to_oven', 0.14);
        break;
      case 'execute':
        this.spawnFlowWithEffects('act_to_prep', spd);
        this.time.delayedCall(600, () => this.spawnFlowWithEffects('prep_to_oven', spd));
        break;
      case 'flush':
        this.spawnFlowWithEffects('oven_to_store', 0.14);
        break;
      case 'drain':
        this.spawnFlowWithEffects('store_to_qc', 0.08);
        break;
    }
  }

  // ── Spawn particle with label + building flash ──
  private spawnFlowWithEffects(routeId: string, speed: number) {
    const id = this.spawnMaterialParticle(routeId, speed);
    if (id < 0) return;

    // Flash the source building
    const route = FLOW_ROUTES.find(r => r.id === routeId);
    if (route) {
      this.flashBuilding(route.from, 0x00ff88);
    }
  }

  private flashBuilding(buildingId: string, color: number) {
    const bObj = this.buildingMap.get(buildingId);
    if (!bObj) return;
    bObj.border.setStrokeStyle(4, color, 1);
    this.buildingFlashTimers.set(buildingId, 600);
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
    this.fsmLabel.setText(`관제: ${fsmState}`);

    // SRAM
    this.sramRects.forEach((rect, i) => {
      const isDMA = phaseName === 'dma_weight' || phaseName === 'dma_act';
      const isGroupA = i < 2;
      if (isDMA && isGroupA) rect.setFillStyle(COLORS.dma, 0.7);
      else if (phaseName === 'execute' && !isGroupA) rect.setFillStyle(COLORS.sramActive, 0.7);
      else rect.setFillStyle(COLORS.sram, 0.7);
    });

    // SRAM fill gauges
    if (phase) {
      const progress = (this.cycle - phase.start) / phase.duration;
      this.sramGauges.forEach((gauge, i) => {
        const bObj = this.buildingMap.get(['sram0', 'sram1', 'sram2', 'sram3'][i]);
        if (!bObj) return;
        const maxW = bObj.def.w - 40;
        let fill = 0;
        let color = 0xf39c12;

        if (i < 2 && phaseName === 'dma_weight') {
          fill = progress; color = 0xf39c12; // weight loading
        } else if (i >= 2 && phaseName === 'dma_act') {
          fill = progress; color = 0x2ecc71; // activation loading
        } else if (i < 2 && (phaseName === 'preload' || phaseName === 'execute')) {
          fill = Math.max(0, 1 - progress); color = 0xf39c12; // weight draining
        } else if (i >= 2 && phaseName === 'execute') {
          fill = Math.max(0, 1 - progress); color = 0x2ecc71; // activation draining
        } else if (phaseName === 'dma_act' && i < 2) {
          fill = 1; color = 0xf39c12; // weight stays full
        }

        gauge.setDisplaySize(maxW * fill, 12);
        gauge.setFillStyle(color, 0.8);
      });
    }

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
        let stroke = COLORS.borderLight;
        let strokeAlpha = 0.2;

        if (phaseName === 'preload') {
          const row = phase ? this.cycle - phase.start : 0;
          if (r <= row) { color = COLORS.peWeight; alpha = 0.9; stroke = 0xf39c12; strokeAlpha = 0.5; }
        } else if (phaseName === 'execute') {
          const cyc = phase ? this.cycle - phase.start : 0;
          const waveFront = r + c;
          if (cyc >= waveFront) {
            // Active computation — pulse effect
            const since = cyc - waveFront;
            const pulse = 0.85 + 0.15 * Math.sin(since * 0.8);
            color = COLORS.peActive; alpha = pulse;
            stroke = 0x2ecc71; strokeAlpha = 0.6;
          } else if (cyc >= r) {
            color = COLORS.peWeight; alpha = 0.7;
          }
        } else if (phaseName === 'flush') {
          const cyc = phase ? this.cycle - phase.start : 0;
          const pe_t = r + c;
          const since = (size - 1) + cyc - pe_t;
          if (since > 0) {
            // Psum draining — blue wave
            const fade = Math.max(0.3, 1 - since / FACTORY.FLUSH_CYCLES);
            color = 0x3498db; alpha = fade;
            stroke = 0x3498db; strokeAlpha = fade * 0.5;
          } else { color = COLORS.peActive; alpha = 0.8; }
        } else if (phaseName === 'drain') {
          const row = phase ? this.cycle - phase.start : 0;
          if (r <= row) {
            // Row-by-row drain — green to teal transition
            const progress = (row - r) / size;
            color = progress > 0.5 ? 0x16a085 : 0x1abc9c;
            alpha = 0.5 + 0.3 * (1 - progress);
            stroke = 0x1abc9c; strokeAlpha = 0.4;
          }
        }

        this.peRects[r][c].setFillStyle(color, alpha);
        this.peRects[r][c].setStrokeStyle(2, stroke, strokeAlpha);
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

    // Worker dots
    this.minimapGfx.fillStyle(0xffaa44, 0.7);
    for (const w of this.workerObjs) {
      this.minimapGfx.fillCircle(ox + w.container.x * scaleX, oy + w.container.y * scaleY, 1.5);
    }

    // Camera viewport
    const cam = this.cameras.main;
    this.minimapGfx.lineStyle(1, 0xffffff, 0.6);
    this.minimapGfx.strokeRect(
      ox + cam.scrollX * scaleX, oy + cam.scrollY * scaleY,
      cam.width * scaleX, cam.height * scaleY,
    );
  }

  // ── Material Flow System ──

  /** Pre-generate all material textures and create particle group */
  private initFlowSystem() {
    for (const mat of Object.values(MATERIALS)) {
      generateMaterialTexture(this, mat.id, mat.color, mat.size);
    }
  }

  /**
   * Spawn a material particle along a named flow route.
   * Returns the particle ID, or -1 if route not found.
   */
  spawnMaterialParticle(routeId: string, speed = 0.25): number {
    const route = FLOW_ROUTES.find(r => r.id === routeId);
    if (!route) return -1;

    const mat = MATERIALS[route.material];
    if (!mat) return -1;

    const id = this.flowNextId++;
    const particle: MaterialParticle = {
      id,
      routeId,
      materialId: route.material,
      progress: 0,
      speed,
      active: true,
    };
    this.flowParticles.push(particle);

    // Create visual: material icon + small colored sprite + label
    const pos = interpolateRoute(route.waypoints, 0, WORLD.S);
    const img = this.add.image(0, 0, `mat_${mat.id}`);
    const icon = this.add.text(0, -14, mat.icon, { fontSize: '16px' }).setOrigin(0.5);
    const labelTxt = this.add.text(0, 16, route.label, {
      fontSize: '14px', color: '#ffffff', fontFamily: FONT,
      backgroundColor: '#00000088', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setAlpha(0.9);
    const container = this.add.container(pos.x, pos.y, [img, icon, labelTxt]);
    container.setDepth(9);
    container.setAlpha(0.85);
    this.flowSprites.set(id, container);

    return id;
  }

  /** Remove a material particle by ID */
  private despawnMaterialParticle(id: number) {
    const idx = this.flowParticles.findIndex(p => p.id === id);
    if (idx >= 0) this.flowParticles.splice(idx, 1);
    const container = this.flowSprites.get(id);
    if (container) {
      container.destroy();
      this.flowSprites.delete(id);
    }
  }

  /** Advance all active material particles along their routes */
  private updateMaterialFlow(delta: number) {
    const toRemove: number[] = [];
    for (const particle of this.flowParticles) {
      if (!particle.active) continue;

      particle.progress += particle.speed * (delta / 1000);
      if (particle.progress >= 1) {
        particle.active = false;
        // Flash destination building
        const route = FLOW_ROUTES.find(r => r.id === particle.routeId);
        if (route) this.flashBuilding(route.to, 0x00aaff);
        toRemove.push(particle.id);
        continue;
      }

      const route = FLOW_ROUTES.find(r => r.id === particle.routeId);
      if (!route) continue;

      const pos = interpolateRoute(route.waypoints, particle.progress, WORLD.S);
      const container = this.flowSprites.get(particle.id);
      if (container) {
        container.setPosition(pos.x, pos.y);
      }
    }

    for (const id of toRemove) {
      this.despawnMaterialParticle(id);
    }
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
    this.updateWorkers(delta);
    this.checkProximity();
    this.updateAnimation(delta);
    this.updateBuildingVisuals();
    this.updatePEVisuals();
    this.updateMaterialFlow(delta);
    this.updateHUD();
  }
}
