import type { Tower } from "../objects/tower";
import { Unit } from "./base";

export class AllyUnit extends Unit {
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
      "ally",
      specialAbility,
      attackRange,
      stopDistance,
      attackInterval,
      priority
    );
  }
  checkPriorityCollision(): [boolean, boolean] {
    let collisionWithAllyPriority = false;
    for (const other of (this.scene as any).entities) {
      if (
        other instanceof Unit &&
        other !== this &&
        other.faction === "ally" &&
        other.x > this.x &&
        Math.abs(this.x - other.x) < 20 &&
        (other.priority < this.priority ||
          (other.priority === this.priority &&
            other.imageKey !== this.imageKey))
      ) {
        collisionWithAllyPriority = true;
        break;
      }
    }
    return [collisionWithAllyPriority, false];
  }
  getEnemyTower(): Tower | null {
    return (this.scene as any).rightTower;
  }
  updateHealthTextPosition(): void {
    const sameTypeAllies = (this.scene as any).entities.filter(
      (u: any) =>
        u instanceof Unit &&
        u.faction === "ally" &&
        u.imageKey === this.imageKey &&
        Math.abs(u.x - this.x) < 10
    );
    sameTypeAllies.sort((a: any, b: any) => a.x - b.x);
    const index = sameTypeAllies.indexOf(this);
    const offsetY = index * 15;
    this.healthText.y = this.healthTextY + offsetY;
  }
  getMoveDirection(): number {
    return 1;
  }
  getCollisionFlag(
    collisionWithAllyPriority: boolean,
    collisionWithEnemyPriority: boolean
  ): boolean {
    return collisionWithAllyPriority;
  }
}
