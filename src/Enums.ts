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