function getProgress() {
  const defaults = {
    cleared: [],
    currentStage: 1,
    bestMoves: {},
    totalClearMoves: 0,
  };
  const saved = JSON.parse(localStorage.getItem('emoji-soko-progress') || '{}');
  return { ...defaults, ...saved };
}

function saveProgress(progress) {
  localStorage.setItem('emoji-soko-progress', JSON.stringify(progress));
}

const TOTAL_STAGES = 100;

function isAllStagesCleared(progress) {
  if (progress.cleared.length < TOTAL_STAGES) return false;
  for (let i = 1; i <= TOTAL_STAGES; i++) {
    if (!progress.cleared.includes(i)) return false;
  }
  return true;
}

function sumBestMoves(progress) {
  let sum = 0;
  for (let i = 1; i <= TOTAL_STAGES; i++) {
    sum += progress.bestMoves[String(i)] ?? 0;
  }
  return sum;
}

function drawProgressLabel(ctx, progress, y) {
  const cleared = progress.cleared.length;
  ctx.fillStyle = '#aaa';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${cleared} / ${TOTAL_STAGES} ステージクリア`, ctx.canvas.width / 2, y);
}
