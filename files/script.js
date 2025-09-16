const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 12;

const player = {
    x: 10,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    score: 0
};

const ai = {
    x: WIDTH - 10 - PADDLE_WIDTH,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    score: 0,
    speed: 5
};

const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: 6 * (Math.random() > 0.5 ? 1 : -1),
    vy: 4 * (Math.random() > 0.5 ? 1 : -1),
    radius: BALL_RADIUS
};

const playerScoreSpan = document.getElementById('playerScore');
const aiScoreSpan = document.getElementById('aiScore');

function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.vx = 6 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = 4 * (Math.random() > 0.5 ? 1 : -1);
}

canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 5;
    for (let i = 0; i < HEIGHT; i += 30) {
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2, i);
        ctx.lineTo(WIDTH / 2, i + 20);
        ctx.stroke();
    }
}

function render() {
    // Clear canvas
    drawRect(0, 0, WIDTH, HEIGHT, '#111');

    // Draw net
    drawNet();

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#0f0');
    drawRect(ai.x, ai.y, ai.width, ai.height, '#f00');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#fff');
}

function update() {
    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top/bottom
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > HEIGHT) {
        ball.vy *= -1;
        // Clamp ball inside canvas
        ball.y = Math.max(ball.radius, Math.min(HEIGHT - ball.radius, ball.y));
    }

    // AI paddle follows ball (simple AI)
    let aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 20) {
        ai.y -= ai.speed;
    } else if (ball.y > aiCenter + 20) {
        ai.y += ai.speed;
    }
    // Clamp AI paddle inside canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;

    // Paddle collision check (player)
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.x = player.x + player.width + ball.radius;
        ball.vx *= -1.1; // Bounce & speed up
        // Add some spin based on where it hits the paddle
        let deltaY = ball.y - (player.y + player.height / 2);
        ball.vy += deltaY * 0.15;
    }

    // Paddle collision check (AI)
    if (
        ball.x + ball.radius > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height
    ) {
        ball.x = ai.x - ball.radius;
        ball.vx *= -1.1; // Bounce & speed up
        let deltaY = ball.y - (ai.y + ai.height / 2);
        ball.vy += deltaY * 0.15;
    }

    // Ball out of bounds: left or right
    if (ball.x - ball.radius < 0) {
        // AI scores
        ai.score++;
        aiScoreSpan.textContent = ai.score;
        resetBall();
    } else if (ball.x + ball.radius > WIDTH) {
        // Player scores
        player.score++;
        playerScoreSpan.textContent = player.score;
        resetBall();
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();