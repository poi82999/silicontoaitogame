// ─── Material Flow Data & Systems ──────────────────────────────
//
// Defines: material types, flow routes between buildings,
// factory zone boundaries, wall segments, entrance data,
// and a particle interpolation helper for flow visualization.
//
// All coordinates are UNSCALED (×WORLD.S at render time).
// ───────────────────────────────────────────────────────────────

// ─── Material Types ────────────────────────────────────────────

export interface MaterialDef {
  id: string;
  name: string;
  icon: string;
  color: number;
  /** Sprite size in pixels */
  size: number;
}

export const MATERIALS: Record<string, MaterialDef> = {
  recipe:     { id: 'recipe',     name: '레시피(IR)',       icon: '📋', color: 0x5dade2, size: 16 },
  cut_plan:   { id: 'cut_plan',   name: '절단계획',         icon: '✂️', color: 0xf39c12, size: 16 },
  work_order: { id: 'work_order', name: '작업지시서',       icon: '📦', color: 0x2ecc71, size: 18 },
  hw_package: { id: 'hw_package', name: 'HW패키지',        icon: '🚚', color: 0xe67e22, size: 18 },
  weight:     { id: 'weight',     name: '양념(weight)',     icon: '🧂', color: 0xf39c12, size: 14 },
  activation: { id: 'activation', name: '재료(activation)', icon: '🥬', color: 0x2ecc71, size: 14 },
  psum:       { id: 'psum',       name: '반조리품(psum)',   icon: '🍳', color: 0x3498db, size: 14 },
  result:     { id: 'result',     name: '완제품',           icon: '🍱', color: 0x9b59b6, size: 18 },
};

// ─── Flow Routes ───────────────────────────────────────────────

export interface FlowRoute {
  id: string;
  from: string;
  to: string;
  material: string;
  /** Waypoints in UNSCALED coords */
  waypoints: { x: number; y: number }[];
  label: string;
}

export const FLOW_ROUTES: FlowRoute[] = [
  // ── SW compile flow (사무동) ── road y=205 (row1 H corridor)
  { id: 'trace_to_ir',    from: 'tracer',   to: 'ir',
    material: 'recipe',     waypoints: [{x:510,y:125},{x:510,y:205},{x:560,y:205},{x:560,y:125}],
    label: '레시피 전달' },
  { id: 'ir_to_lower',    from: 'ir',       to: 'lowering',
    material: 'recipe',     waypoints: [{x:760,y:125},{x:760,y:205},{x:780,y:205},{x:780,y:125}],
    label: 'IR → 절단' },
  { id: 'lower_to_sched', from: 'lowering', to: 'scheduler',
    material: 'cut_plan',   waypoints: [{x:880,y:185},{x:860,y:205},{x:860,y:400},{x:300,y:400},{x:300,y:260}],
    label: '절단계획' },
  { id: 'sched_to_emit',  from: 'scheduler',to: 'emitter',
    material: 'work_order', waypoints: [{x:300,y:380},{x:300,y:400},{x:530,y:400},{x:530,y:380}],
    label: '지시서 포장' },
  { id: 'emit_to_bridge', from: 'emitter',  to: 'replay_bridge',
    material: 'hw_package', waypoints: [{x:530,y:380},{x:530,y:400},{x:760,y:400},{x:760,y:380}],
    label: 'HW패키지 변환' },

  // ── Office → Factory entrance ── gate spine x=535
  { id: 'bridge_to_fsm',  from: 'replay_bridge', to: 'fsm',
    material: 'hw_package', waypoints: [{x:760,y:380},{x:760,y:400},{x:535,y:400},{x:535,y:535},{x:535,y:720},{x:255,y:720},{x:255,y:695}],
    label: '공장 투입' },

  // ── Factory internal flow (HW) ── road y=720 (control H corridor)
  { id: 'fsm_to_dma',     from: 'fsm',   to: 'dma',
    material: 'work_order', waypoints: [{x:440,y:630},{x:440,y:720},{x:570,y:720},{x:570,y:630}],
    label: '관제 명령' },
  { id: 'dma_to_wt',      from: 'dma',   to: 'sram0',
    material: 'weight',     waypoints: [{x:710,y:695},{x:710,y:720},{x:170,y:720},{x:170,y:770}],
    label: '양념 적재' },
  { id: 'dma_to_act',     from: 'dma',   to: 'sram2',
    material: 'activation', waypoints: [{x:710,y:695},{x:710,y:720},{x:670,y:720},{x:670,y:770}],
    label: '재료 적재' },
  { id: 'wt_to_oven',     from: 'sram0', to: 'pe_grid',
    material: 'weight',     waypoints: [{x:170,y:910},{x:170,y:940},{x:535,y:940},{x:535,y:1100}],
    label: '양념 → 오븐' },
  { id: 'act_to_prep',    from: 'sram2', to: 'conveyor',
    material: 'activation', waypoints: [{x:670,y:910},{x:670,y:940},{x:535,y:940},{x:535,y:985}],
    label: '재료 → 전처리' },
  { id: 'prep_to_oven',   from: 'conveyor', to: 'pe_grid',
    material: 'activation', waypoints: [{x:100,y:1010},{x:80,y:1010},{x:80,y:1100}],
    label: '전처리 → 오븐' },
  { id: 'oven_to_store',  from: 'pe_grid', to: 'accum',
    material: 'psum',       waypoints: [{x:430,y:1800},{x:535,y:1800},{x:535,y:1860},{x:400,y:1860}],
    label: '반조리 → 보관' },

  // ── Factory → QC ── spine x=535 up to H connector y=705 → QC corridor x=1240
  { id: 'store_to_qc',    from: 'accum', to: 'core_replay',
    material: 'result',     waypoints: [{x:680,y:1925},{x:535,y:1925},{x:535,y:705},{x:1240,y:705},{x:1240,y:615}],
    label: '완제품 → 검사' },

  // ── External routes ── DRAM road y=2150, spine x=535
  { id: 'dram_to_dma',    from: 'dram', to: 'dma',
    material: 'activation', waypoints: [{x:370,y:2160},{x:535,y:2150},{x:535,y:720},{x:710,y:720},{x:710,y:695}],
    label: 'DRAM → 하역장' },
  { id: 'host_to_compiler', from: 'host', to: 'compiler',
    material: 'recipe',     waypoints: [{x:1200,y:150},{x:990,y:150},{x:990,y:205},{x:190,y:205},{x:190,y:125}],
    label: '호스트 → 공장장' },
];

// ─── Factory Zones ─────────────────────────────────────────────

export interface FactoryZone {
  id: string;
  label: string;
  x: number; y: number; w: number; h: number;
  floorColor: number;
  wallColor: number;
}

export const FACTORY_ZONES: FactoryZone[] = [
  { id: 'office',  label: '🏢 사무동',
    x: 60,   y: 40,  w: 960,  h: 400,
    floorColor: 0x252540, wallColor: 0x3a3a55 },
  { id: 'factory', label: '🏭 도시락 공장',
    x: 40,   y: 530, w: 1060, h: 1550,
    floorColor: 0x1a1a2c, wallColor: 0x4a4a65 },
  { id: 'qc',      label: '🔍 품질검사동',
    x: 1200, y: 530, w: 450,  h: 1000,
    floorColor: 0x182838, wallColor: 0x2a4a60 },
];

// ─── Wall Segments ─────────────────────────────────────────────
// Each entry is [x, y, w, h] in unscaled coords.
// Entrances are gaps where no wall segment exists.

export const WALL_SEGMENTS: [number, number, number, number][] = [
  // ── Office campus ──
  [60,   40,  960, 8],         // top
  [60,   40,  8,   400],       // left
  [1012, 40,  8,   400],       // right
  [60,   432, 390, 8],         // bottom-left  (entrance gap x:450~620)
  [620,  432, 400, 8],         // bottom-right

  // ── Factory main ──
  [40,   530, 410, 8],         // top-left     (entrance gap x:450~620)
  [620,  530, 480, 8],         // top-right
  [40,   530, 8,   1550],      // left
  [1092, 530, 8,   100],       // right-above  (exit gap y:630~770)
  [1092, 770, 8,   1310],      // right-below
  [40,   2072, 410, 8],        // bottom-left  (exit gap x:450~620)
  [620,  2072, 480, 8],        // bottom-right

  // ── QC building ──
  [1200, 530, 450, 8],         // top
  [1200, 530, 8,   100],       // left-above   (entrance gap y:630~770)
  [1200, 770, 8,   760],       // left-below
  [1642, 530, 8,   1000],      // right
  [1200, 1522, 450, 8],        // bottom
];

// ─── Entrance Decorations ──────────────────────────────────────

export interface Entrance {
  id: string;
  /** Entrance floor fill area (unscaled) */
  x: number; y: number; w: number; h: number;
  label: string;
  labelX: number; labelY: number;
  /** Gate pillar rectangles (unscaled) */
  pillars: { x: number; y: number; w: number; h: number }[];
}

export const ENTRANCES: Entrance[] = [
  {
    id: 'office_to_factory',
    x: 450, y: 432, w: 170, h: 106,
    label: '▼ 공장 입구',
    labelX: 470, labelY: 420,
    pillars: [
      { x: 442, y: 428, w: 10, h: 114 },
      { x: 618, y: 428, w: 10, h: 114 },
    ],
  },
  {
    id: 'factory_to_qc',
    x: 1092, y: 630, w: 116, h: 140,
    label: '→ 검사동',
    labelX: 1110, labelY: 690,
    pillars: [
      { x: 1090, y: 622, w: 120, h: 10 },
      { x: 1090, y: 768, w: 120, h: 10 },
    ],
  },
  {
    id: 'factory_to_external',
    x: 450, y: 2072, w: 170, h: 30,
    label: '▼ 외부 출입구',
    labelX: 470, labelY: 2058,
    pillars: [
      { x: 442, y: 2068, w: 10, h: 38 },
      { x: 618, y: 2068, w: 10, h: 38 },
    ],
  },
];

// ─── Material Particle ─────────────────────────────────────────

export interface MaterialParticle {
  id: number;
  routeId: string;
  materialId: string;
  /** Progress along route: 0 = start, 1 = end */
  progress: number;
  /** Speed: progress-per-second (e.g. 0.3 = traverse in ~3.3s) */
  speed: number;
  active: boolean;
}

/**
 * Interpolate world position along a route's waypoints.
 * @param waypoints Unscaled waypoint coordinates
 * @param progress  0 ~ 1
 * @param scale     WORLD.S
 * @returns Scaled world position { x, y }
 */
export function interpolateRoute(
  waypoints: { x: number; y: number }[],
  progress: number,
  scale: number,
): { x: number; y: number } {
  if (waypoints.length < 2) {
    const p = waypoints[0] ?? { x: 0, y: 0 };
    return { x: p.x * scale, y: p.y * scale };
  }

  const t = Math.max(0, Math.min(1, progress));

  // Compute segment lengths
  let totalLen = 0;
  const segLens: number[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dx = waypoints[i + 1].x - waypoints[i].x;
    const dy = waypoints[i + 1].y - waypoints[i].y;
    segLens.push(Math.sqrt(dx * dx + dy * dy));
    totalLen += segLens[i];
  }
  if (totalLen === 0) {
    const p = waypoints[0];
    return { x: p.x * scale, y: p.y * scale };
  }

  const targetDist = t * totalLen;
  let accum = 0;
  for (let i = 0; i < segLens.length; i++) {
    if (accum + segLens[i] >= targetDist || i === segLens.length - 1) {
      const frac = segLens[i] > 0 ? (targetDist - accum) / segLens[i] : 0;
      const x = waypoints[i].x + (waypoints[i + 1].x - waypoints[i].x) * frac;
      const y = waypoints[i].y + (waypoints[i + 1].y - waypoints[i].y) * frac;
      return { x: x * scale, y: y * scale };
    }
    accum += segLens[i];
  }

  const last = waypoints[waypoints.length - 1];
  return { x: last.x * scale, y: last.y * scale };
}
