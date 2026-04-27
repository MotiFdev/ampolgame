export class PlayerAnims {
    static createAnimations(anims) {
        // Idle animations
        anims.create({
            key: 'idle_left',
            frames: anims.generateFrameNumbers('dencarl_idle', { start: 0, end: 7 }),
            frameRate: 4,
            repeat: -1
        });

        anims.create({
            key: 'idle_right',
            frames: anims.generateFrameNumbers('dencarl_idle', { start: 0, end: 7 }),
            frameRate: 4,
            repeat: -1
        });

        // Walk animations
        anims.create({
            key: 'walk_left',
            frames: anims.generateFrameNumbers('dencarl_walk', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: 'walk_right',
            frames: anims.generateFrameNumbers('dencarl_walk', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        // Attack animations
        anims.create({
            key: 'punch_left',
            frames: anims.generateFrameNumbers('dencarl_punch'),
            frameRate: 14,
            repeat: 0
        });

        anims.create({
            key: 'punch_right',
            frames: anims.generateFrameNumbers('dencarl_punch'),
            frameRate: 14,
            repeat: 0
        });

        anims.create({
            key: 'kick_left',
            frames: anims.generateFrameNumbers('dencarl_kick'),
            frameRate: 14,
            repeat: 0
        });

        anims.create({
            key: 'kick_right',
            frames: anims.generateFrameNumbers('dencarl_kick'),
            frameRate: 14,
            repeat: 0
        });

        // Jump animations
        anims.create({
            key: 'jump_up_left',
            frames: anims.generateFrameNumbers('dencarl_jump', { start: 4, end: 5 }),
            frameRate: 12,
            repeat: 0
        });

        anims.create({
            key: 'jump_up_right',
            frames: anims.generateFrameNumbers('dencarl_jump', { start: 4, end: 5 }),
            frameRate: 12,
            repeat: 0
        });

        anims.create({
            key: 'jump_down_left',
            frames: anims.generateFrameNumbers('dencarl_jump', { start: 5, end: 12 }),
            frameRate: 14,
            repeat: -1
        });

        anims.create({
            key: 'jump_down_right',
            frames: anims.generateFrameNumbers('dencarl_jump', { start: 5, end: 12 }),
            frameRate: 14,
            repeat: -1
        });

        // Hit animations
        anims.create({
            key: 'hit_left',
            frames: anims.generateFrameNumbers('dencarl_hit'),
            frameRate: 10,
            repeat: 0
        });

        anims.create({
            key: 'hit_right',
            frames: anims.generateFrameNumbers('dencarl_hit'),
            frameRate: 10,
            repeat: 0
        });

        // Death animations
        anims.create({
            key: 'death_left',
            frames: anims.generateFrameNumbers('dencarl_death'),
            frameRate: 8,
            repeat: 0
        });

        anims.create({
            key: 'death_right',
            frames: anims.generateFrameNumbers('dencarl_death'),
            frameRate: 8,
            repeat: 0
        });
    }
}