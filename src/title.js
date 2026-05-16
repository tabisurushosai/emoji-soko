const TITLE_MENU = [
  'PLAY',
  'CONTINUE',
  'STAGE SELECT',
  'SETTINGS',
  'HELP',
];

function drawTitleScreen(ctx, selectedIndex) {
  const canvas = ctx.canvas;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.fillText('EMOJI SOKO', canvas.width / 2, 120);

  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText('絵文字の蔵', canvas.width / 2, 175);

  const startY = 290;
  const lineHeight = 44;

  TITLE_MENU.forEach((label, index) => {
    const selected = index === selectedIndex;
    ctx.fillStyle = selected ? '#fff' : '#888';
    ctx.font = selected
      ? 'bold 28px system-ui, sans-serif'
      : '24px system-ui, sans-serif';
    ctx.fillText(
      `${selected ? '▶ ' : '   '}${label}`,
      canvas.width / 2,
      startY + index * lineHeight
    );
  });
}

function registerTitleInput(getState, callbacks) {
  window.addEventListener('keydown', (event) => {
    if (getState().screen !== 'title') return;

    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      event.preventDefault();
      callbacks.onUp();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      event.preventDefault();
      callbacks.onDown();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callbacks.onConfirm();
    }
  });
}
