import { DungeonManager } from './DungeonManager.js';
import { PlayerModel } from '../models/PlayerModel.js';
import { MonsterModel } from '../models/MonsterModel.js';
import { WEAPON_CONFIG, ITEM_CONFIG } from '../config.js';
import { MathZeldaEvent } from '../Event.js';

export class HUDManager {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private heartsContainer: Phaser.GameObjects.Container;
  private mapContainer: Phaser.GameObjects.Container;
  private pauseContainer: Phaser.GameObjects.Container;
  private cursor: Phaser.GameObjects.Rectangle;
  private weaponSelectionBox: Phaser.GameObjects.Rectangle;
  private itemSelectionBox: Phaser.GameObjects.Rectangle;
  private monsterPreviews: Phaser.GameObjects.Container;
  private weaponSprites: Phaser.GameObjects.Sprite[] = [];
  private currentWeaponSprite: Phaser.GameObjects.Sprite;
  private currentItemSprite: Phaser.GameObjects.Sprite;
  private totalValueText: Phaser.GameObjects.BitmapText;
  
  public cursorIndex: { x: number, y: number } = { x: 0, y: 0 };
  
  constructor(scene: Phaser.Scene, level: number) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(512); // Ensure HUD is on top
    
    // Define HUD background frame
    const texture = scene.textures.get('master_sheet');
    if (texture && !texture.has('hud_bg')) {
      texture.add('hud_bg', 0, 480, 328, 48, 144);
    }

    // Pause Screen (Inventory)
    this.pauseContainer = scene.add.container(-256, 0);
    this.container.add(this.pauseContainer);

    // Pause BG
    this.pauseContainer.add(scene.add.rectangle(0, 0, 320, 256, 0x000000).setOrigin(0));

    // Weapons
    this.pauseContainer.add(scene.add.bitmapText(16, 8, 'arcade', 'WEAPONS (Tens)').setTint(0xd82800));
    WEAPON_CONFIG.names.forEach((name, i) => {
        const x = 16 + (i % 5) * 24;
        const y = 24 + Math.floor(i / 5) * 24;
        const sprite = scene.add.sprite(x, y, 'master_sheet', `weapon_${name}`);
        this.pauseContainer.add(sprite);
        this.weaponSprites.push(sprite);
        this.pauseContainer.add(scene.add.bitmapText(x - 4, y + 8, 'arcade', (i * 10).toString()).setFontSize(8));
    });

    // Items
    this.pauseContainer.add(scene.add.bitmapText(16, 72, 'arcade', 'ITEMS (Ones)').setTint(0xd82800));
    ITEM_CONFIG.names.forEach((name, i) => {
        const x = 16 + (i % 5) * 24;
        const y = 88 + Math.floor(i / 5) * 24;
        this.pauseContainer.add(scene.add.sprite(x, y, 'master_sheet', `item_${name}`));
        this.pauseContainer.add(scene.add.bitmapText(x + 4, y + 8, 'arcade', i.toString()).setFontSize(8));
    });

    // Monsters
    this.pauseContainer.add(scene.add.bitmapText(144, 8, 'arcade', 'TARGETS').setTint(0xd82800));
    this.monsterPreviews = scene.add.container(144, 24);
    this.pauseContainer.add(this.monsterPreviews);

    // Cursor
    this.cursor = scene.add.rectangle(0, 0, 22, 22).setStrokeStyle(2, 0x888888);
    this.cursor.isFilled = false;
    this.pauseContainer.add(this.cursor);

    this.weaponSelectionBox = scene.add.rectangle(0, 0, 22, 22).setStrokeStyle(2, 0xffffff);
    this.weaponSelectionBox.isFilled = false;
    this.itemSelectionBox = scene.add.rectangle(0, 0, 22, 22).setStrokeStyle(2, 0xffffff);
    this.itemSelectionBox.isFilled = false;
    this.pauseContainer.add(this.weaponSelectionBox);
    this.pauseContainer.add(this.itemSelectionBox);

    this.updateCursorPos();

    // Background
    const bg = scene.add.image(8, 24, 'master_sheet', 'hud_bg').setOrigin(0);
    this.container.add(bg);

    // Text
    this.container.add(scene.add.bitmapText(8, 8, 'arcade', `Level-${level}`));
    this.container.add(scene.add.bitmapText(16, 24, 'arcade', 'Life').setTint(0xd82800));
    this.container.add(scene.add.bitmapText(16, 80, 'arcade', 'Map').setTint(0xd82800));
    
    this.currentWeaponSprite = scene.add.sprite(16, 144, 'master_sheet').setOrigin(0);
    this.container.add(this.currentWeaponSprite);
    this.currentItemSprite = scene.add.sprite(32, 144, 'master_sheet').setOrigin(0);
    this.container.add(this.currentItemSprite);
    this.totalValueText = scene.add.bitmapText(16, 136, 'arcade', '00').setTint(0xd82800);
    this.container.add(this.totalValueText);

    // Sub-containers
    this.heartsContainer = scene.add.container(16, 32);
    this.mapContainer = scene.add.container(16, 88);
    
    this.container.add(this.heartsContainer);
    this.container.add(this.mapContainer);

    // Event Listeners
    this.scene.events.on(MathZeldaEvent.PLAYER_HP_CHANGED, (data: { hp: number }) => {
      this.updateHearts(data.hp);
    });

    this.scene.events.on(MathZeldaEvent.ROOM_CHANGED, (data: { dungeon: DungeonManager }) => {
      this.updateMap(data.dungeon);
    });

    this.scene.events.on(MathZeldaEvent.GAME_PAUSED, (data: { player: PlayerModel, enemies: MonsterModel[] }) => {
      this.slide(true);
      this.updatePauseScreen(data.player, data.enemies);
    });

    this.scene.events.on(MathZeldaEvent.GAME_RESUMED, () => {
      this.slide(false);
    });
  }

  updateHearts(hp: number, maxHearts: number = 3): void {
    this.heartsContainer.removeAll(true);
    for (let i = 0; i < maxHearts; i++) {
      const heartValue = (i + 1) * 2;
      let texture = 'heart_empty';

      if (hp >= heartValue) {
        texture = 'heart_full';
      } else if (hp === heartValue - 1) {
        texture = 'heart_half';
      }

      const x = (i % 4) * 8;
      const y = Math.floor(i / 4) * 8;
      this.heartsContainer.add(this.scene.add.image(x, y, 'master_sheet', texture).setOrigin(0));
    }
  }

  updateMap(dungeon: DungeonManager): void {
    this.mapContainer.removeAll(true);
    for (let y = 0; y < dungeon.maze.size; y++) {
      for (let x = 0; x < dungeon.maze.size; x++) {
        const cell = dungeon.grid[y][x];
        if (!cell.seen) continue;

        const mask = (cell.north ? 1 : 0) | (cell.south ? 2 : 0) | (cell.west ? 4 : 0) | (cell.east ? 8 : 0);
        const type = (x === dungeon.roomX && y === dungeon.roomY) ? 'current' : 'visited';
        this.mapContainer.add(this.scene.add.image(x * 8, y * 8, 'master_sheet', `map_${type}_${mask}`).setOrigin(0));
      }
    }
  }

  updatePauseScreen(player: PlayerModel, enemies: MonsterModel[]): void {
    // Update Weapon visibility
    this.weaponSprites.forEach((sprite, i) => {
        const name = WEAPON_CONFIG.names[i];
        sprite.setVisible(player.weapons.includes(name));
    });

    this.updateSelectionBoxes(player);

    // Update Monster Previews
    this.monsterPreviews.removeAll(true);
    const attackVal = player.getAttackValue();

    // Group enemies by type/math problem to avoid duplicates
    const uniqueProblems = new Map<string, MonsterModel>();
    enemies.forEach(e => {
        const key = `${e.subtype}-${e.mathProblem.a}x${e.mathProblem.b}`;
        if (!uniqueProblems.has(key)) uniqueProblems.set(key, e);
    });

    let y = 0;
    uniqueProblems.forEach(monster => {
        const sprite = this.scene.add.sprite(0, y, 'master_sheet');
        const idleKey = `${monster.subtype}_down_idle`;
        const walkKey = `${monster.subtype}_down`;

        if (this.scene.anims.exists(idleKey)) sprite.play(idleKey);
        else sprite.play(monster.getIdleAnimKey());

        const problem = `${monster.mathProblem.a}x${monster.mathProblem.b}=?`;
        const text = this.scene.add.bitmapText(16, y - 4, 'arcade', problem);
        
        if (monster.mathProblem.answer === attackVal) {
            if (this.scene.anims.exists(walkKey)) {
                sprite.play(walkKey); // Animate if vulnerable
            }
            text.setTint(0x00ff00);
        } else {
            sprite.stop(); // Static if not
            text.setTint(0xffffff);
        }

        this.monsterPreviews.add([sprite, text]);
        y += 24;
    });
  }

  moveCursor(dx: number, dy: number): void {
    this.cursorIndex.x = Phaser.Math.Clamp(this.cursorIndex.x + dx, 0, 4);
    this.cursorIndex.y = Phaser.Math.Clamp(this.cursorIndex.y + dy, 0, 3);
    this.updateCursorPos();
  }

  updateCursorPos(): void {
    // Rows 0-1: Weapons, Rows 2-3: Items
    const x = 16 + this.cursorIndex.x * 24;
    const y = (this.cursorIndex.y < 2 ? 24 : 88 - 48) + this.cursorIndex.y * 24;
    this.cursor.setPosition(x, y);
  }

  selectItem(player: PlayerModel): void {
    const idx = this.cursorIndex.x + (this.cursorIndex.y % 2) * 5;
    if (this.cursorIndex.y < 2) {
        // Weapon
        if (idx < WEAPON_CONFIG.names.length && player.weapons.includes(WEAPON_CONFIG.names[idx])) {
            player.currentWeapon = WEAPON_CONFIG.names[idx];
        }
    } else {
        // Item
        if (idx < ITEM_CONFIG.names.length) player.currentItem = ITEM_CONFIG.names[idx];
    }
    this.updateHUD(player);
    this.updateSelectionBoxes(player);
  }

  updateSelectionBoxes(player: PlayerModel): void {
    const weaponIdx = WEAPON_CONFIG.names.indexOf(player.currentWeapon);
    if (weaponIdx !== -1) {
        const x = 16 + (weaponIdx % 5) * 24;
        const y = 24 + Math.floor(weaponIdx / 5) * 24;
        this.weaponSelectionBox.setPosition(x, y);
        this.weaponSelectionBox.setVisible(true);
    } else {
        this.weaponSelectionBox.setVisible(false);
    }

    const itemIdx = ITEM_CONFIG.names.indexOf(player.currentItem);
    if (itemIdx !== -1) {
        const x = 16 + (itemIdx % 5) * 24;
        const y = 88 + Math.floor(itemIdx / 5) * 24;
        this.itemSelectionBox.setPosition(x, y);
        this.itemSelectionBox.setVisible(true);
    } else {
        this.itemSelectionBox.setVisible(false);
    }
  }

  updateHUD(player: PlayerModel): void {
    this.currentWeaponSprite.setFrame(`weapon_${player.currentWeapon}`);
    this.currentItemSprite.setFrame(`item_${player.currentItem}`);
    const val = player.getAttackValue();
    this.totalValueText.setText(val.toString().padStart(2, '0'));
  }

  slide(isOpen: boolean): void {
    this.scene.tweens.add({
      targets: this.container,
      x: isOpen ? 256 : 0,
      duration: 500,
      ease: 'Power2'
    });
  }
}