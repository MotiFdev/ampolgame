export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        this.result = data.result || 'lose';
        this.titleText = data.title || 'GAME OVER';
        this.messageText = data.message || 'Play again?';
    }

    create() {
        const backgroundKey = this.result === 'win' ? 'winplayerbg' : 'gameoverbg';

        this.add.image(0, 0, backgroundKey)
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height);

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.55)
            .setOrigin(0, 0)
            .setDepth(0);

        this.add.text(512, 300, this.titleText, {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(1);

        this.add.text(512, 380, this.messageText, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(1);

        const buttonBg = this.add.rectangle(512, 470, 240, 64, 0xffffff, 0.2)
            .setStrokeStyle(3, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .setDepth(1);

        const buttonText = this.add.text(512, 470, 'PLAY AGAIN', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1);

        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0xffffff, 0.35);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0xffffff, 0.2);
        });

        buttonBg.on('pointerdown', () => {
            this.scene.start('Game');
        });

    }
}
