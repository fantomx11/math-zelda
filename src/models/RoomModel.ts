export type WallType = 'open' | 'solid' | 'locked' | 'shut';

/**
 * Represents the data model for a single room in the dungeon.
 */
export class RoomModel {
  public cornerSize: number;
  public floorSize: number;
  public wallTypes: { n: WallType; s: WallType; e: WallType; w: WallType };

  constructor() {
    this.cornerSize = 32;
    this.floorSize = 192;
    this.wallTypes = { n: 'open', s: 'solid', e: 'solid', w: 'solid' };
  }
}
