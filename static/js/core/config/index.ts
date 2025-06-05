// config/index.ts
// 設定ファイルの集約エントリ
// 主な仕様:
// - 各種設定ファイルをまとめてexport
// 制限事項:
// - 他ファイルはここだけimportすればOK

export {
  EASY_CONFIG,
  NORMAL_CONFIG,
  HARD_CONFIG,
  CURRENT_CONFIG,
} from "./difficulty";
export {
  ASSETS_PATH,
  BASE_HEALTH_TEXT_Y,
  BASE_HEALTH_TEXT_SIZE,
  BASE_HEALTH_TEXT_COLOR,
  RABBIT_ANIMATION_FPS,
} from "./game";
export { UNIT_TYPES } from "./unit_types";
export { ENEMY_CONFIGS } from "./enemy";

export type { UnitTypeConfig } from "./unit_types";
export type { EnemyConfig } from "./enemy";
