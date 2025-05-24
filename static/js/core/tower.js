/**
 * tower.ts
 * タワー（拠点）のクラスやで。
 *
 * 主な仕様:
 * - 体力・ダメージ処理・体力表示などを管理
 * 制限事項:
 * - Entity, 設定値のimportが必要やで。
 */
import { Entity } from './entity.js';
export class Tower extends Entity {
    constructor(scene, x, y, health, color) {
        super(scene, x, y);
        this.health = health;
        this.active = true;
        this.sprite = scene.add.rectangle(x, y, 40, 40, color);
        this.healthText = scene.add.text(x, y - 30, `${this.health}`, { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5, 0.5);
    }
    update(deltaTime) {
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.healthText.x = this.x;
        this.healthText.y = this.y - 30;
    }
    updateHealthText() {
        this.healthText.setText(`${this.health}`);
    }
    takeDamage(damage) {
        this.health -= damage;
        console.log(`Tower takes ${damage} damage, remaining health: ${this.health}`);
        this.updateHealthText();
        if (this.health <= 0) {
            this.destroy();
        }
    }
    destroy() {
        console.log("Tower destroyed! Game Over.");
        this.sprite.destroy();
        this.healthText.destroy();
        this.active = false;
    }
}
