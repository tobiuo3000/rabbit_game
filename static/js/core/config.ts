// =========================================
// config.ts
// ゲーム全体の定数・設定値をまとめるファイル
//
// 主な仕様:
// - ゲームバランスやアセットパス、ユニット種別などの定数を管理
// 制限事項:
// - 設定値を変更したら、他のファイルもimportし直す必要がある
// =========================================

export interface UnitTypeConfig {
  health: number;
  attack: number;
  speed: number;
  imageKey: string;
  attackRange: number;
  stopDistance: number;
  attackInterval: number;
  priority: number;
}

export const EASY_CONFIG = {
  BASE_HEALTH: 50,
  BASE_ATTACK: 10,
  BASE_SPEED: 50,
  BASE_ATTACK_RANGE: 50,
  BASE_STOP_DISTANCE: 50,
  BASE_ATTACK_INTERVAL: 3,
  BASE_TOWER_HEALTH: 500,
  BASE_HEALTH_TEXT_Y: -50,
  BASE_HEALTH_TEXT_SIZE: 12,
  BASE_HEALTH_TEXT_COLOR: "#ffffff",
  RABBIT_ANIMATION_FPS: 2,
};

export const ASSETS_PATH = "./static/assets/";

export const UNIT_TYPES: { [key: string]: UnitTypeConfig } = {
  tmp_rabbit: {
    health: EASY_CONFIG.BASE_HEALTH,
    attack: EASY_CONFIG.BASE_ATTACK,
    speed: EASY_CONFIG.BASE_SPEED,
    imageKey: "rabbit",
    attackRange: EASY_CONFIG.BASE_ATTACK_RANGE,
    stopDistance: EASY_CONFIG.BASE_STOP_DISTANCE,
    attackInterval: EASY_CONFIG.BASE_ATTACK_INTERVAL,
    priority: 10,
  },
  archer: {
    health: 20,
    attack: 15,
    speed: 30,
    imageKey: "archer",
    attackRange: 90,
    stopDistance: 85,
    attackInterval: 5,
    priority: 20,
  },
  // cavalry: { ... },
  // mage:    { ... },
  // tank:    { ... }
};

// =============================
// ステージごとの敵出現パターン設定
// 各ステージで出現する敵の種類や数をここで管理する
// =============================
export interface StageConfig {
  enemyWaves: Array<{
    type: string; // UNIT_TYPESのキー
    count: number;
  }>;
}

export const STAGE_CONFIGS: StageConfig[] = [
  // 1ステージ目
  {
    enemyWaves: [{ type: "tmp_rabbit", count: 3 }],
  },
  // 2ステージ目
  {
    enemyWaves: [
      { type: "tmp_rabbit", count: 4 },
      { type: "archer", count: 2 },
    ],
  },
  // 3ステージ目
  {
    enemyWaves: [
      { type: "tmp_rabbit", count: 5 },
      { type: "archer", count: 3 },
    ],
  },
  // 4ステージ目
  {
    enemyWaves: [
      { type: "tmp_rabbit", count: 6 },
      { type: "archer", count: 4 },
    ],
  },
  // 5ステージ目
  {
    enemyWaves: [
      { type: "tmp_rabbit", count: 7 },
      { type: "archer", count: 5 },
    ],
  },
  // 6ステージ目
  {
    enemyWaves: [
      { type: "tmp_rabbit", count: 8 },
      { type: "archer", count: 6 },
    ],
  },
];
