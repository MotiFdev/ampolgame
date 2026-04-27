export const PlayerConstants = {
    WALK_SPEED: 200,
    JUMP_SPEED: 200,
    KICK_DASH_SPEED: 700,
    KICK_DASH_DURATION: 160,
    GRAVITY: 500,
    DISPLAY_WIDTH: 260,
    DISPLAY_HEIGHT: 440,
    COLLISION_WIDTH: 50,
    COLLISION_HEIGHT: 60
};

export const EnemyConstants = {
    // Enemy types
    TYPES: {
        BASIC: 'ampol',  // Changed to 'ampol'
        AGGRESSIVE: 'ampol_aggressive',
        PASSIVE: 'ampol_passive'
    },
    
    // Movement
    WALK_SPEED: 100,
    CHASE_SPEED: 170,
    PATROL_DISTANCE: 200,
    
    // Combat
    ATTACK_COOLDOWN: 700,  // ms
    ATTACK_RANGE: 85,
    DETECTION_RANGE: 480,
    LOSE_INTEREST_RANGE: 620,
    ATTACK_WINDUP: 220,
    COMBO_COOLDOWN: 180,
    MAX_COMBO: 2,
    LUNGE_SPEED: 260,
    LUNGE_TIME: 120,
    
    // Physics
    GRAVITY: 500,
    DISPLAY_WIDTH: 260,
    DISPLAY_HEIGHT: 350,
    COLLISION_WIDTH: 100,
    COLLISION_HEIGHT: 120,
    OFFSET_X: 200,
    OFFSET_Y: 260,
    
    // Health
    BASIC_HEALTH: 100,
    AGGRESSIVE_HEALTH: 80,
    PASSIVE_HEALTH: 30,
    
    // Damage
    COMBAT_DAMAGE: 15,
    BASIC_DAMAGE: 14,
    AGGRESSIVE_DAMAGE: 15,
    PASSIVE_DAMAGE: 5,
    
    // Animation frame counts (adjust based on your actual spritesheet frames)
    ANIMATION_FRAMES: {
        idle: 8,      // Number of frames in idle.png
        walk: 12,     // Number of frames in walk.png
        punch: 4,     // Number of frames in punch.png
        kick: 7,      // Number of frames in kick.png
        hit: 3,       // Number of frames in hit.png
        death: 1      // Number of frames for death (you may need to create this)
    }
};


export const AnimationRates = {
    IDLE_FRAMERATE: 4,
    WALK_FRAMERATE: 10,
    ATTACK_FRAMERATE: 14,
    JUMP_FRAMERATE: 12,
    HIT_FRAMERATE: 8,
    DEATH_FRAMERATE: 5
};

