import config from './factory_config.json';

export type FactoryConfig = typeof config;
export const FACTORY = config;

// ── Derived timing constants ──
export const DMA_WEIGHT_CYCLES = FACTORY.TILE_SIZE + FACTORY.DMA_OVERHEAD_CYCLES; // 17
export const DMA_ACT_CYCLES = FACTORY.TILE_SIZE + FACTORY.DMA_OVERHEAD_CYCLES;    // 17

/** Timeline phases for one tile production (no weight reuse) */
export interface TilePhase {
  name: string;
  label: string;
  start: number;
  duration: number;
  color: number;
}

export function buildTileTimeline(weightReuse: boolean): TilePhase[] {
  let t = 0;
  const phases: TilePhase[] = [];

  const push = (name: string, label: string, duration: number, color: number) => {
    phases.push({ name, label, start: t, duration, color });
    t += duration;
  };

  if (!weightReuse) {
    push('dma_weight', 'DMA Weight', DMA_WEIGHT_CYCLES, 0xf39c12);
  }
  push('dma_act', 'DMA Activation', DMA_ACT_CYCLES, 0xe74c3c);
  push('bank_swap', 'Bank Swap', FACTORY.BANK_SWAP_CYCLES, 0x9b59b6);
  if (!weightReuse) {
    push('preload', 'Weight Preload', FACTORY.WEIGHT_PRELOAD_CYCLES, 0xf1c40f);
  }
  push('execute', 'Execute', FACTORY.TILE_SIZE, 0x2ecc71);
  push('flush', 'Flush', FACTORY.FLUSH_CYCLES, 0x3498db);
  push('drain', 'Drain', FACTORY.TILE_SIZE * FACTORY.DRAIN_CYCLES_PER_ROW, 0x1abc9c);

  return phases;
}

export function totalCycles(phases: TilePhase[]): number {
  const last = phases[phases.length - 1];
  return last.start + last.duration;
}
