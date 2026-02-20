import { RoomModel } from './models/RoomModel';
import { EnemyModel } from './models/EnemyModel';
import { PickupModel } from './models/PickupModel';
import { EntityModel } from './models/EntityModel';
import { EventBus } from './EventBus';
import { MathZeldaEvent } from './Event';
import { HeartPickupModel } from './models/HeartPickupModel';
import { PlayerModel } from './models/PlayerModel';

class GameState {
  private _currentRoomX: number;
  private _currentRoomY: number;
  private _rooms: RoomModel[][] = [];
  private _entities: EntityModel[] = [];
  private _currentLevel: number = 1;
  private _itemFound: boolean = false;

  public player: PlayerModel;

  constructor() {
    this._currentRoomX = 0;
    this._currentRoomY = 0;
  }
  
  public get currentRoom(): RoomModel {
    if(this._currentRoomX > 0 && this._currentRoomX < this._rooms.length && this._currentRoomY > 0 && this._currentRoomY < this._rooms[this._currentRoomX].length) {
      return this._rooms[this._currentRoomX][this._currentRoomY];
    } else {
      throw new Error(`Current room coordinates (${this._currentRoomX}, ${this._currentRoomY}) are out of bounds.`);
    }
  }

  public get currentLevel(): number {
    return this._currentLevel;
  }

  public get itemFound(): boolean {
    return this._itemFound;
  }

  private set currentLevel(level: number) {
    this._currentLevel = level;
  }

  startLevel(level = 1) {
    this._currentLevel = level;
    this._rooms = RoomModel.generateLevel(level);
    this._currentRoomX = 0;
    this._currentRoomY = 0;
    this._itemFound = false;
    
    EventBus.emit(MathZeldaEvent.LevelChanged);
    EventBus.emit(MathZeldaEvent.RoomChanged);
  }

  public moveToRoom(direction: Direction) {
    const newRoom = this.currentRoom.getAdjacentRoom(direction);
    if (newRoom) {
      this._currentRoom = newRoom;
      EventBus.emit(MathZeldaEvent.RoomChanged, { room: newRoom });
    }
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

}

export const gameState = new GameState();