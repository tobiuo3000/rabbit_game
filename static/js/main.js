// =========================================
// main.js
// ゲームのエントリポイントやで。
//
// 主な仕様:
// - Phaserの設定とゲーム起動だけを担当
// 制限事項:
// - 他のロジックはcore/以下に分離してるで。
// =========================================

import { MyScene } from './core/scene.js';

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    backgroundColor: "#333333",
    scene: MyScene
};

const game = new Phaser.Game(config);
