import { EnemyConstants, AnimationRates } from '../utils/constants.js';

export class EnemyAnims {
    static createAnimations(anims) {
        // Ampol (Basic Enemy) Animations
        this.createAmpolAnimations(anims, 'ampol');
        
        // You can add more enemy types here
        // this.createAmpolAnimations(anims, 'ampol_aggressive');
        // this.createAmpolAnimations(anims, 'ampol_passive');
    }
    
    static createAmpolAnimations(anims, enemyKey) {
        // Idle animation
        anims.create({
            key: `${enemyKey}_idle`,
            frames: anims.generateFrameNumbers(`${enemyKey}_idle`, { 
                start: 0, 
                end: EnemyConstants.ANIMATION_FRAMES.idle - 1
            }),
            frameRate: AnimationRates.IDLE_FRAMERATE,
            repeat: -1
        });

        // Walk animation
        anims.create({
            key: `${enemyKey}_walk`,
            frames: anims.generateFrameNumbers(`${enemyKey}_walk`, { 
                start: 0, 
                end: EnemyConstants.ANIMATION_FRAMES.walk - 1
            }),
            frameRate: AnimationRates.WALK_FRAMERATE,
            repeat: -1
        });

        // Punch animation
        anims.create({
            key: `${enemyKey}_punch`,
            frames: anims.generateFrameNumbers(`${enemyKey}_punch`, { 
                start: 0, 
                end: EnemyConstants.ANIMATION_FRAMES.punch - 1
            }),
            frameRate: AnimationRates.ATTACK_FRAMERATE,
            repeat: 0
        });

        // Kick animation
        anims.create({
            key: `${enemyKey}_kick`,
            frames: anims.generateFrameNumbers(`${enemyKey}_kick`, { 
                start: 0, 
                end: EnemyConstants.ANIMATION_FRAMES.kick - 1
            }),
            frameRate: AnimationRates.ATTACK_FRAMERATE,
            repeat: 0
        });

        // Hit animation
        anims.create({
            key: `${enemyKey}_hit`,
            frames: anims.generateFrameNumbers(`${enemyKey}_hit`, { 
                start: 0, 
                end: EnemyConstants.ANIMATION_FRAMES.hit - 1
            }),
            frameRate: AnimationRates.HIT_FRAMERATE,
            repeat: 0
        });

        // Death animation
        anims.create({
            key: `${enemyKey}_death`,
            frames: anims.generateFrameNumbers(`${enemyKey}_death`, { 
                start: 0, 
                end: EnemyConstants.ANIMATION_FRAMES.death - 1
            }),
            frameRate: AnimationRates.DEATH_FRAMERATE,
            repeat: 0
        });
    }
}