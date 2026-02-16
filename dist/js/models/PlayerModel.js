import { ActorModel, IdleState, KnockbackState } from './ActorModel.js';
import { ITEM_CONFIG, WEAPON_CONFIG } from '../config.js';
export class AttackState {
    constructor(duration) {
        this.timer = Date.now() + duration;
    }
    enter(actor) { }
    update(actor, room, inputDir) {
        if (Date.now() > this.timer) {
            actor.changeState(new IdleState());
        }
    }
    getAnimKey(actor) {
        return `${actor.type}_atk_${actor.currentDir}`;
    }
}
export class PlayerModel extends ActorModel {
    constructor(x, y) {
        super(x, y, 6, .5); // HP: 6, Speed: 2
        this.inputDir = null;
        this.weapons = [];
        this.items = [];
        this.type = 'player';
        this.subtype = "player";
        this.weapons = ['Rapier', "Biggoron's Sword"];
        this.items = [...ITEM_CONFIG.names];
        this.currentWeapon = this.weapons[0];
        this.currentItem = this.items[0];
    }
    ai(room) {
        this.process(this.inputDir, room);
    }
    /**
     * Returns true if the player is currently in an attack state.
     */
    get isAttacking() {
        return this.state instanceof AttackState;
    }
    attack(duration) {
        if (this.state instanceof AttackState)
            return;
        if (this.state instanceof KnockbackState)
            return;
        this.changeState(new AttackState(duration));
    }
    getAnimKey() {
        if (this.isAttacking)
            return `${this.type}_atk_${this.currentDir}`;
        return super.getAnimKey();
    }
    getAttackValue() {
        const weaponIdx = WEAPON_CONFIG.names.indexOf(this.currentWeapon);
        const itemIdx = ITEM_CONFIG.names.indexOf(this.currentItem);
        return (weaponIdx * 10) + itemIdx;
    }
}
//# sourceMappingURL=PlayerModel.js.map