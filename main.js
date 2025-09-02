const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, obstacles, gravestone;
let energy = 0, energyText;
let score = 0, scoreText;
let lastTapTime = 0;
let obstacleSpeed = 150;
let isDead = false;

function preload() {
    // No external assets
}

function create() {
    startLevel(this);
}

function startLevel(scene) {
    isDead = false;
    energy = 0;
    lastTapTime = 0;

    // Clear previous obstacles
    if (obstacles) obstacles.clear(true, true);

    obstacles = scene.physics.add.group();

    // Create player: body + hat
    player = scene.add.container(200, 500);
    const body = scene.add.rectangle(0, 10, 30, 50, 0x0000ff); // body
    const hat = scene.add.triangle(0, -15, -15, 0, 15, 0, 0, -15, 0xff0000); // hat
    player.add([body, hat]);
    scene.physics.add.existing(player);
    player.list[0].body = player.body; // link body for collisions
    player.body.setCollideWorldBounds(true);

    // Energy and score text
    energyText = scene.add.text(10, 10, 'Energy: 0', { fontSize: '16px', fill: '#000' });
    scoreText = scene.add.text(10, 30, 'Score: 0', { fontSize: '16px', fill: '#000' });

    // Gravestone (hidden at start)
    gravestone = scene.add.container(player.x, player.y);
    const stone = scene.add.rectangle(0, 0, 50, 60, 0x888888);
    const ripText = scene.add.text(-25, -10, 'YOU LOSE', { fontSize: '14px', fill: '#fff' });
    gravestone.add([stone, ripText]);
    gravestone.setVisible(false);

    // Tap input
    scene.input.on('pointerdown', () => {
        if (!isDead) {
            energy += 1;
            lastTapTime = scene.time.now;
            energyText.setText('Energy: ' + energy);
        }
    });

    // Swipe/move controls
    scene.input.on('pointermove', function(pointer) {
        if (!isDead && pointer.isDown) {
            player.x = Phaser.Math.Clamp(pointer.x, 25, 375);
        }
    });

    // Spawn obstacles
    scene.time.addEvent({
        delay: 1500,
        callback: () => spawnObstacle(scene),
        loop: true
    });

    scene.physics.add.collider(player, obstacles, () => playerDeath(scene), null, scene);
}

function update(time) {
    if (isDead) return;

    // Energy drain when not tapping
    if (time - lastTapTime > 1000) {
        energy = Math.max(0, energy - 1);
        energyText.setText('Energy: ' + energy);
        lastTapTime = time;
    }

    // Remove off-screen obstacles & update score
    obstacles.children.iterate(function(obstacle) {
        if (obstacle.y > 600) {
            obstacle.destroy();
            score += 1;
            scoreText.setText('Score: ' + score);
            if (score % 5 === 0) obstacleSpeed += 20; // increase difficulty
        }
    });
}

function spawnObstacle(scene) {
    const x = Phaser.Math.Between(25, 375);
    const y = 0;

    const type = Phaser.Math.Between(0, 1); // 0 = stone, 1 = skateboard
    let obstacle;

    if (type === 0) {
        // Stone: gray circle
        const radius = Phaser.Math.Between(15, 25);
        obstacle = scene.add.ellipse(x, y, radius * 2, radius * 2, 0x888888);
    } else {
        // Skateboard: brown rectangle with two small black wheels
        const width = Phaser.Math.Between(50, 70);
        const height = 15;
        obstacle = scene.add.container(x, y);
        const board = scene.add.rectangle(0, 0, width, height, 0x8B4513);
        const wheel1 = scene.add.circle(-width/2 + 5, height/2, 5, 0x000000);
        const wheel2 = scene.add.circle(width/2 - 5, height/2, 5, 0x000000);
        obstacle.add([board, wheel1, wheel2]);
    }

    // Add physics
    scene.physics.add.existing(obstacle);
    obstacle.body.setVelocityY(obstacleSpeed);

    obstacles.add(obstacle);
}

function playerDeath(scene) {
    isDead = true;
    player.setVisible(false);
    gravestone.setPosition(player.x, player.y);
    gravestone.setVisible(true);

    // Wait 1 second then start a new level
    scene.time.delayedCall(1000, () => {
        gravestone.setVisible(false);
        if (player) player.destroy();
        startLevel(scene);
    });
        }
