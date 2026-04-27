export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background').setDisplaySize(this.scale.width, this.scale.height);

        this.progressBox = this.add.rectangle(512, 620, 460, 34, 0x000000, 0.55)
            .setStrokeStyle(2, 0xffffff);
        this.progressBar = this.add.rectangle(282, 620, 0, 26, 0x00e5ff)
            .setOrigin(0, 0.5);
        this.progressText = this.add.text(512, 665, 'Loading 0%', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.waitDots = 0;
        this.waitText = this.add.text(512, 560, 'PLEASE WAIT', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.waitTimer = this.time.addEvent({
            delay: 300,
            loop: true,
            callback: () => {
                this.waitDots = (this.waitDots + 1) % 4;
                this.waitText.setText(`PLEASE WAIT${'.'.repeat(this.waitDots)}`);
            }
        });


    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.on('progress', (value) => {
            this.progressBar.width = 456 * value;
            this.progressText.setText(`Loading ${Math.floor(value * 100)}%`);
        });

        this.load.on('complete', () => {
            if (this.progressText) {
                this.progressText.setText('Loading 100%');
            }
        });

        this.load.image('fightbg', 'fightbg.png');
        this.load.image('winplayerbg', 'winplayerbg.png');
        this.load.image('gameoverbg', 'gameoverbg.png');
        this.load.spritesheet('player', 'characters/player.png', {
            frameWidth: 48,    // Width of each frame
            frameHeight: 48    // Height of each frame
        });

        this.load.spritesheet('dencarl_idle', 'characters/dencarl/idle/idle.png', {
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('dencarl_walk', 'characters/dencarl/walk/walk.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('dencarl_punch', 'characters/dencarl/punch/pucnch.png',{
            frameWidth: 464,
            frameHeight: 832
        });

         this.load.spritesheet('dencarl_kick', 'characters/dencarl/kick/kick.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('dencarl_jump', 'characters/dencarl/jump/jump.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('dencarl_hit', 'characters/dencarl/hit.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('dencarl_death', 'characters/dencarl/death.png',{
            frameWidth: 583,
            frameHeight: 1024
        });

        this.load.spritesheet('ampol_idle', 'characters/Ampol/idle.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('ampol_walk', 'characters/Ampol/walk.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('ampol_punch', 'characters/Ampol/punch.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('ampol_kick', 'characters/Ampol/kick.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('ampol_hit', 'characters/Ampol/hit.png',{
            frameWidth: 464,
            frameHeight: 832
        });

        this.load.spritesheet('ampol_death', 'characters/Ampol/death.png',{
            frameWidth: 605,
            frameHeight: 1024
        });




    }

    create() {
        if (this.progressBox) {
            this.progressBox.destroy();
        }
        if (this.progressBar) {
            this.progressBar.destroy();
        }
        if (this.progressText) {
            this.progressText.destroy();
        }

        if (this.waitTimer) {
            this.waitTimer.remove(false);
        }

        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        this.time.delayedCall(5000, () => {
            this.scene.start('Game');
        });
    }
}
