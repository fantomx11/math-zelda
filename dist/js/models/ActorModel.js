import { EntityModel } from './EntityModel.js';
export class IdleState {
    enter(actor) {
        // Snap to grid on idle
        actor.x = Math.round(actor.x / actor.gridSize) * actor.gridSize;
        actor.y = Math.round(actor.y / actor.gridSize) * actor.gridSize;
    }
    update(actor, room, inputDir) {
        if (inputDir) {
            actor.currentDir = inputDir;
            actor.changeState(new MoveState());
        }
    }
    getAnimKey(actor) {
        return actor.getIdleAnimKey();
    }
}
export class MoveState {
    constructor() {
        this.remainingStep = 0;
    }
    enter(actor) {
        this.remainingStep = actor.gridSize;
        // Perpendicular snap (Lane alignment)
        if (actor.currentDir === 'left' || actor.currentDir === 'right') {
            actor.y = Math.round(actor.y / actor.gridSize) * actor.gridSize;
        }
        else {
            actor.x = Math.round(actor.x / actor.gridSize) * actor.gridSize;
        }
    }
    update(actor, room, inputDir) {
        let dx = 0, dy = 0;
        if (actor.currentDir === 'left')
            dx = -actor.speed;
        if (actor.currentDir === 'right')
            dx = actor.speed;
        if (actor.currentDir === 'up')
            dy = -actor.speed;
        if (actor.currentDir === 'down')
            dy = actor.speed;
        const nextX = actor.x + dx;
        const nextY = actor.y + dy;
        // Collision check: only move if the path is clear
        if (actor.canPass(nextX, nextY, room)) {
            actor.x = nextX;
            actor.y = nextY;
            this.remainingStep -= actor.speed;
        }
        else {
            // If we hit a wall mid-step, cancel the remaining step
            this.remainingStep = 0;
        }
        // Check if step is complete
        if (this.remainingStep <= 0) {
            // Final hard snap to ensure no floating point errors
            actor.x = Math.round(actor.x / actor.gridSize) * actor.gridSize;
            actor.y = Math.round(actor.y / actor.gridSize) * actor.gridSize;
            if (inputDir === actor.currentDir) {
                this.remainingStep = actor.gridSize; // Continue moving
            }
            else if (inputDir) {
                actor.currentDir = inputDir;
                actor.changeState(new MoveState());
            }
            else {
                actor.changeState(new IdleState());
            }
        }
    }
    getAnimKey(actor) {
        return `${actor.type}_${actor.currentDir}`;
    }
}
export class KnockbackState {
    constructor(srcX, srcY) {
        this.srcX = srcX;
        this.srcY = srcY;
        this.dist = 32;
    }
    enter(actor) {
        const dx = this.srcX - actor.x;
        const dy = this.srcY - actor.y;
        if (Math.abs(dx) > Math.abs(dy))
            actor.currentDir = dx > 0 ? 'right' : 'left';
        else
            actor.currentDir = dy > 0 ? 'down' : 'up';
    }
    update(actor, room, inputDir) {
        const speed = 2;
        let dx = 0, dy = 0;
        // Move opposite to facing
        if (actor.currentDir === 'left')
            dx = speed;
        if (actor.currentDir === 'right')
            dx = -speed;
        if (actor.currentDir === 'up')
            dy = speed;
        if (actor.currentDir === 'down')
            dy = -speed;
        const nextX = actor.x + dx;
        const nextY = actor.y + dy;
        if (actor.canPass(nextX, nextY, room)) {
            actor.x = nextX;
            actor.y = nextY;
        }
        this.dist -= speed;
        if (this.dist <= 0) {
            actor.changeState(new IdleState());
        }
    }
    getAnimKey(actor) { return ''; }
}
/**
 * Base class for all moving entities (Player, Monsters).
 * Handles grid-based movement, collision detection, and health.
 */
export class ActorModel extends EntityModel {
    /**
     * @param x Initial X coordinate.
     * @param y Initial Y coordinate.
     * @param hp Initial Health Points (default 1).
     * @param speed Movement speed (default 1).
     */
    constructor(x, y, hp = 1, speed = 1) {
        super(x, y);
        this.speed = 1;
        this.type = 'actor';
        this.currentDir = 'down';
        this.hp = hp;
        this.speed = speed;
        this.invincibleTimer = 0;
        this.state = new IdleState();
    }
    changeState(newState) {
        this.state = newState;
        this.state.enter(this);
    }
    get destroy() {
        return this.hp <= 0;
    }
    get isInvincible() {
        return this.invincibleTimer > Date.now();
    }
    /**
     * Processes movement logic for a single frame.
     * @param inputDir The direction input for this frame, or null if no input.
     * @param room The room model for collision checking.
     */
    process(inputDir, room) {
        this.state.update(this, room, inputDir);
    }
    /**
     * Checks if a coordinate is valid to walk on.
     * @param nx Next X coordinate.
     * @param ny Next Y coordinate.
     * @param room The room model.
     * @returns True if passable.
     */
    canPass(nx, ny, room) {
        const cs = room.cornerSize;
        const fs = room.floorSize;
        const limit = cs + fs;
        const margin = 8; // Player half-size
        // Floor bounds
        const inFloorX = nx >= cs + margin && nx <= limit - margin;
        const inFloorY = ny >= cs + margin && ny <= limit - margin;
        if (inFloorX && inFloorY)
            return true;
        // Doorways (center is 128, door sprite is 32px wide from 112 to 144)
        const mid = 128;
        const dw = 0; // Half-width of allowed path
        if (room.wallTypes.n === 'open' && nx >= mid - dw && nx <= mid + dw && ny < cs + margin)
            return true;
        if (room.wallTypes.s === 'open' && nx >= mid - dw && nx <= mid + dw && ny > limit - margin)
            return true;
        if (room.wallTypes.w === 'open' && ny >= mid - dw && ny <= mid + dw && nx < cs + margin)
            return true;
        if (room.wallTypes.e === 'open' && ny >= mid - dw && ny <= mid + dw && nx > limit - margin)
            return true;
        return false;
    }
    /**
     * Applies damage and initiates knockback.
     * @param amount Damage amount.
     * @param srcX X coordinate of the damage source.
     * @param srcY Y coordinate of the damage source.
     * @returns True if HP <= 0 (dead).
     */
    takeDamage(amount, srcX, srcY) {
        if (this.isInvincible)
            return false;
        this.hp -= amount;
        this.invincibleTimer = Date.now() + 1000; // 1 second of invincibility
        this.changeState(new KnockbackState(srcX, srcY));
        return this.hp <= 0;
    }
    /**
     * Returns the opacity for rendering (0.5 if invincible, 1.0 otherwise).
     */
    get alpha() {
        return this.isInvincible ? 0.5 : 1;
    }
    /**
     * Updates the actor's state (AI or Input processing).
     * @param room The room model.
     */
    ai(room) {
        // Default implementation (override in subclasses)
    }
    /**
     * Returns the animation key to play, or empty string if idle.
     */
    getAnimKey() {
        return this.state.getAnimKey(this);
    }
    /**
     * Returns the animation key to use when the actor is idle.
     */
    getIdleAnimKey() {
        return `${this.subtype}_${this.currentDir}_idle`;
    }
    /**
     * Called when the actor is destroyed.
     * Can be overridden by subclasses to implement death logic, like dropping items.
     * @param scene The scene to allow for spawning items or other effects.
     */
    onDeath(scene) {
        // Base implementation does nothing.
    }
}
//# sourceMappingURL=ActorModel.js.map