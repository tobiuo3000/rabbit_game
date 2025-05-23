// =========================================
// config.js
// ゲーム全体の定数・設定値をまとめるファイルやで。
//
// 主な仕様:
// - ゲームバランスやアセットパス、ユニット種別などの定数を管理
// 制限事項:
// - 設定値を変更したら、他のファイルもimportし直す必要があるで。
// =========================================

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
    BASE_HEALTH_TEXT_COLOR: '#ffffff',
    RABBIT_ANIMATION_FPS: 2,
};

export const ASSETS_PATH = './static/assets/';

export const UNIT_TYPES = {
    tmp_rabbit: {
        health: EASY_CONFIG.BASE_HEALTH,
        attack: EASY_CONFIG.BASE_ATTACK,
        speed: EASY_CONFIG.BASE_SPEED,
        imageKey: 'rabbit',
        attackRange: EASY_CONFIG.BASE_ATTACK_RANGE,
        stopDistance: EASY_CONFIG.BASE_STOP_DISTANCE,
        attackInterval: EASY_CONFIG.BASE_ATTACK_INTERVAL
    },
    archer: {
        health: 20,
        attack: 15,
        speed: 30,
        imageKey: 'archer',
        attackRange: 90,
        stopDistance: 85,
        attackInterval: 5
    },
    //cavalry: { ... },
    //mage:    { ... },
    //tank:    { ... }
};
