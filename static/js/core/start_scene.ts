// StartScene
// ゲームのスタート画面やで。
// 主な仕様:
// - スタートボタンを押すとステージ選択画面に遷移する
// 制限事項:
// - Phaser.Sceneを継承

import Phaser from "phaser";

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.add
      .text(width / 2, height / 2 - 50, "うさぎタワーディフェンス", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);
    const startButton = this.add
      .text(width / 2, height / 2 + 30, "スタート", {
        fontSize: "24px",
        color: "#0f0",
        backgroundColor: "#333",
      })
      .setOrigin(0.5)
      .setInteractive();
    startButton.on("pointerdown", () => {
      this.scene.start("StageSelectScene");
    });
  }
}
