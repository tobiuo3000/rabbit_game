/**
 * game_entity.ts
 * ゲームのエンティティ（ユニットやタワー）を定義するファイルやで。
 *
 * 主な仕様:
 * - ユニットやタワーのクラス定義
 * - エンティティの生成・更新・攻撃処理など
 * 制限事項:
 * - 特になし
 */
import Phaser from "phaser";
import { EASY_CONFIG, ASSETS_PATH, UNIT_TYPES } from "./config";

// --- 基底クラス ---
/**
 * Entity
 * ゲーム内の全エンティティの基底クラスやで。
 *
 * 主な仕様:
 * - x, y座標とsceneを保持
 * - updateメソッドは継承先でオーバーライド
 * 制限事項:
 * - 直接インスタンス化せんといてな
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

// --- ユニットクラス ---
/**
 * Unit
 * ユニットのクラスやで。
 *
 * 主な仕様:
 * - 体力・攻撃・移動・アニメーション・体力表示
 * - 敵味方の判定や攻撃処理
 * 制限事項:
 * - scene.entities, scene.leftTower, scene.rightTowerが必要やで
 */
export class Unit extends Entity {
  health: number;
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
  healthTextY: number;

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
    this.healthTextY = y - EASY_CONFIG.BASE_HEALTH_TEXT_Y;
    // tmp_rabbitの場合、画像が存在すればアニメーション用スプライトを作成
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
      // 画像が無い場合は、代替として四角形を生成
      const fallbackColor = faction === "ally" ? 0x00ff00 : 0xff0000;
      this.sprite = scene.add.rectangle(x, y, 20, 20, fallbackColor);
    }
    // ユニット上部に体力表示テキストを作成
    this.healthText = scene.add
      .text(x, this.healthTextY, `${this.health}`, {
        fontSize: EASY_CONFIG.BASE_HEALTH_TEXT_SIZE,
        fill: EASY_CONFIG.BASE_HEALTH_TEXT_COLOR,
      } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5, 0.5);
  }
  /**
   * ユニットの状態更新やで。
   * @param deltaTime フレーム間の経過時間
   */
  update(deltaTime: number): void {
    if (!this.active) return;
    let enemyInStopRange = false;
    let attackTargets: (Unit | Tower)[] = [];
    // 敵ユニットのチェック
    for (const other of (this.scene as any).entities as Entity[]) {
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
    // 進行方向の敵タワーのチェック
    let enemyTower: Tower | null = null;
    if (this.faction === "ally") {
      enemyTower = (this.scene as any).rightTower as Tower;
    } else if (this.faction === "enemy") {
      enemyTower = (this.scene as any).leftTower as Tower;
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
    // アニメーションの切り替え（this.spriteがSpriteの場合のみ実施）
    if (this.sprite instanceof Phaser.GameObjects.Sprite) {
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
    // 同じ種類の味方ユニットが重なった場合、体力テキストの位置をずらす処理
    if (this.faction === "ally") {
      const sameTypeAllies = ((this.scene as any).entities as Unit[]).filter(
        (u) =>
          u instanceof Unit &&
          u.faction === "ally" &&
          u.imageKey === this.imageKey &&
          Math.abs(u.x - this.x) < 10
      );
      sameTypeAllies.sort((a, b) => a.x - b.x);
      const index = sameTypeAllies.indexOf(this);
      const offsetY = index * 15;
      this.healthText.y = this.healthTextY + offsetY;
    } else {
      this.healthText.y = this.healthTextY;
    }
    // 味方ユニットで異なる種類との重なりを防ぐ（移動停止）
    let collisionWithDifferentAlly = false;
    if (this.faction === "ally") {
      for (const other of (this.scene as any).entities as Unit[]) {
        if (
          other instanceof Unit &&
          other !== this &&
          other.faction === "ally" &&
          other.imageKey !== this.imageKey
        ) {
          if (Math.abs(this.x - other.x) < 20) {
            collisionWithDifferentAlly = true;
            break;
          }
        }
      }
    }
    // 敵が近い場合は攻撃、そうでなければ移動（ただし異なる種類の味方と衝突している場合は移動しない）
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
    // 体力表示テキストのx座標更新
    this.healthText.x = this.x;
    this.updateHealthText();
  }
  /**
   * 体力表示テキストを更新するで。
   */
  updateHealthText(): void {
    this.healthText.setText(`${this.health}`);
  }
  /**
   * 対象に攻撃するで。
   * @param target 攻撃対象（UnitまたはTower）
   */
  attackTarget(target: Unit | Tower): void {
    if (!target.active) return;
    target.health -= this.attack;
    if (target.health <= 0) {
      target.destroy();
    } else {
      if (target instanceof Tower || target instanceof Unit) {
        target.updateHealthText();
      }
    }
  }
  /**
   * ユニットを破壊するで。
   */
  destroy(): void {
    console.log(`${this.faction} unit destroyed!`);
    if (this.sprite) this.sprite.destroy();
    if (this.healthText) this.healthText.destroy();
    this.active = false;
  }
}

// --- タワークラス ---
/**
 * Tower
 * タワー（拠点）のクラスやで。
 *
 * 主な仕様:
 * - 体力・ダメージ処理・体力表示などを管理
 * 制限事項:
 * - Entity, 設定値のimportが必要やで。
 */
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
  /**
   * タワーの状態更新やで。
   * @param deltaTime フレーム間の経過時間
   */
  update(deltaTime: number): void {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.healthText.x = this.x;
    this.healthText.y = this.y - 30;
  }
  /**
   * 体力表示テキストを更新するで。
   */
  updateHealthText(): void {
    this.healthText.setText(`${this.health}`);
  }
  /**
   * ダメージを受ける処理やで。
   * @param damage ダメージ量
   */
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
  /**
   * タワーを破壊するで。
   */
  destroy(): void {
    console.log("Tower destroyed! Game Over.");
    this.sprite.destroy();
    this.healthText.destroy();
    this.active = false;
  }
}

// --- Phaser シーン ---
/**
 * MyScene
 * ゲームのメインシーンやで。
 *
 * 主な仕様:
 * - ユニット・タワーの生成、アニメーション、UIボタン、敵出現イベント
 * 制限事項:
 * - Phaser, config, Unit, Towerのimportが必要やで。
 */
export class MyScene extends Phaser.Scene {
  entities: Entity[];
  leftTower!: Tower;
  rightTower!: Tower;
  constructor() {
    super({ key: "MyScene" });
    this.entities = [];
  }
  preload(): void {
    // tmp_rabbit 用のアニメーションフレームをプリロード
    this.load.image("frame1", `${ASSETS_PATH}rabbit_unit/rabbit_walk1.png`);
    this.load.image("frame2", `${ASSETS_PATH}rabbit_unit/rabbit_walk2.png`);
    this.load.image("frame3", `${ASSETS_PATH}rabbit_unit/rabbit_attack1.png`);
    this.load.image("frame4", `${ASSETS_PATH}rabbit_unit/rabbit_attack2.png`);
    this.load.image("frame5", `${ASSETS_PATH}rabbit_unit/rabbit_attack3.png`);
  }
  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    // 左右のタワーを作成
    this.leftTower = new Tower(this, 50, height / 2, 500, 0xffffff);
    this.rightTower = new Tower(this, width - 50, height / 2, 500, 0xff0000);
    this.entities.push(this.leftTower, this.rightTower);
    // tmp_rabbit 用アニメーション "rabbit_walk_anim" と "rabbit_attack_anim" を作成
    if (!this.anims.exists("rabbit_walk_anim")) {
      this.anims.create({
        key: "rabbit_walk_anim",
        frames: [{ key: "frame1" }, { key: "frame2" }],
        frameRate: EASY_CONFIG.RABBIT_ANIMATION_FPS,
        repeat: -1,
      });
      this.anims.create({
        key: "rabbit_attack_anim",
        frames: [{ key: "frame3" }, { key: "frame4" }, { key: "frame5" }],
        frameRate: EASY_CONFIG.RABBIT_ANIMATION_FPS,
        repeat: -1,
      });
    }
    // enemy 側のユニット出現イベント（4000msごと）
    this.time.addEvent({
      delay: 4000,
      callback: this.spawnEnemyUnit,
      callbackScope: this,
      loop: true,
    });
    this.createUnitButtons();
  }
  /**
   * 敵ユニットを出現させるで。
   */
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
      -typeConfig.speed, // 左方向へ移動
      typeConfig.imageKey,
      "enemy",
      null,
      typeConfig.attackRange,
      typeConfig.stopDistance,
      typeConfig.attackInterval
    );
    this.entities.push(unit);
  }
  /**
   * ユニット生成ボタンを作成するで。
   */
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
  /**
   * ユニット生成ボタン1つ分の処理やで。
   * @param typeKey ユニットタイプ名
   * @param x ボタンx座標
   * @param y ボタンy座標
   */
  createUnitButton(typeKey: string, x: number, y: number): void {
    const buttonWidth = 70,
      buttonHeight = 30;
    let button = this.add
      .rectangle(x, y, buttonWidth, buttonHeight, 0x666666)
      .setInteractive();
    let text = this.add
      .text(x, y, typeKey, {
        fontSize: "14px",
        color: "#ffffff",
      } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5, 0.5);
    button.on("pointerdown", () => {
      // ボタン押下で ally 側ユニットを出現させる（左タワー側）
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
  /**
   * 毎フレームの更新処理やで。
   * @param time 現在時刻
   * @param delta 前フレームからの経過ミリ秒
   */
  update(time: number, delta: number): void {
    const deltaTime = delta / 500;
    this.entities.forEach((entity) => {
      entity.update(deltaTime);
    });
    // inactive なエンティティは除去
    this.entities = this.entities.filter(
      (entity) => !("active" in entity && (entity as any).active === false)
    );
  }
}
