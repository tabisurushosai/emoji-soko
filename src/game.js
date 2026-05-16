const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  stage: null,
  player: { x: 0, y: 0 },
  history: [],
};

function init() {
  state.stage = {
    id: 1,
    name: 'Stage 1 (dummy)',
    width: 10,
    height: 8,
    tiles: [],
  };
  state.player = { x: 1, y: 1 };
  state.history = [];
}

function render() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.stage) {
    drawGrid(ctx, state.stage.width, state.stage.height);
  }
}

function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('load', () => {
  init();
  gameLoop();
});
