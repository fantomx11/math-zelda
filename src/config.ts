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
    [EntitySubtype.LINK]: {"name": "Link", x: 256, y: 0},
    [EntitySubtype.ZELDA]: {"name": "Zelda", x: 256, y: 16},
    [EntitySubtype.SHEIK]: {"name": "Shiek", x: 256, y: 32},
    [EntitySubtype.IMPA]: {"name": "Impa", x: 256, y: 48},
    [EntitySubtype.GANONDORF]: {"name": "Ganondorf", x: 256, y: 64},
    [EntitySubtype.DARUNIA]: {"name": "Darunia", x: 256, y: 80},
    [EntitySubtype.RUTO]: {"name": "Ruto", x: 256, y: 96},
    [EntitySubtype.AGITHA]: {"name": "Agitha", x: 256, y: 112},
    [EntitySubtype.MIDNA]: {"name": "Midna", x: 256, y: 128},
    [EntitySubtype.FI]: {"name": "Fi", x: 256, y: 144},
    [EntitySubtype.GHIRARIM]: {"name": "Ghirarim", x: 256, y: 160},
    [EntitySubtype.ZANT]: {"name": "Zant", x: 256, y: 176},
    [EntitySubtype.LANA]: {"name": "Lana", x: 256, y: 192},
    [EntitySubtype.CIA]: {"name": "Cia", x: 256, y: 208},
    [EntitySubtype.VOLGA]: {"name": "Volga", x: 256, y: 224},
    [EntitySubtype.WIZZRO]: {"name": "Wizzro", x: 256, y: 240},
    [EntitySubtype.TWILI_MIDNA]: {"name": "Twili Midna", x: 256, y: 256},
    [EntitySubtype.KID_LINK]: {"name": "Kid Link", x: 256, y: 272},
    [EntitySubtype.TINGLE]: {"name": "Tingle", x: 256, y: 288},
    [EntitySubtype.LINKLE]: {"name": "Linkle", x: 256, y: 304},
    [EntitySubtype.SKULL_KID]: {"name": "Skull Kid", x: 256, y: 320},
    [EntitySubtype.TOON_LINK]: {"name": "Toon Link", x: 256, y: 336},
    [EntitySubtype.TETRA]: {"name": "Tetra", x: 256, y: 352},
    [EntitySubtype.KING_DAPHNES]: {"name": "King Daphnes", x: 256, y: 368},
    [EntitySubtype.MEDLI]: {"name": "Medli", x: 256, y: 384},
    [EntitySubtype.MARIN]: {"name": "Marin", x: 256, y: 400},
    [EntitySubtype.TOON_ZELDA]: {"name": "Toon Zelda", x: 256, y: 416},
    [EntitySubtype.YUGA]: {"name": "Yuga", x: 256, y: 432}
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
