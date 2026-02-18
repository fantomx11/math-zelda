export enum WallType {
    Open = 'open',
    Solid = 'solid',
    Locked = 'locked',
    Shut = 'shut'
}

export enum MathZeldaEvent {
  GamePaused = "game_paused",
  GameResumed = "game_resumed",
  LevelChanged = "level_changed",
  RoomChanged = "room_changed",

  PlayerHpChanged = "player_hp_changed",
  PlayerDied = "player_died",
  
  ActorHurt = "actor_hurt",
  ActorHpChanged = "actor_hp_changed",
  ActorAttack = "actor_attack",
  EntityCulled = "entity_culled",
  MonsterDied = "monster_died",
  PickupCollected = "pickup_collected",
  BossDied = "boss_died"
}

export enum EntityType {
  Player = "player",
  Enemy = "enemy",
  Boss = "boss,",
  Pickup = "pickup"
}

export enum EntitySubtype {
  // Enemies
  Moblin = "moblin",
  Keese = "keese",
  Gel = "gel",
  Zol = "zol",
  Goriya = 'goriya',
  Darknut = 'darknut',
  Octorok = 'octorok',
  Lynel = 'lynel',

  // Pickups
  Heart = "heart",
  Weapon = "weapon_upgrade",

  //Players
  Link = "link",
  Zelda = "zelda",
  Sheik = "sheik",
  Impa = "impa",
  Ganondorf = "ganondorf",
  Darunia = "darunia",
  Ruto = "ruto",
  Agitha = "agitha",
  Midna = "midna",
  Fi = "fi",
  Ghirarim = "ghirarim",
  Zant = "zant",
  Lana = "lana",
  Cia = "cia",
  Vlga = "volga",
  Wizzro = "wizzro",
  TwiliMidna = "twili_midna",
  KidLink = "kid_link",
  Tingle = "tingle",
  Linkle = "linkle",
  SkullKid = "skull_kid",
  ToonLink = "toon_link",
  Tetra = "tetra",
  KingDaphnes = "king_daphnes",
  Medli = "medli", 
  Marin = "marin", 
  ToonZelda = "toon_zelda", 
  Yuga = "yuga",

  Gleeok = "gleeok",
  Gohma = "gohma",
  Manhandla = "manhandla",
  Dodongo = "dodongo"
}