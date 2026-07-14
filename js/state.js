var SnakeGame = SnakeGame || {};

SnakeGame.gameState = 'idle';
SnakeGame.snake = [];
SnakeGame.food = null;
SnakeGame.dir = { x: 1, y: 0 };
SnakeGame.nextDir = { x: 1, y: 0 };
SnakeGame.score = 0;
SnakeGame.bestScore = 0;
SnakeGame.bgColor = '#0a0a0f';
SnakeGame.moveInterval = 130;
SnakeGame.lastMoveTime = 0;
SnakeGame.particles = [];
SnakeGame.pendingSpeed = null;
SnakeGame.prevStateBeforeConfirm = 'idle';

SnakeGame.setGameState = function(newState) {
    var prev = SnakeGame.gameState;
    SnakeGame.gameState = newState;
    if (newState === 'playing' && (prev === 'paused' || prev === 'idle' || prev === 'notify')) {
        SnakeGame.lastMoveTime = performance.now();
    }
    SnakeGame.updateUI();
};

SnakeGame.setDirection = function(dx, dy) {
    if (SnakeGame.gameState !== 'playing') return;
    if (dx === 0 && dy === 0) return;
    if (dx === -SnakeGame.dir.x && dy === -SnakeGame.dir.y && SnakeGame.snake.length > 1) return;
    SnakeGame.nextDir = { x: dx, y: dy };
};

SnakeGame.init = function() {
    var startX = Math.floor(SnakeGame.COLS / 4);
    var startY = Math.floor(SnakeGame.ROWS / 2);
    SnakeGame.snake = [
        { x: startX + 2, y: startY },
        { x: startX + 1, y: startY },
        { x: startX, y: startY }
    ];
    SnakeGame.dir = { x: 1, y: 0 };
    SnakeGame.nextDir = { x: 1, y: 0 };
    SnakeGame.score = 0;
    SnakeGame.particles = [];
    SnakeGame.currentScoreSpan.textContent = '0';
    SnakeGame.spawnFood();
    SnakeGame.lastMoveTime = performance.now();
};

SnakeGame.spawnFood = function() {
    var occupied = new Set(SnakeGame.snake.map(function(s) { return s.x + ',' + s.y; }));
    var free = [];
    for (var x = 0; x < SnakeGame.COLS; x++) {
        for (var y = 0; y < SnakeGame.ROWS; y++) {
            if (!occupied.has(x + ',' + y)) free.push({ x: x, y: y });
        }
    }
    if (free.length === 0) {
        SnakeGame.setGameState('gameover');
        SnakeGame.saveBest();
        return;
    }
    SnakeGame.food = free[Math.floor(Math.random() * free.length)];
};

SnakeGame.addParticles = function(x, y) {
    var cx = x * SnakeGame.GRID + SnakeGame.GRID / 2;
    var cy = y * SnakeGame.GRID + SnakeGame.GRID / 2;
    for (var i = 0; i < 10; i++) {
        var angle = (Math.PI * 2 / 10) * i + Math.random() * 0.4;
        var spd = 1.8 + Math.random() * 3.2;
        SnakeGame.particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 1,
            decay: 0.018 + Math.random() * 0.035,
            size: 2.2 + Math.random() * 2.8
        });
    }
};

SnakeGame.updateParticles = function() {
    for (var i = SnakeGame.particles.length - 1; i >= 0; i--) {
        var p = SnakeGame.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= p.decay;
        if (p.life <= 0) SnakeGame.particles.splice(i, 1);
    }
};

SnakeGame.update = function() {
    if (SnakeGame.gameState !== 'playing') return;
    SnakeGame.dir = { x: SnakeGame.nextDir.x, y: SnakeGame.nextDir.y };
    var head = SnakeGame.snake[0];
    var newHead = { x: head.x + SnakeGame.dir.x, y: head.y + SnakeGame.dir.y };

    if (newHead.x < 0 || newHead.x >= SnakeGame.COLS || newHead.y < 0 || newHead.y >= SnakeGame.ROWS) {
        SnakeGame.endGame();
        return;
    }
    for (var i = 0; i < SnakeGame.snake.length; i++) {
        if (SnakeGame.snake[i].x === newHead.x && SnakeGame.snake[i].y === newHead.y) {
            SnakeGame.endGame();
            return;
        }
    }

    SnakeGame.snake.unshift(newHead);
    if (SnakeGame.food && newHead.x === SnakeGame.food.x && newHead.y === SnakeGame.food.y) {
        SnakeGame.score += 10;
        SnakeGame.currentScoreSpan.textContent = SnakeGame.score;
        SnakeGame.addParticles(SnakeGame.food.x, SnakeGame.food.y);
        SnakeGame.spawnFood();
    } else {
        SnakeGame.snake.pop();
    }

    if (SnakeGame.snake.length >= SnakeGame.COLS * SnakeGame.ROWS) {
        SnakeGame.saveBest();
        SnakeGame.setGameState('gameover');
    }
};

SnakeGame.endGame = function() {
    SnakeGame.setGameState('gameover');
    SnakeGame.saveBest();
    if (SnakeGame.snake.length) {
        SnakeGame.addParticles(SnakeGame.snake[0].x, SnakeGame.snake[0].y);
    }
};

SnakeGame.saveBest = function() {
    if (SnakeGame.score > 0 && SnakeGame.score > SnakeGame.bestScore) {
        SnakeGame.bestScore = SnakeGame.score;
        SnakeGame.bestScoreSpan.textContent = SnakeGame.bestScore;
        try {
            localStorage.setItem('snake_best_' + SnakeGame.moveInterval, String(SnakeGame.bestScore));
        } catch (e) {}
    }
};

SnakeGame.loadBest = function() {
    SnakeGame.bestScore = 0;
    try {
        var v = localStorage.getItem('snake_best_' + SnakeGame.moveInterval);
        if (v && !isNaN(parseInt(v, 10))) {
            SnakeGame.bestScore = parseInt(v, 10);
        }
    } catch (e) {}
    SnakeGame.bestScoreSpan.textContent = SnakeGame.bestScore;
};

SnakeGame.setSpeedMode = function(interval) {
    SnakeGame.moveInterval = interval;
    SnakeGame.pendingSpeed = null;
    SnakeGame.modeButtons.forEach(function(btn) {
        var speed = parseInt(btn.dataset.speed, 10);
        if (speed === interval) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    SnakeGame.loadBest();
};

SnakeGame.confirmSpeedChange = function() {
    if (SnakeGame.pendingSpeed !== null) {
        SnakeGame.setSpeedMode(SnakeGame.pendingSpeed);
    }
    if (SnakeGame.prevStateBeforeConfirm === 'gameover') {
        SnakeGame.resetToIdle();
    } else {
        SnakeGame.setGameState(SnakeGame.prevStateBeforeConfirm);
    }
    SnakeGame.pendingSpeed = null;
};

SnakeGame.cancelSpeedChange = function() {
    SnakeGame.pendingSpeed = null;
    SnakeGame.setGameState(SnakeGame.prevStateBeforeConfirm);
};

SnakeGame.togglePause = function() {
    if (SnakeGame.gameState === 'playing') {
        SnakeGame.setGameState('paused');
    } else if (SnakeGame.gameState === 'paused') {
        SnakeGame.setGameState('playing');
    } else if (SnakeGame.gameState === 'confirming') {
        SnakeGame.cancelSpeedChange();
    } else if (SnakeGame.gameState === 'notify') {
        SnakeGame.setGameState('playing');
    }
};

SnakeGame.startFromIdle = function() {
    SnakeGame.init();
    SnakeGame.setGameState('playing');
};

SnakeGame.resetToIdle = function() {
    SnakeGame.snake = [];
    SnakeGame.food = null;
    SnakeGame.score = 0;
    SnakeGame.particles = [];
    SnakeGame.currentScoreSpan.textContent = '0';
    SnakeGame.setGameState('idle');
};

SnakeGame.updateUI = function() {
    switch (SnakeGame.gameState) {
        case 'idle':
            SnakeGame.restartBtn.textContent = '开始游戏';
            SnakeGame.pauseBtn.style.display = 'none';
            SnakeGame.pauseBtn.classList.remove('resume');
            break;
        case 'playing':
            SnakeGame.restartBtn.textContent = '重新开始';
            SnakeGame.pauseBtn.style.display = 'inline-block';
            SnakeGame.pauseBtn.textContent = '暂停';
            SnakeGame.pauseBtn.classList.remove('resume');
            break;
        case 'paused':
            SnakeGame.restartBtn.textContent = '重新开始';
            SnakeGame.pauseBtn.style.display = 'inline-block';
            SnakeGame.pauseBtn.textContent = '继续';
            SnakeGame.pauseBtn.classList.add('resume');
            break;
        case 'confirming':
        case 'notify':
        case 'gameover':
            SnakeGame.restartBtn.textContent = '重新开始';
            SnakeGame.pauseBtn.style.display = 'none';
            SnakeGame.pauseBtn.classList.remove('resume');
            break;
    }
};
