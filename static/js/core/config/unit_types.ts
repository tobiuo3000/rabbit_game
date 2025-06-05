// config/unit_types.ts
// ユニット種別の定義ファイル
// 主な仕様:
// - 各ユニットのパラメータを管理
// 制限事項:
// - UnitTypeConfig型はtypes.tsからimportする

import { CURRENT_CONFIG } from "./index";

export interface UnitTypeConfig {
  health: number;
  attack: number;
  speed: number;
  imageKey: string;
  attackRange: number;
  stopDistance: number;
  attackInterval: number;
  priority: number;
  cooldown: number;
}

export const UNIT_TYPES: { [key: string]: UnitTypeConfig } = {
  tmp_rabbit: {
    health: CURRENT_CONFIG.BASE_HEALTH,
    attack: CURRENT_CONFIG.BASE_ATTACK,
    speed: 50,
    imageKey: "rabbit",
    attackRange: 60,
    stopDistance: 50,
    attackInterval: CURRENT_CONFIG.BASE_ATTACK_INTERVAL,
    priority: 10,
    cooldown: 3,
  },
  archer: {
    health: CURRENT_CONFIG.BASE_HEALTH * 0.4,
    attack: CURRENT_CONFIG.BASE_ATTACK * 1.2,
    speed: 30,
    imageKey: "archer",
    attackRange: 120,
    stopDistance: 100,
    attackInterval: CURRENT_CONFIG.BASE_ATTACK_INTERVAL * 0.7,
    priority: 20,
    cooldown: 4,
  },
  // cavalry: { ... },
  // mage:    { ... },
  // tank:    { ... }
};
