const HELP_CONTROLS = [
  ['矢印 / WASD', '移動'],
  ['Z', 'Undo（1手戻す）'],
  ['R', 'リセット'],
  ['T', 'ステージ選択'],
  ['Esc', 'タイトルに戻る'],
];

const HELP_EMOJIS = [
  ['🟫', '壁'],
  ['📦', '箱'],
  ['⭐', 'ゴール'],
  ['🎁', 'ゴール上の箱'],
  ['🧑', 'プレイヤー'],
];

function drawHelpScreen(ctx) {
  const canvas = ctx.canvas;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillText('HELP', canvas.width / 2, 50);

  ctx.textAlign = 'left';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('操作', 80, 110);

  ctx.font = '18px system-ui, sans-serif';
  HELP_CONTROLS.forEach(([key, desc], i) => {
    const y = 145 + i * 32;
    ctx.fillStyle = '#fff';
    ctx.fillText(key, 100, y);
    ctx.fillStyle = '#aaa';
    ctx.fillText('…', 280, y);
    ctx.fillStyle = '#fff';
    ctx.fillText(desc, 310, y);
  });

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('絵文字の意味', 80, 330);

  HELP_EMOJIS.forEach(([emoji, desc], i) => {
    const y = 365 + i * 36;
    ctx.font = '28px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    ctx.fillText(emoji, 100, y);
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(desc, 160, y);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#666';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Esc でタイトルに戻る', canvas.width / 2, canvas.height - 40);
}

function registerHelpInput(getState, onBack) {
  window.addEventListener('keydown', (event) => {
    if (getState().screen !== 'help') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onBack();
    }
  });
}
