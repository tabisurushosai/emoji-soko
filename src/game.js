const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  stage: null,
  player: { x: 0, y: 0 },
  history: [],
  cleared: false,
};

async function init() {
  state.stage = await loadStage(1);
  state.player = { x: 0, y: 0 };
  state.history = [];
  state.cleared = false;

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

  if (state.cleared) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STAGE CLEAR!', canvas.width / 2, canvas.height / 2);
  }
}

function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('load', async () => {
  await init();
  registerInput(
    (dir) => {
      if (tryMove(state, dir)) {
        if (checkClear(state)) {
          state.cleared = true;
        }
        render();
      }
    },
    () => {
      if (undo(state)) {
        render();
      }
    }
  );
  gameLoop();
});
