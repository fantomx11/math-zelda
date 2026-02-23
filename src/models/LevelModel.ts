import { RoomType, WallType } from "../Enums";
import { EnemyModel } from "./EnemyModel";
import { RoomModel } from "./RoomModel";

interface GridCell {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
    visited: boolean;
    type: RoomType;
    cleared?: boolean;
    itemCollected?: boolean;
}

interface Point {
    x: number;
    y: number;
}

function generateMaze(startPos: Point, size: number = 4): RoomModel[][] {
    let grid: GridCell[][] = [];
    let deadEnds: Point[] = [];

    // Loop until we find a maze with enough dead ends
    while (deadEnds.length < 2) {
        // Reset grid
        grid = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => ({
                north: false, south: false, east: false, west: false,
                visited: false, type: RoomType.Normal
            }))
        );

        const { x: sx, y: sy } = startPos;
        grid[sy][sx].type = RoomType.Start;

        carve(grid, sx, sy);
        deadEnds = getDeadEnds(grid, sx, sy);
    }

    // Shuffle and assign special rooms
    deadEnds.sort(() => Math.random() - 0.5);
    const boss = deadEnds.pop()!;
    const item = deadEnds.pop()!;
    grid[boss.y][boss.x].type = RoomType.Boss;
    grid[item.y][item.x].type = RoomType.Item;

    let rooms: RoomModel[][] = [];
    for (let y = 0; y < size; y++) {
        let row: RoomModel[] = [];
        for (let x = 0; x < size; x++) {
            const { north, south, east, west, type: roomType } = grid[x][y];
            row.push(new RoomModel({
                wallTypes: {
                    n: north ? WallType.Open : WallType.Solid,
                    s: south ? WallType.Open : WallType.Solid,
                    e: east ? WallType.Open : WallType.Solid,
                    w: west ? WallType.Open : WallType.Solid
                },
                roomType
            }));
        }
        rooms.push(row);
    }

    return rooms;
}

function carve(grid: GridCell[][], cx: number, cy: number): void {
    grid[cy][cx].visited = true;
    const directions = [
        { x: 0, y: -1, wall: 'north', opp: 'south' },
        { x: 0, y: 1, wall: 'south', opp: 'north' },
        { x: 1, y: 0, wall: 'east', opp: 'west' },
        { x: -1, y: 0, wall: 'west', opp: 'east' }
    ].sort(() => Math.random() - 0.5);

    for (let { x, y, wall, opp } of directions) {
        let nx = cx + x, ny = cy + y;
        if (nx >= 0 && nx < grid.length && ny >= 0 && ny < grid[nx].length && !grid[ny][nx].visited) {
            (grid[cy][cx] as any)[wall] = true;
            (grid[ny][nx] as any)[opp] = true;
            carve(grid, nx, ny);
        }
    }
}

function getDeadEnds(grid: GridCell[][], startX: number, startY: number): Point[] {
    const ends: Point[] = [];
    for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
            const r = grid[y][x];
            // Count open walls
            const exits = [r.north, r.south, r.east, r.west].filter(v => v).length;

            // A dead end has 1 exit and isn't where we started
            if (exits === 1 && !(x === startX && y === startY)) {
                ends.push({ x, y });
            }
        }
    }
    return ends;
}

export class LevelModel {
    public levelNumber: number;
    public rooms: RoomModel[][];

    constructor(levelNumber: number, rooms: RoomModel[][]) {
        this.levelNumber = levelNumber;
        this.rooms = rooms;
    }

    public generateLevel(levelNumber: number): void {
        // Generate the 4x4 grid layout
        this.rooms = generateMaze({ x: 0, y: 0 });

        const targetRooms: RoomModel[] = [];

        // 1. Identify Boss room and collect all Normal/Item rooms
        this.rooms.forEach(row => row.forEach(room => {
            if (room.roomType === RoomType.Normal || room.roomType === RoomType.Item) {
                targetRooms.push(room);
            } else if (room.roomType === RoomType.Boss) {
                // Boss problem has its own unique generation logic
                room.generateBossMathProblem(levelNumber);
            }
        }));

        // 2. Prepare the set of 14 multipliers
        // Start with the required 0-9 facts
        const multipliers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        // Fill the remaining spots (usually 4) with random factors from 0-9
        while (multipliers.length < targetRooms.length) {
            multipliers.push(Math.floor(Math.random() * 10));
        }

        // 3. Shuffle the multipliers to distribute them randomly across the rooms
        multipliers.sort(() => Math.random() - 0.5);

        // 4. Assign the prepared problems to the target rooms
        targetRooms.forEach((room, index) => {
            const b = multipliers[index];
            room.mathProblem = {
                a: levelNumber,
                b: b,
                answer: levelNumber * b
            };
        });
    }
}