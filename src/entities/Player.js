import { PlayerConstants } from '../utils/constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'dencarl_idle');
        
        this.scene = scene;
        this.facing = 'right';
        this.isAttacking = false;
        this.isKickingDash = false;
        this.kickDashEndTime = 0;
        this.isHit = false;
        this.isDead = false;
        this.touchControlsEnabled = false;
        this.touchInput = {
            left: false,
            right: false
        };
        this.touchJumpRequested = false;
        this.touchAttackRequested = false;
        this.touchKickRequested = false;
        
        // Setup physics
        scene.physics.world.enable(this);
        scene.add.existing(this);
        
        // Configure physics body
        this.setDisplaySize(PlayerConstants.DISPLAY_WIDTH, PlayerConstants.DISPLAY_HEIGHT);
        this.setCollideWorldBounds(true);
        this.body.setAllowGravity(true);
        this.setGravityY(PlayerConstants.GRAVITY);
        this.setSize(PlayerConstants.COLLISION_WIDTH, PlayerConstants.COLLISION_HEIGHT);
        
        // Setup controls
        this.setupControls();
        
        // Start idle
        this.play('idle_left');
    }
    
    setupControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.attackKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.kickKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        
        // Setup animation complete listeners
        this.on('animationcomplete', (animation) => {
            if (animation.key.includes('punch') || animation.key.includes('kick')) {
                this.isAttacking = false;
                this.isKickingDash = false;
                this.body.setVelocityX(0);
                this.play(this.facing === 'right' ? 'idle_right' : 'idle_left');
            } else if (animation.key.includes('hit')) {
                this.isHit = false;
                if (!this.isDead) {
                    const idleAnim = this.facing === 'right' ? 'idle_right' : 'idle_left';
                    this.play(idleAnim);
                }
            }
        });
    }
    
    update(time) {
        if (this.isDead) return;

        if (this.isHit) {
            return;
        }

        if (this.isAttacking) {
            this.handleAttackMovement(time);
            return;
        }
        
        if (this.touchControlsEnabled) {
            this.handleTouchInput(time);
        } else {
            this.handleInput(time);
        }
        this.handleAnimation();
        this.handleJumping();
    }

    enableTouchControls() {
        this.touchControlsEnabled = true;
    }

    setTouchDirection(direction, isDown) {
        if (direction === 'left') {
            this.touchInput.left = isDown;
            if (isDown) {
                this.touchInput.right = false;
            }
        } else if (direction === 'right') {
            this.touchInput.right = isDown;
            if (isDown) {
                this.touchInput.left = false;
            }
        }
    }

    requestTouchJump() {
        this.touchJumpRequested = true;
    }

    requestTouchAttack() {
        this.touchAttackRequested = true;
    }

    requestTouchKick() {
        this.touchKickRequested = true;
    }

    handleTouchInput(time) {
        if (this.touchAttackRequested) {
            this.touchAttackRequested = false;
            this.startAttack('punch');
            return;
        }

        if (this.touchKickRequested) {
            this.touchKickRequested = false;
            this.startKick(time);
            return;
        }

        const onGround = this.body.blocked.down || this.body.touching.down;

        if (this.touchJumpRequested && onGround) {
            this.body.setVelocityY(-PlayerConstants.JUMP_SPEED);
            this.touchJumpRequested = false;
        }

        this.body.setVelocityX(0);

        if (this.touchInput.left) {
            this.body.setVelocityX(-PlayerConstants.WALK_SPEED);
            this.setFlipX(false);
            this.facing = 'left';
        } else if (this.touchInput.right) {
            this.body.setVelocityX(PlayerConstants.WALK_SPEED);
            this.setFlipX(true);
            this.facing = 'right';
        }
    }
    
    handleAttackMovement(time) {
        if (this.isKickingDash && time < this.kickDashEndTime) {
            const dashDirection = this.facing === 'right' ? 1 : -1;
            this.body.setVelocityX(dashDirection * PlayerConstants.KICK_DASH_SPEED);
        } else {
            this.isKickingDash = false;
            this.body.setVelocityX(0);
        }
    }
    
    handleInput(time) {
        // Attack
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.startAttack('punch');
            return;
        }
        
        // Kick
        if (Phaser.Input.Keyboard.JustDown(this.kickKey)) {
            this.startKick(time);
            return;
        }
        
        // Movement
        const onGround = this.body.blocked.down || this.body.touching.down;
        
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround) {
            this.body.setVelocityY(-PlayerConstants.JUMP_SPEED);
        }
        
        this.body.setVelocityX(0);
        
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-PlayerConstants.WALK_SPEED);
            this.setFlipX(false);
            this.facing = 'left';
        } else if (this.cursors.right.isDown) {
            this.body.setVelocityX(PlayerConstants.WALK_SPEED);
            this.setFlipX(true);
            this.facing = 'right';
        }
    }
    
    startAttack(type) {
        if (this.isDead || this.isHit) return;

        this.isAttacking = true;
        this.isKickingDash = false;
        this.body.setVelocityX(0);
        
        const animation = this.facing === 'right' ? `${type}_right` : `${type}_left`;
        this.setFlipX(this.facing === 'right');
        this.play(animation);
    }
    
    startKick(time) {
        if (this.isDead || this.isHit) return;

        this.isAttacking = true;
        this.isKickingDash = true;
        this.kickDashEndTime = time + PlayerConstants.KICK_DASH_DURATION;
        
        const dashDirection = this.facing === 'right' ? 1 : -1;
        this.body.setVelocityX(dashDirection * PlayerConstants.KICK_DASH_SPEED);
        
        const animation = this.facing === 'right' ? 'kick_right' : 'kick_left';
        this.setFlipX(this.facing === 'right');
        this.play(animation);
    }
    
    handleAnimation() {
        // Don't change animation if attacking
        if (this.isAttacking || this.isHit || this.isDead) return;
        
        // Walking animation
        if (this.touchControlsEnabled ? (this.touchInput.left || this.touchInput.right) : (this.cursors.left.isDown || this.cursors.right.isDown)) {
            const walkAnim = this.facing === 'right' ? 'walk_right' : 'walk_left';
            if (this.anims.currentAnim?.key !== walkAnim) {
                this.play(walkAnim);
            }
        }
    }
    
    handleJumping() {
        if (this.isHit || this.isDead) return;

        const isInAir = !(this.body.blocked.down || this.body.touching.down);
        const isMoving = this.touchControlsEnabled
            ? (this.touchInput.left || this.touchInput.right)
            : (this.cursors.left.isDown || this.cursors.right.isDown);
        
        if (isInAir && !this.isAttacking) {
            const isGoingUp = this.body.velocity.y < 0;
            
            if (this.facing === 'right') {
                this.setFlipX(true);
                const jumpAnim = isGoingUp ? 'jump_up_right' : 'jump_down_right';
                if (this.anims.currentAnim?.key !== jumpAnim) {
                    this.play(jumpAnim);
                }
            } else {
                this.setFlipX(false);
                const jumpAnim = isGoingUp ? 'jump_up_left' : 'jump_down_left';
                if (this.anims.currentAnim?.key !== jumpAnim) {
                    this.play(jumpAnim);
                }
            }
        } else if (!isInAir && !this.isAttacking && !isMoving) {
            // Ground idle
            const idleAnim = this.facing === 'right' ? 'idle_right' : 'idle_left';
            if (this.anims.currentAnim?.key !== idleAnim) {
                this.play(idleAnim);
            }
        }
    }

    takeHit() {
        if (this.isDead) return;

        this.isAttacking = false;
        this.isKickingDash = false;
        this.isHit = true;

        const hitAnim = this.facing === 'right' ? 'hit_right' : 'hit_left';
        this.setFlipX(this.facing === 'right');
        this.play(hitAnim, true);
    }

    die() {
        if (this.isDead) return;

        this.isDead = true;
        this.isHit = false;
        this.isAttacking = false;
        this.isKickingDash = false;
        this.body.setVelocity(0, 0);

        const deathAnim = this.facing === 'right' ? 'death_right' : 'death_left';
        this.setFlipX(this.facing === 'right');
        this.play(deathAnim, true);
    }
}