/**
 * tower.ts
 * タワー（拠点）のクラスやで。
 *
 * 主な仕様:
 * - 体力・ダメージ処理・体力表示などを管理
 * 制限事項:
 * - Entity, 設定値のimportが必要やで。
 */

// =========================================
// import Phaser from 'phaser';
// Phaserの型や本体をnpmからimportするで。
// =========================================
import Phaser from "phaser";
import { Entity } from "./entity.js";

export class Tower extends Entity {
  health: number;
  active: boolean;
  sprite: Phaser.GameObjects.Rectangle;
  healthText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    health: number,
    color: number
  ) {
    super(scene, x, y);
    this.health = health;
    this.active = true;
    this.sprite = scene.add.rectangle(x, y, 40, 40, color);
    this.healthText = scene.add
      .text(x, y - 30, `${this.health}`, {
        fontSize: "16px",
        fill: "#ffffff",
      } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5, 0.5);
  }
  update(deltaTime: number): void {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.healthText.x = this.x;
    this.healthText.y = this.y - 30;
  }
  updateHealthText(): void {
    this.healthText.setText(`${this.health}`);
  }
  takeDamage(damage: number): void {
    this.health -= damage;
    console.log(
      `Tower takes ${damage} damage, remaining health: ${this.health}`
    );
    this.updateHealthText();
    if (this.health <= 0) {
      this.destroy();
    }
  }
  destroy(): void {
    console.log("Tower destroyed! Game Over.");
    this.sprite.destroy();
    this.healthText.destroy();
    this.active = false;
  }
}
