var SnakeGame = SnakeGame || {};

SnakeGame.setupInput = function() {
    if (!SnakeGame.isTouchDevice) {
        SnakeGame.dpad.style.display = 'none';
        SnakeGame.toggleDpadBtn.style.display = 'inline-block';
        SnakeGame.hintEl.textContent = '方向键 / WASD 控制 · 空格暂停/继续 · 点击色块换背景 · 点击画布开始';
    } else {
        SnakeGame.toggleDpadBtn.style.display = 'none';
        SnakeGame.hintEl.textContent = '滑动或方向键控制 · 点击开始 · 点击色块换背景';
    }

    document.addEventListener('keydown', function(e) {
        var key = e.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' ', 'Escape', 'Enter'].includes(key)) {
            e.preventDefault();
        }
        var lower = key.toLowerCase();

        if (SnakeGame.gameState === 'confirming') {
            if (lower === ' ' || lower === 'enter') SnakeGame.confirmSpeedChange();
            else if (lower === 'escape') SnakeGame.cancelSpeedChange();
            return;
        }

        if (SnakeGame.gameState === 'notify') {
            if (lower === ' ' || lower === 'enter' || lower === 'escape') {
                SnakeGame.setGameState('playing');
            }
            return;
        }

        if (lower === ' ') {
            if (SnakeGame.gameState === 'idle') SnakeGame.startFromIdle();
            else if (SnakeGame.gameState === 'playing' || SnakeGame.gameState === 'paused') SnakeGame.togglePause();
            else if (SnakeGame.gameState === 'gameover') SnakeGame.resetToIdle();
            return;
        }

        if (SnakeGame.gameState !== 'playing') return;

        if (lower === 'arrowup' || lower === 'w') SnakeGame.setDirection(0, -1);
        else if (lower === 'arrowdown' || lower === 's') SnakeGame.setDirection(0, 1);
        else if (lower === 'arrowleft' || lower === 'a') SnakeGame.setDirection(-1, 0);
        else if (lower === 'arrowright' || lower === 'd') SnakeGame.setDirection(1, 0);
    });

    function bindDpad(id, dx, dy) {
        var el = document.getElementById(id);
        el.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            SnakeGame.setDirection(dx, dy);
        });
    }
    bindDpad('dpadUp', 0, -1);
    bindDpad('dpadDown', 0, 1);
    bindDpad('dpadLeft', -1, 0);
    bindDpad('dpadRight', 1, 0);

    SnakeGame.canvas.addEventListener('click', function(e) {
        var coords = SnakeGame.getCanvasCoords(e.clientX, e.clientY);

        if (SnakeGame.gameState === 'notify') {
            SnakeGame.setGameState('playing');
            return;
        }
        if (SnakeGame.gameState === 'confirming') {
            if (SnakeGame.isInConfirmBtn(coords.x, coords.y)) SnakeGame.confirmSpeedChange();
            else if (SnakeGame.isInCancelBtn(coords.x, coords.y)) SnakeGame.cancelSpeedChange();
            return;
        }
        if (SnakeGame.gameState === 'idle') {
            if (SnakeGame.isInStartBtn(coords.x, coords.y)) SnakeGame.startFromIdle();
        } else if (SnakeGame.gameState === 'paused') {
            SnakeGame.togglePause();
        } else if (SnakeGame.gameState === 'gameover') {
            SnakeGame.resetToIdle();
        }
    });

    var pointerStart = null;
    var pointerStartTime = 0;

    SnakeGame.canvas.addEventListener('pointerdown', function(e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        pointerStart = { x: e.clientX, y: e.clientY };
        pointerStartTime = Date.now();
    });

    SnakeGame.canvas.addEventListener('pointerup', function(e) {
        if (!pointerStart) return;
        var dx = e.clientX - pointerStart.x;
        var dy = e.clientY - pointerStart.y;
        var absDx = Math.abs(dx);
        var absDy = Math.abs(dy);
        var elapsed = Date.now() - pointerStartTime;
        var maxDist = Math.max(absDx, absDy);
        pointerStart = null;

        if (maxDist < 8 && elapsed < 350) return;

        if (maxDist >= 8 && SnakeGame.gameState === 'playing') {
            if (absDx > absDy) SnakeGame.setDirection(dx > 0 ? 1 : -1, 0);
            else SnakeGame.setDirection(0, dy > 0 ? 1 : -1);
        }
    });

    SnakeGame.canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
    }, { passive: false });

    SnakeGame.toggleDpadBtn.addEventListener('click', function() {
        if (SnakeGame.dpad.style.display === 'none' || !SnakeGame.dpad.style.display) {
            SnakeGame.dpad.style.display = 'grid';
            SnakeGame.toggleDpadBtn.textContent = '隐藏方向键';
        } else {
            SnakeGame.dpad.style.display = 'none';
            SnakeGame.toggleDpadBtn.textContent = '显示方向键';
        }
    });
};
