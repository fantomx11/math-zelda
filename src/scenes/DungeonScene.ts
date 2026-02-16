import { RoomModel } from '../models/RoomModel.js';
import { ActorModel, Direction, IdleState } from '../models/ActorModel.js';
import { PlayerModel } from '../models/PlayerModel.js';
import { SKIN_CONFIG, WEAPON_CONFIG, ITEM_CONFIG } from '../config.js';
import { GameMode } from '../modes/GameMode.js';
import { PickupModel } from '../models/PickupModel.js';
import { TitleMode } from '../modes/TitleMode.js';
import { DungeonManager } from '../managers/DungeonManager.js';
import { HUDManager } from '../managers/HUDManager.js';
import { WeaponPickupModel } from '../models/WeaponPickupModel.js';
import { EntityManager } from '../managers/EnemyManager.js';
import { MonsterModel } from '../models/MonsterModel.js';

/**
 * Main gameplay scene handling the dungeon view, player input, and game loop.
 */
export class DungeonScene extends Phaser.Scene {
  private roomModel!: RoomModel;
  private playerModel!: PlayerModel;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private dungeonManager!: DungeonManager;
  private entityManager!: EntityManager;
  private hudManager!: HUDManager;
  private dungeonOffset: number = 64;
  private doorSprites: Phaser.GameObjects.Image[] = [];
  private inputStack: Direction[] = [];
  private pendingLock: boolean = false;
  private currentLevel: number = 1;
  private levelTexture: string = 'master_sheet';
  private roomColor: string = 'green';

  private modeStack: GameMode[] = [];
  public isGameStarted: boolean = false;
  public isPaused: boolean = false;

  private weaponView!: Phaser.GameObjects.Sprite;
  private playerView!: Phaser.GameObjects.Sprite;

  preload(): void {
    // Load the master sheet once
    this.load.image('master_sheet', 'images/graphics.png');
    this.load.bitmapFont('arcade', 'fonts/font.png', 'fonts/font.xml');
  }

  create(data?: { autoStart?: boolean, level?: number }): void {
    this.currentLevel = data?.level || 1;
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Input Stack for "Last Key Priority" (Movement)
    this.inputStack = [];
    const keyMap: Record<number, Direction> = {
      [Phaser.Input.Keyboard.KeyCodes.LEFT]: 'left',
      [Phaser.Input.Keyboard.KeyCodes.RIGHT]: 'right',
      [Phaser.Input.Keyboard.KeyCodes.UP]: 'up',
      [Phaser.Input.Keyboard.KeyCodes.DOWN]: 'down'
    };

    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Enter' && this.isGameStarted) {
        this.togglePause();
        return;
      }

      const dir = keyMap[event.keyCode];

      if (this.isPaused) {
        if (event.code === 'Space') {
            this.hudManager.selectItem(this.playerModel);
        } else if (dir) {
            const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
            const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
            this.hudManager.moveCursor(dx, dy);
            this.updatePauseState();
        }
        return;
      }

      // 1. Delegate discrete inputs to the active mode
      if (this.modeStack.length > 0) {
        this.modeStack[this.modeStack.length - 1].handleInput(event);
      }

      // 2. Handle continuous movement state
      if (dir && !this.inputStack.includes(dir)) this.inputStack.push(dir);
    });

    this.input.keyboard!.on('keyup', (event: KeyboardEvent) => {
      const dir = keyMap[event.keyCode];
      if (dir) this.inputStack = this.inputStack.filter(d => d !== dir);
    });

    if (data?.autoStart) {
      this.startGame();
    } else {
      // Start with Title Screen
      this.pushMode(new TitleMode(this));
    }
  }

  startGame(): void {
    this.isGameStarted = true;
    this.roomModel = new RoomModel();
    this.playerModel = new PlayerModel(128, 128);
    (window as any).playerModel = this.playerModel; // Add this line for debugging
    this.registerDoorFrames();
    this.registerMapTiles();

    // 1. Create the Room Base
    this.textures.get('master_sheet').add('room_bg', 0, 0, 64, 256, 256);

    const roomPrefixes = ['room_bg', 'door_'];

    this.createPaletteTexture('master_sheet', 'room_red', [0x000000, 0x550000, 0xaa0000, 0xff5555], roomPrefixes);
    this.createPaletteTexture('master_sheet', 'room_yellow', [0x000000, 0x555500, 0xaaaa00, 0xffff55], roomPrefixes);
    this.createPaletteTexture('master_sheet', 'room_green', [0x000000, 0x005500, 0x00aa00, 0x55ff55], roomPrefixes);
    this.createPaletteTexture('master_sheet', 'room_cyan', [0x000000, 0x005555, 0x00aaaa, 0x55ffff], roomPrefixes);
    this.createPaletteTexture('master_sheet', 'room_blue', [0x000000, 0x000066, 0x0000aa, 0x5555ff], roomPrefixes);
    this.createPaletteTexture('master_sheet', 'room_fuscia', [0x000000, 0x550055, 0xaa00aa, 0xff55ff], roomPrefixes);

    this.levelTexture = (this.roomColor && this.roomColor !== 'normal') ? `room_${this.roomColor}` : 'master_sheet';

    this.add.image(this.dungeonOffset, 0, this.levelTexture, 'room_bg').setOrigin(0);

    // Initialize Maze
    this.dungeonManager = new DungeonManager(4);
    this.entityManager = new EntityManager(this, this.dungeonOffset);

    this.loadSkin('Link'); // Load skin before room so player anims exist
    this.loadEnemies();
    this.createEnemyAnims();

    // 2. Define the Player Animation
    this.loadWeapons();
    this.loadItems();

    // HUD Setup
    this.hudManager = new HUDManager(this, this.currentLevel);

    this.weaponView = this.add.sprite(0, 0, 'master_sheet');
    this.weaponView.setVisible(false);
    this.hudManager.updateHearts(this.playerModel.hp);
    this.hudManager.updateHUD(this.playerModel);

    this.loadRoom(0, 0);
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    this.hudManager.slide(this.isPaused);
    if (this.isPaused) this.updatePauseState();
  }

  updatePauseState(): void {
    const enemies = this.entityManager.getActors()
        .map(a => a.model)
        .filter(m => m.type === 'enemy') as MonsterModel[];
    this.hudManager.updatePauseScreen(this.playerModel, enemies);
  }

  pushMode(mode: GameMode): void {
    this.modeStack.push(mode);
    mode.enter();
  }

  popMode(): void {
    if (this.modeStack.length > 0) {
      const mode = this.modeStack.pop();
      mode?.exit();
    }
  }

  switchMode(mode: GameMode): void {
    this.popMode();
    this.pushMode(mode);
  }

  /**
   * Loads sprite frames and animations for a specific character skin.
   * @param skinName The name of the skin to load.
   */
  loadSkin(skinName: string): void {
    const idx = SKIN_CONFIG.skins.indexOf(skinName);
    if (idx === -1) return;

    const { x: startX, y: startY } = SKIN_CONFIG.startPos;
    const { w, h } = SKIN_CONFIG.frameSize;
    const skinY = startY + (idx * h);

    // Create animations for this skin
    for (const [animKey, config] of Object.entries(SKIN_CONFIG.anims)) {
      const frames: Phaser.Types.Animations.AnimationFrame[] = [];
      for (let i = 0; i < config.length; i++) {
        const frameName = `${skinName}_${animKey}_${i}`;
        // Add frame to texture manager
        this.textures.get('master_sheet').add(
          frameName, 0,
          startX + (config.start + i) * w, skinY, w, h
        );
        frames.push({ key: 'master_sheet', frame: frameName });
      }
      // Remove existing if switching skins
      const walkAnimKey = `player_${animKey}`;
      this.anims.remove(walkAnimKey);
      this.anims.create({
        key: walkAnimKey,
        frames: frames,
        frameRate: config.rate,
        repeat: config.repeat
      });

      // Create single-frame idle animation from the first frame of the walk
      const idleAnimKey = `${walkAnimKey}_idle`;
      this.anims.remove(idleAnimKey);
      this.anims.create({
        key: idleAnimKey,
        frames: [frames[0]]
      });
    }
  }

  /**
   * Registers weapon frames from the sprite sheet.
   */
  loadWeapons(): void {
    const { x: startX, y: startY } = WEAPON_CONFIG.startPos;
    const { w, h } = WEAPON_CONFIG.frameSize;

    WEAPON_CONFIG.names.forEach((name, i) => {
      this.textures.get('master_sheet').add(
        `weapon_${name}`,
        0,
        startX + (i * w),
        startY,
        w,
        h
      );
    });
  }

  /**
   * Registers item frames from the sprite sheet.
   */
  loadItems(): void {
    const { x: startX, y: startY } = ITEM_CONFIG.startPos;
    const { w, h } = ITEM_CONFIG.frameSize;

    ITEM_CONFIG.names.forEach((name, i) => {
      this.textures.get('master_sheet').add(
        `item_${name}`,
        0,
        startX + (i * w),
        startY,
        w,
        h
      );
    });
  }

  /**
   * Registers enemy frames from the sprite sheet.
   */
  loadEnemies(): void {
    const sheet = this.textures.get('master_sheet');

    // Hearts: 480, 320 (8x8 each: Full, Half, Empty)
    // Moved here or keep in HUDManager? 
    // HUDManager uses them, but textures are global. Let's ensure they are loaded.
    sheet.add('heart_full', 0, 480, 320, 8, 8);
    sheet.add('heart_half', 0, 488, 320, 8, 8);
    sheet.add('heart_empty', 0, 496, 320, 8, 8);
    sheet.add('item_heart', 0, 480, 320, 8, 8);
    sheet.add('hud_bg', 0, 480, 328, 48, 144);

    // Gleeok
    for (let i = 0; i < 3; i++) {
      sheet.add(`gleeok_body_${i}`, 0, i * 32, 320, 32, 32);
    }
    sheet.add('gleeok_neck', 0, 96, 320, 16, 16);
    sheet.add('gleeok_head', 0, 96, 336, 16, 16);

    // Gohma
    sheet.add('gohma_legs_left_0', 0, 0, 352, 16, 16);
    sheet.add('gohma_legs_left_1', 0, 16, 352, 16, 16);
    sheet.add('gohma_legs_right_0', 0, 32, 352, 16, 16);
    sheet.add('gohma_legs_right_1', 0, 48, 352, 16, 16);

    // Manhandla
    sheet.add('manhandla_mouth_left_0', 0, 64, 352, 16, 16);
    sheet.add('manhandla_mouth_left_1', 0, 80, 352, 16, 16);
    sheet.add('manhandla_mouth_top_0', 0, 96, 352, 16, 16);
    sheet.add('manhandla_mouth_top_1', 0, 112, 352, 16, 16);
    sheet.add('manhandla_mouth_right_0', 0, 64, 368, 16, 16);
    sheet.add('manhandla_mouth_right_1', 0, 80, 368, 16, 16);
    sheet.add('manhandla_mouth_bottom_0', 0, 96, 368, 16, 16);
    sheet.add('manhandla_mouth_bottom_1', 0, 112, 368, 16, 16);
    sheet.add('manhandla_body', 0, 128, 352, 16, 16);

    // Dodongo
    ['walk0', 'walk1', 'hurt'].forEach((n, i) => {
      sheet.add(`dodongo_down_${n}`, 0, 144 + i * 16, 320, 16, 16);
      sheet.add(`dodongo_up_${n}`, 0, 192 + i * 16, 320, 16, 16);
      sheet.add(`dodongo_left_${n}`, 0, 144 + i * 32, 336, 32, 16);
      sheet.add(`dodongo_right_${n}`, 0, 144 + i * 32, 352, 32, 16);
    });

    // Keese, Gel, Zol
    ['keese', 'gel', 'zol'].forEach((name, idx) => {
      const startX = 144 + (idx * 32);
      sheet.add(`${name}_0`, 0, startX, 368, 16, 16);
      sheet.add(`${name}_1`, 0, startX + 16, 368, 16, 16);
    });

    // Standard Enemies
    const loadStandard = (name: string, sx: number, sy: number) => {
      sheet.add(`${name}_down_0`, 0, sx, sy, 16, 16);
      sheet.add(`${name}_down_1`, 0, sx + 16, sy, 16, 16);
      sheet.add(`${name}_down_1`, 0, sx + 16, sy, 16, 16);
      sheet.add(`${name}_up_0`, 0, sx + 32, sy, 16, 16);
      sheet.add(`${name}_up_1`, 0, sx + 48, sy, 16, 16);
      sheet.add(`${name}_left_0`, 0, sx, sy + 16, 16, 16);
      sheet.add(`${name}_left_1`, 0, sx + 16, sy + 16, 16, 16);
      sheet.add(`${name}_right_0`, 0, sx + 32, sy + 16, 16, 16);
      sheet.add(`${name}_right_1`, 0, sx + 48, sy + 16, 16, 16);
    };

    loadStandard('goriya', 0, 384);
    loadStandard('moblin', 0, 416);
    loadStandard('darknut', 64, 384);
    loadStandard('octorok', 128, 384);
    loadStandard('lynel', 192, 384);

    const monsters = ['goriya', 'moblin', 'darknut', 'octorok', 'lynel'];
    this.createPaletteTexture('master_sheet', 'master_sheet_red', [0x000000, 0xaa0000, 0xff5555, 0xffffff], monsters);
    this.createPaletteTexture('master_sheet', 'master_sheet_green', [0x000000, 0x00aa00, 0x55ff55, 0xffffff], monsters);
    this.createPaletteTexture('master_sheet', 'master_sheet_blue', [0x000000, 0x0000aa, 0x5555ff, 0xffffff], monsters);
  }

  /**
   * Creates animations for standard enemies.
   */
  createEnemyAnims(textureKey: string = 'master_sheet', suffix: string = ''): void {
    const types = ['goriya', 'moblin', 'darknut', 'octorok', 'lynel'];

    const create = (tKey: string, s: string) => {
      types.forEach(type => {
        ['down', 'up', 'left', 'right'].forEach(dir => {
          const walkFrames = [
            { key: tKey, frame: `${type}_${dir}_0` },
            { key: tKey, frame: `${type}_${dir}_1` }
          ];
          const animKey = `${type}${s}_${dir}`;
          this.anims.create({
            key: animKey,
            frames: walkFrames,
            frameRate: 6,
            repeat: -1
          });

          // Create single-frame idle animation
          const idleAnimKey = `${animKey}_idle`;
          this.anims.create({
            key: idleAnimKey,
            frames: [walkFrames[0]] // Just the first frame
          });
        });
      });
    };

    create(textureKey, suffix);

    if (textureKey === 'master_sheet' && suffix === '') {
      create('master_sheet_red', '_red');
      create('master_sheet_green', '_green');
      create('master_sheet_blue', '_blue');
    }
  }

  /**
   * Generates a new texture by remapping the 4-color grayscale palette.
   * @param sourceKey Source texture key (e.g. 'master_sheet').
   * @param newKey New texture key to create.
   * @param palette Array of 4 colors [Black, DarkGray, LightGray, White].
   * @param allowedPrefixes Optional array of frame prefixes to include (e.g. ['moblin', 'goriya']).
   */
  createPaletteTexture(sourceKey: string, newKey: string, palette: number[], allowedPrefixes?: string[]): void {
    if (this.textures.exists(newKey)) return;

    const sourceTexture = this.textures.get(sourceKey);
    const src = sourceTexture.getSourceImage() as HTMLImageElement;
    const canvas = this.textures.createCanvas(newKey, src.width, src.height);
    if (!canvas) return;
    const ctx = canvas.context;

    const frameNames = sourceTexture.getFrameNames();
    const framesToCopy = allowedPrefixes 
        ? frameNames.filter(name => allowedPrefixes.some(prefix => name.startsWith(prefix)))
        : frameNames.filter(name => name !== '__BASE');

    framesToCopy.forEach(name => {
        const f = sourceTexture.get(name);
        if (name === '__BASE') return;
        ctx.drawImage(src, f.cutX, f.cutY, f.width, f.height, f.cutX, f.cutY, f.width, f.height);
    });

    const imgData = ctx.getImageData(0, 0, src.width, src.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const a = data[i + 3];
      if (a === 0) continue;

      // Map grayscale to palette index (0-3)
      let idx = 0;
      if (r > 200) idx = 3;      // White
      else if (r > 128) idx = 2; // Light Gray
      else if (r > 40) idx = 1;  // Dark Gray

      const c = palette[idx];
      data[i] = (c >> 16) & 0xFF;
      data[i + 1] = (c >> 8) & 0xFF;
      data[i + 2] = c & 0xFF;
    }
    ctx.putImageData(imgData, 0, 0);
    canvas.refresh();

    // Copy frames from source
    framesToCopy.forEach(name => {
      const f = sourceTexture.get(name);
      canvas.add(name, 0, f.cutX, f.cutY, f.width, f.height);
    });
  }

  /**
   * Loads door frames based on the room configuration.
   */
  registerDoorFrames(): void {
    const walls = ['n', 's', 'w', 'e'];
    const types = ['solid', 'open', 'locked', 'shut'];

    walls.forEach((wall, i) => {
      // Row 0 contains N (left) and S (right)
      // Row 1 contains W (left) and E (right)
      const row = i < 2 ? 0 : 1;
      const colOffset = (i % 2) * 4; // 0 or 4

      types.forEach((type, j) => {
        const x = (colOffset + j) * 32;
        const y = row * 32;
        this.textures.get('master_sheet').add(`door_${wall}_${type}`, 0, x, y, 32, 32);
      });
    });
  }

  registerMapTiles(): void {
    // Mapping of 4x4 grid to bitmask (N=1, S=2, W=4, E=8)
    // Row 0: D(2), DR(10), DLR(14), DL(6)
    // Row 1: UD(3), UDR(11), UDLR(15), UDL(7)
    // Row 2: U(1), UR(9), ULR(13), UL(5)
    // Row 3: None(0), R(8), LR(12), L(4)
    const masks = [2, 10, 14, 6, 3, 11, 15, 7, 1, 9, 13, 5, 0, 8, 12, 4];
    masks.forEach((mask, i) => {
      const tx = (i % 4) * 8;
      const ty = Math.floor(i / 4) * 8;
      this.textures.get('master_sheet').add(`map_current_${mask}`, 0, 480 + tx, 256 + ty, 8, 8);
      this.textures.get('master_sheet').add(`map_visited_${mask}`, 0, 480 + tx, 288 + ty, 8, 8);
    });
  }

  loadRoom(x: number, y: number): void {
    const cell = this.dungeonManager.grid[y][x];

    // 1. Destroy all sprites from the previous room.
    this.entityManager.getActors().forEach(actor => {
      actor.sprite.destroy();
    });

    // 2. Clear the manager's list of actors.
    this.entityManager.clear();

    // 3. Re-create the player's sprite from the persistent model and add to the manager.
    this.playerView = this.add.sprite(this.playerModel.x + this.dungeonOffset, this.playerModel.y, 'master_sheet');
    this.playerView.play(`player_${this.playerModel.currentDir}`);
    this.entityManager.addActor(this.playerModel, this.playerView);

    // 4. Spawn Enemies for the new room (if not cleared)
    if (cell.type !== 'start' && !cell.cleared) {
      const count = Phaser.Math.Between(1, 3);
      for (let i = 0; i < count; i++) {
        const ex = Phaser.Math.Between(64, 192);
        const ey = Phaser.Math.Between(64, 192);
        this.entityManager.spawn(ex, ey, 'moblin', '_red', this.currentLevel);
      }
    }

    // 5. Spawn Item Room Reward (if cleared but not collected)
    if (cell.type === 'item' && cell.cleared && !cell.itemCollected) {
      const sword = new WeaponPickupModel(128, 128, 'Sword of Demise');
      sword.onCollect = () => { cell.itemCollected = true; };
      this.spawnPickup(sword);
    }

    // 5. Update Room Model (Doors)
    this.pendingLock = this.entityManager.count("enemy") > 0;
    const getDoorState = (isOpen: boolean) => (!isOpen ? 'solid' : 'open');

    this.roomModel.wallTypes.n = getDoorState(cell.north);
    this.roomModel.wallTypes.s = getDoorState(cell.south);
    this.roomModel.wallTypes.w = getDoorState(cell.west);
    this.roomModel.wallTypes.e = getDoorState(cell.east);

    cell.seen = true;
    this.hudManager.updateMap(this.dungeonManager);
    this.drawDoors();
  }

  drawDoors(): void {
    this.doorSprites.forEach(s => s.destroy());
    this.doorSprites = [];

    const doorPositions: Record<string, { x: number; y: number }> = {
      n: { x: 112, y: 0 },
      s: { x: 112, y: 224 },
      w: { x: 0, y: 112 },
      e: { x: 224, y: 112 }
    };

    for (const [wall, type] of Object.entries(this.roomModel.wallTypes)) {
      const pos = doorPositions[wall];
      const textureName = `door_${wall}_${type}`;
      this.doorSprites.push(this.add.image(pos.x + this.dungeonOffset, pos.y, this.levelTexture, textureName).setOrigin(0));
    }
  }

  switchRoom(dx: number, dy: number): void {
    if (this.dungeonManager.switchRoom(dx, dy)) {
      this.loadRoom(this.dungeonManager.roomX, this.dungeonManager.roomY);

      if (dy === -1) this.playerModel.y = 224;
      else if (dy === 1) this.playerModel.y = 32;
      else if (dx === -1) this.playerModel.x = 224;
      else if (dx === 1) this.playerModel.x = 32;

      this.playerModel.x = Math.round(this.playerModel.x / 8) * 8;
      this.playerModel.y = Math.round(this.playerModel.y / 8) * 8;
      this.playerModel.changeState(new IdleState());
    }
  }

  lockRoom(): void {
    this.pendingLock = false;
    const cell = this.dungeonManager.currentCell;
    if (this.entityManager.count("enemy") > 0) { //added check
      if (cell.north) this.roomModel.wallTypes.n = 'shut';
      if (cell.south) this.roomModel.wallTypes.s = 'shut';
      if (cell.west) this.roomModel.wallTypes.w = 'shut';
      if (cell.east) this.roomModel.wallTypes.e = 'shut';
      this.drawDoors();
    }
  }

  handleRoomClear(): void {
    if (this.entityManager.count("enemy") > 0) return;
    const cell = this.dungeonManager.currentCell;
    cell.cleared = true;

    if (cell.north) this.roomModel.wallTypes.n = 'open';
    if (cell.south) this.roomModel.wallTypes.s = 'open';
    if (cell.west) this.roomModel.wallTypes.w = 'open';
    if (cell.east) this.roomModel.wallTypes.e = 'open';
    this.drawDoors();
    this.hudManager.updateHearts(this.playerModel.hp);

    // Spawn Item Room Reward
    if (cell.type === 'item' && !cell.itemCollected) {
      const sword = new WeaponPickupModel(128, 128, 'Sword of Demise');
      sword.onCollect = () => { cell.itemCollected = true; };
      this.spawnPickup(sword);
    }
  }

  /**
   * Spawns a pickup item at the given location.
   * @param item The actor model to spawn (e.g. a PickupModel).
   */
  spawnPickup(item: ActorModel): void {
    const pickupSprite = this.add.sprite(item.x + this.dungeonOffset, item.y, 'master_sheet', item.getAnimKey());
    this.entityManager.addActor(item, pickupSprite);
  }

  /**
   * Handles player attack logic, including animation and hit detection.
   */
  performAttack(): void {
    const ATTACK_DURATION = 250; // ms
    if (this.playerModel.isAttacking) return;
    this.playerModel.attack(ATTACK_DURATION);

    this.weaponView.setTexture('master_sheet', `weapon_${this.playerModel.currentWeapon}`);
    this.weaponView.setVisible(true);
    this.updateWeaponPosition();

    // The scene is responsible for its own view objects. This timer just hides the weapon sprite.
    this.time.delayedCall(ATTACK_DURATION, () => {
      this.weaponView.setVisible(false);
    });

    // Attack Hitbox Check
    const { x, y, currentDir } = this.playerModel;
    const reach = 20;
    let hx = x, hy = y;
    if (currentDir === 'left') hx -= reach;
    if (currentDir === 'right') hx += reach;
    if (currentDir === 'up') hy -= reach;
    if (currentDir === 'down') hy += reach;

    const killed = this.entityManager.handleWeaponCollision({ x: hx, y: hy }, 1, this.playerModel.x, this.playerModel.y, this.playerModel.getAttackValue());

    if (killed && this.entityManager.count("enemy") === 0) {
      this.handleRoomClear();
    }
  }

  /**
   * Updates the weapon sprite position relative to the player.
   */
  updateWeaponPosition(): void {
    const dir = this.playerModel.currentDir;
    const offset = 12;
    const { x, y } = this.playerModel;
    const sx = x + this.dungeonOffset;

    if (dir === 'left') {
      this.weaponView.setPosition(sx - offset, y);
      this.weaponView.setAngle(0);
    } else if (dir === 'right') {
      this.weaponView.setPosition(sx + offset, y);
      this.weaponView.setAngle(180);
    } else if (dir === 'up') {
      this.weaponView.setPosition(sx, y - offset);
      this.weaponView.setAngle(90);
    } else if (dir === 'down') {
      this.weaponView.setPosition(sx, y + offset);
      this.weaponView.setAngle(-90);
    }
  }

  update(): void {
    if (this.isPaused) return;

    if (this.modeStack.length > 0) {
      this.modeStack[this.modeStack.length - 1].update();
    }
  }

  updateGameLogic(): void {
    const inputDir = (this.inputStack.length > 0 && !this.playerModel.isAttacking) ? this.inputStack[this.inputStack.length - 1] : null;

    this.playerModel.inputDir = inputDir;

    if (this.pendingLock) {
      const { x, y } = this.playerModel;
      if (x > 48 && x < 208 && y > 48 && y < 208) {
        this.lockRoom();
      }
    }

    if (this.playerModel.isAttacking) this.updateWeaponPosition();

    // Room Transition Check
    const { x, y } = this.playerModel;
    if (y < 16 && this.roomModel.wallTypes.n === 'open') {
      this.switchRoom(0, -1);
    } else if (y > 240 && this.roomModel.wallTypes.s === 'open') {
      this.switchRoom(0, 1);
    } else if (x < 16 && this.roomModel.wallTypes.w === 'open') {
      this.switchRoom(-1, 0);
    } else if (x > 240 && this.roomModel.wallTypes.e === 'open') {
      this.switchRoom(1, 0);
    }

    // Player vs Enemy Collision
    const enemy = this.entityManager.getCollidingEnemy(this.playerModel);
    if (enemy) {
      const isDead = this.playerModel.takeDamage(1, enemy.x, enemy.y);
      this.hudManager.updateHearts(this.playerModel.hp);

      if (isDead) {
        this.scene.restart({ autoStart: true, level: this.currentLevel });
        return;
      }
    }

    //process player input
    this.playerModel.ai(this.roomModel);

    // Update Enemies
    this.entityManager.update(this.roomModel, this);//no longer updates hearts directly
  }
}
