export const ActionType = {
  MOVE: "MOVE",
  ATTACK: "ATTACK",
  WAIT: "WAIT"
} as const;
export type ActionType = typeof ActionType[keyof typeof ActionType];

export const ActorRequiredStateType = {
  SPAWN: "SPAWN",
  IDLE: "IDLE",
  DEAD: "DEAD"
} as const;
export type ActorRequiredStateType = typeof ActorRequiredStateType[keyof typeof ActorRequiredStateType]

export const ActorStateType = {
  ...ActorRequiredStateType,
  MOVE: "MOVE",
  ATTACK: "ATTACK",
  KNOCKBACK: "KNOCKBACK",
  DYING: "DYING",
  WAIT: "WAIT"
} as const;
export type ActorStateType = typeof ActorStateType[keyof typeof ActorStateType];

export const Direction = {
  up: "up",
  down: "down",
  left: "left",
  right: "right"
} as const;
export type Direction = typeof Direction[keyof typeof Direction];

export const EntitySubtype = {
  // Enemies
  Moblin: "moblin",
  Keese: "keese",
  Gel: "gel",
  Zol: "zol",
  Goriya: 'goriya',
  Darknut: 'darknut',
  Octorok: 'octorok',
  Lynel: 'lynel',

  // Pickups
  Heart: "heart",
  Weapon: "weapon_upgrade",

  //Players
  Link: "link",
  Zelda: "zelda",
  Sheik: "sheik",
  Impa: "impa",
  Ganondorf: "ganondorf",
  Darunia: "darunia",
  Ruto: "ruto",
  Agitha: "agitha",
  Midna: "midna",
  Fi: "fi",
  Ghirarim: "ghirarim",
  Zant: "zant",
  Lana: "lana",
  Cia: "cia",
  Vlga: "volga",
  Wizzro: "wizzro",
  TwiliMidna: "twili_midna",
  KidLink: "kid_link",
  Tingle: "tingle",
  Linkle: "linkle",
  SkullKid: "skull_kid",
  ToonLink: "toon_link",
  Tetra: "tetra",
  KingDaphnes: "king_daphnes",
  Medli: "medli",
  Marin: "marin",
  ToonZelda: "toon_zelda",
  Yuga: "yuga",

  Gleeok: "gleeok",
  Gohma: "gohma",
  Manhandla: "manhandla",
  Dodongo: "dodongo"
} as const;
export type EntitySubtype = typeof EntitySubtype[keyof typeof EntitySubtype];

export const EntityType = {
  Player: "player",
  Enemy: "enemy",
  Boss: "boss,",
  Pickup: "pickup"
} as const;
export type EntityType = typeof EntityType[keyof typeof EntityType];

export const ItemType = {
  Nothing: "Nothing",
  BlueRing: "Blue Ring",
  RedRing: "Red Ring",
  BlueBracelet: "Blue Bracelet",
  RedBracelet: "Red Bracelet",
  MoonPearl: "Moon Pearl",
  FirePearl: "Fire Pearl",
  BombosMedallion: "Bombos Medallion",
  EtherMedallion: "Ether Medallion",
  QuakeMedallion: "Quake Medallion"
} as const;
export type ItemType = typeof ItemType[keyof typeof ItemType];

export const MathZeldaEvent = {
  GamePaused: "game_paused",
  GameResumed: "game_resumed",
  LevelChanged: "level_changed",
  RoomChanged: "room_changed",

  PlayerHpChanged: "player_hp_changed",
  PlayerDied: "player_died",

  ActorHurt: "actor_hurt",
  ActorHpChanged: "actor_hp_changed",
  ActorAttack: "actor_attack",
  EntityCulled: "entity_culled",
  ActorDied: "monster_died",
  PickupCollected: "pickup_collected",
  BossDied: "boss_died"
} as const;
export type MathZeldaEvent = typeof MathZeldaEvent[keyof typeof MathZeldaEvent];

export const MoveReturnValue = {
  Complete: "Complete",
  Blocked: "Blocked",
  Incomplete: "Incomplete"
} as const;
export type MoveReturnValue = typeof MoveReturnValue[keyof typeof MoveReturnValue];

export const RoomType = {
  Normal: 'normal',
  Boss: 'boss',
  Item: 'item',
  Start: 'start'
} as const;
export type RoomType = typeof RoomType[keyof typeof RoomType];

export const WallType = {
  Open: 'open',
  Solid: 'solid',
  Locked: 'locked',
  Shut: 'shut'
} as const;
export type WallType = typeof WallType[keyof typeof WallType];

export const WeaponType = {
  Rapier: "Rapier",
  BiggoronsSword: "Biggoron's Sword",
  SwordOfDemise: "Sword of Demise",
  Hammer: "Hammer",
  ShadowScimitar: "Shadow Scimitar",
  ProtectorSword: "Protector Sword",
  DragonSpear: "Dragon Spear",
  CutlassOfLight: "Cutlass of Light",
  DemonSword: "Demon Sword",
  MasterSword: "Master Sword",
} as const;
export type WeaponType = typeof WeaponType[keyof typeof WeaponType];