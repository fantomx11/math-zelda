/**
 * Maps every Subtype back to its parent EntityType.
 * This is your single source of truth.
 */
export const SUBTYPE_TO_TYPE: Record<EntitySubtype, EntityType> = {
  // Players
  [EntitySubtype.Link]: EntityType.Player,
  [EntitySubtype.Zelda]: EntityType.Player,
  [EntitySubtype.Sheik]: EntityType.Player,
  [EntitySubtype.Impa]: EntityType.Player,
  [EntitySubtype.Ganondorf]: EntityType.Player,
  [EntitySubtype.Darunia]: EntityType.Player,
  [EntitySubtype.Ruto]: EntityType.Player,
  [EntitySubtype.Agitha]: EntityType.Player,
  [EntitySubtype.Midna]: EntityType.Player,
  [EntitySubtype.Fi]: EntityType.Player,
  [EntitySubtype.Ghirarim]: EntityType.Player,
  [EntitySubtype.Zant]: EntityType.Player,
  [EntitySubtype.Lana]: EntityType.Player,
  [EntitySubtype.Cia]: EntityType.Player,
  [EntitySubtype.Vlga]: EntityType.Player,
  [EntitySubtype.Wizzro]: EntityType.Player,
  [EntitySubtype.TwiliMidna]: EntityType.Player,
  [EntitySubtype.KidLink]: EntityType.Player,
  [EntitySubtype.Tingle]: EntityType.Player,
  [EntitySubtype.Linkle]: EntityType.Player,
  [EntitySubtype.SkullKid]: EntityType.Player,
  [EntitySubtype.ToonLink]: EntityType.Player,
  [EntitySubtype.Tetra]: EntityType.Player,
  [EntitySubtype.KingDaphnes]: EntityType.Player,
  [EntitySubtype.Medli]: EntityType.Player,
  [EntitySubtype.Marin]: EntityType.Player,
  [EntitySubtype.ToonZelda]: EntityType.Player,
  [EntitySubtype.Yuga]: EntityType.Player,

  // Enemies
  [EntitySubtype.Moblin]: EntityType.Enemy,
  [EntitySubtype.Keese]: EntityType.Enemy,
  [EntitySubtype.Gel]: EntityType.Enemy,
  [EntitySubtype.Zol]: EntityType.Enemy,
  [EntitySubtype.Goriya]: EntityType.Enemy,
  [EntitySubtype.Darknut]: EntityType.Enemy,
  [EntitySubtype.Octorok]: EntityType.Enemy,
  [EntitySubtype.Lynel]: EntityType.Enemy,

  // Bosses
  [EntitySubtype.Gleeok]: EntityType.Boss,
  [EntitySubtype.Gohma]: EntityType.Boss,
  [EntitySubtype.Manhandla]: EntityType.Boss,
  [EntitySubtype.Dodongo]: EntityType.Boss,

  // Pickups
  [EntitySubtype.Heart]: EntityType.Pickup,
  [EntitySubtype.Weapon]: EntityType.Pickup,
};

function isType(subtype: EntitySubtype, targetType: EntityType): boolean {
  return SUBTYPE_TO_TYPE[subtype] === targetType;
}
