import { EntitySubtype, ItemType, WeaponType } from "./Enums";

/**
 * Configuration for animation frames.
 */
export interface AnimFrameConfig {
  start: number;
  length: number;
  rate: number;
  repeat: boolean;
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
    down_walk: { start: 0, length: 2, rate: 8, repeat: true },
    up_walk: { start: 2, length: 2, rate: 8, repeat: true },
    left_walk: { start: 4, length: 2, rate: 8, repeat: true },
    right_walk: { start: 6, length: 2, rate: 8, repeat: true },
    down_attack: { start: 8, length: 1, rate: 10, repeat: false },
    up_attack: { start: 9, length: 1, rate: 10, repeat: false },
    left_attack: { start: 10, length: 1, rate: 10, repeat: false },
    right_attack: { start: 11, length: 1, rate: 10, repeat: false },
    down_idle: { start: 0, length: 1, rate: 8, repeat: true },
    up_idle: { start: 2, length: 1, rate: 8, repeat: true },
    left_idle: { start: 4, length: 1, rate: 8, repeat: true },
    right_idle: { start: 6, length: 1, rate: 8, repeat: true },
    item_1h: { start: 12, length: 1, rate: 10, repeat: false },
    item_2h: { start: 13, length: 1, rate: 10, repeat: false }
  } as Record<string, AnimFrameConfig>
};

/**
 * Configuration for weapons.
 */
export const WeaponConfig = {
  [WeaponType.Rapier]:         {name: "Rapier", x: 64, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.BiggoronsSword]: {name: "Biggoron's Sword", x: 80, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.SwordOfDemise]: {name: "Sword of Demise", x: 80, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.Hammer]: {name: "Hammer", x: 80, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.ShadowScimitar]: {name: "Shadow Scimitar", x: 80, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.ProtectorSword]: {name: "Protector Sword", x: 80, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.DragonSpear]: {name: "Dragon Spear", x: 80, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.CutlassOfLight]: {name: "Cutlass of Light", x: 80, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.DemonSword]: {name: "Demon Sword", x: 80, y: 416, w: 16, h: 16, length: 1},
  [WeaponType.MasterSword]: {name: "Master Sword", x: 80, y: 416, w: 16, h: 16, length: 1},
};

export const WeaponLevels: WeaponType[] = [
  WeaponType.Rapier,
  WeaponType.BiggoronsSword,
  WeaponType.SwordOfDemise,
  WeaponType.Hammer,
  WeaponType.ShadowScimitar,
  WeaponType.ProtectorSword,
  WeaponType.DragonSpear,
  WeaponType.CutlassOfLight,
  WeaponType.DemonSword,
  WeaponType.MasterSword
];

export const ItemLevels: ItemType[] = [
  ItemType.Nothing,
  ItemType.BlueRing,
  ItemType.RedRing,
  ItemType.BlueBracelet,
  ItemType.RedBracelet,
  ItemType.MoonPearl,
  ItemType.FirePearl,
  ItemType.BombosMedallion,
  ItemType.EtherMedallion,
  ItemType.QuakeMedallion
];

/**
 * Configuration for items.
 */
export const ITEM_CONFIG = {
  startPos: { x: 64, y: 432 },
  frameSize: { w: 16, h: 16 },
  names: ["Nothing", "Blue Ring", "Red Ring", "Blue Bracelet", "Red Bracelet", "Moon Pearl", "Fire Pearl", "Bombos Medallion", "Ether Medallion", "Quake Medallion"]
};
