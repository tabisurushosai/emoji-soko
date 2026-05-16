const CELL_SIZE = 48;
const PLAYER_ANIM_DURATION = 150;
const BOX_SHAKE_DURATION = 200;
const BOX_SHAKE_AMOUNT = 3;
const GOAL_STAR_DURATION = 800;
const CLEAR_FLASH_DURATION = 300;
const CLEAR_TEXT_DROP_DURATION = 500;

const SHAKE_DIR_DELTA = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function isPlayerCell(type) {
  return type === 'PLAYER' || type === 'PLAYER_ON_GOAL';
}

function isBoxCell(type) {
  return type === 'BOX' || type === 'BOX_ON_GOAL';
}

function createBoxShake(boxX, boxY, dir) {
  const delta = SHAKE_DIR_DELTA[dir] || { x: 0, y: 0 };
  return {
    boxX,
    boxY,
    dx: delta.x,
    dy: delta.y,
    startTime: performance.now(),
    duration: BOX_SHAKE_DURATION,
  };
}

function isBoxShaking(boxShake) {
  if (!boxShake) return false;
  return performance.now() - boxShake.startTime < boxShake.duration;
}

function getBoxShakeOffset(boxShake) {
  const elapsed = performance.now() - boxShake.startTime;
  const t = Math.min(elapsed / boxShake.duration, 1);
  const damp = 1 - t;
  const wave = Math.sin(t * Math.PI * 4);
  const amount = BOX_SHAKE_AMOUNT * damp * wave;
  return {
    x: boxShake.dx * amount,
    y: boxShake.dy * amount,
  };
}

function createPlayerAnim(fromX, fromY, toX, toY) {
  return {
    fromX,
    fromY,
    toX,
    toY,
    startTime: performance.now(),
    duration: PLAYER_ANIM_DURATION,
  };
}

function isPlayerAnimating(playerAnim) {
  if (!playerAnim) return false;
  return performance.now() - playerAnim.startTime < playerAnim.duration;
}

function getPlayerAnimGridPos(playerAnim) {
  const elapsed = performance.now() - playerAnim.startTime;
  const t = easeOutQuad(Math.min(elapsed / playerAnim.duration, 1));
  return {
    x: playerAnim.fromX + (playerAnim.toX - playerAnim.fromX) * t,
    y: playerAnim.fromY + (playerAnim.toY - playerAnim.fromY) * t,
  };
}

function getStageOrigin(canvas, cols, rows) {
  const stageW = cols * CELL_SIZE;
  const stageH = rows * CELL_SIZE;
  return {
    originX: (canvas.width - stageW) / 2,
    originY: (canvas.height - stageH) / 2,
  };
}

function drawGrid(ctx, cols, rows) {
  const { originX, originY } = getStageOrigin(ctx.canvas, cols, rows);

  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = 0; x <= cols; x++) {
    const px = originX + x * CELL_SIZE;
    ctx.moveTo(px, originY);
    ctx.lineTo(px, originY + rows * CELL_SIZE);
  }

  for (let y = 0; y <= rows; y++) {
    const py = originY + y * CELL_SIZE;
    ctx.moveTo(originX, py);
    ctx.lineTo(originX + cols * CELL_SIZE, py);
  }

  ctx.stroke();
}

function drawEmoji(ctx, emoji, x, y, size = 40) {
  ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
}

function createClearParticles(canvas, count) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  return Array.from({ length: count }, () => ({
    x: cx + (Math.random() - 0.5) * 320,
    y: cy + (Math.random() - 0.5) * 200,
    vx: (Math.random() - 0.5) * 1.2,
    vy: -0.5 - Math.random() * 1.5,
    size: 16 + Math.random() * 20,
    phase: Math.random() * Math.PI * 2,
  }));
}

function getClearTextY(canvas, elapsed) {
  const targetY = canvas.height / 2;
  const startY = -48;
  const dropT = Math.min(elapsed / CLEAR_TEXT_DROP_DURATION, 1);
  const eased = easeOutQuad(dropT);
  return startY + (targetY - startY) * eased;
}

function drawClearEffect(ctx, clearEffect) {
  const canvas = ctx.canvas;
  const progress = getClearEffectProgress(clearEffect);
  const fade = progress * progress;
  const elapsed = performance.now() - clearEffect.startTime;

  if (!clearEffect.particles) {
    clearEffect.particles = createClearParticles(canvas, 28);
  }

  ctx.fillStyle = `rgba(0, 0, 0, ${0.55 * fade})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const flashT = Math.min(elapsed / CLEAR_FLASH_DURATION, 1);
  const flashAlpha = (1 - flashT) * 0.32;
  if (flashAlpha > 0) {
    ctx.fillStyle = `rgba(255, 215, 0, ${flashAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (const p of clearEffect.particles) {
    const x = p.x + p.vx * elapsed * 0.06;
    const y = p.y + p.vy * elapsed * 0.06 + Math.sin(elapsed * 0.004 + p.phase) * 8;
    const alpha = fade * (0.5 + 0.5 * Math.sin(elapsed * 0.008 + p.phase));

    ctx.globalAlpha = Math.max(0, alpha);
    ctx.font = `${p.size}px "Apple Color Emoji", "Segoe UI Emoji"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', x, y);
  }

  const textY = getClearTextY(canvas, elapsed);
  const centerX = canvas.width / 2;

  ctx.globalAlpha = fade;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STAGE CLEAR', centerX, textY);

  if (clearEffect.isNewBest) {
    ctx.globalAlpha = fade;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('NEW BEST!', centerX, textY + 44);
  }

  ctx.globalAlpha = fade * 0.85;
  ctx.fillStyle = '#fff';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('🎉', centerX, textY + (clearEffect.isNewBest ? 78 : 52));

  ctx.globalAlpha = 1;
}

function createGoalStarEffect(gridX, gridY, cols, rows, canvas) {
  const { originX, originY } = getStageOrigin(canvas, cols, rows);
  const cx = originX + gridX * CELL_SIZE + CELL_SIZE / 2;
  const cy = originY + gridY * CELL_SIZE + CELL_SIZE / 2;

  const particles = Array.from({ length: 3 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    const speed = 0.7 + Math.random() * 0.6;
    return {
      x: cx + (Math.random() - 0.5) * 10,
      y: cy + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.4,
      size: 14 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
    };
  });

  return {
    startTime: performance.now(),
    duration: GOAL_STAR_DURATION,
    particles,
  };
}

function isGoalStarEffectActive(effect) {
  return performance.now() - effect.startTime < effect.duration;
}

function drawGoalStarEffects(ctx, effects) {
  const elapsedBase = performance.now();

  for (const effect of effects) {
    const elapsed = elapsedBase - effect.startTime;
    const alpha = 1 - Math.min(elapsed / effect.duration, 1);

    for (const p of effect.particles) {
      const x =
        p.x +
        p.vx * elapsed * 0.05 +
        Math.sin(elapsed * 0.005 + p.phase) * 5;
      const y =
        p.y +
        p.vy * elapsed * 0.05 +
        Math.sin(elapsed * 0.004 + p.phase) * 3;

      ctx.globalAlpha = alpha;
      ctx.font = `${p.size}px "Apple Color Emoji", "Segoe UI Emoji"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', x, y);
    }
  }

  ctx.globalAlpha = 1;
}

function drawMoveHud(ctx, stageNum, moves, bestMoves) {
  const canvas = ctx.canvas;
  const key = String(stageNum);
  const best = bestMoves[key];

  ctx.fillStyle = '#fff';
  ctx.font = '18px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  let label = `STAGE ${String(stageNum).padStart(2, '0')}  手数: ${moves}`;
  if (best !== undefined) {
    label += `  BEST: ${best}`;
  }
  ctx.fillText(label, canvas.width - 16, 12);
}

function renderStage(ctx, stage, player, playerAnim, boxShake) {
  const rows = stage.length;
  const cols = stage[0]?.length ?? 0;
  const { originX, originY } = getStageOrigin(ctx.canvas, cols, rows);

  drawGrid(ctx, cols, rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = stage[y][x];
      if (
        player &&
        x === player.x &&
        y === player.y &&
        isPlayerCell(cell.type)
      ) {
        continue;
      }

      const emoji = EMOJI_MAP[cell.type];
      if (emoji) {
        let drawX = originX + x * CELL_SIZE;
        let drawY = originY + y * CELL_SIZE;

        if (
          boxShake &&
          isBoxShaking(boxShake) &&
          x === boxShake.boxX &&
          y === boxShake.boxY &&
          isBoxCell(cell.type)
        ) {
          const offset = getBoxShakeOffset(boxShake);
          drawX += offset.x;
          drawY += offset.y;
        }

        drawEmoji(ctx, emoji, drawX, drawY);
      }
    }
  }

  if (player) {
    const cell = stage[player.y][player.x];
    const emoji = EMOJI_MAP[cell.type];
    if (emoji) {
      let drawX = originX + player.x * CELL_SIZE;
      let drawY = originY + player.y * CELL_SIZE;

      if (playerAnim && isPlayerAnimating(playerAnim)) {
        const pos = getPlayerAnimGridPos(playerAnim);
        drawX = originX + pos.x * CELL_SIZE;
        drawY = originY + pos.y * CELL_SIZE;
      }

      drawEmoji(ctx, emoji, drawX, drawY);
    }
  }
}
