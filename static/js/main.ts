// =========================================
// main.ts
// ゲームのエントリポイントやで。
//
// 主な仕様:
// - Phaserの設定とゲーム起動だけを担当
// 制限事項:
// - 他のロジックはcore/以下に分離してるで。
// =========================================

import Phaser from "phaser";
import { GameScene } from "./core/scene";
import { StartScene } from "./core/start_scene";
import { StageSelectScene } from "./core/stage_select_scene";
import { GameClearScene } from "./core/game_clear_scene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  backgroundColor: "#333333",
  scene: [StartScene, StageSelectScene, GameScene, GameClearScene],
};

const game = new Phaser.Game(config);
