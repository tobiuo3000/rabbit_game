/**
 * entity.ts
 * ゲーム内の全エンティティ（ユニット・タワー等）の基底クラスやで。
 *
 * 主な仕様:
 * - 位置情報とupdateメソッドを持つ
 * 制限事項:
 * - 直接使うことは少なく、継承して使う前提やで。
 */

export class Entity {
    scene: Phaser.Scene;
    x: number;
    y: number;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
    }
    update(deltaTime: number): void {
        // 各クラスでオーバーライド
    }
}