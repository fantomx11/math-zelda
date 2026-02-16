/**
 * Configuration for the skin system.
 */
export const SKIN_CONFIG = {
    startPos: { x: 256, y: 0 },
    frameSize: { w: 16, h: 16 },
    skins: [
        "Link", "Zelda", "Shiek", "Impa", "Ganondorf", "Darunia", "Ruto", "Agitha",
        "Midna", "Fi", "Ghirarim", "Zant", "Lana", "Cia", "Volga", "Wizzro",
        "Twili Midna", "Kid Link", "Tingle", "Linkle", "Skull Kid", "Toon Link",
        "Tetra", "King Daphnes", "Medli", "Marin", "Toon Zelda", "Yuga"
    ],
    anims: {
        down: { start: 0, length: 2, rate: 8, repeat: -1 },
        up: { start: 2, length: 2, rate: 8, repeat: -1 },
        left: { start: 4, length: 2, rate: 8, repeat: -1 },
        right: { start: 6, length: 2, rate: 8, repeat: -1 },
        atk_down: { start: 8, length: 1, rate: 10, repeat: 0 },
        atk_up: { start: 9, length: 1, rate: 10, repeat: 0 },
        atk_left: { start: 10, length: 1, rate: 10, repeat: 0 },
        atk_right: { start: 11, length: 1, rate: 10, repeat: 0 },
        item_1h: { start: 12, length: 1, rate: 10, repeat: 0 },
        item_2h: { start: 13, length: 1, rate: 10, repeat: 0 }
    }
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
//# sourceMappingURL=config.js.map