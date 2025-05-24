// GameClearScene
// ゲームクリア画面やで。
// 主な仕様:
// - クリアメッセージとタイトルへ戻るボタン
// 制限事項:
// - Phaser.Sceneを継承

import Phaser from "phaser";

export class GameClearScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameClearScene" });
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.add
      .text(width / 2, height / 2 - 40, "ゲームクリア！", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5);
    const btn = this.add
      .text(width / 2, height / 2 + 30, "タイトルへ", {
        fontSize: "24px",
        color: "#0f0",
        backgroundColor: "#333",
      })
      .setOrigin(0.5)
      .setInteractive();

    btn.on("pointerdown", () => {
      this.scene.start("StartScene");
    });
  }
}
