import type { Tower } from "../objects/tower";
import { Unit } from "./base";

export class EnemyUnit extends Unit {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    health: number,
    attack: number,
    speed: number,
    imageKey: string,
    specialAbility: any = null,
    attackRange: number = 50,
    stopDistance: number = 20,
    attackInterval: number = 1,
    priority: number = 1
  ) {
    super(
      scene,
      x,
      y,
      health,
      attack,
      speed,
      imageKey,
      "enemy",
      specialAbility,
      attackRange,
      stopDistance,
      attackInterval,
      priority
    );
  }
  checkPriorityCollision(): [boolean, boolean] {
    let collisionWithEnemyPriority = false;
    for (const other of (this.scene as any).entities) {
      if (
        other instanceof Unit &&
        other !== this &&
        other.faction === "enemy" &&
        other.x < this.x &&
        Math.abs(this.x - other.x) < 20 &&
        (other.priority < this.priority ||
          (other.priority === this.priority &&
            other.imageKey !== this.imageKey))
      ) {
        collisionWithEnemyPriority = true;
        break;
      }
    }
    return [false, collisionWithEnemyPriority];
  }
  getEnemyTower(): Tower | null {
    return (this.scene as any).leftTower;
  }
  getMoveDirection(): number {
    // 画像が反転しているため、1にすることで左にいどうする
    return 1;
  }
  getCollisionFlag(
    collisionWithAllyPriority: boolean,
    collisionWithEnemyPriority: boolean
  ): boolean {
    return collisionWithEnemyPriority;
  }
}
