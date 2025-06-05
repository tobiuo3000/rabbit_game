// config/difficulty.ts
// 難易度ごとのユニット用パラメータ設定
// 主な仕様:
// - BASE_HEALTH, BASE_ATTACKなど、難易度で変化する値を管理
// 制限事項:
// - config/index.tsからimportして使う

export const EASY_CONFIG = {
  BASE_HEALTH: 50,
  BASE_ATTACK: 10,
  BASE_ATTACK_INTERVAL: 3,
  BASE_TOWER_HEALTH: 500,
};

export const NORMAL_CONFIG = {
  BASE_HEALTH: 40,
  BASE_ATTACK: 8,
  BASE_ATTACK_INTERVAL: 2.5,
  BASE_TOWER_HEALTH: 400,
};

export const HARD_CONFIG = {
  BASE_HEALTH: 30,
  BASE_ATTACK: 6,
  BASE_ATTACK_INTERVAL: 2,
  BASE_TOWER_HEALTH: 300,
};

// 難易度切り替え用
export let CURRENT_CONFIG = EASY_CONFIG;
