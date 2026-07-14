var SnakeGame = SnakeGame || {};

SnakeGame.drawRoundedRect = function(x, y, w, h, radius) {
    var ctx = SnakeGame.ctx;
    var r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
};

SnakeGame.draw = function() {
    var ctx = SnakeGame.ctx;
    var SIZE = SnakeGame.SIZE;
    var GRID = SnakeGame.GRID;
    var COLS = SnakeGame.COLS;
    var ROWS = SnakeGame.ROWS;

    ctx.fillStyle = SnakeGame.bgColor;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 0.6;
    for (var i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID + 0.5, 0);
        ctx.lineTo(i * GRID + 0.5, SIZE);
        ctx.stroke();
    }
    for (var j = 0; j <= ROWS; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * GRID + 0.5);
        ctx.lineTo(SIZE, j * GRID + 0.5);
        ctx.stroke();
    }

    if (SnakeGame.gameState === 'playing' || SnakeGame.gameState === 'paused' || SnakeGame.gameState === 'gameover') {
        if (SnakeGame.food) {
            var fx = SnakeGame.food.x * GRID;
            var fy = SnakeGame.food.y * GRID;
            var pad = GRID * 0.12;
            var r = (GRID - pad * 2) / 2;

            ctx.save();
            ctx.shadowColor = '#ff5c5c';
            ctx.shadowBlur = 14;
            ctx.fillStyle = '#ff4d4d';
            ctx.beginPath();
            ctx.arc(fx + GRID / 2, fy + GRID / 2, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 200, 200, 0.55)';
            ctx.beginPath();
            ctx.arc(fx + GRID / 2 - r * 0.28, fy + GRID / 2 - r * 0.28, r * 0.32, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        SnakeGame.snake.forEach(function(seg, idx) {
            var sx = seg.x * GRID;
            var sy = seg.y * GRID;
            var isHead = idx === 0;
            var inset = isHead ? 1.2 : 2.2;
            var radius = isHead ? GRID * 0.28 : GRID * 0.22;

            ctx.save();
            if (isHead) {
                ctx.shadowColor = '#34d399';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#34d399';
            } else {
                var t = Math.min(1, idx / 12);
                var g = Math.round(180 - t * 60);
                ctx.fillStyle = 'rgb(16, ' + g + ', 105)';
            }
            SnakeGame.drawRoundedRect(sx + inset, sy + inset, GRID - inset * 2, GRID - inset * 2, radius);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isHead) {
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                var eyeOff = GRID * 0.18;
                var eyeR = GRID * 0.09;
                var dx = SnakeGame.dir.x;
                var dy = SnakeGame.dir.y;
                var ex1 = sx + GRID / 2 + dy * eyeOff - dx * eyeOff * 0.15;
                var ey1 = sy + GRID / 2 - dx * eyeOff - dy * eyeOff * 0.15;
                var ex2 = sx + GRID / 2 - dy * eyeOff - dx * eyeOff * 0.15;
                var ey2 = sy + GRID / 2 + dx * eyeOff - dy * eyeOff * 0.15;
                ctx.beginPath();
                ctx.arc(ex1, ey1, eyeR, 0, Math.PI * 2);
                ctx.arc(ex2, ey2, eyeR, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#0a0a0f';
                ctx.beginPath();
                ctx.arc(ex1 + dx * 1.2, ey1 + dy * 1.2, eyeR * 0.55, 0, Math.PI * 2);
                ctx.arc(ex2 + dx * 1.2, ey2 + dy * 1.2, eyeR * 0.55, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        SnakeGame.particles.forEach(function(p) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = '#fcd34d';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    if (SnakeGame.gameState === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        SnakeGame.drawRoundedRect(SnakeGame.startBtnX + 3, SnakeGame.startBtnY + 4, SnakeGame.startBtnW, SnakeGame.startBtnH, SnakeGame.startBtnRadius);
        ctx.fill();

        var btnGrad = ctx.createLinearGradient(SnakeGame.startBtnX, SnakeGame.startBtnY, SnakeGame.startBtnX, SnakeGame.startBtnY + SnakeGame.startBtnH);
        btnGrad.addColorStop(0, '#34d399');
        btnGrad.addColorStop(1, '#059669');
        ctx.fillStyle = btnGrad;
        ctx.shadowColor = 'rgba(52, 211, 153, 0.65)';
        ctx.shadowBlur = 22;
        SnakeGame.drawRoundedRect(SnakeGame.startBtnX, SnakeGame.startBtnY, SnakeGame.startBtnW, SnakeGame.startBtnH, SnakeGame.startBtnRadius);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;
        SnakeGame.drawRoundedRect(SnakeGame.startBtnX + 0.5, SnakeGame.startBtnY + 0.5, SnakeGame.startBtnW - 1, SnakeGame.startBtnH - 1, SnakeGame.startBtnRadius);
        ctx.stroke();

        ctx.fillStyle = '#042f1a';
        ctx.font = 'bold ' + Math.round(SIZE * 0.048) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('开始游戏', SIZE / 2, SnakeGame.startBtnY + SnakeGame.startBtnH / 2 + 1);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    if (SnakeGame.gameState === 'paused') {
        ctx.fillStyle = 'rgba(0,0,0,0.58)';
        ctx.fillRect(0, 0, SIZE, SIZE);

        var bar1X = SnakeGame.pauseIconCX - SnakeGame.pauseBarGap / 2 - SnakeGame.pauseBarW;
        var bar2X = SnakeGame.pauseIconCX + SnakeGame.pauseBarGap / 2;
        var barY = SnakeGame.pauseIconCY - SnakeGame.pauseBarH / 2;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255,255,255,0.55)';
        ctx.shadowBlur = 16;
        SnakeGame.drawRoundedRect(bar1X, barY, SnakeGame.pauseBarW, SnakeGame.pauseBarH, SnakeGame.pauseBarRadius);
        ctx.fill();
        SnakeGame.drawRoundedRect(bar2X, barY, SnakeGame.pauseBarW, SnakeGame.pauseBarH, SnakeGame.pauseBarRadius);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.round(SIZE * 0.045) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('已暂停', SIZE / 2, SnakeGame.pauseIconCY + SnakeGame.pauseBarH / 2 + 30);
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.font = Math.round(SIZE * 0.032) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText('点击屏幕或按空格继续', SIZE / 2, SnakeGame.pauseIconCY + SnakeGame.pauseBarH / 2 + 56);
        ctx.textAlign = 'start';
    }

    if (SnakeGame.gameState === 'confirming') {
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, SIZE, SIZE);

        ctx.fillStyle = '#14141c';
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 28;
        SnakeGame.drawRoundedRect(SnakeGame.confirmDialogX, SnakeGame.confirmDialogY, SnakeGame.confirmDialogW, SnakeGame.confirmDialogH, SnakeGame.confirmDialogR);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.round(SIZE * 0.042) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('确认切换速度？', SIZE / 2, SnakeGame.confirmDialogY + SnakeGame.confirmDialogH * 0.26);

        var speedNames = { 180: '慢速', 130: '正常', 90: '快速', 60: '极速' };
        var speedName = speedNames[SnakeGame.pendingSpeed] || '正常';
        var speedColor = '#34d399';
        if (SnakeGame.pendingSpeed === 180) speedColor = '#6ee7b7';
        else if (SnakeGame.pendingSpeed === 130) speedColor = '#34d399';
        else if (SnakeGame.pendingSpeed === 90) speedColor = '#fbbf24';
        else speedColor = '#f87171';

        ctx.fillStyle = speedColor;
        ctx.font = 'bold ' + Math.round(SIZE * 0.052) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText(speedName, SIZE / 2, SnakeGame.confirmDialogY + SnakeGame.confirmDialogH * 0.48);

        var gradConfirm = ctx.createLinearGradient(SnakeGame.confirmBtnX, SnakeGame.confirmBtnY, SnakeGame.confirmBtnX, SnakeGame.confirmBtnY + SnakeGame.confirmBtnH);
        gradConfirm.addColorStop(0, '#34d399');
        gradConfirm.addColorStop(1, '#059669');
        ctx.fillStyle = gradConfirm;
        ctx.shadowColor = 'rgba(52,211,153,0.4)';
        ctx.shadowBlur = 10;
        SnakeGame.drawRoundedRect(SnakeGame.confirmBtnX, SnakeGame.confirmBtnY, SnakeGame.confirmBtnW, SnakeGame.confirmBtnH, SnakeGame.confirmBtnR);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#042f1a';
        ctx.font = 'bold ' + Math.round(SIZE * 0.034) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText('确认', SnakeGame.confirmBtnX + SnakeGame.confirmBtnW / 2, SnakeGame.confirmBtnY + SnakeGame.confirmBtnH / 2);

        var gradCancel = ctx.createLinearGradient(SnakeGame.cancelBtnX, SnakeGame.confirmBtnY, SnakeGame.cancelBtnX, SnakeGame.confirmBtnY + SnakeGame.confirmBtnH);
        gradCancel.addColorStop(0, '#3f3f4a');
        gradCancel.addColorStop(1, '#2a2a33');
        ctx.fillStyle = gradCancel;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 8;
        SnakeGame.drawRoundedRect(SnakeGame.cancelBtnX, SnakeGame.confirmBtnY, SnakeGame.confirmBtnW, SnakeGame.confirmBtnH, SnakeGame.confirmBtnR);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#c0c0cc';
        ctx.fillText('取消', SnakeGame.cancelBtnX + SnakeGame.confirmBtnW / 2, SnakeGame.confirmBtnY + SnakeGame.confirmBtnH / 2);

        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    if (SnakeGame.gameState === 'notify') {
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, SIZE, SIZE);

        ctx.fillStyle = '#14141c';
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 28;
        SnakeGame.drawRoundedRect(SnakeGame.notifyDialogX, SnakeGame.notifyDialogY, SnakeGame.notifyDialogW, SnakeGame.notifyDialogH, SnakeGame.notifyDialogR);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold ' + Math.round(SIZE * 0.042) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('提示', SIZE / 2, SnakeGame.notifyDialogY + SnakeGame.notifyDialogH * 0.22);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.round(SIZE * 0.036) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText('游戏中无法切换速度', SIZE / 2, SnakeGame.notifyDialogY + SnakeGame.notifyDialogH * 0.42);

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = Math.round(SIZE * 0.03) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText('请结束后再试', SIZE / 2, SnakeGame.notifyDialogY + SnakeGame.notifyDialogH * 0.56);

        var gradBtn = ctx.createLinearGradient(SnakeGame.notifyBtnX, SnakeGame.notifyBtnY, SnakeGame.notifyBtnX, SnakeGame.notifyBtnY + SnakeGame.notifyBtnH);
        gradBtn.addColorStop(0, '#34d399');
        gradBtn.addColorStop(1, '#059669');
        ctx.fillStyle = gradBtn;
        ctx.shadowColor = 'rgba(52,211,153,0.4)';
        ctx.shadowBlur = 10;
        SnakeGame.drawRoundedRect(SnakeGame.notifyBtnX, SnakeGame.notifyBtnY, SnakeGame.notifyBtnW, SnakeGame.notifyBtnH, SnakeGame.notifyBtnR);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#042f1a';
        ctx.font = 'bold ' + Math.round(SIZE * 0.034) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText('继续', SnakeGame.notifyBtnX + SnakeGame.notifyBtnW / 2, SnakeGame.notifyBtnY + SnakeGame.notifyBtnH / 2);

        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }

    if (SnakeGame.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, SIZE, SIZE);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.round(SIZE * 0.068) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 12;
        ctx.fillText('游戏结束', SIZE / 2, SIZE / 2 - SIZE * 0.04);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold ' + Math.round(SIZE * 0.042) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText('得分  ' + SnakeGame.score, SIZE / 2, SIZE / 2 + SIZE * 0.055);

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = Math.round(SIZE * 0.03) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
        ctx.fillText('空格或点击重新开始', SIZE / 2, SIZE / 2 + SIZE * 0.12);
        ctx.textAlign = 'start';
    }
};
