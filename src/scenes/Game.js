import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { PlayerAnims } from '../animations/PlayerAnims.js';
import { EnemyAnims } from '../animations/EnemyAnims.js';
import { EnemyConstants } from '../utils/constants.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }
    
    create() {
        this.enemies = [];
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.playerDamageCooldown = 0;
        this.isGameEnding = false;
        this.isMobileDevice = this.detectMobileDevice();

        if (this.isMobileDevice) {
            this.input.addPointer(3);
        }

        // Background
        this.add.image(0, 0, 'fightbg')
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(-10);
        
        // Create all animations
        PlayerAnims.createAnimations(this.anims);
        EnemyAnims.createAnimations(this.anims);
        
        // Ground collider
        this.ground = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height - 170,
            this.scale.width,
            40,
            0x000000,
            0
        );
        this.physics.add.existing(this.ground, true);
        
        // Create player
        this.player = new Player(this, 200, 500);
        if (this.isMobileDevice) {
            this.player.enableTouchControls();
        }
        this.physics.add.collider(this.player, this.ground);
        
        // Create enemies (Ampol)
        this.createEnemies();
        
        // Setup collisions
        this.setupCollisions();
        
        // UI
        this.createUI();
    }
    
    createEnemies() {
        // Create one Ampol enemy
        const enemy1 = new Enemy(this, 800, 500, 'ampol', this.player);
        this.physics.add.collider(enemy1, this.ground);
        this.enemies.push(enemy1);
    }
    
    setupCollisions() {
        // Player attack hitbox
        this.playerAttackHitbox = this.add.circle(0, 0, 55, 0xff0000, 0.3);
        this.playerAttackHitbox.setVisible(false);
        this.physics.add.existing(this.playerAttackHitbox);
        
        this.physics.add.overlap(
            this.playerAttackHitbox, 
            this.enemies, 
            this.handlePlayerAttack, 
            null, 
            this
        );
        
        // Enemy attack on player
        this.enemies.forEach(enemy => {
            this.physics.add.overlap(
                enemy,
                this.player,
                this.handleEnemyAttack,
                null,
                this
            );
        });
    }
    
    handlePlayerAttack(hitbox, enemy) {
        if (this.player.isAttacking) {
            const damage = EnemyConstants.COMBAT_DAMAGE;
            enemy.takeDamage(damage, this.player);
            this.updateEnemyHealthBar();

            if (enemy.health <= 0) {
                this.startWinSequence();
                return;
            }
            
            // Knockback
            const direction = enemy.x > this.player.x ? 1 : -1;
            enemy.setVelocityX(direction * 200);
            enemy.setVelocityY(-100);
        }
    }
    
    handleEnemyAttack(enemy, player) {
        const now = this.time.now;
        const attackState = this.getEnemyAttackState(enemy);

        if (now > this.playerDamageCooldown && attackState.isActiveHitWindow) {
            const closeEnough = Phaser.Math.Distance.Between(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            ) <= EnemyConstants.ATTACK_RANGE + 60;

            if (!closeEnough) return;

            const damage = attackState.isKick
                ? Math.floor(EnemyConstants.COMBAT_DAMAGE * 1.15)
                : EnemyConstants.COMBAT_DAMAGE;

            this.damagePlayer(damage);
            
            // Knockback player
            const direction = player.x > enemy.x ? 1 : -1;
            player.setVelocityX(direction * 200);
            player.setVelocityY(-100);
        }
    }

    getEnemyAttackState(enemy) {
        const currentAnimKey = enemy.anims.currentAnim?.key || '';
        const progress = enemy.anims.getProgress ? enemy.anims.getProgress() : 0;

        const isPunch = currentAnimKey.endsWith('_punch');
        const isKick = currentAnimKey.endsWith('_kick');

        const punchActiveWindow = isPunch && progress >= 0.3 && progress <= 0.98;
        const kickActiveWindow = isKick && progress >= 0.25 && progress <= 0.98;

        return {
            isKick,
            isActiveHitWindow: punchActiveWindow || kickActiveWindow
        };
    }

    processEnemyMeleeHits() {
        const now = this.time.now;
        if (now <= this.playerDamageCooldown) return;

        for (const enemy of this.enemies) {
            if (!enemy.active) continue;

            const attackState = this.getEnemyAttackState(enemy);
            if (!attackState.isActiveHitWindow) continue;

            const closeEnough = Phaser.Math.Distance.Between(
                enemy.x,
                enemy.y,
                this.player.x,
                this.player.y
            ) <= EnemyConstants.ATTACK_RANGE + 60;

            if (!closeEnough) continue;

            const damage = attackState.isKick
                ? Math.floor(EnemyConstants.COMBAT_DAMAGE * 1.15)
                : EnemyConstants.COMBAT_DAMAGE;

            this.damagePlayer(damage);

            // Knockback player
            const direction = this.player.x > enemy.x ? 1 : -1;
            this.player.setVelocityX(direction * 200);
            this.player.setVelocityY(-100);
            break;
        }
    }
    
    createUI() {
        // Player Health Bar
        this.createPlayerHealthBar();
        
        // Enemy Health Bar
        this.createEnemyHealthBar();

        if (this.isMobileDevice) {
            this.createMobileControls();
        } else {
            // Control guide
            this.createControlGuide();
        }
    }

    detectMobileDevice() {
        if (typeof navigator === 'undefined') return false;

        if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
            return navigator.userAgentData.mobile;
        }

        const userAgent = navigator.userAgent || navigator.vendor || '';
        return /Android.*Mobile|iPhone|iPod|Windows Phone/i.test(userAgent);
    }

    createMobileControls() {
        const baseY = this.scale.height - 120;
        const leftX = 120;
        const rightX = 235;
        const jumpX = this.scale.width - 270;
        const attackX = this.scale.width - 160;
        const kickX = this.scale.width - 50;

        this.add.rectangle(170, baseY + 12, 300, 150, 0x050814, 0.48)
            .setStrokeStyle(2, 0xffffff, 0.12)
            .setDepth(95);

        this.add.text(68, baseY - 60, 'MOVE', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#9fe7ff'
        }).setDepth(102);

        this.add.text(this.scale.width - 255, baseY - 60, 'ACTIONS', {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#9fe7ff'
        }).setDepth(102);

        const createButton = (x, y, width, height, label, fill, onDown, onUp) => {
            const button = this.add.rectangle(x, y, width, height, fill, 0.75)
                .setStrokeStyle(2, 0xffffff, 0.2)
                .setDepth(100)
                .setInteractive({ useHandCursor: true });

            const buttonText = this.add.text(x, y, label, {
                fontFamily: 'Arial Black',
                fontSize: width >= 90 ? '22px' : '18px',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(101);

            button.on('pointerdown', () => {
                button.setFillStyle(fill, 0.95);
                if (onDown) onDown();
            });

            if (onUp) {
                const release = () => {
                    button.setFillStyle(fill, 0.75);
                    onUp();
                };

                button.on('pointerup', release);
                button.on('pointerout', release);
                button.on('pointerupoutside', release);
            }

            return { button, buttonText };
        };

        createButton(leftX, baseY, 78, 78, '◀', 0x1f6cff, () => {
            this.player.setTouchDirection('left', true);
        }, () => {
            this.player.setTouchDirection('left', false);
        });

        createButton(rightX, baseY, 78, 78, '▶', 0x1f6cff, () => {
            this.player.setTouchDirection('right', true);
        }, () => {
            this.player.setTouchDirection('right', false);
        });

        createButton(jumpX, baseY - 18, 88, 88, 'JUMP', 0x13b26b, () => {
            this.player.requestTouchJump();
        });

        createButton(attackX, baseY - 18, 88, 88, 'ATTACK', 0xe04b4b, () => {
            this.player.requestTouchAttack();
        });

        createButton(kickX, baseY - 18, 88, 88, 'KICK', 0xff9f1c, () => {
            this.player.requestTouchKick();
        });
    }

    createControlGuide() {
        const panelX = 150;
        const panelY = this.scale.height / 2 - 200;
        const panelWidth = 220;
        const panelHeight = 170;

        this.controlGuideBg = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0b1020, 0.62)
            .setStrokeStyle(2, 0xffffff, 0.18)
            .setDepth(99);

        this.controlGuideGlow = this.add.rectangle(panelX, panelY, panelWidth + 10, panelHeight + 10, 0x3ad6ff, 0.08)
            .setDepth(98);

        this.add.text(panelX - 78, panelY - 64, 'CONTROLS', {
            fontSize: '17px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(102);

        this.add.text(panelX - 88, panelY - 34, 'Move', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#9fe7ff'
        }).setDepth(102);

        this.add.text(panelX + 8, panelY - 34, '←  →', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setDepth(102);

        this.add.text(panelX - 88, panelY - 4, 'Jump', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#9fe7ff'
        }).setDepth(102);

        this.add.text(panelX + 8, panelY - 4, '↑', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setDepth(102);

        this.add.text(panelX - 88, panelY + 26, 'Attack', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#9fe7ff'
        }).setDepth(102);

        this.add.text(panelX + 8, panelY + 26, 'SPACE', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setDepth(102);

        this.add.text(panelX - 88, panelY + 56, 'Kick / Dash', {
            fontSize: '13px',
            fontFamily: 'Arial Black',
            color: '#9fe7ff'
        }).setDepth(102);

        this.add.text(panelX + 8, panelY + 56, 'X', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setDepth(102);

        this.add.text(panelX - 88, panelY + 86, 'Tip', {
            fontSize: '13px',
            fontFamily: 'Arial Black',
            color: '#ffe27a'
        }).setDepth(102);

        this.add.text(panelX - 56, panelY + 86, 'Close in to land hits faster.', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setDepth(102);
    }

    createPlayerHealthBar() {
        // Health bar background
        this.playerHealthBarBg = this.add.rectangle(20, 20, 250, 30, 0x333333)
            .setOrigin(0, 0)
            .setDepth(100)
            .setStrokeStyle(2, 0xffffff);
        
        // Health bar fill
        this.playerHealthBarFill = this.add.rectangle(22, 22, 246, 26, 0x00ff00)
            .setOrigin(0, 0)
            .setDepth(101);
        
        // Health text
        this.playerHealthText = this.add.text(145, 35, `${this.playerHealth}/${this.playerMaxHealth}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setDepth(102);
        
        // Player label
        this.add.text(20, 55, 'PLAYER', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setDepth(102);
    }

    createEnemyHealthBar() {
        const enemy = this.enemies.find(e => e.active);
        if (!enemy) return;
        
        const barWidth = 200;
        const barHeight = 20;
        const x = this.scale.width - 20 - barWidth;
        const y = 20;
        
        // Enemy Health Bar Background
        this.enemyHealthBarBg = this.add.rectangle(x, y, barWidth, barHeight, 0x333333)
            .setOrigin(0, 0)
            .setDepth(100)
            .setStrokeStyle(2, 0xff0000);
        
        // Enemy Health Bar Fill
        this.enemyHealthBarFill = this.add.rectangle(x + 2, y + 2, barWidth - 4, barHeight - 4, 0xff0000)
            .setOrigin(0, 0)
            .setDepth(101);
        
        // Enemy Health Text
        const maxHealth = enemy.getMaxHealth();
        this.enemyHealthText = this.add.text(x + barWidth/2, y + barHeight/2, `${enemy.health}/${maxHealth}`, {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5).setDepth(102);
        
        // Enemy name label
        this.add.text(x, y + barHeight + 5, this.getEnemyName(enemy), {
            fontSize: '14px',
            fill: '#ff4444',
            fontFamily: 'Arial'
        }).setDepth(102);
    }

    getEnemyName(enemy) {
        switch(enemy.enemyType) {
            case 'ampol': return 'AMPOL';
            case 'ampol_aggressive': return 'AMPOL (AGGRESSIVE)';
            case 'ampol_passive': return 'AMPOL (PASSIVE)';
            default: return 'ENEMY';
        }
    }
    
    updatePlayerHealthBar() {
        if (!this.playerHealthBarFill) return;
        
        const percentage = Math.max(0, this.playerHealth / this.playerMaxHealth);
        const barWidth = 246 * percentage;
        
        this.playerHealthBarFill.setSize(barWidth, 26);
        
        // Change color based on health
        if (percentage > 0.6) {
            this.playerHealthBarFill.setFillStyle(0x00ff00); // Green
        } else if (percentage > 0.3) {
            this.playerHealthBarFill.setFillStyle(0xffff00); // Yellow
        } else {
            this.playerHealthBarFill.setFillStyle(0xff0000); // Red
        }
        
        // Update text
        if (this.playerHealthText) {
            this.playerHealthText.setText(`${Math.max(0, this.playerHealth)}/${this.playerMaxHealth}`);
        }
    }

    updateEnemyHealthBar() {
        const activeEnemy = this.enemies.find(e => e.active);
        if (!activeEnemy || !this.enemyHealthBarFill) return;
        
        const maxHealth = activeEnemy.getMaxHealth();
        const percentage = Math.max(0, activeEnemy.health / maxHealth);
        const barWidth = (200 - 4) * percentage;
        
        this.enemyHealthBarFill.setSize(barWidth, 16);
        
        // Change color based on health
        if (percentage > 0.6) {
            this.enemyHealthBarFill.setFillStyle(0xff0000); // Red
        } else if (percentage > 0.3) {
            this.enemyHealthBarFill.setFillStyle(0xff6600); // Orange
        } else {
            this.enemyHealthBarFill.setFillStyle(0xff4444); // Light red
        }
        
        // Update text
        if (this.enemyHealthText) {
            this.enemyHealthText.setText(`${Math.max(0, activeEnemy.health)}/${maxHealth}`);
        }
        
        // If enemy is dead, remove health bar
        if (activeEnemy.health <= 0) {
            this.removeEnemyHealthBar();
        }
    }

    removeEnemyHealthBar() {
        if (this.enemyHealthBarBg) {
            this.enemyHealthBarBg.destroy();
            this.enemyHealthBarBg = null;
        }
        if (this.enemyHealthBarFill) {
            this.enemyHealthBarFill.destroy();
            this.enemyHealthBarFill = null;
        }
        if (this.enemyHealthText) {
            this.enemyHealthText.destroy();
            this.enemyHealthText = null;
        }
    }
    
    update(time) {
        if (this.isGameEnding) return;
        
        this.player.update(time);
        
        // Update all enemies
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.update(time);
            }
        });
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => enemy.active);

        // Fallback close-range hit check so melee hits register even with body offsets.
        this.processEnemyMeleeHits();
        
        // Update attack hitbox position
        if (this.player.isAttacking) {
            const offset = this.player.facing === 'right' ? 100 : -100;
            this.playerAttackHitbox.setPosition(this.player.x + offset, this.player.y + 10);
        }
    }
    
    damagePlayer(amount) {
        const now = this.time.now;
        if (this.isGameEnding) return;

        if (now > this.playerDamageCooldown) {
            this.playerHealth -= amount;
            this.playerDamageCooldown = now + 500;

            if (this.playerHealth > 0) {
                this.player.takeHit();
            }
            
            // Visual feedback
            this.player.setTint(0xff0000);
            this.time.delayedCall(200, () => {
                if (this.player.active) {
                    this.player.clearTint();
                }
            });
            
            this.updatePlayerHealthBar();

            if (this.playerHealth <= 0) {
                this.startGameOverSequence();
            }
        }
    }

    startWinSequence() {
        if (this.isGameEnding) return;

        this.isGameEnding = true;

        if (this.enemyHealthText) {
            this.enemyHealthText.setText('DEFEATED');
        }

        this.player.body.setVelocity(0, 0);
        this.playerAttackHitbox.setVisible(false);

        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            enemy.setVelocity(0, 0);
            enemy.body.enable = false;
        });

        this.time.delayedCall(1500, () => {
            this.scene.start('GameOver', {
                result: 'win',
                title: 'YOU WIN',
                message: 'Ampol was defeated.'
            });
        });
    }

    startGameOverSequence() {
        if (this.isGameEnding) return;

        this.isGameEnding = true;
        
        // Update UI to show 0 health
        if (this.playerHealthText) {
            this.playerHealthText.setText('GAME OVER');
        }

        this.player.die();
        this.playerAttackHitbox.setVisible(false);

        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            enemy.setVelocity(0, 0);
            enemy.body.enable = false;
        });

        // Delay before freezing/changing scene so death animation can finish.
        this.time.delayedCall(1200, () => {
            this.scene.start('GameOver', {
                result: 'lose',
                title: 'GAME OVER',
                message: 'Try again.'
            });
        });
    }
}