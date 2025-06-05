import { Entity } from "../objects/entity";
import {
  BASE_HEALTH_TEXT_Y,
  BASE_HEALTH_TEXT_SIZE,
  BASE_HEALTH_TEXT_COLOR,
} from "../config";
import type { Tower } from "../objects/tower";

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
  priority: number;

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
    attackInterval: number = 1,
    priority: number = 1
  ) {
    super(scene, x, y);
    this.health = health;
    this.healthTextY = y - BASE_HEALTH_TEXT_Y;
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
    this.priority = priority;
    if (
      imageKey === "rabbit" &&
      scene.textures.exists("frame1") &&
      scene.textures.exists("frame2")
    ) {
      this.sprite = scene.add.sprite(x, y, "frame1").setScale(0.1);
      if (this.faction === "ally") {
        this.sprite.setFlipX(true);
      }
    } else {
      const fallbackColor = faction === "ally" ? 0x00ff00 : 0xff0000;
      this.sprite = scene.add.rectangle(x, y, 20, 20, fallbackColor);
    }
    this.healthText = scene.add
      .text(x, this.healthTextY, `${this.health}`, {
        fontSize: BASE_HEALTH_TEXT_SIZE,
        fill: BASE_HEALTH_TEXT_COLOR,
      } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5, 0.5);
  }
  /**
   * ユニットのアニメーションを切り替える処理
   * @param enemyInStopRange 停止範囲内に敵がいるかどうか
   */
  updateAnimation(enemyInStopRange: boolean): void {
    if (
      this.sprite instanceof Phaser.GameObjects.Sprite &&
      (this.sprite as any).anims
    ) {
      if (enemyInStopRange) {
        if (
          (this.scene as any).anims.exists("rabbit_attack_anim") &&
          (!this.sprite.anims.currentAnim ||
            this.sprite.anims.currentAnim.key !== "rabbit_attack_anim")
        ) {
          this.sprite.play("rabbit_attack_anim");
        }
      } else {
        if (
          (this.scene as any).anims.exists("rabbit_walk_anim") &&
          (!this.sprite.anims.currentAnim ||
            this.sprite.anims.currentAnim.key !== "rabbit_walk_anim")
        ) {
          this.sprite.play("rabbit_walk_anim");
        }
      }
    }
  }
  checkPriorityCollision(): [boolean, boolean] {
    // デフォルトは両方false
    return [false, false];
  }
  getEnemyTower(): Tower | null {
    return null;
  }
  updateHealthTextPosition(): void {
    this.healthText.y = this.healthTextY;
  }
  getMoveDirection(): number {
    return 1;
  }
  update(deltaTime: number): void {
    if (!this.active) return;
    let enemyInStopRange = false;
    let attackTargets: (Unit | Tower)[] = [];
    // --- 敵ユニット・タワーの探索 ---
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
    const enemyTower = this.getEnemyTower();
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
    // --- アニメーション切り替え ---
    this.updateAnimation(enemyInStopRange);
    // --- 体力テキスト位置調整 ---
    this.updateHealthTextPosition();
    // --- 優先度衝突判定 ---
    const [collisionWithAllyPriority, collisionWithEnemyPriority] =
      this.checkPriorityCollision();
    // --- 攻撃・移動処理 ---
    if (enemyInStopRange) {
      this.timeSinceLastAttack += deltaTime;
      if (this.timeSinceLastAttack >= this.attackInterval) {
        attackTargets.forEach((target) => {
          this.attackTarget(target);
        });
        this.timeSinceLastAttack = 0;
      }
    } else {
      const collision = this.getCollisionFlag(
        collisionWithAllyPriority,
        collisionWithEnemyPriority
      );
      if (!collision) {
        this.x += this.speed * deltaTime * this.getMoveDirection();
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
  getCollisionFlag(
    collisionWithAllyPriority: boolean,
    collisionWithEnemyPriority: boolean
  ): boolean {
    // デフォルトはどちらもfalse
    return false;
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
      if (typeof (target as any).updateHealthText === "function") {
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
