/**
 * Represents the data model for a single room in the dungeon.
 */
export class RoomModel {
    constructor() {
        this.cornerSize = 32;
        this.floorSize = 192;
        this.wallTypes = { n: 'open', s: 'solid', e: 'solid', w: 'solid' };
    }
}
//# sourceMappingURL=RoomModel.js.map