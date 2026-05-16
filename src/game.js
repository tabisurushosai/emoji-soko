const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  stage: null,
  player: { x: 0, y: 0 },
  history: [],
  cleared: false,
  currentStage: 1,
  progress: null,
  showStageSelect: false,
};

let transitionTimer = null;

function cancelStageTransition() {
  if (transitionTimer) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
  }
}

function applyStageToState(stage) {
  state.stage = stage;
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

async function init() {
  state.progress = getProgress();
  state.currentStage = state.progress.currentStage;
  applyStageToState(await loadStage(state.currentStage));
}

async function goToNextStage() {
  const nextStage = state.currentStage + 1;
  if (!(await stageExists(nextStage))) {
    return;
  }

  state.currentStage = nextStage;
  state.progress.currentStage = nextStage;
  saveProgress(state.progress);
  applyStageToState(await loadStage(nextStage));
  render();
}

function onStageClear() {
  state.cleared = true;
  if (!state.progress.cleared.includes(state.currentStage)) {
    state.progress.cleared.push(state.currentStage);
  }
  saveProgress(state.progress);

  cancelStageTransition();
  transitionTimer = setTimeout(async () => {
    if (!state.cleared) return;
    await goToNextStage();
  }, 2000);
}

async function selectStage(num) {
  state.currentStage = num;
  state.progress.currentStage = num;
  saveProgress(state.progress);
  cancelStageTransition();
  applyStageToState(await loadStage(num));
  state.showStageSelect = false;
  render();
}

function toggleStageSelect() {
  state.showStageSelect = !state.showStageSelect;
  if (state.showStageSelect) {
    cancelStageTransition();
  }
  render();
}

async function resetStage() {
  cancelStageTransition();
  applyStageToState(await loadStage(state.currentStage));
  render();
}

function render() {
  if (state.showStageSelect) {
    drawStageSelect(ctx, state.progress);
    return;
  }

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
  registerStageSelectInput(canvas, () => state, selectStage);
  registerInput(
    (dir) => {
      if (state.showStageSelect) return;
      if (tryMove(state, dir)) {
        if (checkClear(state)) {
          onStageClear();
        }
        render();
      }
    },
    () => {
      if (state.showStageSelect) return;
      if (undo(state)) {
        render();
      }
    },
    () => {
      if (state.showStageSelect) return;
      resetStage();
    },
    () => {
      toggleStageSelect();
    }
  );
  gameLoop();
});
