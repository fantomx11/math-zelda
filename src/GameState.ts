import { RoomModel } from './models/RoomModel';
import { EnemyModel } from './models/EnemyModel';
import { PickupModel } from './models/PickupModel';
import { EntityModel } from './models/EntityModel';
import { EventBus } from './EventBus';
import { MathZeldaEvent } from './Event';
import { PlayerModel } from './models/PlayerModel';
import { Direction } from './Enums';
import { DirectionVectors } from './config';
import { LevelModel } from './models/LevelModel';

class GameState {
  private _currentRoomX: number;
  private _currentRoomY: number;
  private _entities: EntityModel[] = [];
  private _currentLevel!: LevelModel;
  private _itemFound: boolean = false;

  public player!: PlayerModel;

  constructor(level = 1) {
    this.startLevel(level);

    this._currentRoomX = 0;
    this._currentRoomY = 0;
  }
  
  public get currentRoom(): RoomModel {
    if(this._currentRoomX > 0 && this._currentRoomX < this._currentLevel.rooms.length &&
       this._currentRoomY > 0 && this._currentRoomY < this._currentLevel.rooms[this._currentRoomX].length) {
      return this._currentLevel.rooms[this._currentRoomX][this._currentRoomY];
    } else {
      throw new Error(`Current room coordinates (${this._currentRoomX}, ${this._currentRoomY}) are out of bounds.`);
    }
  }

  public get currentLevel(): LevelModel {
    return this._currentLevel;
  }

  public get itemFound(): boolean {
    return this._itemFound;
  }

  private set currentLevel(level: number) {
    this._currentLevel = level;
  }

  startLevel(level = 1) {
    this._currentLevel = new LevelModel(level);
    this._currentRoomX = 0;
    this._currentRoomY = 0;
    this._itemFound = false;
    
    EventBus.emit(MathZeldaEvent.LevelChanged);
    EventBus.emit(MathZeldaEvent.RoomChanged);
  }

  public moveToRoom(direction: Direction) {
    const dX = DirectionVectors[direction].x;
    const dY = DirectionVectors[direction].y;

    this._currentRoomX += dX;
    this._currentRoomY += dY;

    EventBus.emit(MathZeldaEvent.RoomChanged);
  }

  public initialize() {
    this._entities = [];
  }

  public update() {
    const { culledEntities, liveEntities } = this._entities.reduce((acc, entity) => {
      if (entity instanceof EnemyModel || entity instanceof PickupModel) {
        acc.culledEntities.push(entity);
      } else {
        acc.liveEntities.push(entity);
      }
      return acc;
    }, { culledEntities: [] as EntityModel[], liveEntities: [] as EntityModel[] });

    this._entities = liveEntities;

    culledEntities.forEach(entity => {
      EventBus.emit(MathZeldaEvent.EntityCulled, { entity });
    });
  }

  public spawnEntity(entity: EntityModel) {
    this._entities.push(entity);
  }

  public findItem() {
    this._itemFound = true;
  }
}

export const gameState = new GameState();