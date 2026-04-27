import { EnemyConstants } from '../utils/constants.js';
import { EnemyAI } from '../ai/EnemyAI.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'ampol', player) {
        // Use the correct texture key
        const textureKey = `${type}_idle`;
        super(scene, x, y, textureKey);
        
        this.scene = scene;
        this.enemyType = type;
        this.health = this.getMaxHealth();
        this.isInvincible = false;
        this.invincibleTimer = 0;
        
        // Setup physics
        scene.physics.world.enable(this);
        scene.add.existing(this);
        
        // Configure physics body
        this.setDisplaySize(
            EnemyConstants.DISPLAY_WIDTH, 
            EnemyConstants.DISPLAY_HEIGHT
        );
        this.setCollideWorldBounds(true);
        this.body.setAllowGravity(true);
        this.setGravityY(EnemyConstants.GRAVITY);
        this.setSize(
            EnemyConstants.COLLISION_WIDTH, 
            EnemyConstants.COLLISION_HEIGHT
        );
        this.setOffset(
            EnemyConstants.OFFSET_X, 
            EnemyConstants.OFFSET_Y
        );
        
        // Setup AI
        this.ai = new EnemyAI(this, player);
        
        // Start with idle animation
        this.play(`${this.enemyType}_idle`);
    }
    
    getMaxHealth() {
        switch(this.enemyType) {
            case 'ampol': return EnemyConstants.BASIC_HEALTH;
            case 'ampol_aggressive': return EnemyConstants.AGGRESSIVE_HEALTH;
            case 'ampol_passive': return EnemyConstants.PASSIVE_HEALTH;
            default: return EnemyConstants.BASIC_HEALTH;
        }
    }
    
    takeDamage(amount, source) {
        if (this.isInvincible) return;
        
        this.health -= amount;
        
        if (this.ai) {
            this.ai.takeDamage(amount);
        }
        
        // Brief invincibility frames
        this.isInvincible = true;
        this.scene.time.delayedCall(500, () => {
            if (this.active) {
                this.isInvincible = false;
            }
        });
        
        // Visual feedback - flash red
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) {
                this.clearTint();
            }
        });
    }
    
    update(time, delta) {
        if (this.active && this.ai) {
            this.ai.update(time, delta);
        }
        
        // Update invincibility visual effect
        if (this.isInvincible) {
            this.alpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        } else {
            this.alpha = 1;
        }
    }
}