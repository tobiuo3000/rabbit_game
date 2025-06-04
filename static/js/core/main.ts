// =========================================
// main.ts
// ゲームのエントリポイント
//
// 主な仕様:
// - Phaserの設定とゲーム起動のみを担当
// 制限事項:
// - 他のロジックはcore/以下に分離
// =========================================

import Phaser from "phaser";
import { GameScene } from "./scenes/game";
import { StartScene } from "./scenes/start";
import { StageSelectScene } from "./scenes/stage_select";
import { GameClearScene } from "./scenes/game_clear";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  backgroundColor: "#333333",
  scene: [StartScene, StageSelectScene, GameScene, GameClearScene],
};

const game = new Phaser.Game(config);
