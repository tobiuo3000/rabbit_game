// StageSelectScene
// ステージ選択（ロード）画面やで。
// 主な仕様:
// - ステージボタンを押すとゲーム画面に遷移する
// 制限事項:
// - Phaser.Sceneを継承

import Phaser from "phaser";

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
    // ステージ1だけ用意（拡張しやすいように配列で）
    const stages = ["ステージ1"];
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
        this.scene.start("GameScene");
      });
    });
  }
}
