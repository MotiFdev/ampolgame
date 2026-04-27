import { StateMachine } from './StateMachine.js';
import { EnemyConstants } from '../utils/constants.js';

export class EnemyAI {
    constructor(enemy, player) {
        this.enemy = enemy;
        this.player = player;
        this.stateMachine = new StateMachine(this);
        this.lastAttackTime = 0;
        this.nextAttackTime = 0;
        this.comboCount = 0;
        this.patrolDirection = 1;
        this.startX = enemy.x;
        
        this.setupStates();
        this.stateMachine.setState('idle');
    }
    
    setupStates() {
        // Idle State
        this.stateMachine.addState('idle', {
            onEnter: () => {
                this.enemy.setVelocityX(0);
                this.enemy.play(`${this.enemy.enemyType}_idle`);
                this.idleTimer = 0;
            },
            onUpdate: (time, delta) => {
                // Check if player is in detection range
                const distanceToPlayer = this.getDistanceToPlayer();
                
                if (distanceToPlayer < EnemyConstants.DETECTION_RANGE) {
                    this.stateMachine.setState('chase');
                    return;
                }
                
                // Idle for 1-2 seconds then patrol
                this.idleTimer += delta;
                if (this.idleTimer > Phaser.Math.Between(1000, 2000)) {
                    this.stateMachine.setState('patrol');
                }
            }
        });
        
        // Patrol State
        this.stateMachine.addState('patrol', {
            onEnter: () => {
                this.enemy.play(`${this.enemy.enemyType}_walk`);
            },
            onUpdate: () => {
                const distanceToPlayer = this.getDistanceToPlayer();
                
                // Switch to chase if player detected
                if (distanceToPlayer < EnemyConstants.DETECTION_RANGE) {
                    this.stateMachine.setState('chase');
                    return;
                }
                
                // Patrol movement
                if (this.enemy.x >= this.startX + EnemyConstants.PATROL_DISTANCE) {
                    this.patrolDirection = -1;
                } else if (this.enemy.x <= this.startX - EnemyConstants.PATROL_DISTANCE) {
                    this.patrolDirection = 1;
                }
                
                this.enemy.setVelocityX(this.patrolDirection * EnemyConstants.WALK_SPEED);
                this.enemy.setFlipX(this.patrolDirection === 1);
                
                // Random chance to go idle
                if (Math.random() < 0.005) {
                    this.stateMachine.setState('idle');
                }
            },
            onExit: () => {
                this.enemy.setVelocityX(0);
            }
        });
        
        // Chase State
        this.stateMachine.addState('chase', {
            onEnter: () => {
                this.enemy.play(`${this.enemy.enemyType}_walk`);
            },
            onUpdate: () => {
                const distanceToPlayer = this.getDistanceToPlayer();
                
                // Stop chasing if player too far
                if (distanceToPlayer > EnemyConstants.LOSE_INTEREST_RANGE) {
                    this.stateMachine.setState('patrol');
                    return;
                }
                
                // Attack if in range
                if (distanceToPlayer < EnemyConstants.ATTACK_RANGE) {
                    this.stateMachine.setState('attack');
                    return;
                }
                
                // Chase player
                const direction = this.player.x > this.enemy.x ? 1 : -1;
                const sprintBoost = distanceToPlayer > EnemyConstants.ATTACK_RANGE * 2 ? 40 : 0;
                this.enemy.setVelocityX(direction * (EnemyConstants.CHASE_SPEED + sprintBoost));
                this.enemy.setFlipX(direction === 1);
            },
            onExit: () => {
                this.enemy.setVelocityX(0);
            }
        });
        
        // Attack State
        this.stateMachine.addState('attack', {
            onEnter: () => {
                this.enemy.setVelocityX(0);
                this.comboCount = 0;
                this.nextAttackTime = this.enemy.scene.time.now + EnemyConstants.ATTACK_WINDUP;
            },
            onUpdate: (time) => {
                const distanceToPlayer = this.getDistanceToPlayer();

                if (distanceToPlayer > EnemyConstants.LOSE_INTEREST_RANGE) {
                    this.stateMachine.setState('patrol');
                    return;
                }

                if (distanceToPlayer > EnemyConstants.ATTACK_RANGE * 1.35) {
                    this.stateMachine.setState('chase');
                    return;
                }
                
                // Cooldown before next attack
                if (time >= this.nextAttackTime) {
                    this.performAttack(distanceToPlayer);
                    this.lastAttackTime = time;

                    this.comboCount += 1;
                    const inComboRange = distanceToPlayer <= EnemyConstants.ATTACK_RANGE * 1.15;
                    const shouldCombo = inComboRange && this.comboCount < EnemyConstants.MAX_COMBO && Math.random() < 0.6;

                    if (shouldCombo) {
                        this.nextAttackTime = time + EnemyConstants.COMBO_COOLDOWN;
                    } else {
                        this.comboCount = 0;
                        this.nextAttackTime = time + EnemyConstants.ATTACK_COOLDOWN;
                    }
                }
            }
        });
        
        // Hit State (flinch when damaged)
        this.stateMachine.addState('hit', {
            onEnter: () => {
                this.enemy.setVelocityX(0);
                this.enemy.play(`${this.enemy.enemyType}_hit`);
                
                // Listen for animation complete
                this.enemy.once('animationcomplete', () => {
                    if (this.enemy.health > 0) {
                        this.stateMachine.revertToPreviousState();
                    }
                });
            },
            onUpdate: () => {
                // Wait for animation to complete
            }
        });
        
        // Death State
        this.stateMachine.addState('death', {
            onEnter: () => {
                this.enemy.setVelocityX(0);
                this.enemy.body.enable = false;
                this.enemy.play(`${this.enemy.enemyType}_death`);
                
                this.enemy.once('animationcomplete', () => {
                    this.enemy.anims.pause();
                });
            }
        });
    }
    
    getDistanceToPlayer() {
        return Phaser.Math.Distance.Between(
            this.enemy.x, this.enemy.y,
            this.player.x, this.player.y
        );
    }
    
    performAttack(distanceToPlayer) {
        // Pick attack based on spacing: punch close, kick at edge range.
        const preferKick = distanceToPlayer > EnemyConstants.ATTACK_RANGE * 0.65;
        const attackType = preferKick
            ? (Math.random() < 0.7 ? 'kick' : 'punch')
            : (Math.random() < 0.7 ? 'punch' : 'kick');

        const direction = this.player.x > this.enemy.x ? 1 : -1;
        this.enemy.setFlipX(direction === 1);
        this.enemy.play(`${this.enemy.enemyType}_${attackType}`);

        // Small lunge to keep pressure on the player.
        this.enemy.setVelocityX(direction * EnemyConstants.LUNGE_SPEED);
        this.enemy.scene.time.delayedCall(EnemyConstants.LUNGE_TIME, () => {
            if (this.enemy.active && this.stateMachine.currentState === 'attack') {
                this.enemy.setVelocityX(0);
            }
        });
    }
    
    takeDamage(damage) {
        this.enemy.health -= damage;
        
        if (this.enemy.health <= 0) {
            this.stateMachine.setState('death');
        } else {
            this.stateMachine.setState('hit');
        }
    }
    
    update(time, delta) {
        if (this.enemy.active) {
            this.stateMachine.update(time, delta);
        }
    }
}