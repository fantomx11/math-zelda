import { MonsterModel } from './MonsterModel.js';
import { MoveState } from './ActorModel.js';
export class MoblinModel extends MonsterModel {
    constructor(x, y, palette = '') {
        super(x, y, 'moblin', .25);
        this.hp = 2;
        this.subtype = 'moblin' + palette;
        this.x = x;
        this.speed = .25;
    }
    getAnimKey() {
        return `${this.subtype}_${this.currentDir}${this.state instanceof MoveState ? '' : '_idle'}`;
    }
}
//# sourceMappingURL=MoblinModel.js.map