const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let obstacles;
let energy = 0;
let energyText;
let score = 0;
let scoreText;

function preload() {
    // Load images from the assets folder
    this.load.image('player', 'assets/player.png');
    this.load.image('obstacle', 'assets/obstacle.png');
}

function create() {
    // Player sprite
    player = this.physics.add.sprite(200, 500, 'player');
    player.setCollideWorldBounds(true);

    // Obstacles group
    obstacles = this.physics.add.group();

    // Energy and score text
    energyText = this.add.text(10, 10, 'Energy: 0', { fontSize: '16px', fill: '#000' });
    scoreText = this.add.text(10, 30, 'Score: 0', { fontSize: '16px', fill: '#000' });

    // Tap input
    this.input.on('pointerdown', () => {
        energy += 1;
        energyText.setText('Energy: ' + energy);
    });

    // Spawn obstacles every 1.5 seconds
    this.time.addEvent({
        delay: 1500,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
    });

    // Collision detection
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);
}

function update() {
    // Keyboard movement for testing (left/right arrows)
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    // Remove obstacles that go off-screen and update score
    obstacles.children.iterate(function (obstacle) {
        if (obstacle.y > 600) {
            obstacle.destroy();
            score += 1;
            scoreText.setText('Score: ' + score);
        }
    });
}

function spawnObstacle() {
    const x = Phaser.Math.Between(50, 350);
    const obstacle = obstacles.create(x, 0, 'obstacle');
    obstacle.setVelocityY(150);
}

function hitObstacle(player, obstacle) {
    this.physics.pause();
    player.setTint(0xff0000);
    energyText.setText('Game Over! Final Energy: ' + energy);
}
