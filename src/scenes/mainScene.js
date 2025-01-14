import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.image('bird1', 'src/assets/bird/bird1.png');
        this.load.image('bird2', 'src/assets/bird/bird2.png');
        this.load.image('bird3', 'src/assets/bird/bird3.png');
        this.load.image('pipe1', 'src/assets/pipe/pipe1.png');
        this.load.image('pipe2', 'src/assets/pipe/pipe2.png');
        this.load.image('pipe3', 'src/assets/pipe/pipe3.png');
        this.load.image('background', 'src/assets/bg/background.png');
        this.load.image('restart', 'src/assets/button/restart.png');
        this.load.image('logo', 'src/assets/logo/powered_by_yogaone.png');
    }

    create() {
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'background');
        this.bg.setOrigin(0, 0);
    
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            font: '32px Arial',
            fill: '#ffffff'
        });
    
        const birdHeight = 44;
        this.bird = this.physics.add.sprite(100, this.cameras.main.centerY, 'bird1');
    
        this.anims.create({
            key: 'fly',
            frames: [
                { key: 'bird1' },
                { key: 'bird2' },
                { key: 'bird3' }
            ],
            frameRate: 10,
            repeat: -1
        });
    
        this.bird.anims.play('fly');
    
        const birdAspectRatio = this.bird.width / this.bird.height;
        const birdWidth = birdHeight * birdAspectRatio;
    
        this.bird.setDisplaySize(birdWidth, birdHeight);
        this.bird.setGravityY(1000);
        this.bird.setCollideWorldBounds(true);
    
        this.input.keyboard.on('keydown-SPACE', () => {
            this.bird.setVelocityY(-350);
        });
    
        this.pipes = this.physics.add.group();
    
        this.time.addEvent({
            delay: 1500,
            callback: this.spawnPipe,
            callbackScope: this,
            loop: true
        });
    
        this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
    
        this.bird.setBounce(1);
    
        this.gameOverPopup = this.createGameOverPopup();
        this.gameOverPopup.setVisible(false);

        this.logo = this.add.image(this.cameras.main.width - 20, 20, 'logo').setOrigin(1, 0).setScale(0.1);
    }
    
    update() {
        this.pipes.getChildren().forEach(pipe => {
            if (pipe.getBounds().right < this.bird.x && !pipe.scored) {
                this.score += 1;
                pipe.scored = true;
                this.scoreText.setText('Score: ' + this.score);
            }
        });

        this.pipes.getChildren().forEach(pipe => {
            if (pipe.getBounds().right < 0) {
                pipe.destroy();
            }
        });

        this.bg.tilePositionX += 2;
    }

    spawnPipe() {
        const gap = 200;

        const pipeChoice = Phaser.Math.Between(1, 3);

        const pipeHeight = Phaser.Math.Between(100, this.cameras.main.height - gap);

        let pipe;
        if (pipeChoice === 1) {
            pipe = 'pipe1';
        } else if (pipeChoice === 2) {
            pipe = 'pipe2';
        } else {
            pipe = 'pipe3';
        }

        const topPipe = this.pipes.create(this.cameras.main.width, pipeHeight, pipe);
        topPipe.setOrigin(0, 1);
        topPipe.setDisplaySize(64, 400);
        topPipe.setVelocityX(-200);
        topPipe.body.setAllowGravity(false);

        const bottomPipe = this.pipes.create(this.cameras.main.width, pipeHeight + gap, pipe);
        bottomPipe.setOrigin(0, 0);
        bottomPipe.setDisplaySize(64, 400);
        bottomPipe.setVelocityX(-200);
        bottomPipe.body.setAllowGravity(false);
    }

    gameOver() {
        this.gameOverPopup.setVisible(true);
        this.bird.setVisible(false);
        this.pipes.setVisible(false);
    }

    createGameOverPopup() {
        const container = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);

        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.7);
        background.fillRect(-150, -100, 300, 200);

        const gameOverText = this.add.text(0, -40, 'Game Over', {
            font: '32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const finalScoreText = this.add.text(0, 0, 'Score: ' + this.score, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const restartButton = this.add.sprite(0, 60, 'restart').setInteractive();
        restartButton.setDisplaySize(100, 50);
        restartButton.on('pointerdown', () => this.restartGame());

        container.add([background, gameOverText, finalScoreText, restartButton]);

        return container;
    }

    restartGame() {
        this.scene.restart();
    }
}