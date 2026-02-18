import { EntitySubtype } from "./EntityType";

/**
 * Configuration for animation frames.
 */
export interface AnimFrameConfig {
  start: number;
  length: number;
  rate: number;
  repeat: number;
}

/**
 * Configuration for the skin system.
 */
export const SKIN_CONFIG = {
  skinDefs: {
    [EntitySubtype.Link]: {"name": "Link", x: 256, y: 0},
    [EntitySubtype.Zelda]: {"name": "Zelda", x: 256, y: 16},
    [EntitySubtype.Sheik]: {"name": "Shiek", x: 256, y: 32},
    [EntitySubtype.Impa]: {"name": "Impa", x: 256, y: 48},
    [EntitySubtype.Ganondorf]: {"name": "Ganondorf", x: 256, y: 64},
    [EntitySubtype.Darunia]: {"name": "Darunia", x: 256, y: 80},
    [EntitySubtype.Ruto]: {"name": "Ruto", x: 256, y: 96},
    [EntitySubtype.Agitha]: {"name": "Agitha", x: 256, y: 112},
    [EntitySubtype.Midna]: {"name": "Midna", x: 256, y: 128},
    [EntitySubtype.Fi]: {"name": "Fi", x: 256, y: 144},
    [EntitySubtype.Ghirarim]: {"name": "Ghirarim", x: 256, y: 160},
    [EntitySubtype.Zant]: {"name": "Zant", x: 256, y: 176},
    [EntitySubtype.Lana]: {"name": "Lana", x: 256, y: 192},
    [EntitySubtype.Cia]: {"name": "Cia", x: 256, y: 208},
    [EntitySubtype.Vlga]: {"name": "Volga", x: 256, y: 224},
    [EntitySubtype.Wizzro]: {"name": "Wizzro", x: 256, y: 240},
    [EntitySubtype.TwiliMidna]: {"name": "Twili Midna", x: 256, y: 256},
    [EntitySubtype.KidLink]: {"name": "Kid Link", x: 256, y: 272},
    [EntitySubtype.Tingle]: {"name": "Tingle", x: 256, y: 288},
    [EntitySubtype.Linkle]: {"name": "Linkle", x: 256, y: 304},
    [EntitySubtype.SkullKid]: {"name": "Skull Kid", x: 256, y: 320},
    [EntitySubtype.ToonLink]: {"name": "Toon Link", x: 256, y: 336},
    [EntitySubtype.Tetra]: {"name": "Tetra", x: 256, y: 352},
    [EntitySubtype.KingDaphnes]: {"name": "King Daphnes", x: 256, y: 368},
    [EntitySubtype.Medli]: {"name": "Medli", x: 256, y: 384},
    [EntitySubtype.Marin]: {"name": "Marin", x: 256, y: 400},
    [EntitySubtype.ToonZelda]: {"name": "Toon Zelda", x: 256, y: 416},
    [EntitySubtype.Yuga]: {"name": "Yuga", x: 256, y: 432}
  },
  anims: {
    down_walk: { start: 0, length: 2, rate: 8, repeat: -1 },
    up_walk: { start: 2, length: 2, rate: 8, repeat: -1 },
    left_walk: { start: 4, length: 2, rate: 8, repeat: -1 },
    right_walk: { start: 6, length: 2, rate: 8, repeat: -1 },
    down_attack: { start: 8, length: 1, rate: 10, repeat: 0 },
    up_attack: { start: 9, length: 1, rate: 10, repeat: 0 },
    left_attack: { start: 10, length: 1, rate: 10, repeat: 0 },
    right_attack: { start: 11, length: 1, rate: 10, repeat: 0 },
    down_idle: { start: 0, length: 1, rate: 8, repeat: -1 },
    up_idle: { start: 2, length: 1, rate: 8, repeat: -1 },
    left_idle: { start: 4, length: 1, rate: 8, repeat: -1 },
    right_idle: { start: 6, length: 1, rate: 8, repeat: -1 },
    item_1h: { start: 12, length: 1, rate: 10, repeat: 0 },
    item_2h: { start: 13, length: 1, rate: 10, repeat: 0 }
  } as Record<string, AnimFrameConfig>
};

/**
 * Configuration for weapons.
 */
export const WEAPON_CONFIG = {
  startPos: { x: 64, y: 416 },
  frameSize: { w: 16, h: 16 },
  names: ["Rapier", "Biggoron's Sword", "Sword of Demise", "Hammer", "Shadow Scimitar", "Protector Sword", "Dragon Spear", "Cutlass of Light", "Demon Sword", "Master Sword"]
};

/**
 * Configuration for items.
 */
export const ITEM_CONFIG = {
  startPos: { x: 64, y: 432 },
  frameSize: { w: 16, h: 16 },
  names: ["Nothing", "Blue Ring", "Red Ring", "Blue Bracelet", "Red Bracelet", "Moon Pearl", "Fire Pearl", "Bombos Medallion", "Ether Medallion", "Quake Medallion"]
};
