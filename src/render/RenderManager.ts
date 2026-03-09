import { MathZeldaEvent } from "../Enums";
import { EventBus } from "../EventBus";
import { EntityModel } from "../models/EntityModel";

export class RenderManager {
  private entitySprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

  constructor(private scene: Phaser.Scene) {
    // Listen for model changes
    EventBus.on(MathZeldaEvent.EntitySpawned, (entity: EntityModel) => this.createSprite(entity));
    EventBus.on(MathZeldaEvent.EntityCulled, (entity: EntityModel) => this.destroySprite(entity));
  }

  update() {
    // Sync logic: Just move sprites to where models say they are
    gameState.entities.forEach(model => {
      const sprite = this.entitySprites.get(model.id);
      if (sprite) {
        sprite.setPosition(model.x, model.y);
        // Agnostic: just play whatever animation state the model is in
        sprite.play(model.currentAnim, true); 
      }
    });
  }
}