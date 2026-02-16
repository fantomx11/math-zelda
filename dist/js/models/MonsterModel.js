import { ActorModel, KnockbackState, MoveState } from './ActorModel.js';
import { HeartPickupModel } from './HeartPickupModel.js';
/**
 * Base class for enemies with basic AI.
 */
export class MonsterModel extends ActorModel {
    constructor(x, y, subtype, speed = .5) {
        super(x, y, speed);
        this.type = "enemy";
        this.subtype = subtype;
        this.hp = 3;
        this.aiTimer = 0;
        this.mathProblem = { a: 0, b: 0, answer: 0 };
    }
    /**
     * Executes AI logic for movement.
     * @param room The room model.
     */
    ai(room) {
        if (this.state instanceof KnockbackState) {
            this.process(null, room);
            return;
        }
        // If currently moving, continue that movement
        if (this.state instanceof MoveState) {
            this.process(null, room);
            return;
        }
        // If waiting, count down
        if (this.aiTimer > 0) {
            this.aiTimer--;
            return;
        }
        // Pick a random direction
        const dirs = ['up', 'down', 'left', 'right'];
        const pick = dirs[Math.floor(Math.random() * dirs.length)];
        this.process(pick, room);
        // Set a pause timer
        if (!(this.state instanceof MoveState))
            this.aiTimer = 30 + Math.floor(Math.random() * 30);
    }
    /**
     * Handles monster-specific death logic, like dropping items.
     * @param scene The scene context.
     */
    onDeath(scene) {
        if (Math.random() < 0.25) {
            scene.spawnPickup(new HeartPickupModel(this.x, this.y));
        }
    }
    onTouch(other) {
        if (other.type === 'player') {
            other.takeDamage(MonsterModel.DAMAGE_AMOUNT, this.x, this.y);
        }
    }
    getIdleAnimKey() {
        return `${this.subtype}_${this.currentDir}_idle`;
    }
}
MonsterModel.DAMAGE_AMOUNT = 1;
//# sourceMappingURL=MonsterModel.js.map