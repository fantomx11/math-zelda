import { EnemyModel } from '../models/EnemyModel.js';
import { MoblinModel } from '../models/MoblinModel.js';
import { RoomModel } from '../models/RoomModel.js';
import { PlayerModel } from '../models/PlayerModel.js';
import { EntityModel } from '../models/EntityModel.js';
import { PickupModel } from '../models/PickupModel.js';
import { DungeonScene } from '../scenes/DungeonScene.js';
import { ActorModel } from '../models/ActorModel.js';

/**
 * Interface representing a paired model and its visual representation in the scene.
 */
interface EntityInstance {
  model: EntityModel;
  sprite: Phaser.GameObjects.Sprite;
}

/**
 * Manages the lifecycle, collisions, and updates of all entities within the dungeon.
 */
export class EntityManager {
  // #region Static

  // #region Static Properties
  // No static properties currently defined.
  // #endregion

  // #region Static Initializer
  // No static initializer currently defined.
  // #endregion

  // #region Static Accessors
  // No static accessors currently defined.
  // #endregion

  // #region Static Methods
  // No static methods currently defined.
  // #endregion

  // #endregion

  // #region Instance

  // #region Instance Properties

  /** The Phaser scene context. */
  private scene: Phaser.Scene;

  /** Collection of active entities and their sprites. */
  private actors: EntityInstance[] = [];

  /** The horizontal offset applied to entity sprites for dungeon rendering. */
  private dungeonOffset: number;

  // #endregion

  // #region Constructor
  /**
   * @param scene - The current Phaser scene.
   * @param dungeonOffset - The X-axis offset for the dungeon layer.
   */
  constructor(scene: Phaser.Scene, dungeonOffset: number) {
    this.scene = scene;
    this.dungeonOffset = dungeonOffset;
  }
  // #endregion

  // #region Instance Accessors
  /**
   * Retrieves all current entity instances.
   * @returns An array of EntityInstances.
   */
  public get actorsList(): EntityInstance[] {
    return this.actors;
  }
  // #endregion

  // #region Instance Methods
  /**
   * Destroys all entity sprites and clears the actor list.
   */
  public clear(): void {
    this.actors.forEach(e => e.sprite.destroy());
    this.actors = [];
  }

  /**
   * Spawns a new entity into the scene based on a model.
   * @param model - The data model for the entity to spawn.
   */
  public spawn(model: EntityModel): void {
    const sprite = this.scene.add.sprite(model.x + this.dungeonOffset, model.y, 'master_sheet');
    sprite.play(model.getAnimKey());
    this.actors.push({ model, sprite });
  }

  /**
   * Manually adds an existing actor and sprite to the manager.
   * @param model - The entity model (note: original code passed model as EntityInstance).
   * @param sprite - The Phaser sprite associated with the entity.
   */
  public addActor(model: any, sprite: Phaser.GameObjects.Sprite): void {
    this.actors.push({ model, sprite });
  }

  /**
   * Updates all entities: handles movement, animations, culling, and collisions.
   * @param room - The current room model.
   * @param scene - The dungeon scene context.
   */
  public update(room: RoomModel, scene: DungeonScene): void {
    const { remainingActors, culledActors } = this.actors.reduce((acc, actor) => {
      if (actor.model.tick()) {
        acc.remainingActors.push(actor);
      } else {
        acc.culledActors.push(actor);
      }
      return acc;
    }, { remainingActors: [], culledActors: [] } as { remainingActors: EntityInstance[], culledActors: EntityInstance[] });

    // Remove sprites for entities that are no longer active
    culledActors.forEach(e => {
      e.sprite.destroy();
    });

    remainingActors.forEach(actor => {
      // Sync sprite position and visuals
      actor.sprite.setPosition(actor.model.x + this.dungeonOffset, actor.model.y);
      actor.sprite.setAlpha(actor.model.alpha);
      actor.sprite.setDepth(actor.model.y);

      // Update animations
      const animKey = actor.model.getAnimKey();
      if (animKey) {
        actor.sprite.play(animKey, true);
      }

      // Simple proximity-based entity collision
      remainingActors.forEach(other => {
        if (actor === other) return;
        if (Math.abs(actor.model.x - other.model.x) < 12 && Math.abs(actor.model.y - other.model.y) < 12) {
          actor.model.onTouch(other.model);
        }
      });
    });

    this.actors = remainingActors;
  }

  /**
   * Finds an enemy entity colliding with the player.
   * @param playerModel - The model of the player to check against.
   * @returns The colliding EntityModel or null.
   */
  public getCollidingEnemy(playerModel: any): EntityModel | null {
    const px = playerModel.x;
    const py = playerModel.y;
    const entry = this.actors.find(e =>
      e.model.type !== 'player' &&
      e.model.type !== 'pickup' &&
      Math.abs(e.model.x - px) < 12 &&
      Math.abs(e.model.y - py) < 12
    );
    return entry ? entry.model : null;
  }

  /**
   * Handles hit detection between a weapon hit-box and entities.
   * @param box - The coordinates of the attack.
   * @param damage - Amount of damage to deal.
   * @param sourceX - X-coordinate of the damage source (for knockback).
   * @param sourceY - Y-coordinate of the damage source (for knockback).
   * @returns True if an entity was killed.
   */
  public handleWeaponCollision(box: { x: number; y: number }, damage: number, sourceX: number, sourceY: number): boolean {
    let killed = false;
    for (const e of this.actors) {
      if (e.model.type === 'enemy' || e.model.type === 'boss') {

        if (Math.abs(e.model.x - box.x) < 16 && Math.abs(e.model.y - box.y) < 16) {
          // Visual feedback
          e.sprite.setTint(0xff0000);
          this.scene.time.delayedCall(150, () => {
            if (e.sprite && e.sprite.scene) e.sprite.clearTint();
          });

          if ((<ActorModel>e.model).takeDamage(damage, sourceX, sourceY)) {
            killed = true;
          }
        }
      }
    }
    return killed;
  }

  /**
   * Checks if the player is touching a pickup item.
   * @param player - The player model.
   * @returns The PickupModel being touched, or null.
   */
  public getCollidingPickup(player: PlayerModel): PickupModel | null {
    for (const actor of this.actors) {
      if (actor.model instanceof PickupModel) {
        const dx = player.x - actor.model.x;
        const dy = player.y - actor.model.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 12) {
          return actor.model as PickupModel;
        }
      }
    }
    return null;
  }

  public getEntities(type?: string): EntityModel[] {
    return this.actors
      .filter(e => !type || e.model.type === type)
      .map(e => e.model);
  }

  /**
   * Counts active entities of a specific type.
   * @param type - The string type of the entity.
   * @returns The count of matching entities.
   */
  public count(type: string): number {
    return this.actors.filter(e => e.model.type === type).length;
  }
  // #endregion

  // #endregion
}