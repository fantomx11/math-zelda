import { MonsterModel } from '../models/MonsterModel.js';
import { MoblinModel } from '../models/MoblinModel.js';
import { PickupModel } from '../models/PickupModel.js';
export class EntityManager {
    constructor(scene, dungeonOffset) {
        this.actors = [];
        this.typeEquations = new Map();
        this.scene = scene;
        this.dungeonOffset = dungeonOffset;
    }
    clear() {
        this.actors.forEach(e => e.sprite.destroy());
        this.actors = [];
        this.typeEquations.clear();
    }
    spawn(x, y, type, skin = '', level = 1) {
        let model;
        if (type === 'moblin')
            model = new MoblinModel(x, y, skin);
        else
            model = new MonsterModel(x, y, type);
        if (this.typeEquations.has(model.subtype)) {
            model.mathProblem = Object.assign({}, this.typeEquations.get(model.subtype));
        }
        else {
            model.mathProblem.a = Phaser.Math.Between(0, level);
            model.mathProblem.b = Phaser.Math.Between(0, 9);
            model.mathProblem.answer = model.mathProblem.a * model.mathProblem.b;
            this.typeEquations.set(model.subtype, Object.assign({}, model.mathProblem));
        }
        const sprite = this.scene.add.sprite(x + this.dungeonOffset, y, 'master_sheet');
        sprite.play(model.getIdleAnimKey());
        this.actors.push({ model, sprite });
    }
    addActor(model, sprite) {
        this.actors.push({ model, sprite });
    }
    update(room, scene) {
        const remainingActors = [];
        for (const actor of this.actors) {
            if (actor.model.destroy) {
                actor.sprite.destroy();
                actor.model.onDeath(scene);
            }
            else {
                actor.model.ai(room);
                actor.sprite.setPosition(actor.model.x + this.dungeonOffset, actor.model.y);
                actor.sprite.setAlpha(actor.model.alpha);
                actor.sprite.setDepth(actor.model.y);
                const animKey = actor.model.getAnimKey();
                if (animKey) {
                    actor.sprite.play(animKey, true);
                    console.log(`Playing animation: ${animKey} for ${actor.model.subtype}`);
                }
                remainingActors.push(actor);
            }
            for (const a1 of this.actors) {
                for (const a2 of this.actors) {
                    if (a1 === a2)
                        continue;
                    if (Math.abs(a1.model.x - a2.model.x) < 12 && Math.abs(a1.model.y - a2.model.y) < 12)
                        a1.model.onTouch(a2.model);
                }
            }
        }
        this.actors = remainingActors;
    }
    getActors() {
        return this.actors;
    }
    getCollidingEnemy(playerModel) {
        const px = playerModel.x;
        const py = playerModel.y;
        const entry = this.actors.find(e => e.model.type !== 'player' && e.model.type !== 'pickup' && Math.abs(e.model.x - px) < 12 && Math.abs(e.model.y - py) < 12);
        return entry ? entry.model : null;
    }
    handleWeaponCollision(box, damage, sourceX, sourceY, attackValue) {
        let killed = false;
        for (const e of this.actors) {
            if (e.model.type === 'player')
                continue; // Don't hit player
            if (Math.abs(e.model.x - box.x) < 16 && Math.abs(e.model.y - box.y) < 16) {
                const monster = e.model;
                if (monster.mathProblem.answer !== attackValue) {
                    continue;
                }
                e.sprite.setTint(0xff0000);
                this.scene.time.delayedCall(150, () => { if (e.sprite.scene)
                    e.sprite.clearTint(); });
                if (e.model.takeDamage(damage, sourceX, sourceY)) {
                    killed = true;
                }
            }
        }
        return killed;
    }
    getCollidingPickup(player) {
        for (const actor of this.actors) {
            if (actor.model instanceof PickupModel) {
                const dx = player.x - actor.model.x;
                const dy = player.y - actor.model.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 12) { // Collision radius
                    return actor.model;
                }
            }
        }
        return null;
    }
    count(type) {
        return this.actors.filter(e => e.model.type === type && !e.model.destroy).length;
    }
}
//# sourceMappingURL=EnemyManager.js.map