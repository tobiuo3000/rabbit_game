/**
 * scene.ts
 * ゲーム全体のPhaserシーン管理クラスやで。
 *
 * 主な仕様:
 * - タワー・ユニットの生成、アニメーション、UIボタン、ゲーム進行を管理
 * 制限事項:
 * - Phaser, Unit, Tower, 設定値のimportが必要やで。
 */


import { UNIT_TYPES, EASY_CONFIG, ASSETS_PATH } from '../config.js';
import { Unit } from './unit.js';
import { Tower } from './tower.js';

export class MyScene extends Phaser.Scene {
    entities: any[];
    leftTower!: Tower;
    rightTower!: Tower;

    constructor() {
        super({ key: "MyScene" });
        this.entities = [];
    }
    preload(): void {
        this.load.image('frame1', `${ASSETS_PATH}rabbit_unit/rabbit_walk1.png`);
        this.load.image('frame2', `${ASSETS_PATH}rabbit_unit/rabbit_walk2.png`);
        this.load.image('frame3', `${ASSETS_PATH}rabbit_unit/rabbit_attack1.png`);
        this.load.image('frame4', `${ASSETS_PATH}rabbit_unit/rabbit_attack2.png`);
        this.load.image('frame5', `${ASSETS_PATH}rabbit_unit/rabbit_attack3.png`);
    }
    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.leftTower = new Tower(this, 50, height / 2, 500, 0xffffff);
        this.rightTower = new Tower(this, width - 50, height / 2, 500, 0xff0000);
        this.entities.push(this.leftTower, this.rightTower);
        if (!this.anims.exists('rabbit_walk_anim')) {
            this.anims.create({
                key: 'rabbit_walk_anim',
                frames: [
                    { key: 'frame1' },
                    { key: 'frame2' }
                ],
                frameRate: EASY_CONFIG.RABBIT_ANIMATION_FPS,
                repeat: -1
            });
            this.anims.create({
                key: 'rabbit_attack_anim',
                frames: [
                    { key: 'frame3' },
                    { key: 'frame4' },
                    { key: 'frame5' }
                ],
                frameRate: EASY_CONFIG.RABBIT_ANIMATION_FPS,
                repeat: -1
            });
        }
        this.time.addEvent({
            delay: 4000,
            callback: this.spawnEnemyUnit,
            callbackScope: this,
            loop: true
        });
        this.createUnitButtons();
    }
    spawnEnemyUnit(): void {
        const unitTypes = Object.keys(UNIT_TYPES);
        const randomType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
        const typeConfig = UNIT_TYPES[randomType];
        const unit = new Unit(
            this,
            this.rightTower.x - 20,
            this.rightTower.y,
            typeConfig.health,
            typeConfig.attack,
            -typeConfig.speed,
            typeConfig.imageKey,
            "enemy",
            null,
            typeConfig.attackRange,
            typeConfig.stopDistance,
            typeConfig.attackInterval
        );
        this.entities.push(unit);
    }
    createUnitButtons(): void {
        const unitTypes = Object.keys(UNIT_TYPES);
        const startX = 100;
        const startY = this.cameras.main.height - 40;
        const spacing = 80;
        unitTypes.forEach((typeKey, index) => {
            const buttonX = startX + index * spacing;
            this.createUnitButton(typeKey, buttonX, startY);
        });
    }
    createUnitButton(typeKey: string, x: number, y: number): void {
        const buttonWidth = 70, buttonHeight = 30;
        let button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x666666).setInteractive();
        let text = this.add.text(x, y, typeKey, { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5, 0.5);
        button.on('pointerdown', () => {
            const typeConfig = UNIT_TYPES[typeKey];
            const unit = new Unit(
                this,
                this.leftTower.x + 20,
                this.leftTower.y,
                typeConfig.health,
                typeConfig.attack,
                typeConfig.speed,
                typeConfig.imageKey,
                "ally",
                null,
                typeConfig.attackRange,
                typeConfig.stopDistance,
                typeConfig.attackInterval
            );
            this.entities.push(unit);
        });
    }
    update(time: number, delta: number): void {
        const deltaTime = delta / 500;
        this.entities.forEach(entity => {
            entity.update(deltaTime);
        });
        this.entities = this.entities.filter(entity => !("active" in entity && entity.active === false));
    }
}