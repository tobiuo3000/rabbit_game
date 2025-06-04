/**
 * scene.ts
 * ゲーム全体のPhaserシーン管理クラス
 *
 * 主な仕様:
 * - タワー・ユニットの生成、アニメーション、UIボタン、ゲーム進行を管理
 * 制限事項:
 * - Phaser, Unit, Tower, 設定値のimportが必要
 */

import { UNIT_TYPES, EASY_CONFIG, ASSETS_PATH, STAGE_CONFIGS } from "../config";
import { AllyUnit, EnemyUnit } from "../units";
import { Tower } from "../objects/tower";

export class GameScene extends Phaser.Scene {
  entities: any[];
  leftTower!: Tower;
  rightTower!: Tower;
  currentStage: number;
  enemyWaveQueue: { type: string; count: number }[];
  enemyWaveIndex: number;
  spawnedCount: number;
  private _stageClearUIShown: boolean = false;

  /**
   * プロパティ（エンティティ配列、ステージ番号、敵ウェーブ管理用変数）を初期化
   *
   * 主な仕様:
   * - entities: ゲーム内の全エンティティを格納
   * - currentStage: 現在のステージ番号
   * - enemyWaveQueue, enemyWaveIndex, spawnedCount: 敵ウェーブ進行管理
   */
  constructor() {
    super({ key: "GameScene" });
    this.entities = [];
    this.currentStage = 1;
    this.enemyWaveQueue = [];
    this.enemyWaveIndex = 0;
    this.spawnedCount = 0;
  }

  /**
   * シーン初期化処理
   * ステージ選択画面などから渡されたステージ番号を受け取って設定
   * @param data ステージ番号などの初期データ
   */
  init(data: { stage?: number } = {}): void {
    this.currentStage = data.stage || 1;
    this._stageClearUIShown = false;
  }

  /**
   * アセットのプリロード処理
   * ユニットのアニメーション用画像を事前に読み込む。
   */
  preload(): void {
    this.load.image("frame1", `${ASSETS_PATH}rabbit_unit/rabbit_walk1.png`);
    this.load.image("frame2", `${ASSETS_PATH}rabbit_unit/rabbit_walk2.png`);
    this.load.image("frame3", `${ASSETS_PATH}rabbit_unit/rabbit_attack1.png`);
    this.load.image("frame4", `${ASSETS_PATH}rabbit_unit/rabbit_attack2.png`);
    this.load.image("frame5", `${ASSETS_PATH}rabbit_unit/rabbit_attack3.png`);
  }
  /**
   * シーン生成時の初期化処理
   * タワー・アニメーション・敵ウェーブ・UIボタンなどをセットアップ
   */
  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.leftTower = new Tower(this, 50, height / 2, 500, 0xffffff);
    this.rightTower = new Tower(this, width - 50, height / 2, 500, 0xff0000);
    this.entities.push(this.leftTower, this.rightTower);
    // ウサギユニットのアニメーションを定義。後々に、別のユニットが増えてきた場合は他の関数やクラスに分離することを検討
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
    // ステージごとの敵ウェーブをセット
    const stageConfig = STAGE_CONFIGS[this.currentStage - 1];
    this.enemyWaveQueue = stageConfig ? [...stageConfig.enemyWaves] : [];
    this.enemyWaveIndex = 0;
    this.spawnedCount = 0;
    //一定間隔ごとに敵ユニットを出現させるタイマーイベントを設定
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemyUnit,
      callbackScope: this,
      loop: true,
    });
    this.createUnitButtons();
  }
  /**
   * 敵ユニットを出現させる処理
   * 現在のウェーブ情報に従って敵ユニットを生成し、ウェーブ進行も管理
   */
  spawnEnemyUnit(): void {
    // 現在のウェーブがなければ何もしない
    if (this.enemyWaveIndex >= this.enemyWaveQueue.length) return;
    const wave = this.enemyWaveQueue[this.enemyWaveIndex];
    if (!wave) return;
    if (this.spawnedCount < wave.count) {
      // 敵を一体生成
      const typeConfig = UNIT_TYPES[wave.type];
      if (!typeConfig) return;
      const unit = new EnemyUnit(
        this,
        this.rightTower.x - 20,
        this.rightTower.y,
        typeConfig.health,
        typeConfig.attack,
        -typeConfig.speed,
        typeConfig.imageKey,
        null,
        typeConfig.attackRange,
        typeConfig.stopDistance,
        typeConfig.attackInterval,
        typeConfig.priority
      );
      this.entities.push(unit);
      this.spawnedCount++;
    } else {
      // 次のウェーブへ
      this.enemyWaveIndex++;
      this.spawnedCount = 0;
    }
  }
  /**
   * ユニット生成ボタン群を作成する処理
   * 画面下部に各ユニットタイプごとのボタンを並べる
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
   * ユニット生成ボタン1つ分の作成処理
   * ボタン押下時に味方ユニットを生成してentitiesに追加する
   * クールタイム中はボタンを押せなくする
   * @param typeKey ユニットタイプ名
   * @param x ボタンx座標
   * @param y ボタンy座標
   */
  createUnitButton(typeKey: string, x: number, y: number): void {
    const buttonWidth = 70,
      buttonHeight = 30;
    // 各ユニットタイプごとにクールタイムを設定
    const typeConfig = UNIT_TYPES[typeKey];
    const COOLDOWN_SEC = typeConfig.cooldown;
    let cooldown = 0;
    let cooldownTimer: Phaser.Time.TimerEvent | null = null;
    let button = this.add
      .rectangle(x, y, buttonWidth, buttonHeight, 0x666666)
      .setInteractive();
    let text = this.add
      .text(x, y, typeKey, {
        fontSize: "14px",
        fill: "#ffffff",
      } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5, 0.5);

    let cooldownText = this.add
      .text(x, y + 18, "", {
        fontSize: "12px",
        color: "#ffaaaa",
      } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5, 0.5);

    const updateCooldown = () => {
      if (cooldown > 0) {
        cooldownText.setText(`${cooldown.toFixed(1)}s`);
        button.setFillStyle(0x444444);
        button.disableInteractive();
      } else {
        cooldownText.setText("");
        button.setFillStyle(0x666666);
        button.setInteractive();
      }
    };

    button.on("pointerdown", () => {
      if (cooldown > 0) return;
      const typeConfig = UNIT_TYPES[typeKey];
      const unit = new AllyUnit(
        this,
        this.leftTower.x + 20,
        this.leftTower.y,
        typeConfig.health,
        typeConfig.attack,
        typeConfig.speed,
        typeConfig.imageKey,
        null,
        typeConfig.attackRange,
        typeConfig.stopDistance,
        typeConfig.attackInterval,
        typeConfig.priority
      );
      this.entities.push(unit);
      // クールタイム開始
      cooldown = COOLDOWN_SEC;
      updateCooldown();
      if (cooldownTimer) cooldownTimer.remove();
      cooldownTimer = this.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          cooldown -= 0.1;
          if (cooldown <= 0) {
            cooldown = 0;
            if (cooldownTimer) cooldownTimer.remove();
          }
          updateCooldown();
        },
      });
    });
    updateCooldown();
  }
  /**
   * シーン内の全エンティティを破棄する処理
   * 主な仕様:
   * - entities配列内の全てのGameObjectに対してdestroy()を呼び出す
   * - destroyメソッドが存在しない場合は何もしない
   * 制限事項:
   * - entityがPhaser.GameObjectsでない場合は無視
   */
  destroyAllEntities(): void {
    this.entities.forEach((entity) => {
      if (entity && typeof entity.destroy === "function") {
        entity.destroy();
      }
    });
    this.entities = [];
  }
  /**
   * ステージクリア時の選択肢UIを表示する処理
   * 主な仕様:
   * - 画面中央に「次のステージへ」「ステージセレクトへ」ボタンを表示
   * - ボタン押下で対応するシーンへ遷移
   * 制限事項:
   * - 既存のエンティティはdestroyAllEntitiesで消してから呼ぶこと
   */
  showStageClearOptions(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    // 最終ステージかどうか判定
    const isLastStage = this.currentStage >= STAGE_CONFIGS.length;
    if (isLastStage) {
      // 最終ステージなら即クリア画面へ遷移
      this.scene.start("GameClearScene");
      return;
    }
    // 背景半透明パネル
    const panel = this.add.rectangle(
      width / 2,
      height / 2,
      320,
      180,
      0x000000,
      0.7
    );
    // メッセージ
    const msg = this.add
      .text(width / 2, height / 2 - 40, "ステージクリア！", {
        fontSize: "28px",
        color: "#fff",
      })
      .setOrigin(0.5);
    // 「次のステージへ」ボタン
    const nextBtn = this.add
      .rectangle(width / 2, height / 2 + 10, 180, 40, 0x44bb44)
      .setInteractive();
    const nextText = this.add
      .text(width / 2, height / 2 + 10, "次のステージへ", {
        fontSize: "20px",
        color: "#fff",
      })
      .setOrigin(0.5);
    // 「セレクトへ」ボタン
    const selectBtn = this.add
      .rectangle(width / 2, height / 2 + 60, 180, 40, 0x4488cc)
      .setInteractive();
    const selectText = this.add
      .text(width / 2, height / 2 + 60, "ステージセレクトへ", {
        fontSize: "20px",
        color: "#fff",
      })
      .setOrigin(0.5);
    // ボタンイベント
    nextBtn.on("pointerdown", () => {
      this.scene.start("GameScene", { stage: this.currentStage + 1 });
    });
    selectBtn.on("pointerdown", () => {
      this.scene.start("StageSelectScene");
    });
  }
  /**
   * ゲームオーバー時の選択肢UIを表示する処理
   * 主な仕様:
   * - 画面中央に「もう一度やり直す」「ステージセレクトへ」ボタンを表示
   * - ボタン押下で対応するシーンへ遷移
   * 制限事項:
   * - 既存のエンティティはdestroyAllEntitiesで消してから呼ぶこと
   */
  showGameOverOptions(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    // 背景半透明パネル
    const panel = this.add.rectangle(
      width / 2,
      height / 2,
      320,
      180,
      0x000000,
      0.7
    );
    // メッセージ
    const msg = this.add
      .text(width / 2, height / 2 - 40, "ゲームオーバー...", {
        fontSize: "28px",
        color: "#fff",
      })
      .setOrigin(0.5);
    // 「もう一度やり直す」ボタン
    const retryBtn = this.add
      .rectangle(width / 2, height / 2 + 10, 180, 40, 0xcc4444)
      .setInteractive();
    const retryText = this.add
      .text(width / 2, height / 2 + 10, "もう一度やり直す", {
        fontSize: "20px",
        color: "#fff",
      })
      .setOrigin(0.5);
    // 「セレクトへ」ボタン
    const selectBtn = this.add
      .rectangle(width / 2, height / 2 + 60, 180, 40, 0x4488cc)
      .setInteractive();
    const selectText = this.add
      .text(width / 2, height / 2 + 60, "ステージセレクトへ", {
        fontSize: "20px",
        color: "#fff",
      })
      .setOrigin(0.5);
    // ボタンイベント
    retryBtn.on("pointerdown", () => {
      this.scene.start("GameScene", { stage: this.currentStage });
    });
    selectBtn.on("pointerdown", () => {
      this.scene.start("StageSelectScene");
    });
  }
  /**
   * 毎フレームの更新処理
   * 各エンティティの状態更新・削除、タワーのHP判定・ステージ遷移を行う。
   * @param time 現在時刻
   * @param delta 前フレームからの経過ミリ秒
   */
  update(time: number, delta: number): void {
    if (this._stageClearUIShown) {
      return;
    }
    const deltaTime = delta / 500;
    this.entities.forEach((entity) => {
      entity.update(deltaTime);
    });
    this.entities = this.entities.filter(
      (entity) => !("active" in entity && entity.active === false)
    );
    // 右タワーのHPが0以下ならクリア
    if (this.rightTower && this.rightTower.health <= 0) {
      this.destroyAllEntities();
      this._stageClearUIShown = true;
      this.showStageClearOptions();
      return;
    }
    // 左タワーのHPが0以下ならゲームオーバー
    if (this.leftTower && this.leftTower.health <= 0) {
      this.destroyAllEntities();
      this._stageClearUIShown = true;
      this.showGameOverOptions();
      return;
    }
  }
}
