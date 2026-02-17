export enum EntityType {
  PLAYER = "player",
  ENEMY = "enemy",
  PICKUP = "pickup",
  PROJECTILE = "projectile",
  OTHER = "other"
}

export enum EntitySubtype {
  // Enemies
  MOBLIN = "moblin",
  SKELETON = "skeleton",
  BAT = "bat",
  SLIME = "slime",
  BOSS = "boss",

  // Pickups
  HEART = "heart",
  RUPEE = "rupee",
  WEAPON_UPGRADE = "weapon_upgrade",
  ITEM_UPGRADE = "item_upgrade",

  // Projectiles
  ARROW = "arrow",
  FIREBALL = "fireball",

  //Players
  LINK = "link",
  ZELDA = "zelda",
  SHEIK = "sheik",
  IMPA = "impa",
  GANONDORF = "ganondorf",
  DARUNIA = "darunia",
  RUTO = "ruto",
  AGITHA = "agitha",
  MIDNA = "midna",
  FI = "fi",
  GHIRARIM = "ghirarim",
  ZANT = "zant",
  LANA = "lana",
  CIA = "cia",
  VOLGA = "volga",
  WIZZRO = "wizzro",
  TWILI_MIDNA = "twili_midna",
  KID_LINK = "kid_link",
  TINGLE = "tingle",
  LINKLE = "linkle",
  SKULL_KID = "skull_kid",
  TOON_LINK = "toon_link",
  TETRA = "tetra",
  KING_DAPHNES = "king_daphnes",
  MEDLI = "medli", 
  MARIN = "marin", 
  TOON_ZELDA = "toon_zelda", 
  YUGA = "yuga",
  
  
  OTHER = "other"
}

/**
 * Defines the valid mapping of Subtypes to Types.
 */
export const ENTITY_TYPE_MAP = {
  [EntityType.PLAYER]: [EntitySubtype.LINK, EntitySubtype.ZELDA, EntitySubtype.SHEIK, EntitySubtype.IMPA, EntitySubtype.GANONDORF, EntitySubtype.DARUNIA, EntitySubtype.RUTO, EntitySubtype.AGITHA, EntitySubtype.MIDNA, EntitySubtype.FI, EntitySubtype.GHIRARIM, EntitySubtype.ZANT, EntitySubtype.LANA, EntitySubtype.CIA, EntitySubtype.VOLGA, EntitySubtype.WIZZRO, EntitySubtype.TWILI_MIDNA, EntitySubtype.KID_LINK, EntitySubtype.TINGLE, EntitySubtype.LINKLE, EntitySubtype.SKULL_KID, EntitySubtype.TOON_LINK, EntitySubtype.TETRA, EntitySubtype.KING_DAPHNES, EntitySubtype.MEDLI, EntitySubtype.MARIN, EntitySubtype.TOON_ZELDA, EntitySubtype.YUGA],
  [EntityType.ENEMY]: [EntitySubtype.MOBLIN, EntitySubtype.SKELETON, EntitySubtype.BAT, EntitySubtype.SLIME, EntitySubtype.BOSS],
  [EntityType.PICKUP]: [EntitySubtype.HEART, EntitySubtype.RUPEE, EntitySubtype.WEAPON_UPGRADE, EntitySubtype.ITEM_UPGRADE],
  [EntityType.PROJECTILE]: [EntitySubtype.ARROW, EntitySubtype.FIREBALL],
  [EntityType.OTHER]: [EntitySubtype.OTHER]
} as const;

/**
 * Type helper to get valid subtypes for a specific type.
 * Usage: const subtype: ValidSubtype<EntityType.ENEMY> = EntitySubtype.GOBLIN;
 */
export type ValidSubtype<T extends EntityType> = (typeof ENTITY_TYPE_MAP)[T][number];

/**
 * Utility to check validity at runtime.
 */
export function isValidSubtype(type: EntityType, subtype: EntitySubtype): boolean {
  return (ENTITY_TYPE_MAP[type] as readonly EntitySubtype[]).includes(subtype);
}
