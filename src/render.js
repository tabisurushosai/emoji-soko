const CELL_SIZE = 48;

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

function drawClearEffect(ctx, clearEffect) {
  const canvas = ctx.canvas;
  const progress = getClearEffectProgress(clearEffect);
  const fade = progress * progress;

  if (!clearEffect.particles) {
    clearEffect.particles = createClearParticles(canvas, 28);
  }

  ctx.fillStyle = `rgba(0, 0, 0, ${0.55 * fade})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const elapsed = performance.now() - clearEffect.startTime;
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

  ctx.globalAlpha = fade;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STAGE CLEAR', canvas.width / 2, canvas.height / 2);

  if (clearEffect.isNewBest) {
    ctx.globalAlpha = fade;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('NEW BEST!', canvas.width / 2, canvas.height / 2 + 44);
  }

  ctx.globalAlpha = fade * 0.85;
  ctx.fillStyle = '#fff';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('🎉', canvas.width / 2, canvas.height / 2 + (clearEffect.isNewBest ? 78 : 52));

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

function renderStage(ctx, stage) {
  const rows = stage.length;
  const cols = stage[0]?.length ?? 0;
  const { originX, originY } = getStageOrigin(ctx.canvas, cols, rows);

  drawGrid(ctx, cols, rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const emoji = EMOJI_MAP[stage[y][x].type];
      if (emoji) {
        drawEmoji(
          ctx,
          emoji,
          originX + x * CELL_SIZE,
          originY + y * CELL_SIZE
        );
      }
    }
  }
}
