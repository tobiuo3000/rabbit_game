// config/game.ts
// ゲーム全体の共通設定ファイル
// 主な仕様:
// - アセットパスやUI表示用の定数など、難易度に依存しない値を管理
// 制限事項:
// - config/index.tsからimportして使うこと

export const ASSETS_PATH = "./static/assets/";
export const BASE_HEALTH_TEXT_Y = -50;
export const BASE_HEALTH_TEXT_SIZE = 12;
export const BASE_HEALTH_TEXT_COLOR = "#ffffff";
export const RABBIT_ANIMATION_FPS = 2;
