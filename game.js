// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const playerScoreDisplay = document.getElementById('playerScore');
const aiScoreDisplay = document.getElementById('aiScore');

// Set canvas size based on screen
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth - 40, 800);
    canvas.height = Math.min(window.innerHeight - 300, 600);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speedX: 5,
    speedY: 5,
    maxSpeed: 8
};

const player = {
    x: 20,
    y: canvas.height / 2 - 50,
    width: 12,
    height: 100,
    speed: 0,
    dy: 0,
    targetY: canvas.height / 2 - 50
};

const ai = {
    x: canvas.width - 32,
    y: canvas.height / 2 - 50,
    width: 12,
    height: 100,
    speed: 5
};

let playerScore = 0;
let aiScore = 0;
let gameRunning = false;
let isTouching = false;

// Touch controls - drag the paddle
document.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;
    isTouching = true;
    handleTouchMove(e);
});

document.addEventListener('touchmove', (e) => {
    if (!gameRunning || !isTouching) return;
    handleTouchMove(e);
    e.preventDefault();
});

document.addEventListener('touchend', () => {
    isTouching = false;
});

function handleTouchMove(e) {
    const touch = e.touches[0];
    const canvasRect = canvas.getBoundingClientRect();
    const touchY = touch.clientY - canvasRect.top;
    
    // 设置挡板目标位置为触摸点的Y坐标（挡板中心对齐触摸点）
    player.targetY = touchY - player.height / 2;
}

// Mouse controls for desktop testing
document.addEventListener('mousedown', (e) => {
    if (!gameRunning) return;
    isTouching = true;
    handleMouseMove(e);
});

document.addEventListener('mousemove', (e) => {
    if (!gameRunning || !isTouching) return;
    handleMouseMove(e);
});

document.addEventListener('mouseup', () => {
    isTouching = false;
});

function handleMouseMove(e) {
    const canvasRect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - canvasRect.top;
    
    // 设置挡板目标位置为鼠标点的Y坐标（挡板中心对齐鼠标点）
    player.targetY = mouseY - player.height / 2;
}

// Start game
startBtn.addEventListener('click', () => {
    gameRunning = true;
    startBtn.textContent = 'Restart Game';
    playerScore = 0;
    aiScore = 0;
    resetBall();
    updateScores();
});

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() - 0.5) * 8;
}

// Update scores display
function updateScores() {
    playerScoreDisplay.textContent = playerScore;
    aiScoreDisplay.textContent = aiScore;
}

// Update player paddle with smooth dragging
function updatePlayer() {
    // 平滑移动挡板到目标位置
    const diff = player.targetY - player.y;
    if (Math.abs(diff) > 2) {
        player.y += diff * 0.2; // 平滑系数
    } else {
        player.y = player.targetY;
    }

    // Keep player paddle in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update AI paddle
function updateAI() {
    const aiCenter = ai.y + ai.height / 2;
    
    if (aiCenter < ball.y - 35) {
        ai.y += ai.speed;
    } else if (aiCenter > ball.y + 35) {
        ai.y -= ai.speed;
    }

    // Keep AI paddle in bounds
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) {
        ai.y = canvas.height - ai.height;
    }
}

// Update ball
function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Bounce off top and bottom
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Check collision with player paddle
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.speedX = -ball.speedX;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.speedY += deltaY * 0.05;
        ball.speedY = Math.max(-ball.maxSpeed, Math.min(ball.maxSpeed, ball.speedY));
    }

    // Check collision with AI paddle
    if (
        ball.x + ball.radius > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height
    ) {
        ball.speedX = -ball.speedX;
        ball.x = ai.x - ball.radius;
        
        // Add spin
        const deltaY = ball.y - (ai.y + ai.height / 2);
        ball.speedY += deltaY * 0.05;
        ball.speedY = Math.max(-ball.maxSpeed, Math.min(ball.maxSpeed, ball.speedY));
    }

    // Score points
    if (ball.x - ball.radius < 0) {
        aiScore++;
        updateScores();
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScores();
        resetBall();
    }
}

// Draw functions
function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawNet() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawNet();
    drawPaddle(player);
    drawPaddle(ai);
    drawBall();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateAI();
        updateBall();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();