import Phaser from 'phaser';
import { FactoryScene } from './FactoryScene';
import { HUD, COLORS } from './colors';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: HUD.screenW,
  height: HUD.screenH,
  backgroundColor: `#${COLORS.bg.toString(16).padStart(6, '0')}`,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [FactoryScene],
};

new Phaser.Game(config);
