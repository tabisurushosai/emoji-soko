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
