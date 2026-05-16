const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  stage: null,
  player: { x: 0, y: 0 },
  history: [],
};

async function init() {
  state.stage = await loadStage(1);
  state.player = { x: 0, y: 0 };
  state.history = [];

  for (const row of state.stage) {
    for (const cell of row) {
      if (cell.type === 'PLAYER' || cell.type === 'PLAYER_ON_GOAL') {
        state.player = { x: cell.x, y: cell.y };
      }
    }
  }
}

function render() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state.stage) {
    renderStage(ctx, state.stage);
  }
}

function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('load', async () => {
  await init();
  gameLoop();
});
