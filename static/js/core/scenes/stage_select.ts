// StageSelectScene
// ステージ選択（ロード）画面
// 主な仕様:
// - ステージボタンを押すとゲーム画面に遷移
// 制限事項:
// - Phaser.Sceneを継承

import Phaser from "phaser";
import { ENEMY_CONFIGS } from "../config";

export class StageSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: "StageSelectScene" });
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.add
      .text(width / 2, height / 2 - 60, "ステージ選択", {
        fontSize: "28px",
        color: "#fff",
      })
      .setOrigin(0.5);
    // ステージ数分ボタンを自動生成
    const stages = Array.from(
      { length: ENEMY_CONFIGS.length },
      (_, i) => `ステージ${i + 1}`
    );
    stages.forEach((stage, idx) => {
      const btn = this.add
        .text(width / 2, height / 2 + idx * 40, stage, {
          fontSize: "22px",
          color: "#0ff",
          backgroundColor: "#333",
        })
        .setOrigin(0.5)
        .setInteractive();
      btn.on("pointerdown", () => {
        this.scene.start("GameScene", { stage: idx + 1 });
      });
    });
  }
}
