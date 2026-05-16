const MENU_COLS = 10;
const MENU_ROWS = 10;
const STAGE_COUNT = 100;

function getMenuLayout(canvas) {
  const cellSize = Math.min(canvas.width / MENU_COLS, canvas.height / MENU_ROWS);
  const gridW = cellSize * MENU_COLS;
  const gridH = cellSize * MENU_ROWS;
  return {
    cellSize,
    originX: (canvas.width - gridW) / 2,
    originY: (canvas.height - gridH) / 2,
  };
}

function isStageUnlocked(progress, stageNum) {
  if (stageNum === 1) return true;
  return (
    progress.cleared.includes(stageNum - 1) ||
    stageNum <= progress.currentStage
  );
}

function getStageAtPoint(canvas, x, y) {
  const { cellSize, originX, originY } = getMenuLayout(canvas);
  const col = Math.floor((x - originX) / cellSize);
  const row = Math.floor((y - originY) / cellSize);

  if (col < 0 || col >= MENU_COLS || row < 0 || row >= MENU_ROWS) {
    return null;
  }

  const stageNum = row * MENU_COLS + col + 1;
  return stageNum <= STAGE_COUNT ? stageNum : null;
}

function getCanvasPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function drawStageSelect(ctx, progress, difficultyFilter = 'all') {
  const canvas = ctx.canvas;
  const { cellSize, originX, originY } = getMenuLayout(canvas);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawProgressLabel(ctx, progress, 22);

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;

  for (let stageNum = 1; stageNum <= STAGE_COUNT; stageNum++) {
    const index = stageNum - 1;
    const col = index % MENU_COLS;
    const row = Math.floor(index / MENU_COLS);
    const x = originX + col * cellSize;
    const y = originY + row * cellSize;

    ctx.strokeRect(x, y, cellSize, cellSize);

    const cx = x + cellSize / 2;
    const cy = y + cellSize / 2;

    if (!isStageInDifficultyFilter(stageNum, difficultyFilter)) {
      ctx.font = `${Math.floor(cellSize * 0.35)}px system-ui, sans-serif`;
      ctx.fillStyle = '#444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('·', cx, cy);
    } else if (progress.cleared.includes(stageNum)) {
      const best = progress.bestMoves[String(stageNum)];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      if (best !== undefined) {
        ctx.font = `bold ${Math.floor(cellSize * 0.24)}px system-ui, sans-serif`;
        ctx.fillText(`✓ ${best}手`, cx, cy);
      } else {
        ctx.font = `${Math.floor(cellSize * 0.4)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.fillText('✓', cx, cy);
      }
    } else if (isStageUnlocked(progress, stageNum)) {
      ctx.font = `bold ${Math.floor(cellSize * 0.35)}px system-ui, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(stageNum), cx, cy);
    } else {
      ctx.font = `${Math.floor(cellSize * 0.4)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', cx, cy);
    }
  }
}

function registerStageSelectInput(canvas, getState, onSelect) {
  const handlePointer = async (clientX, clientY) => {
    const state = getState();
    if (!state.showStageSelect) return;

    const point = getCanvasPoint(canvas, clientX, clientY);
    const stageNum = getStageAtPoint(canvas, point.x, point.y);
    if (!stageNum || !isStageUnlocked(state.progress, stageNum)) return;
    if (!isStageInDifficultyFilter(stageNum, state.settings.difficultyFilter)) return;
    if (!(await stageExists(stageNum))) return;

    await onSelect(stageNum);
  };

  canvas.addEventListener('click', (event) => {
    handlePointer(event.clientX, event.clientY);
  });

  canvas.addEventListener(
    'touchstart',
    (event) => {
      event.preventDefault();
      const touch = event.changedTouches[0];
      handlePointer(touch.clientX, touch.clientY);
    },
    { passive: false }
  );
}
