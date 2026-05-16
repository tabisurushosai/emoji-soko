function drawEndingScreen(ctx, progress) {
  const canvas = ctx.canvas;
  const totalClearMoves = progress.totalClearMoves ?? 0;
  const bestTotal = sumBestMoves(progress);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillText('THANK YOU FOR PLAYING', canvas.width / 2, 120);

  ctx.fillStyle = '#fff';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('🎉 全100ステージクリア 🎉', canvas.width / 2, 185);

  ctx.font = '20px system-ui, sans-serif';
  ctx.fillStyle = '#ccc';
  ctx.fillText(`クリア合計手数: ${totalClearMoves}`, canvas.width / 2, 260);
  ctx.fillText(`最短記録合計: ${bestTotal}`, canvas.width / 2, 300);

  ctx.fillStyle = '#888';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Presented by', canvas.width / 2, 400);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.fillText('旅する書斎', canvas.width / 2, 435);
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillStyle = '#aaa';
  ctx.fillText('tabisurushosai', canvas.width / 2, 465);

  ctx.fillStyle = '#666';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Enter / Esc でタイトルに戻る', canvas.width / 2, canvas.height - 40);
}

function registerEndingInput(getState, onBack) {
  window.addEventListener('keydown', (event) => {
    if (getState().screen !== 'ending') return;

    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onBack();
    }
  });
}
