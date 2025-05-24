/**
 * unit.ts
 * ユニット（味方・敵）のクラスやで。
 *
 * 主な仕様:
 * - 体力・攻撃・移動・アニメーション・体力表示などを管理
 * - タワーや他ユニットとの戦闘処理もここでやる
 * 制限事項:
 * - Phaser, Entity, Tower, 設定値のimportが必要やで。
 */

import { Entity } from './entity';
import { EASY_CONFIG } from '../config';
import type { Tower } from './tower';

export class Unit extends Entity {
    health: number;
    healthTextY: number;
    attack: number;
    speed: number;
    specialAbility: any;
    faction: string;
    attackRange: number;
    stopDistance: number;
    attackInterval: number;
    timeSinceLastAttack: number;
    active: boolean;
    imageKey: string;
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
    healthText: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        health: number,
        attack: number,
        speed: number,
        imageKey: string,
        faction: string,
        specialAbility: any = null,
        attackRange: number = 50,
        stopDistance: number = 20,
        attackInterval: number = 1
    ) {
        super(scene, x, y);
        this.health = health;
        this.healthTextY = y - EASY_CONFIG.BASE_HEALTH_TEXT_Y;
        this.attack = attack;
        this.speed = speed;
        this.specialAbility = specialAbility;
        this.faction = faction;
        this.attackRange = attackRange;
        this.stopDistance = stopDistance;
        this.attackInterval = attackInterval;
        this.timeSinceLastAttack = 0;
        this.active = true;
        this.imageKey = imageKey;
        if (
            imageKey === 'rabbit' &&
            scene.textures.exists('frame1') && scene.textures.exists('frame2')
        ) {
            this.sprite = scene.add.sprite(x, y, 'frame1').setScale(0.1);
            if (this.faction === 'ally') {
                this.sprite.setFlipX(true);
            }
        } else {
            const fallbackColor = faction === 'ally' ? 0x00ff00 : 0xff0000;
            this.sprite = scene.add.rectangle(x, y, 20, 20, fallbackColor);
        }
        this.healthText = scene.add.text(
            x,
            this.healthTextY,
            `${this.health}`,
            {
                fontSize: EASY_CONFIG.BASE_HEALTH_TEXT_SIZE,
                fill: EASY_CONFIG.BASE_HEALTH_TEXT_COLOR,
            } as Phaser.Types.GameObjects.Text.TextStyle
        ).setOrigin(0.5, 0.5);
    }
    update(deltaTime: number): void {
        if (!this.active) return;
        let enemyInStopRange = false;
        let attackTargets: (Unit | Tower)[] = [];
        for (const other of (this.scene as any).entities) {
            if (
                other !== this &&
                other instanceof Unit &&
                other.active &&
                other.faction !== this.faction
            ) {
                const distance = Phaser.Math.Distance.Between(
                    this.x,
                    this.y,
                    other.x,
                    other.y
                );
                if (distance < this.stopDistance) {
                    enemyInStopRange = true;
                }
                if (distance < this.attackRange) {
                    attackTargets.push(other);
                }
            }
        }
        let enemyTower: Tower | null = null;
        if (this.faction === 'ally') {
            enemyTower = (this.scene as any).rightTower;
        } else if (this.faction === 'enemy') {
            enemyTower = (this.scene as any).leftTower;
        }
        if (enemyTower && enemyTower.active) {
            const dTower = Phaser.Math.Distance.Between(
                this.x,
                this.y,
                enemyTower.x,
                enemyTower.y
            );
            if (dTower < this.stopDistance) {
                enemyInStopRange = true;
                attackTargets.push(enemyTower);
            }
        }
        if (this.sprite instanceof Phaser.GameObjects.Sprite) {
            if (enemyInStopRange) {
                if (
                    (this.scene as any).anims.exists('rabbit_attack_anim') &&
                    (!this.sprite.anims.currentAnim ||
                        this.sprite.anims.currentAnim.key !== 'rabbit_attack_anim')
                ) {
                    this.sprite.play('rabbit_attack_anim');
                }
            } else {
                if (
                    (this.scene as any).anims.exists('rabbit_walk_anim') &&
                    (!this.sprite.anims.currentAnim ||
                        this.sprite.anims.currentAnim.key !== 'rabbit_walk_anim')
                ) {
                    this.sprite.play('rabbit_walk_anim');
                }
            }
        }
        if (this.faction === 'ally') {
            const sameTypeAllies = (this.scene as any).entities.filter(
                (u: any) =>
                    u instanceof Unit &&
                    u.faction === 'ally' &&
                    u.imageKey === this.imageKey &&
                    Math.abs(u.x - this.x) < 10
            );
            sameTypeAllies.sort((a: any, b: any) => a.x - b.x);
            const index = sameTypeAllies.indexOf(this);
            const offsetY = index * 15;
            this.healthText.y = this.healthTextY + offsetY;
        } else {
            this.healthText.y = this.healthTextY;
        }
        let collisionWithDifferentAlly = false;
        if (this.faction === 'ally') {
            for (const other of (this.scene as any).entities) {
                if (
                    other instanceof Unit &&
                    other !== this &&
                    other.faction === 'ally' &&
                    other.imageKey !== this.imageKey
                ) {
                    if (Math.abs(this.x - other.x) < 20) {
                        collisionWithDifferentAlly = true;
                        break;
                    }
                }
            }
        }
        if (enemyInStopRange) {
            this.timeSinceLastAttack += deltaTime;
            if (this.timeSinceLastAttack >= this.attackInterval) {
                attackTargets.forEach((target) => {
                    this.attackTarget(target);
                });
                this.timeSinceLastAttack = 0;
            }
        } else {
            if (!collisionWithDifferentAlly) {
                this.x += this.speed * deltaTime;
                if (this.sprite) {
                    this.sprite.x = this.x;
                }
                this.timeSinceLastAttack = 0;
            } else {
                this.timeSinceLastAttack = 0;
            }
        }
        this.healthText.x = this.x;
        this.updateHealthText();
    }
    updateHealthText(): void {
        this.healthText.setText(`${this.health}`);
    }
    attackTarget(target: Unit | Tower): void {
        if (!target.active) return;
        target.health -= this.attack;
        if (target.health <= 0) {
            target.destroy();
        } else {
            if (typeof (target as any).updateHealthText === 'function') {
                (target as any).updateHealthText();
            }
        }
    }
    destroy(): void {
        console.log(`${this.faction} unit destroyed!`);
        if (this.sprite) this.sprite.destroy();
        if (this.healthText) this.healthText.destroy();
        this.active = false;
    }
}