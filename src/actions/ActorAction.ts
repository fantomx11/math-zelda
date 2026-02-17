// src/actions/ActorActions.ts
import { ActorModel, Direction } from '../models/ActorModel';
import { RoomModel } from '../models/RoomModel';

export interface ActorAction {
  /**
   * @returns true if the action is completed, false if it needs to continue next frame.
   */
  execute(actor: ActorModel, room: RoomModel): boolean;
}

/**
 * Moves the actor one full grid square in a direction.
 */
export class MoveGridAction implements ActorAction {
  constructor(private dir: Direction) {}

  execute(actor: ActorModel, room: RoomModel): boolean {
    // We use the existing process logic which handles MoveState and grid snapping
    actor.currentDir = this.dir;
    actor.process(this.dir, room);
    
    // Action is "done" when the actor returns to IdleState (finished the grid step)
    return actor.state.constructor.name === 'IdleState';
  }
}

/**
 * Makes the actor wait for a specific number of frames.
 */
export class WaitAction implements ActorAction {
  constructor(private frames: number) {}

  execute(): boolean {
    this.frames--;
    return this.frames <= 0;
  }
}


/**
 * Moves the actor toward a coordinate. 
 * Stays in the queue until the actor is within the tolerance range.
 */
export class MoveToLocationAction implements ActorAction {
    private currentAxis: 'x' | 'y' | null = null;

  constructor(
    private targetX: number, 
    private targetY: number
  ) {}

  execute(actor: ActorModel, room: RoomModel): boolean {
    const dx = this.targetX - actor.x;
    const dy = this.targetY - actor.y;
    const speed = actor.speed; // Tolerance is now dynamic based on speed

    // 1. Arrival Check
    if (Math.abs(dx) <= speed && Math.abs(dy) <= speed) {
      actor.snapToGrid();
      return false; // Done
    }

        // 2. Grid-Line Turn Logic
    // Check if we are close enough to a grid intersection to consider a turn
    const distToGridX = Math.abs(actor.x % actor.gridSize);
    const distToGridY = Math.abs(actor.y % actor.gridSize);

    // An actor is "at" a grid line if they are within one 'speed' step of it
    const atGridX = distToGridX <= speed || distToGridX >= (actor.gridSize - speed);
    const atGridY = distToGridY <= speed || distToGridY >= (actor.gridSize - speed);

    // Only allow changing the axis if we are at a grid intersection or just starting
    if (this.currentAxis === null || (atGridX && atGridY)) {
      const preferredAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      
      // If we are switching axes, snap to the grid to ensure perfect alignment
      if (this.currentAxis !== preferredAxis) {
        actor.snapToGrid();
        this.currentAxis = preferredAxis;
      }
    }

    // 3. Execute Movement
    let moveDir: Direction;
    if (this.currentAxis === 'x') {
      moveDir = dx > 0 ? Direction.right : Direction.left;
    } else {
      moveDir = dy > 0 ? Direction.down : Direction.up;
    }

    actor.move(moveDir, room);
    return true;
  }
}

/**
 * Wait for a specific duration.
 */
export class WaitAction implements ActorAction {
  private timer: number = -1;
  constructor(private frames: number) {}

  execute(): boolean {
    if (this.timer === -1) this.timer = this.frames;
    this.timer--;
    
    return this.timer > 0; // True = keep waiting, False = done
  }
}