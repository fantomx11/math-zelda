import { MathZeldaEvent, RoomType, WallType } from "../Enums";
import { EventBus } from "../EventBus";
import { gameState } from "../GameState";
import { EntityModel } from "./EntityModel";

interface WallTypes {
  n: WallType;
  s: WallType;
  e: WallType;
  w: WallType;
}

export interface RoomConfig {
  wallTypes: WallTypes;
  mathProblem?: { a: number, b: number, answer: number };
  roomType?: RoomType;
}

function generateMathProblem(level = gameState.currentLevel): { a: number, b: number, answer: number } {
  const a = level;
  const b = Math.floor(Math.random() * 10);
  const answer = a * b;
  return { a, b, answer };
}


function generateBossMathProblem(level: number): { a: number, b: number, answer: number } {
  // The tens digit is level + 1 (e.g., Level 1 -> Tens is 2, Level 2 -> Tens is 3)
  const targetTens = level + 1;
  const targetOnes = Math.floor(Math.random() * 10);
  const answer = (targetTens * 10) + targetOnes;

  // Attempt to find factor pairs (a * b = answer) for a multiplication problem
  const factors: { a: number, b: number }[] = [];
  
  // We check up to the square root of the answer to find all integer factors
  for (let i = 2; i <= Math.sqrt(answer); i++) {
    if (answer % i === 0) {
      factors.push({ a: i, b: answer / i });
    }
  }

  if (factors.length > 0) {
    // Randomly select one of the factor pairs discovered
    const pair = factors[Math.floor(Math.random() * factors.length)];
    // Randomly swap a and b for variety
    return Math.random() > 0.5 
      ? { a: pair.a, b: pair.b, answer } 
      : { a: pair.b, b: pair.a, answer };
  } else {
    // Fallback if the target number is prime (e.g., 23, 31, 37)
    return { a: 1, b: answer, answer };
  }
}

/**
 * Represents the data model for a single room in the dungeon.
 */
export class RoomModel {
  public wallTypes: { n: WallType; s: WallType; e: WallType; w: WallType };
  public mathProblem: { a: number, b: number, answer: number };
  public roomType: RoomType;
  
  public entities: EntityModel[] = [];
  public readonly gridSize: number = 8;

  constructor(config: RoomConfig) {
    const { wallTypes, mathProblem = generateMathProblem(), roomType = RoomType.Normal } = config;

    this.mathProblem = { ...mathProblem };
    this.wallTypes = { ...wallTypes };
    this.roomType = roomType;
  }

  public generateMathProblem(level? : number): void {
    this.mathProblem = generateMathProblem(level || gameState.currentLevel);
  }

  public generateBossMathProblem(level?: number): void {
    this.mathProblem = generateBossMathProblem(level || gameState.currentLevel);
  }

  public addEntity(entity: EntityModel): void {
    this.entities.push(entity);

    EventBus.on(MathZeldaEvent.EntityCulled, ({entity: culledEntity}) => {
      if (culledEntity === entity) {
        this.removeEntity(entity);
      }
    });
  }

  public removeEntity(entity: EntityModel): void {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }


  /**
   * Checks if a sprite's center (x, y) is within bounds.
   * @param x Center X coordinate
   * @param y Center Y coordinate
   * @param w Sprite width (default 16)
   * @param h Sprite height (default 16)
   */
  public isPassable(x: number, y: number, isPlayer = false, ignore: EntityModel[] = [], w: number = 16, h: number = 16): boolean {
    const gridSize = this.gridSize;
    for (const entity of this.entities) {
      if(ignore.includes(entity) || !entity.isBlocking) continue;
      
      const occupiedX: number[] = [];
      if (entity.isOnXGrid) {
        occupiedX.push(entity.x);
      } else {
        occupiedX.push(Math.floor(entity.x / gridSize) * gridSize);
        occupiedX.push(Math.ceil(entity.x / gridSize) * gridSize);
      }

      const occupiedY: number[] = [];
      if (entity.isOnYGrid) {
        occupiedY.push(entity.y);
      } else {
        occupiedY.push(Math.floor(entity.y / gridSize) * gridSize);
        occupiedY.push(Math.ceil(entity.y / gridSize) * gridSize);
      }

      if (occupiedX.includes(x) && occupiedY.includes(y)) {
        return false;
      }
    }

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
