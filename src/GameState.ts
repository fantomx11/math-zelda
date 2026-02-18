import { RoomModel } from './models/RoomModel';
import { EnemyModel } from './models/EnemyModel';
import { PickupModel } from './models/PickupModel';
import { EntityModel } from './models/EntityModel';
import { EventBus } from './EventBus';
import { MathZeldaEvent } from './Event';

export class GameState {
  private static _instance: GameState;

  public room: RoomModel;
  public entities: EntityModel[] = [];

  private constructor() {
    this.room = new RoomModel();
  }

  public static get instance(): GameState {
    if (!this._instance) {
      this._instance = new GameState();
    }
    return this._instance;
  }

  public initialize() {
    this.entities = [];
  }

  public update() {
    const {culledEntities, liveEntities} = this.entities.reduce((acc, entity) => {
      if (entity instanceof EnemyModel || entity instanceof PickupModel) {
        acc.culledEntities.push(entity);
      } else {
        acc.liveEntities.push(entity);
      }
      return acc;
    }, {culledEntities: [] as EntityModel[], liveEntities: [] as EntityModel[]});

    this.entities = liveEntities;

    culledEntities.forEach(entity => {
      EventBus.emit(MathZeldaEvent.ENTITY_CULLED, { entity });
    });
  }
}