import { WallType } from "../Enums";
import { gameState } from "../GameState";

interface WallTypes {
  n: WallType;
  s: WallType;
  e: WallType;
  w: WallType;
}

export interface RoomConfig {
  wallTypes: WallTypes;
  mathProblem?: { a: number, b: number, answer: number };
}

function generateMathProblem(): { a: number, b: number, answer: number } {
  const a = gameState.currentLevel;
  const b = Math.floor(Math.random() * 10);
  const answer = a * b;
  return { a, b, answer };
}

/**
 * Represents the data model for a single room in the dungeon.
 */
export class RoomModel {
  public wallTypes: { n: WallType; s: WallType; e: WallType; w: WallType };
  public mathProblem: { a: number, b: number, answer: number };
  

  constructor(config: RoomConfig) {
    const { wallTypes, mathProblem = generateMathProblem() } = config;

    this.mathProblem = { ...mathProblem };
    this.wallTypes = { ...wallTypes };
  }

  /**
   * Checks if a sprite's center (x, y) is within bounds.
   * @param x Center X coordinate
   * @param y Center Y coordinate
   * @param w Sprite width (default 16)
   * @param h Sprite height (default 16)
   */
  public isPassable(x: number, y: number, isPlayer = false, w: number = 16, h: number = 16): boolean {
    const wallSize = 32;
    const playableSize = 192;
    const roomMax = wallSize + playableSize; // 224
    const centerLine = 128; // (256 / 2)

    const halfW = w / 2;
    const halfH = h / 2;

    // 1. Doorway Transitions
    // Check if the player is centered on the 8px grid and moving into a door.
    if (isPlayer && x === centerLine) {
      // North Door (y goes below 32)
      if (y <= (wallSize + halfH) && this.wallTypes.n === WallType.Open) {
        // Allow player to move into the wall space (down to y=0)
        return y >= halfH;
      }
      // South Door (y goes above 224)
      if (y >= (roomMax - halfH) && this.wallTypes.s === WallType.Open) {
        return y <= (256 - halfH);
      }
    }

    if (isPlayer && y === centerLine) {
      // West Door (x goes below 32)
      if (x <= (wallSize + halfW) && this.wallTypes.w === WallType.Open) {
        return x >= halfW;
      }
      // East Door (x goes above 224)
      if (x >= (roomMax - halfW) && this.wallTypes.e === WallType.Open) {
        return x <= (256 - halfW);
      }
    }

    // 2. Standard Collision Bounds
    // Everything must stay within [32, 224] adjusted for their half-size.
    return (
      x >= (wallSize + halfW) &&
      x <= (roomMax - halfW) &&
      y >= (wallSize + halfH) &&
      y <= (roomMax - halfH)
    );
  }
}
