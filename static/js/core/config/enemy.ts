// config/enemy.ts
// ステージごとの敵出現パターン設定ファイル
// 主な仕様:
// - 各ステージの敵ウェーブ構成を管理
// 制限事項:
// - EnemyConfig型はtypes.tsからimportする

export interface EnemyConfig {
  enemyWaves: Array<{
    enemies: Array<{
      type: string; // UNIT_TYPESのキー
      count: number;
    }>;
  }>;
}

export const ENEMY_CONFIGS: EnemyConfig[] = [
  // 1ステージ目
  {
    enemyWaves: [
      { enemies: [{ type: "tmp_rabbit", count: 3 }] },
      { enemies: [{ type: "archer", count: 1 }] },
    ],
  },
  // 2ステージ目
  {
    enemyWaves: [
      { enemies: [{ type: "tmp_rabbit", count: 4 }] },
      { enemies: [{ type: "archer", count: 2 }] },
    ],
  },
  // 3ステージ目
  {
    enemyWaves: [
      { enemies: [{ type: "tmp_rabbit", count: 5 }] },
      { enemies: [{ type: "archer", count: 3 }] },
    ],
  },
  // 4ステージ目
  {
    enemyWaves: [
      { enemies: [{ type: "tmp_rabbit", count: 6 }] },
      { enemies: [{ type: "archer", count: 4 }] },
    ],
  },
  // 5ステージ目
  {
    enemyWaves: [
      { enemies: [{ type: "tmp_rabbit", count: 7 }] },
      { enemies: [{ type: "archer", count: 5 }] },
    ],
  },
  // 6ステージ目
  {
    enemyWaves: [
      {
        enemies: [
          { type: "tmp_rabbit", count: 6 },
          { type: "archer", count: 3 },
        ],
      },
      {
        enemies: [
          { type: "tmp_rabbit", count: 14 },
          { type: "archer", count: 8 },
        ],
      },
    ],
  },
];
