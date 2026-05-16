function getProgress() {
  return (
    JSON.parse(localStorage.getItem('emoji-soko-progress')) || {
      cleared: [],
      currentStage: 1,
      bestMoves: {},
    }
  );
}

function saveProgress(progress) {
  localStorage.setItem('emoji-soko-progress', JSON.stringify(progress));
}

const TOTAL_STAGES = 100;

function drawProgressLabel(ctx, progress, y) {
  const cleared = progress.cleared.length;
  ctx.fillStyle = '#aaa';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${cleared} / ${TOTAL_STAGES} ステージクリア`, ctx.canvas.width / 2, y);
}
