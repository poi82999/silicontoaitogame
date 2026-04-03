import Phaser from 'phaser';

// ─── Worker Sprite Types ───────────────────────────────────────

/** Visual costume type for NPCs, based on their work zone */
export type SpriteType =
  | 'chef'       // 오븐/전처리대 — white uniform, tall toque
  | 'office'     // 사무동 — suit & tie
  | 'inspector'  // 품질검사동 — vest & hard hat
  | 'driver'     // 하역장 — cap & cargo vest
  | 'storage'    // 냉장고/보관소 — thick jacket & beanie
  | 'control';   // 관제탑 — headset & uniform

/** Map building ID → sprite costume type */
export function getSpriteType(buildingId: string): SpriteType {
  switch (buildingId) {
    case 'compiler': case 'tracer': case 'ir':
    case 'lowering': case 'scheduler': case 'emitter':
    case 'replay_bridge':
      return 'office';
    case 'pe_grid': case 'conveyor':
      return 'chef';
    case 'dma':
      return 'driver';
    case 'fsm':
      return 'control';
    case 'sram0': case 'sram1': case 'sram2': case 'sram3':
    case 'accum':
      return 'storage';
    default: // QC buildings
      return 'inspector';
  }
}

// ─── Texture Generators ────────────────────────────────────────

/**
 * Generate a themed pixel-art worker texture.
 * Each SpriteType gets a unique costume silhouette.
 * Returns the Phaser texture key.
 */
export function generateWorkerTexture(
  scene: Phaser.Scene,
  type: SpriteType,
  bodyColor: number,
  hatColor: number,
): string {
  const key = `wk_${type}_${bodyColor.toString(16)}_${hatColor.toString(16)}`;
  if (scene.textures.exists(key)) return key;

  const g = scene.make.graphics();
  const px = 4;

  // ── Common base ──
  g.fillStyle(0x000000, 0.25);
  g.fillRect(4, 52, 40, 8);           // shadow
  g.fillStyle(0x2c3e50);
  g.fillRect(12, 44, px * 2, px * 3); // left leg
  g.fillRect(28, 44, px * 2, px * 3); // right leg
  g.fillStyle(bodyColor);
  g.fillRect(8, 24, 32, 24);          // body

  // ── Type-specific costume ──
  switch (type) {
    case 'chef':
      g.fillStyle(0xffffff, 0.35);
      g.fillRect(14, 28, 20, 14);       // apron
      g.fillStyle(hatColor);
      g.fillRect(8, -6, 32, 30);        // tall toque base
      g.fillStyle(0xffffff, 0.6);
      g.fillRect(12, -6, 24, 10);       // toque poof
      g.fillRect(4, 20, 40, px);        // hat band
      break;

    case 'office':
      g.fillStyle(0x3498db);
      g.fillRect(22, 26, px, 14);       // tie
      g.fillStyle(0xecf0f1);
      g.fillRect(16, 24, 16, 3);        // collar
      g.fillStyle(hatColor);
      g.fillRect(8, 0, 32, 20);         // hair
      g.fillStyle(hatColor, 0.7);
      g.fillRect(4, 16, 40, px * 2);    // hair sides
      break;

    case 'inspector':
      g.fillStyle(0x27ae60, 0.7);
      g.fillRect(8, 28, 4, 14);         // left vest stripe
      g.fillRect(36, 28, 4, 14);        // right vest stripe
      g.fillStyle(0xf1c40f);
      g.fillRect(4, 0, 40, 20);         // yellow hard hat
      g.fillStyle(0xd4a017);
      g.fillRect(0, 16, 48, px * 2);    // hat brim
      break;

    case 'driver':
      g.fillStyle(0xf39c12, 0.4);
      g.fillRect(10, 32, 8, 8);         // left pocket
      g.fillRect(30, 32, 8, 8);         // right pocket
      g.fillStyle(hatColor);
      g.fillRect(4, 4, 40, 16);         // cap
      g.fillStyle(hatColor, 0.5);
      g.fillRect(0, 16, 48, px);        // cap brim
      break;

    case 'storage':
      g.fillStyle(bodyColor, 0.6);
      g.fillRect(4, 24, 40, 24);        // thick cold-storage jacket
      g.fillStyle(hatColor);
      g.fillRect(8, 2, 32, 18);         // beanie
      g.fillStyle(0x2ecc71, 0.5);
      g.fillRect(8, 14, 32, 3);         // beanie stripe
      break;

    case 'control':
      g.fillStyle(0x8e44ad, 0.6);
      g.fillRect(0, 8, 4, 10);          // left headset ear
      g.fillRect(44, 8, 4, 10);         // right headset ear
      g.fillStyle(0x8e44ad, 0.4);
      g.fillRect(4, 0, 40, 4);          // headband
      g.fillStyle(hatColor);
      g.fillRect(8, 2, 32, 18);         // hair/head
      g.fillStyle(hatColor, 0.7);
      g.fillRect(4, 16, 40, px * 2);    // hair sides
      break;
  }

  // ── Common details ──
  g.fillStyle(0x333344);
  g.fillRect(8, 40, 32, px);            // belt
  g.fillStyle(0x1a1a2e);
  g.fillRect(12, 8, 24, 10);            // face
  g.fillStyle(0xffffff);
  g.fillRect(16, 10, px, px);           // left eye
  g.fillRect(28, 10, px, px);           // right eye

  g.generateTexture(key, 48, 60);
  g.destroy();
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}

/**
 * Generate the player character texture (factory inspector / 엔지니어).
 */
export function generatePlayerTexture(scene: Phaser.Scene): string {
  const key = 'player_char';
  if (scene.textures.exists(key)) return key;

  const g = scene.make.graphics();
  const px = 4;

  // Shadow
  g.fillStyle(0x000000, 0.3);
  g.fillRect(8, 68, 48, 8);
  // Safety boots
  g.fillStyle(0x5a3a1e);
  g.fillRect(16, 60, px * 3, px * 2);
  g.fillRect(36, 60, px * 3, px * 2);
  g.fillStyle(0x333333);
  g.fillRect(16, 66, px * 3, 2);
  g.fillRect(36, 66, px * 3, 2);
  // Legs
  g.fillStyle(0x2c3e50);
  g.fillRect(20, 48, px * 2, px * 4);
  g.fillRect(36, 48, px * 2, px * 4);
  // Body (orange safety vest)
  g.fillStyle(0xe67e22);
  g.fillRect(12, 24, 40, 28);
  // Reflective stripes
  g.fillStyle(0xf1c40f, 0.6);
  g.fillRect(12, 32, 40, 3);
  g.fillRect(12, 42, 40, 3);
  // Arms
  g.fillStyle(0xe67e22, 0.9);
  g.fillRect(4, 28, px * 2, px * 4);
  g.fillRect(52, 28, px * 2, px * 4);
  // Belt
  g.fillStyle(0x8B4513);
  g.fillRect(12, 48, 40, px);
  g.fillStyle(0xf1c40f);
  g.fillRect(28, 48, px * 2, px);
  // Hard hat
  g.fillStyle(0xf1c40f);
  g.fillRect(8, 0, 48, 20);
  g.fillStyle(0xd4a017);
  g.fillRect(4, 16, 56, px * 2);
  // Hat front light
  g.fillStyle(0xffffff, 0.3);
  g.fillRect(28, 2, 8, 4);
  // Face + goggles frame
  g.fillStyle(0x1a1a2e);
  g.fillRect(16, 6, 32, 12);
  g.fillStyle(0x555555, 0.4);
  g.fillRect(14, 6, 36, 2);
  // Eyes
  g.fillStyle(0x5dade2);
  g.fillRect(20, 8, px, px);
  g.fillRect(36, 8, px, px);
  g.fillStyle(0x5dade2, 0.5);
  g.fillRect(20, 6, px * 2, px);
  // Clipboard in right hand
  g.fillStyle(0xb0734e);
  g.fillRect(54, 28, 6, 10);
  g.fillStyle(0xecf0f1);
  g.fillRect(55, 29, 4, 7);

  g.generateTexture(key, 64, 76);
  g.destroy();
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}

/**
 * Generate a small material item texture (for flow particles).
 */
export function generateMaterialTexture(
  scene: Phaser.Scene,
  id: string,
  color: number,
  size: number,
): string {
  const key = `mat_${id}`;
  if (scene.textures.exists(key)) return key;

  const g = scene.make.graphics();
  // Colored square with pixel highlight
  g.fillStyle(color, 0.9);
  g.fillRect(2, 2, size - 4, size - 4);
  g.lineStyle(2, 0xffffff, 0.3);
  g.strokeRect(1, 1, size - 2, size - 2);
  g.fillStyle(0xffffff, 0.25);
  g.fillRect(3, 3, Math.floor((size - 6) / 2), 2);

  g.generateTexture(key, size, size);
  g.destroy();
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
  return key;
}
